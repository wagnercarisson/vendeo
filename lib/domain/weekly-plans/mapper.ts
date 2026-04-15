import { StrategyItem, WeeklyPlan, WeeklyPlanItem, WeeklyPlanItemBrief } from "./types";
import { normalizeObjective } from "@/lib/formatters/strategyLabels";
import { normalizeCampaignContentType } from "@/lib/domain/campaigns/mapper";
import type { CampaignCanonicalContentType } from "@/lib/domain/campaigns/types";

function asObjectRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function normalizeWeeklyPlanTargetContentType(
  value: unknown
): CampaignCanonicalContentType | null {
  if (
    value !== "product" &&
    value !== "service" &&
    value !== "message" &&
    value !== "info"
  ) {
    return null;
  }

  return normalizeCampaignContentType(value);
}

export function normalizeWeeklyPlanTargetDomainInput(
  value: unknown
): Record<string, unknown> {
  return asObjectRecord(value);
}

function mergeObjectRecord(
  base: Record<string, unknown>,
  key: string,
  patch: Record<string, unknown>
) {
  const current = asObjectRecord(base[key]);
  const next = {
    ...current,
    ...Object.fromEntries(
      Object.entries(patch).filter(([, entryValue]) => entryValue !== undefined)
    ),
  };

  if (Object.keys(next).length > 0) {
    base[key] = next;
  }
}

export function buildCampaignDomainInputFromWeeklyPlanTarget(params: {
  targetContentType: CampaignCanonicalContentType | null;
  targetDomainInput: unknown;
  productName?: string | null;
  price?: number | null;
  priceLabel?: string | null;
  productPositioning?: string | null;
  productImageUrl?: string | null;
  description?: string | null;
}): Record<string, unknown> {
  const {
    targetContentType,
    targetDomainInput,
    productName,
    price,
    priceLabel,
    productPositioning,
    productImageUrl,
    description,
  } = params;

  if (!targetContentType) {
    return {};
  }

  const normalized = {
    ...normalizeWeeklyPlanTargetDomainInput(targetDomainInput),
  };

  normalized.schema_version =
    typeof normalized.schema_version === "number" ? normalized.schema_version : 1;
  normalized.domain =
    asNonEmptyString(normalized.domain) || targetContentType;

  if (targetContentType === "message") {
    const messageText = asNonEmptyString(normalized.message_text) || description || null;
    const promotedSubject =
      asNonEmptyString(normalized.promoted_subject) || productName || null;

    if (messageText) normalized.message_text = messageText;
    if (promotedSubject) normalized.promoted_subject = promotedSubject;
    if (priceLabel && !asNonEmptyString(normalized.price_label)) {
      normalized.price_label = priceLabel;
    }
    mergeObjectRecord(normalized, "image", {
      source_url: asNonEmptyString(asObjectRecord(normalized.image).source_url) || productImageUrl || undefined,
    });

    return normalized;
  }

  if (productName && !asNonEmptyString(normalized.offer_name)) {
    normalized.offer_name = productName;
  }

  if (price != null && typeof normalized.price !== "number") {
    normalized.price = price;
  }

  if (priceLabel && !asNonEmptyString(normalized.price_label)) {
    normalized.price_label = priceLabel;
  }

  if (productPositioning && !asNonEmptyString(normalized.positioning)) {
    normalized.positioning = productPositioning;
  }

  mergeObjectRecord(normalized, "image", {
    source_url: asNonEmptyString(asObjectRecord(normalized.image).source_url) || productImageUrl || undefined,
  });

  return normalized;
}

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
        objective: normalizeObjective(String(item.objective || "")) || "promocao",
        positioning: String(item.positioning || ""),
        content_type: (item.content_type === "post" || item.content_type === "reels")
          ? item.content_type
          : "post",
        target_content_type: normalizeWeeklyPlanTargetContentType(item.target_content_type),
        target_domain_input: normalizeWeeklyPlanTargetDomainInput(item.target_domain_input),
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
    objective: normalizeObjective(String(briefRaw.objective || "")) || "promocao",
    product_positioning: String(briefRaw.product_positioning || ""),
    hook_hint: briefRaw.hook_hint ?? null,
    cta_hint: briefRaw.cta_hint ?? null,
  };

  return {
    id: String(raw.id),
    plan_id: String(raw.plan_id),
    day_of_week: Number(raw.day_of_week) || 0,
    content_type: raw.content_type === "reels" ? "reels" : "post",
    target_content_type: normalizeWeeklyPlanTargetContentType(raw.target_content_type),
    target_domain_input: normalizeWeeklyPlanTargetDomainInput(raw.target_domain_input),
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
