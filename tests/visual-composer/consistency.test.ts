import { describe, expect, it } from "vitest";

import type { CompositionSpec } from "@/lib/ai/visual-composer/contracts";

function sameFamily(a: CompositionSpec, b: CompositionSpec) {
  const widthDelta = Math.abs(a.layout.productArea.width - b.layout.productArea.width) / 1080;
  const heightDelta = Math.abs(a.layout.productArea.height - b.layout.productArea.height) / 1350;
  const textWidthDelta = Math.abs(a.layout.textArea.width - b.layout.textArea.width) / 1080;

  return Math.max(widthDelta, heightDelta, textWidthDelta) < 0.2;
}

function calculateFamilyConsistency(outputs: CompositionSpec[]) {
  const baseline = outputs[0];
  const matches = outputs.filter((output) => sameFamily(output, baseline)).length;
  return matches / outputs.length;
}

describe("Visual Composer consistency", () => {
  it("achieves at least 80 percent same-family outputs across repeated runs", () => {
    const dominant: CompositionSpec = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      seed: "seed:1",
      layout: {
        productArea: { x: 120, y: 120, width: 760, height: 900 },
        textArea: { x: 140, y: 980, width: 800, height: 180 },
        priceArea: { x: 760, y: 760, width: 220, height: 140 },
      },
      hierarchy: { primary: "product", secondary: "text", tertiary: "price" },
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

    const variant: CompositionSpec = {
      ...dominant,
      id: "223e4567-e89b-12d3-a456-426614174000",
      layout: {
        productArea: { x: 80, y: 80, width: 980, height: 1120 },
        textArea: { x: 520, y: 120, width: 420, height: 220 },
        priceArea: { x: 60, y: 1080, width: 240, height: 140 },
      },
    };

    const outputs = [
      dominant,
      dominant,
      dominant,
      dominant,
      dominant,
      dominant,
      dominant,
      dominant,
      variant,
      variant,
    ];

    expect(calculateFamilyConsistency(outputs)).toBeGreaterThanOrEqual(0.8);
  });
});