import {
  VISUAL_COMPOSER_CANVAS,
  type CompositionInput,
  type PixelArea,
} from "./contracts";

type OverlapElementType = "priceBadge" | "priceArea" | "textArea" | "storeIdentity";

export type OverlapContext = {
  targetOccupancy: CompositionInput["image"]["targetOccupancy"];
  directionType: CompositionInput["direction"]["directionType"];
  elementType: OverlapElementType;
};

export function areasOverlap(a1: PixelArea, a2: PixelArea): boolean {
  return !(
    a1.x + a1.width <= a2.x ||
    a2.x + a2.width <= a1.x ||
    a1.y + a1.height <= a2.y ||
    a2.y + a2.height <= a1.y
  );
}

export function calculateOverlapPercent(a1: PixelArea, a2: PixelArea): number {
  const overlapWidth = Math.max(
    0,
    Math.min(a1.x + a1.width, a2.x + a2.width) - Math.max(a1.x, a2.x)
  );
  const overlapHeight = Math.max(
    0,
    Math.min(a1.y + a1.height, a2.y + a2.height) - Math.max(a1.y, a2.y)
  );

  const overlapArea = overlapWidth * overlapHeight;
  const smallerArea = Math.min(a1.width * a1.height, a2.width * a2.height);

  return smallerArea === 0 ? 0 : overlapArea / smallerArea;
}

export function isElementInCorner(
  area: PixelArea,
  canvas: { width: number; height: number } = VISUAL_COMPOSER_CANVAS
): boolean {
  const cornerThreshold = 0.3;
  const cornerWidth = canvas.width * cornerThreshold;
  const cornerHeight = canvas.height * cornerThreshold;
  const centerX = area.x + area.width / 2;
  const centerY = area.y + area.height / 2;

  const isTopLeft = centerX < cornerWidth && centerY < cornerHeight;
  const isTopRight = centerX > canvas.width - cornerWidth && centerY < cornerHeight;
  const isBottomLeft = centerX < cornerWidth && centerY > canvas.height - cornerHeight;
  const isBottomRight =
    centerX > canvas.width - cornerWidth && centerY > canvas.height - cornerHeight;

  return isTopLeft || isTopRight || isBottomLeft || isBottomRight;
}

export function isOverlapAllowed(
  productArea: PixelArea,
  overlappingArea: PixelArea,
  context: OverlapContext
): boolean {
  if (context.targetOccupancy !== "full" || context.directionType !== "hero") {
    return false;
  }

  if (context.elementType !== "priceBadge") {
    return false;
  }

  return isElementInCorner(overlappingArea);
}