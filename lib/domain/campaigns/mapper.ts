import { z } from "zod";
import { CampaignAISchema } from "./schemas";
import { CampaignContext } from "./types";
import { CampaignAIOutput } from "./types";
import { StoreContext } from "@/lib/domain/stores/types";

type AIData = z.infer<typeof CampaignAISchema>;

/**
 * Normaliza o output da IA com fallbacks seguros.
 * Nunca lança exceção por campo ausente.
 */
export function normalizeCampaignAI(
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
