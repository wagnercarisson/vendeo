/**
 * Unit tests for DALL-E 3 Logo Prompt Templates
 * 
 * @see lib/ai/logo-prompts.ts
 * @see Story 3: Logo IA - DALL-E 3 (Intelligence Sprint 1)
 * @created 2026-04-30
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  getLogoPromptBySegment,
  getColorSuggestions,
  getIconicElements,
  getAvoidElements,
  getAllSegments,
  isValidSegment,
  type Segment,
  type ToneOfVoice,
} from "./logo-prompts.ts";

test("getLogoPromptBySegment returns a complete prompt with store name interpolated", () => {
      const prompt = getLogoPromptBySegment(
        "Mercearia do Bairro",
        "Mercado / Mercearia"
      );

      assert.match(prompt, /Mercearia do Bairro/);
      assert.match(prompt, /grocery store/);
      assert.match(prompt, /minimalist/);
      assert.match(prompt, /no text/);
      assert.match(prompt, /white background/);
});

test("getLogoPromptBySegment adjusts visual style when tone is provided", () => {
      const promptPremium = getLogoPromptBySegment(
        "Boutique Elegance",
        "Moda / Boutique",
        "Premium"
      );

      assert.match(promptPremium, /elegant and sophisticated/);
});

test("getLogoPromptBySegment preserves base style when tone is 'Outro…'", () => {
      const prompt = getLogoPromptBySegment(
        "Pet Shop Amigo",
        "Pet shop",
        "Outro…"
      );

      assert.match(prompt, /playful and caring/);
});

test("getLogoPromptBySegment handles all 12 segments without errors", () => {
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
        assert.ok(prompt);
        assert.ok(prompt.length > 100);
      });
});

test("getLogoPromptBySegment handles all 8 tone variations without errors", () => {
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
        assert.ok(prompt);
      });
});

test("getLogoPromptBySegment falls back to 'Outro…' template for unknown segment", () => {
      // This tests internal fallback behavior
      const prompt = getLogoPromptBySegment(
        "Test Store",
        "Invalid Segment" as Segment
      );

      assert.match(prompt, /Test Store/);
      assert.match(prompt, /clean and modern/);
});

test("getLogoPromptBySegment handles empty store name gracefully", () => {
      const prompt = getLogoPromptBySegment("", "Pet shop");

      assert.match(prompt, /""/);
      assert.match(prompt, /pet shop/);
});

test("getLogoPromptBySegment handles store names with special characters", () => {
      const storeName = "João's Café & Mercearia";
      const prompt = getLogoPromptBySegment(storeName, "Mercado / Mercearia");

      assert.match(prompt, /João's Café & Mercearia/);
});

test("getColorSuggestions returns valid hex color array for each segment", () => {
      const colors = getColorSuggestions("Pet shop");

      assert.equal(Array.isArray(colors), true);
      assert.ok(colors.length > 0);
      colors.forEach((color) => {
        assert.match(color, /^#[0-9A-F]{6}$/i);
      });
});

test("getColorSuggestions returns different colors for different segments", () => {
      const colorsGrocery = getColorSuggestions("Mercado / Mercearia");
      const colorsBeverage = getColorSuggestions("Loja de bebidas");

      assert.notDeepEqual(colorsGrocery, colorsBeverage);
});

test("getColorSuggestions returns consistent colors for same segment", () => {
      const colors1 = getColorSuggestions("Academia");
      const colors2 = getColorSuggestions("Academia");

      assert.deepEqual(colors1, colors2);
});

test("getColorSuggestions returns fallback colors for 'Outro…' segment", () => {
      const colors = getColorSuggestions("Outro…");

      assert.ok(colors.includes("#000000"));
      assert.ok(colors.includes("#FFFFFF"));
});

test("getIconicElements returns array of iconic elements for each segment", () => {
      const elements = getIconicElements("Farmácia");

      assert.equal(Array.isArray(elements), true);
      assert.ok(elements.length > 0);
      assert.ok(elements.includes("medical cross"));
});

test("getIconicElements returns segment-appropriate elements", () => {
      const petElements = getIconicElements("Pet shop");
      const gymElements = getIconicElements("Academia");

      assert.ok(petElements.includes("paw print"));
      assert.ok(gymElements.includes("dumbbell icon"));
});

test("getAvoidElements returns array of elements to avoid for each segment", () => {
      const avoidElements = getAvoidElements("Salão / Estética");

      assert.equal(Array.isArray(avoidElements), true);
      assert.ok(avoidElements.length > 0);
});

test("getAvoidElements provides helpful negative guidance", () => {
      const avoidElements = getAvoidElements("Eletrônicos");

      assert.ok(avoidElements.some((el) => el.includes("dated")));
});

test("getAllSegments returns all 12 segments", () => {
      const segments = getAllSegments();

      assert.equal(segments.length, 12);
      assert.ok(segments.includes("Mercado / Mercearia"));
      assert.ok(segments.includes("Academia"));
      assert.ok(segments.includes("Outro…"));
});

test("isValidSegment returns true for valid segments", () => {
      assert.equal(isValidSegment("Pet shop"), true);
      assert.equal(isValidSegment("Farmácia"), true);
      assert.equal(isValidSegment("Outro…"), true);
});

test("isValidSegment returns false for invalid segments", () => {
      assert.equal(isValidSegment("Invalid"), false);
      assert.equal(isValidSegment(""), false);
      assert.equal(isValidSegment("pet shop"), false);
});

test("isValidSegment can be used as type guard", () => {
      const userInput = "Pet shop";

      if (isValidSegment(userInput)) {
        const prompt = getLogoPromptBySegment("Test", userInput);
        assert.ok(prompt);
      }
});

test("Integration generates complete logo context for a store", () => {
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

      assert.match(prompt, /Boutique da Moda/);
      assert.match(prompt, /elegant and sophisticated/);
      assert.ok(colors.length > 0);
      assert.ok(iconicElements.includes("dress silhouette"));
      assert.ok(avoidElements.length > 0);
});

test("Integration generates prompts for all segment tone combinations", () => {
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
          assert.ok(prompt);
          totalPrompts++;
        });
      });

      assert.equal(totalPrompts, 96);
});

test("Edge case handles very long store names", () => {
      const longName = "A".repeat(200);
      const prompt = getLogoPromptBySegment(longName, "Outro…");

      assert.match(prompt, new RegExp(longName));
});

test("Edge case handles store names with quotes", () => {
      const storeName = 'João\'s "Premium" Store';
      const prompt = getLogoPromptBySegment(storeName, "Outro…");

      assert.match(prompt, /João's "Premium" Store/);
});

test("Edge case handles unicode characters in store name", () => {
      const storeName = "Café São José ☕";
      const prompt = getLogoPromptBySegment(storeName, "Restaurante / Lanchonete");

      assert.match(prompt, /Café São José ☕/);
});
