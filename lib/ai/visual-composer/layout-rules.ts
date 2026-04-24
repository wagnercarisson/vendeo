import { randomUUID } from "node:crypto";

import {
  VISUAL_COMPOSER_CANVAS,
  normalizedBoxToPixels,
  type CompositionInput,
  type CompositionSpec,
  type PixelArea,
} from "./contracts";

const OBJECTIVE_TO_PROMOTIONAL_TITLE: Partial<Record<CompositionInput["campaign"]["objective"], string>> = {
  promocao: "SUPER OFERTAS",
  queima: "QUEIMA DE ESTOQUE",
  sazonal: "OFERTAS DA TEMPORADA",
  combo: "COMBO ESPECIAL",
};

type VariationPreset = {
  xShift: number;
  yShift: number;
  scale: number;
  textBias: "left" | "right" | "center" | "top" | "bottom";
  priceBias: "top" | "bottom" | "left" | "right";
};

type FullOccupancyHeroPreset = {
  productArea: PixelArea;
  textArea: PixelArea;
  priceArea: PixelArea;
  badgeArea: PixelArea;
  promotionalPosition: "top" | "bottom";
  storeIdentityPosition: CompositionSpec["decorative"]["storeIdentity"]["position"];
};

const VARIATION_PRESETS: Record<CompositionInput["direction"]["directionType"], VariationPreset[]> = {
  hero: [
    { xShift: -180, yShift: 20, scale: 1.08, textBias: "right", priceBias: "bottom" },
    { xShift: 180, yShift: -20, scale: 1.04, textBias: "left", priceBias: "top" },
    { xShift: 0, yShift: -80, scale: 0.96, textBias: "bottom", priceBias: "right" },
    { xShift: 80, yShift: 220, scale: 0.96, textBias: "top", priceBias: "left" },
  ],
  frame: [
    { xShift: 0, yShift: 0, scale: 0.9, textBias: "bottom", priceBias: "right" },
    { xShift: -220, yShift: -120, scale: 0.74, textBias: "right", priceBias: "top" },
    { xShift: 220, yShift: -120, scale: 0.74, textBias: "left", priceBias: "top" },
    { xShift: 0, yShift: 120, scale: 0.76, textBias: "top", priceBias: "left" },
  ],
  "split-dynamic": [
    { xShift: -220, yShift: 0, scale: 0.82, textBias: "right", priceBias: "bottom" },
    { xShift: 220, yShift: 0, scale: 0.82, textBias: "left", priceBias: "bottom" },
    { xShift: -140, yShift: -120, scale: 0.74, textBias: "right", priceBias: "top" },
    { xShift: 140, yShift: 120, scale: 0.74, textBias: "left", priceBias: "top" },
  ],
  overlay: [
    { xShift: 0, yShift: 0, scale: 1.18, textBias: "top", priceBias: "right" },
    { xShift: -80, yShift: 0, scale: 1.1, textBias: "bottom", priceBias: "left" },
    { xShift: 80, yShift: -80, scale: 1.14, textBias: "left", priceBias: "bottom" },
    { xShift: 0, yShift: 80, scale: 1.06, textBias: "right", priceBias: "top" },
  ],
  stacked: [
    { xShift: 0, yShift: -180, scale: 0.82, textBias: "bottom", priceBias: "bottom" },
    { xShift: 0, yShift: 180, scale: 0.82, textBias: "top", priceBias: "top" },
    { xShift: -120, yShift: -100, scale: 0.74, textBias: "bottom", priceBias: "right" },
    { xShift: 120, yShift: 100, scale: 0.74, textBias: "top", priceBias: "left" },
  ],
};

