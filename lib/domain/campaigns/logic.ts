import { Campaign, ContentState } from "./types";

/**
 * Entende o estado de conteúdo da campanha baseado na presença de campos.
 *
 * Regras:
 * - hasArt: image_url OR ai_caption OR ai_text OR ai_generated_at
 * - hasVideo: reels_script OR reels_hook OR reels_generated_at
 */
export function getContentState(campaign: Campaign): ContentState {
  const hasArt = !!(
    campaign.image_url ||
    campaign.ai_caption ||
    campaign.ai_text ||
    campaign.ai_generated_at
  );

  const hasVideo = !!(
    campaign.reels_script ||
    campaign.reels_hook ||
    campaign.reels_generated_at
  );

  if (hasArt && hasVideo) return "art_and_video";
  if (hasArt) return "art_only";
  if (hasVideo) return "video_only";
  return "none";
}
