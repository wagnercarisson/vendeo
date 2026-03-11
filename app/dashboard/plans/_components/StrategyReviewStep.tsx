import { StrategyDraftItem } from "./types";
import { MotionWrapper } from "@/app/dashboard/_components/MotionWrapper";
import { Lightbulb, Edit3, Type } from "lucide-react";
import { AUDIENCE_OPTIONS, OBJECTIVE_OPTIONS, PRODUCT_POSITIONING_OPTIONS } from "@/app/dashboard/campaigns/new/_components/constants";

interface Props {
  strategyDraft: StrategyDraftItem[];
  onStrategyChange: (strategy: StrategyDraftItem[]) => void;
  onBack: () => void;
  onNext: () => void;
  isGenerating: boolean;
}

const WEEK_DAYS: Record<number, string> = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
  7: "Domingo"
};

export function StrategyReviewStep({ strategyDraft, onStrategyChange, onNext, onBack, isGenerating }: Props) {
  if (!strategyDraft || strategyDraft.length === 0) return null;

  const updateItem = (index: number, field: keyof StrategyDraftItem, value: string) => {
    const newDraft = [...strategyDraft];
    newDraft[index] = { ...newDraft[index], [field]: value };
    onStrategyChange(newDraft);
  };

  return (
    <div className="space-y-6">
      <MotionWrapper delay={0.1}>
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-premium">
          <div className="mb-6 flex items-center justify-between border-b border-black/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Passo 2: Foco da Semana</h2>
                <p className="text-sm text-slate-500">
                  A IA analisou sua loja, os dias da semana e a previsão do tempo. Revise as diretrizes.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-2 md:px-4">
            {strategyDraft.map((item, index) => (
              <div key={index} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-emerald-950 flex items-center gap-2">
                    {WEEK_DAYS[item.day_of_week] || `Dia ${item.day_of_week}`}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-700 font-medium">
                      {item.content_type === "reels" ? "Vídeo Curto" : "Post"}
                    </span>
                  </h3>
                </div>

                <p className="text-sm text-emerald-800 mb-6 font-medium italic">"{item.reasoning}"</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Audience */}
                  <div>
                    <label className="text-xs font-semibold text-emerald-700 mb-1.5 block">Público</label>
                    <select
                      value={item.audience}
                      onChange={(e) => updateItem(index, "audience", e.target.value)}
                      className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    >
                      {AUDIENCE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Objective */}
                  <div>
                    <label className="text-xs font-semibold text-emerald-700 mb-1.5 block">Objetivo</label>
                    <select
                      value={item.objective}
                      onChange={(e) => updateItem(index, "objective", e.target.value)}
                      className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    >
                      {OBJECTIVE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Positioning */}
                  <div>
                    <label className="text-xs font-semibold text-emerald-700 mb-1.5 block">Posicionamento</label>
                    <select
                      value={item.positioning}
                      onChange={(e) => updateItem(index, "positioning", e.target.value)}
                      className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    >
                      {PRODUCT_POSITIONING_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 mx-6 md:mx-8 flex items-center justify-between border-t border-black/5 pb-6 pt-5">
            <button
              onClick={onBack}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 transition"
            >
              ← Voltar aos dias
            </button>

            <button
              onClick={onNext}
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-xl bg-[#0B2E22] px-6 py-2.5 text-sm font-medium text-white shadow-premium transition hover:bg-[#0F3D2E] disabled:opacity-50"
            >
              {isGenerating ? "Gerando Plano..." : "Aprovar e Gerar Componentes"}
              {!isGenerating && <span>→</span>}
            </button>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
}
