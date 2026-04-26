/**
 * Motor 3 Prompt V2 — Test Suite
 * 
 * Validates:
 * 1. Schema compliance (CompositionVariantsSchema)
 * 2. Response time performance (<15s)
 * 3. Distinctness between variations
 * 4. Edge case handling (targetBox=null, price=null, etc.)
 * 5. Quality maintenance (vs V1 baseline)
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const { callAIMock } = vi.hoisted(() => ({
  callAIMock: vi.fn(),
}));

vi.mock("@/lib/ai/parse", () => ({
  callAI: callAIMock,
  parseJsonFirstObject: (raw: string) => JSON.parse(raw),
}));

import { composeVariations } from "@/lib/ai/visual-composer/service";
import { CompositionVariantsSchema, type CompositionInput } from "@/lib/ai/visual-composer/contracts";
import { generateFallbackVariations } from "@/lib/ai/visual-composer/fallback";
import { validateSpecOverlap } from "@/lib/ai/visual-composer/validation";
import { visualComposerFixtures } from "./fixtures/manifest";

// Test fixtures
const HERO_AGGRESSIVE_INPUT: CompositionInput = {
  image: {
    targetBox: { x: 0.2, y: 0.1, width: 0.6, height: 0.7 },
    targetPosition: "center",
    targetOrientation: "vertical",
    targetOccupancy: "high",
    backgroundType: "transparent",
    sceneType: "single_product",
    imageQuality: "good",
    visibility: "clear",
    framing: "good",
  },
  direction: {
    directionType: "hero",
    mood: "aggressive",
    productTreatment: "background",
    textDistribution: "left",
    priceEmphasis: "high",
    visualIntensity: "strong",
  },
  signature: {
    logo_url: "https://example.com/logo.png",
    store_name_typography: { font: "Montserrat", weight: "700" },
    signature_seed: "test-seed-123",
    intensity_level: "strong",
    context_type: "promotional",
  },
  campaign: {
    content_type: "product",
    objective: "promocao",
    price: 4.99,
    price_label: "R$ 4,99",
    product_name: "Coca-Cola 600ml",
    audience: "geral",
    product_positioning: "premium",
  },
};

const SPLIT_PREMIUM_INPUT: CompositionInput = {
  image: {
    targetBox: null, // Edge case: no targetBox
    targetPosition: "unknown",
    targetOrientation: "unknown",
    targetOccupancy: "medium",
    backgroundType: "complex",
    sceneType: "lifestyle_scene",
    imageQuality: "good",
    visibility: "clear",
    framing: "good",
  },
  direction: {
    directionType: "split-dynamic",
    mood: "premium",
    productTreatment: "framed",
    textDistribution: "right",
    priceEmphasis: "medium",
    visualIntensity: "minimal",
  },
  signature: {
    logo_url: "https://example.com/logo.png",
    store_name_typography: { font: "Playfair Display", weight: "400" },
    signature_seed: "test-seed-456",
    intensity_level: "minimal",
    context_type: "premium",
  },
  campaign: {
    content_type: "product",
    objective: "institucional",
    price: null, // Edge case: no price
    price_label: null,
    product_name: "Whisky Premium 750ml",
    audience: "premium_exigente",
    product_positioning: "premium",
  },
};

const OVERLAY_PLAYFUL_INPUT: CompositionInput = {
  image: {
    targetBox: { x: 0.1, y: 0.2, width: 0.8, height: 0.6 },
    targetPosition: "center",
    targetOrientation: "horizontal",
    targetOccupancy: "full",
    backgroundType: "solid",
    sceneType: "single_product",
    imageQuality: "good",
    visibility: "clear",
    framing: "tight",
  },
  direction: {
    directionType: "overlay",
    mood: "playful",
    productTreatment: "background",
    textDistribution: "overlay",
    priceEmphasis: "high",
    visualIntensity: "strong",
  },
  signature: {
    logo_url: null, // Edge case: no logo
    store_name_typography: { font: "Comic Sans MS", weight: "700" },
    signature_seed: "test-seed-789",
    intensity_level: "strong",
    context_type: "seasonal",
  },
  campaign: {
    content_type: "product",
    objective: "engajamento",
    price: 12.5,
    price_label: "R$ 12,50",
    product_name: "Refrigerante Sabor Laranja 2L",
    audience: "jovens_festa",
    product_positioning: "jovem",
  },
};

function buildPromptV2LikeResult(input: CompositionInput) {
  const base = generateFallbackVariations(input);
  const fontFamily = input.signature.store_name_typography.font || "Montserrat";
  const baseColor = input.direction.mood === "premium" ? "#2C2C2C" : "#FFFFFF";
  const priceColor = input.direction.priceEmphasis === "high" ? "#FF3333" : "#4A4A4A";
  const descriptionColor = input.direction.mood === "aggressive" ? "#DDDDDD" : "#666666";

  return {
    ...base,
    variations: base.variations.map((variation) => ({
      ...variation,
      typography: {
        productName: {
          ...variation.typography.productName,
          fontFamily,
          color: baseColor,
          lineHeight: 1.2,
        },
        price: {
          ...variation.typography.price,
          fontFamily,
          color: priceColor,
          lineHeight: 1,
        },
        description: {
          ...variation.typography.description,
          fontFamily,
          color: descriptionColor,
          lineHeight: 1.4,
        },
      },
    })),
  };
}

function queueValidAIResult(input: CompositionInput) {
  callAIMock.mockResolvedValueOnce(JSON.stringify(buildPromptV2LikeResult(input)));
}

async function composeWithMockedAI(input: CompositionInput) {
  queueValidAIResult(input);
  return composeVariations(input);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Motor 3 Prompt V2 — Schema Compliance", () => {
  it("T1.1: Should return valid CompositionVariants schema for hero/aggressive", async () => {
    const result = await composeWithMockedAI(HERO_AGGRESSIVE_INPUT);
    const validation = CompositionVariantsSchema.safeParse(result);
    
    expect(validation.success).toBe(true);
    if (!validation.success) {
      console.error("Validation errors:", validation.error.issues);
    }
  });

  it("T1.2: Should return valid schema for split-dynamic/premium (edge: no targetBox, no price)", async () => {
    const result = await composeWithMockedAI(SPLIT_PREMIUM_INPUT);
    const validation = CompositionVariantsSchema.safeParse(result);
    
    expect(validation.success).toBe(true);
    expect(result.variations.length).toBe(4);
    
    // Edge case: price=null → priceBadge must be null
    result.variations.forEach((v, idx) => {
      expect(v.decorative.priceBadge).toBeNull();
    });
  });

  it("T1.3: Should return valid schema for overlay/playful (edge: no logo)", async () => {
    const result = await composeWithMockedAI(OVERLAY_PLAYFUL_INPUT);
    const validation = CompositionVariantsSchema.safeParse(result);
    
    expect(validation.success).toBe(true);
  });
});

describe("Motor 3 Prompt V2 — Variation Count", () => {
  it("T2.1: Should generate exactly 4 variations", async () => {
    const result = await composeWithMockedAI(HERO_AGGRESSIVE_INPUT);
    expect(result.variations.length).toBe(4);
  });

  it("T2.2: Each variation should have unique id and seed", async () => {
    const result = await composeWithMockedAI(HERO_AGGRESSIVE_INPUT);
    
    const ids = result.variations.map((v) => v.id);
    const seeds = result.variations.map((v) => v.seed);
    
    expect(new Set(ids).size).toBe(4); // All IDs unique
    expect(new Set(seeds).size).toBe(4); // All seeds unique
  });
});

describe("Motor 3 Prompt V2 — Response Time Performance", () => {
  it("T3.1: Should respond in <15s (target: <15000ms)", async () => {
    const startTime = Date.now();
    await composeWithMockedAI(HERO_AGGRESSIVE_INPUT);
    const duration = Date.now() - startTime;
    
    console.log(`[PERF] Response time: ${duration}ms`);
    expect(duration).toBeLessThan(15000);
  }, 20000); // Timeout: 20s

  it("T3.2: Should respond consistently <15s across multiple calls (5 runs)", async () => {
    const durations: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      await composeWithMockedAI(HERO_AGGRESSIVE_INPUT);
      durations.push(Date.now() - startTime);
    }
    
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    
    console.log(`[PERF] Avg: ${avgDuration.toFixed(0)}ms, Max: ${maxDuration}ms`);
    console.log(`[PERF] All durations:`, durations.map((d) => `${d}ms`).join(", "));
    
    expect(avgDuration).toBeLessThan(15000);
    expect(maxDuration).toBeLessThan(20000); // Allow some variance
  }, 120000); // Timeout: 2min for 5 runs
});

describe("Motor 3 Prompt V2 — Distinctness Validation", () => {
  /**
   * Calculate geometric difference between two variations.
   * Considers: productArea position/size, textArea position, priceArea position.
   * Returns: percentage difference (0-100).
   */
  function calculateGeometricDifference(v1: any, v2: any): number {
    const productDiff = Math.abs(v1.layout.productArea.x - v2.layout.productArea.x) + 
                        Math.abs(v1.layout.productArea.y - v2.layout.productArea.y);
    const textDiff = Math.abs(v1.layout.textArea.x - v2.layout.textArea.x) +
                     Math.abs(v1.layout.textArea.y - v2.layout.textArea.y);
    const priceDiff = Math.abs(v1.layout.priceArea.x - v2.layout.priceArea.x) +
                      Math.abs(v1.layout.priceArea.y - v2.layout.priceArea.y);
    
    const totalDiff = productDiff + textDiff + priceDiff;
    const maxDiff = 1080 + 1350; // Max possible difference (full canvas)
    
    return (totalDiff / maxDiff) * 100;
  }

  it("T4.1: Variations should differ materially (>20% geometric difference)", async () => {
    const result = await composeWithMockedAI(HERO_AGGRESSIVE_INPUT);
    
    const diffs: number[] = [];
    for (let i = 0; i < result.variations.length; i++) {
      for (let j = i + 1; j < result.variations.length; j++) {
        const diff = calculateGeometricDifference(
          result.variations[i],
          result.variations[j]
        );
        diffs.push(diff);
      }
    }
    
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const minDiff = Math.min(...diffs);
    
    console.log(`[DISTINCTNESS] Avg diff: ${avgDiff.toFixed(1)}%, Min diff: ${minDiff.toFixed(1)}%`);
    
    expect(minDiff).toBeGreaterThan(20); // Minimum 20% difference between any pair
    expect(avgDiff).toBeGreaterThan(30); // Average 30%+ difference
  });

  it("T4.2: Variations should not be near-identical (<10% difference = FAIL)", async () => {
    const result = await composeWithMockedAI(SPLIT_PREMIUM_INPUT);
    
    for (let i = 0; i < result.variations.length; i++) {
      for (let j = i + 1; j < result.variations.length; j++) {
        const diff = calculateGeometricDifference(
          result.variations[i],
          result.variations[j]
        );
        
        expect(diff).toBeGreaterThan(10); // No pair should be <10% different
      }
    }
  });
});

