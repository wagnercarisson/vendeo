"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div
      className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all ${
        type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {message}
    </div>
  );
}

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

function isValidHexColor(v: string) {
  return /^#([0-9a-fA-F]{6})$/.test(v);
}

function isValidUrlOrEmpty(v: string) {
  if (!v.trim()) return true;
  try {
    const u = new URL(v.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeInstagram(v: string) {
  const s = v.trim();
  if (!s) return "";
  return s.startsWith("@") ? s : `@${s}`;
}

function isValidInstagramOrEmpty(v: string) {
  const s = v.trim();
  if (!s) return true;
  const handle = s.startsWith("@") ? s.slice(1) : s;
  return /^[a-zA-Z0-9._]{1,30}$/.test(handle);
}

// Telefone: aceita 10 (fixo) ou 11 (celular)
function formatBRPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) return "";

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (digits.length < 3) return `(${ddd}`;

  if (digits.length <= 10) {
    // fixo: (11) 3333-4444
    const part1 = rest.slice(0, 4);
    const part2 = rest.slice(4, 8);
    return `(${ddd}) ${part1}${part2 ? `-${part2}` : ""}`;
  }

  // celular: (11) 99999-9999
  const part1 = rest.slice(0, 5);
  const part2 = rest.slice(5, 9);
  return `(${ddd}) ${part1}${part2 ? `-${part2}` : ""}`;
}

// WhatsApp: sempre celular (11)
function formatBRCell(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) return "";

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (digits.length < 3) return `(${ddd}`;

  const part1 = rest.slice(0, Math.min(5, rest.length));
  const part2 = rest.length > 5 ? rest.slice(5, 9) : "";
  return `(${ddd}) ${part1}${part2 ? `-${part2}` : ""}`;
}

function validateUF(uf: string) {
  return UF_OPTIONS.includes(uf);
}

const UF_OPTIONS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const SEGMENT_OPTIONS = [
  "Mercado / Mercearia",
  "Loja de bebidas",
  "Moda / Boutique",
  "Farmácia",
  "Restaurante / Lanchonete",
  "Pet shop",
  "Materiais de construção",
  "Salão / Estética",
  "Eletrônicos",
  "Casa & Decoração",
  "Academia",
  "Outro…",
];

const TONE_OPTIONS = [
  "Amigável",
  "Direto",
  "Promocional",
  "Premium",
  "Divertido",
  "Técnico",
  "Próximo / “de bairro”",
  "Outro…",
];

