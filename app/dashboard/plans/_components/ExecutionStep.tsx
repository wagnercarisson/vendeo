import { useState } from "react";
import { Campaign, WeeklyPlanItem } from "./types";
import { MotionWrapper } from "@/app/dashboard/_components/MotionWrapper";
import { MousePointerClick, Zap, Plus, Image as ImageIcon, CheckCircle2, RotateCw, ExternalLink } from "lucide-react";
import { ValidationPopupModal } from "./ValidationPopupModal";
import { useRouter } from "next/navigation";
import { AUDIENCE_OPTIONS, OBJECTIVE_OPTIONS, PRODUCT_POSITIONING_OPTIONS } from "@/app/dashboard/campaigns/new/_components/constants";

interface Props {
  items: WeeklyPlanItem[];
  campaignsById: Map<string, Campaign>;
  onGenerateText: (camp: Campaign, force: boolean) => Promise<void>;
  onGenerateReels: (camp: Campaign, force: boolean) => Promise<void>;
  generatingTextId: string | null;
  generatingReelsId: string | null;
}

function dayLabel(d: number) {
  const map: Record<number, string> = {
    1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta",
    5: "Sexta", 6: "Sábado", 7: "Domingo",
  };
  return map[d] ?? `Dia ${d}`;
}

export function ExecutionStep({
  items,
  campaignsById,
  onGenerateText,
  onGenerateReels,
  generatingTextId,
  generatingReelsId,
}: Props) {
  const router = useRouter();
  const sorted = items.slice().sort((a, b) => a.day_of_week - b.day_of_week);
  const [editedThemes, setEditedThemes] = useState<Record<string, string>>({});
  const [editedAudience, setEditedAudience] = useState<Record<string, string>>({});
  const [editedObjective, setEditedObjective] = useState<Record<string, string>>({});
  const [editedPositioning, setEditedPositioning] = useState<Record<string, string>>({});

  const [validatingAction, setValidatingAction] = useState<{
    item: WeeklyPlanItem;
    camp: Campaign;
    action: "text" | "reels" | "auto";
    hasText?: boolean;
    hasReels?: boolean;
  } | null>(null);

  function handleTriggerGenerate(
    item: WeeklyPlanItem,
    camp: Campaign,
    action: "text" | "reels",
    flag: boolean
  ) {
    setValidatingAction({ item, camp, action, hasText: action === "text" ? flag : undefined, hasReels: action === "reels" ? flag : undefined });
  }

  function confirmValidation() {
    if (!validatingAction) return;
    const { camp, action, hasText, hasReels } = validatingAction;
    setValidatingAction(null);
    if (action === "text") {
      onGenerateText(camp, hasText!);
    } else if (action === "reels") {
      onGenerateReels(camp, hasReels!);
    }
    // if auto, we would trigger runAutoMode(), but runAutoMode orchestrates everything, so we better validate individually or just let auto skip bad ones.
  }

  return (
    <div className="space-y-6 pb-20">
      <MotionWrapper delay={0.1}>
        <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-6 shadow-premium mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Passo 3: Execução e Geração</h2>
            <p className="text-sm text-slate-500">
              O plano está salvo! Revise as sugestões e orquestre as campanhas quando estiver pronto.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { window.location.href = "/dashboard/plans"; }}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] transition hover:bg-orange-600 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(249,115,22,0.6)]"
            >
              <CheckCircle2 className="h-4 w-4" />
              Aprovar Plano
            </button>
          </div>
        </div>
      </MotionWrapper>

      <div className="grid gap-6 lg:grid-cols-2">
        {sorted.map((it, idx) => {
          const camp = it.campaign_id ? campaignsById.get(it.campaign_id) : undefined;

          const isPost = String(it.content_type).toLowerCase() === "post";
          const isReels = String(it.content_type).toLowerCase() === "reels";

          const hasText = !!(camp?.ai_caption && String(camp.ai_caption).trim().length > 0);
          const hasReels = !!camp?.reels_generated_at;

          const isComplete = camp && camp.product_name && camp.audience && camp.objective;

          return (
            <MotionWrapper key={it.id} delay={0.1 * (idx + 1)}>
              <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft transition-all hover:shadow-premium group">
                {/* Header do Card (Dia e Tema) */}
                <div className="border-b border-black/5 bg-slate-50/50 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 items-center justify-center rounded-lg bg-[#0F3D2E] px-3 text-xs font-bold text-white uppercase tracking-wider">
                        {dayLabel(it.day_of_week)}
                      </div>
                      <div className="flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 uppercase tracking-wider shadow-sm">
                        {isPost ? "Post" : "Vídeo Curto"}
                      </div>
                    </div>
                    {it.recommended_time && (
                      <div className="text-xs font-medium text-slate-400">
                        {it.recommended_time}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                      <span>Diretriz da IA</span>
                      <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full lowercase font-medium">editável</span>
                    </div>
                    <textarea
                      className="w-full resize-none border-b border-transparent bg-transparent text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-0 leading-snug p-0 m-0 mb-3"
                      rows={2}
                      value={editedThemes[it.id] ?? it.theme}
                      onChange={(e) => setEditedThemes(prev => ({ ...prev, [it.id]: e.target.value }))}
                      placeholder="Escreva a estratégia aqui..."
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Público</label>
                        <select
                          value={editedAudience[it.id] ?? it.brief?.audience ?? ""}
                          onChange={(e) => setEditedAudience(prev => ({ ...prev, [it.id]: e.target.value }))}
                          className="w-full rounded bg-white border border-slate-200 text-xs text-slate-700 py-1 px-2 focus:border-emerald-500 outline-none"
                        >
                          <option value="" disabled>Selecione</option>
                          {AUDIENCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Objetivo</label>
                        <select
                          value={editedObjective[it.id] ?? it.brief?.objective ?? ""}
                          onChange={(e) => setEditedObjective(prev => ({ ...prev, [it.id]: e.target.value }))}
                          className="w-full rounded bg-white border border-slate-200 text-xs text-slate-700 py-1 px-2 focus:border-emerald-500 outline-none"
                        >
                          <option value="" disabled>Selecione</option>
                          {OBJECTIVE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tom/Posic.</label>
                        <select
                          value={editedPositioning[it.id] ?? it.brief?.product_positioning ?? ""}
                          onChange={(e) => setEditedPositioning(prev => ({ ...prev, [it.id]: e.target.value }))}
                          className="w-full rounded bg-white border border-slate-200 text-xs text-slate-700 py-1 px-2 focus:border-emerald-500 outline-none"
                        >
                          <option value="" disabled>Selecione</option>
                          {PRODUCT_POSITIONING_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corpo do Card: Vínculo de Campanha */}
                <div className="p-5">
                  {!camp ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:bg-slate-100 hover:border-slate-400">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100">
                        <Zap className="h-6 w-6 text-orange-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-1">Estratégia Pronta!</h3>
                      <p className="text-xs text-slate-500 mb-5 max-w-[250px] mx-auto leading-relaxed">
                        A IA já planejou o tema. Agora só falta você escolher o produto real para essa campanha ganhar vida.
                      </p>
                      <button
                        className="mx-auto flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0B2E22] px-5 text-sm font-bold text-white shadow-premium transition hover:bg-[#0F3D2E] hover:-translate-y-0.5"
                        onClick={() => {
                          const params = new URLSearchParams();
                          params.set("plan_item_id", it.id);
                          const finalTheme = editedThemes[it.id] ?? it.theme;
                          if (finalTheme) params.set("theme", finalTheme);

                          const finalAudience = editedAudience[it.id] ?? it.brief?.audience;
                          const finalObjective = editedObjective[it.id] ?? it.brief?.objective;
                          const finalPositioning = editedPositioning[it.id] ?? it.brief?.product_positioning;

                          if (finalAudience) params.set("audience", finalAudience);
                          if (finalObjective) params.set("objective", finalObjective);
                          if (finalPositioning) params.set("positioning", finalPositioning);

                          const isPost = String(it.content_type).toLowerCase() === "post";
                          const isReels = String(it.content_type).toLowerCase() === "reels";
                          params.set("generatePost", isPost ? "true" : "false");
                          params.set("generateReels", isReels ? "true" : "false");

                          router.push(`/dashboard/campaigns/new?${params.toString()}`);
                        }}
                      >
                        🚀 Orquestrar esta Campanha
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Campanha Vinculada UI */}
                      <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-emerald-600 mb-0.5">Produto Vinculado</div>
                            <div className="text-sm font-bold text-slate-900 truncate max-w-[180px]">
                              {camp.product_name || "Sem Nome"}
                            </div>
                          </div>
                        </div>
                        <button
                          className="text-xs font-medium text-slate-500 underline hover:text-slate-800"
                          onClick={() => {
                            const params = new URLSearchParams();
                            params.set("plan_item_id", it.id);
                            const finalTheme = editedThemes[it.id] ?? it.theme;
                            if (finalTheme) params.set("theme", finalTheme);

                            const finalAudience = editedAudience[it.id] ?? it.brief?.audience;
                            const finalObjective = editedObjective[it.id] ?? it.brief?.objective;
                            const finalPositioning = editedPositioning[it.id] ?? it.brief?.product_positioning;

                            if (finalAudience) params.set("audience", finalAudience);
                            if (finalObjective) params.set("objective", finalObjective);
                            if (finalPositioning) params.set("positioning", finalPositioning);

                            const isPost = String(it.content_type).toLowerCase() === "post";
                            const isReels = String(it.content_type).toLowerCase() === "reels";
                            params.set("generatePost", isPost ? "true" : "false");
                            params.set("generateReels", isReels ? "true" : "false");

                            router.push(`/dashboard/campaigns/new?${params.toString()}`);
                          }}
                        >
                          Trocar/Editar
                        </button>
                      </div>

                      {/* Status de Geração */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`flex flex-col rounded-xl border p-3 ${hasText ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-100 bg-slate-50 text-slate-500"}`}>
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Texto/Legenda</span>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">{hasText ? "Pronto ✓" : "Pendente"}</span>
                            {isComplete && (
                              <button
                                onClick={() => onGenerateText(camp, hasText)}
                                disabled={generatingTextId === camp.id}
                                className="flex h-6 w-6 items-center justify-center rounded bg-white shadow-sm transition hover:scale-105 disabled:opacity-50"
                                title={hasText ? "Regerar" : "Gerar"}
                              >
                                <MousePointerClick className="h-3.5 w-3.5 text-emerald-600" />
                              </button>
                            )}
                          </div>
                        </div>

                        {isReels && (
                          <div className={`flex flex-col rounded-xl border p-3 ${hasReels ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-100 bg-slate-50 text-slate-500"}`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Roteiro Reels</span>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold">{hasReels ? "Pronto ✓" : "Pendente"}</span>
                              {isComplete && (
                                <button
                                  onClick={() => handleTriggerGenerate(it, camp!, "reels", hasReels)}
                                  disabled={generatingReelsId === camp.id}
                                  className="flex h-6 w-6 items-center justify-center rounded bg-white shadow-sm transition hover:scale-105 disabled:opacity-50"
                                  title={hasReels ? "Regerar" : "Gerar"}
                                >
                                  <MousePointerClick className="h-3.5 w-3.5 text-emerald-600" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              </div>
            </MotionWrapper>
          );
        })}
      </div>

      {validatingAction && (
        <ValidationPopupModal
          item={validatingAction.item}
          campaign={validatingAction.camp}
          onClose={() => setValidatingAction(null)}
          onConfirm={confirmValidation}
          onUpdated={() => {
            // For a quick fix, if price is updated we just let confirming proceed
            // The main dashboard will sync later or we can force a reload.
          }}
        />
      )}
    </div>
  );
}
