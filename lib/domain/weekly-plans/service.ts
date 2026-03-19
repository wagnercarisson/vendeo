import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  WeeklyPlan,
  WeeklyPlanItem,
  StrategyItem,
  WeeklyPlanItemBrief,
} from "./types";
import { Campaign } from "../campaigns/types";
import { WeeklyPlanItemBriefSchema } from "./schemas";
import {
  mapDbWeeklyPlanToDomain,
  mapDbWeeklyPlanItemToDomain,
} from "./mapper";
import { mapDbCampaignToDomain } from "../campaigns/mapper";
import { mapDbStoreToDomain } from "../stores/mapper";
import {
  OBJECTIVE_OPTIONS,
  AUDIENCE_OPTIONS,
  PRODUCT_POSITIONING_OPTIONS,
} from "@/lib/constants/strategy";

import { normalizeStrategyValue } from "@/lib/formatters/strategyLabels";

function getLabel(
  value: string,
  options: readonly { value: string; label: string }[]
) {
  const found = options.find((opt) => opt.value === value);
  return found?.label || value;
}

// ─── Helper de datas ──────────────────────────────────────────────────────────

function toISODate(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getWeekStartMondayISO(today = new Date()): string {
  const d = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const diffToMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return toISODate(d);
}

function getRecommendedTimeByObjective(
  objective: string | null | undefined
): string {
  const normalized = String(objective ?? "").trim().toLowerCase();

  if (
    normalized.includes("oferta") ||
    normalized.includes("promo") ||
    normalized.includes("venda")
  ) {
    return "12:30";
  }

  if (
    normalized.includes("combo") ||
    normalized.includes("tráfego") ||
    normalized.includes("trafego") ||
    normalized.includes("visita")
  ) {
    return "18:00";
  }

  return "20:00";
}

// ─── Pipeline de fetch ────────────────────────────────────────────────────────

export interface WeeklyPlanResult {
  plan: WeeklyPlan;
  items: WeeklyPlanItem[];
  campaigns: Campaign[];
}

/** Busca o plano semanal com items e campanhas vinculadas. Retorna null se não existir. */
export async function fetchWeeklyPlan(
  storeId: string,
  weekStart: string
): Promise<WeeklyPlanResult | null> {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: plan, error: planErr } = await supabaseAdmin
    .from("weekly_plans")
    .select("id, store_id, week_start, status, strategy, created_at")
    .eq("store_id", storeId)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (planErr) throw new Error(planErr.message);
  if (!plan) return null;

  const { data: items, error: itemsErr } = await supabaseAdmin
    .from("weekly_plan_items")
    .select(
      "id, plan_id, day_of_week, content_type, theme, recommended_time, campaign_id, status, brief, created_at"
    )
    .eq("plan_id", plan.id)
    .order("day_of_week", { ascending: true });

  if (itemsErr) throw new Error(itemsErr.message);

  const normalizedPlan = mapDbWeeklyPlanToDomain(plan);
  const normalizedItems = (items ?? []).map((i) =>
    mapDbWeeklyPlanItemToDomain(i)
  );

  const campaignIds = normalizedItems
    .map((i) => i.campaign_id)
    .filter(Boolean) as string[];

  let campaigns: Campaign[] = [];

  if (campaignIds.length) {
    const { data: cData, error: cErr } = await supabaseAdmin
      .from("campaigns")
      .select(
        `id, store_id, product_name, price, audience, objective, product_positioning, created_at,
         status, image_url, product_image_url, headline, body_text, cta,
         ai_caption, ai_text, ai_cta, ai_hashtags, ai_generated_at,
         reels_hook, reels_script, reels_shotlist, reels_on_screen_text,
         reels_audio_suggestion, reels_duration_seconds,
         reels_caption, reels_cta, reels_hashtags, reels_generated_at`
      )
      .in("id", campaignIds);

    if (cErr) throw new Error(cErr.message);
    campaigns = (cData ?? []).map(mapDbCampaignToDomain);
  }

  return { plan: normalizedPlan, items: normalizedItems, campaigns };
}

// ─── Pipeline de geração ──────────────────────────────────────────────────────

export interface GenerateWeeklyPlanInput {
  storeId: string;
  weekStart: string;
  force: boolean;
  approvedStrategy: StrategyItem[];
}

export type GenerateWeeklyPlanResult =
  | {
    ok: true;
    reused?: boolean;
    plan: WeeklyPlan;
    items: WeeklyPlanItem[];
    campaigns: Campaign[];
  }
  | { ok: false; error: string; details?: unknown; status: number };

/**
 * Pipeline de geração do plano semanal:
 * idempotency check → fetch store → upsert plan → insert items → return result
 */
