import {
  VISUAL_COMPOSER_CANVAS,
  type CompositionInput,
  type CompositionSpec,
  type CompositionVariants,
  type PixelArea,
} from "./contracts";
import { areasOverlap as baseAreasOverlap, isOverlapAllowed } from "./overlap-rules";

export function validateBounds(area: PixelArea): boolean {
  return (
    area.x >= 0 &&
    area.y >= 0 &&
    area.width > 0 &&
    area.height > 0 &&
    area.x + area.width <= VISUAL_COMPOSER_CANVAS.width &&
    area.y + area.height <= VISUAL_COMPOSER_CANVAS.height
  );
}

export function areasOverlap(a: PixelArea, b: PixelArea): boolean {
  return baseAreasOverlap(a, b);
}

export function validateSpecBounds(spec: CompositionSpec): boolean {
  return Object.values(spec.layout).every((area) => validateBounds(area));
}

export function validateSpecOverlap(
  spec: CompositionSpec,
  context:
    | boolean
    | {
        allowOverlay?: boolean;
        targetOccupancy?: CompositionInput["image"]["targetOccupancy"];
        directionType?: CompositionInput["direction"]["directionType"];
      }
): boolean {
  const resolved = typeof context === "boolean"
    ? { allowOverlay: context }
    : context;

  if (resolved.allowOverlay) {
    return true;
  }

  const { productArea, textArea, priceArea, badgeArea } = spec.layout;

  if (areasOverlap(productArea, textArea)) return false;
  if (areasOverlap(productArea, priceArea)) return false;
  if (areasOverlap(textArea, priceArea)) return false;
  if (badgeArea) {
    if (areasOverlap(textArea, badgeArea)) {
      return false;
    }

    if (
      areasOverlap(productArea, badgeArea) &&
      !isOverlapAllowed(productArea, badgeArea, {
        targetOccupancy: resolved.targetOccupancy ?? "medium",
        directionType: resolved.directionType ?? "frame",
        elementType: "priceBadge",
      })
    ) {
      return false;
    }
  }

  return true;
}

function calculateAreaDifference(a: PixelArea, b: PixelArea) {
  const xDiff = Math.abs(a.x - b.x) / VISUAL_COMPOSER_CANVAS.width;
  const yDiff = Math.abs(a.y - b.y) / VISUAL_COMPOSER_CANVAS.height;
  const widthDiff = Math.abs(a.width - b.width) / VISUAL_COMPOSER_CANVAS.width;
  const heightDiff = Math.abs(a.height - b.height) / VISUAL_COMPOSER_CANVAS.height;

  return Math.min(1, xDiff + yDiff + widthDiff + heightDiff);
}

export function validateDistinctness(
  variations: CompositionSpec[],
  threshold = 0.3
): boolean {
  if (variations.length < 2) {
    return true;
  }

  for (let index = 0; index < variations.length; index += 1) {
    for (let next = index + 1; next < variations.length; next += 1) {
      const productDiff = calculateAreaDifference(
        variations[index].layout.productArea,
        variations[next].layout.productArea
      );
      const textDiff = calculateAreaDifference(
        variations[index].layout.textArea,
        variations[next].layout.textArea
      );

      if (Math.max(productDiff, textDiff) < threshold) {
        return false;
      }
    }
  }

  return true;
}

export function validateCompositionVariants(
  variants: CompositionVariants,
  context?: Pick<CompositionInput, "image" | "direction">
): boolean {
  return variants.variations.every((variation) => {
    return validateSpecBounds(variation) && validateSpecOverlap(variation, {
      allowOverlay: variants.direction.textDistribution === "overlay",
      targetOccupancy: context?.image.targetOccupancy,
      directionType: context?.direction.directionType ?? variants.direction.directionType,
    });
  }) && validateDistinctness(variants.variations);
}
