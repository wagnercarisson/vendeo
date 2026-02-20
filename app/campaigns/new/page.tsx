"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Store = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;

  // novos campos que ajudam como fallback/contexto
  brand_positioning: string | null;
  main_segment: string | null;
  tone_of_voice: string | null;
};

const PRODUCT_POSITIONING_OPTIONS = [
  { value: "", label: "Padrão da loja (recomendado)" },
  { value: "popular", label: "Popular" },
  { value: "medio", label: "Médio" },
  { value: "premium", label: "Premium" },
  { value: "jovem", label: "Jovem / Festa" },
  { value: "familia", label: "Família" },
] as const;

export default function NewCampaignPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [storeId, setStoreId] = useState<string>("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState<string>(""); // string para input; salva number
  const [audience, setAudience] = useState("");
  const [objective, setObjective] = useState("");

  // novo: perfil do produto/campanha
  const [productPositioning, setProductPositioning] = useState<string>("");

  // (opcional) imagem URL se você já usa
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadStores() {
    setLoadingStores(true);
    const { data, error } = await supabase
      .from("stores")
      .select("id, name, city, state, brand_positioning, main_segment, tone_of_voice")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setStores([]);
    } else {
      setStores((data as any) ?? []);
      // auto-select primeira loja para acelerar (se existir)
      if ((data as any)?.length && !storeId) setStoreId((data as any)[0].id);
    }
    setLoadingStores(false);
  }

  const selectedStore = useMemo(
    () => stores.find((s) => s.id === storeId) ?? null,
    [stores, storeId]
  );

  function resetMessages() {
    setError(null);
    setOkMsg(null);
  }

  function validate() {
    if (!storeId) return "Selecione uma loja.";
    if (!productName.trim()) return "Informe o nome do produto.";
    if (!price.trim()) return "Informe o preço.";
    const p = Number(price.replace(",", "."));
    if (Number.isNaN(p) || p <= 0) return "Preço inválido. Ex: 8.99";
    if (!audience.trim()) return "Informe o público.";
    if (!objective.trim()) return "Informe o objetivo.";
    return null;
  }

  async function createCampaign() {
    resetMessages();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSaving(true);
    try {
      const p = Number(price.replace(",", "."));

      const payload: any = {
        store_id: storeId,
        product_name: productName.trim(),
        price: p,
        audience: audience.trim(),
        objective: objective.trim(),
        image_url: imageUrl.trim() || null,

        // novo campo no banco
        product_positioning: productPositioning || null,
      };

      const { error } = await supabase.from("campaigns").insert(payload);

      if (error) {
        console.error(error);
        throw new Error(error.message);
      }

      setOkMsg("Campanha criada com sucesso!");
      setProductName("");
      setPrice("");
      setAudience("");
      setObjective("");
      setImageUrl("");
      setProductPositioning("");

    } catch (e: any) {
      setError(e?.message ?? "Erro ao criar campanha");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 10,
    fontSize: 14,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    color: "#111",
    marginBottom: 6,
    display: "block",
  };

  const cardStyle: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
    background: "white",
    maxWidth: 860,
  };

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Nova campanha</h1>
        <Link href="/campaigns" style={{ fontSize: 14 }}>
          ← Voltar para campanhas
        </Link>
      </div>

      <p style={{ color: "#555", marginTop: 8 }}>
        Crie uma campanha para um produto. Você pode definir o posicionamento do produto (opcional).
      </p>

      <section style={cardStyle}>
        {error && (
          <div style={{ marginBottom: 12, color: "crimson" }}>
            <strong>Erro:</strong> {error}
          </div>
        )}
        {okMsg && (
          <div style={{ marginBottom: 12, color: "green" }}>
            <strong>OK:</strong> {okMsg}
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={labelStyle}>Loja *</label>
            {loadingStores ? (
              <p>Carregando lojas...</p>
            ) : stores.length === 0 ? (
              <p>
                Nenhuma loja cadastrada. <Link href="/store">Cadastre uma loja</Link>.
              </p>
            ) : (
              <>
                <select
                  style={inputStyle}
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.city ?? "—"}/{s.state ?? "—"}
                    </option>
                  ))}
                </select>

                {selectedStore && (
                  <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                    <strong>Padrão da loja:</strong>{" "}
                    {selectedStore.brand_positioning ?? "—"} ·{" "}
                    {selectedStore.main_segment ?? "—"} ·{" "}
                    {selectedStore.tone_of_voice ?? "—"}
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label style={labelStyle}>Produto *</label>
            <input
              style={inputStyle}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex: Cerveja Antarctica Original 600 ml"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Preço *</label>
              <input
                style={inputStyle}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 8.99"
                inputMode="decimal"
              />
            </div>

            <div>
              <label style={labelStyle}>Posicionamento do produto (opcional)</label>
              <select
                style={inputStyle}
                value={productPositioning}
                onChange={(e) => setProductPositioning(e.target.value)}
              >
                {PRODUCT_POSITIONING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Se deixar em “Padrão da loja”, o sistema usa o posicionamento da loja automaticamente.
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Público *</label>
            <input
              style={inputStyle}
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Ex: Jovem / Festa"
            />
          </div>

          <div>
            <label style={labelStyle}>Objetivo *</label>
            <input
              style={inputStyle}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Ex: Promoção"
            />
          </div>

          <div>
            <label style={labelStyle}>Imagem URL (opcional)</label>
            <input
              style={inputStyle}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
            <button
              onClick={createCampaign}
              disabled={saving || stores.length === 0}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #111",
                background: saving ? "#eee" : "#111",
                color: saving ? "#111" : "white",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {saving ? "Salvando..." : "Criar campanha"}
            </button>

            <button
              onClick={() => {
                resetMessages();
                loadStores();
              }}
              disabled={saving}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: "white",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              Atualizar lojas
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
