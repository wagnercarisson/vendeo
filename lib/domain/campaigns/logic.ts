import { Campaign } from "./types";
import { ContentState } from "./types";

/**
 * Entende o estado de conteúdo da campanha baseado na presença de campos.
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

/**
 * Verifica se a campanha tem arte gerada.
 */
export function hasGeneratedArt(campaign: Campaign): boolean {
  return !!(campaign.image_url || campaign.ai_caption || campaign.ai_text);
}

/**
 * Verifica se a campanha tem qualquer asset visual (arte ou vídeo).
 */
export function hasAnyVisualAsset(campaign: Campaign): boolean {
  return !!(campaign.image_url || campaign.reels_script);
}

/**
 * Verifica se a campanha tem o conteúdo textual gerado.
 */
export function hasGeneratedCampaignContent(campaign: Campaign): boolean {
  return !!(campaign.ai_caption || campaign.ai_text || campaign.ai_cta);
}

/**
 * Verifica se a campanha tem vídeo/reels gerado.
 */
export function hasGeneratedVideo(campaign: Campaign): boolean {
  return !!(campaign.reels_script || campaign.reels_hook);
}

/**
 * Retorna label da estratégia baseado no objetivo
 */
export function getCampaignStrategyLabel(campaign: Campaign): string {
  const o = (campaign.objective || "").toLowerCase();

  if (o.includes("promocao") || o.includes("queima")) return "OFERTA";
  if (o.includes("combo")) return "COMBO";
  if (o.includes("sazonal")) return "MOMENTO";
  if (o.includes("presente") || o.includes("gift")) return "PRESENTE";

  return "DESTAQUE";
}

/**
 * Retorna o status resumido da campanha para listagem.
 */
export function getCampaignListStatus(campaign: Campaign): "approved" | "pending" | "none" {
  const hasArt = hasGeneratedArt(campaign);
  const hasVideo = hasGeneratedVideo(campaign);
  const hasContent = hasGeneratedCampaignContent(campaign);

  if (campaign.status === "approved") {
    return "approved";
  }

  if (hasArt || hasVideo || hasContent) {
    return "pending";
  }
  
  return "none";
}

/**
 * Retorna string de status amigável.
 */
export function getCampaignStatusLine(campaign: Campaign): string {
  const status = getCampaignListStatus(campaign);

  if (status === "approved") {
    const hasArt = hasGeneratedArt(campaign);
    const hasVideo = hasGeneratedVideo(campaign);
    
    if (hasArt && hasVideo) return "Campanha completa";
    if (hasArt) return "Arte pronta";
    if (hasVideo) return "Vídeo pronto";
    return "Aprovada";
  }
  
  if (status === "pending") return "Aguardando aprovação";
  
  return "Sem conteúdo";
}
