export type Store = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  main_segment: string | null;
  brand_positioning: string | null;
  tone_of_voice: string | null;

  whatsapp: string | null;
  instagram: string | null;
  phone: string | null;

  primary_color: string | null;
  secondary_color: string | null;
};

export type Plan = {
  id: string;
  store_id: string;
  week_start: string;
  status: string;
  strategy: any;
  created_at: string;
};

export type WeeklyPlanItem = {
  id: string;
  plan_id: string;
  day_of_week: number;
  content_type: "post" | "reels";
  theme: string;
  recommended_time: string | null;
  campaign_id: string | null;
  brief: {
    angle?: string;
    hook_hint?: string;
    cta_hint?: string;
    audience?: string;
    objective?: string;
    product_positioning?: string;
  };
  created_at: string;
};

export type ReelsShot = {
  scene: number;
  camera: string;
  action: string;
  dialogue: string;
};

export type Campaign = {
  id: string;
  store_id: string;
  product_name: string | null;
  price: number | null;
  audience: string | null;
  objective: string | null;
  product_positioning: string | null;

  ai_caption?: string | null;
  ai_text?: string | null;
  ai_cta?: string | null;
  ai_hashtags?: string | null;

  reels_hook?: string | null;
  reels_script?: string | null;
  reels_shotlist?: ReelsShot[] | null;
  reels_on_screen_text?: string[] | null;
  reels_audio_suggestion?: string | null;
  reels_duration_seconds?: number | null;
  reels_caption?: string | null;
  reels_cta?: string | null;
  reels_hashtags?: string | null;
  reels_generated_at?: string | null;

  created_at: string;
};

// Wizard Specific Types
export type WizardStep = 1 | 2 | 3;

export type StrategyDraftItem = {
  day_of_week: number;
  audience: string;
  objective: string;
  positioning: string;
  content_type: "post" | "reels";
  reasoning: string;
};
