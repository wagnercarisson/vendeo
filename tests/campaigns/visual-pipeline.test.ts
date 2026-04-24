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

describe("generateCampaignVisuals", () => {
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
      logo_url: "https://example.com/logo.png",
      store_name_typography: { font: "Inter", weight: "700" },
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
      variations: [0, 1, 2, 3].map((index) => ({
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
          storeIdentity: { type: "logo", position: "top-left", size: { width: 180, height: 80 } },
        },
      })),
    });
    renderVariationsMock.mockResolvedValue([0, 1, 2, 3].map((index) => ({
      artUrl: `https://example.com/campaigns/c-1/variation-${index}.png`,
      metadata: { width: 1080, height: 1350, format: "png", size: 123456, renderTime: 120 },
    })));
  });

  it("executes motors 1 to 4 in sequence and returns visual outputs", async () => {
    const result = await generateCampaignVisuals({
      campaign_id: "c-1",
      store_id: "s-1",
      product_image_url: "https://example.com/product.png",
      campaign_data: {
        product_name: "Coca-Cola 2L",
        objective: "promocao",
        audience: "geral",
        price: 9.99,
        price_label: null,
        content_type: "product",
        product_positioning: "popular",
      },
      visual_signature: {
        logo_url: "https://example.com/logo.png",
        store_name: "Mercado Teste",
      },
    });

    expect(readVisualTargetMock).toHaveBeenCalledOnce();
    expect(getVisualSignatureProfileMock).toHaveBeenCalledOnce();
    expect(resolveIntentMock).toHaveBeenCalledOnce();
    expect(composeVariationsMock).toHaveBeenCalledOnce();
    expect(renderVariationsMock).toHaveBeenCalledOnce();
    expect(result.visual_outputs).toHaveLength(4);
    expect(result.trace_id).toBeTruthy();
  });

  it("reuses existing visual outputs when force is false", async () => {
    const result = await generateCampaignVisuals({
      campaign_id: "c-1",
      store_id: "s-1",
      product_image_url: "https://example.com/product.png",
      campaign_data: {
        product_name: "Coca-Cola 2L",
        objective: "promocao",
        audience: "geral",
        content_type: "product",
      },
      visual_signature: {
        store_name: "Mercado Teste",
      },
      existing_visual_outputs: [
        {
          variation_index: 0,
          url: "https://example.com/existing.png",
          metadata: { width: 1080, height: 1350, format: "png", size: 999 },
        },
      ],
    });

    expect(result.reused).toBe(true);
    expect(readVisualTargetMock).not.toHaveBeenCalled();
  });

  it("returns a visual-reader pipeline error when the image is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 404 })));

    await expect(generateCampaignVisuals({
      campaign_id: "c-1",
      store_id: "s-1",
      product_image_url: "https://example.com/missing.png",
      campaign_data: {
        product_name: "Coca-Cola 2L",
        objective: "promocao",
        audience: "geral",
        content_type: "product",
      },
      visual_signature: {
        store_name: "Mercado Teste",
      },
    })).rejects.toMatchObject({
      motor: "visual-reader",
      code: "IMAGE_LOAD_FAILED",
    });
  });
});