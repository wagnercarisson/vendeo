import { StrategyItem } from "./types";

/** Valida e normaliza o array de items retornado pela IA. */
export function normalizeStrategyItems(raw: unknown): StrategyItem[] {
  if (!raw || !Array.isArray(raw)) return [];

  return raw.filter(
    (item): item is StrategyItem =>
      item &&
      typeof item === "object" &&
      typeof item.day_of_week === "number" &&
      typeof item.audience === "string" &&
      typeof item.objective === "string" &&
      typeof item.positioning === "string" &&
      (item.content_type === "post" || item.content_type === "reels")
  );
}
