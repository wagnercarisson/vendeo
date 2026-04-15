import type { CampaignObjective } from "@/lib/constants/strategy";

/** Campos mínimos de campanha usados pelo gerador de vídeo curto. */
export interface ShortVideoContext {
  id: string;
  store_id: string;
  product_name: string;
  price: string | null;
  audience: string;
  objective: CampaignObjective;
  product_positioning: string | null;
  /** Tema estratégico vindo do plano (opcional) */
  theme?: string | null;
  /** Preenchidos caso já existam no banco (idempotência) */
  reels_generated_at: string | null;
  reels_hook: string | null;
  reels_script: string | null;
  reels_shotlist: ShortVideoShotScene[] | null;
  reels_on_screen_text: string[] | null;
  reels_audio_suggestion: string | null;
  reels_duration_seconds: number | null;
  reels_caption: string | null;
  reels_cta: string | null;
  reels_hashtags: string | null;
}

export interface ShortVideoShotScene {
  scene: number;
  camera: string;
  action: string;
  dialogue: string;
}

/** Output normalizado após geração de vídeo curto. */
export interface ShortVideoAIOutput {
  hook: string;
  duration_seconds: number;
  audio_suggestion: string;
  on_screen_text: string[];
  shotlist: ShortVideoShotScene[];
  script: string;
  caption: string;
  cta: string;
  hashtags: string;
}
