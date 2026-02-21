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
};

type Plan = {
  id: string;
  store_id: string;
  week_start: string; // YYYY-MM-DD
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

type Campaign = {
  id: string;
  store_id: string;
  product_name: string;
  price: number | null;
  audience: string;
  objective: string;
  product_positioning: string | null;
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

export default function PlansPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  const [storeId, setStoreId] = useState<string>("");
  const [weekStart, setWeekStart] = useState<string>(getWeekStartMondayISO());

  const [loadingPlan, setLoadingPlan] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadStores() {
    setLoadingStores(true);
    const { data, error } = await supabase
      .from("stores")
      .select("id, name, city, state, main_segment, brand_positioning, tone_of_voice")
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

  async function loadPlan() {
    setError(null);
    if (!storeId) return;

    setLoadingPlan(true);
    try {
      const res = await fetch(
        `/api/generate/weekly-plan?store_id=${storeId}&week_start=${weekStart}`,
        { method: "GET" }
      );
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.details ?? data?.error ?? "Falha ao carregar plano");
      }

      if (!data.exists) {
        setPlan(null);
        setItems([]);
        setCampaigns([]);
      } else {
        setPlan(data.plan ?? null);
        setItems((data.items ?? []) as PlanItem[]);
        setCampaigns((data.campaigns ?? []) as Campaign[]);
      }
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
    if (!storeId) return;

    if (force && plan) {
      const ok = confirm("Regenerar o plano desta semana? Isso vai criar novas campanhas.");
      if (!ok) return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/generate/weekly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
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
      alert(force ? "Plano regenerado!" : "Plano gerado!");
    } catch (e: any) {
      setError(e?.message ?? "Erro ao gerar plano");
    } finally {
      setGenerating(false);
    }
  }

  const campaignsById = useMemo(() => {
    const m = new Map<string, Campaign>();
    for (const c of campaigns) m.set(c.id, c);
    return m;
  }, [campaigns]);

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

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Plano da Semana</h1>
        <Link href="/campaigns" style={{ fontSize: 14 }}>
          ← Voltar para campanhas
        </Link>
      </div>

      <p style={{ color: "#555", marginTop: 8 }}>
        Gere 4 campanhas sugeridas para a semana (estratégia por segmento). Depois você pode gerar texto e Reels em cada campanha.
      </p>

      <section style={{ ...cardStyle, maxWidth: 900 }}>
        {error && (
          <div style={{ marginBottom: 12, color: "crimson" }}>
            <strong>Erro:</strong> {error}
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
                  <strong>Tom:</strong> {selectedStore.tone_of_voice ?? "—"}
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, display: "block", marginBottom: 6 }}>Semana (início)</label>
              <input
                style={inputStyle}
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
              />
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Use a segunda-feira como início.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => loadPlan()}
              disabled={!storeId || loadingPlan || generating}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: "white",
                cursor: "pointer",
              }}
            >
              {loadingPlan ? "Carregando..." : "Recarregar"}
            </button>

            <button
              onClick={() => generatePlan(false)}
              disabled={!storeId || generating}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #111",
                background: generating ? "#eee" : "#111",
                color: generating ? "#111" : "white",
                cursor: generating ? "not-allowed" : "pointer",
                fontWeight: 700,
              }}
            >
              {generating ? "Gerando..." : plan ? "Gerar (já existe)" : "Gerar plano da semana"}
            </button>

            {plan && (
              <button
                onClick={() => generatePlan(true)}
                disabled={!storeId || generating}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid #111",
                  background: "white",
                  cursor: generating ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                Regenerar plano
              </button>
            )}
          </div>
        </div>
      </section>

      <div style={{ height: 16 }} />

      {!plan ? (
        <p style={{ color: "#555" }}>Nenhum plano encontrado para esta semana.</p>
      ) : (
        <div style={{ display: "grid", gap: 16, maxWidth: 900 }}>
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Estratégia</h2>
            <div style={{ whiteSpace: "pre-wrap", color: "#333" }}>
              {plan.strategy?.strategy_summary ?? "—"}
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Conteúdos sugeridos (4)</h2>

            {items.length === 0 ? (
              <p>Sem itens ainda.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {items
                  .slice()
                  .sort((a, b) => a.day_of_week - b.day_of_week)
                  .map((it) => {
                    const camp = it.campaign_id ? campaignsById.get(it.campaign_id) : undefined;

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
                              {dayLabel(it.day_of_week)} — {it.content_type.toUpperCase()}
                            </strong>
                            {it.recommended_time ? (
                              <span style={{ color: "#666" }}> · {it.recommended_time}</span>
                            ) : null}
                            <div style={{ marginTop: 6 }}>
                              <strong>Tema:</strong> {it.theme}
                            </div>
                          </div>

                          {camp?.id ? (
                            <Link href="/campaigns" style={{ fontSize: 13 }}>
                              Ver na lista →
                            </Link>
                          ) : null}
                        </div>

                        <div style={{ marginTop: 8 }}>
                          <div>
                            <strong>Campanha:</strong> {camp?.product_name ?? "—"}
                            {camp?.price != null ? ` (R$ ${camp.price})` : ""}
                          </div>
                          <div style={{ fontSize: 13, color: "#444" }}>
                            <strong>Público:</strong> {camp?.audience ?? "—"} ·{" "}
                            <strong>Objetivo:</strong> {camp?.objective ?? "—"}
                          </div>
                          {it.brief && (
                            <div style={{ fontSize: 13, color: "#444", marginTop: 6 }}>
                              <div>
                                <strong>Ângulo:</strong> {it.brief.angle ?? "—"}
                              </div>
                              <div>
                                <strong>Hook:</strong> {it.brief.hook_hint ?? "—"}
                              </div>
                              <div>
                                <strong>CTA:</strong> {it.brief.cta_hint ?? "—"}
                              </div>
                            </div>
                          )}
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
