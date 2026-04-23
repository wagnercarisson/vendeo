"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "form" | "review";

interface FormData {
  store_name: string;
  primary_color: string;
  tone_of_voice: string;
  main_segment: string;
  secondary_color: string;
  logo_url: string;
  brand_positioning: string;
  whatsapp: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
}

const EMPTY_FORM: FormData = {
  store_name: "",
  primary_color: "",
  tone_of_voice: "",
  main_segment: "",
  secondary_color: "",
  logo_url: "",
  brand_positioning: "",
  whatsapp: "",
  phone: "",
  address: "",
  neighborhood: "",
  city: "",
  state: "",
};

function isValidHex(v: string): boolean {
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(v);
}

function isValidUrl(v: string): boolean {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

export default function OnboardingStorePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormData, string>> = {};

    if (!form.store_name.trim()) next.store_name = "Campo obrigatório";
    if (!form.primary_color.trim()) {
      next.primary_color = "Campo obrigatório";
    } else if (!isValidHex(form.primary_color.trim())) {
      next.primary_color = "Informe uma cor hex válida (ex: #16A34A)";
    }
    if (!form.tone_of_voice.trim()) next.tone_of_voice = "Campo obrigatório";
    if (!form.main_segment.trim()) next.main_segment = "Campo obrigatório";
    if (form.secondary_color.trim() && !isValidHex(form.secondary_color.trim())) {
      next.secondary_color = "Informe uma cor hex válida (ex: #2563EB)";
    }
    if (form.logo_url.trim() && !isValidUrl(form.logo_url.trim())) {
      next.logo_url = "URL inválida (ex: https://exemplo.com/logo.png)";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleAdvanceToReview(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      setStep("review");
    }
  }

  async function handleConfirm() {
    setLoading(true);
    setSubmitError(null);
    try {
      const body: Record<string, string> = {
        store_name: form.store_name.trim(),
        primary_color: form.primary_color.trim(),
        tone_of_voice: form.tone_of_voice.trim(),
        main_segment: form.main_segment.trim(),
      };
      if (form.secondary_color.trim()) body.secondary_color = form.secondary_color.trim();
      if (form.logo_url.trim()) body.logo_url = form.logo_url.trim();
      if (form.brand_positioning.trim()) body.brand_positioning = form.brand_positioning.trim();
      if (form.whatsapp.trim()) body.whatsapp = form.whatsapp.trim();
      if (form.phone.trim()) body.phone = form.phone.trim();
      if (form.address.trim()) body.address = form.address.trim();
      if (form.neighborhood.trim()) body.neighborhood = form.neighborhood.trim();
      if (form.city.trim()) body.city = form.city.trim();
      if (form.state.trim()) body.state = form.state.trim();

      const res = await fetch("/api/onboarding/store", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setSubmitError(data?.error || "Erro ao criar loja. Tente novamente.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (step === "review") {
    return (
      <ReviewStep
        form={form}
        loading={loading}
        submitError={submitError}
        onBack={() => setStep("form")}
        onConfirm={handleConfirm}
      />
    );
  }

  const inputCls =
    "w-full rounded-xl border border-vendeo-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200";

  return (
    <div className="min-h-screen bg-vendeo-bg">
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mx-auto max-w-xl rounded-2xl border border-vendeo-border bg-white p-6 shadow-soft">
          <div className="inline-flex items-center gap-2 rounded-full border border-vendeo-border bg-white px-3 py-1 text-sm text-vendeo-muted">
            <span className="h-2 w-2 rounded-full bg-vendeo-green" />
            Primeiro acesso
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-vendeo-text">
            Identidade da sua loja
          </h1>
          <p className="mt-2 text-sm text-vendeo-muted">
            Preencha os dados essenciais da sua marca. Os campos marcados com{" "}
            <span className="text-red-500">*</span> são obrigatórios.
          </p>

          <form onSubmit={handleAdvanceToReview} noValidate className="mt-6 grid gap-6">
            {/* Required fields */}
            <section className="grid gap-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-vendeo-muted">
                Identidade obrigatória
              </p>

              <div className="grid gap-1">
                <label htmlFor="store_name" className="text-sm font-medium text-vendeo-text">
                  Nome da loja <span className="text-red-500">*</span>
                </label>
                <input
                  id="store_name"
                  className={inputCls}
                  value={form.store_name}
                  onChange={(e) => setField("store_name", e.target.value)}
                  placeholder="Ex: Adega do Bairro"
                />
                {errors.store_name && (
                  <p className="text-xs text-red-600">{errors.store_name}</p>
                )}
              </div>

              <div className="grid gap-1">
                <label htmlFor="primary_color" className="text-sm font-medium text-vendeo-text">
                  Cor principal da marca <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={isValidHex(form.primary_color) ? form.primary_color : "#000000"}
                    onChange={(e) => setField("primary_color", e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-vendeo-border"
                  />
                  <input
                    id="primary_color"
                    className={inputCls}
                    value={form.primary_color}
                    onChange={(e) => setField("primary_color", e.target.value)}
                    placeholder="#16A34A"
                  />
                </div>
                {errors.primary_color && (
                  <p className="text-xs text-red-600">{errors.primary_color}</p>
                )}
              </div>

              <div className="grid gap-1">
                <label htmlFor="tone_of_voice" className="text-sm font-medium text-vendeo-text">
                  Tom de voz <span className="text-red-500">*</span>
                </label>
                <input
                  id="tone_of_voice"
                  className={inputCls}
                  value={form.tone_of_voice}
                  onChange={(e) => setField("tone_of_voice", e.target.value)}
                  placeholder="Ex: amigável, promocional, profissional"
                />
                {errors.tone_of_voice && (
                  <p className="text-xs text-red-600">{errors.tone_of_voice}</p>
                )}
              </div>

              <div className="grid gap-1">
                <label htmlFor="main_segment" className="text-sm font-medium text-vendeo-text">
                  Segmento principal <span className="text-red-500">*</span>
                </label>
                <input
                  id="main_segment"
                  className={inputCls}
                  value={form.main_segment}
                  onChange={(e) => setField("main_segment", e.target.value)}
                  placeholder="Ex: alimentos, moda, eletrônicos"
                />
                {errors.main_segment && (
                  <p className="text-xs text-red-600">{errors.main_segment}</p>
                )}
              </div>
            </section>

            {/* Optional fields */}
            <section className="grid gap-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-vendeo-muted">
                Dados opcionais da marca
              </p>

              <div className="grid gap-1">
                <label
                  htmlFor="secondary_color"
                  className="text-sm font-medium text-vendeo-text"
                >
                  Cor secundária
                </label>
                <input
                  id="secondary_color"
                  className={inputCls}
                  value={form.secondary_color}
                  onChange={(e) => setField("secondary_color", e.target.value)}
                  placeholder="#2563EB"
                />
                {errors.secondary_color && (
                  <p className="text-xs text-red-600">{errors.secondary_color}</p>
                )}
              </div>

              <div className="grid gap-1">
                <label htmlFor="logo_url" className="text-sm font-medium text-vendeo-text">
                  URL do logo
                </label>
                <input
                  id="logo_url"
                  className={inputCls}
                  value={form.logo_url}
                  onChange={(e) => setField("logo_url", e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                />
                {errors.logo_url && (
                  <p className="text-xs text-red-600">{errors.logo_url}</p>
                )}
              </div>

              <div className="grid gap-1">
                <label
                  htmlFor="brand_positioning"
                  className="text-sm font-medium text-vendeo-text"
                >
                  Posicionamento de marca
                </label>
                <textarea
                  id="brand_positioning"
                  className={`${inputCls} resize-none`}
                  rows={2}
                  value={form.brand_positioning}
                  onChange={(e) => setField("brand_positioning", e.target.value)}
                  placeholder="Ex: loja de bairro com preços acessíveis e atendimento próximo"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1">
                  <label htmlFor="whatsapp" className="text-sm font-medium text-vendeo-text">
                    WhatsApp
                  </label>
                  <input
                    id="whatsapp"
                    className={inputCls}
                    value={form.whatsapp}
                    onChange={(e) => setField("whatsapp", e.target.value)}
                    placeholder="(47) 99999-9999"
                  />
                </div>
                <div className="grid gap-1">
                  <label htmlFor="phone" className="text-sm font-medium text-vendeo-text">
                    Telefone
                  </label>
                  <input
                    id="phone"
                    className={inputCls}
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="(47) 3333-3333"
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <label htmlFor="address" className="text-sm font-medium text-vendeo-text">
                  Endereço
                </label>
                <input
                  id="address"
                  className={inputCls}
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder="Rua XV de Novembro, 100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-1">
                  <label htmlFor="neighborhood" className="text-sm font-medium text-vendeo-text">
                    Bairro
                  </label>
                  <input
                    id="neighborhood"
                    className={inputCls}
                    value={form.neighborhood}
                    onChange={(e) => setField("neighborhood", e.target.value)}
                    placeholder="Centro"
                  />
                </div>
                <div className="grid gap-1">
                  <label htmlFor="city" className="text-sm font-medium text-vendeo-text">
                    Cidade
                  </label>
                  <input
                    id="city"
                    className={inputCls}
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    placeholder="Ibirama"
                  />
                </div>
                <div className="grid gap-1">
                  <label htmlFor="state" className="text-sm font-medium text-vendeo-text">
                    Estado
                  </label>
                  <input
                    id="state"
                    className={inputCls}
                    value={form.state}
                    onChange={(e) => setField("state", e.target.value)}
                    placeholder="SC"
                  />
                </div>
              </div>
            </section>

            <button
              type="submit"
              className="rounded-xl bg-vendeo-green px-4 py-2 text-sm font-semibold text-white hover:bg-vendeo-greenLight"
            >
              Revisar e confirmar →
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function ReviewStep({
  form,
  loading,
  submitError,
  onBack,
  onConfirm,
}: {
  form: FormData;
  loading: boolean;
  submitError: string | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="min-h-screen bg-vendeo-bg">
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mx-auto max-w-xl rounded-2xl border border-vendeo-border bg-white p-6 shadow-soft">
          <div className="inline-flex items-center gap-2 rounded-full border border-vendeo-border bg-white px-3 py-1 text-sm text-vendeo-muted">
            <span className="h-2 w-2 rounded-full bg-vendeo-green" />
            Revisão dos dados
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-vendeo-text">
            Confirme os dados da sua loja
          </h1>
          <p className="mt-2 text-sm text-vendeo-muted">
            Revise tudo antes de confirmar. Você pode voltar e ajustar.
          </p>

          <div className="mt-6 grid gap-6">
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-vendeo-muted">
                Brand Profile
              </p>
              <dl className="mt-3 grid gap-2">
                <ReviewRow label="Nome da loja" value={form.store_name} />
                <ReviewRow label="Cor principal" value={form.primary_color} isColor />
                <ReviewRow label="Tom de voz" value={form.tone_of_voice} />
                {form.secondary_color && (
                  <ReviewRow label="Cor secundária" value={form.secondary_color} isColor />
                )}
                {form.logo_url && <ReviewRow label="URL do logo" value={form.logo_url} />}
                {form.brand_positioning && (
                  <ReviewRow label="Posicionamento" value={form.brand_positioning} />
                )}
                {form.whatsapp && <ReviewRow label="WhatsApp" value={form.whatsapp} />}
                {form.phone && <ReviewRow label="Telefone" value={form.phone} />}
                {form.address && <ReviewRow label="Endereço" value={form.address} />}
                {form.neighborhood && <ReviewRow label="Bairro" value={form.neighborhood} />}
                {form.city && <ReviewRow label="Cidade" value={form.city} />}
                {form.state && <ReviewRow label="Estado" value={form.state} />}
              </dl>
            </section>

            <hr className="border-vendeo-border" />

            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-vendeo-muted">
                Contexto da Loja
              </p>
              <dl className="mt-3 grid gap-2">
                <ReviewRow label="Segmento principal" value={form.main_segment} />
              </dl>
            </section>
          </div>

          {submitError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 rounded-xl border border-vendeo-border px-4 py-2 text-sm font-medium text-vendeo-text hover:bg-gray-50"
            >
              ← Voltar e ajustar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-xl bg-vendeo-green px-4 py-2 text-sm font-semibold text-white hover:bg-vendeo-greenLight disabled:opacity-60"
            >
              {loading ? "Confirmando..." : "Confirmar cadastro"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  isColor = false,
}: {
  label: string;
  value: string;
  isColor?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-sm text-vendeo-muted">{label}</dt>
      <dd className="flex items-center gap-2 text-right text-sm font-medium text-vendeo-text">
        {isColor && (
          <span
            className="inline-block h-4 w-4 flex-shrink-0 rounded-full border border-vendeo-border"
            style={{ backgroundColor: value }}
          />
        )}
        {value}
      </dd>
    </div>
  );
}
