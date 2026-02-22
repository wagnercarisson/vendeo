"use client";
//redeploy

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Store = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  logo_url: string | null;

  // novos campos
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

  created_at: string;
};

const POSITIONING_OPTIONS = [
  { value: "popular", label: "Popular" },
  { value: "medio", label: "Médio" },
  { value: "premium", label: "Premium" },
] as const;

const TONE_OPTIONS = [
  { value: "descontraido", label: "Descontraído" },
  { value: "jovem", label: "Jovem" },
  { value: "sofisticado", label: "Sofisticado" },
  { value: "tecnico", label: "Técnico" },
] as const;

// Você pode expandir isso depois (ou transformar em input livre).
const SEGMENT_OPTIONS = [
  { value: "bebidas", label: "Bebidas" },
  { value: "mercado", label: "Mercado" },
  { value: "farmacia", label: "Farmácia" },
  { value: "moda", label: "Moda / Boutique" },
  { value: "bazar", label: "Bazar" },
  { value: "restaurante", label: "Restaurante" },
  { value: "beleza", label: "Beleza / Estética" },
  { value: "outro", label: "Outro" },
] as const;

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function formatWhatsappHint(v: string) {
  const d = onlyDigits(v);
  if (!d) return "";
  // somente dica visual; armazenamos limpo (digits)
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 11)
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

