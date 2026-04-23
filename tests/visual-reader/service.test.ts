import { beforeEach, describe, expect, it, vi } from "vitest";

import { emptyImageProfile, type ImageProfile } from "@/lib/ai/visual-reader/contracts";

const {
  callAIMock,
  getCachedImageProfileMock,
  setCachedImageProfileMock,
} = vi.hoisted(() => ({
  callAIMock: vi.fn(),
  getCachedImageProfileMock: vi.fn(),
  setCachedImageProfileMock: vi.fn(),
}));

vi.mock("@/lib/ai/parse", () => ({
  callAI: callAIMock,
  parseJsonFirstObject: (raw: string) => JSON.parse(raw),
}));

vi.mock("@/lib/ai/visual-reader/cache", () => ({
  getCachedImageProfile: getCachedImageProfileMock,
  setCachedImageProfile: setCachedImageProfileMock,
}));

import { getVisualReaderAlerts } from "@/lib/ai/visual-reader/alerts";
import { readVisualTarget } from "@/lib/ai/visual-reader/service";

describe("readVisualTarget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCachedImageProfileMock.mockResolvedValue(null);
    setCachedImageProfileMock.mockResolvedValue(undefined);
  });

  it("bypasses AI when content_type is message", async () => {
    const result = await readVisualTarget({
      imageUrl: "https://example.com/message.svg",
      productName: "Aviso da Loja",
      content_type: "message",
    });

    expect(callAIMock).not.toHaveBeenCalled();
    expect(result).toEqual(
      emptyImageProfile("Visual analysis skipped for message content.")
    );
  });

  it("returns cached profile before calling AI", async () => {
    const cached: ImageProfile = {
      ...emptyImageProfile("cached"),
      matchType: "exact",
      detected: true,
      matchedTarget: "Cached product",
      targetBox: { x: 0.25, y: 0.1, width: 0.5, height: 0.7 },
      targetOrientation: "vertical",
      targetPosition: "center",
      targetOccupancy: "medium",
      sceneType: "single_product",
      confidence: "high",
      imageQuality: "good",
      visibility: "clear",
      framing: "good",
      backgroundType: "solid",
      subjectCutoff: "none",
      safeExpansionPotential: "medium",
      focusClarity: "high",
      visualIsolation: "high",
      relevantCount: 1,
    };
    getCachedImageProfileMock.mockResolvedValue(cached);

    const result = await readVisualTarget({
      imageUrl: "https://example.com/cached.svg",
      productName: "Produto Cacheado",
      content_type: "product",
    });

    expect(callAIMock).not.toHaveBeenCalled();
    expect(result).toEqual(cached);
  });

  it("falls back when AI returns invalid schema", async () => {
    callAIMock.mockResolvedValueOnce(JSON.stringify({ matchType: "exact" }));

    const result = await readVisualTarget({
      imageUrl: "https://example.com/invalid.svg",
      productName: "Produto Invalido",
      content_type: "product",
    });

    expect(result.matchType).toBe("none");
    expect(result.targetBox).toBeNull();
    expect(setCachedImageProfileMock).not.toHaveBeenCalled();
  });

  it("normalizes and caches valid AI output", async () => {
    callAIMock.mockResolvedValueOnce(
      JSON.stringify({
        detected: false,
        matchType: "category_only",
        matchedTarget: "Pepsi bottle",
        confidence: "medium",
        sceneType: "single_product",
        relevantCount: 1,
        ignoredElements: [],
        targetBox: { x: 0.31, y: 0.11, width: 0.38, height: 0.78 },
        targetOrientation: "vertical",
        targetPosition: "unknown",
        targetOccupancy: "low",
        imageQuality: "acceptable",
        visibility: "clear",
        framing: "good",
        backgroundType: "complex",
        subjectCutoff: "none",
        safeExpansionPotential: "medium",
        focusClarity: "medium",
        visualIsolation: "medium",
        reasoningSummary: "Similar soda found.",
      })
    );

    const result = await readVisualTarget({
      imageUrl: "https://example.com/category.svg",
      productName: "Coca Cola 600ml",
      content_type: "product",
    });

    expect(result.matchType).toBe("category_only");
    expect(result.detected).toBe(false);
    expect(result.targetBox).not.toBeNull();
    expect(result.targetPosition).toBe("center");
    expect(setCachedImageProfileMock).toHaveBeenCalledOnce();
  });
});

describe("getVisualReaderAlerts", () => {
  it("returns non-blocking alerts for risky outputs", () => {
    const alerts = getVisualReaderAlerts({
      ...emptyImageProfile("alerts"),
      matchType: "category_only",
      matchedTarget: "Refrigerante similar",
      imageQuality: "poor",
      visibility: "obstructed",
      framing: "distant",
      confidence: "low",
      targetBox: { x: 0.2, y: 0.2, width: 0.4, height: 0.4 },
    });

    expect(alerts.map((alert) => alert.code)).toEqual([
      "MATCH_CATEGORY_ONLY",
      "IMAGE_QUALITY_POOR",
      "VISIBILITY_OBSTRUCTED",
      "FRAMING_DISTANT",
      "CONFIDENCE_LOW",
    ]);
  });
});