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
import { ArrowLeft } from "lucide-react";

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
  initialPlanId 
}: { 
  initialWeekStart?: string;
  initialPlanId?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(1);

  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  const [storeId, setStoreId] = useState<string>("");
  const [weekStart, setWeekStart] = useState<string>(initialWeekStart || getWeekStartMondayISO());
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const [loadingPlan, setLoadingPlan] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [items, setItems] = useState<WeeklyPlanItem[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Strategy Step State
  const [strategyDraft, setStrategyDraft] = useState<StrategyDraftItem[]>([]);

  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const [approvingPlan, setApprovingPlan] = useState(false);

  // Holidays
  const [holidays, setHolidays] = useState<{ date: string; name: string }[]>([]);

  useEffect(() => {
    loadStores();
    loadHolidays();
  }, []);

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
      .select(
        "id, name, city, state, main_segment, brand_positioning, tone_of_voice, whatsapp, instagram, phone, primary_color, secondary_color, owner_user_id, logo_url"
      )
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      const rows = (data as Store[]) ?? [];
      setStores(rows);
      if (rows.length && !storeId) setStoreId(rows[0].id);
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
    setLoadingPlan(true);
    try {
      const data = await fetchJson<{
        ok: boolean;
        plan: Plan | null;
        items: WeeklyPlanItem[];
        campaigns: Campaign[];
      }>(
        `/api/generate/weekly-plan?week_start=${encodeURIComponent(
          weekStart
        )}&store_id=${encodeURIComponent(storeId)}`,
        { method: "GET" }
      );

      if (data?.ok === true) {
        setPlan(data.plan ?? null);
        setItems(data.items ?? []);
        setCampaigns(data.campaigns ?? []);
        setStrategyDraft((data.plan?.strategy?.items as StrategyDraftItem[]) || []);

        if (data.plan && data.items && data.items.length > 0) {
          const dbDays = data.items.map((i) => i.day_of_week);
          setSelectedDays(Array.from(new Set(dbDays)).sort((a, b) => a - b));
          
          // Smart Step Selection: Se for rascunho e já tiver itens, pula para o Passo 2
          if (data.plan.status === "draft") {
            setStep(2);
          }
        } else {
          setPlan(null);
          setItems([]);
          setCampaigns([]);
          setStep(1); // Garante que volta ao passo 1 se não houver plano
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlan(false);
    }
  }

  // STEP 1 -> STEP 2
  async function handleGenerateStrategy() {
    setGeneratingPlan(true);
    setError(null);

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

      setStrategyDraft(data.strategy_summary || []);
      setStep(2);
    } catch (e: any) {
      setError(e?.message);
      alert(e?.message);
    } finally {
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
      await loadPlan();
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

  if (loadingStores) {
    return <PlansSkeleton />;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-6 space-y-8">
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
          hasExistingPlan={!!plan && items.length > 0}
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