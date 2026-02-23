"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

export default function StorePage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // básicos
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");

  // branding/posicionamento
  const [mainSegment, setMainSegment] = useState("");
  const [brandPositioning, setBrandPositioning] = useState("");
  const [toneOfVoice, setToneOfVoice] = useState("");

  // contato/endereço (seus campos extras)
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // cores
  const [primaryColor, setPrimaryColor] = useState("#16a34a"); // verde
  const [secondaryColor, setSecondaryColor] = useState("#0f172a"); // slate

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Você precisa estar logado para cadastrar a loja.");
      }

      const payload = {
        owner_user_id: user.id,

        name: name.trim(),
        city: city.trim() || null,
        state: stateUf.trim().toUpperCase() || null,
        logo_url: logoUrl.trim() || null,

        main_segment: mainSegment.trim() || null,
        brand_positioning: brandPositioning.trim() || null,
        tone_of_voice: toneOfVoice.trim() || null,

        address: address.trim() || null,
        neighborhood: neighborhood.trim() || null,

        phone: onlyDigits(phone) || null,
        whatsapp: onlyDigits(whatsapp) || null,
        instagram: instagram.trim() || null,

        primary_color: primaryColor || null,
        secondary_color: secondaryColor || null,
      };

      const { error } = await supabase.from("stores").insert(payload);

      if (error) throw new Error(error.message);

      router.push("/app");
    } catch (err: any) {
      setError(err?.message ?? "Erro inesperado ao salvar a loja.");
    } finally {
      setSaving(false);
    }
  }

  return (
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
            {/* básicos */}
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
                    placeholder="Ex.: Ibirama"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-sm font-medium">Estado (UF)</label>
                  <input
                    className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                    value={stateUf}
                    onChange={(e) => setStateUf(e.target.value)}
                    placeholder="Ex.: SC"
                    maxLength={2}
                  />
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

            {/* posicionamento */}
            <section className="grid gap-3">
              <div className="text-sm font-semibold">Posicionamento</div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <label className="text-sm font-medium">Segmento principal</label>
                  <input
                    className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                    value={mainSegment}
                    onChange={(e) => setMainSegment(e.target.value)}
                    placeholder="Ex.: Mercado / Moda / Farmácia"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-sm font-medium">Tom de voz</label>
                  <input
                    className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                    value={toneOfVoice}
                    onChange={(e) => setToneOfVoice(e.target.value)}
                    placeholder="Ex.: amigável, direto, premium"
                  />
                </div>

                <div className="grid gap-1 sm:col-span-2">
                  <label className="text-sm font-medium">Posicionamento</label>
                  <input
                    className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                    value={brandPositioning}
                    onChange={(e) => setBrandPositioning(e.target.value)}
                    placeholder="Ex.: o mais barato do bairro / qualidade premium / entrega rápida"
                  />
                </div>
              </div>
            </section>

            {/* contato */}
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
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(xx) xxxx-xxxx"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-sm font-medium">WhatsApp</label>
                  <input
                    className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(xx) xxxxx-xxxx"
                  />
                </div>
              </div>
            </section>

            {/* cores */}
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

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => router.push("/login")}
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
  );
}