export async function generateWeeklyPlan(
  input: GenerateWeeklyPlanInput
): Promise<GenerateWeeklyPlanResult> {
  const { storeId, weekStart, force, approvedStrategy } = input;

  // 1) Idempotência
  const existing = await fetchWeeklyPlan(storeId, weekStart);
  if (existing && !force) {
    return {
      ok: true,
      reused: true,
      plan: existing.plan,
      items: existing.items,
      campaigns: existing.campaigns,
    };
  }

  // 2) Força → apaga itens existentes
  if (existing && force) {
    const supabaseAdmin = getSupabaseAdmin();

    const existingItemIds = existing.items.map((item) => item.id).filter(Boolean);

    if (existingItemIds.length > 0) {
      const { error: detachCampaignsErr } = await supabaseAdmin
        .from("campaigns")
        .update({
          origin: "manual",
          weekly_plan_item_id: null,
        })
        .in("weekly_plan_item_id", existingItemIds);

      if (detachCampaignsErr) {
        throw new Error(detachCampaignsErr.message);
      }
    }

    const { error: delItemsErr } = await supabaseAdmin
      .from("weekly_plan_items")
      .delete()
      .eq("plan_id", existing.plan.id);

    if (delItemsErr) throw new Error(delItemsErr.message);
  }

  // 3) Busca loja para snapshot
  const supabaseAdmin = getSupabaseAdmin();

  const { data: store, error: sErr } = await supabaseAdmin
    .from("stores")
    .select(
      "id, name, city, state, brand_positioning, main_segment, tone_of_voice"
    )
    .eq("id", storeId)
    .single();

  if (sErr || !store) {
    return { ok: false, error: "STORE_NOT_FOUND", status: 404 };
  }

  const normalizedStore = mapDbStoreToDomain(store);

  // 4) Upsert cabeçalho do plano
  const { data: upPlan, error: upPlanErr } = await supabaseAdmin
    .from("weekly_plans")
    .upsert(
      { store_id: storeId, week_start: weekStart, status: "draft" },
      { onConflict: "store_id,week_start" }
    )
    .select("id, store_id, week_start, status, strategy, created_at")
    .single();

  if (upPlanErr || !upPlan) {
    throw new Error(upPlanErr?.message ?? "FAILED_UPSERT_PLAN");
  }

  const normalizedUpPlan = mapDbWeeklyPlanToDomain(upPlan);

  // 5) Salva estratégia no plano
  const strategySummary = approvedStrategy
    .map((s) => `Dia ${s.day_of_week}: Obj: ${s.objective}, Publ: ${s.audience}`)
    .join(" | ");

  const { error: updPlanErr } = await supabaseAdmin
    .from("weekly_plans")
    .update({
      status: "draft",
      strategy: {
        strategy_summary: strategySummary || "Estratégia omitida.",
        items: approvedStrategy,
        store_snapshot: {
          name: normalizedStore.name,
          city: normalizedStore.city,
          state: normalizedStore.state,
          main_segment: normalizedStore.main_segment,
          brand_positioning: normalizedStore.brand_positioning,
          tone_of_voice: normalizedStore.tone_of_voice,
        },
      },
    })
    .eq("id", normalizedUpPlan.id);

  if (updPlanErr) throw new Error(updPlanErr.message);

  // 6) Insere items
  const itemsToInsert = approvedStrategy.map((st) => {
    const theme = `Focar em ${st.reasoning}`;

    const brief: WeeklyPlanItemBrief = {
      angle: `Focar em ${st.reasoning}`,
      hook_hint: "Atenção inicial focada na estratégia",
      cta_hint: "Chamada para ação clara",
      objective: normalizeStrategyValue(st.objective, OBJECTIVE_OPTIONS),
      audience: normalizeStrategyValue(st.audience, AUDIENCE_OPTIONS),
      product_positioning: normalizeStrategyValue(
        st.positioning,
        PRODUCT_POSITIONING_OPTIONS
      ),
    };

    const validBrief = WeeklyPlanItemBriefSchema.parse(brief);

    return {
      plan_id: normalizedUpPlan.id,
      day_of_week: st.day_of_week,
      content_type: st.content_type,
      theme,
      recommended_time: getRecommendedTimeByObjective(st.objective),
      campaign_id: null,
      status: "draft" as const,
      brief: validBrief,
    };
  });

  const { error: iErr } = await supabaseAdmin
    .from("weekly_plan_items")
    .insert(itemsToInsert);

  if (iErr) throw new Error(iErr.message);

  const final = await fetchWeeklyPlan(storeId, weekStart);

  return {
    ok: true,
    reused: false,
    plan: final?.plan ?? normalizedUpPlan,
    items: final?.items ?? [],
    campaigns: final?.campaigns ?? [],
  };
}