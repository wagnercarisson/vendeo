import { describe, expect, it } from "vitest";

import { emptyCreativeDirection, type IntentResolverInput } from "@/lib/ai/intent-resolver/contracts";
import {
  DIRECTION_TYPE_MAP,
  PRODUCT_TREATMENT_RULES,
  applyValidationRules,
} from "@/lib/ai/intent-resolver/validation";

const baseInput: IntentResolverInput = {
  image: {
    backgroundType: "complex",
    targetOccupancy: "medium",
    sceneType: "lifestyle_scene",
    visibility: "clear",
    framing: "good",
    imageQuality: "good",
    matchType: "exact",
    targetPosition: "left",
    targetOrientation: "horizontal",
  },
  campaign: {
    content_type: "product",
    objective: "promocao",
    price: 10,
    price_label: "R$ 10,00",
    product_name: "Produto",
    audience: "geral",
    product_positioning: "popular",
  },
  signature: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    primary_color: "#111111",
    secondary_color: "#ffffff",
    logo_url: null,
    store_name_typography: { font: "Sora", weight: "700" },
    signature_seed: "seed",
    intensity_level: "strong",
    composition_rules: {},
    typography_rules: {},
    color_rules: {},
    context_type: "promotional",
  },
};

describe("validation maps", () => {
  it("exposes the expected background direction map", () => {
    expect(DIRECTION_TYPE_MAP.transparent).toEqual([
      "hero",
      "split-dynamic",
      "stacked",
      "frame",
    ]);
    expect(DIRECTION_TYPE_MAP.unknown).toEqual(["frame", "hero"]);
  });

  it("exposes the expected product treatment rules", () => {
    expect(PRODUCT_TREATMENT_RULES.complex).toEqual(["background"]);
    expect(PRODUCT_TREATMENT_RULES.unknown).toEqual(["framed"]);
  });
});

describe("applyValidationRules", () => {
  it("corrects invalid directionType by background type", () => {
    const result = applyValidationRules(
      {
        ...emptyCreativeDirection(),
        directionType: "split-dynamic",
        productTreatment: "background",
        textDistribution: "left",
        priceEmphasis: "high",
        visualIntensity: "strong",
      },
      baseInput
    );

    expect(result.directionType).toBe("overlay");
  });

  it("corrects invalid product treatment by background type", () => {
    const result = applyValidationRules(
      {
        ...emptyCreativeDirection(),
        directionType: "overlay",
        productTreatment: "framed",
      },
      baseInput
    );

    expect(result.productTreatment).toBe("background");
  });

  it("replaces hero when occupancy is full with a feasible alternative", () => {
    const result = applyValidationRules(
      {
        ...emptyCreativeDirection(),
        directionType: "hero",
        productTreatment: "framed",
        visualIntensity: "strong",
      },
      {
        ...baseInput,
        image: { ...baseInput.image, backgroundType: "unknown", targetOccupancy: "full" },
      }
    );

    expect(result.directionType).toBe("frame");
  });
});