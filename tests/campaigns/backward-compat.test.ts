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

function makeCampaign(overrides: Record<string, unknown> = {}) {
  return {
    id: "campaign-compat",
    store_id: "store-1",
    product_name: "Produto Teste",
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
    product_image_url: null,
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
    ...overrides,
  };
}

describe("generateCampaignContent backward compatibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_MOTOR_V2_ENABLED = "true";

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
      primary_color: null,
      secondary_color: null,
      logo_url: null,
      brand_profile: null,
    });

    callAIWithRetryMock.mockResolvedValue({
      data: {
        headline: "Oferta",
        caption: "Legenda",
        text: "Texto",
        cta: "Chama no Whats",
        hashtags: "#oferta",
        price_label: null,
      },
    });
  });

  it("keeps the legacy text-only flow when the campaign has no product image", async () => {
    const campaignSelectChain = {
      eq: vi.fn(),
      single: vi.fn().mockResolvedValue({ data: makeCampaign(), error: null }),
    };
    campaignSelectChain.eq.mockReturnValue(campaignSelectChain);
    const campaignUpdateChain = { eq: vi.fn().mockResolvedValue({ error: null }) };

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

    const { generateCampaignContent } = await import("@/lib/domain/campaigns/service");
    const result = await generateCampaignContent({ campaign_id: "campaign-compat", storeId: "store-1" });

    expect(result.ok).toBe(true);
    expect(generateCampaignVisualsMock).not.toHaveBeenCalled();
  });

  it("skips the visual pipeline for message campaigns", async () => {
    const campaignSelectChain = {
      eq: vi.fn(),
      single: vi.fn().mockResolvedValue({ data: makeCampaign({ content_type: "info" }), error: null }),
    };
    campaignSelectChain.eq.mockReturnValue(campaignSelectChain);
    const campaignUpdateChain = { eq: vi.fn().mockResolvedValue({ error: null }) };

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

    const { generateCampaignContent } = await import("@/lib/domain/campaigns/service");
    const result = await generateCampaignContent({ campaign_id: "campaign-compat", storeId: "store-1" });

    expect(result.ok).toBe(true);
    expect(generateCampaignVisualsMock).not.toHaveBeenCalled();
  });
});