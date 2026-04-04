import { z } from "zod";
import { 
  CampaignAISchema, 
  CampaignReelsSchema, 
  DbCampaignSchema, 
  DbCampaignRaw 
} from "./schemas";
import { 
  Campaign, 
  CampaignContext, 
  CampaignAIOutput,
  CampaignAudience,
  CampaignObjective,
  ProductPositioning,
  CampaignListItem
} from "./types";
import { StoreContext } from "@/lib/domain/stores/types";
import * as selectors from "./selectors";

type AIData = z.infer<typeof CampaignAISchema>;

/**
 * Normaliza o conteúdo gerado pela IA.
 */
export function mapAiCampaignToDomain(
  aiData: AIData,
  campaign: CampaignContext,
  store: StoreContext
): CampaignAIOutput {
  return {
    headline: (aiData.headline ?? "").trim() || campaign.product_name,
    caption:
      (aiData.caption ?? "").trim() ||
      `✨ ${campaign.product_name} em destaque!`,
    text:
      (aiData.text ?? "").trim() ||
      `Passe na ${store.name} e garanta o seu hoje.`,
    cta:
      (aiData.cta ?? "").trim() ||
      (store.whatsapp
        ? "Chama no WhatsApp e peça agora!"
        : "Fale conosco e peça agora!"),
    hashtags:
      (aiData.hashtags ?? "").trim() ||
      "#promo #oferta #instafood #loja #bairro",
    price_label: (aiData.price_label ?? "").trim() || null,
  };
}

/**
 * Mapeia uma linha crua do banco para o tipo de domínio Campaign de forma segura.
 */
export function mapDbCampaignToDomain(data: unknown): Campaign {
  const raw = DbCampaignSchema.parse(data);

  return {
    id: String(raw.id),
    store_id: String(raw.store_id),
    product_name: raw.product_name ?? null,
    price: raw.price != null ? Number(raw.price) : null,
    price_label: raw.price_label ?? null,
    
    // Casting de segurança com fallbacks (Blindagem de Domínio)
    audience: (raw.audience as CampaignAudience) || null,
    objective: (raw.objective as CampaignObjective) || null,
    product_positioning: (raw.product_positioning as ProductPositioning) || null,
    
    status: raw.status ?? null,
    campaign_type: raw.campaign_type ?? "both",
    content_type: raw.content_type ?? "product",
    info_subtype: (raw.info_subtype as any) ?? null,
    branch_scope: (raw.branch_scope as any) ?? "store_wide",
    post_status: raw.post_status ?? "none",
    reels_status: raw.reels_status ?? "none",

    origin: raw.origin === "plan" ? "plan" : "manual",
    weekly_plan_item_id: raw.weekly_plan_item_id ?? null,

    image_url: raw.image_url ?? null,
    product_image_url: raw.product_image_url ?? null,
    headline: raw.headline ?? null,
    body_text: raw.body_text ?? null,
    cta: raw.cta ?? null,

    ai_caption: raw.ai_caption ?? null,
    ai_text: raw.ai_text ?? null,
    ai_cta: raw.ai_cta ?? null,
    ai_hashtags: raw.ai_hashtags ?? null,
    ai_generated_at: raw.ai_generated_at ?? null,

    reels_hook: raw.reels_hook ?? null,
    reels_script: raw.reels_script ?? null,
    reels_shotlist: Array.isArray(raw.reels_shotlist) ? raw.reels_shotlist : null,
    reels_on_screen_text: Array.isArray(raw.reels_on_screen_text) ? raw.reels_on_screen_text : null,
    reels_audio_suggestion: raw.reels_audio_suggestion ?? null,
    reels_duration_seconds: raw.reels_duration_seconds != null ? Number(raw.reels_duration_seconds) : null,
    reels_caption: raw.reels_caption ?? null,
    reels_cta: raw.reels_cta ?? null,
    reels_hashtags: raw.reels_hashtags ?? null,
    reels_generated_at: raw.reels_generated_at ?? null,

    created_at: raw.created_at ? new Date(raw.created_at).toISOString() : new Date().toISOString(),
  };
}

/**
 * Mapeia dados do banco para o contexto lean usado pela IA.
 */
export function mapDbCampaignToAIContext(data: unknown, theme?: string | null): CampaignContext {
  const raw = DbCampaignSchema.parse(data);
  return {
    id: String(raw.id),
    store_id: String(raw.store_id),
    product_name: String(raw.product_name || "Produto"),
    price: raw.price != null ? String(raw.price) : null,
    price_label: raw.price_label ?? null,
    audience: (raw.audience as CampaignAudience) || "geral",
    objective: (raw.objective as CampaignObjective) || "promocao",
    product_positioning: (raw.product_positioning as ProductPositioning) || null,
    theme: theme ?? null,
  };
}

