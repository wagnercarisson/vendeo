import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateCampaignVisuals } from "@/lib/domain/campaigns/visual-pipeline";

const {
  readVisualTargetMock,
  getVisualSignatureProfileMock,
  resolveIntentMock,
  composeVariationsMock,
  renderVariationsMock,
} = vi.hoisted(() => ({
  readVisualTargetMock: vi.fn(),
  getVisualSignatureProfileMock: vi.fn(),
  resolveIntentMock: vi.fn(),
  composeVariationsMock: vi.fn(),
  renderVariationsMock: vi.fn(),
}));

vi.mock("@/lib/ai/visual-reader/service", () => ({
  readVisualTarget: readVisualTargetMock,
}));

vi.mock("@/lib/ai/intent-resolver/service", () => ({
  getVisualSignatureProfile: getVisualSignatureProfileMock,
  resolveIntent: resolveIntentMock,
}));

vi.mock("@/lib/ai/visual-composer/service", () => ({
  composeVariations: composeVariationsMock,
}));

vi.mock("@/lib/ai/renderer/service", () => ({
  renderVariations: renderVariationsMock,
}));

describe("generateCampaignVisuals performance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true })));

    readVisualTargetMock.mockResolvedValue({
      targetBox: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
      targetPosition: "center",
      targetOrientation: "square",
      targetOccupancy: "high",
      backgroundType: "solid",
      sceneType: "single_product",
      imageQuality: "good",
      visibility: "clear",
      framing: "good",
      matchType: "exact",
    });
    getVisualSignatureProfileMock.mockResolvedValue({
      logo_url: null,
      store_name_typography: {},
      signature_seed: "seed-1",
      intensity_level: "balanced",
      context_type: "promotional",
    });
    resolveIntentMock.mockResolvedValue({
      directionType: "hero",
      mood: "clean",
      productTreatment: "background",
      textDistribution: "center",
      priceEmphasis: "high",
      visualIntensity: "balanced",
    });
    composeVariationsMock.mockResolvedValue({
      variations: new Array(4).fill(null).map((_, index) => ({
        id: crypto.randomUUID(),
        seed: `seed:${index}`,
        layout: {
          productArea: { x: 40, y: 80, width: 700, height: 800 },
          textArea: { x: 120, y: 980, width: 800, height: 120 },
          priceArea: { x: 220, y: 1120, width: 600, height: 120 },
        },
        hierarchy: { primary: "product", secondary: "price", tertiary: "text" },
        spacing: { padding: 40, margins: { top: 40, right: 40, bottom: 40, left: 40 }, gaps: 20 },
        typography: {
          productName: { fontSize: 60, fontWeight: "700" },
          price: { fontSize: 88, fontWeight: "900" },
          description: { fontSize: 24, fontWeight: "400" },
        },
        decorative: {
          priceBadge: null,
          storeIdentity: { type: "text", position: "top-left", size: { width: 180, height: 80 } },
        },
      })),
    });
    renderVariationsMock.mockResolvedValue(new Array(4).fill(null).map((_, index) => ({
      artUrl: `https://example.com/${index}.png`,
      metadata: { width: 1080, height: 1350, format: "png", size: 1111, renderTime: 90 },
    })));
  });

  it("stays under the 10 second budget for the orchestrated pipeline", async () => {
    let tick = 0;
    const now = vi.fn(() => {
      tick += 250;
      return tick;
    });

    const result = await generateCampaignVisuals({
      campaign_id: "campaign-perf",
      store_id: "store-1",
      product_image_url: "https://example.com/product.png",
      campaign_data: {
        product_name: "Produto Teste",
        objective: "promocao",
        audience: "geral",
        content_type: "product",
      },
      visual_signature: {
        store_name: "Mercado Teste",
      },
    }, { now });

    expect(result.performance.total_ms).toBeLessThan(10000);
  });
});