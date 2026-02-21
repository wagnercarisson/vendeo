"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Store = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  main_segment: string | null;
  brand_positioning: string | null;
  tone_of_voice: string | null;

  whatsapp: string | null;
  instagram: string | null;
  phone: string | null;

  primary_color: string | null;
  secondary_color: string | null;
};

type Plan = {
  id: string;
  store_id: string;
  week_start: string;
  status: string;
  strategy: any;
  created_at: string;
};

type PlanItem = {
  id: string;
  plan_id: string;
  day_of_week: number; // 1..7
  content_type: string; // post|reels
  theme: string;
  recommended_time: string | null;
  campaign_id: string | null;
  brief: any;
  created_at: string;
};

type ReelsShot = {
  scene: number;
  camera: string;
  action: string;
  dialogue: string;
};

type Campaign = {
  id: string;
  store_id: string;
  product_name: string | null;
  price: number | null;
  audience: string | null;
  objective: string | null;
  product_positioning: string | null;

  ai_caption?: string | null;
  ai_text?: string | null;
  ai_cta?: string | null;
  ai_hashtags?: string | null;

  reels_hook?: string | null;
  reels_script?: string | null;
  reels_shotlist?: ReelsShot[] | null;
  reels_on_screen_text?: string[] | null;
  reels_audio_suggestion?: string | null;
  reels_duration_seconds?: number | null;
  reels_caption?: string | null;
  reels_cta?: string | null;
  reels_hashtags?: string | null;
  reels_generated_at?: string | null;

  created_at: string;
};

