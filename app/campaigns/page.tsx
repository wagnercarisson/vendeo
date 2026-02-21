"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Store = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;

  brand_positioning: string | null;
  main_segment: string | null;
  tone_of_voice: string | null;

  address: string | null;
  neighborhood: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;

  primary_color: string | null;
  secondary_color: string | null;
};

type ReelsShot = {
  scene: number;
  camera: string;
  action: string;
  dialogue: string;
};

type Campaign = {
  id: string;
  product_name: string;
  price: number;
  audience: string;
  objective: string;
  image_url: string | null;

  product_positioning: string | null;

  ai_caption: string | null;
  ai_text: string | null;
  ai_cta: string | null;
  ai_hashtags: string | null;

  reels_hook: string | null;
  reels_script: string | null;
  reels_shotlist: ReelsShot[] | null;
  reels_on_screen_text: string[] | null;
  reels_audio_suggestion: string | null;
  reels_duration_seconds: number | null;
  reels_caption: string | null;
  reels_cta: string | null;
  reels_hashtags: string | null;
  reels_generated_at: string | null;

  stores?: Store | null;
};

function labelPositioning(v: string | null | undefined) {
  if (!v) return "Padrão da loja";
  const map: Record<string, string> = {
    popular: "Popular",
    medio: "Médio",
    premium: "Premium",
    jovem: "Jovem / Festa",
    familia: "Família",
  };
  return map[v] ?? v;
}

