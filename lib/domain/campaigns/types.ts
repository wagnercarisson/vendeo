import { ShortVideoShotScene } from "../short-videos/types";

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

export type CampaignObjective = 
  | "promocao" 
  | "novidade" 
  | "queima" 
  | "sazonal" 
  | "reposicao" 
  | "combo" 
  | "engajamento" 
  | "visitas";

export type ProductPositioning = 
  | "popular" 
  | "medio" 
  | "premium" 
  | "jovem" 
  | "familia";

export type InfoSubtype = "educativo" | "autoridade" | "aviso" | "bastidores";
export type BranchScope = "store_wide" | "single_branch" | "multi_branch";

export interface Campaign {
  id: string;
  store_id: string;
  product_name: string | null;
  price: number | null;
  price_label: string | null;
  audience: CampaignAudience | null;
  objective: CampaignObjective | null;
  product_positioning: ProductPositioning | null;
  status: string | null;
  campaign_type: "post" | "reels" | "both" | null;
  content_type: "product" | "service" | "info" | null;
  info_subtype: InfoSubtype | null;
  branch_scope: BranchScope;
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
  price_label: string | null;
  audience: CampaignAudience | string; // Permitir string para flexibilidade na IA se necessário, mas tipado no Mapper
  objective: CampaignObjective | string;
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

export type ContentState = "none" | "art_only" | "video_only" | "art_and_video";
export type ActiveTab = "art" | "video";
export type ViewMode = "view" | "edit" | "review";

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
  post_status: "none" | "draft" | "ready" | "approved" | null;
  reels_status: "none" | "draft" | "ready" | "approved" | null;

  // Campos de conteúdo para os modais de listagem
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

export interface CampaignDetail extends Campaign {
  // Atualmente igual à Campaign, mas preparada para extensões de UI
}

export interface CampaignBranch {
  campaign_id: string;
  branch_id: string;
  created_at: string;
}