function getWeekStartMondayISO(today = new Date()) {
  const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const jsDay = d.getUTCDay(); // 0..6
  const diffToMonday = (jsDay + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dayLabel(d: number) {
  const map: Record<number, string> = {
    1: "Segunda",
    2: "Terça",
    3: "Quarta",
    4: "Quinta",
    5: "Sexta",
    6: "Sábado",
    7: "Domingo",
  };
  return map[d] ?? `Dia ${d}`;
}

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function safeCopy(text: string) {
  navigator.clipboard.writeText(text).then(
    () => alert("Copiado!"),
    () => alert("Falha ao copiar.")
  );
}

function buildPostFullText(c: Campaign) {
  const lines: string[] = [];
  lines.push(`PRODUTO: ${c.product_name ?? ""}`);
  if (c.price != null) lines.push(`PREÇO: R$ ${c.price}`);
  lines.push("");

  if (c.ai_caption) {
    lines.push("LEGENDA:");
    lines.push(c.ai_caption);
    lines.push("");
  }
  if (c.ai_text) {
    lines.push("TEXTO:");
    lines.push(c.ai_text);
    lines.push("");
  }
  if (c.ai_cta) {
    lines.push("CTA:");
    lines.push(c.ai_cta);
    lines.push("");
  }
  if (c.ai_hashtags) {
    lines.push("HASHTAGS:");
    lines.push(c.ai_hashtags);
  }
  return lines.join("\n");
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

function buildBriefText(it: PlanItem) {
  const b = it.brief ?? {};
  const lines: string[] = [];
  lines.push(`BRIEF — ${dayLabel(it.day_of_week)} (${String(it.content_type).toUpperCase()})`);
  lines.push(`Tema: ${it.theme ?? ""}`);
  if (it.recommended_time) lines.push(`Horário sugerido: ${it.recommended_time}`);
  lines.push("");
  if (b.angle) lines.push(`Ângulo: ${b.angle}`);
  if (b.hook_hint) lines.push(`Hook: ${b.hook_hint}`);
  if (b.cta_hint) lines.push(`CTA: ${b.cta_hint}`);
  return lines.join("\n");
}

function isCampaignComplete(c?: Campaign) {
  if (!c) return false;
  const nameOk = (c.product_name ?? "").trim().length > 0;
  const audOk = (c.audience ?? "").trim().length > 0;
  const objOk = (c.objective ?? "").trim().length > 0;
  return nameOk && audOk && objOk;
}

export default function PlansPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  const [storeId, setStoreId] = useState<string>("");
  const [weekStart, setWeekStart] = useState<string>(getWeekStartMondayISO());

  const [loadingPlan, setLoadingPlan] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [generatingTextId, setGeneratingTextId] = useState<string | null>(null);
  const [generatingReelsId, setGeneratingReelsId] = useState<string | null>(null);

  // Modo automático
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoTotal, setAutoTotal] = useState(0);
  const [autoDone, setAutoDone] = useState(0);
  const [autoCurrent, setAutoCurrent] = useState<string>("");

  // Mensagens “apresentáveis”
  const [notice, setNotice] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);

  // edição local por campaign (sem precisar controlled inputs em massa)
  const [drafts, setDrafts] = useState<Record<string, Partial<Campaign>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadStores() {
    setLoadingStores(true);
    const { data, error } = await supabase
      .from("stores")
      .select(
        "id, name, city, state, main_segment, brand_positioning, tone_of_voice, whatsapp, instagram, phone, primary_color, secondary_color"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setStores([]);
    } else {
      setStores((data as any) ?? []);
      if ((data as any)?.length && !storeId) setStoreId((data as any)[0].id);
    }

    setLoadingStores(false);
  }

  const selectedStore = useMemo(
    () => stores.find((s) => s.id === storeId) ?? null,
    [stores, storeId]
  );

  const campaignsById = useMemo(() => {
    const m = new Map<string, Campaign>();
    for (const c of campaigns) m.set(c.id, c);
    return m;
  }, [campaigns]);

  async function loadPlan() {
    setLoadingPlan(true);
    try {
      const res = await fetch(
        `/api/generate/weekly-plan?week_start=${encodeURIComponent(weekStart)}`,
        { method: "GET" }
      );

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.details || data?.error || "Erro ao carregar plano");
      }

      setPlan(data.plan ?? null);
      setItems((data.items ?? []) as WeeklyPlanItem[]);
      setCampaigns((data.campaigns ?? []) as Campaign[]);
      setDrafts({}); // limpa drafts ao recarregar
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar plano");
    } finally {
      setLoadingPlan(false);
    }
  }

  useEffect(() => {
    if (storeId) loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, weekStart]);

  async function generatePlan(force = false) {
    setError(null);
    setNotice(null);
    setWarn(null);

    if (!storeId) return;

    if (force && plan) {
      const ok = confirm("Regenerar o plano desta semana? Isso vai criar novas campanhas.");
      if (!ok) return;
    }

    setGeneratingPlan(true);
    try {
      const res = await fetch("/api/generate/weekly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_start: weekStart,
          force,
      }),
    });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.details ?? data?.error ?? "Falha ao gerar plano");
      }

      setPlan(data.plan ?? null);
      setItems((data.items ?? []) as PlanItem[]);
      setCampaigns((data.campaigns ?? []) as Campaign[]);
      setDrafts({});

      setNotice(force ? "Plano regenerado!" : "Plano gerado!");
    } catch (e: any) {
      setError(e?.message ?? "Erro ao gerar plano");
    } finally {
      setGeneratingPlan(false);
    }
  }

  function getDraft(camp: Campaign): Campaign {
    const d = drafts[camp.id] ?? {};
    return {
      ...camp,
      ...d,
    };
  }

  function setDraft(campaignId: string, patch: Partial<Campaign>) {
    setDrafts((prev) => ({
      ...prev,
      [campaignId]: {
        ...(prev[campaignId] ?? {}),
        ...patch,
      },
    }));
  }

  async function saveCampaignEdits(campId: string) {
    const base = campaignsById.get(campId);
    if (!base) return;

    const merged = getDraft(base);

    setSavingId(campId);
    setError(null);
    setNotice(null);
    setWarn(null);

    try {
      const payload: any = {
        product_name: (merged.product_name ?? "").trim(),
        audience: (merged.audience ?? "").trim(),
        objective: (merged.objective ?? "").trim(),
        product_positioning: (merged.product_positioning ?? null),
      };

      // preço: aceita vazio => null
      if (merged.price === null || merged.price === undefined || Number.isNaN(merged.price as any)) {
        payload.price = null;
      } else {
        payload.price = Number(merged.price);
      }

      const { error } = await supabase.from("campaigns").update(payload).eq("id", campId);
      if (error) throw new Error(error.message);

      // Atualiza a tela
      await loadPlan();
      setNotice("Campanha atualizada!");
    } catch (e: any) {
      setError(e?.message ?? "Erro ao salvar campanha");
    } finally {
      setSavingId(null);
    }
  }

  async function generateTextForCampaign(camp: Campaign, force = false) {
    if (generatingTextId === camp.id) return;

    if (!isCampaignComplete(camp)) {
      throw new Error("Preencha Produto, Público e Objetivo antes de gerar o texto.");
    }

    setGeneratingTextId(camp.id);

    try {
      const res = await fetch("/api/generate/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ envia só campaign_id; backend busca no banco
        body: JSON.stringify({ campaign_id: camp.id, force }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.details ?? data?.error ?? "Falha ao gerar texto");

      await loadPlan();
    } finally {
      setGeneratingTextId(null);
    }
  }

  async function generateReelsForCampaign(camp: Campaign, force = false) {
    if (generatingReelsId === camp.id) return;

    if (!isCampaignComplete(camp)) {
      throw new Error("Preencha Produto, Público e Objetivo antes de gerar o Reels.");
    }

    setGeneratingReelsId(camp.id);

    try {
      const res = await fetch("/api/generate/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ mínimo
        body: JSON.stringify({ campaign_id: camp.id, force }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.details ?? data?.error ?? "Falha ao gerar Reels");

      await loadPlan();
    } finally {
      setGeneratingReelsId(null);
    }
  }

  async function runAutoMode() {
    if (!plan) {
      setWarn("Gere ou carregue um plano primeiro.");
      return;
    }
    if (autoRunning) return;

    setError(null);
    setNotice(null);
    setWarn(null);

    const sorted = items.slice().sort((a, b) => a.day_of_week - b.day_of_week);

    const tasks = sorted
      .map((it) => {
        const camp = it.campaign_id ? campaignsById.get(it.campaign_id) : null;
        return { it, camp };
      })
      .filter((x) => !!x.camp) as { it: PlanItem; camp: Campaign }[];

    if (tasks.length === 0) {
      setWarn("Plano não tem campanhas vinculadas.");
      return;
    }

    const incompletos = tasks.filter((t) => !isCampaignComplete(t.camp));
    if (incompletos.length > 0) {
      setWarn(
        `Há ${incompletos.length} item(ns) com campanha incompleta. Preencha Produto, Público e Objetivo e tente novamente.`
      );
      return;
    }

    setAutoRunning(true);
    setAutoTotal(tasks.length);
    setAutoDone(0);
    setAutoCurrent("");

    const errors: string[] = [];
    try {
      for (let i = 0; i < tasks.length; i++) {
        const it = tasks[i].it;
        const camp = tasks[i].camp;

        const isReels = String(it.content_type).toLowerCase() === "reels";
        const hasText = !!(camp.ai_caption && String(camp.ai_caption).trim().length > 0);
        const hasReels = !!camp.reels_generated_at;

        setAutoCurrent(`${i + 1}/${tasks.length} — ${dayLabel(it.day_of_week)} (${String(it.content_type).toUpperCase()})`);

        try {
          // texto: gera só se não existe
          if (!hasText) await generateTextForCampaign(camp, false);

          // reels: só se o item for reels e não existe
          if (isReels && !hasReels) await generateReelsForCampaign(camp, false);
        } catch (e: any) {
          errors.push(`${dayLabel(it.day_of_week)}: ${e?.message ?? "Erro desconhecido"}`);
        }

        setAutoDone((v) => v + 1);
      }
    } finally {
      setAutoRunning(false);
      setAutoCurrent("");
    }

    if (errors.length) {
      setWarn(`Modo automático terminou com ${errors.length} erro(s). Veja detalhes abaixo.`);
      setError(errors.join("\n"));
    } else {
      setNotice("Modo automático concluído! ✅");
    }
  }

  const cardStyle: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
    background: "white",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 10,
    fontSize: 14,
  };

  const smallInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #ddd",
    borderRadius: 10,
    fontSize: 13,
  };

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Plano da Semana</h1>
        <Link href="/campaigns" style={{ fontSize: 14 }}>
          ← Voltar para campanhas
        </Link>
      </div>

      <p style={{ color: "#555", marginTop: 8 }}>
        1) Gere a programação da semana · 2) Ajuste os produtos · 3) Gere tudo automaticamente.
      </p>

      <section style={{ ...cardStyle, maxWidth: 1120 }}>
        {notice && (
          <div style={{ marginBottom: 10, padding: 10, background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 10 }}>
            ✅ {notice}
          </div>
        )}
        {warn && (
          <div style={{ marginBottom: 10, padding: 10, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10 }}>
            ⚠️ {warn}
          </div>
        )}
        {error && (
          <div style={{ marginBottom: 10, padding: 10, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, whiteSpace: "pre-wrap" }}>
            ❌ {error}
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, display: "block", marginBottom: 6 }}>Loja</label>
              {loadingStores ? (
                <p>Carregando lojas...</p>
              ) : stores.length === 0 ? (
                <p>
                  Nenhuma loja cadastrada. <Link href="/store">Cadastre uma loja</Link>.
                </p>
              ) : (
                <select style={inputStyle} value={storeId} onChange={(e) => setStoreId(e.target.value)}>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.city ?? "—"}/{s.state ?? "—"}
                    </option>
                  ))}
                </select>
              )}

              {selectedStore && (
                <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                  <strong>Segmento:</strong> {selectedStore.main_segment ?? "—"} ·{" "}
                  <strong>Posicionamento:</strong> {selectedStore.brand_positioning ?? "—"} ·{" "}
                  <strong>Tom:</strong> {selectedStore.tone_of_voice ?? "—"} ·{" "}
                  <strong>Contato:</strong>{" "}
                  {selectedStore.whatsapp
                    ? `WhatsApp ${onlyDigits(selectedStore.whatsapp)}`
                    : selectedStore.phone
                    ? `Tel ${onlyDigits(selectedStore.phone)}`
                    : "—"}
                  {selectedStore.instagram ? ` · IG ${selectedStore.instagram}` : ""}
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, display: "block", marginBottom: 6 }}>Semana (início)</label>
              <input style={inputStyle} type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>Use a segunda-feira como início.</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => loadPlan()} disabled={!storeId || loadingPlan || generatingPlan || autoRunning}>
              {loadingPlan ? "Carregando..." : "Recarregar"}
            </button>

            <button
              onClick={() => generatePlan(false)}
              disabled={!storeId || generatingPlan || autoRunning}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #111",
                background: generatingPlan ? "#eee" : "#111",
                color: generatingPlan ? "#111" : "white",
                cursor: generatingPlan ? "not-allowed" : "pointer",
                fontWeight: 700,
              }}
            >
              {generatingPlan ? "Gerando..." : plan ? "Gerar (já existe)" : "Gerar plano da semana"}
            </button>

            {plan && (
              <button onClick={() => generatePlan(true)} disabled={!storeId || generatingPlan || autoRunning}>
                Regenerar plano
              </button>
            )}

            <button
              onClick={runAutoMode}
              disabled={!plan || autoRunning || generatingPlan}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #111",
                background: autoRunning ? "#eee" : "white",
                cursor: autoRunning ? "not-allowed" : "pointer",
                fontWeight: 800,
              }}
              title="Gera automaticamente apenas o que não existe (somente itens completos)"
            >
              {autoRunning ? `Modo automático... (${autoDone}/${autoTotal})` : "Modo automático (Gerar tudo)"}
            </button>
          </div>

          {autoRunning && (
            <div style={{ marginTop: 2, fontSize: 13, color: "#444" }}>
              <strong>Executando:</strong> {autoCurrent} · <strong>Progresso:</strong> {autoDone}/{autoTotal}
            </div>
          )}
        </div>
      </section>

      <div style={{ height: 16 }} />

      {!plan ? (
        <p style={{ color: "#555" }}>Nenhum plano encontrado para esta semana.</p>
      ) : (
        <div style={{ display: "grid", gap: 16, maxWidth: 1120 }}>
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Estratégia</h2>
            <div style={{ whiteSpace: "pre-wrap", color: "#333" }}>
              {plan.strategy?.strategy_summary ?? "—"}
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Itens da semana (edite os produtos antes de gerar)</h2>

            {items.length === 0 ? (
              <p>Sem itens ainda.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {items
                  .slice()
                  .sort((a, b) => a.day_of_week - b.day_of_week)
                  .map((it) => {
                    const camp = it.campaign_id ? campaignsById.get(it.campaign_id) : undefined;
                    if (!camp) return null;

                    const merged = getDraft(camp);

                    const hasText = !!(camp.ai_caption && String(camp.ai_caption).trim().length > 0);
                    const hasReels = !!camp.reels_generated_at;

                    const isPost = String(it.content_type).toLowerCase() === "post";
                    const isReels = String(it.content_type).toLowerCase() === "reels";

                    const complete = isCampaignComplete(merged);

                    return (
                      <div
                        key={it.id}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: 12,
                          padding: 12,
                          background: "white",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <div>
                            <strong>
                              {dayLabel(it.day_of_week)} — {String(it.content_type).toUpperCase()}
                            </strong>
                            {it.recommended_time ? <span style={{ color: "#666" }}> · {it.recommended_time}</span> : null}
                            <div style={{ marginTop: 6 }}>
                              <strong>Tema:</strong> {it.theme}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button
                              onClick={() => saveCampaignEdits(camp.id)}
                              disabled={savingId === camp.id || autoRunning}
                            >
                              {savingId === camp.id ? "Salvando..." : "Salvar"}
                            </button>

                            <button
                              onClick={async () => {
                                try {
                                  setError(null);
                                  setWarn(null);
                                  await generateTextForCampaign(camp, false);
                                  setNotice("Texto gerado!");
                                } catch (e: any) {
                                  setWarn(e?.message ?? "Erro ao gerar texto");
                                }
                              }}
                              disabled={!complete || autoRunning || generatingTextId === camp.id}
                              title={!complete ? "Preencha Produto, Público e Objetivo" : "Gerar texto"}
                            >
                              {generatingTextId === camp.id ? "Gerando texto..." : hasText ? "Gerar texto (já existe)" : "Gerar texto"}
                            </button>

                            {hasText && (
                              <button
                                onClick={async () => {
                                  try {
                                    setError(null);
                                    setWarn(null);
                                    await generateTextForCampaign(camp, true);
                                    setNotice("Texto regenerado!");
                                  } catch (e: any) {
                                    setWarn(e?.message ?? "Erro ao regenerar texto");
                                  }
                                }}
                                disabled={!complete || autoRunning || generatingTextId === camp.id}
                              >
                                Regenerar texto
                              </button>
                            )}

                            <button
                              onClick={async () => {
                                try {
                                  setError(null);
                                  setWarn(null);
                                  await generateReelsForCampaign(camp, false);
                                  setNotice("Reels gerado!");
                                } catch (e: any) {
                                  setWarn(e?.message ?? "Erro ao gerar Reels");
                                }
                              }}
                              disabled={!complete || autoRunning || generatingReelsId === camp.id}
                              title={!complete ? "Preencha Produto, Público e Objetivo" : "Gerar Reels"}
                            >
                              {generatingReelsId === camp.id ? "Gerando Reels..." : hasReels ? "Gerar Reels (já existe)" : "Gerar Reels"}
                            </button>

                            {hasReels && (
                              <button
                                onClick={async () => {
                                  try {
                                    setError(null);
                                    setWarn(null);
                                    await generateReelsForCampaign(camp, true);
                                    setNotice("Reels regenerado!");
                                  } catch (e: any) {
                                    setWarn(e?.message ?? "Erro ao regenerar Reels");
                                  }
                                }}
                                disabled={!complete || autoRunning || generatingReelsId === camp.id}
                              >
                                Regenerar Reels
                              </button>
                            )}

                            {isPost && (
                              <button
                                onClick={() => safeCopy(buildPostFullText(camp))}
                                disabled={!hasText}
                                title={!hasText ? "Gere o texto primeiro" : "Copiar tudo do post"}
                              >
                                Copiar tudo (Post)
                              </button>
                            )}

                            {isReels && (
                              <button
                                onClick={() => safeCopy(buildReelsFullText(camp))}
                                disabled={!hasReels}
                                title={!hasReels ? "Gere o Reels primeiro" : "Copiar tudo do Reels"}
                              >
                                Copiar tudo (Reels)
                              </button>
                            )}

                            <button onClick={() => safeCopy(buildBriefText(it))}>Copiar brief</button>
                          </div>
                        </div>

                        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                          {/* Form de edição */}
                          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
                            <div>
                              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Produto</div>
                              <input
                                style={smallInputStyle}
                                value={merged.product_name ?? ""}
                                onChange={(e) => setDraft(camp.id, { product_name: e.target.value })}
                                placeholder="Ex: Cerveja Antarctica 600ml"
                              />
                            </div>

                            <div>
                              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Preço (opcional)</div>
                              <input
                                style={smallInputStyle}
                                value={merged.price ?? ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  const n = v === "" ? null : Number(v);
                                  setDraft(camp.id, { price: Number.isNaN(n as any) ? null : (n as any) });
                                }}
                                placeholder="Ex: 8.99"
                              />
                            </div>

                            <div>
                              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Perfil do produto</div>
                              <select
                                style={smallInputStyle}
                                value={merged.product_positioning ?? ""}
                                onChange={(e) => setDraft(camp.id, { product_positioning: e.target.value || null })}
                              >
                                <option value="">—</option>
                                <option value="popular">popular</option>
                                <option value="premium">premium</option>
                                <option value="jovem">jovem</option>
                                <option value="familia">família</option>
                                <option value="presentes">presentes</option>
                              </select>
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div>
                              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Público</div>
                              <input
                                style={smallInputStyle}
                                value={merged.audience ?? ""}
                                onChange={(e) => setDraft(camp.id, { audience: e.target.value })}
                                placeholder="Ex: Jovens / Festa / Amigos"
                              />
                            </div>

                            <div>
                              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Objetivo</div>
                              <input
                                style={smallInputStyle}
                                value={merged.objective ?? ""}
                                onChange={(e) => setDraft(camp.id, { objective: e.target.value })}
                                placeholder="Ex: Promoção / Aumentar vendas / Girar estoque"
                              />
                            </div>
                          </div>

                          <div style={{ fontSize: 12, color: complete ? "#065f46" : "#92400e" }}>
                            {complete
                              ? "✅ Campanha completa — pronto para gerar."
                              : "⚠️ Preencha Produto, Público e Objetivo e clique em Salvar."}
                          </div>

                          <div style={{ fontSize: 12, color: "#666" }}>
                            Status: <span>{hasText ? "Texto ✅" : "Texto —"}</span> ·{" "}
                            <span>{hasReels ? "Reels ✅" : "Reels —"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
