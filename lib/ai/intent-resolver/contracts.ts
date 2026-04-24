import { z } from "zod";

import { VisualReaderContentTypeSchema } from "@/lib/ai/visual-reader/contracts";
import { OBJECTIVE_VALUES } from "@/lib/constants/strategy";
import {
  AUDIENCE_VALUES,
  POSITIONING_VALUES,
} from "@/lib/domain/campaigns/schemas";

export const ContextTypeSchema = z.enum([
  "standard",
  "promotional",
  "seasonal",
  "premium",
  "urgency",
]);

export const ImageProfileIntentInputSchema = z
  .object({
    backgroundType: z.enum(["transparent", "solid", "complex", "unknown"]),
    targetOccupancy: z.enum(["low", "medium", "high", "full"]),
    sceneType: z.enum([
      "single_product",
      "multiple_products",
      "lifestyle_scene",
      "full_scene",
      "unclear",
    ]),
    visibility: z.enum(["clear", "partial", "obstructed", "unknown"]),
    framing: z.enum(["good", "tight", "distant", "unknown"]),
    imageQuality: z.enum(["good", "acceptable", "poor", "unknown"]),
    matchType: z.enum(["exact", "category_only", "none"]),
    targetPosition: z.enum([
      "left",
      "center",
      "right",
      "top",
      "bottom",
      "mixed",
      "unknown",
    ]),
    targetOrientation: z.enum([
      "vertical",
      "horizontal",
      "square",
      "mixed",
      "unknown",
    ]),
  })
  .strict();

export const CampaignDataSchema = z
  .object({
    content_type: VisualReaderContentTypeSchema,
    objective: z.enum(OBJECTIVE_VALUES),
    price: z.number().nullable(),
    price_label: z.string().nullable(),
    product_name: z.string().nullable(),
    audience: z.enum(AUDIENCE_VALUES),
    product_positioning: z.enum(POSITIONING_VALUES).nullable(),
  })
  .strict();

export const TypographySettingsSchema = z
  .object({
    font: z.string().optional(),
    weight: z.string().optional(),
  })
  .catchall(z.unknown());

export const JsonRulesSchema = z.record(z.unknown());

export const VisualSignatureSchema = z
  .object({
    id: z.string().uuid().optional(),
    primary_color: z.string(),
    secondary_color: z.string(),
    logo_url: z.string().nullable(),
    store_name_typography: TypographySettingsSchema,
    signature_seed: z.string(),
    intensity_level: z.enum(["minimal", "balanced", "strong"]),
    composition_rules: JsonRulesSchema,
    typography_rules: JsonRulesSchema,
    color_rules: JsonRulesSchema,
    context_type: ContextTypeSchema,
  })
  .strict();

export const IntentResolverInputSchema = z
  .object({
    image: ImageProfileIntentInputSchema,
    campaign: CampaignDataSchema,
    signature: VisualSignatureSchema,
  })
  .strict();

export const CreativeDirectionSchema = z
  .object({
    directionType: z.enum(["hero", "frame", "split-dynamic", "overlay", "stacked"]),
    mood: z.enum(["clean", "aggressive", "playful", "premium"]),
    productTreatment: z.enum(["framed", "background"]),
    textDistribution: z.enum(["left", "right", "center", "overlay"]),
    priceEmphasis: z.enum(["low", "medium", "high"]),
    visualIntensity: z.enum(["minimal", "balanced", "strong"]),
  })
  .strict();

export type ContextType = z.infer<typeof ContextTypeSchema>;
export type ImageProfileIntentInput = z.infer<typeof ImageProfileIntentInputSchema>;
export type CampaignData = z.infer<typeof CampaignDataSchema>;
export type VisualSignature = z.infer<typeof VisualSignatureSchema>;
export type IntentResolverInput = z.infer<typeof IntentResolverInputSchema>;
export type CreativeDirection = z.infer<typeof CreativeDirectionSchema>;

export function emptyCreativeDirection(): CreativeDirection {
  return {
    directionType: "frame",
    mood: "clean",
    productTreatment: "framed",
    textDistribution: "center",
    priceEmphasis: "low",
    visualIntensity: "minimal",
  };
}