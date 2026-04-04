"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Loader2, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MotionWrapper } from "../_components/MotionWrapper";
import { getSignedUrlAction } from "@/lib/supabase/storage-actions";
import { saveStoreAction } from "@/lib/domain/stores/actions";
import { StoreIdentityForm } from "./_components/StoreIdentityForm";
import { StoreLocationsForm } from "./_components/StoreLocationsForm";
import { StoreBranch } from "@/lib/domain/stores/types";
import { useNavigationGuard } from "@/lib/context/NavigationGuardContext";

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
  const s = v.trim();
  if (!s) return true;
  if (s.startsWith("stores/") || s.startsWith("logos/")) return true;
  try {
    const u = new URL(s);
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

function formatBRCell(value: string) {
  return formatBRPhone(value);
}

function validateUF(uf: string) {
  return UF_OPTIONS.includes(uf);
}

const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", 
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const SEGMENT_OPTIONS = [
  "Mercado / Mercearia", "Loja de bebidas", "Moda / Boutique", "Farmácia", 
  "Restaurante / Lanchonete", "Pet shop", "Materiais de construção", 
  "Salão / Estética", "Eletrônicos", "Casa & Decoração", "Academia", "Outro…",
];

const TONE_OPTIONS = [
  "Amigável", "Direto", "Promocional", "Premium", "Divertido", "Técnico", 
  "Próximo / “de bairro”", "Outro…",
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
  branches?: any[] | null;
  store_branches?: any[] | null;
};

export default function StorePage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string>("");

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");

  const [segmentChoice, setSegmentChoice] = useState("");
  const [mainSegmentCustom, setMainSegmentCustom] = useState("");
  const [toneChoice, setToneChoice] = useState("");
  const [toneCustom, setToneCustom] = useState("");
  const [brandPositioning, setBrandPositioning] = useState("");

  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logoErrorMsg, setLogoErrorMsg] = useState<string | null>(null);

  const [hasCampaigns, setHasCampaigns] = useState(false);
  const [hasPlans, setHasPlans] = useState(false);

  const [primaryColor, setPrimaryColor] = useState("#16a34a");
  const [secondaryColor, setSecondaryColor] = useState("#0f172a");

  const [activeTab, setActiveTab] = useState<"identity" | "locations">("identity");
  const [branches, setBranches] = useState<StoreBranch[]>([]);

  // Dirty state & Navigation protection
  const [savedValues, setSavedValues] = useState<any>(null);
  const { setBlocked, requestNavigation } = useNavigationGuard();

  const isEditMode = !!activeStoreId;

  const mainSegment = useMemo(() => {
    return segmentChoice === "Outro…" ? mainSegmentCustom.trim() : segmentChoice.trim();
  }, [segmentChoice, mainSegmentCustom]);

  const toneOfVoice = useMemo(() => {
    return toneChoice === "Outro…" ? toneCustom.trim() : toneChoice.trim();
  }, [toneChoice, toneCustom]);

  const isDirty = useMemo(() => {
    if (!savedValues) return false;

    const currentValues = {
      name: name.trim(),
      city: city.trim(),
      stateUf: stateUf.trim().toUpperCase(),
      main_segment: mainSegment,
      tone_of_voice: toneOfVoice,
      brand_positioning: brandPositioning.trim(),
      address: address.trim(),
      neighborhood: neighborhood.trim(),
      phone: onlyDigits(phone),
      whatsapp: onlyDigits(whatsapp),
      instagram: instagram.trim(),
      logo_url: logoUrl,
      primaryColor,
      secondaryColor,
      branches_count: branches.length,
      branches_json: JSON.stringify(branches)
    };

    return JSON.stringify(currentValues) !== JSON.stringify(savedValues);
  }, [
    savedValues, name, city, stateUf, mainSegment, toneOfVoice, brandPositioning,
    address, neighborhood, phone, whatsapp, instagram, logoUrl,
    primaryColor, secondaryColor, branches
  ]);

  useEffect(() => {
    setBlocked(isDirty);
    return () => setBlocked(false);
  }, [isDirty, setBlocked]);

  const confirmNavigationAction = (url: string) => {
    requestNavigation(url);
  };

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
      const path = `${folder}/${timestamp}_${safeName}`;

      setUploadProgress(30);

      const { error: upErr } = await supabase.storage
        .from("campaign-images")
        .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });

      if (upErr) throw new Error(upErr.message);

      setUploadProgress(80);

      const { data: pub } = supabase.storage.from("campaign-images").getPublicUrl(path);
      const publicUrl = pub?.publicUrl;
      if (!publicUrl) throw new Error("Falha ao obter URL pública da imagem.");

      setUploadProgress(100);
      const signedUrl = await getSignedUrlAction(path);
      setLogoUrl(path);
      setLogoPreviewUrl(signedUrl || publicUrl);

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
    setName(""); setCity(""); setStateUf("");
    setSegmentChoice(""); setMainSegmentCustom("");
    setToneChoice(""); setToneCustom("");
    setBrandPositioning("");
    setAddress(""); setNeighborhood(""); setPhone(""); setWhatsapp(""); setInstagram(""); setLogoUrl("");
    setPrimaryColor("#16a34a"); setSecondaryColor("#0f172a");
    setBranches([]);
  }

  function fillFromStore(s: StoreRow) {
    setName(s.name ?? "");
    setCity(s.city ?? "");
    setStateUf((s.state ?? "").toUpperCase());

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
    setSecondaryColor(s.secondary_color && isValidHexColor(s.secondary_color) ? s.secondary_color : "#0f172a");

    setBranches(s.store_branches || s.branches || []);

    setSavedValues({
      name: (s.name ?? "").trim(),
      city: (s.city ?? "").trim(),
      stateUf: (s.state ?? "").trim().toUpperCase(),
      main_segment: (s.main_segment ?? "").trim(),
      tone_of_voice: (s.tone_of_voice ?? "").trim(),
      brand_positioning: (s.brand_positioning ?? "").trim(),
      address: (s.address ?? "").trim(),
      neighborhood: (s.neighborhood ?? "").trim(),
      phone: onlyDigits(s.phone ?? ""),
      whatsapp: onlyDigits(s.whatsapp ?? ""),
      instagram: (s.instagram ?? "").trim(),
      logo_url: s.logo_url ?? "",
      primaryColor: (s.primary_color && isValidHexColor(s.primary_color)) ? s.primary_color : "#16a34a",
      secondaryColor: (s.secondary_color && isValidHexColor(s.secondary_color)) ? s.secondary_color : "#0f172a",
      branches_count: Array.isArray(s.branches) ? s.branches.length : 0,
      branches_json: JSON.stringify(Array.isArray(s.branches) ? s.branches : [])
    });
  }

  function validateForm(isMatrizOnly = false): string | null {
    const n = name.trim();
    if (n.length < 2) return "Informe o nome da loja (mínimo 2 caracteres).";
    if (!mainSegment) return "Selecione ou descreva o ramo de atividade.";
    if (!toneOfVoice) return "Selecione ou descreva o tom de voz da marca.";
    if (brandPositioning.trim().length < 10) return "Descreva o posicionamento/diferencial da loja (mínimo 10 caracteres).";

    if (segmentChoice === "Outro…" && !mainSegmentCustom.trim()) return "Digite o ramo de atividade (opção “Outro…”).";
    if (toneChoice === "Outro…" && !toneCustom.trim()) return "Digite o tom de voz (opção “Outro…”).";

    if (primaryColor && !isValidHexColor(primaryColor)) return "Cor primária inválida.";
    if (secondaryColor && !isValidHexColor(secondaryColor)) return "Cor secundária inválida.";
    if (!isValidUrlOrEmpty(logoUrl)) return "Logo URL inválida. Use http(s)://... ou deixe em branco.";

    if (!isMatrizOnly || activeTab === "locations") {
      if (!address.trim()) return "O endereço da Matriz é obrigatório.";
      if (!city.trim()) return "A cidade da Matriz é obrigatória.";
      if (!neighborhood.trim()) return "O bairro da Matriz é obrigatório.";
      if (!stateUf || !validateUF(stateUf)) return "Selecione o estado (UF) da Matriz.";
      if (!whatsapp.trim()) return "O WhatsApp da Matriz é obrigatório.";

      const w = onlyDigits(whatsapp);
      if (w && !(w.length === 10 || w.length === 11)) return "WhatsApp da Matriz deve ter 10 ou 11 dígitos.";
      if (!isValidInstagramOrEmpty(instagram)) return "Instagram inválido.";
      const p = onlyDigits(phone);
      if (p && !(p.length === 10 || p.length === 11)) return "Telefone deve ter 10 ou 11 dígitos.";
    }
    return null;
  }

  async function loadStoresAndMaybeSelectDefault() {
    setBootLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: list } = await supabase
      .from("stores")
      .select("id,name,city,state,created_at")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false });

    const safeList = (list ?? []) as StoreListItem[];
    setStores(safeList);

    if (safeList.length > 0) {
      setActiveStoreId(safeList[0].id);
    } else {
      setActiveStoreId("");
      resetForm();
    }
    setBootLoading(false);
  }

  async function loadActiveStoreDetails(storeId: string) {
    if (!storeId) return;
    const { data, error } = await supabase.from("stores").select("*, branches:store_branches(*)").eq("id", storeId).single();
    if (error) return;

    const storeData = data as StoreRow;
    const signedLogo = await getSignedUrlAction(storeData.logo_url);
    fillFromStore({ ...storeData, logo_url: storeData.logo_url ?? "" });
    setLogoPreviewUrl(signedLogo || "");

    const { count: campaignsCount } = await supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("store_id", storeId);
    setHasCampaigns((campaignsCount ?? 0) > 0);

    const { count: plansCount } = await supabase.from("weekly_plans").select("*", { count: "exact", head: true }).eq("store_id", storeId);
    setHasPlans((plansCount ?? 0) > 0);
  }

  useEffect(() => {
    loadStoresAndMaybeSelectDefault();
  }, []);

  useEffect(() => {
    if (!activeStoreId) return;
    loadActiveStoreDetails(activeStoreId);
  }, [activeStoreId]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      const isIdentityOnly = activeTab === "identity";
      const validationError = validateForm(isIdentityOnly);
      if (validationError) {
        showToast(validationError, "error");
        setSaving(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não logado.");

      const payload = {
        owner_user_id: user.id,
        name: name.trim(), city: city.trim() || null, state: stateUf.trim().toUpperCase() || null,
        logo_url: logoUrl.trim() || null,
        main_segment: mainSegment || null, brand_positioning: brandPositioning.trim() || null, tone_of_voice: toneOfVoice || null,
        address: address.trim() || null, neighborhood: neighborhood.trim() || null,
        phone: onlyDigits(phone) || null, whatsapp: onlyDigits(whatsapp) || null,
        instagram: normalizeInstagram(instagram) || null,
        primary_color: primaryColor || null, secondary_color: secondaryColor || null,
        branches: (branches || []).filter(b => b.name && b.name.trim() !== ""),
      };

      const { error: saveError } = await saveStoreAction(payload, activeStoreId);
      if (saveError) {
        showToast(saveError, "error");
        setSaving(false);
        return;
      }

      if (isIdentityOnly) {
        showToast("Identidade salva!", "success");
        setSavedValues((prev: any) => ({
          ...prev, name: name.trim(), main_segment: mainSegment, 
          tone_of_voice: toneOfVoice, brand_positioning: brandPositioning.trim(),
          primaryColor, secondaryColor, logo_url: logoUrl
        }));
        setActiveTab("locations");
        setSaving(false);
        return;
      }

      showToast("Salvo com sucesso!", "success");
      setSavedValues(null); // Permite sair
      if (!activeStoreId) await loadStoresAndMaybeSelectDefault();

      window.setTimeout(() => {
        router.refresh();
        router.push("/dashboard");
      }, 650);
    } catch (err: any) {
      showToast(err?.message ?? "Erro ao salvar.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <main className="min-h-screen bg-zinc-50 text-zinc-900">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                Loja <span className="text-zinc-400">•</span>
                <span className="text-zinc-500">{isEditMode ? "Configurações" : "Onboarding"}</span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">{isEditMode ? "Sua loja" : "Cadastrar sua loja"}</h1>
              <p className="mt-1 max-w-2xl text-zinc-600">Defina a identidade e posicionamento da sua marca.</p>
            </div>
            <div className="flex items-center gap-2 lg:pt-12">
              <button type="button" onClick={() => confirmNavigationAction("/dashboard")} className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50" disabled={saving}>Voltar</button>
            </div>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-100 bg-zinc-50/70">
                <div className="flex items-center justify-between gap-4 px-6 py-5">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">Configuração da loja</div>
                  </div>
                  {stores.length > 1 && (
                    <div className="min-w-[220px]">
                      <select className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none" value={activeStoreId} onChange={(e) => setActiveStoreId(e.target.value)}>
                        {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex border-t border-zinc-100 px-6">
                  <button type="button" onClick={() => setActiveTab("identity")} className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "identity" ? "border-emerald-500 text-emerald-600" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}>Identidade e Marca</button>
                  <button type="button" onClick={() => setActiveTab("locations")} className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "locations" ? "border-emerald-500 text-emerald-600" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}>Unidades e Contato</button>
                </div>
              </div>

              <div className="px-6 py-8">
                {bootLoading ? (
                  <div className="h-40 animate-pulse bg-slate-100 rounded-xl" />
                ) : (
                  <form onSubmit={handleSave} className="grid gap-8">
                    {activeTab === "identity" ? (
                      <StoreIdentityForm
                        name={name} setName={setName}
                        segmentChoice={segmentChoice} setSegmentChoice={setSegmentChoice}
                        mainSegmentCustom={mainSegmentCustom} setMainSegmentCustom={setMainSegmentCustom}
                        toneChoice={toneChoice} setToneChoice={setToneChoice}
                        toneCustom={toneCustom} setToneCustom={setToneCustom}
                        brandPositioning={brandPositioning} setBrandPositioning={setBrandPositioning}
                        primaryColor={primaryColor} setPrimaryColor={setPrimaryColor}
                        secondaryColor={secondaryColor} setSecondaryColor={setSecondaryColor}
                        logoPreviewUrl={logoPreviewUrl} uploadingLogo={uploadingLogo} 
                        uploadProgress={uploadProgress} logoErrorMsg={logoErrorMsg} setLogoErrorMsg={setLogoErrorMsg}
                        onLogoFileSelected={onLogoFileSelected} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                        fileInputRef={fileInputRef} dragOver={dragOver}
                        SEGMENT_OPTIONS={SEGMENT_OPTIONS} TONE_OPTIONS={TONE_OPTIONS}
                      />
                    ) : (
                      <StoreLocationsForm
                        address={address} setAddress={setAddress}
                        neighborhood={neighborhood} setNeighborhood={setNeighborhood}
                        city={city} setCity={setCity}
                        stateUf={stateUf} setStateUf={setStateUf}
                        phone={phone} setPhone={setPhone}
                        whatsapp={whatsapp} setWhatsapp={setWhatsapp}
                        instagram={instagram} setInstagram={setInstagram}
                        branches={branches} setBranches={setBranches}
                        UF_OPTIONS={UF_OPTIONS} formatBRPhone={formatBRPhone} formatBRCell={formatBRCell}
                      />
                    )}

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100">
                      <button type="button" onClick={() => confirmNavigationAction("/dashboard")} className="rounded-xl border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50" disabled={saving}>Cancelar</button>
                      <button type="submit" className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50" disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : activeTab === "identity" ? "Salvar e Continuar" : "Finalizar e Salvar"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <MotionWrapper delay={0.3} className="grid content-start gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-zinc-900">Vantagens da IA</div>
                <p className="mt-2 text-sm text-zinc-600">Com dados reais, a IA gera campanhas muito mais eficientes.</p>
              </div>
            </MotionWrapper>
          </div>
        </div>
      </main>
    </>
  );
}