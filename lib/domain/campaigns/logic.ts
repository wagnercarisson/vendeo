import { Campaign } from "@/lib/campaigns/types";
import { ContentState } from "./types";

/**
 * Entende o estado de conteúdo da campanha baseado na presença de campos.
 * 
 * Regras (normalizadas para o novo domínio):
 * - hasArt: imageUrl OR aiCaption OR aiText OR aiGeneratedAt
 * - hasVideo: reelsScript OR reelsHook OR reelsGeneratedAt
 */
export function getContentState(campaign: Campaign): ContentState {
  const hasArt = !!(
    campaign.imageUrl ||
    campaign.aiCaption ||
    campaign.aiText ||
    campaign.aiGeneratedAt
  );

  const hasVideo = !!(
    campaign.reelsScript ||
    campaign.reelsHook ||
    campaign.reelsGeneratedAt
  );

  if (hasArt && hasVideo) return "art_and_video";
  if (hasArt) return "art_only";
  if (hasVideo) return "video_only";
  return "none";
}
