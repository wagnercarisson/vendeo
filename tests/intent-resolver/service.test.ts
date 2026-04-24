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

import {
  emptyCreativeDirection,
  type IntentResolverInput,
} from "@/lib/ai/intent-resolver/contracts";
import {
  getVisualSignatureProfile,
  resolveIntent,
} from "@/lib/ai/intent-resolver/service";

const baseInput: IntentResolverInput = {
  image: {
    backgroundType: "solid",
    targetOccupancy: "medium",
    sceneType: "single_product",
    visibility: "clear",
    framing: "good",
    imageQuality: "good",
    matchType: "exact",
    targetPosition: "left",
    targetOrientation: "vertical",
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

describe("resolveIntent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty direction for message content", async () => {
    const result = await resolveIntent({
      ...baseInput,
      campaign: { ...baseInput.campaign, content_type: "message", objective: "informativo", price: null },
    });

    expect(callAIMock).not.toHaveBeenCalled();
    expect(result).toEqual(emptyCreativeDirection());
  });

  it("applies fallback when AI output is invalid", async () => {
    callAIMock.mockResolvedValueOnce(JSON.stringify({ directionType: "hero" }));

    const result = await resolveIntent(baseInput);

    expect(result.directionType).toBe("frame");
    expect(result.mood).toBe("aggressive");
  });

  it("validates AI output and applies hard rules", async () => {
    callAIMock.mockResolvedValueOnce(
      JSON.stringify({
        directionType: "overlay",
        mood: "aggressive",
        productTreatment: "background",
        textDistribution: "overlay",
        priceEmphasis: "high",
        visualIntensity: "strong",
      })
    );

    const result = await resolveIntent(baseInput);

    expect(result.directionType).toBe("frame");
    expect(result.productTreatment).toBe("background");
    expect(result.textDistribution).toBe("right");
  });
});

describe("getVisualSignatureProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to standard profile when context profile is missing", async () => {
    const signatureQuery = {
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          primary_color: "#111111",
          secondary_color: "#ffffff",
          logo_url: null,
          store_name_typography: { font: "Sora", weight: "700" },
          signature_seed: "seed",
        },
        error: null,
      }),
    };

    const contextQuery = {
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    const fallbackQuery = {
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          context_type: "standard",
          intensity_level: "balanced",
          composition_rules: {},
          typography_rules: {},
          color_rules: {},
        },
        error: null,
      }),
    };

    const selectMock = vi
      .fn()
      .mockReturnValueOnce(signatureQuery)
      .mockReturnValueOnce(contextQuery)
      .mockReturnValueOnce(fallbackQuery);

    const fromMock = vi.fn().mockReturnValue({ select: selectMock });
    getSupabaseAdminMock.mockReturnValue({ from: fromMock });

    const result = await getVisualSignatureProfile(
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "autoridade"
    );

    expect(result.context_type).toBe("standard");
    expect(result.intensity_level).toBe("balanced");
  });
});