import { z } from "zod";

import {
  NormalizedBoxSchema,
  VisualReaderContentTypeSchema,
} from "@/lib/ai/visual-reader/contracts";
import { OBJECTIVE_VALUES } from "@/lib/constants/strategy";
import {
  AUDIENCE_VALUES,
  POSITIONING_VALUES,
} from "@/lib/domain/campaigns/schemas";

export const VISUAL_COMPOSER_CANVAS = {
  width: 1080,
  height: 1350,
} as const;

const PixelAreaSchema = z
  .object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().positive(),
    height: z.number().positive(),
  })
  .strict();

export const FontWeightSchema = z.enum(["400", "600", "700", "900"]);

/**
 * Typography specification for text elements in composition.
 *
 * @property fontSize Base font size in pixels.
 * @property fontWeight Font weight token. Accepts number or string and coerces to a string enum.
 * @property fontFamily Optional font family name returned by GPT for renderer consumption.
 * @property color Optional hex color in #RRGGBB format.
 * @property lineHeight Optional line-height multiplier for richer text spacing.
 */
export const TypographySpecSchema = z.object({
  fontSize: z.number().int().positive(),
  fontWeight: z.coerce.string().pipe(FontWeightSchema),
  fontFamily: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  lineHeight: z.number().positive().optional(),
});

const LayoutElementSchema = z.enum(["product", "price", "text"]);
const DirectionTypeSchema = z.enum([
  "hero",
  "frame",
  "split-dynamic",
  "overlay",
  "stacked",
]);
const MoodSchema = z.enum(["clean", "aggressive", "playful", "premium"]);
const ProductTreatmentSchema = z.enum(["framed", "background"]);
const TextDistributionSchema = z.enum(["left", "right", "center", "overlay"]);
const PriceEmphasisSchema = z.enum(["low", "medium", "high"]);
const VisualIntensitySchema = z.enum(["minimal", "balanced", "strong"]);
const ContextTypeSchema = z.enum([
  "standard",
  "promotional",
  "seasonal",
  "premium",
  "urgency",
]);

export const ImageProfileComposerInputSchema = z
  .object({
    targetBox: NormalizedBoxSchema.nullable(),
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
    targetOccupancy: z.enum(["low", "medium", "high", "full"]),
    backgroundType: z.enum(["transparent", "solid", "complex", "unknown"]),
    sceneType: z.enum([
      "single_product",
      "multiple_products",
      "lifestyle_scene",
      "full_scene",
      "unclear",
    ]),
    imageQuality: z.enum(["good", "acceptable", "poor", "unknown"]),
    visibility: z.enum(["clear", "partial", "obstructed", "unknown"]),
    framing: z.enum(["good", "tight", "distant", "unknown"]),
  })
  .strict();

export const CreativeDirectionSchema = z
  .object({
    directionType: DirectionTypeSchema,
    mood: MoodSchema,
    productTreatment: ProductTreatmentSchema,
    textDistribution: TextDistributionSchema,
    priceEmphasis: PriceEmphasisSchema,
    visualIntensity: VisualIntensitySchema,
  })
  .strict();

export const VisualSignatureComposerSchema = z
  .object({
    logo_url: z.string().url().nullable(),
    store_name_typography: z
      .object({
        font: z.string().optional(),
        weight: z.string().optional(),
      })
      .catchall(z.unknown()),
    signature_seed: z.string().min(1),
    intensity_level: VisualIntensitySchema,
    context_type: ContextTypeSchema,
  })
  .strict();

export const CampaignComposerDataSchema = z
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

export const CompositionAlertCodeSchema = z.enum([
  "PRODUCT_NOT_DETECTED",
  "LOW_DISTINCTNESS",
  "INVALID_LAYOUT",
]);

export const CompositionAlertSchema = z
  .object({
    code: CompositionAlertCodeSchema,
    severity: z.enum(["info", "warning", "error"]),
    message: z.string().min(1),
    action: z.string().min(1).optional(),
  })
  .strict();

export const CompositionInputSchema = z
  .object({
    image: ImageProfileComposerInputSchema,
    direction: CreativeDirectionSchema,
    signature: VisualSignatureComposerSchema,
    campaign: CampaignComposerDataSchema,
  })
  .strict();