export default function StorePage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // básicos
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");

  // posicionamento
  const [segmentChoice, setSegmentChoice] = useState("");
  const [mainSegmentCustom, setMainSegmentCustom] = useState("");
  const [toneChoice, setToneChoice] = useState("");
  const [toneCustom, setToneCustom] = useState("");
  const [brandPositioning, setBrandPositioning] = useState("");

  // contato/endereço
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // cores
  const [primaryColor, setPrimaryColor] = useState("#16a34a");
  const [secondaryColor, setSecondaryColor] = useState("#0f172a");

  const mainSegment = useMemo(() => {
    const v =
      segmentChoice === "Outro…" ? mainSegmentCustom.trim() : segmentChoice.trim();
    return v;
  }, [segmentChoice, mainSegmentCustom]);

  const toneOfVoice = useMemo(() => {
    const v = toneChoice === "Outro…" ? toneCustom.trim() : toneChoice.trim();
    return v;
  }, [toneChoice, toneCustom]);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  }

  function validateForm(): string | null {
    const n = name.trim();
    if (n.length < 2) return "Informe o nome da loja (mínimo 2 caracteres).";

    if (stateUf && !validateUF(stateUf)) return "Selecione um estado (UF) válido.";

    if (!isValidUrlOrEmpty(logoUrl))
      return "Logo URL inválida. Use http(s)://... ou deixe em branco.";

    if (!isValidInstagramOrEmpty(instagram))
      return "Instagram inválido. Use apenas letras, números, ponto e underline (ex.: @minhaloja).";

    if (primaryColor && !isValidHexColor(primaryColor)) return "Cor primária inválida.";
    if (secondaryColor && !isValidHexColor(secondaryColor)) return "Cor secundária inválida.";

    if (segmentChoice === "Outro…" && !mainSegmentCustom.trim())
      return "Digite o segmento principal (opção “Outro…”).";

    if (toneChoice === "Outro…" && !toneCustom.trim())
      return "Digite o tom de voz (opção “Outro…”).";

    const p = onlyDigits(phone);
    if (p && !(p.length === 10 || p.length === 11))
      return "Telefone deve ter 10 (fixo) ou 11 (celular) dígitos.";

    const w = onlyDigits(whatsapp);
    if (w && w.length !== 11) return "WhatsApp deve ter 11 dígitos (celular com DDD).";

    return null;
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const validationError = validateForm();
      if (validationError) {
        showToast(validationError, "error");
        setSaving(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        showToast("Você precisa estar logado para cadastrar a loja.", "error");
        setSaving(false);
        return;
      }

      const payload = {
        owner_user_id: user.id,

        name: name.trim(),
        city: city.trim() || null,
        state: stateUf.trim().toUpperCase() || null,
        logo_url: logoUrl.trim() || null,

        main_segment: mainSegment || null,
        brand_positioning: brandPositioning.trim() || null,
        tone_of_voice: toneOfVoice || null,

        address: address.trim() || null,
        neighborhood: neighborhood.trim() || null,

        phone: onlyDigits(phone) || null,
        whatsapp: onlyDigits(whatsapp) || null,
        instagram: normalizeInstagram(instagram) || null,

        primary_color: primaryColor || null,
        secondary_color: secondaryColor || null,
      };

      const { error: insertError } = await supabase.from("stores").insert(payload);
      if (insertError) {
        showToast(insertError.message, "error");
        setSaving(false);
        return;
      }

      setToast({ message: "Loja cadastrada com sucesso!", type: "success" });
      window.setTimeout(() => {
        setToast(null);
        router.push("/app");
      }, 1200);
    } catch (err: any) {
      showToast(err?.message ?? "Erro inesperado ao salvar a loja.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <main className="min-h-screen bg-zinc-50 text-zinc-900">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="mb-6">
            <div className="text-sm text-zinc-600">Onboarding</div>
            <h1 className="text-2xl font-semibold">Cadastrar sua loja</h1>
            <p className="mt-1 text-zinc-600">
              Vamos configurar sua identidade visual e informações básicas.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSave} className="grid gap-6">
              {/* Informações básicas */}
              <section className="grid gap-3">
                <div className="text-sm font-semibold">Informações básicas</div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1 sm:col-span-2">
                    <label className="text-sm font-medium">Nome da loja *</label>
                    <input
                      className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex.: Mercado Central"
                      required
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Cidade</label>
                    <input
                      className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex.: São Paulo"
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Estado (UF)</label>
                    <select
                      className="h-11 rounded-xl border border-zinc-200 bg-white px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      value={stateUf}
                      onChange={(e) => setStateUf(e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {UF_OPTIONS.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-1 sm:col-span-2">
                    <label className="text-sm font-medium">Logo URL (opcional)</label>
                    <input
                      className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </section>

              {/* Posicionamento */}
              <section className="grid gap-3">
                <div className="text-sm font-semibold">Posicionamento</div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Segmento principal</label>
                    <select
                      className="h-11 rounded-xl border border-zinc-200 bg-white px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      value={segmentChoice}
                      onChange={(e) => setSegmentChoice(e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {SEGMENT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    {segmentChoice === "Outro…" && (
                      <input
                        className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                        value={mainSegmentCustom}
                        onChange={(e) => setMainSegmentCustom(e.target.value)}
                        placeholder="Digite o segmento"
                      />
                    )}
                  </div>

                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Tom de voz</label>
                    <select
                      className="h-11 rounded-xl border border-zinc-200 bg-white px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      value={toneChoice}
                      onChange={(e) => setToneChoice(e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {TONE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    {toneChoice === "Outro…" && (
                      <input
                        className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                        value={toneCustom}
                        onChange={(e) => setToneCustom(e.target.value)}
                        placeholder="Digite o tom de voz"
                      />
                    )}
                  </div>

                  <div className="grid gap-1 sm:col-span-2">
                    <label className="text-sm font-medium">Diferencial da loja</label>
                    <input
                      className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      value={brandPositioning}
                      onChange={(e) => setBrandPositioning(e.target.value)}
                      placeholder="Ex.: mais barato do bairro / qualidade premium / entrega rápida"
                    />
                  </div>
                </div>
              </section>

              {/* Contato */}
              <section className="grid gap-3">
                <div className="text-sm font-semibold">Contato e endereço (opcional)</div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1 sm:col-span-2">
                    <label className="text-sm font-medium">Endereço</label>
                    <input
                      className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rua, número"
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Bairro</label>
                    <input
                      className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex.: Centro"
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Instagram</label>
                    <input
                      className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@sualoja"
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Telefone</label>
                    <input
                      className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      value={phone}
                      onChange={(e) => setPhone(formatBRPhone(e.target.value))}
                      placeholder="(11) 3333-4444 ou (11) 99999-9999"
                      inputMode="numeric"
                    />
                    <div className="text-xs text-zinc-500">
                      Aceita fixo (10 dígitos) ou celular (11).
                    </div>
                  </div>

                  <div className="grid gap-1">
                    <label className="text-sm font-medium">WhatsApp</label>
                    <input
                      className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(formatBRCell(e.target.value))}
                      placeholder="(11) 99999-9999"
                      inputMode="numeric"
                    />
                    <div className="text-xs text-zinc-500">
                      Somente celular (11 dígitos com DDD).
                    </div>
                  </div>
                </div>
              </section>

              {/* Identidade visual */}
              <section className="grid gap-3">
                <div className="text-sm font-semibold">Identidade visual</div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Cor primária</label>
                    <input
                      type="color"
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-2"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Cor secundária</label>
                    <input
                      type="color"
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-2"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                    />
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 sm:col-span-2">
                    <div className="font-medium text-zinc-900">Prévia rápida</div>
                    <div className="mt-2 flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <div
                        className="rounded-xl px-4 py-2 text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Botão primário
                      </div>
                      <div
                        className="rounded-xl px-4 py-2"
                        style={{
                          border: `1px solid ${secondaryColor}`,
                          color: secondaryColor,
                        }}
                      >
                        Destaque
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/login?redirect=%2Fapp")}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
                  disabled={saving}
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar e continuar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}