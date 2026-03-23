"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Store = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
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

const AUDIENCE_OPTIONS = [
  { value: "", label: "Selecione o público" },
  { value: "geral", label: "Geral / Público amplo" },
  { value: "jovens_festa", label: "Jovens / Festa" },
  { value: "familia", label: "Família" },
  { value: "infantil", label: "Infantil" },
  { value: "maes_pais", label: "Mães e pais" },
  { value: "mulheres", label: "Mulheres" },
  { value: "homens", label: "Homens" },
  { value: "fitness", label: "Fitness / Saudável" },
  { value: "terceira_idade", label: "Terceira idade" },
  { value: "premium_exigente", label: "Premium / exigente" },
  { value: "economico", label: "Econômico / preço baixo" },
  { value: "b2b", label: "Profissionais / empresas (B2B)" },
  { value: "outro", label: "Outro (vou especificar)" },
] as const;

const OBJECTIVE_OPTIONS = [
  { value: "", label: "Selecione o objetivo" },
  { value: "promocao", label: "Promoção (preço/condição especial)" },
  { value: "novidade", label: "Novidade (lançamento/chegou hoje)" },
  { value: "queima", label: "Queima de estoque (últimas unidades)" },
  { value: "sazonal", label: "Sazonal / data comemorativa" },
  { value: "reposicao", label: "Reposição / volta ao estoque" },
  { value: "combo", label: "Combo / leve mais por menos" },
  { value: "engajamento", label: "Engajamento (perguntas/enquete)" },
  { value: "visitas", label: "Gerar visitas na loja" },
  { value: "outro", label: "Outro (vou especificar)" },
] as const;

