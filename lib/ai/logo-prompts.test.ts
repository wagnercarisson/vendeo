/**
 * Unit tests for DALL-E 3 Logo Prompt Templates
 * 
 * @see lib/ai/logo-prompts.ts
 * @see Story 3: Logo IA - DALL-E 3 (Intelligence Sprint 1)
 * @created 2026-04-30
 */

import {
  getLogoPromptBySegment,
  getColorSuggestions,
  getIconicElements,
  getAvoidElements,
  getAllSegments,
  isValidSegment,
  type Segment,
  type ToneOfVoice,
} from "../logo-prompts";

describe("lib/ai/logo-prompts", () => {
  describe("getLogoPromptBySegment", () => {
    it("returns a complete prompt with store name interpolated", () => {
      const prompt = getLogoPromptBySegment(
        "Mercearia do Bairro",
        "Mercado / Mercearia"
      );

      expect(prompt).toContain("Mercearia do Bairro");
      expect(prompt).toContain("grocery store");
      expect(prompt).toContain("minimalist");
      expect(prompt).toContain("no text");
      expect(prompt).toContain("white background");
    });

    it("adjusts visual style when tone is provided", () => {
      const promptPremium = getLogoPromptBySegment(
        "Boutique Elegance",
        "Moda / Boutique",
        "Premium"
      );

      expect(promptPremium).toContain("elegant and sophisticated");
    });

    it("preserves base style when tone is 'Outro…'", () => {
      const prompt = getLogoPromptBySegment(
        "Pet Shop Amigo",
        "Pet shop",
        "Outro…"
      );

      expect(prompt).toContain("playful and caring"); // Base style
    });

    it("handles all 12 segments without errors", () => {
      const segments: Segment[] = [
        "Mercado / Mercearia",
        "Loja de bebidas",
        "Moda / Boutique",
        "Farmácia",
        "Restaurante / Lanchonete",
        "Pet shop",
        "Materiais de construção",
        "Salão / Estética",
        "Eletrônicos",
        "Casa & Decoração",
        "Academia",
        "Outro…",
      ];

      segments.forEach((segment) => {
        const prompt = getLogoPromptBySegment(`Test ${segment}`, segment);
        expect(prompt).toBeTruthy();
        expect(prompt.length).toBeGreaterThan(100); // Reasonable prompt length
      });
    });

    it("handles all 8 tone variations without errors", () => {
      const tones: ToneOfVoice[] = [
        "Amigável",
        "Direto",
        "Promocional",
        "Premium",
        "Divertido",
        "Técnico",
        "Próximo / \"de bairro\"",
        "Outro…",
      ];

      tones.forEach((tone) => {
        const prompt = getLogoPromptBySegment(
          "Test Store",
          "Mercado / Mercearia",
          tone
        );
        expect(prompt).toBeTruthy();
      });
    });

    it("falls back to 'Outro…' template for unknown segment", () => {
      // This tests internal fallback behavior
      const prompt = getLogoPromptBySegment(
        "Test Store",
        "Invalid Segment" as Segment
      );

      expect(prompt).toContain("Test Store");
      expect(prompt).toContain("clean and modern"); // "Outro…" style
    });

    it("handles empty store name gracefully", () => {
      const prompt = getLogoPromptBySegment("", "Pet shop");

      expect(prompt).toContain('""'); // Empty placeholder
      expect(prompt).toContain("pet shop");
    });

    it("handles store names with special characters", () => {
      const storeName = "João's Café & Mercearia";
      const prompt = getLogoPromptBySegment(storeName, "Mercado / Mercearia");

      expect(prompt).toContain(storeName);
    });
  });

  describe("getColorSuggestions", () => {
    it("returns valid hex color array for each segment", () => {
      const colors = getColorSuggestions("Pet shop");

      expect(Array.isArray(colors)).toBe(true);
      expect(colors.length).toBeGreaterThan(0);
      colors.forEach((color) => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i); // Valid hex format
      });
    });

    it("returns different colors for different segments", () => {
      const colorsGrocery = getColorSuggestions("Mercado / Mercearia");
      const colorsBeverage = getColorSuggestions("Loja de bebidas");

      expect(colorsGrocery).not.toEqual(colorsBeverage);
    });

    it("returns consistent colors for same segment", () => {
      const colors1 = getColorSuggestions("Academia");
      const colors2 = getColorSuggestions("Academia");

      expect(colors1).toEqual(colors2);
    });

    it("returns fallback colors for 'Outro…' segment", () => {
      const colors = getColorSuggestions("Outro…");

      expect(colors).toContain("#000000"); // Black
      expect(colors).toContain("#FFFFFF"); // White
    });
  });

  describe("getIconicElements", () => {
    it("returns array of iconic elements for each segment", () => {
      const elements = getIconicElements("Farmácia");

      expect(Array.isArray(elements)).toBe(true);
      expect(elements.length).toBeGreaterThan(0);
      expect(elements).toContain("medical cross");
    });

    it("returns segment-appropriate elements", () => {
      const petElements = getIconicElements("Pet shop");
      const gymElements = getIconicElements("Academia");

      expect(petElements).toContain("paw print");
      expect(gymElements).toContain("dumbbell icon");
    });
  });

  describe("getAvoidElements", () => {
    it("returns array of elements to avoid for each segment", () => {
      const avoidElements = getAvoidElements("Salão / Estética");

      expect(Array.isArray(avoidElements)).toBe(true);
      expect(avoidElements.length).toBeGreaterThan(0);
    });

    it("provides helpful negative guidance", () => {
      const avoidElements = getAvoidElements("Eletrônicos");

      expect(avoidElements.some((el) => el.includes("dated"))).toBe(true); // Avoid dated tech
    });
  });

  describe("getAllSegments", () => {
    it("returns all 12 segments", () => {
      const segments = getAllSegments();

      expect(segments.length).toBe(12);
      expect(segments).toContain("Mercado / Mercearia");
      expect(segments).toContain("Academia");
      expect(segments).toContain("Outro…");
    });
  });

  describe("isValidSegment", () => {
    it("returns true for valid segments", () => {
      expect(isValidSegment("Pet shop")).toBe(true);
      expect(isValidSegment("Farmácia")).toBe(true);
      expect(isValidSegment("Outro…")).toBe(true);
    });

    it("returns false for invalid segments", () => {
      expect(isValidSegment("Invalid")).toBe(false);
      expect(isValidSegment("")).toBe(false);
      expect(isValidSegment("pet shop")).toBe(false); // Case-sensitive
    });

    it("can be used as type guard", () => {
      const userInput = "Pet shop";

      if (isValidSegment(userInput)) {
        // TypeScript should recognize userInput as Segment here
        const prompt = getLogoPromptBySegment("Test", userInput);
        expect(prompt).toBeTruthy();
      }
    });
  });

  describe("Integration: Full workflow", () => {
    it("generates complete logo context for a store", () => {
      const storeName = "Boutique da Moda";
      const segment: Segment = "Moda / Boutique";
      const tone: ToneOfVoice = "Premium";

      // Get prompt
      const prompt = getLogoPromptBySegment(storeName, segment, tone);

      // Get colors
      const colors = getColorSuggestions(segment);

      // Get iconic elements
      const iconicElements = getIconicElements(segment);

      // Get avoid elements
      const avoidElements = getAvoidElements(segment);

      // Validate complete context
      expect(prompt).toContain(storeName);
      expect(prompt).toContain("elegant and sophisticated"); // Premium tone
      expect(colors.length).toBeGreaterThan(0);
      expect(iconicElements).toContain("dress silhouette");
      expect(avoidElements.length).toBeGreaterThan(0);
    });

    it("generates prompts for all segment/tone combinations (smoke test)", () => {
      const segments = getAllSegments();
      const tones: ToneOfVoice[] = [
        "Amigável",
        "Direto",
        "Promocional",
        "Premium",
        "Divertido",
        "Técnico",
        "Próximo / \"de bairro\"",
        "Outro…",
      ];

      let totalPrompts = 0;

      segments.forEach((segment) => {
        tones.forEach((tone) => {
          const prompt = getLogoPromptBySegment(
            `Test ${segment}`,
            segment,
            tone
          );
          expect(prompt).toBeTruthy();
          totalPrompts++;
        });
      });

      // Should generate 12 segments * 8 tones = 96 prompts
      expect(totalPrompts).toBe(96);
    });
  });

  describe("Edge cases", () => {
    it("handles very long store names", () => {
      const longName = "A".repeat(200);
      const prompt = getLogoPromptBySegment(longName, "Outro…");

      expect(prompt).toContain(longName);
    });

    it("handles store names with quotes", () => {
      const storeName = 'João\'s "Premium" Store';
      const prompt = getLogoPromptBySegment(storeName, "Outro…");

      expect(prompt).toContain(storeName);
    });

    it("handles unicode characters in store name", () => {
      const storeName = "Café São José ☕";
      const prompt = getLogoPromptBySegment(storeName, "Restaurante / Lanchonete");

      expect(prompt).toContain(storeName);
    });
  });
});
