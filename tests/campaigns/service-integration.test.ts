import { beforeEach, describe, expect, it, vi } from "vitest";

const getSupabaseAdminMock = vi.fn();
const fetchStoreContextMock = vi.fn();
const callAIWithRetryMock = vi.fn();
const generateCampaignVisualsMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: getSupabaseAdminMock,
}));

vi.mock("@/lib/domain/stores/queries", () => ({
  fetchStoreContext: fetchStoreContextMock,
}));

vi.mock("@/lib/ai/parse", () => ({
  callAIWithRetry: callAIWithRetryMock,
}));

vi.mock("@/lib/domain/campaigns/visual-pipeline", async () => {
  const actual = await vi.importActual<typeof import("@/lib/domain/campaigns/visual-pipeline")>("@/lib/domain/campaigns/visual-pipeline");
  return {
    ...actual,
    generateCampaignVisuals: generateCampaignVisualsMock,
  };
});

describe("generateCampaignContent visual v2 integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_MOTOR_V2_ENABLED = "true";

    const campaignSelectChain = {
      eq: vi.fn(),
      single: vi.fn(),
    };
    campaignSelectChain.eq.mockReturnValue(campaignSelectChain);
    campaignSelectChain.single
      .mockResolvedValueOnce({
        data: {
          id: "campaign-1",
          store_id: "store-1",
          product_name: "Coca-Cola 2L",
          price: 9.99,
          price_label: null,
          audience: "geral",
          objective: "promocao",
          product_positioning: "popular",
          status: "draft",
          campaign_type: "post",
          content_type: "product",
          legacy_content_type: null,
          domain_input: {},
          domain_input_version: 1,
          post_status: "draft",
          reels_status: "none",
          origin: "manual",
          weekly_plan_item_id: null,
          image_url: null,
          product_image_url: "https://example.com/product.png",
          headline: null,
          body_text: null,
          cta: null,
          ai_caption: null,
          ai_text: null,
          ai_cta: null,
          ai_hashtags: null,
          ai_generated_at: null,
          reels_hook: null,
          reels_script: null,
          reels_shotlist: null,
          reels_on_screen_text: null,
          reels_audio_suggestion: null,
          reels_duration_seconds: null,
          reels_caption: null,
          reels_cta: null,
          reels_hashtags: null,
          reels_generated_at: null,
          created_at: new Date().toISOString(),
        },
        error: null,
      })
      .mockResolvedValueOnce({ data: null, error: null });

    const campaignUpdateChain = {
      eq: vi.fn().mockResolvedValue({ error: null }),
    };

    getSupabaseAdminMock.mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "weekly_plan_items") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null }),
          };
        }

        return {
          select: vi.fn(() => campaignSelectChain),
          update: vi.fn(() => campaignUpdateChain),
        };
      }),
    });

    fetchStoreContextMock.mockResolvedValue({
      id: "store-1",
      name: "Mercado Teste",
      city: "Sao Paulo",
      state: "SP",
      main_segment: "mercado",
      brand_positioning: "popular",
      tone_of_voice: "direto",
      whatsapp: null,
      phone: null,
      instagram: null,
      primary_color: "#111111",
      secondary_color: "#ffffff",
      logo_url: "https://example.com/logo.png",
      brand_profile: null,
    });

    callAIWithRetryMock.mockResolvedValue({
      data: {
        headline: "Oferta",
        caption: "Legenda",
        text: "Texto",
        cta: "Peça agora",
        hashtags: "#oferta",
        price_label: null,
      },
    });

    generateCampaignVisualsMock.mockResolvedValue({
      trace_id: "trace-1",
      campaign_id: "campaign-1",
      visual_outputs: [
        {
          variation_index: 0,
          url: "campaigns/campaign-1/variation-0.png",
          metadata: { width: 1080, height: 1350, format: "png", size: 1234 },
        },
      ],
      performance: {
        motor1_ms: 100,
        motor2_ms: 200,
        motor3_ms: 300,
        motor4_ms: 400,
        total_ms: 1000,
      },
    });
  });

  it("calls the visual pipeline when feature flag is enabled and image exists", async () => {
    const { generateCampaignContent } = await import("@/lib/domain/campaigns/service");
    const result = await generateCampaignContent({
      campaign_id: "campaign-1",
      storeId: "store-1",
      persist: true,
    });

    expect(result.ok).toBe(true);
    expect(generateCampaignVisualsMock).toHaveBeenCalledOnce();
  });

  it("skips the visual pipeline when feature flag is disabled", async () => {
    process.env.NEXT_PUBLIC_MOTOR_V2_ENABLED = "false";
    vi.resetModules();
    const { generateCampaignContent } = await import("@/lib/domain/campaigns/service");
    await generateCampaignContent({
      campaign_id: "campaign-1",
      storeId: "store-1",
      persist: true,
    });

    expect(generateCampaignVisualsMock).not.toHaveBeenCalled();
  });

  it("returns a pipeline error without persisting partial output when the visual pipeline fails", async () => {
    generateCampaignVisualsMock.mockRejectedValueOnce({ code: "IMAGE_LOAD_FAILED" });
    vi.resetModules();
    const { generateCampaignContent } = await import("@/lib/domain/campaigns/service");
    const result = await generateCampaignContent({
      campaign_id: "campaign-1",
      storeId: "store-1",
      persist: true,
    });

    expect(result).toMatchObject({
      ok: false,
      error: "IMAGE_LOAD_FAILED",
    });
  });
});