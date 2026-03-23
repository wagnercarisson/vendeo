import { z } from 'zod';

/**
 * Zod schemas para validação do domínio de campanhas.
 * Reutiliza definições de contracts para garantir consistência.
 */

export const campaignDbRowSchema = z.object({
  id: z.string().uuid(),
  store_id: z.string().uuid(),
  product_name: z.string().nullable(),
  price: z.coerce.number().nullable(),
  audience: z.string().nullable(),
  objective: z.string().nullable(),
  product_positioning: z.string().nullable(),
  image_url: z.string().nullable(),
  product_image_url: z.string().nullable(),
  headline: z.string().nullable(),
  body_text: z.string().nullable(),
  cta: z.string().nullable(),
  status: z.string().nullable(),
  created_at: z.string(),

  origin: z.enum(['manual', 'plan']),
  weekly_plan_item_id: z.string().uuid().nullable(),

  ai_text: z.string().nullable(),
  ai_caption: z.string().nullable(),
  ai_hashtags: z.string().nullable(),
  ai_cta: z.string().nullable(),
  ai_generated_at: z.string().nullable(),

  reels_hook: z.string().nullable(),
  reels_script: z.string().nullable(),
  reels_shotlist: z.array(z.any()).nullable(),
  reels_on_screen_text: z.array(z.string()).nullable(),
  reels_audio_suggestion: z.string().nullable(),
  reels_duration_seconds: z.coerce.number().nullable(),
  reels_caption: z.string().nullable(),
  reels_cta: z.string().nullable(),
  reels_hashtags: z.string().nullable(),
  reels_generated_at: z.string().nullable(),
});

export const campaignAiResponseSchema = z.object({
  headline: z.string(),
  text: z.string(),
  caption: z.string(),
  cta: z.string(),
  hashtags: z.string(),
});

export const campaignReelsAiResponseSchema = z.object({
  hook: z.string(),
  script: z.string(),
  shotlist: z.array(z.object({
    scene: z.number(),
    camera: z.string(),
    action: z.string(),
    dialogue: z.string(),
  })),
  on_screen_text: z.array(z.string()),
  audio_suggestion: z.string(),
  duration_seconds: z.number(),
  caption: z.string(),
  cta: z.string(),
  hashtags: z.string(),
});