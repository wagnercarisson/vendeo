import { useState } from "react";
import { WeeklyPlanItem } from "./types";
import { X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  item: WeeklyPlanItem;
  storeId: string;
  onClose: () => void;
  onLinked: () => void;
}

export function LinkCampaignModal({ item, onClose }: Props) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  function handleCreateFromPlan() {
    setIsRedirecting(true);

    const params = new URLSearchParams({
      plan_item_id: item.id,
      day_of_week: String(item.day_of_week),
      content_type: item.content_type,
      theme: item.theme ?? "",
      audience: item.brief?.audience ?? "",
      objective: item.brief?.objective ?? "",
      positioning: item.brief?.product_positioning ?? "",
      reasoning: item.brief?.angle ?? "",
    });

    if (item.target_content_type) {
      params.set("type", item.target_content_type);
    }

    router.push(`/dashboard/campaigns/new?${params.toString()}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex h-auto w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between border-b bg-slate-50 p-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Criar campanha a partir do plano
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Sugestão da IA: {item.theme || "Item do plano semanal"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-900">
              No beta, cada item do plano gera sua própria campanha.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-emerald-800">
              Para manter consistência estratégica, campanhas existentes não podem ser vinculadas ao plano.
              Crie uma nova campanha derivada deste item.
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm">
              <span className="font-semibold text-slate-900">Tipo:</span>{" "}
              <span className="text-slate-600">
                {item.content_type === "reels" ? "Reels" : "Post"}
              </span>
            </div>

            {item.brief?.audience ? (
              <div className="text-sm">
                <span className="font-semibold text-slate-900">Público:</span>{" "}
                <span className="text-slate-600">{item.brief.audience}</span>
              </div>
            ) : null}

            {item.brief?.objective ? (
              <div className="text-sm">
                <span className="font-semibold text-slate-900">Objetivo:</span>{" "}
                <span className="text-slate-600">{item.brief.objective}</span>
              </div>
            ) : null}

            {item.brief?.product_positioning ? (
              <div className="text-sm">
                <span className="font-semibold text-slate-900">Posicionamento:</span>{" "}
                <span className="text-slate-600">{item.brief.product_positioning}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end border-t bg-slate-50 p-5">
          <button
            onClick={handleCreateFromPlan}
            disabled={isRedirecting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B2E22] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0F3D2E] disabled:opacity-50"
          >
            {isRedirecting ? "Redirecionando..." : "Criar campanha"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}