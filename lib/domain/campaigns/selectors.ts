import { Campaign } from "./types";

/**
 * Retorna true se a campanha possui rascunho ou arte pronta.
 */
export const hasArt = (c: Campaign): boolean => c.post_status !== "none" && c.post_status !== null;

/**
 * Retorna true se a campanha possui rascunho ou roteiro de vídeo pronto.
 */
export const hasVideo = (c: Campaign | any): boolean => c.reels_status !== "none" && c.reels_status !== null;

/**
 * Retorna true se a campanha tem qualquer asset visual (arte ou vídeo).
 */
export const hasAnyVisualAsset = (c: Campaign | any): boolean => hasArt(c) || hasVideo(c);

/**
 * Verifica se a campanha está pronta (ready ou approved) em qualquer formato esperado.
 */
export const isCampaignReady = (c: Campaign | any): boolean => {
    const s = getGlobalStatus(c);
    return s === "ready" || s === "approved";
};

/**
 * Calcula o estado visual da UI (Regra 1.2 do CAMPAIGN_FLOW_RULES.md)
 */
export const getUIStatus = (c: Campaign): "complete" | "art" | "video" | "none" => {
  const art = hasArt(c);
  const video = hasVideo(c);

  if (art && video) return "complete";
  if (art) return "art";
  if (video) return "video";
  return "none";
};

/**
 * Implementa a regra de hierarquia de status (Regra 1.1 do CAMPAIGN_FLOW_RULES.md)
 * draft < ready < approved
 */
export const getGlobalStatus = (c: Campaign): "draft" | "ready" | "approved" => {
  const statuses = [];
  
  if (c.campaign_type === "post" || c.campaign_type === "both") {
    statuses.push(c.post_status || "draft");
  }
  if (c.campaign_type === "reels" || c.campaign_type === "both") {
    statuses.push(c.reels_status || "draft");
  }

  if (statuses.length === 0) return (c.status as any) || "draft";

  if (statuses.includes("draft")) return "draft";
  if (statuses.includes("ready")) return "ready";
  return "approved";
};

/**
 * Verifica se a campanha está vinculada a um plano semanal.
 */
export const isFromPlan = (c: Campaign): boolean => c.origin === "plan";

/**
 * Verifica se os campos estratégicos devem estar bloqueados (Regra 7.1)
 */
export const isStrategyLocked = (c: Campaign | any): boolean => isFromPlan(c);

/**
 * Retorna o label estratégico (Regra 1.12 - Inferido do objetivo)
 */
export const getStrategicLabel = (c: Campaign | any): string => {
  switch (c.objective) {
    case "promocao":
    case "queima":
      return "OFERTA";
    case "combo":
      return "COMBO";
    case "sazonal":
      return "MOMENTO";
    case "visitas":
      return "VISITAS";
    case "engajamento":
      return "ENGAJAMENTO";
    case "informativo":
      return "INFO";
    case "institucional":
      return "MARCA";
    case "autoridade":
      return "AUTORIDADE";
    default:
      return "DESTAQUE";
  }
};

export interface DisplayBadge {
  label: string;
  variant: "approved" | "pending" | "none";
}

/**
 * Calcula os badges de status para exibição (Regra 1.2 adaptada)
 */
export const getCampaignDisplayStatuses = (c: Campaign | any): DisplayBadge[] => {
  const p = c.post_status || "none";
  const r = c.reels_status || "none";
  const type = c.campaign_type || "both";

  const labels: Record<string, string> = {
    draft: "Rascunho",
    ready: "Pendente",
    approved: "Aprovado",
  };

  const getVariant = (s: string): DisplayBadge["variant"] => {
    if (s === "approved") return "approved";
    if (s === "ready" || s === "draft") return "pending";
    return "none";
  };

  if (type === "post") {
    if (p === "none") return [{ label: "Sem arte", variant: "none" }];
    return [{ label: p === "approved" ? "Arte pronta" : labels[p], variant: getVariant(p) }];
  }
  if (type === "reels") {
    if (r === "none") return [{ label: "Sem vídeo", variant: "none" }];
    return [{ label: r === "approved" ? "Vídeo pronto" : labels[r], variant: getVariant(r) }];
  }

  // Se for 'both' ou nulo
  if (p === r) {
    if (p === "none") return [{ label: "Sem conteúdo", variant: "none" }];
    if (p === "approved") return [{ label: "Campanha completa", variant: "approved" }];
    return [{ label: labels[p], variant: getVariant(p) }];
  }

  const badges: DisplayBadge[] = [];
  if (p !== "none") badges.push({ label: p === "approved" ? "Arte pronta" : `Arte ${labels[p]}`, variant: getVariant(p) });
  if (r !== "none") badges.push({ label: r === "approved" ? "Vídeo pronto" : `Vídeo ${labels[r]}`, variant: getVariant(r) });

  return badges.length > 0 ? badges : [{ label: "Sem conteúdo", variant: "none" }];
};
