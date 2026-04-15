import { z } from "zod";

export const NormalizedBoxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
}).strict().refine(
  (box) => box.width > 0 && box.height > 0,
  {
    message: "width and height must be greater than 0",
  }
).refine(
  (box) => box.x + box.width <= 1 + Number.EPSILON && box.y + box.height <= 1 + Number.EPSILON,
  {
    message: "box must fit within normalized 0-1 coordinates",
  }
);

export const VisualReaderInputSchema = z.object({
  imageUrl: z.string().url(),
  targetLabel: z.string().min(1),
  productName: z.string().optional(),
  category: z.string().optional(),

  campaignType: z.enum(["single_product", "multiple_products", "info"]).optional(),
  content_type: z.string().optional(),
});

export const VisualReaderSchema = z.object({
  detected: z.boolean(),
  matchType: z.enum(["exact", "category_only", "none"]),
  matchedTarget: z.string().nullable(),
  sceneType: z.enum(["single_product", "multiple_products", "lifestyle_scene", "full_scene", "unclear"]),
  targetBox: NormalizedBoxSchema.nullable(),
  targetOrientation: z.enum(["vertical", "horizontal", "square", "mixed", "unknown"]),
  targetPosition: z.enum(["left", "center", "right", "top", "bottom", "mixed", "unknown"]),
  targetOccupancy: z.enum(["low", "medium", "high", "full"]),
  relevantCount: z.number().int().min(0),
  ignoredElements: z.array(z.string()),
  confidence: z.enum(["low", "medium", "high"]),
  imageQuality: z.enum(["good", "acceptable", "poor", "unknown"]),
  visibility: z.enum(["clear", "partial", "obstructed", "unknown"]),
  framing: z.enum(["good", "tight", "distant", "unknown"]),
  backgroundNoise: z.enum(["low", "medium", "high", "unknown"]),
  backgroundType: z.enum(["transparent", "solid", "simple", "complex", "unknown"]),
  hasBackground: z.union([
    z.boolean(),
    z.literal("true"),
    z.literal("false"),
    z.literal("unknown"),
  ]),
  subjectCutoff: z.enum(["none", "light", "moderate", "severe", "unknown"]),
  safeExpansionPotential: z.enum(["low", "medium", "high", "unknown"]),
  focusClarity: z.enum(["low", "medium", "high", "unknown"]),
  visualIsolation: z.enum(["low", "medium", "high", "unknown"]),
  reasoningSummary: z.string().min(1),
}).strict().superRefine((output, ctx) => {
  if (output.matchType === "exact") {
    if (!output.detected) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "detected must be true when matchType is exact",
      });
    }
    if (output.targetBox === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "targetBox must be present when matchType is exact",
      });
    }
    if (output.matchedTarget === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "matchedTarget must describe the exact matched product when matchType is exact",
      });
    }
  }

  if (output.matchType === "category_only") {
    if (output.detected) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "detected must be false when matchType is category_only",
      });
    }
    if (output.targetBox === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "targetBox must be present when matchType is category_only",
      });
    }
    if (output.matchedTarget === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "matchedTarget must describe the found category-only product",
      });
    }
  }

  if (output.matchType === "none") {
    if (output.targetBox !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "targetBox must be null when matchType is none",
      });
    }
  }

  if (output.matchType !== "exact" && output.detected) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "detected must be false unless matchType is exact",
    });
  }
});

export const VisualReaderOutputSchema = VisualReaderSchema;

export type NormalizedBox = z.infer<typeof NormalizedBoxSchema>;
export type VisualReaderInput = z.infer<typeof VisualReaderInputSchema>;
export type VisualReaderResult = z.infer<typeof VisualReaderSchema>;
export type VisualReaderOutput = VisualReaderResult;

export const DEFAULT_VISUAL_READER_OUTPUT: VisualReaderOutput = {
  detected: false,
  matchType: "none",
  matchedTarget: null,
  sceneType: "unclear",
  targetBox: null,
  targetOrientation: "unknown",
  targetPosition: "unknown",
  targetOccupancy: "low",
  relevantCount: 0,
  ignoredElements: [],
  confidence: "low",
  imageQuality: "unknown",
  visibility: "unknown",
  framing: "unknown",
  backgroundNoise: "unknown",
  backgroundType: "unknown",
  hasBackground: "unknown" as const,
  subjectCutoff: "unknown",
  safeExpansionPotential: "low",
  focusClarity: "unknown",
  visualIsolation: "low",
  reasoningSummary: "Leitura visual inválida.",
};
