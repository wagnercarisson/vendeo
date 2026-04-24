import {
  RendererBatchInputSchema,
  RendererInputSchema,
  RendererResultSchema,
  buildRendererStoragePath,
  type RendererBatchInput,
  type RendererInput,
  type RendererResult,
} from "./contracts";
import { renderVariationToBuffer } from "./canvas";
import { uploadRenderedArt, type RendererUploader } from "./storage";

export async function renderVariation(
  rawInput: RendererInput,
  options: { uploader?: RendererUploader; now?: () => number } = {}
): Promise<RendererResult> {
  const input = RendererInputSchema.parse(rawInput);
  const rendered = await renderVariationToBuffer(input, { now: options.now });
  const artUrl = await uploadRenderedArt({
    path: buildRendererStoragePath(input.campaignData.campaignId, input.campaignData.variationIndex),
    buffer: rendered.buffer,
    uploader: options.uploader,
  });

  return RendererResultSchema.parse({
    artUrl,
    metadata: rendered.metadata,
  });
}

export async function renderVariations(
  rawInput: RendererBatchInput,
  options: { uploader?: RendererUploader; now?: () => number } = {}
): Promise<RendererResult[]> {
  const input = RendererBatchInputSchema.parse(rawInput);
  return Promise.all(input.variations.map((variation) => renderVariation(variation, options)));
}