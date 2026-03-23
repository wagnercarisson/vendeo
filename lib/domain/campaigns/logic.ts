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
  
  if (status === "pending") {
    // Se global é pending mas algum status granular é ready, 
    // podemos ser mais específicos se quisermos, mas por enquanto mantemos "Aguardando aprovação"
    // para não quebrar a lógica legado se usada.
    return "Aguardando aprovação";
  }
  
  return "Sem conteúdo";
}

/**
 * Calcula o status global da campanha seguindo a escala: draft < ready < approved.
 */
export function calculateGlobalStatus(
  postStatus: string | null,
  reelsStatus: string | null,
  campaignType: string | null
): "draft" | "ready" | "approved" {
  const p = postStatus || "none";
  const r = reelsStatus || "none";
  const type = campaignType || "both";

  const scores: Record<string, number> = {
    none: 3, // none não "puxa" o status pra baixo se não for esperado
    draft: 0,
    ready: 1,
    approved: 2,
  };

  const pScore = scores[p] ?? 0;
  const rScore = scores[r] ?? 0;

  if (type === "post") return p as any;
  if (type === "reels") return r as any;

  // Para 'both', pega o mínimo entre os dois
  const minScore = Math.min(pScore, rScore);
  
  if (minScore === 0) return "draft";
  if (minScore === 1) return "ready";
  return "approved";
}

export interface DisplayBadge {
  label: string;
  variant: "approved" | "pending" | "none";
}

/**
 * Retorna os badges a serem exibidos na listagem.
 * Segue a lógica de "coalescência" (agrupamento) se os status forem iguais.
 */
export function getCampaignDisplayStatuses(campaign: Campaign): DisplayBadge[] {
  const p = campaign.post_status || "none";
  const r = campaign.reels_status || "none";
  const type = campaign.campaign_type || "both";

  const labels: Record<string, string> = {
    draft: "Rascunho",
    ready: "Aguardando aprovação",
    approved: "Aprovado",
  };

  const getVariant = (s: string): DisplayBadge["variant"] => {
    if (s === "approved") return "approved";
    if (s === "ready" || s === "draft") return "pending";
    return "none";
  };

  // Se for apenas um tipo, retorna apenas um badge
  if (type === "post") {
    if (p === "none") return [{ label: "Sem conteúdo", variant: "none" }];
    return [{ label: p === "approved" ? "Arte pronta" : labels[p] || p, variant: getVariant(p) }];
  }
  if (type === "reels") {
    if (r === "none") return [{ label: "Sem conteúdo", variant: "none" }];
    return [{ label: r === "approved" ? "Vídeo pronto" : labels[r] || r, variant: getVariant(r) }];
  }

  // Se for 'both' ou nulo
  if (p === r) {
    if (p === "none") return [{ label: "Sem conteúdo", variant: "none" }];
    if (p === "approved") return [{ label: "Campanha completa", variant: "approved" }];
    return [{ label: labels[p] || p, variant: getVariant(p) }];
  }

  // Estados diferentes: badges individuais
  const badges: DisplayBadge[] = [];
  
  if (p !== "none") {
    badges.push({ 
      label: p === "approved" ? "Arte pronta" : `Arte ${labels[p] || p}`, 
      variant: getVariant(p) 
    });
  }
  
  if (r !== "none") {
    badges.push({ 
      label: r === "approved" ? "Vídeo pronto" : `Vídeo ${labels[r] || r}`, 
      variant: getVariant(r) 
    });
  }

  if (badges.length === 0) return [{ label: "Sem conteúdo", variant: "none" }];
  
  return badges;
}