export const CompositionSpecSchema = z
  .object({
    id: z.string().uuid(),
    seed: z.string().min(1),
    productName: z.string().min(1).optional(),
    layout: z
      .object({
        productArea: PixelAreaSchema,
        textArea: PixelAreaSchema,
        priceArea: PixelAreaSchema,
        badgeArea: PixelAreaSchema.optional(),
      })
      .strict(),
    hierarchy: z
      .object({
        primary: LayoutElementSchema,
        secondary: LayoutElementSchema,
        tertiary: LayoutElementSchema,
      })
      .strict(),
    spacing: z
      .object({
        padding: z.number().int().min(0),
        margins: z
          .object({
            top: z.number().int().min(0),
            right: z.number().int().min(0),
            bottom: z.number().int().min(0),
            left: z.number().int().min(0),
          })
          .strict(),
        gaps: z.number().int().min(0),
      })
      .strict(),
    typography: z
      .object({
        productName: TypographySpecSchema,
        price: TypographySpecSchema,
        description: TypographySpecSchema,
      })
      .strict(),
    decorative: z
      .object({
        priceBadge: z
          .object({
            shape: z.enum([
              "rounded-rect",
              "cloud",
              "star",
              "splash",
              "diamond",
              "oval",
              "tag",
            ]),
            position: z.object({ x: z.number(), y: z.number() }).strict(),
            size: z.object({ width: z.number().positive(), height: z.number().positive() }).strict(),
            rotation: z.number().min(0).max(360).optional(),
          })
          .nullable(),
        storeIdentity: z
          .object({
            type: z.enum(["logo", "text"]),
            position: z.enum([
              "top-left",
              "top-center",
              "top-right",
              "bottom-left",
              "bottom-center",
              "bottom-right",
            ]),
            size: z.object({ width: z.number().positive(), height: z.number().positive() }).strict(),
          })
          .strict(),
        promotionalTitle: z
          .object({
            text: z.string().min(1),
            position: z.enum(["top", "bottom"]),
            fontSize: z.number().int().positive(),
            fontWeight: z.enum(["600", "700", "900"]),
          })
          .optional(),
      })
      .strict(),
  })
  .superRefine((spec, ctx) => {
    const elements = [spec.hierarchy.primary, spec.hierarchy.secondary, spec.hierarchy.tertiary];
    if (new Set(elements).size !== 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "hierarchy elements must be unique",
        path: ["hierarchy"],
      });
    }

    if (
      spec.typography.price.fontSize < spec.typography.productName.fontSize &&
      spec.hierarchy.primary === "price"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "primary price layouts must not shrink price below productName",
        path: ["typography", "price", "fontSize"],
      });
    }
  });

export const CompositionVariantsSchema = z
  .object({
    direction: CreativeDirectionSchema,
    variations: z.array(CompositionSpecSchema).refine((variations) => variations.length === 0 || variations.length === 4, {
      message: "variations must be empty for gate bypass or contain exactly 4 items",
    }),
    canvas: z
      .object({
        width: z.literal(VISUAL_COMPOSER_CANVAS.width),
        height: z.literal(VISUAL_COMPOSER_CANVAS.height),
      })
      .strict(),
    generated_at: z.string().datetime(),
  })
  .strict();

export type PixelArea = z.infer<typeof PixelAreaSchema>;
export type CompositionInput = z.infer<typeof CompositionInputSchema>;
export type CreativeDirection = z.infer<typeof CreativeDirectionSchema>;
export type CampaignComposerData = z.infer<typeof CampaignComposerDataSchema>;
export type VisualSignatureComposer = z.infer<typeof VisualSignatureComposerSchema>;
export type ImageProfileComposerInput = z.infer<typeof ImageProfileComposerInputSchema>;
export type CompositionAlert = z.infer<typeof CompositionAlertSchema>;
export type CompositionSpec = z.infer<typeof CompositionSpecSchema>;
export type CompositionVariants = z.infer<typeof CompositionVariantsSchema>;
export type NormalizedBox = z.infer<typeof NormalizedBoxSchema>;

export function emptyCompositionVariants(
  direction: CreativeDirection = emptyCreativeDirection()
): CompositionVariants {
  return {
    direction,
    variations: [],
    canvas: { ...VISUAL_COMPOSER_CANVAS },
    generated_at: new Date().toISOString(),
  };
}

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

export function normalizedBoxToPixels(box: NormalizedBox): PixelArea {
  return {
    x: Math.round(box.x * VISUAL_COMPOSER_CANVAS.width),
    y: Math.round(box.y * VISUAL_COMPOSER_CANVAS.height),
    width: Math.round(box.width * VISUAL_COMPOSER_CANVAS.width),
    height: Math.round(box.height * VISUAL_COMPOSER_CANVAS.height),
  };
}
