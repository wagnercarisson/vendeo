import { ShortVideoShotScene } from "../short-videos/types";
import type { CampaignObjective } from "@/lib/constants/strategy";
import type { CampaignDomain as Campaign } from "./schemas";

export type { CampaignObjective as Objective } from "@/lib/constants/strategy";
export type { CampaignDomain as Campaign } from "./schemas";

export type CampaignCanonicalContentType = "product" | "service" | "message";
export type CampaignReadableContentType = CampaignCanonicalContentType | "info";
export type ContentType = CampaignCanonicalContentType;

export type CampaignAudience =
  | "geral"
  | "jovens_festa"
  | "familia"
  | "infantil"
  | "maes_pais"
  | "mulheres"
  | "homens"
  | "fitness"
  | "terceira_idade"
  | "premium_exigente"
  | "economico"
  | "b2b";

export type ProductPositioning =
  | "popular"
  | "medio"
  | "premium"
  | "jovem"
  | "familia";

export interface CampaignContext {
  id: string;
  store_id: string;
  product_name: string;
  price: string | null;
  price_label: string | null;
  audience: CampaignAudience | string;
  objective: CampaignObjective;
  product_positioning: ProductPositioning | null;
  theme?: string | null;
}

export interface CampaignAIOutput {
  headline: string;
  caption: string;
  text: string;
  cta: string;
  hashtags: string;
  price_label: string | null;
}

export type VisualPipelineMotor =
  | "visual-reader"
  | "intent-resolver"
  | "visual-composer"
  | "renderer";

export type VisualOutputItem = {
  variation_index: number;
  url: string;
  metadata: {
    width: 1080;
    height: 1350;
    format: "png";
    size: number;
    renderTime?: number;
  };
};

export type GenerateCampaignVisualsInput = {
  campaign_id: string;
  store_id: string;
  product_image_url: string;
  campaign_data: {
    product_name: string;
    objective: CampaignObjective;
    audience: CampaignAudience | string;
    price?: number | null;
    price_label?: string | null;
    content_type: CampaignCanonicalContentType;
    product_positioning?: ProductPositioning | null;
  };
  visual_signature: {
    logo_url?: string | null;
    store_name: string;
  };
  force?: boolean;
  existing_visual_outputs?: VisualOutputItem[];
};

export type GenerateCampaignVisualsOutput = {
  trace_id: string;
  campaign_id: string;
  visual_outputs: VisualOutputItem[];
  performance: {
    motor1_ms: number;
    motor2_ms: number;
    motor3_ms: number;
    motor4_ms: number;
    total_ms: number;
  };
  reused?: boolean;
};

export type PipelineError = {
  motor: VisualPipelineMotor;
  code: string;
  message: string;
  details?: unknown;
  trace_id: string;
};

export type ContentState = "none" | "art_only" | "video_only" | "art_and_video";
export type ActiveTab = "art" | "video";
export type ViewMode = "view" | "edit" | "review";

// TODO(Story 2.x): add CampaignListItemSchema when needed.
export interface CampaignListItem {
  id: string;
  store_id: string;
  product_name: string;
  price: number | null;
  audience: CampaignAudience | null;
  objective: CampaignObjective | null;
  product_positioning: ProductPositioning | null;
  status: "draft" | "ready" | "approved";
  ui_status: "complete" | "art" | "video" | "none";
  image_url: string | null;
  product_image_url: string | null;
  created_at: string;
  campaign_type: "post" | "reels" | "both" | null;
  content_type: CampaignCanonicalContentType | null;
  legacy_content_type: string | null;
  post_status: "none" | "draft" | "ready" | "approved" | null;
  reels_status: "none" | "draft" | "ready" | "approved" | null;

  ai_text: string | null;
  ai_caption: string | null;
  ai_cta: string | null;
  ai_hashtags: string | null;
  headline: string | null;

  reels_hook: string | null;
  reels_script: string | null;
  reels_shotlist: any | null;
  reels_on_screen_text: string[] | null;
  reels_audio_suggestion: string | null;
  reels_duration_seconds: number | null;
  reels_caption: string | null;
  reels_cta: string | null;
  reels_hashtags: string | null;
}

export interface CampaignDetail extends Campaign {}