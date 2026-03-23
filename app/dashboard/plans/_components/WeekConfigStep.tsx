import { Store } from "./types";
import { MotionWrapper } from "@/app/dashboard/_components/MotionWrapper";
import { CalendarRange, Sparkles, Building2, AlertCircle } from "lucide-react";
import { useMemo, useEffect } from "react";

interface Props {
  stores: Store[];
  storeId: string;
  onStoreChange: (id: string) => void;
  weekStart: string;
  onWeekStartChange: (date: string) => void;
  selectedDays: number[];
  onSelectedDaysChange: (days: number[]) => void;
  onNext: () => void;
  isGenerating: boolean;
  holidays: { date: string; name: string }[];
  hasExistingPlan?: boolean;
}

const DAYS = [
  { id: 1, label: "Segunda", short: "Seg" },
  { id: 2, label: "Terça", short: "Ter" },
  { id: 3, label: "Quarta", short: "Qua" },
  { id: 4, label: "Quinta", short: "Qui" },
  { id: 5, label: "Sexta", short: "Sex" },
  { id: 6, label: "Sábado", short: "Sáb" },
  { id: 7, label: "Domingo", short: "Dom" },
];

export function WeekConfigStep({
  stores,
  storeId,
  onStoreChange,
  weekStart,
  onWeekStartChange,
  selectedDays,
  onSelectedDaysChange,
  onNext,
  isGenerating,
  holidays,
  hasExistingPlan,
}: Props) {
  const { todayMondayISO, todayDayId } = useMemo(() => {
    const d = new Date();
    const jsDay = d.getDay();
    const diff = (jsDay + 6) % 7;
    
    const dayId = diff + 1;
    
    const monday = new Date(d);
    monday.setDate(d.getDate() - diff);
    
    // Format YYYY-MM-DD in local time
    const y = monday.getFullYear();
    const m = String(monday.getMonth() + 1).padStart(2, '0');
    const day = String(monday.getDate()).padStart(2, '0');
    
    return {
      todayMondayISO: `${y}-${m}-${day}`,
      todayDayId: dayId
    };
  }, []);

  const isCurrentWeek = weekStart === todayMondayISO;

  // Limpa dias passados se o usuário voltar para a semana atual
  useEffect(() => {
    if (isCurrentWeek) {
      const validSelectedDays = selectedDays.filter(dayId => dayId >= todayDayId);
      if (validSelectedDays.length !== selectedDays.length) {
        onSelectedDaysChange(validSelectedDays);
      }
    }
  }, [isCurrentWeek, weekStart, todayDayId, selectedDays, onSelectedDaysChange]);

  const toggleDay = (dayId: number) => {
    if (isCurrentWeek && dayId < todayDayId) return;

    if (selectedDays.includes(dayId)) {
      onSelectedDaysChange(selectedDays.filter((d) => d !== dayId));
    } else {
      onSelectedDaysChange([...selectedDays, dayId].sort((a, b) => a - b));
    }
  };

  const handleSuggestDays = () => {
    let suggested = [2, 4, 6]; // Ter, Qui, Sáb
    
    if (isCurrentWeek) {
      suggested = suggested.filter(d => d >= todayDayId);
      // Se a sugestão padrão sumiu (ex: já é domingo), sugere hoje ou amanhã se possível
      if (suggested.length === 0 && todayDayId <= 7) {
        suggested = [todayDayId];
      }
    }
    
    onSelectedDaysChange(suggested);
  };

  const selectedStore = stores.find((s) => s.id === storeId);

  return (
    <div className="space-y-6">
      <MotionWrapper delay={0.1}>
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-premium">
          <div className="mb-6 flex items-center gap-3 border-b border-black/5 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <CalendarRange className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Passo 1: Configuração</h2>
              <p className="text-sm text-slate-500">
                Verifique os dados da sua loja, selecione a semana e os dias que deseja publicar.
              </p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Esquerda: Loja e Semana */}
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Resumo da Loja
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  {selectedStore ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{selectedStore.name}</p>
                        <p className="text-sm text-slate-500">
                           {selectedStore.city ?? "—"}/{selectedStore.state ?? "—"} • <span className="text-slate-700 font-medium">{selectedStore.main_segment || "Segmento não informado"}</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Nenhuma loja selecionada.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Semana (Início)
                </label>
                <input
                  type="date"
                  min={todayMondayISO}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  value={weekStart}
                  onChange={(e) => onWeekStartChange(e.target.value)}
                />
                <p className="mt-2 text-xs text-slate-500">
                  Use sempre uma segunda-feira como início.
                </p>
              </div>
            </div>

            {/* Direita: Dias da Semana */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-900">
                  Frequência de Postagem
                </label>
                <button
                  onClick={handleSuggestDays}
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  title="Sugerir melhores dias baseado no seu segmento"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Sugerir melhores dias
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {DAYS.map((day) => {
                  const isSelected = selectedDays.includes(day.id);
                  
                  // Helper to determine the actual date of this day within the selected week
                  let isHoliday = false;
                  let holidayName = "";
                  
                  if (weekStart) {
                     const weekStartDate = new Date(weekStart);
                     const offset = day.id - 1; // 1 (Mon) -> 0 offset
                     
                     // Create a new date object for the specific day of the week
                     const currentDayDate = new Date(weekStartDate);
                     currentDayDate.setUTCDate(currentDayDate.getUTCDate() + offset);
                     
                     const yyyy = currentDayDate.getUTCFullYear();
                     const mm = String(currentDayDate.getUTCMonth() + 1).padStart(2, "0");
                     const dd = String(currentDayDate.getUTCDate()).padStart(2, "0");
                     const dateString = `${yyyy}-${mm}-${dd}`;
                     
                     const foundHoliday = holidays.find(h => h.date === dateString);
                     if (foundHoliday) {
                        isHoliday = true;
                        holidayName = foundHoliday.name;
                     }
                  }

                  const isPast = isCurrentWeek && day.id < todayDayId;

                  return (
                    <div key={day.id} className="relative flex flex-col items-center group">
                      <button
                        onClick={() => toggleDay(day.id)}
                        disabled={isPast}
                        className={`flex h-[60px] w-full flex-col items-center justify-center rounded-xl border text-xs font-semibold transition-all relative overflow-hidden ${
                          isPast
                            ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed opacity-60"
                            : isSelected
                              ? isHoliday 
                                 ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                                 : "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                              : isHoliday
                                 ? "border-orange-200 bg-white text-orange-600 hover:border-orange-300 hover:bg-orange-50/50"
                                 : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                         {day.short}
                         {isHoliday && (
                            <div className={`mt-0.5 text-[9px] px-1.5 py-0.5 rounded-full ${isSelected ? "bg-orange-200 text-orange-800" : "bg-orange-100 text-orange-600"}`}>
                               Feriado
                            </div>
                         )}
                      </button>
                      
                      {/* Tooltip for Holiday Name */}
                      {isHoliday && (
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow whitespace-nowrap">
                               {holidayName}
                            </div>
                            <div className="w-2 h-2 bg-slate-800 rotate-45 mx-auto -mt-1"></div>
                         </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                Selecione os dias em que deseja que a IA produza conteúdo. Evite selecionar todos os dias se não tiver capacidade de postagem diária.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-end gap-3 border-t border-black/5 pt-5">
            {hasExistingPlan && (
              <div className="flex w-full items-center gap-2 rounded-lg bg-orange-50 px-4 py-3 text-sm text-orange-800 border border-orange-100 mb-2">
                <AlertCircle className="h-5 w-5 shrink-0 text-orange-500" />
                <p>
                  <strong>Atenção:</strong> Você já gerou um plano para esta semana! Ao clicar em Gerar Estratégia, você estará ignorando o plano anterior. Se quiser acessar o plano existente para orquestrá-lo, volte para <a href="/dashboard/plans" className="underline font-bold">Planos Semanais</a>.
                </p>
              </div>
            )}
            
            <button
              onClick={onNext}
              disabled={!storeId || selectedDays.length === 0 || isGenerating}
              className="flex items-center gap-2 rounded-xl bg-[#0B2E22] px-6 py-2.5 text-sm font-medium text-white shadow-premium transition hover:bg-[#0F3D2E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? "Processando..." : "Gerar Estratégia"}
              {!isGenerating && <span>→</span>}
            </button>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
}
