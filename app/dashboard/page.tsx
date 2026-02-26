import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardActions } from "./_components/DashboardActions";
import { RecentCampaigns } from "./_components/RecentCampaigns";
import { CurrentPlanCard } from "./_components/CurrentPlanCard";
import { GettingStarted } from "./_components/GettingStarted";

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

  // Se não tem loja, manda pro fluxo atual de loja (hoje é /dashboard/store)
  if (storeErr || !store?.id) {
    redirect("/dashboard/store");
  }

  // Últimas campanhas
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id,product_name,status,created_at")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Plano atual (mais recente por week_start)
  const { data: currentPlan } = await supabase
    .from("weekly_plans")
    .select("id,week_start,status,created_at")
    .eq("store_id", store.id)
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasCampaigns = (campaigns?.length ?? 0) > 0;
  const hasPlan = !!currentPlan?.id;

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="rounded-2xl border bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-vendeo-text">
              Bom dia, {store.name} <span className="align-middle">👋</span>
            </h1>

            <p className="mt-2 text-base text-vendeo-muted">
              Sugestões para vender mais em{" "}
              <span className="text-vendeo-text/80 font-medium">
                {store.city}, {store.state}
              </span>
              .
            </p>
          </div>

          
        </div>

        <div className="mt-6 h-2 w-full rounded-full bg-gradient-to-r from-emerald-500/25 via-orange-500/15 to-transparent" />
      </div>

      {/* Ações principais */}
      <DashboardActions />

      {/* Ideias de Campanhas */}
      <div>
        <h2 className="mb-5 text-lg font-semibold tracking-tight text-vendeo-text">✨ Ideias de Campanhas</h2>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-soft transition hover:shadow-md flex flex-col">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              ⚡
            </div>
            <h3 className="font-semibold">Promoção de Fim de Semana</h3>
            <p className="mt-2 text-sm text-vendeo-muted">
              Ideal para movimentar sua loja no sábado e domingo.
            </p>
            <Link
              href="/dashboard/campaigns/new"
              className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Criar agora →
            </Link>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-soft transition hover:shadow-md flex flex-col">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              ⭐
            </div>
            <h3 className="font-semibold">Lançamento de Produto</h3>
            <p className="mt-2 text-sm text-vendeo-muted">
              Divulgue uma novidade que acabou de chegar.
            </p>
            <Link
              href="/dashboard/campaigns/new"
              className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Criar agora →
            </Link>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-soft transition hover:shadow-md flex flex-col">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              🔥
            </div>
            <h3 className="font-semibold">Oferta Relâmpago</h3>
            <p className="mt-2 text-sm text-vendeo-muted">
              Crie senso de urgência e venda rápido.
            </p>
            <Link
              href="/dashboard/campaigns/new"
              className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Criar agora →
            </Link>
          </div>
        </div>
      </div>

      {/* Últimas campanhas + Plano atual */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentCampaigns campaigns={campaigns ?? []} />
        </div>
        <div className="lg:col-span-1">
          <CurrentPlanCard plan={currentPlan ?? null} />
        </div>
      </div>

      {/* Checklist: aparece só se estiver no começo */}
      {(!hasCampaigns || !hasPlan) && (
        <GettingStarted hasCampaigns={hasCampaigns} hasPlan={hasPlan} />
      )}
    </div>
  );
}