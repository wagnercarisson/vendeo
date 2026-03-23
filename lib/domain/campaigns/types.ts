import { ShortVideoShotScene } from "../short-videos/types";

export interface Campaign {
  id: string;
  store_id: string;
  product_name: string | null;
  price: number | null;
  audience: string | null;
  objective: string | null;
  product_positioning: string | null;
  status: string | null;
  campaign_type: "post" | "reels" | "both" | null;
  content_type: "product" | "service" | "info" | null;
  post_status: "none" | "draft" | "ready" | "approved" | null;
  reels_status: "none" | "draft" | "ready" | "approved" | null;

  origin: "manual" | "plan";
  weekly_plan_item_id: string | null;

  image_url: string | null;
  product_image_url: string | null;
  headline: string | null;
  body_text: string | null;
  cta: string | null;

  ai_caption: string | null;
  ai_text: string | null;
  ai_cta: string | null;
  ai_hashtags: string | null;
  ai_generated_at: string | null;

  reels_hook: string | null;
  reels_script: string | null;
  reels_shotlist: ShortVideoShotScene[] | null;
  reels_on_screen_text: string[] | null;
  reels_audio_suggestion: string | null;
  reels_duration_seconds: number | null;
  reels_caption: string | null;
  reels_cta: string | null;
  reels_hashtags: string | null;
  reels_generated_at: string | null;

  created_at: string;
}

export interface CampaignContext {
  id: string;
  store_id: string;
  product_name: string;
  price: string | null;
  audience: string;
  objective: string;
  product_positioning: string | null;
  theme?: string | null;
}

export interface CampaignAIOutput {
  headline: string;
  caption: string;
  text: string;
  cta: string;
  hashtags: string;
}

export type ContentState = "none" | "art_only" | "video_only" | "art_and_video";
export type ActiveTab = "art" | "video";
export type ViewMode = "view" | "edit" | "review";