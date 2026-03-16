import { z } from "zod";

export const CampaignRequestSchema = z.object({
  campaign_id: z.string().uuid(),
  force: z.boolean().optional().default(false),
  description: z.string().optional(),
  persist: z.boolean().optional().default(true),
});

export const CampaignAISchema = z.object({
  headline: z.string().optional(),
  caption: z.string().optional(),
  text: z.string().optional(),
  cta: z.string().optional(),
  hashtags: z.string().optional(),
});

export type CampaignRequest = z.infer<typeof CampaignRequestSchema>;