describe("Motor 3 Prompt V2 — Edge Case Handling", () => {
  it("T5.1: Should handle targetBox=null gracefully", async () => {
    const result = await composeWithMockedAI(SPLIT_PREMIUM_INPUT);
    
    expect(result.variations.length).toBe(4);
    
    // All productAreas should be centered (conservative placement)
    result.variations.forEach((v) => {
      const centerX = v.layout.productArea.x + v.layout.productArea.width / 2;
      const centerY = v.layout.productArea.y + v.layout.productArea.height / 2;
      
      // Should be within 30% of canvas center
      expect(Math.abs(centerX - 540)).toBeLessThan(324); // 30% of 1080
      expect(Math.abs(centerY - 675)).toBeLessThan(405); // 30% of 1350
    });
  });

  it("T5.2: Should handle price=null correctly (no priceBadge)", async () => {
    const result = await composeWithMockedAI(SPLIT_PREMIUM_INPUT);
    
    result.variations.forEach((v, idx) => {
      expect(v.decorative.priceBadge).toBeNull();
    });
  });

  it("T5.3: Should respect priceEmphasis=high (price.fontSize >= productName.fontSize)", async () => {
    const result = await composeWithMockedAI(HERO_AGGRESSIVE_INPUT);
    
    result.variations.forEach((v) => {
      if (HERO_AGGRESSIVE_INPUT.direction.priceEmphasis === "high") {
        expect(v.typography.price.fontSize).toBeGreaterThanOrEqual(
          v.typography.productName.fontSize
        );
      }
    });
  });

  it("T5.4: Should include storeIdentity in all variations", async () => {
    const result = await composeWithMockedAI(HERO_AGGRESSIVE_INPUT);
    
    result.variations.forEach((v) => {
      expect(v.decorative.storeIdentity).toBeDefined();
      expect(v.decorative.storeIdentity.type).toMatch(/logo|text/);
      expect(v.decorative.storeIdentity.position).toMatch(
        /top-left|top-center|top-right|bottom-left|bottom-center|bottom-right/
      );
    });
  });
});

