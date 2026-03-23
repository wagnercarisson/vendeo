import { Campaign } from "@/lib/domain/campaigns/types";

/** true se a arte gerada pelo sistema estiver presente (imageUrl configurada pelo workflow) */
export function hasGeneratedArt(campaign: Campaign): boolean {
  return !!campaign.image_url;
}

/** true se houver qualquer imagem visual (arte gerada ou foto original do produto) */
export function hasAnyVisualAsset(campaign: Campaign): boolean {
  return !!(campaign.image_url || campaign.product_image_url);
}

/** true se houver qualquer conteúdo de campanha gerado (texto ou imagem) */
export function hasGeneratedCampaignContent(campaign: Campaign): boolean {
  return !!(
    campaign.ai_caption ||
    campaign.ai_text ||
    campaign.ai_cta ||
    campaign.headline ||
    campaign.image_url
  );
}

/** true se houver indícios de conteúdo de vídeo gerado */
export function hasGeneratedVideo(campaign: Campaign): boolean {
  return !!(
    campaign.reels_generated_at ||
    campaign.reels_script ||
    campaign.reels_hook ||
    campaign.reels_caption
  );
}

/** Retorna label da estratégia baseado no objetivo */
export function getCampaignStrategyLabel(campaign: Campaign): string {
  const o = (campaign.objective || "").toLowerCase();

  if (o.includes("promocao") || o.includes("queima")) return "OFERTA";
  if (o.includes("combo")) return "COMBO";
  if (o.includes("sazonal")) return "MOMENTO";
  if (o.includes("presente") || o.includes("gift")) return "PRESENTE";

  return "DESTAQUE";
}

/** Status resumido da campanha para listagem */
export function getCampaignListStatus(campaign: Campaign): "complete" | "art" | "video" | "content" | "none" {
  const hasArt = hasGeneratedArt(campaign);
  const hasVideo = hasGeneratedVideo(campaign);
  const hasContent = hasGeneratedCampaignContent(campaign);

  if (hasArt && hasVideo) return "complete";
  if (hasArt) return "art";
  if (hasVideo) return "video";
  if (hasContent) return "content";
  return "none";
}

/** Retorna string de status amigável */
export function getCampaignStatusLine(campaign: Campaign): string {
  const status = getCampaignListStatus(campaign);

  if (status === "complete") return "Campanha completa";
  if (status === "art") return "Arte pronta";
  if (status === "video") return "Vídeo pronto";
  if (status === "content") return "Conteúdo gerado";
  return "Sem conteúdo";
}