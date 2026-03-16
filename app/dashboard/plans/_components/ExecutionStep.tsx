"use client";

import { useMemo } from "react";
import { CheckCircle2, Sparkles, Video, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { WeeklyPlanItem } from "@/lib/domain/weekly-plans/types";

type CampaignSummary = {
  id: string;
  product_name: string;
  status: string | null;
};

type Props = {
  items: WeeklyPlanItem[];
  campaignsById: Record<string, CampaignSummary>;
  onGenerateText: (itemId: string) => Promise<void>;
  onGenerateReels: (itemId: string) => Promise<void>;
  generatingTextId?: string | null;
  generatingReelsId?: string | null;
  onApprovePlan: () => Promise<void>;
  approvingPlan?: boolean;
};

function getDayLabel(day: number) {
  const labels: Record<number, string> = {
    1: "Segunda",
    2: "Terça",
    3: "Quarta",
    4: "Quinta",
    5: "Sexta",
    6: "Sábado",
    0: "Domingo",
    7: "Domingo",
  };

  return labels[day] ?? `Dia ${day}`;
}

function getItemStatusBadge(item: WeeklyPlanItem, campaign?: CampaignSummary) {
  if (item.status === "approved") {
    return {
      label: "Aprovado",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (item.status === "ready" || item.campaign_id || campaign) {
    return {
      label: "Campanha vinculada",
      className:
        "border-sky-200 bg-sky-50 text-sky-700",
    };
  }

  return {
    label: "Pendente",
    className:
      "border-zinc-200 bg-zinc-50 text-zinc-700",
  };
}

export function ExecutionStep({
  items,
  campaignsById,
  onGenerateText,
  onGenerateReels,
  generatingTextId,
  generatingReelsId,
  onApprovePlan,
  approvingPlan = false,
}: Props) {
  const router = useRouter();

  const orderedItems = useMemo(() => {
    return [...items].sort((a, b) => a.day_of_week - b.day_of_week);
  }, [items]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">
            Execução do Plano
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Gere campanhas, acompanhe os itens e feche o plano quando tudo estiver pronto.
          </p>
        </div>

        <button
          type="button"
          onClick={onApprovePlan}
          disabled={approvingPlan}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {approvingPlan ? "Aprovando..." : "Aprovar Plano"}
        </button>
      </div>

      <div className="grid gap-4">
        {orderedItems.map((item) => {
          const campaign = item.campaign_id ? campaignsById[item.campaign_id] : undefined;
          const badge = getItemStatusBadge(item, campaign);

          const params = new URLSearchParams({
            plan_item_id: item.id,
            day_of_week: String(item.day_of_week),
            content_type: item.content_type,
            theme: item.theme ?? "",
            audience: item.brief?.audience ?? "",
            objective: item.brief?.objective ?? "",
            product_positioning: item.brief?.product_positioning ?? "",
            reasoning: item.brief?.angle ?? "",
          });

          return (
            <article
              key={item.id}
              className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">
                      {getDayLabel(item.day_of_week)}
                    </span>

                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
                      {item.content_type === "reels" ? "Reels" : "Post"}
                    </span>

                    {item.recommended_time ? (
                      <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
                        {item.recommended_time}
                      </span>
                    ) : null}

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-zinc-900">
                      {item.theme || "Item do plano semanal"}
                    </h3>

                    {item.brief ? (
                      <div className="mt-2 space-y-1 text-sm text-zinc-600">
                        {item.brief.audience ? (
                          <p>
                            <span className="font-medium text-zinc-800">Público:</span>{" "}
                            {item.brief.audience}
                          </p>
                        ) : null}

                        {item.brief.objective ? (
                          <p>
                            <span className="font-medium text-zinc-800">Objetivo:</span>{" "}
                            {item.brief.objective}
                          </p>
                        ) : null}

                        {item.brief.product_positioning ? (
                          <p>
                            <span className="font-medium text-zinc-800">Posicionamento:</span>{" "}
                            {item.brief.product_positioning}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {campaign ? (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                      <p className="font-medium">Campanha vinculada</p>
                      <p className="mt-1">{campaign.product_name}</p>
                    </div>
                  ) : null}
                </div>

                <div className="flex w-full flex-col gap-2 lg:w-[260px]">
                  {!campaign ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/campaigns/new?${params.toString()}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                      Criar campanha
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                    >
                      Abrir campanha
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onGenerateText(item.id)}
                    disabled={generatingTextId === item.id}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles className="h-4 w-4" />
                    {generatingTextId === item.id ? "Gerando texto..." : "Gerar texto"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onGenerateReels(item.id)}
                    disabled={generatingReelsId === item.id}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Video className="h-4 w-4" />
                    {generatingReelsId === item.id ? "Gerando reels..." : "Gerar reels"}
                  </button>

                  {item.status === "approved" ? (
                    <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Item aprovado
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}