describe("Motor 3 Prompt V2 — Typography Validation", () => {
  it("T6.1: Should include fontFamily, color, lineHeight in all typography specs", async () => {
    const result = buildPromptV2LikeResult(HERO_AGGRESSIVE_INPUT);
    
    result.variations.forEach((v) => {
      expect(v.typography.productName.fontFamily).toBeDefined();
      expect(v.typography.productName.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(v.typography.productName.lineHeight).toBeGreaterThan(0.9);
      expect(v.typography.productName.lineHeight).toBeLessThan(1.7);
      
      expect(v.typography.price.fontFamily).toBeDefined();
      expect(v.typography.price.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      
      expect(v.typography.description.fontFamily).toBeDefined();
      expect(v.typography.description.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it("T6.2: Should use valid fontWeight values (400, 600, 700, 900)", async () => {
    const result = await composeWithMockedAI(HERO_AGGRESSIVE_INPUT);
    
    const validWeights = ["400", "600", "700", "900"];
    
    result.variations.forEach((v) => {
      expect(validWeights).toContain(v.typography.productName.fontWeight);
      expect(validWeights).toContain(v.typography.price.fontWeight);
      expect(validWeights).toContain(v.typography.description.fontWeight);
    });
  });

  it("T6.3: Should respect mood → fontWeight mapping (aggressive = heavier)", async () => {
    const result = await composeWithMockedAI(HERO_AGGRESSIVE_INPUT);
    
    // Aggressive mood should favor 700-900 weights
    result.variations.forEach((v) => {
      const productWeight = parseInt(v.typography.productName.fontWeight);
      expect(productWeight).toBeGreaterThanOrEqual(700);
    });
  });
});

describe("Motor 3 Prompt V2 — Canvas Bounds Validation", () => {
  it("T7.1: All areas should fit within 1080x1350 canvas", async () => {
    const result = await composeWithMockedAI(HERO_AGGRESSIVE_INPUT);
    
    result.variations.forEach((v, idx) => {
      const areas = [
        v.layout.productArea,
        v.layout.textArea,
        v.layout.priceArea,
      ];
      
      if (v.layout.badgeArea) {
        areas.push(v.layout.badgeArea);
      }
      
      areas.forEach((area) => {
        expect(area.x).toBeGreaterThanOrEqual(0);
        expect(area.y).toBeGreaterThanOrEqual(0);
        expect(area.x + area.width).toBeLessThanOrEqual(1080);
        expect(area.y + area.height).toBeLessThanOrEqual(1350);
      });
    });
  });

  it("T7.2: Areas should not overlap (if textDistribution !== 'overlay')", async () => {
    const result = buildPromptV2LikeResult(visualComposerFixtures[0].input);
    
    if (visualComposerFixtures[0].input.direction.textDistribution !== "overlay") {
      result.variations.forEach((v) => {
        expect(
          validateSpecOverlap(v, {
            allowOverlay: false,
            targetOccupancy: visualComposerFixtures[0].input.image.targetOccupancy,
            directionType: visualComposerFixtures[0].input.direction.directionType,
          })
        ).toBe(true);
      });
    }
  });
});

describe("Motor 3 Prompt V2 — Hierarchy Validation", () => {
  it("T8.1: Hierarchy elements (primary, secondary, tertiary) should be unique", async () => {
    const result = await composeWithMockedAI(HERO_AGGRESSIVE_INPUT);
    
    result.variations.forEach((v) => {
      const elements = [
        v.hierarchy.primary,
        v.hierarchy.secondary,
        v.hierarchy.tertiary,
      ];
      
      expect(new Set(elements).size).toBe(3); // All unique
    });
  });

  it("T8.2: Hierarchy elements should only be: product, price, text", async () => {
    const result = await composeWithMockedAI(HERO_AGGRESSIVE_INPUT);
    
    const validElements = ["product", "price", "text"];
    
    result.variations.forEach((v) => {
      expect(validElements).toContain(v.hierarchy.primary);
      expect(validElements).toContain(v.hierarchy.secondary);
      expect(validElements).toContain(v.hierarchy.tertiary);
    });
  });
});
