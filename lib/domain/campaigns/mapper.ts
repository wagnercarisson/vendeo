import { z } from "zod";
import { CampaignAISchema } from "./schemas";
import { Campaign, CampaignContext } from "./types";
import { CampaignAIOutput } from "./types";
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
    image_url: raw.image_url ?? null,
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
