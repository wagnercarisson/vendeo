"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Store = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
};

type Campaign = {
  id: string;
  product_name: string;
  price: number;
  audience: string;
  objective: string;
  image_url: string | null;

  ai_caption: string | null;
  ai_text: string | null;
  ai_cta: string | null;
  ai_hashtags: string | null;

  stores?: Store | null;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // ✅ impede múltiplos cliques/requests ao mesmo tempo
  const [generatingId, setGeneratingId] = useState<string | null>(null);

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
        ai_caption, ai_text, ai_cta, ai_hashtags,
        stores ( id, name, city, state )
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

  async function generateAndSave(campaign: Campaign, force = false) {
  if (generatingId === campaign.id) return;

  // Só pergunta se já existe texto E se não for "force"
  if (!force && campaign.ai_caption) {
    const ok = confirm("Já existe texto gerado. Gerar novamente?");
    if (!ok) return;
  }

  setGeneratingId(campaign.id);

  try {
    const res = await fetch("/api/generate/campaign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaign_id: campaign.id,
        force, // ✅ novo
        product_name: campaign.product_name,
        price: campaign.price,
        audience: campaign.audience,
        objective: campaign.objective,
        store_name: campaign.stores?.name,
        city: campaign.stores?.city,
        state: campaign.stores?.state,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error ?? `Erro na API: ${res.status}`);
    }

    await res.json(); // não precisamos usar o retorno, pois já salvamos no banco
    await loadCampaigns();
    alert(force ? "Texto regenerado e salvo!" : "Texto gerado e salvo!");
  } catch (e: any) {
    alert(e?.message ?? "Erro ao gerar/salvar");
    console.error(e);
  } finally {
    setGeneratingId(null);
  }
}

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1>Campanhas</h1>

      <p>
        <Link href="/campaigns/new">+ Nova campanha</Link>
      </p>

      {error && <p style={{ color: "crimson" }}>Erro: {error.message}</p>}
      {loading && <p>Carregando...</p>}

      {!loading && campaigns.length === 0 && <p>Nenhuma campanha ainda.</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {campaigns.map((c) => (
          <div
            key={c.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
            }}
          >
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

            <button
  onClick={() => generateAndSave(c)}
  disabled={generatingId === c.id}
  style={{ marginTop: 10 }}
>
  {generatingId === c.id ? "Gerando..." : "Gerar texto com IA"}
</button>

{c.ai_caption && (
  <button
    onClick={() => generateAndSave(c, true)}
    disabled={generatingId === c.id}
    style={{ marginLeft: 8, marginTop: 10 }}
  >
    Regenerar
  </button>
)}

            {c.ai_caption && (
              <div style={{ marginTop: 12 }}>
                <div>
                  <strong>Legenda:</strong> {c.ai_caption}
                </div>
                <div>
                  <strong>Texto:</strong> {c.ai_text}
                </div>
                <div>
                  <strong>CTA:</strong> {c.ai_cta}
                </div>
                <div>
                  <strong>Hashtags:</strong> {c.ai_hashtags}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
