"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { fetchJson } from "@/lib/http";
import { Store, Plan, WeeklyPlanItem, Campaign, WizardStep, StrategyDraftItem } from "./types";
import { WeekConfigStep } from "./WeekConfigStep";
import { StrategyReviewStep } from "./StrategyReviewStep";
import { ExecutionStep } from "./ExecutionStep";
import { PlansSkeleton } from "./PlansSkeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { MotionWrapper } from "@/app/dashboard/_components/MotionWrapper";
import { getSignedUrlAction } from "@/lib/supabase/storage-actions";
import { mapDbStoreToDomain } from "@/lib/domain/stores/mapper";

// Functions reused from page
function getWeekStartMondayISO(today = new Date()) {
  const d = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const jsDay = d.getUTCDay();
  const diffToMonday = (jsDay + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function WizardShell({ 
  initialWeekStart,
  initialPlanId,
  initialPlan,
  initialItems,
  initialCampaigns
}: { 
  initialWeekStart?: string;
  initialPlanId?: string;
  initialPlan?: Plan | null;
  initialItems?: WeeklyPlanItem[];
  initialCampaigns?: Campaign[];
}) {
  const router = useRouter();
  
  // Decisão imediata do passo inicial baseada nos dados injetados (Zero Flash)
  const getInitialStep = (): WizardStep => {
    if (!initialPlan) return 0; // Se não tem dado ainda, aguarda inicialização (Gate)
    if (initialPlan.status === "approved") return 3;
    if (initialPlan.status === "draft") return 2;
    return 1;
  };

  const [step, setStep] = useState<WizardStep>(getInitialStep());

  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  const [storeId, setStoreId] = useState<string>("");
  const [weekStart, setWeekStart] = useState<string>(initialWeekStart || getWeekStartMondayISO());
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const [loadingPlan, setLoadingPlan] = useState(!!initialPlanId && !initialPlan);
  const [plan, setPlan] = useState<Plan | null>(initialPlan || null);
  const [items, setItems] = useState<WeeklyPlanItem[]>(initialItems || []);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns || []);

  // Strategy Step State - Hidrata do initialPlan se existir
  const [strategyDraft, setStrategyDraft] = useState<StrategyDraftItem[]>(
    (initialPlan?.strategy?.items as StrategyDraftItem[]) || []
  );

  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const [approvingPlan, setApprovingPlan] = useState(false);
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);

  // Holidays
  const [holidays, setHolidays] = useState<{ date: string; name: string }[]>([]);

  useEffect(() => {
    loadStores();
    loadHolidays();
  }, []);
  
  // Removido useEffect de sincronização de initialWeekStart que forçava setStep(1)

  async function loadHolidays() {
    try {
      const year = new Date().getFullYear();
      const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
      if (res.ok) {
        const data = await res.json();
        setHolidays(data || []);
      }
    } catch (e) {
      console.error("Erro ao carregar feriados", e);
    }
  }

  async function loadStores() {
    setLoadingStores(true);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      setStores([]);
      setLoadingStores(false);
      return;
    }

    const { data, error } = await supabase
      .from("stores")
      .select("*, branches:store_branches(*)")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      const rows = (data || []).map(mapDbStoreToDomain);
      
      // Assinar logotipos em lote (V2)
      const signedRows = await Promise.all(rows.map(async s => ({
        ...s,
        logo_url: s.logo_url ? await getSignedUrlAction(s.logo_url) : null
      })));

      setStores(signedRows);
      if (signedRows.length && !storeId) setStoreId(signedRows[0].id);
    }
    setLoadingStores(false);
  }

  // Load existing plan when Week or Store changes
  useEffect(() => {
    if (storeId) {
      loadPlan();
    }
  }, [storeId, weekStart]);

  async function loadPlan() {
    // Se já temos o plano injetado, não precisamos carregar nem mostrar Skeleton
    if (initialPlan && initialPlanId === initialPlan.id) {
       setLoadingPlan(false);
       return;
    }

    setLoadingPlan(true);
    
    const query = initialPlanId
      ? `id=${encodeURIComponent(initialPlanId)}`
      : `week_start=${encodeURIComponent(weekStart)}&store_id=${encodeURIComponent(storeId)}`;

    try {
      const data = await fetchJson<{
        ok: boolean;
        plan: Plan | null;
        items: WeeklyPlanItem[];
        campaigns: Campaign[];
      }>(
        `/api/generate/weekly-plan?${query}`,
        { method: "GET" }
      );

      if (data?.ok === true) {
        setPlan(data.plan ?? null);
        setItems(data.items ?? []);
        setCampaigns(data.campaigns ?? []);
        setStrategyDraft((data.plan?.strategy?.items as StrategyDraftItem[]) || []);

        const hasItems = data.items && data.items.length > 0;
        const hasStrategy = !!data.plan?.strategy?.items && (data.plan.strategy.items as any[]).length > 0;

        if (data.plan && (hasItems || hasStrategy)) {
          if (hasItems) {
            const dbDays = data.items.map((i) => i.day_of_week);
            setSelectedDays(Array.from(new Set(dbDays)).sort((a, b) => a - b));
          } else if (hasStrategy) {
            const stratDays = (data.plan.strategy.items as any[]).map(i => i.day_of_week);
            setSelectedDays(Array.from(new Set(stratDays)).sort((a, b) => a - b));
          }
          
          console.log("[WizardShell] Plan Loaded:", { 
            id: data.plan.id, 
            status: data.plan.status, 
            hasStrategy, 
            strategyItems: data.plan.strategy?.items?.length 
          });
          
          // Sovereign Status Logic (V2): 
          // Se estamos "Retomando" (temos ID inicial), obedecemos o status do banco.
          // Se estamos "Criando Novo", ficamos no Passo 1 até o usuário gerar.
          if (initialPlanId) {
            if (data.plan.status === "approved") {
              setStep(3);
            } else if (data.plan.status === "draft") {
              setStep(2);
            }
          }
        } else {
          setPlan(null); 
          setItems([]);
          setCampaigns([]);
          // Se não há plano, garantimos Passo 1
          setStep(1);
        }
      }
    } catch (e) {
      console.error(e);
      // Fallback: Se der erro na carga, garantimos o Passo 1 para não travar no Skeleton
      setStep(1);
    } finally {
      setLoadingPlan(false);
      // Se por algum motivo o passo ainda for 0 (neutro), forçamos o Passo 1
      setStep(prev => prev === 0 ? 1 : prev);
    }
  }

  // STEP 1 -> STEP 2
  async function handleGenerateStrategy() {
    // Se já existe um plano no banco para esta semana, precisamos de confirmação para deletar
    if (plan && !showOverwriteModal) {
      setShowOverwriteModal(true);
      return;
    }

    setGeneratingPlan(true);
    setError(null);
    setShowOverwriteModal(false);

    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);

    const relevantHolidays = holidays.filter((h) => {
      const hd = new Date(h.date);
      return hd >= weekStartDate && hd <= weekEndDate;
    });

    try {
      const data = await fetchJson<{
        ok: boolean;
        strategy_summary: StrategyDraftItem[];
        plan_id?: string;
        error?: string;
        details?: string;
      }>("/api/generate/weekly-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          week_start: weekStart,
          selected_days: selectedDays,
          holidays: relevantHolidays,
          city: stores.find((s) => s.id === storeId)?.city || "",
          state: stores.find((s) => s.id === storeId)?.state || "",
        }),
      });

      if (data?.ok === false) {
        throw new Error(data?.details || data?.error || "Falha ao gerar estratégia");
      }

      if (data.ok && data.plan_id) {
        setPlan({ id: data.plan_id, status: 'draft', week_start: weekStart } as Plan);
      }

      setStrategyDraft(data.strategy_summary || []);
      setStep(2);
    } catch (e: any) {
      setError(e?.message);
      alert(e?.message);
    } finally {
      setGeneratingPlan(false);
    }
  }

  async function handleConfirmOverwrite() {
    try {
      setGeneratingPlan(true);
      // Chama a API de DELEÇÃO Física
      const res = await fetch(`/api/generate/weekly-plan?store_id=${storeId}&week_start=${weekStart}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (!data.ok) throw new Error("Falha ao limpar plano anterior.");

      // Limpa estados locais para garantir resete
      setPlan(null);
      setItems([]);
      setCampaigns([]);
      setStrategyDraft([]);
      
      // Procede com a geração normalmente
      await handleGenerateStrategy();
    } catch (e: any) {
      setError(e.message);
      setGeneratingPlan(false);
    }
  }

  // STEP 2 -> STEP 3
  async function handleGeneratePlanItems() {
    setGeneratingPlan(true);
    setError(null);

    try {
      const data = await fetchJson<{
        ok: boolean;
        plan: Plan | null;
        items: WeeklyPlanItem[];
        campaigns: Campaign[];
        error?: string;
        details?: string;
      }>("/api/generate/weekly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          week_start: weekStart,
          force: true,
          selected_days: selectedDays,
          approved_strategy: strategyDraft,
        }),
      });

      if (data?.ok === false) {
        throw new Error(data?.details || data?.error || "Falha ao gerar plano");
      }

      setPlan(data.plan ?? null);
      setItems(data.items ?? []);
      setCampaigns(data.campaigns ?? []);
      setStep(3);
    } catch (e: any) {
      setError(e?.message);
      alert(e?.message);
    } finally {
      setGeneratingPlan(false);
    }
  }

  const campaignsById = useMemo(() => {
    return Object.fromEntries(campaigns.map((c) => [c.id, c]));
  }, [campaigns]);



  async function handleApprovePlan() {
    if (!plan) return;

    try {
      setApprovingPlan(true);

      const { error: planErr } = await supabase
        .from("weekly_plans")
        .update({ status: "approved" })
        .eq("id", plan.id);

      if (planErr) throw planErr;

      const { error: itemsErr } = await supabase
        .from("weekly_plan_items")
        .update({ status: "approved" })
        .eq("plan_id", plan.id);

      if (itemsErr) throw itemsErr;

      await loadPlan();
    } catch (err: any) {
      alert(err.message || "Erro ao aprovar plano.");
    } finally {
      setApprovingPlan(false);
    }
  }

  function handleSaveAndExit() {
    router.push("/dashboard/plans");
  }

  // Skeleton Gate: Enquanto não temos o passo definido e os dados carregados, mantemos o Skeleton.
  if (loadingStores || (loadingPlan && !plan) || step === 0) {
    return <PlansSkeleton />;
  }

  return (
    <main className={`mx-auto max-w-5xl px-6 py-6 space-y-8 ${(generatingPlan || approvingPlan || loadingPlan) ? "cursor-wait" : ""}`}>
      {/* Modal de Confirmação de Sobrescrita */}
      {showOverwriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <MotionWrapper delay={0}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">Sobrescrever Plano?</h3>
              <p className="mb-6 text-sm text-slate-500 leading-relaxed">
                Já existe um plano gerado para a semana de <strong>{new Date(weekStart + "T12:00:00").toLocaleDateString('pt-BR')}</strong>. 
                Se prosseguir, todos os dados da estratégia, campanhas e itens desta semana serão **excluídos permanentemente** para dar lugar ao novo plano.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOverwriteModal(false)}
                  disabled={generatingPlan}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmOverwrite}
                  disabled={generatingPlan}
                  className="flex-1 rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
                >
                  {generatingPlan ? "Limpando..." : "Sim, Sobrescrever"}
                </button>
              </div>
            </div>
          </MotionWrapper>
        </div>
      )}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-black/5 text-slate-500 hover:text-slate-900 transition hover:-translate-x-0.5"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex flex-1 items-center gap-2">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex flex-1 items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${step === num
                  ? "bg-[#0B2E22] text-white shadow-md ring-4 ring-[#0B2E22]/20"
                  : step > num
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-400"
                  }`}
              >
                {step > num ? "✓" : num}
              </div>
              {num < 3 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded-full transition-all ${step > num ? "bg-emerald-100" : "bg-slate-100"
                    }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {step === 1 && (
        <WeekConfigStep
          stores={stores}
          storeId={storeId}
          onStoreChange={setStoreId}
          weekStart={weekStart}
          onWeekStartChange={setWeekStart}
          selectedDays={selectedDays}
          onSelectedDaysChange={setSelectedDays}
          onNext={handleGenerateStrategy}
          isGenerating={generatingPlan || loadingPlan}
          holidays={holidays}
          hasExistingPlan={!!plan}
        />
      )}

      {step === 2 && (
        <StrategyReviewStep
          strategyDraft={strategyDraft}
          onStrategyChange={setStrategyDraft}
          onBack={() => setStep(1)}
          onNext={handleGeneratePlanItems}
          isGenerating={generatingPlan}
        />
      )}

      {step === 3 && (
        <ExecutionStep
          items={items}
          campaignsById={campaignsById}
          onApprovePlan={handleApprovePlan}
          onSaveAndExit={handleSaveAndExit}
          approvingPlan={approvingPlan}
          planStatus={plan?.status}
        />
      )}
    </main>
  );
}