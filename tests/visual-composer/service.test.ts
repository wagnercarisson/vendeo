import { beforeEach, describe, expect, it, vi } from "vitest";

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
});
