import { describe, expect, it } from "vitest";

import type { CompositionSpec } from "@/lib/ai/visual-composer/contracts";
import {
  areasOverlap,
  validateBounds,
  validateDistinctness,
  validateSpecOverlap,
} from "@/lib/ai/visual-composer/validation";

const baseSpec: CompositionSpec = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  seed: "seed:1",
  layout: {
    productArea: { x: 40, y: 80, width: 520, height: 700 },
    textArea: { x: 600, y: 120, width: 380, height: 220 },
    priceArea: { x: 640, y: 380, width: 220, height: 140 },
  },
  hierarchy: { primary: "product", secondary: "price", tertiary: "text" },
  spacing: {
    padding: 48,
    margins: { top: 28, right: 28, bottom: 28, left: 28 },
    gaps: 24,
  },
  typography: {
    productName: { fontSize: 64, fontWeight: "600" },
    price: { fontSize: 72, fontWeight: "700" },
    description: { fontSize: 30, fontWeight: "400" },
  },
  decorative: {
    priceBadge: null,
    storeIdentity: { type: "text", position: "bottom-right", size: { width: 160, height: 72 } },
  },
};

describe("visual composer validation", () => {
  it("validates bounds inside the fixed canvas", () => {
    expect(validateBounds(baseSpec.layout.productArea)).toBe(true);
    expect(validateBounds({ x: -1, y: 0, width: 100, height: 100 })).toBe(false);
  });

  it("detects overlapping areas", () => {
    expect(areasOverlap(baseSpec.layout.productArea, baseSpec.layout.textArea)).toBe(false);
    expect(
      areasOverlap(baseSpec.layout.productArea, {
        x: 500,
        y: 200,
        width: 300,
        height: 300,
      })
    ).toBe(true);
  });

  it("rejects illegal overlap when overlay is not allowed", () => {
    const overlapping: CompositionSpec = {
      ...baseSpec,
      layout: {
        ...baseSpec.layout,
        textArea: { x: 400, y: 180, width: 300, height: 220 },
      },
    };

    expect(validateSpecOverlap(baseSpec, false)).toBe(true);
    expect(validateSpecOverlap(overlapping, false)).toBe(false);
    expect(validateSpecOverlap(overlapping, true)).toBe(true);
  });

  it("allows controlled badge overlap only for full-occupancy hero", () => {
    const heroBadgeOverlap: CompositionSpec = {
      ...baseSpec,
      layout: {
        ...baseSpec.layout,
        productArea: { x: 40, y: 80, width: 1000, height: 1120 },
        textArea: { x: 60, y: 1220, width: 480, height: 100 },
        priceArea: { x: 560, y: 1220, width: 460, height: 100 },
        badgeArea: { x: 780, y: 140, width: 240, height: 240 },
      },
      decorative: {
        ...baseSpec.decorative,
        priceBadge: {
          shape: "cloud",
          position: { x: 780, y: 140 },
          size: { width: 240, height: 240 },
        },
      },
    };

    expect(validateSpecOverlap(heroBadgeOverlap, {
      targetOccupancy: "full",
      directionType: "hero",
    })).toBe(true);

    expect(validateSpecOverlap(heroBadgeOverlap, {
      targetOccupancy: "high",
      directionType: "hero",
    })).toBe(false);
  });

  it("enforces 30 percent distinctness", () => {
    const distinct = [
      baseSpec,
      {
        ...baseSpec,
        id: "223e4567-e89b-12d3-a456-426614174000",
        layout: {
          ...baseSpec.layout,
          productArea: { x: 600, y: 80, width: 300, height: 700 },
        },
      },
      {
        ...baseSpec,
        id: "323e4567-e89b-12d3-a456-426614174000",
        layout: {
          ...baseSpec.layout,
          productArea: { x: 120, y: 420, width: 520, height: 500 },
        },
      },
      {
        ...baseSpec,
        id: "423e4567-e89b-12d3-a456-426614174000",
        layout: {
          ...baseSpec.layout,
          productArea: { x: 700, y: 120, width: 280, height: 980 },
          textArea: { x: 80, y: 120, width: 360, height: 220 },
        },
      },
    ];

    const tooSimilar = distinct.map((spec, index) => ({
      ...spec,
      id: `523e4567-e89b-12d3-a456-42661417400${index}`,
      layout: {
        ...spec.layout,
        productArea: { x: 40 + index * 12, y: 80, width: 520, height: 700 },
      },
    }));

    expect(validateDistinctness(distinct)).toBe(true);
    expect(validateDistinctness(tooSimilar)).toBe(false);
  });
});
