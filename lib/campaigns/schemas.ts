import { z } from 'zod';

/**
 * Zod schemas para validação do domínio de campanhas.
 * Reutiliza definições de contracts para garantir consistência.
 */

// Schema para a linha bruta do banco (snake_case literal)
export const campaignDbRowSchema = z.object({
  id: z.string().uuid(),
  store_id: z.string().uuid(),
  product_name: z.string().nullable(),
  price: z.coerce.number().nullable(), // Aceita números ou strings que podem ser números
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

  // Campos de IA
  ai_text: z.string().nullable(),
  ai_caption: z.string().nullable(),
  ai_hashtags: z.string().nullable(),
  ai_cta: z.string().nullable(),
  ai_generated_at: z.string().nullable(),

  // Campos de Reels
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

// Schema para resposta estruturada da IA (Criação de Arte/Copy)
export const campaignAiResponseSchema = z.object({
  headline: z.string(),
  text: z.string(),
  caption: z.string(),
  cta: z.string(),
  hashtags: z.string(),
});

// Schema para resposta estruturada da IA (Criação de Vídeo/Reels)
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