export default function NewCampaignPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [storeId, setStoreId] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");

  const [audience, setAudience] = useState("");
  const [audienceOther, setAudienceOther] = useState("");

  const [objective, setObjective] = useState("");
  const [objectiveOther, setObjectiveOther] = useState("");

  const [productPositioning, setProductPositioning] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const selectedStore = useMemo(
    () => stores.find((s) => s.id === storeId) ?? null,
    [stores, storeId]
  );

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadStores() {
    setLoadingStores(true);
    setError(null);
    setOkMsg(null);

    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;

      const user = userData?.user;
      if (!user) {
        setStores([]);
        setStoreId("");
        setError("Você precisa estar logado para criar uma campanha.");
        return;
      }

      const { data, error } = await supabase
        .from("stores")
        .select("id, name, city, state, brand_positioning, main_segment, tone_of_voice")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const list = (data ?? []) as Store[];
      setStores(list);

      const first = list[0]?.id ?? "";
      const currentStillExists = list.some((s) => s.id === storeId);
      if (!storeId || !currentStillExists) setStoreId(first);

      if (list.length === 0) {
        setError("Nenhuma loja cadastrada. Cadastre uma loja para continuar.");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || err?.error_description || err?.hint || "Erro ao carregar lojas.";
      setStores([]);
      setStoreId("");
      setError(msg);
    } finally {
      setLoadingStores(false);
    }
  }

  function normalizePriceToNumber(raw: string) {
    return Number(raw.replace(",", "."));
  }

  function getAudienceFinal() {
    if (audience === "outro") return audienceOther.trim();
    if (!audience) return "";
    const label = AUDIENCE_OPTIONS.find((o) => o.value === audience)?.label;
    return (label ?? audience).trim();
  }

  function getObjectiveFinal() {
    if (objective === "outro") return objectiveOther.trim();
    if (!objective) return "";
    const label = OBJECTIVE_OPTIONS.find((o) => o.value === objective)?.label;
    return (label ?? objective).trim();
  }

  function validate() {
    if (!storeId) return "Selecione uma loja.";
    if (!productName.trim()) return "Informe o nome do produto.";
    if (!price.trim()) return "Informe o preço.";

    const p = normalizePriceToNumber(price);
    if (Number.isNaN(p) || p <= 0) return "Preço inválido. Ex: 8,99";

    const audFinal = getAudienceFinal();
    if (!audFinal) return "Informe o público.";

    const objFinal = getObjectiveFinal();
    if (!objFinal) return "Informe o objetivo.";

    return null;
  }

  async function createCampaign() {
    setError(null);
    setOkMsg(null);

    const v = validate();
    if (v) return setError(v);

    setSaving(true);

    try {
      const p = normalizePriceToNumber(price);
      const audFinal = getAudienceFinal();
      const objFinal = getObjectiveFinal();

      const payload = {
        store_id: storeId,
        product_name: productName.trim(),
        price: p,
        audience: audFinal,
        objective: objFinal,
        image_url: imageUrl.trim() || null,
        product_positioning: productPositioning || null,
      };

      const { error } = await supabase.from("campaigns").insert(payload);
      if (error) throw error;

      setOkMsg("Campanha criada com sucesso!");
      setProductName("");
      setPrice("");
      setAudience("");
      setAudienceOther("");
      setObjective("");
      setObjectiveOther("");
      setImageUrl("");
      setProductPositioning("");
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Erro ao criar campanha");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      {/* Container “padrão dashboard” */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">Nova campanha</h1>
              <Link
                href="/dashboard/campaigns"
                className="text-sm text-gray-500 hover:text-gray-900 hover:underline"
              >
                ← Voltar para campanhas
              </Link>
            </div>
            <p className="text-sm text-gray-600">
              Crie uma campanha para um produto. Você pode definir o posicionamento do produto (opcional).
            </p>
          </div>
        </div>

        {/* Alerts */}
        {(error || okMsg) && (
          <div className="mt-6 space-y-2">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <strong className="font-semibold">Erro:</strong> {error}
              </div>
            )}
            {okMsg && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <strong className="font-semibold">OK:</strong> {okMsg}
              </div>
            )}
          </div>
        )}

        {/* Card */}
        <div className="mt-6 rounded-2xl border bg-white shadow-sm">
          <div className="p-6 md:p-8">
            <div className="grid gap-5">
              {/* Loja */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Loja *</label>

                {loadingStores ? (
                  <p className="text-sm text-gray-500">Carregando lojas...</p>
                ) : stores.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    Nenhuma loja cadastrada.{" "}
                    <Link href="/dashboard/store" className="text-blue-600 hover:underline">
                      Cadastre uma loja
                    </Link>
                    .
                  </p>
                ) : (
                  <>
                    <select
                      className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
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
                      <div className="mt-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">Padrão da loja:</span>{" "}
                        {selectedStore.brand_positioning ?? "—"} ·{" "}
                        {selectedStore.main_segment ?? "—"} ·{" "}
                        {selectedStore.tone_of_voice ?? "—"}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Produto */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Produto *</label>
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ex: Cerveja Antarctica Original 600 ml"
                />
              </div>

              {/* Preço + Posicionamento */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Preço *</label>
                  <input
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex: 8,99"
                    inputMode="decimal"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Posicionamento do produto (opcional)
                  </label>
                  <select
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    value={productPositioning}
                    onChange={(e) => setProductPositioning(e.target.value)}
                  >
                    {PRODUCT_POSITIONING_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Se deixar em “Padrão da loja”, o sistema usa o posicionamento da loja automaticamente.
                  </p>
                </div>
              </div>

              {/* Público */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Público *</label>
                <select
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  value={audience}
                  onChange={(e) => {
                    setAudience(e.target.value);
                    if (e.target.value !== "outro") setAudienceOther("");
                  }}
                >
                  {AUDIENCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                {audience === "outro" && (
                  <input
                    className="mt-2 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    value={audienceOther}
                    onChange={(e) => setAudienceOther(e.target.value)}
                    placeholder="Descreva o público (ex: universitários, turistas, etc.)"
                  />
                )}
              </div>

              {/* Objetivo */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Objetivo *</label>
                <select
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  value={objective}
                  onChange={(e) => {
                    setObjective(e.target.value);
                    if (e.target.value !== "outro") setObjectiveOther("");
                  }}
                >
                  {OBJECTIVE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                {objective === "outro" && (
                  <input
                    className="mt-2 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    value={objectiveOther}
                    onChange={(e) => setObjectiveOther(e.target.value)}
                    placeholder="Descreva o objetivo (ex: atrair clientes para o WhatsApp)"
                  />
                )}
              </div>

              {/* Imagem URL */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Imagem URL (opcional)
                </label>
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={createCampaign}
                  disabled={saving || stores.length === 0}
                  className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Criar campanha"}
                </button>

                <button
                  onClick={loadStores}
                  disabled={saving}
                  className="rounded-xl border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 disabled:opacity-50"
                >
                  Atualizar lojas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dica / rodapé */}
        <div className="mt-6 text-xs text-gray-500">
          Dica: escolha “Público” e “Objetivo” para melhorar a qualidade do texto e do posicionamento gerado.
        </div>
      </div>
    </div>
  );
}