const FULL_OCCUPANCY_HERO_PRESETS: FullOccupancyHeroPreset[] = [
  {
    productArea: { x: 40, y: 80, width: 1000, height: 1120 },
    textArea: { x: 60, y: 1220, width: 480, height: 100 },
    priceArea: { x: 560, y: 1220, width: 460, height: 100 },
    badgeArea: { x: 780, y: 140, width: 240, height: 240 },
    promotionalPosition: "top",
    storeIdentityPosition: "top-left",
  },
  {
    productArea: { x: 40, y: 80, width: 1000, height: 1120 },
    textArea: { x: 540, y: 1220, width: 480, height: 100 },
    priceArea: { x: 60, y: 1220, width: 420, height: 100 },
    badgeArea: { x: 60, y: 140, width: 240, height: 240 },
    promotionalPosition: "top",
    storeIdentityPosition: "top-right",
  },
  {
    productArea: { x: 40, y: 300, width: 1000, height: 900 },
    textArea: { x: 60, y: 30, width: 480, height: 100 },
    priceArea: { x: 560, y: 30, width: 460, height: 100 },
    badgeArea: { x: 780, y: 960, width: 240, height: 240 },
    promotionalPosition: "bottom",
    storeIdentityPosition: "bottom-left",
  },
  {
    productArea: { x: 40, y: 300, width: 1000, height: 900 },
    textArea: { x: 540, y: 30, width: 480, height: 100 },
    priceArea: { x: 60, y: 30, width: 420, height: 100 },
    badgeArea: { x: 60, y: 960, width: 240, height: 240 },
    promotionalPosition: "bottom",
    storeIdentityPosition: "bottom-right",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function fitArea(area: PixelArea): PixelArea {
  const width = clamp(area.width, 40, VISUAL_COMPOSER_CANVAS.width);
  const height = clamp(area.height, 40, VISUAL_COMPOSER_CANVAS.height);

  return {
    width,
    height,
    x: clamp(area.x, 0, VISUAL_COMPOSER_CANVAS.width - width),
    y: clamp(area.y, 0, VISUAL_COMPOSER_CANVAS.height - height),
  };
}

function overlaps(a: PixelArea, b: PixelArea) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

function getSpacing(input: CompositionInput) {
  const intensityScore = {
    minimal: 3,
    balanced: 2,
    strong: 1,
  }[input.direction.visualIntensity] + {
    minimal: 1,
    balanced: 0,
    strong: -1,
  }[input.signature.intensity_level];

  if (intensityScore >= 4) {
    return {
      padding: 76,
      margins: { top: 56, right: 56, bottom: 56, left: 56 },
      gaps: 36,
    };
  }

  if (intensityScore <= 1) {
    return {
      padding: 28,
      margins: { top: 16, right: 16, bottom: 16, left: 16 },
      gaps: 14,
    };
  }

  return {
    padding: 48,
    margins: { top: 28, right: 28, bottom: 28, left: 28 },
    gaps: 24,
  };
}

function getBaseProductArea(input: CompositionInput): PixelArea {
  if (input.image.targetBox) {
    return normalizedBoxToPixels(input.image.targetBox);
  }

  const sizeByOrientation = {
    vertical: { width: 520, height: 900 },
    horizontal: { width: 840, height: 620 },
    square: { width: 760, height: 760 },
    mixed: { width: 700, height: 760 },
    unknown: { width: 720, height: 720 },
  }[input.image.targetOrientation];

  return {
    x: Math.round((VISUAL_COMPOSER_CANVAS.width - sizeByOrientation.width) / 2),
    y: Math.round((VISUAL_COMPOSER_CANVAS.height - sizeByOrientation.height) / 2),
    width: sizeByOrientation.width,
    height: sizeByOrientation.height,
  };
}

function applyPreset(base: PixelArea, preset: VariationPreset): PixelArea {
  return fitArea({
    x: Math.round(base.x + preset.xShift),
    y: Math.round(base.y + preset.yShift),
    width: Math.round(base.width * preset.scale),
    height: Math.round(base.height * preset.scale),
  });
}

function getHeroProductArea(input: CompositionInput, preset: VariationPreset) {
  const base = input.image.targetBox ? normalizedBoxToPixels(input.image.targetBox) : getBaseProductArea(input);
  const heroSize = {
    vertical: { width: 620, height: 760 },
    horizontal: { width: 820, height: 560 },
    square: { width: 700, height: 700 },
    mixed: { width: 680, height: 720 },
    unknown: { width: 680, height: 720 },
  }[input.image.targetOrientation];
  const boosted = fitArea({
    x: clamp(base.x - 40, 60, VISUAL_COMPOSER_CANVAS.width - heroSize.width - 60),
    y: 280,
    width: Math.max(base.width, heroSize.width),
    height: Math.min(Math.max(base.height, heroSize.height), 780),
  });
  return applyPreset(boosted, preset);
}

function getFrameProductArea(input: CompositionInput, preset: VariationPreset) {
  const base = getBaseProductArea(input);
  const framed = fitArea({
    x: Math.round((VISUAL_COMPOSER_CANVAS.width - base.width * 0.88) / 2),
    y: Math.round((VISUAL_COMPOSER_CANVAS.height - base.height * 0.88) / 2) + 80,
    width: Math.round(base.width * 0.88),
    height: Math.round(base.height * 0.88),
  });
  return applyPreset(framed, preset);
}

function getSplitProductArea(input: CompositionInput, preset: VariationPreset) {
  const leftAnchored = preset.xShift < 0;
  return fitArea({
    x: leftAnchored ? 40 : 500,
    y: 170 + Math.round(preset.yShift / 2),
    width: 500,
    height: 900,
  });
}

function getOverlayProductArea(input: CompositionInput, preset: VariationPreset) {
  const base = getBaseProductArea(input);
  return fitArea({
    x: Math.round(base.x + preset.xShift / 3),
    y: Math.round(base.y + preset.yShift / 3),
    width: Math.max(base.width, 860),
    height: Math.max(base.height, 1080),
  });
}

function getStackedProductArea(_input: CompositionInput, preset: VariationPreset) {
  const topAnchored = preset.yShift <= 0;
  return fitArea({
    x: 150 + Math.round(preset.xShift / 2),
    y: topAnchored ? 80 : 420,
    width: 780,
    height: 560,
  });
}

function getProductArea(input: CompositionInput, variationIndex: number) {
  const preset = VARIATION_PRESETS[input.direction.directionType][variationIndex];

  if (input.image.targetOccupancy === "full" && input.direction.directionType === "hero") {
    return FULL_OCCUPANCY_HERO_PRESETS[variationIndex].productArea;
  }

  switch (input.direction.directionType) {
    case "hero":
      return getHeroProductArea(input, preset);
    case "frame":
      return getFrameProductArea(input, preset);
    case "split-dynamic":
      return getSplitProductArea(input, preset);
    case "overlay":
      return getOverlayProductArea(input, preset);
    case "stacked":
      return getStackedProductArea(input, preset);
  }
}

function getTextArea(
  input: CompositionInput,
  variationIndex: number,
  productArea: PixelArea,
  spacing: ReturnType<typeof getSpacing>
): PixelArea {
  const preset = VARIATION_PRESETS[input.direction.directionType][variationIndex];
  if (input.image.targetOccupancy === "full" && input.direction.directionType === "hero") {
    return FULL_OCCUPANCY_HERO_PRESETS[variationIndex].textArea;
  }

  let bias = input.direction.textDistribution === "overlay"
    ? preset.textBias
    : input.direction.textDistribution === "center"
      ? preset.textBias === "top" || preset.textBias === "bottom"
        ? preset.textBias
        : "center"
      : input.direction.textDistribution;

  if ((input.direction.directionType === "hero" || input.direction.directionType === "frame") && bias === "center") {
    bias = variationIndex % 2 === 0 ? "top" : "bottom";
  }

  switch (input.direction.directionType) {
    case "split-dynamic":
      const productCenterX = productArea.x + productArea.width / 2;
      return fitArea({
        x: productCenterX < VISUAL_COMPOSER_CANVAS.width / 2
          ? productArea.x + productArea.width + spacing.gaps
          : spacing.margins.left,
        y: preset.priceBias === "top" ? 520 : 170,
        width: preset.priceBias === "top" ? 400 : 420,
        height: preset.priceBias === "top" ? 360 : 520,
      });
    case "stacked":
      return fitArea({
        x: 90,
        y: productArea.y < VISUAL_COMPOSER_CANVAS.height / 2 ? productArea.y + productArea.height + spacing.gaps : 90,
        width: 900,
        height: 280,
      });
    case "overlay":
      return fitArea({
        x: bias === "left" ? 60 : bias === "right" ? 500 : 120,
        y: bias === "top" ? 80 : bias === "bottom" ? 880 : 520,
        width: 460,
        height: 220,
      });
    case "hero":
    case "frame":
    default:
      if (bias === "top" || bias === "bottom") {
        return fitArea({
          x: 140,
          y: bias === "top"
            ? Math.max(spacing.margins.top, productArea.y - 220)
            : Math.min(
                VISUAL_COMPOSER_CANVAS.height - 200 - spacing.margins.bottom,
                productArea.y + productArea.height + spacing.gaps
              ),
          width: 800,
          height: 200,
        });
      }

      return fitArea({
        x: bias === "left" ? 60 : bias === "right" ? 560 : 140,
        y: clamp(productArea.y + Math.round(productArea.height / 2) - 100, spacing.margins.top, VISUAL_COMPOSER_CANVAS.height - 200 - spacing.margins.bottom),
        width: bias === "center" ? 800 : 360,
        height: 200,
      });
  }
}

function getPriceArea(
  input: CompositionInput,
  variationIndex: number,
  productArea: PixelArea,
  textArea: PixelArea,
  spacing: ReturnType<typeof getSpacing>
): PixelArea {
  const preset = VARIATION_PRESETS[input.direction.directionType][variationIndex];
  if (input.image.targetOccupancy === "full" && input.direction.directionType === "hero") {
    return FULL_OCCUPANCY_HERO_PRESETS[variationIndex].priceArea;
  }

  const width = input.direction.priceEmphasis === "high" ? 280 : 220;
  const height = input.direction.priceEmphasis === "high" ? 180 : 140;

  if (input.direction.directionType === "overlay") {
    return fitArea({
      x: preset.priceBias === "left" ? 60 : preset.priceBias === "right" ? 760 : 430,
      y: preset.priceBias === "top" ? 80 : 1080,
      width,
      height,
    });
  }

  const preferredCandidates = {
    top: [
      { x: textArea.x, y: textArea.y - height - spacing.gaps },
      { x: textArea.x + textArea.width - width, y: textArea.y - height - spacing.gaps },
      { x: textArea.x, y: textArea.y + textArea.height + spacing.gaps },
      { x: VISUAL_COMPOSER_CANVAS.width - spacing.margins.right - width, y: spacing.margins.top },
    ],
    bottom: [
      { x: textArea.x, y: textArea.y + textArea.height + spacing.gaps },
      { x: textArea.x + textArea.width - width, y: textArea.y + textArea.height + spacing.gaps },
      { x: textArea.x + textArea.width - width, y: textArea.y - height - spacing.gaps },
      { x: VISUAL_COMPOSER_CANVAS.width - spacing.margins.right - width, y: VISUAL_COMPOSER_CANVAS.height - spacing.margins.bottom - height },
    ],
    left: [
      { x: textArea.x, y: textArea.y + textArea.height + spacing.gaps },
      { x: textArea.x, y: textArea.y - height - spacing.gaps },
      { x: spacing.margins.left, y: VISUAL_COMPOSER_CANVAS.height - spacing.margins.bottom - height },
      { x: spacing.margins.left, y: spacing.margins.top },
    ],
    right: [
      { x: textArea.x + textArea.width - width, y: textArea.y + textArea.height + spacing.gaps },
      { x: textArea.x + textArea.width - width, y: textArea.y - height - spacing.gaps },
      { x: VISUAL_COMPOSER_CANVAS.width - spacing.margins.right - width, y: spacing.margins.top },
      { x: VISUAL_COMPOSER_CANVAS.width - spacing.margins.right - width, y: VISUAL_COMPOSER_CANVAS.height - spacing.margins.bottom - height },
    ],
  }[preset.priceBias];

  for (const candidate of preferredCandidates) {
    const fitted = fitArea({ ...candidate, width, height });
    if (!overlaps(fitted, productArea) && !overlaps(fitted, textArea)) {
      return fitted;
    }
  }

  const fallback = fitArea({
    x: productArea.x < VISUAL_COMPOSER_CANVAS.width / 2
      ? VISUAL_COMPOSER_CANVAS.width - spacing.margins.right - width
      : spacing.margins.left,
    y: productArea.y < VISUAL_COMPOSER_CANVAS.height / 2
      ? VISUAL_COMPOSER_CANVAS.height - spacing.margins.bottom - height
      : spacing.margins.top,
    width,
    height,
  });

  return fallback;
}

function getBadgeArea(
  input: CompositionInput,
  productArea: PixelArea,
  textArea: PixelArea,
  priceArea: PixelArea,
  variationIndex: number
): PixelArea | undefined {
  if (input.campaign.price == null) {
    return undefined;
  }

  if (input.image.targetOccupancy === "full" && input.direction.directionType === "hero") {
    return FULL_OCCUPANCY_HERO_PRESETS[variationIndex].badgeArea;
  }

  const candidates = [
    { x: priceArea.x - 24, y: priceArea.y - 24 },
    { x: priceArea.x - 24, y: priceArea.y + priceArea.height + 12 },
    { x: priceArea.x + priceArea.width - 180, y: priceArea.y - 24 },
    { x: priceArea.x + priceArea.width - 180, y: priceArea.y + priceArea.height + 12 },
  ];

  for (const candidate of candidates) {
    const badge = fitArea({
      x: candidate.x,
      y: candidate.y,
      width: Math.min(priceArea.width, 180),
      height: 90,
    });

    if (!overlaps(badge, productArea) && !overlaps(badge, textArea)) {
      return badge;
    }
  }

  return fitArea({
    x: priceArea.x + Math.max(0, Math.round((priceArea.width - Math.min(priceArea.width, 180)) / 2)),
    y: priceArea.y,
    width: Math.min(priceArea.width, 180),
    height: Math.min(priceArea.height, 90),
  });
}

function getHierarchy(input: CompositionInput): CompositionSpec["hierarchy"] {
  if (input.direction.priceEmphasis === "high") {
    return { primary: "price", secondary: "product", tertiary: "text" };
  }

  if (input.direction.directionType === "hero") {
    return { primary: "product", secondary: "text", tertiary: "price" };
  }

  if (input.direction.directionType === "overlay") {
    return { primary: "text", secondary: "product", tertiary: "price" };
  }

  return { primary: "product", secondary: "price", tertiary: "text" };
}

function getTypography(input: CompositionInput): CompositionSpec["typography"] {
  const moodWeights = {
    clean: { productName: "600", price: "700", description: "400" },
    aggressive: { productName: "700", price: "900", description: "600" },
    playful: { productName: "700", price: "700", description: "600" },
    premium: { productName: "400", price: "600", description: "400" },
  } as const;

  const baseSize = {
    minimal: { productName: 54, price: 58, description: 26 },
    balanced: { productName: 64, price: 72, description: 30 },
    strong: { productName: 72, price: 88, description: 32 },
  }[input.direction.visualIntensity];

  const priceSize = input.direction.priceEmphasis === "high"
    ? Math.max(baseSize.price, baseSize.productName)
    : Math.max(baseSize.price - 8, 32);

  return {
    productName: {
      fontSize: baseSize.productName,
      fontWeight: moodWeights[input.direction.mood].productName,
    },
    price: {
      fontSize: priceSize,
      fontWeight: moodWeights[input.direction.mood].price,
    },
    description: {
      fontSize: baseSize.description,
      fontWeight: moodWeights[input.direction.mood].description,
    },
  };
}

function getDecorative(
  input: CompositionInput,
  variationIndex: number,
  badgeArea: PixelArea | undefined
): CompositionSpec["decorative"] {
  const preset = VARIATION_PRESETS[input.direction.directionType][variationIndex];
  const isFullOccupancyHero = input.image.targetOccupancy === "full" && input.direction.directionType === "hero";
  const promotionalTitle = OBJECTIVE_TO_PROMOTIONAL_TITLE[input.campaign.objective]
    ? {
        text: OBJECTIVE_TO_PROMOTIONAL_TITLE[input.campaign.objective]!,
        position: isFullOccupancyHero
          ? FULL_OCCUPANCY_HERO_PRESETS[variationIndex].promotionalPosition
          : preset.textBias === "bottom" ? "bottom" : "top",
        fontSize: isFullOccupancyHero ? 48 : input.direction.visualIntensity === "strong" ? 38 : 28,
        fontWeight: (input.direction.mood === "premium" ? "600" : "900") as "600" | "900",
      }
    : undefined;

  return {
    priceBadge: input.campaign.price == null || !badgeArea
      ? null
      : {
          shape: isFullOccupancyHero
            ? "cloud"
            : input.direction.mood === "premium" ? "oval" : input.direction.mood === "playful" ? "cloud" : "rounded-rect",
          position: { x: badgeArea.x, y: badgeArea.y },
          size: { width: badgeArea.width, height: badgeArea.height },
          rotation: isFullOccupancyHero ? 352 : input.direction.mood === "aggressive" ? 12 : undefined,
        },
    storeIdentity: {
      type: input.signature.logo_url ? "logo" : "text",
      position: isFullOccupancyHero
        ? FULL_OCCUPANCY_HERO_PRESETS[variationIndex].storeIdentityPosition
        : input.direction.directionType === "overlay" ? "top-right" : "bottom-right",
      size: isFullOccupancyHero ? { width: 180, height: 80 } : { width: 160, height: 72 },
    },
    promotionalTitle,
  };
}

export function buildVariation(input: CompositionInput, variationIndex: number): CompositionSpec {
  const spacing = getSpacing(input);
  const productArea = getProductArea(input, variationIndex);
  const textArea = getTextArea(input, variationIndex, productArea, spacing);
  const priceArea = getPriceArea(input, variationIndex, productArea, textArea, spacing);
  const badgeArea = getBadgeArea(input, productArea, textArea, priceArea, variationIndex);

  return {
    id: randomUUID(),
    seed: `${input.signature.signature_seed}:${variationIndex + 1}`,
    layout: {
      productArea,
      textArea,
      priceArea,
      ...(badgeArea ? { badgeArea } : {}),
    },
    hierarchy: getHierarchy(input),
    spacing: input.image.targetOccupancy === "full" && input.direction.directionType === "hero"
      ? {
          padding: 40,
          margins: { top: 80, right: 40, bottom: 30, left: 40 },
          gaps: 20,
        }
      : spacing,
    typography: getTypography(input),
    decorative: getDecorative(input, variationIndex, badgeArea),
  };
}

export function generateDeterministicVariations(input: CompositionInput): CompositionSpec[] {
  return [0, 1, 2, 3].map((index) => buildVariation(input, index));
}
