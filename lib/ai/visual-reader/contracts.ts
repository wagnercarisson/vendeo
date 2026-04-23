import { z } from "zod";

export const VisualReaderContentTypeSchema = z.enum([
  "product",
  "service",
  "message",
]);

export const NormalizedBoxSchema = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().gt(0).max(1),
    height: z.number().gt(0).max(1),
  })
  .strict()
  .refine((box) => box.x + box.width <= 1 + Number.EPSILON, {
    message: "targetBox must fit within image width",
  })
  .refine((box) => box.y + box.height <= 1 + Number.EPSILON, {
    message: "targetBox must fit within image height",
  });

export const VisualReaderInputSchema = z
  .object({
    imageUrl: z.string().url(),
    productName: z.string().trim().min(1),
    content_type: VisualReaderContentTypeSchema,
  })
  .strict();

// Intentionally removed from v2: targetLabel, category, campaignType,
// hasBackground, and backgroundNoise from the sandbox contract.

export const ImageProfileSchema = z
  .object({
    detected: z.boolean(),
    matchType: z.enum(["exact", "category_only", "none"]),
    matchedTarget: z.string().trim().min(1).nullable(),
    confidence: z.enum(["low", "medium", "high"]),
    sceneType: z.enum([
      "single_product",
      "multiple_products",
      "lifestyle_scene",
      "full_scene",
      "unclear",
    ]),
    relevantCount: z.number().int().min(0),
    ignoredElements: z.array(z.string().trim().min(1)),
    targetBox: NormalizedBoxSchema.nullable(),
    targetOrientation: z.enum([
      "vertical",
      "horizontal",
      "square",
      "mixed",
      "unknown",
    ]),
    targetPosition: z.enum([
      "left",
      "center",
      "right",
      "top",
      "bottom",
      "mixed",
      "unknown",
    ]),
    targetOccupancy: z.enum(["low", "medium", "high", "full"]),
    imageQuality: z.enum(["good", "acceptable", "poor", "unknown"]),
    visibility: z.enum(["clear", "partial", "obstructed", "unknown"]),
    framing: z.enum(["good", "tight", "distant", "unknown"]),
    backgroundType: z.enum(["transparent", "solid", "complex", "unknown"]),
    subjectCutoff: z.enum(["none", "light", "moderate", "severe", "unknown"]),
    safeExpansionPotential: z.enum(["low", "medium", "high", "unknown"]),
    focusClarity: z.enum(["low", "medium", "high", "unknown"]),
    visualIsolation: z.enum(["low", "medium", "high", "unknown"]),
    reasoningSummary: z.string(),
  })
  .strict()
  .superRefine((output, ctx) => {
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
          message: "matchedTarget must describe the visible similar product",
        });
      }
    }

    if (output.matchType === "none") {
      if (output.detected) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "detected must be false when matchType is none",
        });
      }

      if (output.targetBox !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "targetBox must be null when matchType is none",
        });
      }
    }
  });

export type NormalizedBox = z.infer<typeof NormalizedBoxSchema>;
export type VisualReaderContentType = z.infer<typeof VisualReaderContentTypeSchema>;
export type VisualReaderInput = z.infer<typeof VisualReaderInputSchema>;
export type ImageProfile = z.infer<typeof ImageProfileSchema>;

export function emptyImageProfile(reasoningSummary = "No visual analysis performed."): ImageProfile {
  return {
    detected: false,
    matchType: "none",
    matchedTarget: null,
    confidence: "low",
    sceneType: "unclear",
    relevantCount: 0,
    ignoredElements: [],
    targetBox: null,
    targetOrientation: "unknown",
    targetPosition: "unknown",
    targetOccupancy: "low",
    imageQuality: "unknown",
    visibility: "unknown",
    framing: "unknown",
    backgroundType: "unknown",
    subjectCutoff: "unknown",
    safeExpansionPotential: "unknown",
    focusClarity: "unknown",
    visualIsolation: "unknown",
    reasoningSummary,
  };
}