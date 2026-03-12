import { z } from "zod";
import { ShortVideoAISchema } from "./schemas";
import { ShortVideoContext, ShortVideoAIOutput, ShortVideoShotScene } from "./types";
import { StoreContext } from "@/lib/domain/stores/types";

type AIData = z.infer<typeof ShortVideoAISchema>;

/**
 * Normaliza o output da IA de vídeo curto com fallbacks baseados no contexto comercial.
 */
export function mapAiShortVideoToDomain(
  aiData: AIData,
  campaign: ShortVideoContext,
  store: StoreContext
): ShortVideoAIOutput {
  return {
    hook: aiData.hook,
    duration_seconds: aiData.duration_seconds,
    audio_suggestion: aiData.audio_suggestion,
    on_screen_text: aiData.on_screen_text ?? [],
    shotlist: (aiData.shotlist ?? []).map((s) => ({
      scene: Number(s.scene) || 0,
      camera: String(s.camera || ""),
      action: String(s.action || ""),
      dialogue: String(s.dialogue || ""),
    })),
    script: aiData.script,
    caption:
      aiData.caption ||
      `✨ ${campaign.product_name} na ${store.name}! Garanta o seu.`,
    cta:
      aiData.cta ||
      (store.whatsapp ? "Manda um Direct!" : "Clica no link da bio!"),
    hashtags: aiData.hashtags || "#reels #shorts #loja #oferta",
  };
}

/**
 * Mapeia uma linha crua de campanha para o contexto de reels.
 */
export function mapDbCampaignToShortVideoContext(raw: any): ShortVideoContext {
  return {
    id: String(raw.id),
    store_id: String(raw.store_id),
    product_name: String(raw.product_name || "Produto"),
    price: raw.price != null ? String(raw.price) : null,
    audience: String(raw.audience || "Público Geral"),
    objective: String(raw.objective || "Vendas"),
    product_positioning: raw.product_positioning ?? null,
    
    reels_generated_at: raw.reels_generated_at ?? null,
    reels_hook: raw.reels_hook ?? null,
    reels_script: raw.reels_script ?? null,
    reels_shotlist: Array.isArray(raw.reels_shotlist) ? raw.reels_shotlist : null,
    reels_on_screen_text: Array.isArray(raw.reels_on_screen_text) ? raw.reels_on_screen_text : null,
    reels_audio_suggestion: raw.reels_audio_suggestion ?? null,
    reels_duration_seconds: raw.reels_duration_seconds != null ? Number(raw.reels_duration_seconds) : null,
    reels_caption: raw.reels_caption ?? null,
    reels_cta: raw.reels_cta ?? null,
    reels_hashtags: raw.reels_hashtags ?? null,
  };
}

/**
 * Mapeia o output da IA diretamente para o formato final de salvamento (opcional, se quiser separar do domínio).
 * Mas aqui o mapAiShortVideoToDomain já entrega o que precisamos.
 */