export default function StorePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");

  const [logoUrl, setLogoUrl] = useState("");

  const [mainSegment, setMainSegment] = useState<string>("bebidas");
  const [brandPositioning, setBrandPositioning] = useState<string>("popular");
  const [toneOfVoice, setToneOfVoice] = useState<string>("descontraido");

  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");

  const [primaryColor, setPrimaryColor] = useState("#111827"); // slate-900
  const [secondaryColor, setSecondaryColor] = useState("#22c55e"); // green-500

  const whatsappDigits = useMemo(() => onlyDigits(whatsapp), [whatsapp]);

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadStores() {
    setLoadingList(true);
    const { data, error } = await supabase
      .from("stores")
      .select(
        `
        id, name, city, state, logo_url,
        brand_positioning, main_segment, tone_of_voice,
        address, neighborhood, phone, whatsapp, instagram,
        primary_color, secondary_color,
        created_at
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setStores([]);
    } else {
      setStores((data as any) ?? []);
    }

    setLoadingList(false);
  }

  function resetMessages() {
    setError(null);
    setOkMsg(null);
  }

  function validate() {
    if (!name.trim()) return "Informe o nome da loja.";
    if (!city.trim()) return "Informe a cidade.";
    if (!stateUf.trim()) return "Informe o estado (UF).";
    if (stateUf.trim().length !== 2) return "UF deve ter 2 letras (ex: SC).";
    return null;
  }

  async function createStore() {
    resetMessages();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Você precisa estar logado para cadastrar a loja.");
  }    

    setSaving(true);
    try {
      const payload = {
        owner_user_id: user.id, // 👈 ESSENCIAL com RLS
        name: name.trim(),
        city: city.trim(),
        state: stateUf.trim().toUpperCase(),
        logo_url: logoUrl.trim() || null,

        // novos campos
        main_segment: mainSegment || null,
        brand_positioning: brandPositioning || null,
        tone_of_voice: toneOfVoice || null,

        address: address.trim() || null,
        neighborhood: neighborhood.trim() || null,

        phone: onlyDigits(phone) || null,
        whatsapp: onlyDigits(whatsapp) || null,
        instagram: instagram.trim() || null,

        primary_color: primaryColor || null,
        secondary_color: secondaryColor || null,
      };

      //const { error } = await supabase.from("stores").insert(payload);

      const { data, error } = await supabase.from("stores").insert(payload).select().single();
      if (error) throw new Error(error.message);

      console.log("Store criada:", data);

      if (error) {
        console.error(error);
        throw new Error(error.message);
      }

      setOkMsg("Loja cadastrada com sucesso!");
      setName("");
      setCity("");
      setStateUf("");
      setLogoUrl("");
      setMainSegment("bebidas");
      setBrandPositioning("popular");
      setToneOfVoice("descontraido");
      setAddress("");
      setNeighborhood("");
      setPhone("");
      setWhatsapp("");
      setInstagram("");
      setPrimaryColor("#111827");
      setSecondaryColor("#22c55e");

      await loadStores();
    } catch (e: any) {
      setError(e?.message ?? "Erro ao cadastrar loja");
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
  };

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Cadastro de Loja</h1>
        <Link href="/campaigns" style={{ fontSize: 14 }}>
          Ir para campanhas →
        </Link>
      </div>

      <p style={{ color: "#555", marginTop: 8 }}>
        Preencha os dados básicos e a identidade da loja. Isso melhora a qualidade das campanhas e dos Reels.
      </p>

      <div style={{ display: "grid", gap: 16, maxWidth: 860 }}>
        {/* FORM */}
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Dados principais</h2>

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
              <label style={labelStyle}>Nome da loja *</label>
              <input
                style={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Loja do João"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12 }}>
              <div>
                <label style={labelStyle}>Cidade *</label>
                <input
                  style={inputStyle}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Ibirama"
                />
              </div>
              <div>
                <label style={labelStyle}>UF *</label>
                <input
                  style={inputStyle}
                  value={stateUf}
                  onChange={(e) => setStateUf(e.target.value)}
                  placeholder="SC"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Logo URL (opcional)</label>
              <input
                style={inputStyle}
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://... (por enquanto URL)"
              />
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Dica: depois podemos evoluir para upload direto no Supabase Storage.
              </div>
            </div>
          </div>
        </section>

        {/* PERFIL DA LOJA */}
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Perfil da loja</h2>

          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Segmento principal</label>
                <select
                  style={inputStyle}
                  value={mainSegment}
                  onChange={(e) => setMainSegment(e.target.value)}
                >
                  {SEGMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Posicionamento padrão</label>
                <select
                  style={inputStyle}
                  value={brandPositioning}
                  onChange={(e) => setBrandPositioning(e.target.value)}
                >
                  {POSITIONING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                  Isso será o padrão. Em cada campanha/produto você poderá sobrescrever (popular/premium/jovem etc.).
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Tom de voz</label>
              <select
                style={inputStyle}
                value={toneOfVoice}
                onChange={(e) => setToneOfVoice(e.target.value)}
              >
                {TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ENDEREÇO E CONTATOS */}
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Endereço e contatos</h2>

          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={labelStyle}>Endereço</label>
              <input
                style={inputStyle}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número"
              />
            </div>

            <div>
              <label style={labelStyle}>Bairro</label>
              <input
                style={inputStyle}
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex: Centro"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Telefone</label>
                <input
                  style={inputStyle}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(xx) xxxx-xxxx"
                />
              </div>

              <div>
                <label style={labelStyle}>WhatsApp</label>
                <input
                  style={inputStyle}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(xx) xxxxx-xxxx"
                />
                <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                  {whatsappDigits ? `Detectado: ${formatWhatsappHint(whatsappDigits)}` : "Dica: só números serão salvos."}
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Instagram</label>
              <input
                style={inputStyle}
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@loja"
              />
            </div>
          </div>
        </section>

        {/* IDENTIDADE VISUAL */}
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Identidade visual</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Cor primária</label>
              <input
                style={{ ...inputStyle, padding: "6px 10px", height: 42 }}
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{primaryColor}</div>
            </div>

            <div>
              <label style={labelStyle}>Cor secundária</label>
              <input
                style={{ ...inputStyle, padding: "6px 10px", height: 42 }}
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
              />
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{secondaryColor}</div>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 12,
              background: "#fafafa",
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: primaryColor,
                border: "1px solid rgba(0,0,0,0.06)",
              }}
              title="Primária"
            />
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: secondaryColor,
                border: "1px solid rgba(0,0,0,0.06)",
              }}
              title="Secundária"
            />
            <div style={{ fontSize: 13, color: "#444" }}>
              Prévia rápida das cores (vamos usar isso depois para personalizar imagens e templates).
            </div>
          </div>
        </section>

        {/* AÇÃO */}
        <section style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={createStore}
            disabled={saving}
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
            {saving ? "Salvando..." : "Cadastrar loja"}
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
            Atualizar lista
          </button>
        </section>

        {/* LISTA */}
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Lojas cadastradas</h2>

          {loadingList ? (
            <p>Carregando...</p>
          ) : stores.length === 0 ? (
            <p>Nenhuma loja cadastrada ainda.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {stores.map((s) => (
                <div
                  key={s.id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 12,
                    padding: 12,
                    display: "grid",
                    gap: 6,
                    background: "white",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <strong>{s.name}</strong>{" "}
                      <span style={{ color: "#666" }}>
                        — {s.city ?? "—"}/{s.state ?? "—"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {s.primary_color && (
                        <span
                          title="Primária"
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 5,
                            background: s.primary_color,
                            border: "1px solid rgba(0,0,0,0.08)",
                            display: "inline-block",
                          }}
                        />
                      )}
                      {s.secondary_color && (
                        <span
                          title="Secundária"
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 5,
                            background: s.secondary_color,
                            border: "1px solid rgba(0,0,0,0.08)",
                            display: "inline-block",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: "#444" }}>
                    <strong>Segmento:</strong> {s.main_segment ?? "—"} ·{" "}
                    <strong>Posicionamento:</strong> {s.brand_positioning ?? "—"} ·{" "}
                    <strong>Tom:</strong> {s.tone_of_voice ?? "—"}
                  </div>

                  <div style={{ fontSize: 13, color: "#444" }}>
                    <strong>Contato:</strong>{" "}
                    {s.whatsapp ? `WhatsApp ${s.whatsapp}` : s.phone ? `Tel ${s.phone}` : "—"}{" "}
                    {s.instagram ? `· IG ${s.instagram}` : ""}
                  </div>

                  {(s.address || s.neighborhood) && (
                    <div style={{ fontSize: 13, color: "#444" }}>
                      <strong>Endereço:</strong> {[s.address, s.neighborhood].filter(Boolean).join(" - ")}
                    </div>
                  )}

                  {s.logo_url && (
                    <div style={{ fontSize: 13 }}>
                      <strong>Logo URL:</strong>{" "}
                      <a href={s.logo_url} target="_blank" rel="noreferrer">
                        abrir
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
