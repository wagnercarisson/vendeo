import { Campaign } from "./types";

/** true se a arte gerada pelo sistema estiver presente (imageUrl configurada pelo workflow) */
export function hasGeneratedArt(campaign: Campaign): boolean {
  return !!campaign.imageUrl;
}

/** true se houver qualquer imagem visual (arte gerada ou foto original do produto) */
export function hasAnyVisualAsset(campaign: Campaign): boolean {
  return !!(campaign.imageUrl || campaign.productImageUrl);
}

/** true se houver qualquer conteúdo de campanha gerado (texto ou imagem) */
export function hasGeneratedCampaignContent(campaign: Campaign): boolean {
  return !!(
    campaign.aiCaption ||
    campaign.aiText ||
    campaign.aiCta ||
    campaign.headline ||
    campaign.imageUrl
  );
}

/** true se houver indícios de conteúdo de vídeo gerado */
export function hasGeneratedVideo(campaign: Campaign): boolean {
  return !!(
    campaign.reelsGeneratedAt ||
    campaign.reelsScript ||
    campaign.reelsHook ||
    campaign.reelsCaption
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

/** Retorna string de status amigável (ex: "Arte pronta • Vídeo pronto") */
export function getCampaignStatusLine(campaign: Campaign): string {
  const parts: string[] = [];
  
  if (hasGeneratedArt(campaign)) parts.push("Arte pronta");
  if (hasGeneratedVideo(campaign)) parts.push("Vídeo pronto");
  
  if (parts.length === 0) return "Em processamento...";
  
  return parts.join(" • ");
}
