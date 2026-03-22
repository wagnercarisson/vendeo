import Link from "next/link";
import { Zap, CalendarClock, AlertCircle } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { 
  formatAudience, 
  formatObjective, 
  normalizeAudience, 
  normalizeObjective, 
  normalizePositioning 
} from "@/lib/formatters/strategyLabels";

export async function PendingPlanItems({
  storeId,
}: {
  storeId: string;
}) {
  const supabase = createSupabaseServerClient();

  // Buscar o primeiro plano (qualquer data) que tenha itens pendentes
  const { data: firstPlanWithPending } = await supabase
    .from("weekly_plan_items")
    .select("plan_id, weekly_plans(week_start, status)")
    .is("campaign_id", null)
    .order("id", { ascending: true }) // Garante ordem de criação/import
    .limit(1)
    .maybeSingle();

  if (!firstPlanWithPending) return null;

  const planId = firstPlanWithPending.plan_id;
  const planData = firstPlanWithPending.weekly_plans as any;
  const planWeekStart = planData?.week_start;
  const planStatus = planData?.status;

  // Buscar itens pendentes deste plano
  const { data: pendingItems } = await supabase
    .from("weekly_plan_items")
    .select("id, day_of_week, theme, recommended_time, content_type, brief")
    .eq("plan_id", planId)
    .is("campaign_id", null)
    .order("day_of_week", { ascending: true })
    .limit(3);

  if (!pendingItems || pendingItems.length === 0) return null;

  function formatWeekLabel(dateStr: string) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, (m ?? 1) - 1, d ?? 1);
    return `Semana de ${date.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' })}`;
  }

  const mapDays: Record<number, string> = {
    1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui",
    5: "Sex", 6: "Sáb", 7: "Dom",
  };

  return (
    <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50/30 p-5 shadow-soft">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <CalendarClock className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-lg font-bold text-slate-900 leading-tight">Sugestões Pendentes</div>
            <div className="rounded-lg bg-orange-100/50 px-2 py-1 text-[10px] font-bold text-orange-700 uppercase tracking-tight">
              {formatWeekLabel(planWeekStart)}
            </div>
          </div>
          <div className="mt-0.5 text-xs text-slate-600">
            Seu plano semanal tem campanhas aguardando para serem geradas.
          </div>
        </div>
      </div>

      {planStatus === "draft" && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-100/40 p-3 text-xs font-medium text-orange-900 leading-relaxed shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-orange-600" />
          <p>
            Você tem <strong>{pendingItems.length}</strong> {pendingItems.length === 1 ? "sugestão" : "sugestões"}. Aprove o plano semanal para começar a orquestrar suas campanhas.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {pendingItems.map((item) => {
          const isDraft = planStatus === "draft";
          
          return (
            <div
              key={item.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/50 bg-white/60 p-3 transition hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 px-2 text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                  {mapDays[item.day_of_week] || `Dia ${item.day_of_week}`}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900" title={item.theme || ""}>
                    {item.brief ? (
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="shrink-0">{formatObjective(item.brief.objective)}</span>
                        <span className="text-slate-300">|</span>
                        <span className="truncate font-medium text-slate-500">Público: {formatAudience(item.brief.audience)}</span>
                      </div>
                    ) : (
                      item.theme || "Estratégia sugerida"
                    )}
                  </div>
                  {item.recommended_time && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      Hora sugerida: {item.recommended_time}
                    </div>
                  )}
                </div>
              </div>

              {isDraft ? (
                <Link
                  href={`/dashboard/plans/${planId}`}
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-100 border border-orange-200 px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-200"
                >
                  Ver no Plano
                </Link>
              ) : (
                <Link
                  href={`/dashboard/campaigns/new?plan_item_id=${item.id}&theme=${encodeURIComponent(item.theme || "")}&audience=${encodeURIComponent(normalizeAudience(item.brief?.audience))}&objective=${encodeURIComponent(normalizeObjective(item.brief?.objective))}&positioning=${encodeURIComponent(normalizePositioning(item.brief?.product_positioning))}&content_type=${encodeURIComponent(item.content_type || "post")}`}
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0B2E22] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#0F3D2E]"
                >
                  <Zap className="h-3 w-3 text-orange-400" />
                  Orquestrar
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Link
          href={`/dashboard/plans/${planId}`}
          className="text-xs font-semibold text-orange-700 hover:underline"
        >
          Ver todas as pendências no plano →
        </Link>
      </div>
    </div>
  );
}
