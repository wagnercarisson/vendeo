import { describe, expect, test } from "vitest";

import {
  CompositionSpecSchema,
  TypographySpecSchema,
} from "@/lib/ai/visual-composer/contracts";

describe("Motor 3 Schema - Story 4.5.2", () => {
  test("T1: accepts fontFamily, color, lineHeight", () => {
    const input = {
      fontSize: 48,
      fontWeight: "700",
      fontFamily: "Montserrat",
      color: "#FF0000",
      lineHeight: 1.2,
    };

    const result = TypographySpecSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fontFamily).toBe("Montserrat");
      expect(result.data.color).toBe("#FF0000");
      expect(result.data.lineHeight).toBe(1.2);
    }
  });

  test("T2: ignores noise fields", () => {
    const input = {
      fontSize: 48,
      fontWeight: "700",
      promotion: { type: "seasonal" },
      renderingHints: { blendMode: "multiply" },
      debugMetadata: { reasoning: "..." },
    };

    const result = TypographySpecSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  test("T3: coerces fontWeight number to string", () => {
    const input = {
      fontSize: 48,
      fontWeight: 700,
    };

    const result = TypographySpecSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fontWeight).toBe("700");
      expect(typeof result.data.fontWeight).toBe("string");
    }
  });

  test("T4: parses production-like output in <500ms", () => {
    const largeInput = {
      id: "12345678-1234-4234-9234-123456789abc",
      seed: "test-seed",
      productName: "Test Product",
      layout: {
        productArea: { x: 216, y: 162, width: 648, height: 891 },
        textArea: { x: 108, y: 1053, width: 864, height: 180 },
        priceArea: { x: 324, y: 1161, width: 432, height: 108 },
        badgeArea: { x: 864, y: 243, width: 162, height: 162 },
      },
      hierarchy: {
        primary: "product",
        secondary: "price",
        tertiary: "text",
      },
      spacing: {
        padding: 24,
        margins: { top: 32, right: 24, bottom: 32, left: 24 },
        gaps: 16,
      },
      typography: {
        productName: {
          fontSize: 48,
          fontWeight: "700",
          fontFamily: "Montserrat",
          color: "#000000",
          lineHeight: 1.2,
        },
        price: {
          fontSize: 56,
          fontWeight: "900",
          fontFamily: "Sora",
          color: "#FF0000",
          lineHeight: 1,
        },
        description: {
          fontSize: 24,
          fontWeight: "400",
          fontFamily: "Inter",
          color: "#666666",
          lineHeight: 1.4,
        },
      },
      decorative: {
        priceBadge: {
          shape: "cloud",
          position: { x: 864, y: 243 },
          size: { width: 162, height: 162 },
          rotation: 15,
          animation: "bounce",
          backgroundColor: "#FFD700",
        },
        storeIdentity: {
          type: "logo",
          position: "top-left",
          size: { width: 108, height: 54 },
        },
        promotionalTitle: {
          text: "PROMOCAO IMPERDIVEL",
          position: "top",
          fontSize: 32,
          fontWeight: "700",
        },
      },
      promotion: { type: "seasonal" },
      renderingHints: { blendMode: "multiply" },
    };

    const start = performance.now();
    const result = CompositionSpecSchema.safeParse(largeInput);
    const duration = performance.now() - start;

    expect(result.success).toBe(true);
    expect(duration).toBeLessThan(500);
  });

  test("T5: consistent validation across multiple runs", () => {
    const input = {
      fontSize: 48,
      fontWeight: 700,
      fontFamily: "Montserrat",
      color: "#FF0000",
      lineHeight: 1.2,
    };

    for (let index = 0; index < 10; index += 1) {
      const result = TypographySpecSchema.safeParse(input);
      expect(result.success).toBe(true);
    }
  });
});