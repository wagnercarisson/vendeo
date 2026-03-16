import { StrategyItem, WeeklyPlan, WeeklyPlanItem, WeeklyPlanItemBrief } from "./types";

/**
 * Mapeia o resultado bruto da IA para itens de estratégia normalizados.
 */
export function mapAiStrategyToDomain(raw: unknown): StrategyItem[] {
  if (!raw || !Array.isArray(raw)) return [];

  return raw
    .map((item: any) => {
      if (!item || typeof item !== "object") return null;

      const normalized: StrategyItem = {
        day_of_week: Number(item.day_of_week) || 0,
        audience: String(item.audience || ""),
        objective: String(item.objective || ""),
        positioning: String(item.positioning || ""),
        content_type: (item.content_type === "post" || item.content_type === "reels")
          ? item.content_type
          : "post",
        reasoning: String(item.reasoning || ""),
      };

      return normalized;
    })
    .filter((item): item is StrategyItem => item !== null);
}

/**
 * Mapeia uma linha crua do banco para o tipo de domínio WeeklyPlan.
 */
export function mapDbWeeklyPlanToDomain(raw: any): WeeklyPlan {
  return {
    id: String(raw.id),
    store_id: String(raw.store_id),
    week_start: String(raw.week_start),
    status: raw.status === "approved" ? "approved" : "draft",
    strategy: raw.strategy ?? null,
    created_at: raw.created_at ?? new Date().toISOString(),
  };
}

/**
 * Mapeia uma linha crua do banco para o tipo de domínio WeeklyPlanItem.
 * Normaliza o campo JSONB 'brief'.
 */
export function mapDbWeeklyPlanItemToDomain(raw: any): WeeklyPlanItem {
  const briefRaw = raw.brief || {};

  const brief: WeeklyPlanItemBrief = {
    angle: String(briefRaw.angle || ""),
    audience: String(briefRaw.audience || ""),
    objective: String(briefRaw.objective || ""),
    product_positioning: String(briefRaw.product_positioning || ""),
    hook_hint: briefRaw.hook_hint ?? null,
    cta_hint: briefRaw.cta_hint ?? null,
  };

  return {
    id: String(raw.id),
    plan_id: String(raw.plan_id),
    day_of_week: Number(raw.day_of_week) || 0,
    content_type: raw.content_type === "reels" ? "reels" : "post",
    theme: raw.theme ?? "",
    recommended_time: raw.recommended_time ?? null,
    campaign_id: raw.campaign_id ?? null,
    status:
      raw.status === "approved"
        ? "approved"
        : raw.status === "ready"
          ? "ready"
          : "draft",
    brief,
    created_at: raw.created_at ?? new Date().toISOString(),
  };
}
