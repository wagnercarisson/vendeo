import type { ImageProfile } from "./contracts";

export type VisualReaderAlert = {
  code:
    | "MATCH_NONE"
    | "MATCH_CATEGORY_ONLY"
    | "IMAGE_QUALITY_POOR"
    | "VISIBILITY_OBSTRUCTED"
    | "FRAMING_DISTANT"
    | "CONFIDENCE_LOW";
  message: string;
};

export function getVisualReaderAlerts(profile: ImageProfile): VisualReaderAlert[] {
  const alerts: VisualReaderAlert[] = [];

  if (profile.matchType === "none") {
    alerts.push({
      code: "MATCH_NONE",
      message: "Produto nao encontrado na imagem. Verifique se a imagem corresponde ao produto.",
    });
  }

  if (profile.matchType === "category_only") {
    alerts.push({
      code: "MATCH_CATEGORY_ONLY",
      message: `A imagem parece ter um produto diferente do declarado (${profile.matchedTarget ?? "produto semelhante"}). Deseja continuar?`,
    });
  }

  if (profile.imageQuality === "poor") {
    alerts.push({
      code: "IMAGE_QUALITY_POOR",
      message: "A qualidade da imagem esta baixa. O resultado pode nao ser o ideal.",
    });
  }

  if (profile.visibility === "obstructed") {
    alerts.push({
      code: "VISIBILITY_OBSTRUCTED",
      message: "O produto parece estar parcialmente encoberto na imagem.",
    });
  }

  if (profile.framing === "distant") {
    alerts.push({
      code: "FRAMING_DISTANT",
      message: "O produto esta muito pequeno na imagem. Tente uma foto mais proxima.",
    });
  }

  if (profile.confidence === "low") {
    alerts.push({
      code: "CONFIDENCE_LOW",
      message: "A analise da imagem teve baixa confianca. Revise o resultado.",
    });
  }

  return alerts;
}