import type { CampaignObjective } from "@/lib/constants/strategy";

import { ContextTypeSchema, type ContextType } from "./contracts";

export type ContextProfileCharacteristics = {
  moodBias: "clean" | "aggressive" | "playful" | "premium";
  defaultPriceEmphasis: "low" | "medium" | "high";
  preferredIntensity: "minimal" | "balanced" | "strong";
  description: string;
};

export function deriveContextProfile(objective: CampaignObjective): ContextType {
  switch (objective) {
    case "sazonal":
      return "seasonal";
    case "promocao":
    case "combo":
      return "promotional";
    case "queima":
      return "urgency";
    case "institucional":
    case "autoridade":
      return "premium";
    default:
      return "standard";
  }
}

export const CONTEXT_PROFILE_CHARACTERISTICS: Record<
  ContextType,
  ContextProfileCharacteristics
> = {
  standard: {
    moodBias: "clean",
    defaultPriceEmphasis: "medium",
    preferredIntensity: "balanced",
    description: "Balanced day-to-day campaigns without strong urgency or ceremonial tone.",
  },
  promotional: {
    moodBias: "aggressive",
    defaultPriceEmphasis: "high",
    preferredIntensity: "strong",
    description: "High-conversion campaigns for promotions and combos with clear commercial emphasis.",
  },
  seasonal: {
    moodBias: "playful",
    defaultPriceEmphasis: "medium",
    preferredIntensity: "balanced",
    description: "Contextual campaigns for dates and seasons, expressive but not chaotic.",
  },
  premium: {
    moodBias: "premium",
    defaultPriceEmphasis: "low",
    preferredIntensity: "minimal",
    description: "Refined compositions for trust, authority, and elevated positioning.",
  },
  urgency: {
    moodBias: "aggressive",
    defaultPriceEmphasis: "high",
    preferredIntensity: "strong",
    description: "High-pressure campaigns for stock clearance and immediate action.",
  },
};

export function parseContextType(value: unknown): ContextType {
  return ContextTypeSchema.parse(value);
}