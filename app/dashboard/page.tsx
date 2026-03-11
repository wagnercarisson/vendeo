import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardActions } from "./_components/DashboardActions";
import { RecentCampaigns } from "./_components/RecentCampaigns";
import { CurrentPlanCard } from "./_components/CurrentPlanCard";
import { GettingStarted } from "./_components/GettingStarted";
import { MetricsRow } from "./_components/MetricsRow";
import { DashboardHero } from "./_components/DashboardHero";
import { ContentCalendar } from "./_components/ContentCalendar";
import { ActivityFeed } from "./_components/ActivityFeed";
import { AISuggestionCard } from "./_components/AISuggestionCard";
import { InspiredIdeas } from "./_components/InspiredIdeas";
import { PendingPlanItems } from "./_components/PendingPlanItems";
import { Suspense } from "react";
import {
  ContentCalendarSkeleton,
  AISuggestionCardSkeleton,
  ActivityFeedSkeleton,
} from "./_components/DashboardSkeletons";
import { MotionWrapper } from "./_components/MotionWrapper";

// ... (getGreetingBrazil and getStartOfWeekBrazilISO remain the same)
function getGreetingBrazil() {
  const now = new Date();

  const hour = new Intl.DateTimeFormat("pt-BR", {
    hour: "numeric",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  }).format(now);

  const h = Number(hour);

  if (h >= 5 && h <= 11) return "Bom dia";
  if (h >= 12 && h <= 17) return "Boa tarde";
  return "Boa noite";
}

function getStartOfWeekBrazilISO() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";

  const weekdayShort = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
  }).format(now);

  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const dow = map[weekdayShort] ?? 0;
  const offsetToMonday = (dow + 6) % 7;

  const base = new Date(`${y}-${m}-${d}T12:00:00-03:00`);
  base.setDate(base.getDate() - offsetToMonday);

  const start = new Date(
    `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(
      base.getDate()
    ).padStart(2, "0")}T00:00:00-03:00`
  );

  return start.toISOString();
}

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  // 1 usuário = 1 loja (por enquanto): pega a primeira loja do owner
  const { data: store, error: storeErr } = await supabase
    .from("stores")
    .select("id,name,city,state,main_segment,tone_of_voice")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (storeErr || !store?.id) {
    redirect("/dashboard/store");
  }

  // Campanhas recentes (lista)
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id,product_name,status,created_at")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Plano recente (para o card de planos recentes)
  const { data: currentPlan } = await supabase
    .from("weekly_plans")
    .select("id,week_start,status,created_at")
    .eq("store_id", store.id)
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  // =========================
  // MÉTRICAS (últimos 30 dias)
  // =========================
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);
  const since30Iso = since30.toISOString();
  const startOfWeekIso = getStartOfWeekBrazilISO();

  const [
    { count: campaignsWeek },
    { count: campaigns30 },
    { count: ai30 },
    { count: reels30 },
  ] = await Promise.all([
    supabase
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store.id)
      .gte("created_at", startOfWeekIso),

    supabase
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store.id)
      .gte("created_at", since30Iso),

    supabase
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store.id)
      .not("ai_generated_at", "is", null)
      .gte("ai_generated_at", since30Iso),

    supabase
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store.id)
      .not("reels_generated_at", "is", null)
      .gte("reels_generated_at", since30Iso),
  ]);

  const hasCampaigns = (campaigns?.length ?? 0) > 0;
  const hasPlan = !!currentPlan?.id;
  const greeting = getGreetingBrazil();

  return (
    <div className="space-y-7">
      <div className="rounded-3xl bg-slate-50/60 p-3 md:p-4">
        <div className="space-y-7">
          <MotionWrapper delay={0}>
            <DashboardHero
              greeting={greeting}
              storeName={store.name}
              city={store.city}
              state={store.state}
            />
          </MotionWrapper>

          {/* MÉTRICAS */}
          <MotionWrapper delay={0.1}>
            <MetricsRow
              campaignsWeek={campaignsWeek ?? 0}
              campaigns30={campaigns30 ?? 0}
              ai30={ai30 ?? 0}
              reels30={reels30 ?? 0}
              hasPlan={hasPlan}
            />
          </MotionWrapper>

          {/* Calendário da Semana */}
          <MotionWrapper delay={0.2}>
            <Suspense fallback={<ContentCalendarSkeleton />}>
              <ContentCalendar storeId={store.id} />
            </Suspense>
          </MotionWrapper>

          {/* Seção Principal de Conteúdo */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <MotionWrapper delay={0.3} className="lg:col-span-2 space-y-6">
              <Suspense fallback={<div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />}>
                <PendingPlanItems storeId={store.id} />
              </Suspense>

              <RecentCampaigns
                title="Campanhas recentes"
                viewAllLabel="Visualizar todas"
                campaigns={campaigns ?? []}
              />
              
              <Suspense fallback={<AISuggestionCardSkeleton />}>
                <AISuggestionCard storeName={store.name} city={store.city} />
              </Suspense>
            </MotionWrapper>

            <MotionWrapper delay={0.4} className="lg:col-span-1 space-y-6">
              <CurrentPlanCard
                title="Plano ativo"
                viewAllLabel="Visualizar todos"
                plan={currentPlan ?? null}
              />
              
              <Suspense fallback={<ActivityFeedSkeleton />}>
                <ActivityFeed storeId={store.id} />
              </Suspense>
            </MotionWrapper>
          </div>

          {/* Checklist para novos usuários */}
          {(!hasCampaigns || !hasPlan) && (
            <MotionWrapper delay={0.5}>
              <GettingStarted hasCampaigns={hasCampaigns} hasPlan={hasPlan} />
            </MotionWrapper>
          )}

          {/* Rodapé com Ideias Personalizadas */}
          <MotionWrapper delay={hasCampaigns && hasPlan ? 0.5 : 0.6}>
            <InspiredIdeas segment={store.main_segment} />
          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}