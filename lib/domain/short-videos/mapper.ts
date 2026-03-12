import { z } from "zod";
import { ShortVideoAISchema } from "./schemas";
import { ShortVideoContext, ShortVideoAIOutput } from "./types";
import { StoreContext } from "@/lib/domain/stores/types";

type AIData = z.infer<typeof ShortVideoAISchema>;

/**
 * Normaliza o output da IA de vídeo curto com fallbacks baseados no contexto comercial.
 */
export function normalizeShortVideoAI(
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
