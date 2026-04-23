import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { readVisualTarget } from "@/lib/ai/visual-reader/service";

type FixtureEntry = {
  id: string;
  imageFile: string;
  request: {
    imageUrl: string;
    productName: string;
    content_type: "product" | "service" | "message";
  };
  expected: {
    detected: boolean;
    matchType: "exact" | "category_only" | "none";
    sceneType: string;
    backgroundType: string;
    imageQuality: string;
    visibility: string;
    framing: string;
    confidence: string;
    relevantCount: number;
    targetBox: { x: number; y: number; width: number; height: number } | null;
  };
};

const fixturesPath = path.resolve(
  __dirname,
  "fixtures",
  "manifest.json"
);

const fixtures = JSON.parse(readFileSync(fixturesPath, "utf-8")) as FixtureEntry[];

describe("visual-reader fixtures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCachedImageProfileMock.mockResolvedValue(null);
    setCachedImageProfileMock.mockResolvedValue(undefined);
  });

  it("covers all 10 mandatory fixture scenarios", async () => {
    expect(fixtures).toHaveLength(10);

    for (const fixture of fixtures) {
      const localImagePath = path.resolve(__dirname, "fixtures", fixture.imageFile);
      expect(existsSync(localImagePath)).toBe(true);

      callAIMock.mockResolvedValueOnce(JSON.stringify(fixture.expected));

      const result = await readVisualTarget(fixture.request);

      expect(result.detected).toBe(fixture.expected.detected);
      expect(result.matchType).toBe(fixture.expected.matchType);
      expect(result.sceneType).toBe(fixture.expected.sceneType);
      expect(result.backgroundType).toBe(fixture.expected.backgroundType);
      expect(result.imageQuality).toBe(fixture.expected.imageQuality);
      expect(result.visibility).toBe(fixture.expected.visibility);
      expect(result.framing).toBe(fixture.expected.framing);
      expect(result.confidence).toBe(fixture.expected.confidence);
      expect(result.relevantCount).toBe(fixture.expected.relevantCount);

      if (fixture.expected.targetBox === null) {
        expect(result.targetBox).toBeNull();
      } else {
        expect(result.targetBox).not.toBeNull();
      }
    }
  });
});