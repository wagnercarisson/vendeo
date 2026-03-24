import { z } from "zod";

export const ShortVideoRequestSchema = z.object({
  campaign_id: z.string().uuid(),
  force: z.boolean().optional().default(false),
  persist: z.boolean().optional().default(true),
  description: z.string().optional(),
});

export const ShortVideoAISchema = z.object({
  hook: z.string().min(5),
  duration_seconds: z.number().int().min(10).max(90),
  audio_suggestion: z.string().min(3),
  on_screen_text: z.array(z.string().min(1)).min(2).max(12),
  shotlist: z
    .array(
      z.object({
        scene: z.number().int().min(1),
        camera: z.string().min(2),
        action: z.string().min(2),
        dialogue: z.string().min(1),
      })
    )
    .min(3)
    .max(12),
  script: z.string().min(20),
  caption: z.string().min(10),
  cta: z.string().min(3),
  hashtags: z.string().min(3),
});

export type ShortVideoRequest = z.infer<typeof ShortVideoRequestSchema>;