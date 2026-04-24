import sharp from "sharp";

import type { PixelArea } from "@/lib/ai/visual-composer/contracts";

import {
  PreparedProductImageSchema,
  type PreparedProductImage,
  type RendererProductImage,
} from "./contracts";

function isDataUrl(url: string): boolean {
  return url.startsWith("data:");
}

function decodeDataUrl(url: string): Buffer {
  const match = url.match(/^data:.*?;base64,(.*)$/);
  if (!match) {
    throw new Error("Unsupported data URL format");
  }

  return Buffer.from(match[1], "base64");
}

export async function loadAssetBuffer(url: string): Promise<Buffer> {
  if (isDataUrl(url)) {
    return decodeDataUrl(url);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load asset: ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function resolveExtractRegion(
  imageWidth: number,
  imageHeight: number,
  targetBox: NonNullable<RendererProductImage["targetBox"]>
) {
  const left = clamp(Math.round(targetBox.x * imageWidth), 0, Math.max(0, imageWidth - 1));
  const top = clamp(Math.round(targetBox.y * imageHeight), 0, Math.max(0, imageHeight - 1));
  const width = clamp(Math.round(targetBox.width * imageWidth), 1, imageWidth - left);
  const height = clamp(Math.round(targetBox.height * imageHeight), 1, imageHeight - top);

  return { left, top, width, height };
}

export async function prepareProductImage(
  productImage: RendererProductImage,
  productArea: PixelArea
): Promise<PreparedProductImage> {
  const sourceBuffer = await loadAssetBuffer(productImage.url);
  const baseImage = sharp(sourceBuffer, { failOn: "none" }).rotate();
  const metadata = await baseImage.metadata();

  let pipeline = sharp(sourceBuffer, { failOn: "none" }).rotate();
  if (productImage.targetBox && metadata.width && metadata.height) {
    pipeline = pipeline.extract(
      resolveExtractRegion(metadata.width, metadata.height, productImage.targetBox)
    );
  }

  const buffer = await pipeline
    .resize({
      width: productArea.width,
      height: productArea.height,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const resizedMetadata = await sharp(buffer).metadata();
  return PreparedProductImageSchema.parse({
    buffer,
    width: resizedMetadata.width ?? productArea.width,
    height: resizedMetadata.height ?? productArea.height,
    targetBox: productImage.targetBox ?? null,
    alert: productImage.targetBox ? undefined : "Produto não detectado - imagem completa usada",
  });
}

export async function prepareIdentityImage(url: string, size: { width: number; height: number }): Promise<Buffer> {
  const sourceBuffer = await loadAssetBuffer(url);
  return sharp(sourceBuffer, { failOn: "none" })
    .resize({
      width: size.width,
      height: size.height,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}