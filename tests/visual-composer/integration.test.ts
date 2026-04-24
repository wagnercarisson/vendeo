import { describe, expect, it } from "vitest";

import { generateFallbackVariations } from "@/lib/ai/visual-composer/fallback";
import {
  areasOverlap,
  validateCompositionVariants,
  validateDistinctness,
  validateSpecBounds,
  validateSpecOverlap,
} from "@/lib/ai/visual-composer/validation";

import { visualComposerFixtures } from "./fixtures/manifest";

describe("visual composer fixtures", () => {
  it("covers all 12 mandatory scenarios", () => {
    expect(visualComposerFixtures).toHaveLength(12);

    for (const fixture of visualComposerFixtures) {
      const result = generateFallbackVariations(fixture.input);

      expect(result.variations).toHaveLength(4);
      if (!validateCompositionVariants(result, fixture.input)) {
        const invalidIndex = result.variations.findIndex((variation) => {
          return !validateSpecBounds(variation) || !validateSpecOverlap(variation, {
            allowOverlay: result.direction.textDistribution === "overlay",
            targetOccupancy: fixture.input.image.targetOccupancy,
            directionType: fixture.input.direction.directionType,
          });
        });

        const reason = invalidIndex >= 0
          ? (() => {
              const variation = result.variations[invalidIndex];
              const bounds = validateSpecBounds(variation);
              const overlap = validateSpecOverlap(variation, {
                allowOverlay: result.direction.textDistribution === "overlay",
                targetOccupancy: fixture.input.image.targetOccupancy,
                directionType: fixture.input.direction.directionType,
              });
              return `variation:${invalidIndex}:bounds=${bounds}:overlap=${overlap}:${JSON.stringify(variation)}`;
            })()
          : validateDistinctness(result.variations)
            ? "unknown"
            : `distinctness:${JSON.stringify(result.variations)}`;

        throw new Error(`fixture ${fixture.id} failed validation: ${reason}`);
      }
      expect(validateCompositionVariants(result, fixture.input)).toBe(true);

      for (const variation of result.variations) {
        expect(variation.decorative.priceBadge === null).toBe(!fixture.expectation.expectPriceBadge);
        expect(Boolean(variation.decorative.promotionalTitle)).toBe(fixture.expectation.expectPromotionalTitle);

        if (fixture.expectation.expectOverlay) {
          expect(variation.layout.productArea.width).toBeGreaterThanOrEqual(860);
        }

        if (fixture.expectation.expectHeroDominance) {
          expect(variation.layout.productArea.width * variation.layout.productArea.height).toBeGreaterThan(400000);
        }

        if (fixture.expectation.expectHighPriceTypography) {
          expect(variation.typography.price.fontSize).toBeGreaterThanOrEqual(
            variation.typography.productName.fontSize
          );
        }

        if (fixture.expectation.expectBadgeProductOverlap) {
          expect(variation.layout.badgeArea).toBeDefined();
          expect(variation.layout.badgeArea && areasOverlap(variation.layout.productArea, variation.layout.badgeArea)).toBe(true);
        }
      }

      if (fixture.expectation.expectCenteredProduct) {
        for (const variation of result.variations) {
          const centerX = variation.layout.productArea.x + variation.layout.productArea.width / 2;
          expect(centerX).toBeGreaterThan(360);
          expect(centerX).toBeLessThan(720);
        }
      }
    }
  });
});
