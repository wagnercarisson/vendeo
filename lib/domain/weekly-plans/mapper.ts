import { StrategyItem } from "./types";

/** Valida e normaliza o array de items retornado pela IA. */
export function normalizeStrategyItems(raw: unknown): StrategyItem[] {
  if (!raw || !Array.isArray(raw)) return [];

  return raw
    .map((item: any) => {
      if (!item || typeof item !== "object") return null;
      
      const normalized: StrategyItem = {
        day_of_week: Number(item.day_of_week) || 0,
        audience: String(item.audience || ""),
        objective: String(item.objective || ""),
        positioning: String(item.positioning || ""),
        content_type: (item.content_type === "post" || item.content_type === "reels") 
          ? item.content_type 
          : "post",
        reasoning: String(item.reasoning || ""),
      };
      
      return normalized;
    })
    .filter((item): item is StrategyItem => item !== null);
}
