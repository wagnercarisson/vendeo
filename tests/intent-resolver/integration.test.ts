import { readFileSync } from "node:fs";
import path from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

const { callAIMock, getSupabaseAdminMock } = vi.hoisted(() => ({
  callAIMock: vi.fn(),
  getSupabaseAdminMock: vi.fn(),
}));

vi.mock("@/lib/ai/parse", () => ({
  callAI: callAIMock,
  parseJsonFirstObject: (raw: string) => JSON.parse(raw),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: getSupabaseAdminMock,
}));

import { resolveIntent } from "@/lib/ai/intent-resolver/service";

type Fixture = {
  id: string;
  input: Parameters<typeof resolveIntent>[0];
  expected: Awaited<ReturnType<typeof resolveIntent>>;
};

const manifestPath = path.resolve(__dirname, "fixtures", "manifest.json");
const fixtures = JSON.parse(readFileSync(manifestPath, "utf-8")) as Fixture[];

describe("Intent Resolver fixtures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("covers all 12 mandatory scenarios", async () => {
    expect(fixtures).toHaveLength(12);

    for (const fixture of fixtures) {
      if (fixture.input.campaign.content_type === "message") {
        const result = await resolveIntent(fixture.input);
        expect(result).toEqual(fixture.expected);
        continue;
      }

      callAIMock.mockResolvedValueOnce(JSON.stringify(fixture.expected));

      const result = await resolveIntent(fixture.input);
      expect(result).toEqual(fixture.expected);
    }
  });
});