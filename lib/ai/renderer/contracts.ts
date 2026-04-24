import { z } from "zod";

import {
  CompositionSpecSchema,
  VISUAL_COMPOSER_CANVAS,
  type NormalizedBox,
} from "@/lib/ai/visual-composer/contracts";

export const RENDERER_COLORS = {
  background: "#F5F5F5",
  text: "#1F2937",
  badge: "#3B82F6",
  price: "#DC2626",
  badgeText: "#FFFFFF",
} as const;

export const RENDERER_FONT_FAMILY = "Inter";
export const RENDERER_FONT_FALLBACK = `${RENDERER_FONT_FAMILY}, system-ui, sans-serif`;
export const RENDERER_OUTPUT_BUCKET = "campaign-images";

export const RendererProductImageSchema = z.object({
  url: z.string().min(1),
  targetBox: z
    .object({
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
      width: z.number().positive().max(1),
      height: z.number().positive().max(1),
    })
    .strict()
    .nullable()
    .optional(),
});

export const RendererCampaignDataSchema = z.object({
  campaignId: z.string().min(1),
  variationIndex: z.number().int().min(0),
  productName: z.string().min(1),
  price: z.number().nullable(),
  description: z.string().optional(),
});

export const RendererVisualSignatureSchema = z.object({
  logo_url: z.string().min(1).nullable().optional(),
  store_name: z.string().min(1),
});

export const RendererInputSchema = z.object({
  spec: CompositionSpecSchema,
  productImage: RendererProductImageSchema,
  campaignData: RendererCampaignDataSchema,
  visualSignature: RendererVisualSignatureSchema,
});

export const RendererArtifactMetadataSchema = z.object({
  width: z.literal(VISUAL_COMPOSER_CANVAS.width),
  height: z.literal(VISUAL_COMPOSER_CANVAS.height),
  format: z.literal("png"),
  size: z.number().int().nonnegative(),
  renderTime: z.number().nonnegative(),
});

export const RendererResultSchema = z.object({
  artUrl: z.string().min(1),
  metadata: RendererArtifactMetadataSchema,
});

export const RendererBatchInputSchema = z.object({
  variations: z.array(RendererInputSchema).length(4),
});

export const PreparedProductImageSchema = z.object({
  buffer: z.instanceof(Buffer),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  targetBox: RendererProductImageSchema.shape.targetBox,
  alert: z.string().optional(),
});

export const RenderTextBlockResultSchema = z.object({
  lines: z.array(z.string()),
  fontSize: z.number().positive(),
  lineHeight: z.number().positive(),
  truncated: z.boolean(),
});

export const RendererAssetSourceSchema = z.object({
  kind: z.enum(["product", "logo"]),
  url: z.string().min(1),
});

export const RenderedBufferResultSchema = z.object({
  buffer: z.instanceof(Buffer),
  metadata: RendererArtifactMetadataSchema,
  alerts: z.array(z.string()),
});

export type RendererProductImage = z.infer<typeof RendererProductImageSchema>;
export type RendererCampaignData = z.infer<typeof RendererCampaignDataSchema>;
export type RendererVisualSignature = z.infer<typeof RendererVisualSignatureSchema>;
export type RendererInput = z.infer<typeof RendererInputSchema>;
export type RendererBatchInput = z.infer<typeof RendererBatchInputSchema>;
export type RendererArtifactMetadata = z.infer<typeof RendererArtifactMetadataSchema>;
export type RendererResult = z.infer<typeof RendererResultSchema>;
export type PreparedProductImage = z.infer<typeof PreparedProductImageSchema>;
export type RenderTextBlockResult = z.infer<typeof RenderTextBlockResultSchema>;
export type RendererAssetSource = z.infer<typeof RendererAssetSourceSchema>;
export type RenderedBufferResult = z.infer<typeof RenderedBufferResultSchema>;
export type RendererTargetBox = NormalizedBox;

export function buildRendererStoragePath(campaignId: string, variationIndex: number): string {
  return `campaigns/${campaignId}/variation-${variationIndex}.png`;
}

export function emptyRendererMetadata(): RendererArtifactMetadata {
  return {
    width: VISUAL_COMPOSER_CANVAS.width,
    height: VISUAL_COMPOSER_CANVAS.height,
    format: "png",
    size: 0,
    renderTime: 0,
  };
}