function safeToString(v: any) {
  if (v === null || v === undefined) return "";
  return String(v);
}

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function buildContactLine(store?: Store | null) {
  const wpp = store?.whatsapp ? onlyDigits(store.whatsapp) : "";
  const ig = store?.instagram ? store.instagram : "";
  if (wpp && ig) return `WhatsApp: ${wpp} · IG: ${ig}`;
  if (wpp) return `WhatsApp: ${wpp}`;
  if (ig) return `IG: ${ig}`;
  return "—";
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const [generatingTextId, setGeneratingTextId] = useState<string | null>(null);
  const [generatingReelsId, setGeneratingReelsId] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCampaigns() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("campaigns")
      .select(
        `
        id, product_name, price, audience, objective, image_url,
        product_positioning,
        ai_caption, ai_text, ai_cta, ai_hashtags,

        reels_hook, reels_script, reels_shotlist, reels_on_screen_text,
        reels_audio_suggestion, reels_duration_seconds,
        reels_caption, reels_cta, reels_hashtags, reels_generated_at,

        stores (
          id, name, city, state,
          brand_positioning, main_segment, tone_of_voice,
          address, neighborhood, phone, whatsapp, instagram,
          primary_color, secondary_color
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      setError(error);
      setCampaigns([]);
    } else {
      setCampaigns((data as any) ?? []);
    }

    setLoading(false);
  }

  async function generateAndSaveText(campaign: Campaign, force = false) {
    if (generatingTextId === campaign.id) return;

    if (!force && (campaign.ai_caption ?? "").trim().length > 0) {
      const ok = confirm("Já existe texto gerado. Gerar novamente?");
      if (!ok) return;
    }

    setGeneratingTextId(campaign.id);

    try {
      const res = await fetch("/api/generate/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaign.id,
          force,

          product_name: campaign.product_name,
          price: campaign.price,
          audience: campaign.audience,
          objective: campaign.objective,

          product_positioning: campaign.product_positioning,

          store_name: campaign.stores?.name,
          city: campaign.stores?.city,
          state: campaign.stores?.state,
          brand_positioning: campaign.stores?.brand_positioning,
          main_segment: campaign.stores?.main_segment,
          tone_of_voice: campaign.stores?.tone_of_voice,

          whatsapp: campaign.stores?.whatsapp,
          phone: campaign.stores?.phone,
          instagram: campaign.stores?.instagram,

          primary_color: campaign.stores?.primary_color,
          secondary_color: campaign.stores?.secondary_color,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.details ?? err?.error ?? `Erro na API: ${res.status}`);
      }

      await res.json();
      await loadCampaigns();

      alert(force ? "Texto regenerado e salvo!" : "Texto gerado e salvo!");
    } catch (e: any) {
      alert(e?.message ?? "Erro ao gerar/salvar texto");
      console.error(e);
    } finally {
      setGeneratingTextId(null);
    }
  }

  async function generateAndSaveReels(campaign: Campaign, force = false) {
    if (generatingReelsId === campaign.id) return;

    const hasReels = !!campaign.reels_generated_at;
    if (!force && hasReels) {
      const ok = confirm("Já existe roteiro de Reels. Gerar novamente?");
      if (!ok) return;
    }

    setGeneratingReelsId(campaign.id);

    try {
      const res = await fetch("/api/generate/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaign.id,
          force,

          product_positioning: campaign.product_positioning,

          store_name: campaign.stores?.name,
          city: campaign.stores?.city,
          state: campaign.stores?.state,
          brand_positioning: campaign.stores?.brand_positioning,
          main_segment: campaign.stores?.main_segment,
          tone_of_voice: campaign.stores?.tone_of_voice,
          whatsapp: campaign.stores?.whatsapp,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.details ?? err?.error ?? `Erro na API: ${res.status}`);
      }

      await res.json();
      await loadCampaigns();

      alert(force ? "Roteiro regenerado e salvo!" : "Roteiro gerado e salvo!");
    } catch (e: any) {
      alert(e?.message ?? "Erro ao gerar/salvar Reels");
      console.error(e);
    } finally {
      setGeneratingReelsId(null);
    }
  }

  function safeCopy(text: string) {
    navigator.clipboard.writeText(text).then(
      () => alert("Copiado!"),
      () => alert("Falha ao copiar.")
    );
  }

  function buildReelsFullText(c: Campaign) {
    const lines: string[] = [];

    lines.push(`HOOK: ${c.reels_hook ?? ""}`);
    lines.push(`DURAÇÃO: ${c.reels_duration_seconds ? c.reels_duration_seconds + "s" : ""}`);
    lines.push(`ÁUDIO: ${c.reels_audio_suggestion ?? ""}`);
    lines.push("");

    if (Array.isArray(c.reels_on_screen_text) && c.reels_on_screen_text.length) {
      lines.push("TEXTO NA TELA:");
      for (const t of c.reels_on_screen_text) lines.push(`- ${t}`);
      lines.push("");
    }

    if (Array.isArray(c.reels_shotlist) && c.reels_shotlist.length) {
      lines.push("SHOTLIST:");
      for (const s of c.reels_shotlist) {
        lines.push(`Cena ${s.scene}: ${s.camera}`);
        lines.push(`Ação: ${s.action}`);
        lines.push(`Fala: ${s.dialogue}`);
        lines.push("");
      }
    }

    if (c.reels_script) {
      lines.push("ROTEIRO:");
      lines.push(c.reels_script);
      lines.push("");
    }

    if (c.reels_caption) {
      lines.push("LEGENDA:");
      lines.push(c.reels_caption);
      lines.push("");
    }

    if (c.reels_cta) {
      lines.push("CTA:");
      lines.push(c.reels_cta);
      lines.push("");
    }

    if (c.reels_hashtags) {
      lines.push("HASHTAGS:");
      lines.push(c.reels_hashtags);
    }

    return lines.join("\n");
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1>Campanhas</h1>

      <p style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/campaigns/new">+ Nova campanha</Link>
        <Link href="/store">Cadastro de loja</Link>
      </p>

      {error && <p style={{ color: "crimson" }}>Erro: {error.message}</p>}
      {loading && <p>Carregando...</p>}

      {!loading && campaigns.length === 0 && <p>Nenhuma campanha ainda.</p>}

      <div style={{ display: "grid", gap: 16 }}>
        {campaigns.map((c) => {
          const hasAi = (c.ai_caption ?? "").trim().length > 0;
          const hasReels = !!c.reels_generated_at;

          const positioningLabel = labelPositioning(c.product_positioning);
          const storeDefault = labelPositioning(c.stores?.brand_positioning ?? null);
          const contactLine = buildContactLine(c.stores);

          return (
            <div
              key={c.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
                background: "white",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div>
                    <strong>Produto:</strong> {c.product_name}
                  </div>
                  <div>
                    <strong>Preço:</strong> R$ {c.price}
                  </div>
                  <div>
                    <strong>Público:</strong> {c.audience}
                  </div>
                  <div>
                    <strong>Objetivo:</strong> {c.objective}
                  </div>
                  <div>
                    <strong>Loja:</strong> {c.stores?.name ?? "—"}
                  </div>

                  <div style={{ marginTop: 6, fontSize: 13, color: "#444" }}>
                    <strong>Perfil do produto:</strong> {positioningLabel}{" "}
                    {c.product_positioning ? "" : `(padrão loja: ${storeDefault})`}
                  </div>

                  <div style={{ fontSize: 13, color: "#444" }}>
                    <strong>Contato:</strong> {contactLine}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {c.stores?.primary_color && (
                    <span
                      title="Cor primária da loja"
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 5,
                        background: c.stores.primary_color,
                        border: "1px solid rgba(0,0,0,0.08)",
                        display: "inline-block",
                      }}
                    />
                  )}
                  {c.stores?.secondary_color && (
                    <span
                      title="Cor secundária da loja"
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 5,
                        background: c.stores.secondary_color,
                        border: "1px solid rgba(0,0,0,0.08)",
                        display: "inline-block",
                      }}
                    />
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <button onClick={() => generateAndSaveText(c, false)} disabled={generatingTextId === c.id}>
                  {generatingTextId === c.id ? "Gerando texto..." : "Gerar texto com IA"}
                </button>

                {hasAi && (
                  <button onClick={() => generateAndSaveText(c, true)} disabled={generatingTextId === c.id}>
                    Regenerar texto
                  </button>
                )}

                <button onClick={() => generateAndSaveReels(c, false)} disabled={generatingReelsId === c.id}>
                  {generatingReelsId === c.id
                    ? "Gerando Reels..."
                    : hasReels
                    ? "Gerar Reels (já existe)"
                    : "Gerar roteiro de Reels"}
                </button>

                {hasReels && (
                  <button onClick={() => generateAndSaveReels(c, true)} disabled={generatingReelsId === c.id}>
                    Regenerar Reels
                  </button>
                )}
              </div>

              {hasAi && (
                <div style={{ marginTop: 14 }}>
                  <div>
                    <strong>Legenda:</strong> {safeToString(c.ai_caption)}
                  </div>
                  <div>
                    <strong>Texto:</strong> {safeToString(c.ai_text)}
                  </div>
                  <div>
                    <strong>CTA:</strong> {safeToString(c.ai_cta)}
                  </div>
                  <div>
                    <strong>Hashtags:</strong> {safeToString(c.ai_hashtags)}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {c.ai_text && <button onClick={() => safeCopy(c.ai_text ?? "")}>Copiar texto</button>}
                    {c.ai_caption && <button onClick={() => safeCopy(c.ai_caption ?? "")}>Copiar legenda</button>}
                  </div>
                </div>
              )}

              {hasReels && (
                <div style={{ marginTop: 14, borderTop: "1px solid #eee", paddingTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <strong>Reels Hook:</strong> {safeToString(c.reels_hook)}
                    </div>
                    <div>
                      <strong>Duração:</strong> {c.reels_duration_seconds ? `${c.reels_duration_seconds}s` : "—"}
                    </div>
                    <div>
                      <strong>Áudio:</strong> {safeToString(c.reels_audio_suggestion)}
                    </div>
                  </div>

                  {Array.isArray(c.reels_on_screen_text) && c.reels_on_screen_text.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <strong>Texto na tela:</strong>
                      <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {c.reels_on_screen_text.map((t, idx) => (
                          <span
                            key={idx}
                            style={{
                              border: "1px solid #ddd",
                              padding: "4px 8px",
                              borderRadius: 999,
                              fontSize: 12,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {c.reels_script && (
                    <div style={{ marginTop: 10 }}>
                      <strong>Roteiro:</strong>
                      <div
                        style={{
                          marginTop: 6,
                          whiteSpace: "pre-wrap",
                          background: "#fafafa",
                          border: "1px solid #eee",
                          borderRadius: 8,
                          padding: 10,
                        }}
                      >
                        {c.reels_script}
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        <button onClick={() => safeCopy(c.reels_script ?? "")}>Copiar roteiro</button>
                        {c.reels_caption && (
                          <button onClick={() => safeCopy(c.reels_caption ?? "")}>Copiar legenda do Reels</button>
                        )}
                        <button onClick={() => safeCopy(buildReelsFullText(c))}>Copiar tudo (Reels)</button>
                      </div>
                    </div>
                  )}

                  {Array.isArray(c.reels_shotlist) && c.reels_shotlist.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <strong>Shotlist:</strong>
                      <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                        {c.reels_shotlist.map((s, idx) => (
                          <div
                            key={idx}
                            style={{
                              border: "1px solid #eee",
                              borderRadius: 8,
                              padding: 10,
                              background: "white",
                            }}
                          >
                            <div>
                              <strong>Cena {s.scene}:</strong> {safeToString(s.camera)}
                            </div>
                            <div>
                              <strong>Ação:</strong> {safeToString(s.action)}
                            </div>
                            <div>
                              <strong>Fala:</strong> {safeToString(s.dialogue)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(c.reels_cta || c.reels_hashtags) && (
                    <div style={{ marginTop: 12 }}>
                      {c.reels_cta && (
                        <div>
                          <strong>CTA Reels:</strong> {safeToString(c.reels_cta)}
                        </div>
                      )}
                      {c.reels_hashtags && (
                        <div>
                          <strong>Hashtags Reels:</strong> {safeToString(c.reels_hashtags)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