/**
 * Mapeia uma campanha do domínio para o formato de preview usado no editor/review.
 */
export function mapCampaignToPreviewData(
  campaign: Campaign,
  store?: any
): any {
  const isApproved = campaign.status === "approved" || campaign.post_status === "approved";
  return {
    image_url: isApproved ? (campaign.image_url || campaign.product_image_url || "") : (campaign.product_image_url || ""),
    headline: campaign.headline || campaign.product_name || "",
    body_text: campaign.ai_text || "",
    cta: campaign.ai_cta || "",
    caption: campaign.ai_caption || "",
    hashtags: campaign.ai_hashtags || "",
    price: campaign.price,
    price_label: campaign.price_label,
    layout: "solid", // default
    reels_hook: campaign.reels_hook,
    reels_script: campaign.reels_script,
    reels_shotlist: campaign.reels_shotlist,
    reels_on_screen_text: campaign.reels_on_screen_text,
    reels_audio_suggestion: campaign.reels_audio_suggestion,
    reels_duration_seconds: campaign.reels_duration_seconds,
    reels_caption: campaign.reels_caption,
    reels_cta: campaign.reels_cta,
    reels_hashtags: campaign.reels_hashtags,
    store: store ? {
      name: store.name,
      address: `${store.address || ""}${store.neighborhood ? `, ${store.neighborhood}` : ""}`,
      whatsapp: store.whatsapp || store.phone || "",
      primary_color: store.primary_color,
      secondary_color: store.secondary_color,
      logo_url: store.logo_url,
    } : undefined,
  };
}

/**
 * Valida e mapeia a resposta da IA de Arte para o formato de preview.
 */
export function mapAiArtToPreview(
  campaign: Campaign,
  aiResponse: unknown
): Partial<any> {
  const ai = CampaignAISchema.parse(aiResponse);
  
  return {
    headline: ai.headline || campaign.product_name || "",
    body_text: ai.text || "",
    cta: ai.cta || "",
    caption: ai.caption || "",
    hashtags: ai.hashtags || "",
    price_label: (ai.price_label !== undefined && ai.price_label !== null) 
      ? ai.price_label 
      : (campaign.price && Number(campaign.price) > 0 ? "OFERTA" : null),
  };
}

/**
 * Valida e mapeia a resposta da IA de Reels para o formato de preview.
 */
export function mapAiReelsToPreview(
  aiResponse: unknown
): Partial<any> {
  const reels = CampaignReelsSchema.parse(aiResponse);
  
  return {
    reels_hook: reels.hook || "",
    reels_script: reels.script || "",
    reels_shotlist: reels.shotlist || [],
    reels_on_screen_text: reels.on_screen_text || [],
    reels_audio_suggestion: reels.audio_suggestion || "",
    reels_duration_seconds: reels.duration_seconds || 30,
    reels_caption: reels.caption || "",
    reels_cta: reels.cta || "",
    reels_hashtags: reels.hashtags || "",
  };
}

/**
 * Mapeia uma campanha do domínio para o modelo simplificado de lista.
 */
export function mapCampaignToListItem(c: Campaign): CampaignListItem {
  return {
    id: c.id,
    store_id: c.store_id,
    product_name: c.product_name || "Sem nome",
    price: c.price,
    audience: c.audience,
    objective: c.objective,
    product_positioning: c.product_positioning,
    status: selectors.getGlobalStatus(c),
    ui_status: selectors.getUIStatus(c),
    image_url: c.image_url || null,
    product_image_url: c.product_image_url || null,
    created_at: c.created_at,
    campaign_type: c.campaign_type,
    post_status: c.post_status,
    reels_status: c.reels_status,
    ai_text: c.ai_text,
    ai_caption: c.ai_caption,
    ai_cta: c.ai_cta,
    ai_hashtags: c.ai_hashtags,
    headline: c.headline,
    reels_hook: c.reels_hook,
    reels_script: c.reels_script,
    reels_shotlist: c.reels_shotlist,
    reels_on_screen_text: c.reels_on_screen_text,
    reels_audio_suggestion: c.reels_audio_suggestion,
    reels_duration_seconds: c.reels_duration_seconds,
    reels_caption: c.reels_caption,
    reels_cta: c.reels_cta,
    reels_hashtags: c.reels_hashtags,
  };
}
