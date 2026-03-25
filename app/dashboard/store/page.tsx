"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Loader2, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MotionWrapper } from "../_components/MotionWrapper";
import { getSignedUrlAction } from "@/lib/supabase/storage-actions";

function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div
      className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
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
    const part1 = rest.slice(0, 4);
    const part2 = rest.slice(4, 8);
    return `(${ddd}) ${part1}${part2 ? `-${part2}` : ""}`;
  }

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

type StoreListItem = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  created_at: string | null;
};

type StoreRow = {
  id: string;
  owner_user_id: string;
  name: string;
  city: string | null;
  state: string | null;
  logo_url: string | null;

  main_segment: string | null;
  brand_positioning: string | null;
  tone_of_voice: string | null;

  address: string | null;
  neighborhood: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;

  primary_color: string | null;
  secondary_color: string | null;
};

export default function StorePage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // seleção (preparado para multi-lojas)
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string>("");

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

  // Upload states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logoErrorMsg, setLogoErrorMsg] = useState<string | null>(null);

  // Next steps states
  const [hasCampaigns, setHasCampaigns] = useState(false);
  const [hasPlans, setHasPlans] = useState(false);

  // cores
  const [primaryColor, setPrimaryColor] = useState("#16a34a");
  const [secondaryColor, setSecondaryColor] = useState("#0f172a");

  const isEditMode = !!activeStoreId;

  const mainSegment = useMemo(() => {
    const v =
      segmentChoice === "Outro…" ? mainSegmentCustom.trim() : segmentChoice.trim();
    return v;
  }, [segmentChoice, mainSegmentCustom]);

  const toneOfVoice = useMemo(() => {
    const v = toneChoice === "Outro…" ? toneCustom.trim() : toneChoice.trim();
    return v;
  }, [toneChoice, toneCustom]);

  const logoPreviewOk = useMemo(() => {
    if (!logoUrl.trim()) return false;
    return isValidUrlOrEmpty(logoUrl);
  }, [logoUrl]);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  }

  async function onLogoFileSelected(file: File | null) {
    if (!file) return;

    const maxMb = 8;
    if (file.size > maxMb * 1024 * 1024) {
      setLogoErrorMsg(`Imagem muito grande. Máximo: ${maxMb}MB.`);
      return;
    }

    try {
      setLogoErrorMsg(null);
      setUploadingLogo(true);
      setUploadProgress(10);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) throw new Error("Você precisa estar logado para enviar imagem.");

      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const timestamp = Date.now();
      const folder = activeStoreId ? `stores/${activeStoreId}` : `logos/${auth.user.id}`;
      const path = `${folder}/logos/${timestamp}_${safeName}`;

      setUploadProgress(30);

      const { error: upErr } = await supabase.storage
        .from("campaign-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (upErr) throw new Error(upErr.message);

      setUploadProgress(80);

      const { data: pub } = supabase.storage.from("campaign-images").getPublicUrl(path);
      const publicUrl = pub?.publicUrl;

      if (!publicUrl) throw new Error("Falha ao obter URL pública da imagem.");

      setUploadProgress(100);
      
      const signedUrl = await getSignedUrlAction(path);
      setLogoUrl(signedUrl || publicUrl);

      setTimeout(() => {
        setUploadingLogo(false);
        setUploadProgress(0);
      }, 600);

    } catch (err: any) {
      setLogoErrorMsg(err?.message || "Erro ao enviar imagem.");
      setUploadingLogo(false);
      setUploadProgress(0);
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (uploadingLogo) return;
    setDragOver(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (uploadingLogo) return;

    const file = e.dataTransfer?.files?.[0] ?? null;
    if (file && file.type.startsWith("image/")) {
      await onLogoFileSelected(file);
    } else if (file) {
      setLogoErrorMsg("Por favor, envie apenas arquivos de imagem.");
    }
  }

  function resetForm() {
    setName("");
    setCity("");
    setStateUf("");

    setSegmentChoice("");
    setMainSegmentCustom("");
    setToneChoice("");
    setToneCustom("");
    setBrandPositioning("");

    setAddress("");
    setNeighborhood("");
    setPhone("");
    setWhatsapp("");
    setInstagram("");
    setLogoUrl("");

    setPrimaryColor("#16a34a");
    setSecondaryColor("#0f172a");
  }

  function fillFromStore(s: StoreRow) {
    setName(s.name ?? "");
    setCity(s.city ?? "");
    setStateUf((s.state ?? "").toUpperCase());

    // segmento / tom: tenta casar com opções; se não bater, cai em "Outro…"
    const seg = (s.main_segment ?? "").trim();
    if (seg && SEGMENT_OPTIONS.includes(seg as any)) {
      setSegmentChoice(seg);
      setMainSegmentCustom("");
    } else if (seg) {
      setSegmentChoice("Outro…");
      setMainSegmentCustom(seg);
    } else {
      setSegmentChoice("");
      setMainSegmentCustom("");
    }

    const tone = (s.tone_of_voice ?? "").trim();
    if (tone && TONE_OPTIONS.includes(tone as any)) {
      setToneChoice(tone);
      setToneCustom("");
    } else if (tone) {
      setToneChoice("Outro…");
      setToneCustom(tone);
    } else {
      setToneChoice("");
      setToneCustom("");
    }

    setBrandPositioning(s.brand_positioning ?? "");

    setAddress(s.address ?? "");
    setNeighborhood(s.neighborhood ?? "");
    setPhone(s.phone ? formatBRPhone(s.phone) : "");
    setWhatsapp(s.whatsapp ? formatBRCell(s.whatsapp) : "");
    setInstagram(s.instagram ?? "");
    setLogoUrl(s.logo_url ?? "");

    setPrimaryColor(s.primary_color && isValidHexColor(s.primary_color) ? s.primary_color : "#16a34a");
    setSecondaryColor(
      s.secondary_color && isValidHexColor(s.secondary_color) ? s.secondary_color : "#0f172a"
    );
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

  async function loadStoresAndMaybeSelectDefault() {
    setBootLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      showToast("Você precisa estar logado para acessar sua loja.", "error");
      router.push("/login?redirect=%2Fdashboard%2Fstore");
      return;
    }

    const { data: list, error: listError } = await supabase
      .from("stores")
      .select("id,name,city,state,created_at")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false });

    if (listError) {
      showToast(listError.message, "error");
      setBootLoading(false);
      return;
    }

    const safeList = (list ?? []) as StoreListItem[];
    setStores(safeList);

    // padrão: se tem loja, seleciona a mais recente
    if (safeList.length > 0) {
      const defaultId = safeList[0].id;
      setActiveStoreId(defaultId);
    } else {
      setActiveStoreId("");
      resetForm();
    }

    setBootLoading(false);
  }

  async function loadActiveStoreDetails(storeId: string) {
    if (!storeId) {
      setHasCampaigns(false);
      setHasPlans(false);
      return;
    }

    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("id", storeId)
      .single();

    if (error) {
      showToast(error.message, "error");
      return;
    }

    const storeData = data as StoreRow;
    const signedLogo = await getSignedUrlAction(storeData.logo_url);
    
    fillFromStore({
      ...storeData,
      logo_url: signedLogo,
    });

    const { count: campaignsCount } = await supabase
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .eq("store_id", storeId);

    setHasCampaigns((campaignsCount ?? 0) > 0);

    const { count: plansCount } = await supabase
      .from("weekly_plans")
      .select("*", { count: "exact", head: true })
      .eq("store_id", storeId);

    setHasPlans((plansCount ?? 0) > 0);
  }

  useEffect(() => {
    loadStoresAndMaybeSelectDefault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeStoreId) return;
    loadActiveStoreDetails(activeStoreId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoreId]);

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
        showToast("Você precisa estar logado para salvar a loja.", "error");
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

      if (activeStoreId) {
        const { error: updateError } = await supabase
          .from("stores")
          .update(payload)
          .eq("id", activeStoreId);

        if (updateError) {
          showToast(updateError.message, "error");
          setSaving(false);
          return;
        }

        showToast("Alterações salvas com sucesso!", "success");
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("stores")
          .insert(payload)
          .select("id")
          .single();

        if (insertError) {
          showToast(insertError.message, "error");
          setSaving(false);
          return;
        }

        showToast("Loja cadastrada com sucesso!", "success");

        // recarrega lista e seta loja ativa
        const newId = (inserted as any)?.id as string | undefined;
        if (newId) setActiveStoreId(newId);
        await loadStoresAndMaybeSelectDefault();
      }

      // volta para o dashboard
      window.setTimeout(() => {
        router.push("/dashboard");
      }, 650);
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
        <div className="mx-auto max-w-5xl px-6 py-10">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
                Loja
                <span className="text-zinc-400">•</span>
                <span className="text-zinc-500">
                  {isEditMode ? "Configurações" : "Onboarding"}
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                {isEditMode ? "Sua loja" : "Cadastrar sua loja"}
              </h1>
              <p className="mt-1 max-w-2xl text-zinc-600">
                Isso define como o Vendeo vai falar e como suas campanhas vão “parecer”.
                Quanto mais fiel à realidade, melhor o resultado da IA.
              </p>
            </div>

            <div className="flex items-center gap-2 lg:pt-12">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                disabled={saving}
              >
                Voltar
              </button>
            </div>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Form Card */}
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-100 bg-zinc-50/70 px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">
                      Configuração da loja
                    </div>
                    <div className="mt-1 text-sm text-zinc-600">
                      Preencha o básico e refine quando quiser.
                    </div>
                  </div>

                  {stores.length > 1 && (
                    <div className="min-w-[220px]">
                      <label className="text-xs font-medium text-zinc-600">
                        Loja ativa
                      </label>
                      <select
                        className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                        value={activeStoreId}
                        onChange={(e) => setActiveStoreId(e.target.value)}
                      >
                        {stores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                            {s.city ? ` — ${s.city}` : ""}
                            {s.state ? `/${s.state}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-6">
                {bootLoading ? (
                  <MotionWrapper delay={0.2} className="grid gap-6">
                    {/* Skeleton mimicking the form structure */}
                    <div className="space-y-4">
                      <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100 sm:col-span-2" />
                        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
                        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
                        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
                      </div>
                    </div>
                  </MotionWrapper>
                ) : (
                  <form onSubmit={handleSave} className="grid gap-6">
                    {/* Informações básicas */}
                    <MotionWrapper delay={0.1} className="grid gap-3">
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
                          <label className="text-sm font-medium">Logo da loja (opcional)</label>

                          {logoErrorMsg && (
                            <div className="mb-2 rounded-lg bg-red-50 p-2 text-xs text-red-600 flex items-center justify-between">
                              <span>{logoErrorMsg}</span>
                              <button type="button" onClick={() => setLogoErrorMsg(null)}>
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          )}

                          <div
                            onClick={() => !uploadingLogo && fileInputRef.current?.click()}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            className={`relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 min-h-[140px] flex flex-col items-center justify-center p-4 
                                  ${dragOver ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100/50"}
                                  ${uploadingLogo ? "pointer-events-none opacity-80" : ""}`}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => onLogoFileSelected(e.target.files?.[0] ?? null)}
                              className="hidden"
                            />

                            {uploadingLogo ? (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                                <span className="text-xs font-medium text-zinc-600">Enviando... {uploadProgress}%</span>
                                <div className="w-32 h-1.5 bg-zinc-200 rounded-full overflow-hidden mt-1">
                                  <div
                                    className="h-full bg-emerald-600 transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                              </div>
                            ) : logoPreviewOk ? (
                              <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-sm transition-transform group-hover:scale-105">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={logoUrl.trim()}
                                  alt="Preview do Logo"
                                  className="w-full h-full object-contain p-2"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center gap-1">
                                  <Upload className="h-4 w-4" />
                                  <span className="text-[10px] font-medium leading-tight">Trocar</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-zinc-500 group-hover:text-zinc-600">
                                <div className="p-2.5 rounded-full bg-white border border-zinc-200 shadow-sm group-hover:shadow transition-all group-hover:-translate-y-0.5">
                                  <ImageIcon className="h-5 w-5 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium">Arraste a logo ou clique aqui</p>
                                  <p className="text-xs text-zinc-400 mt-1">JPG, PNG ou WEBP até 8MB</p>
                                </div>
                              </div>
                            )}

                            {logoPreviewOk && !uploadingLogo && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLogoUrl("");
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-zinc-500 hover:text-red-500 hover:bg-red-50 shadow-sm border border-zinc-100 transition-all"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="relative mt-3">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                              <div className="w-full border-t border-zinc-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                              <span className="bg-white px-2 text-zinc-400 font-medium">Ou cole a URL direto</span>
                            </div>
                          </div>

                          <input
                            className="mt-2 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 placeholder:text-zinc-400"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </MotionWrapper>

                    {/* Posicionamento */}
                    <MotionWrapper delay={0.2} className="grid gap-3">
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
                            placeholder="Ex.: entrega rápida / mais barato do bairro / seleção premium"
                          />
                          <div className="text-xs text-zinc-500">
                            Dica: isso ajuda a IA a criar argumentos “do seu jeito”.
                          </div>
                        </div>
                      </div>
                    </MotionWrapper>

                    {/* Contato */}
                    <MotionWrapper delay={0.3} className="grid gap-3">
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
                    </MotionWrapper>

                    {/* Identidade visual */}
                    <MotionWrapper delay={0.4} className="grid gap-3">
                      <div className="text-sm font-semibold">Identidade visual</div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid content-start gap-1">
                          <label className="text-sm font-medium">Cor primária</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="h-11 w-16 cursor-pointer rounded-xl border border-zinc-200 bg-white p-1"
                            />

                            <input
                              type="text"
                              value={primaryColor.toUpperCase()}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (/^#?[0-9A-Fa-f]{0,6}$/.test(v)) {
                                  const hex = v.startsWith("#") ? v : `#${v}`;
                                  setPrimaryColor(hex);
                                }
                              }}
                              className="h-11 w-28 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-mono uppercase"
                              placeholder="#000000"
                            />
                          </div>
                          <div className="min-h-[40px] text-xs leading-5 text-zinc-500">
                            Usada em botões, selos, destaque e “energia” da marca.
                          </div>
                        </div>

                        <div className="grid content-start gap-1">
                          <label className="text-sm font-medium">Cor secundária</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={secondaryColor}
                              onChange={(e) => setSecondaryColor(e.target.value)}
                              className="h-11 w-16 cursor-pointer rounded-xl border border-zinc-200 bg-white p-1"
                            />

                            <input
                              type="text"
                              value={secondaryColor.toUpperCase()}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (/^#?[0-9A-Fa-f]{0,6}$/.test(v)) {
                                  const hex = v.startsWith("#") ? v : `#${v}`;
                                  setSecondaryColor(hex);
                                }
                              }}
                              className="h-11 w-28 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-mono uppercase"
                              placeholder="#000000"
                            />
                          </div>
                          <div className="min-h-[40px] text-xs leading-5 text-zinc-500">
                            Usada em textos fortes, contornos e contraste.
                          </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 sm:col-span-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium text-zinc-900">Prévia rápida</div>
                            <div className="text-xs text-zinc-500">
                              {/*Hoje: 2 cores • Futuro: paleta expandida*/}
                            </div>
                          </div>

                          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                            <div
                              className="px-4 py-3 text-sm font-semibold text-white"
                              style={{ backgroundColor: secondaryColor }}
                            >
                              Campanha da sua loja
                            </div>

                            <div className="space-y-3 p-4">
                              <div className="space-y-1">
                                <div className="text-sm font-semibold text-zinc-900">
                                  Oferta especial da semana
                                </div>
                                <div className="text-xs text-zinc-500">
                                  Exemplo visual simples de como suas cores aparecem no Vendeo.
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                <span
                                  className="inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  Promoção
                                </span>

                                <span
                                  className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold"
                                  style={{
                                    borderColor: secondaryColor,
                                    color: secondaryColor,
                                    backgroundColor: "white",
                                  }}
                                >
                                  Destaque
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                <button
                                  type="button"
                                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  Botão primário
                                </button>

                                <button
                                  type="button"
                                  className="rounded-xl px-4 py-2 text-sm font-semibold"
                                  style={{
                                    border: `1px solid ${secondaryColor}`,
                                    color: secondaryColor,
                                    backgroundColor: "white",
                                  }}
                                >
                                  Título / Contraste
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 text-xs text-zinc-500">
                            {/*Recomendação: 2 cores bem escolhidas deixam as artes consistentes e “premium”.
                            Quando você quiser 4 cores, a gente faz via migration (sem gambiarra).*/}
                          </div>
                        </div>
                      </div>
                    </MotionWrapper>

                    <MotionWrapper delay={0.5} className="flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
                      <button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                        disabled={saving}
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-premium transition hover:bg-emerald-500 disabled:opacity-60"
                      >
                        {saving
                          ? "Salvando..."
                          : isEditMode
                            ? "Salvar alterações"
                            : "Salvar e continuar"}
                      </button>
                    </MotionWrapper>
                  </form>
                )}
              </div>
            </div>

            {/* Side help card */}
            <MotionWrapper delay={0.3} className="grid content-start gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-zinc-900">
                  O que isso melhora na prática
                </div>
                <ul className="mt-3 grid gap-2 text-sm text-zinc-600">
                  <li>• Campanhas com linguagem “do seu bairro” e do seu público.</li>
                  <li>• Melhor uso de urgência, preço e posicionamento.</li>
                  <li>• Identidade consistente: menos “cara de template”.</li>
                  <li>• Use o logo com fundo transparente (PNG) ou formato quadrado para encaixar perfeito nas campanhas.</li>
                </ul>

                <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="text-sm font-semibold text-zinc-900">Sugestão Vendeo</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    Se você tiver dúvida no “Diferencial da loja”, descreva como um cliente
                    falaria: <span className="font-medium text-zinc-800">“aqui é rápido e barato”</span>,{" "}
                    <span className="font-medium text-zinc-800">“tem as melhores bebidas geladas”</span>, etc.
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-zinc-900">
                  Próximos passos (automático)
                </div>
                <div className="mt-3 grid gap-2 text-sm text-zinc-600">
                  <div className="flex items-start gap-2">
                    <span className={`mt-1 inline-block h-2 w-2 rounded-full ${isEditMode ? "bg-emerald-500" : "bg-zinc-300"}`} />
                    <span className={isEditMode ? "text-zinc-900 font-medium" : ""}>Salvar a loja</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={`mt-1 inline-block h-2 w-2 rounded-full ${hasCampaigns ? "bg-emerald-500" : "bg-zinc-300"}`} />
                    <span className={hasCampaigns ? "text-zinc-900 font-medium" : ""}>Criar campanhas com a identidade aplicada</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={`mt-1 inline-block h-2 w-2 rounded-full ${hasPlans ? "bg-emerald-500" : "bg-zinc-300"}`} />
                    <span className={hasPlans ? "text-zinc-900 font-medium" : ""}>Gerar plano semanal com consistência</span>
                  </div>
                </div>
              </div>
            </MotionWrapper>
          </div>
        </div>
      </main>
    </>
  );
}