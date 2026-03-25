import { z } from "zod";

export const DetailedFeedbackSchema = z.object({
  step: z.string().max(2000).optional(),
  attempt: z.string().max(2000).optional(),
  result: z.string().max(2000).optional(),
  wouldHelpSales: z.string().optional(),
  improvement: z.string().max(2000).optional(),
  wouldPost: z.string().optional(),
  reasonNotPost: z.string().max(2000).optional(),
  score: z.number().min(0).max(10).optional(),
  allowContact: z.boolean().default(false),
  pagePath: z.string().optional(),
  userAgent: z.string().optional(),
  campaignId: z.string().uuid().optional().nullable(),
});

export const GenerationFeedbackSchema = z.object({
  contentType: z.enum(['campaign', 'reels', 'weekly_plan', 'weekly_strategy']),
  campaignId: z.string().uuid().optional().nullable(),
  weeklyPlanId: z.string().uuid().optional().nullable(),
  vote: z.enum(['yes', 'maybe', 'no']),
  reason: z.string().max(2000).optional().nullable(),
  wouldPost: z.string().optional().nullable(),
  pagePath: z.string().optional(),
  userAgent: z.string().optional(),
});

export type DetailedFeedbackInput = z.infer<typeof DetailedFeedbackSchema>;
export type GenerationFeedbackInput = z.infer<typeof GenerationFeedbackSchema>;
