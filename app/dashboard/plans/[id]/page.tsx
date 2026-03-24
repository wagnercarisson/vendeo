"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Plan, WeeklyPlanItem, Campaign } from "../_components/types";
import { ExecutionStep } from "../_components/ExecutionStep";
import { WizardShell } from "../_components/WizardShell";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function PlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [items, setItems] = useState<WeeklyPlanItem[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [approvingPlan, setApprovingPlan] = useState(false);

  useEffect(() => {
    if (planId) {
      loadPlanData();
    }
  }, [planId]);

  async function loadPlanData() {
    setLoading(true);
    setError(null);

    try {
      const { data: planData, error: planErr } = await supabase
        .from("weekly_plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (planErr || !planData) {
        throw new Error("Plano não encontrado.");
      }

      setPlan(planData as Plan);

      const { data: itemsData, error: itemsErr } = await supabase
        .from("weekly_plan_items")
        .select("*")
        .eq("plan_id", planId);

      if (itemsErr) {
        throw new Error("Erro ao carregar itens do plano.");
      }

      const normalizedItems = (itemsData || []) as WeeklyPlanItem[];
      setItems(normalizedItems);

      const campaignIds = normalizedItems
        .map((item) => item.campaign_id)
        .filter(Boolean) as string[];

      if (campaignIds.length > 0) {
        const { data: campaignsData, error: campaignsErr } = await supabase
          .from("campaigns")
          .select("*")
          .in("id", campaignIds);

        if (campaignsErr) {
          throw new Error("Erro ao carregar campanhas.");
        }

        setCampaigns((campaignsData || []) as Campaign[]);
      } else {
        setCampaigns([]);
      }
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao carregar plano.");
    } finally {
      setLoading(false);
    }
  }

  const campaignsById = useMemo(() => {
    return Object.fromEntries(
      campaigns.map((campaign) => [
        campaign.id,
        {
          id: campaign.id,
          product_name: campaign.product_name ?? "Campanha sem nome",
          status: campaign.status ?? null,
          audience: campaign.audience ?? null,
          objective: campaign.objective ?? null,
          product_positioning: campaign.product_positioning ?? null,
          origin: campaign.origin ?? "manual",
        },
      ])
    );
  }, [campaigns]);



  function handleSaveAndExit() {
    router.push("/dashboard/plans");
  }

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

      await loadPlanData();
    } catch (err: any) {
      alert(err.message || "Erro ao aprovar plano.");
    } finally {
      setApprovingPlan(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex h-screen max-w-5xl flex-col items-center px-6 py-6 pt-[15vh] text-slate-400">
        <Loader2 className="mb-4 h-10 w-10 animate-spin" />
        <p>Carregando plano...</p>
      </main>
    );
  }

  if (error || !plan) {
    return (
      <main className="mx-auto flex h-screen max-w-5xl flex-col items-center px-6 py-6 pt-[15vh] text-slate-500">
        <div className="mb-4">Plano não encontrado ou erro de acesso.</div>
        <Link href="/dashboard/plans" className="font-bold text-emerald-600 underline">
          Voltar para Planos Semanais
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/plans"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 bg-white text-slate-500 shadow-sm transition hover:-translate-x-0.5 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex flex-1 items-center gap-2">
          <div className="text-sm font-semibold uppercase tracking-wider text-slate-600">
            {plan.status === "draft" ? "Editando Rascunho do Plano" : "Plano de Campanha"}
          </div>
        </div>
      </div>

      <WizardShell 
        initialPlanId={plan.id} 
        initialWeekStart={plan.week_start} 
        initialPlan={plan}
        initialItems={items}
        initialCampaigns={campaigns}
      />
    </main>
  );
}