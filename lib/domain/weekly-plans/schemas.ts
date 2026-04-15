import { z } from "zod";
import { OBJECTIVE_VALUES } from "@/lib/constants/strategy";
import { normalizeObjective } from "@/lib/formatters/strategyLabels";

const CampaignObjectiveSchema = z.preprocess(
  (value) => {
    if (value == null || value === "") return value;
    const normalized = normalizeObjective(String(value));
    return normalized || value;
  },
  z.enum(OBJECTIVE_VALUES)
);

export const WeeklyPlanItemBriefSchema = z.object({
  angle: z.string(),
  hook_hint: z.string(),
  cta_hint: z.string(),
  audience: z.string(),
  objective: CampaignObjectiveSchema,
  product_positioning: z.string(),
});

export const StrategyItemSchema = z.object({
  day_of_week: z.number().int().min(1).max(7),
  audience: z.string().min(1),
  objective: CampaignObjectiveSchema,
  positioning: z.string().min(1),
  content_type: z.enum(["post", "reels"]),
  target_content_type: z.enum(["product", "service", "message", "info"]).nullable().optional(),
  target_domain_input: z.record(z.unknown()).optional().default({}),
  reasoning: z.string().min(1),
});

export const WeeklyPlanPostBodySchema = z.object({
  store_id: z.string().uuid(),
  week_start: z.string().optional(),
  force: z.boolean().optional().default(false),
  selected_days: z.array(z.number().int().min(1).max(7)).optional(),
  approved_strategy: z.array(StrategyItemSchema).optional().default([]),
});

export const WeeklyPlanQuerySchema = z.object({
  id: z.string().uuid().optional(),
  store_id: z.string().uuid().optional(),
  week_start: z.string().optional(),
});

export const WeeklyStrategyRequestSchema = z.object({
  store_id: z.string().uuid(),
  week_start: z.string().optional(),
  selected_days: z.array(z.number().int().min(1).max(7)).optional(),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  holidays: z
    .array(z.object({ date: z.string().min(1), name: z.string().min(1) }))
    .optional()
    .default([]),
});

export const WeeklyStrategyAISchema = z.object({
  items: z.array(StrategyItemSchema),
});

export type WeeklyStrategyRequest = z.infer<typeof WeeklyStrategyRequestSchema>;
export type WeeklyPlanPostBody = z.infer<typeof WeeklyPlanPostBodySchema>;
export type StrategyItemInput = WeeklyPlanPostBody["approved_strategy"][number];
