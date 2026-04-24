import sharp from "sharp";

import { areasOverlap } from "@/lib/ai/visual-composer/validation";

import {
  RENDERER_COLORS,
  RendererInputSchema,
  RenderedBufferResultSchema,
  type RendererInput,
  type RenderedBufferResult,
} from "./contracts";
import { ensureRendererFontsLoaded } from "./fonts";
import { formatBrlPrice } from "./formatters";
import { prepareIdentityImage, prepareProductImage } from "./image";
import { buildBadgeSvg, buildRoundedPillSvg } from "./shapes";
import { buildTextOverlay } from "./text";

function resolveStoreIdentityOrigin(
  position: RendererInput["spec"]["decorative"]["storeIdentity"]["position"],
  size: { width: number; height: number }
) {
  const margin = 40;
  const canvasWidth = 1080;
  const canvasHeight = 1350;

  switch (position) {
    case "top-left":
      return { x: margin, y: margin };
    case "top-center":
      return { x: Math.round((canvasWidth - size.width) / 2), y: margin };
    case "top-right":
      return { x: canvasWidth - size.width - margin, y: margin };
    case "bottom-left":
      return { x: margin, y: canvasHeight - size.height - margin };
    case "bottom-center":
      return { x: Math.round((canvasWidth - size.width) / 2), y: canvasHeight - size.height - margin };
    case "bottom-right":
      return { x: canvasWidth - size.width - margin, y: canvasHeight - size.height - margin };
  }
}

async function drawProduct(input: RendererInput, alerts: string[]) {
  const prepared = await prepareProductImage(input.productImage, input.spec.layout.productArea);
  if (prepared.alert) {
    alerts.push(prepared.alert);
  }

  return {
    input: prepared.buffer,
    left: input.spec.layout.productArea.x,
    top: input.spec.layout.productArea.y,
  } as const;
}

function drawProductName(input: RendererInput) {
  const overlayShadow = areasOverlap(input.spec.layout.productArea, input.spec.layout.textArea);

  return buildTextOverlay(input.campaignData.productName, input.spec.layout.textArea, {
    fontSize: input.spec.typography.productName.fontSize,
    fontWeight: input.spec.typography.productName.fontWeight,
    fillStyle: RENDERER_COLORS.text,
    align: "center",
    verticalAlign: "middle",
    shadow: overlayShadow,
  }).buffer;
}

function drawPrice(input: RendererInput): Buffer | null {
  const formattedPrice = formatBrlPrice(input.campaignData.price);
  if (!formattedPrice) {
    return null;
  }

  const overlayShadow = areasOverlap(input.spec.layout.productArea, input.spec.layout.priceArea);
  return buildTextOverlay(formattedPrice, input.spec.layout.priceArea, {
    fontSize: input.spec.typography.price.fontSize,
    fontWeight: input.spec.typography.price.fontWeight,
    fillStyle: RENDERER_COLORS.price,
    align: "center",
    verticalAlign: "middle",
    shadow: overlayShadow,
  }).buffer;
}

function drawPromotionalTitle(input: RendererInput): Buffer | null {
  const promo = input.spec.decorative.promotionalTitle;
  if (!promo) {
    return null;
  }

  const area = {
    x: 120,
    y: promo.position === "top" ? 30 : 1200,
    width: 840,
    height: 60,
  };

  return buildTextOverlay(promo.text, area, {
    fontSize: promo.fontSize,
    fontWeight: promo.fontWeight,
    fillStyle: RENDERER_COLORS.text,
    align: "center",
    verticalAlign: "middle",
  }).buffer;
}

async function drawStoreIdentity(input: RendererInput) {
  const identity = input.spec.decorative.storeIdentity;
  const origin = resolveStoreIdentityOrigin(identity.position, identity.size);

  if (identity.type === "logo" && input.visualSignature.logo_url) {
    const logoBuffer = await prepareIdentityImage(input.visualSignature.logo_url, identity.size);
    return [{ input: logoBuffer, left: origin.x, top: origin.y }];
  }

  return [
    { input: buildRoundedPillSvg(origin.x, origin.y, identity.size.width, identity.size.height, "rgba(31,41,55,0.16)") },
    { input: buildTextOverlay(input.visualSignature.store_name, {
    x: origin.x + 12,
    y: origin.y + 8,
    width: identity.size.width - 24,
    height: identity.size.height - 16,
  }, {
    fontSize: 22,
    fontWeight: "700",
    fillStyle: RENDERER_COLORS.text,
    align: "center",
    verticalAlign: "middle",
  }).buffer },
  ];
}

function drawMissingTargetAlert(alerts: string[]): Buffer[] {
  if (alerts.length === 0) {
    return [];
  }

  const text = alerts[0];
  const width = Math.min(420, Math.ceil(text.length * 11) + 32);
  const x = 40;
  const y = 1290;
  return [
    buildRoundedPillSvg(x, y, width, 34, "rgba(220, 38, 38, 0.10)"),
    buildTextOverlay(text, { x: x + 16, y: y + 5, width: width - 24, height: 24 }, {
      fontSize: 18,
      fontWeight: "700",
      fillStyle: RENDERER_COLORS.price,
      align: "left",
      verticalAlign: "middle",
    }).buffer,
  ];
}

export async function renderVariationToBuffer(
  rawInput: RendererInput,
  options: { now?: () => number } = {}
): Promise<RenderedBufferResult> {
  const input = RendererInputSchema.parse(rawInput);
  const now = options.now ?? (() => Date.now());
  const startedAt = now();
  ensureRendererFontsLoaded();
  const alerts: string[] = [];

  const composites: sharp.OverlayOptions[] = [await drawProduct(input, alerts)];
  if (input.spec.decorative.priceBadge && input.campaignData.price != null) {
    composites.push({ input: buildBadgeSvg(input.spec.decorative.priceBadge) });
  }

  composites.push({ input: drawProductName(input) });
  const priceOverlay = drawPrice(input);
  if (priceOverlay) {
    composites.push({ input: priceOverlay });
  }
  composites.push(...(await drawStoreIdentity(input)));
  const promoOverlay = drawPromotionalTitle(input);
  if (promoOverlay) {
    composites.push({ input: promoOverlay });
  }
  composites.push(...drawMissingTargetAlert(alerts).map((input) => ({ input })));

  const buffer = await sharp({
    create: {
      width: 1080,
      height: 1350,
      channels: 4,
      background: RENDERER_COLORS.background,
    },
  })
    .composite(composites)
    .png()
    .toBuffer();
  return RenderedBufferResultSchema.parse({
    buffer,
    metadata: {
      width: 1080,
      height: 1350,
      format: "png",
      size: buffer.byteLength,
      renderTime: now() - startedAt,
    },
    alerts,
  });
}