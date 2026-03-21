import { z } from "zod";
import { CampaignAISchema } from "./schemas";
import { Campaign, CampaignContext, CampaignAIOutput } from "./types";
import { StoreContext } from "@/lib/domain/stores/types";

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
  };
}

/**
 * Mapeia uma linha crua do banco para o tipo de domínio Campaign.
 */
export function mapDbCampaignToDomain(raw: any): Campaign {
  return {
    id: String(raw.id),
    store_id: String(raw.store_id),
    product_name: raw.product_name ?? null,
    price: raw.price != null ? Number(raw.price) : null,
    audience: raw.audience ?? null,
    objective: raw.objective ?? null,
    product_positioning: raw.product_positioning ?? null,
    status: raw.status ?? null,
    campaign_type: raw.campaign_type ?? "both",
    content_type: raw.content_type ?? "product",
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
export function mapDbCampaignToAIContext(raw: any): CampaignContext {
  return {
    id: String(raw.id),
    store_id: String(raw.store_id),
    product_name: String(raw.product_name || "Produto"),
    price: raw.price != null ? String(raw.price) : null,
    audience: String(raw.audience || "Público Geral"),
    objective: String(raw.objective || "Vendas"),
    product_positioning: raw.product_positioning ?? null,
  };
}

/**
 * Mapeia uma campanha do domínio para o formato de preview usado no editor/review.
 */
export function mapCampaignToPreviewData(
  campaign: Campaign,
  store?: any
): any {
  return {
    image_url: campaign.image_url || campaign.product_image_url || "",
    headline: campaign.headline || campaign.product_name || "",
    body_text: campaign.ai_text || "",
    cta: campaign.ai_cta || "",
    caption: campaign.ai_caption || "",
    hashtags: campaign.ai_hashtags || "",
    price: campaign.price,
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
