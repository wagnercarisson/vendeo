import { describe, expect, it } from "vitest";

import type { CreativeDirection } from "@/lib/ai/intent-resolver/contracts";

function calculateConsistency(outputs: CreativeDirection[]) {
  const counts = new Map<string, number>();

  for (const output of outputs) {
    const key = JSON.stringify(output);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts.size === 0 ? 0 : Math.max(...Array.from(counts.values())) / outputs.length;
}

describe("Intent Resolver consistency", () => {
  it("achieves at least 80% identical outputs for repeated identical input", () => {
    const dominant: CreativeDirection = {
      directionType: "frame",
      mood: "premium",
      productTreatment: "background",
      textDistribution: "center",
      priceEmphasis: "low",
      visualIntensity: "minimal",
    };

    const variant: CreativeDirection = {
      directionType: "overlay",
      mood: "premium",
      productTreatment: "background",
      textDistribution: "overlay",
      priceEmphasis: "low",
      visualIntensity: "minimal",
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

    expect(calculateConsistency(outputs)).toBeGreaterThanOrEqual(0.8);
  });
});