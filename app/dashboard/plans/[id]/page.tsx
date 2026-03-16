"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Plan, WeeklyPlanItem, Campaign } from "../_components/types";
import { ExecutionStep } from "../_components/ExecutionStep";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function PlanDetailsPage() {
  const params = useParams();
  const planId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [items, setItems] = useState<WeeklyPlanItem[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [generatingTextId, setGeneratingTextId] = useState<string | null>(null);
  const [generatingReelsId, setGeneratingReelsId] = useState<string | null>(null);
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
    return Object.fromEntries(campaigns.map((campaign) => [campaign.id, campaign]));
  }, [campaigns]);

  async function generateTextForCampaign(itemId: string) {
    const item = items.find((entry) => entry.id === itemId);

    if (!item?.campaign_id) {
      alert("Crie ou vincule uma campanha antes de gerar texto.");
      return;
    }

    if (generatingTextId === itemId) return;

    setGeneratingTextId(itemId);

    try {
      const response = await fetch("/api/generate/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: item.campaign_id, force: false }),
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar conteúdo da campanha.");
      }

      await loadPlanData();
    } catch (err: any) {
      alert(err.message || "Erro ao gerar conteúdo.");
    } finally {
      setGeneratingTextId(null);
    }
  }

  async function generateReelsForCampaign(itemId: string) {
    const item = items.find((entry) => entry.id === itemId);

    if (!item?.campaign_id) {
      alert("Crie ou vincule uma campanha antes de gerar reels.");
      return;
    }

    if (generatingReelsId === itemId) return;

    setGeneratingReelsId(itemId);

    try {
      const response = await fetch("/api/generate/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: item.campaign_id, force: false }),
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar reels.");
      }

      await loadPlanData();
    } catch (err: any) {
      alert(err.message || "Erro ao gerar reels.");
    } finally {
      setGeneratingReelsId(null);
    }
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
            Visualizando {items.length} ideias para o plano
          </div>
        </div>
      </div>

      <ExecutionStep
        items={items}
        campaignsById={campaignsById}
        onGenerateText={generateTextForCampaign}
        onGenerateReels={generateReelsForCampaign}
        generatingTextId={generatingTextId}
        generatingReelsId={generatingReelsId}
        onApprovePlan={handleApprovePlan}
        approvingPlan={approvingPlan}
      />
    </main>
  );
}