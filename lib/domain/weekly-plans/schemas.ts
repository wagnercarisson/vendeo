import { z } from "zod";

export const WeeklyPlanPostBodySchema = z.object({
  store_id: z.string().uuid(),
  week_start: z.string().optional(),
  force: z.boolean().optional().default(false),
  selected_days: z.array(z.number().int().min(1).max(7)).optional(),
  approved_strategy: z
    .array(
      z.object({
        day_of_week: z.number().int().min(1).max(7),
        audience: z.string(),
        objective: z.string(),
        positioning: z.string(),
        content_type: z.enum(["post", "reels"]),
        reasoning: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

export const WeeklyPlanQuerySchema = z.object({
  store_id: z.string().uuid(),
  week_start: z.string().optional(),
});

export const WeeklyStrategyRequestSchema = z.object({
  store_id: z.string().uuid(),
  week_start: z.string().optional(),
  selected_days: z.array(z.number().int().min(1).max(7)).optional(),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  holidays: z
    .array(z.object({ date: z.string(), name: z.string() }))
    .optional()
    .default([]),
});

export const WeeklyStrategyAISchema = z.object({
  items: z.array(
    z.object({
      day_of_week: z.number().int().min(1).max(7),
      audience: z.string(),
      objective: z.string(),
      positioning: z.string(),
      content_type: z.enum(["post", "reels"]),
      reasoning: z.string().optional(),
    })
  ),
});

export type WeeklyStrategyRequest = z.infer<typeof WeeklyStrategyRequestSchema>;
export type WeeklyPlanPostBody = z.infer<typeof WeeklyPlanPostBodySchema>;
export type StrategyItemInput = WeeklyPlanPostBody["approved_strategy"][number];
