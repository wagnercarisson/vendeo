import { z } from "zod";
import {
  AUDIENCE_OPTIONS,
  OBJECTIVE_VALUES,
  PRODUCT_POSITIONING_OPTIONS,
} from "@/lib/constants/strategy";
import { normalizeObjective } from "@/lib/formatters/strategyLabels";

const CampaignObjectiveSchema = z.preprocess(
  (value) => {
    if (value == null || value === "") return null;
    const normalized = normalizeObjective(String(value));
    return normalized || value;
  },
  z.enum(OBJECTIVE_VALUES).nullable()
);

const AUDIENCE_VALUES = AUDIENCE_OPTIONS.map((option) => option.value) as [
  (typeof AUDIENCE_OPTIONS)[number]["value"],
  ...(typeof AUDIENCE_OPTIONS)[number]["value"][]
];

const POSITIONING_VALUES = PRODUCT_POSITIONING_OPTIONS.map(
  (option) => option.value
) as [
  (typeof PRODUCT_POSITIONING_OPTIONS)[number]["value"],
  ...(typeof PRODUCT_POSITIONING_OPTIONS)[number]["value"][]
];

const CampaignAudienceSchema = z.preprocess(
  (value) => {
    if (value == null || value === "") return null;
    return value;
  },
  z.enum(AUDIENCE_VALUES).nullable()
);

const ProductPositioningSchema = z.preprocess(
  (value) => {
    if (value == null || value === "") return null;
    return value;
  },
  z.enum(POSITIONING_VALUES).nullable()
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

// ─────────────────────────────────────────────────────────────
// AICampaignContentSchema — alias canônico para validação da
// resposta OpenAI. Alias seguro de CampaignAISchema.
// ─────────────────────────────────────────────────────────────
export const AICampaignContentSchema = CampaignAISchema;
export type AICampaignContent = z.infer<typeof AICampaignContentSchema>;

// ─────────────────────────────────────────────────────────────
// CampaignDomainSchema — valida o objeto Campaign limpo
// produzido por mapDbCampaignToDomain em mapper.ts.
// Espelha a interface Campaign de lib/domain/campaigns/types.ts.
// ─────────────────────────────────────────────────────────────
const CampaignCanonicalContentTypeSchema = z
  .enum(["product", "service", "message"])
  .nullable();

export const CampaignDomainSchema = z.object({
  id: z.string(),
  store_id: z.string(),
  product_name: z.string().nullable(),
  price: z.number().nullable(),
  price_label: z.string().nullable(),
  audience: CampaignAudienceSchema,
  objective: CampaignObjectiveSchema,
  product_positioning: ProductPositioningSchema,
  status: z.string().nullable(),
  campaign_type: z.enum(["post", "reels", "both"]).nullable(),
  content_type: CampaignCanonicalContentTypeSchema,
  legacy_content_type: z.string().nullable(),
  domain_input: z.record(z.unknown()),
  domain_input_version: z.number(),
  post_status: z.enum(["none", "draft", "ready", "approved"]).nullable(),
  reels_status: z.enum(["none", "draft", "ready", "approved"]).nullable(),
  origin: z.enum(["manual", "plan"]),
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
  reels_shotlist: z.array(z.unknown()).nullable(),
  reels_on_screen_text: z.array(z.string()).nullable(),
  reels_audio_suggestion: z.string().nullable(),
  reels_duration_seconds: z.number().nullable(),
  reels_caption: z.string().nullable(),
  reels_cta: z.string().nullable(),
  reels_hashtags: z.string().nullable(),
  reels_generated_at: z.string().nullable(),
  created_at: z.string(),
});

export type CampaignDomain = z.infer<typeof CampaignDomainSchema>;