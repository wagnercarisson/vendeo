import { z } from "zod";
import { OBJECTIVE_VALUES } from "@/lib/constants/strategy";
import { normalizeObjective } from "@/lib/formatters/strategyLabels";

const CampaignObjectiveSchema = z.preprocess(
  (value) => {
    if (value == null || value === "") return null;
    const normalized = normalizeObjective(String(value));
    return normalized || value;
  },
  z.enum(OBJECTIVE_VALUES).nullable()
);

export const CampaignReadableContentTypeSchema = z
  .enum(["product", "service", "info", "message"])
  .nullable();

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
  price_label: z.string().nullable().optional(),
});

export const CampaignReelsSchema = z.object({
  hook: z.string().optional(),
  script: z.string().optional(),
  shotlist: z.array(z.any()).optional(),
  on_screen_text: z.array(z.string()).optional(),
  audio_suggestion: z.string().optional(),
  duration_seconds: z.number().optional(),
  caption: z.string().optional(),
  cta: z.string().optional(),
  hashtags: z.string().optional(),
});

export const DbCampaignSchema = z.object({
  id: z.string(),
  store_id: z.string(),
  product_name: z.string().nullable(),
  price: z.coerce.number().nullable(),
  price_label: z.string().nullable(),
  audience: z.string().nullable(),
  objective: CampaignObjectiveSchema,
  product_positioning: z.string().nullable(),
  status: z.string().nullable(),
  campaign_type: z.enum(["post", "reels", "both"]).nullable(),
  content_type: CampaignReadableContentTypeSchema,
  legacy_content_type: z.string().nullable().optional(),
  domain_input: z.record(z.unknown()).nullable().optional(),
  domain_input_version: z.coerce.number().nullable().optional(),
  post_status: z.enum(["none", "draft", "ready", "approved"]).nullable(),
  reels_status: z.enum(["none", "draft", "ready", "approved"]).nullable(),
  origin: z.enum(["manual", "plan"]).default("manual"),
  weekly_plan_item_id: z.string().nullable(),
  image_url: z.string().nullable(),
  product_image_url: z.string().nullable(),
  headline: z.string().nullable(),
  body_text: z.string().nullable(),
  cta: z.string().nullable(),
  ai_caption: z.string().nullable(),
  ai_text: z.string().nullable(),
  ai_cta: z.string().nullable(),
  ai_hashtags: z.string().nullable(),
  ai_generated_at: z.string().nullable(),
  reels_hook: z.string().nullable(),
  reels_script: z.string().nullable(),
  reels_shotlist: z.any().nullable(),
  reels_on_screen_text: z.any().nullable(),
  reels_audio_suggestion: z.string().nullable(),
  reels_duration_seconds: z.coerce.number().nullable(),
  reels_caption: z.string().nullable(),
  reels_cta: z.string().nullable(),
  reels_hashtags: z.string().nullable(),
  reels_generated_at: z.string().nullable(),
  created_at: z.string().optional(),
});

export type CampaignRequest = z.infer<typeof CampaignRequestSchema>;
export type DbCampaignRaw = z.infer<typeof DbCampaignSchema>;