import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardActions } from "./_components/DashboardActions";
import { RecentCampaigns } from "./_components/RecentCampaigns";
import { CurrentPlanCard } from "./_components/CurrentPlanCard";
import { GettingStarted } from "./_components/GettingStarted";
import { MetricsRow } from "./_components/MetricsRow";
import { DashboardHero } from "./_components/DashboardHero";

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
          <DashboardHero
            greeting={greeting}
            storeName={store.name}
            city={store.city}
            state={store.state}
          />

          {/* MÉTRICAS */}
          <MetricsRow
            campaignsWeek={campaignsWeek ?? 0}
            campaigns30={campaigns30 ?? 0}
            ai30={ai30 ?? 0}
            reels30={reels30 ?? 0}
            hasPlan={hasPlan}
          />

          {/* Campanhas recentes + Planos recentes (logo após métricas) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentCampaigns
                title="Campanhas recentes"
                viewAllLabel="Visualizar todas"
                campaigns={campaigns ?? []}
              />
            </div>

            <div className="lg:col-span-1">
              <CurrentPlanCard
                title="Planos recentes"
                viewAllLabel="Visualizar todos"
                plan={currentPlan ?? null}
              />
            </div>
          </div>

          {/* Ações principais */}
          <DashboardActions />

          {/* Ideias de Campanhas */}
          <div>
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-vendeo-text">
              ✨ Ideias de Campanhas
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border bg-white p-6 shadow-soft transition-all hover:shadow-md hover:-translate-y-[1px] flex flex-col">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  ⚡
                </div>
                <h3 className="font-semibold text-vendeo-text">
                  Promoção de Fim de Semana
                </h3>
                <p className="mt-2 text-sm text-vendeo-muted">
                  Ideal para movimentar sua loja no sábado e domingo.
                </p>
                <Link
                  href="/dashboard/campaigns/new"
                  className="mt-4 inline-flex items-center text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  Criar agora <span className="ml-1">→</span>
                </Link>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-soft transition-all hover:shadow-md hover:-translate-y-[1px] flex flex-col">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  ⭐
                </div>
                <h3 className="font-semibold text-vendeo-text">
                  Lançamento de Produto
                </h3>
                <p className="mt-2 text-sm text-vendeo-muted">
                  Divulgue uma novidade que acabou de chegar.
                </p>
                <Link
                  href="/dashboard/campaigns/new"
                  className="mt-4 inline-flex items-center text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  Criar agora <span className="ml-1">→</span>
                </Link>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-soft transition-all hover:shadow-md hover:-translate-y-[1px] flex flex-col">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  🔥
                </div>
                <h3 className="font-semibold text-vendeo-text">Oferta Relâmpago</h3>
                <p className="mt-2 text-sm text-vendeo-muted">
                  Crie senso de urgência e venda rápido.
                </p>
                <Link
                  href="/dashboard/campaigns/new"
                  className="mt-4 inline-flex items-center text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  Criar agora <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Checklist: aparece só se estiver no começo */}
          {(!hasCampaigns || !hasPlan) && (
            <GettingStarted hasCampaigns={hasCampaigns} hasPlan={hasPlan} />
          )}
        </div>
      </div>
    </div>
  );
}