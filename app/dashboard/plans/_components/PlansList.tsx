"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, CalendarDays, ArrowRight, Loader2 } from "lucide-react";
import { MotionWrapper } from "@/app/dashboard/_components/MotionWrapper";
import { format, parseISO, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeeklyPlan {
  id: string;
  store_id: string;
  week_start: string;
  status: string;
  created_at: string;
}

export function PlansList({ onNewPlan }: { onNewPlan: () => void }) {
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;

        const { data: store } = await supabase
          .from("stores")
          .select("id")
          .eq("owner_user_id", auth.user.id)
          .single();

        if (!store) return;

        // User requested: ordem decrescente pela data (semana) para a qual o plano foi criado.
        // week_start is the column for the week.
        const { data } = await supabase
          .from("weekly_plans")
          .select("*")
          .eq("store_id", store.id)
          .order("week_start", { ascending: false });

        if (data) setPlans(data);
      } catch (err) {
        console.error("Erro ao buscar planos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  const groupedPlans = plans.reduce((acc, plan) => {
    const month = format(parseISO(plan.week_start), "MMMM yyyy", { locale: ptBR });
    if (!acc[month]) acc[month] = [];
    acc[month].push(plan);
    return acc;
  }, {} as Record<string, WeeklyPlan[]>);

  // Maintain chronological order of months from the sorted plans
  const months = plans.reduce((acc, plan) => {
    const month = format(parseISO(plan.week_start), "MMMM yyyy", { locale: ptBR });
    if (!acc.includes(month)) acc.push(month);
    return acc;
  }, [] as string[]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Planos Semanais
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Visualize o histórico de planos gerados ou crie um novo para organizar sua próxima semana de campanhas.
          </p>
        </div>
        <button
          onClick={onNewPlan}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B2E22] px-6 text-sm font-bold text-white shadow-premium transition-all hover:bg-[#0F3D2E] hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-4 w-4" />
          Novo Plano
        </button>
      </div>

      {/* Card de Dica */}
      <MotionWrapper delay={0.1}>
        <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm transition-all hover:shadow-md">
           <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Dica Vendeo</div>
                <p className="mt-1 text-sm leading-relaxed text-amber-900/80 font-medium">
                  Caso queira alterar algum plano já criado, você pode criar um novo plano para a mesma semana e <span className="font-bold text-amber-800">sobrescrever</span> o conteúdo existente.
                </p>
              </div>
           </div>
        </div>
      </MotionWrapper>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100">
            <CalendarDays className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-900">Nenhum plano gerado</h3>
          <p className="mb-6 max-w-md text-sm text-slate-500 px-4">
            Você ainda não gerou nenhum plano semanal. Crie seu primeiro plano para a IA sugerir estratégias de postagem pro seu negócio.
          </p>
          <button
            onClick={onNewPlan}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Começar agora
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {months.map((month) => (
            <div key={month} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
                  {month}
                </h2>
                <div className="h-px w-full bg-slate-100" />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupedPlans[month].map((plan, idx) => {
                  if (!plan.week_start || !plan.created_at) return null;

                  const startDate = parseISO(plan.week_start);
                  const endDate = addDays(startDate, 6);
                  
                  return (
                    <MotionWrapper key={plan.id} delay={idx * 0.05}>
                      <div className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-premium ${
                        plan.status === "approved" 
                          ? "border-slate-200 hover:border-emerald-200" 
                          : "border-amber-200 bg-amber-50/5 hover:border-amber-400"
                      }`}>
                        <div>
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                              <CalendarDays className="h-5 w-5" />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {plan.status === "approved" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                                  Aprovado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                                  <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                                  Rascunho
                                </span>
                              )}
                              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {format(parseISO(plan.created_at), "dd MMM")}
                              </span>
                            </div>
                          </div>
                          
                          <h3 className="mb-1 text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            Semana de {format(startDate, "dd/MM")}
                          </h3>
                          <p className="text-sm text-slate-500 mb-6">
                            {format(startDate, "dd 'de' MMMM", { locale: ptBR })} a {format(endDate, "dd 'de' MMMM", { locale: ptBR })}
                          </p>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                           <span className="text-sm font-semibold text-emerald-600">Ver plano</span>
                           <ArrowRight className="h-4 w-4 text-emerald-500 transition-transform group-hover:translate-x-1" />
                        </div>
                        
                        <a href={`/dashboard/plans/${plan.id}`} className="absolute inset-0" aria-label="Ver detalhes do plano">
                          <span className="sr-only">Ver detalhes do plano</span>
                        </a>
                      </div>
                    </MotionWrapper>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
