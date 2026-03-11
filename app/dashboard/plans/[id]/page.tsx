"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Plan, WeeklyPlanItem, Campaign } from "../_components/types";
import { ExecutionStep } from "../_components/ExecutionStep";
import { PlansSkeleton } from "../_components/PlansSkeleton";
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

  useEffect(() => {
    if (planId) {
      loadPlanData();
    }
  }, [planId]);

  async function loadPlanData() {
    setLoading(true);
    setError(null);
    try {
      // 1. Load Plan
      const { data: planData, error: planErr } = await supabase
        .from("weekly_plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (planErr || !planData) throw new Error("Plano não encontrado.");
      setPlan(planData as Plan);

      // 2. Load Items
      const { data: itemsData, error: itemsErr } = await supabase
        .from("weekly_plan_items")
        .select("*")
        .eq("plan_id", planId);

      if (itemsErr) throw new Error("Erro ao carregar itens do plano.");
      setItems((itemsData || []) as WeeklyPlanItem[]);

      // 3. Load Campaigns
      const campaignIds = (itemsData || [])
        .map((i) => i.campaign_id)
        .filter(Boolean) as string[];

      if (campaignIds.length > 0) {
        const { data: campaignsData, error: campaignsErr } = await supabase
          .from("campaigns")
          .select("*")
          .in("id", campaignIds);

        if (campaignsErr) throw new Error("Erro ao carregar campanhas.");
        setCampaigns((campaignsData || []) as Campaign[]);
      } else {
        setCampaigns([]);
      }
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao carregar formato.");
    } finally {
      setLoading(false);
    }
  }

  const campaignsById = useMemo(() => {
    const m = new Map<string, Campaign>();
    for (const c of campaigns) m.set(c.id, c);
    return m;
  }, [campaigns]);

  // Generation Handlers
  async function generateTextForCampaign(camp: Campaign, force = false) {
    if (generatingTextId === camp.id) return;
    setGeneratingTextId(camp.id);
    try {
      await fetch("/api/generate/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: camp.id, force }),
      });
      await loadPlanData(); // reload state after generation
    } finally {
      setGeneratingTextId(null);
    }
  }

  async function generateReelsForCampaign(camp: Campaign, force = false) {
    if (generatingReelsId === camp.id) return;
    setGeneratingReelsId(camp.id);
    try {
      await fetch("/api/generate/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: camp.id, force }),
      });
      await loadPlanData();
    } finally {
      setGeneratingReelsId(null);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-6 h-screen flex flex-col pt-[15vh] items-center text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p>Carregando plano...</p>
      </main>
    );
  }

  if (error || !plan) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-6 h-screen flex flex-col pt-[15vh] items-center text-slate-500">
        <div className="mb-4">Plano não encontrado ou erro de acesso.</div>
        <Link href="/dashboard/plans" className="text-emerald-600 font-bold underline">
          Voltar para Planos Semanais
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/plans"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-black/5 text-slate-500 hover:text-slate-900 transition hover:-translate-x-0.5"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex flex-1 items-center gap-2">
          <div className="text-slate-600 text-sm font-semibold uppercase tracking-wider">
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
      />
    </main>
  );
}
