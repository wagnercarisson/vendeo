import { beforeEach, describe, expect, it, vi } from "vitest";

import { VISUAL_COMPOSER_SYSTEM_PROMPT_V4 } from "@/lib/ai/visual-composer/prompts-v4";

const { callAIMock } = vi.hoisted(() => ({
  callAIMock: vi.fn(),
}));

vi.mock("@/lib/ai/parse", () => ({
  callAI: callAIMock,
  parseJsonFirstObject: (raw: string) => JSON.parse(raw),
}));

import { composeVariations } from "@/lib/ai/visual-composer/service";
import { generateFallbackVariations } from "@/lib/ai/visual-composer/fallback";
import { visualComposerFixtures } from "./fixtures/manifest";

describe("composeVariations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bypasses AI for message content", async () => {
    const result = await composeVariations({
      ...visualComposerFixtures[0].input,
      campaign: {
        ...visualComposerFixtures[0].input.campaign,
        content_type: "message",
      },
    });

    expect(callAIMock).not.toHaveBeenCalled();
    expect(result.variations).toHaveLength(0);
  });

  it("falls back when AI output is invalid", async () => {
    callAIMock.mockResolvedValueOnce(JSON.stringify({ direction: {}, variations: [] }));

    const result = await composeVariations(visualComposerFixtures[0].input);

    expect(result.variations).toHaveLength(4);
    expect(result.direction.directionType).toBe("hero");
  });

  it("falls back when AI output is too similar", async () => {
    const duplicated = generateFallbackVariations(visualComposerFixtures[0].input);
    callAIMock.mockResolvedValueOnce(
      JSON.stringify({
        ...duplicated,
        variations: Array.from({ length: 4 }, () => duplicated.variations[0]),
      })
    );

    const result = await composeVariations(visualComposerFixtures[0].input);
    expect(result.variations).toHaveLength(4);
    expect(new Set(result.variations.map((variation) => variation.seed)).size).toBe(4);
  });

  it("uses Prompt V4 for AI generation", async () => {
    const valid = generateFallbackVariations(visualComposerFixtures[0].input);
    callAIMock.mockResolvedValueOnce(JSON.stringify(valid));

    await composeVariations(visualComposerFixtures[0].input);

    expect(callAIMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          role: "system",
          content: VISUAL_COMPOSER_SYSTEM_PROMPT_V4,
        }),
        expect.objectContaining({
          role: "user",
          content: expect.stringContaining("Generate exactly 4 distinct layout variations."),
        }),
      ]),
      expect.objectContaining({
        model: "gpt-4.1",
        temperature: 0.4,
        timeoutMs: 25000,
      })
    );
  });
});
