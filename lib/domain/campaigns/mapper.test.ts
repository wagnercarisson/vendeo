import { describe, it, expect } from "vitest";
import {
  mapDbCampaignToDomain,
  mapDbCampaignToAIContext,
  mapAiArtToPreview,
  mapAiReelsToPreview,
  mapAiCampaignToDomain,
  mapDomainToCampaignDb,
} from "./mapper";
import type { Campaign, CampaignContext } from "./types";
import type { StoreContext } from "@/lib/domain/stores/types";

// Fixture com dados reais do banco Supabase
const REAL_DB_ROW = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  store_id: "456e7890-e89b-12d3-a456-426614174001",
  product_name: "Tênis Nike Air Max",
  price: 299.90,
  price_label: null,
  audience: "jovens_festa",
  objective: "promocao",
  product_positioning: "medio",
  status: "ready",
  campaign_type: "post",
  content_type: "product",
  legacy_content_type: null,
  domain_input: {},
  domain_input_version: 1,
  post_status: "ready",
  reels_status: "none",
  origin: "manual",
  weekly_plan_item_id: null,
  image_url: null,
  product_image_url: "https://example.com/image.jpg",
  headline: "Tênis Nike em Promoção!",
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
  created_at: "2026-04-20T10:00:00Z",
};

describe("mapDbCampaignToDomain", () => {
  it("mapeia dado real do banco corretamente", () => {
    const result = mapDbCampaignToDomain(REAL_DB_ROW);
    expect(result.id).toBe("123e4567-e89b-12d3-a456-426614174000");
    expect(result.product_name).toBe("Tênis Nike Air Max");
    expect(result.price).toBe(299.90);
    expect(result.content_type).toBe("product");
  });

  it("lança erro com mensagem útil quando campo obrigatório ausente", () => {
    const invalid = { ...REAL_DB_ROW, id: undefined };
    expect(() => mapDbCampaignToDomain(invalid)).toThrow("[mapDbCampaignToDomain] Campo inválido: id");
  });

  it("mapeia content_type legacy 'info' corretamente", () => {
    const legacy = { ...REAL_DB_ROW, content_type: "info", legacy_content_type: "info" };
    const result = mapDbCampaignToDomain(legacy);
    expect(result.content_type).toBe("message"); // normalizeCampaignContentType("info") → "message"
    expect(result.legacy_content_type).toBe("info");
  });
});

describe("mapDbCampaignToAIContext", () => {
  it("mapeia dado real do banco para CampaignContext", () => {
    const result = mapDbCampaignToAIContext(REAL_DB_ROW);
    expect(result.product_name).toBe("Tênis Nike Air Max");
    expect(result.audience).toBe("jovens_festa");
    expect(result.objective).toBe("promocao");
  });

  it("usa fallback quando product_name é null", () => {
    const withoutName = { ...REAL_DB_ROW, product_name: null };
    const result = mapDbCampaignToAIContext(withoutName);
    expect(result.product_name).toBe("Produto");
  });

  it("lança erro quando campo obrigatório ausente", () => {
    const invalid = { ...REAL_DB_ROW, store_id: undefined };
    expect(() => mapDbCampaignToAIContext(invalid)).toThrow("[mapDbCampaignToAIContext] Campo inválido: store_id");
  });
});

describe("mapAiArtToPreview", () => {
  const mockCampaign: Campaign = {
    id: "123",
    store_id: "456",
    product_name: "Produto Teste",
    price: 99.90,
    price_label: null,
    audience: null,
    objective: null,
    product_positioning: null,
    status: null,
    campaign_type: "both",
    content_type: "product",
    legacy_content_type: null,
    domain_input: {},
    domain_input_version: 1,
    post_status: "none",
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
    created_at: "2026-04-20T10:00:00Z",
  };

  it("mapeia AI response válida corretamente", () => {
    const aiResponse = {
      headline: "Promoção Imperdível!",
      caption: "Teste caption",
      text: "Texto promocional",
      cta: "Compre agora",
      hashtags: "#promo #teste",
      price_label: "DESCONTO",
    };
    const result = mapAiArtToPreview(mockCampaign, aiResponse);
    expect(result.headline).toBe("Promoção Imperdível!");
    expect(result.price_label).toBe("DESCONTO");
  });

  it("retorna fallback quando AI response inválida (não throw)", () => {
    const invalid = { headline: 123 }; // Tipo incorreto — number não é string
    const result = mapAiArtToPreview(mockCampaign, invalid);
    expect(result.headline).toBe("Produto Teste"); // Fallback para product_name
    expect(result.body_text).toBe("");
    expect(result.cta).toBe("");
  });
});

describe("mapAiReelsToPreview", () => {
  it("mapeia reels response válida corretamente", () => {
    const reelsResponse = {
      hook: "Hook inicial",
      script: "Script completo",
      shotlist: ["Shot 1", "Shot 2"],
      on_screen_text: ["Texto 1"],
      audio_suggestion: "Música sugerida",
      duration_seconds: 45,
      caption: "Caption reels",
      cta: "CTA reels",
      hashtags: "#reels",
    };
    const result = mapAiReelsToPreview(reelsResponse);
    expect(result.reels_hook).toBe("Hook inicial");
    expect(result.reels_duration_seconds).toBe(45);
  });

  it("retorna fallback quando reels response inválida (não throw)", () => {
    const invalid = { hook: null, script: 123 }; // null/number não são string
    const result = mapAiReelsToPreview(invalid);
    expect(result.reels_hook).toBe("");
    expect(result.reels_script).toBe("");
    expect(result.reels_shotlist).toEqual([]);
    expect(result.reels_duration_seconds).toBe(30); // Fallback
  });
});

describe("mapAiCampaignToDomain", () => {
  const mockCampaignContext: CampaignContext = {
    id: "123",
    store_id: "456",
    product_name: "Produto Teste",
    price: "99.90",
    price_label: null,
    audience: "geral",
    objective: "promocao",
    product_positioning: null,
    theme: null,
  };

  const mockStoreContext: StoreContext = {
    id: "456",
    name: "Loja Teste",
    city: null,
    state: null,
    main_segment: null,
    brand_positioning: null,
    tone_of_voice: null,
    whatsapp: "11999999999",
    phone: null,
    instagram: null,
    address: null,
    neighborhood: null,
    primary_color: "#000000",
    secondary_color: "#FFFFFF",
    logo_url: null,
  };

  it("usa dados validados quando aiData é válido", () => {
    const aiData = {
      headline: "Headline AI",
      caption: "Caption AI",
      text: "Texto AI",
      cta: "CTA AI",
      hashtags: "#ai #test",
      price_label: "AI LABEL",
    };
    const result = mapAiCampaignToDomain(aiData, mockCampaignContext, mockStoreContext);
    expect(result.headline).toBe("Headline AI");
    expect(result.caption).toBe("Caption AI");
  });

  it("usa fallbacks quando aiData tem campos ausentes", () => {
    const aiData = {}; // Todos os campos opcionais → fallbacks
    const result = mapAiCampaignToDomain(aiData, mockCampaignContext, mockStoreContext);
    expect(result.headline).toBe("Produto Teste"); // Fallback para campaign.product_name
    expect(result.caption).toContain("Produto Teste em destaque"); // Fallback template
  });
});

describe("mapDomainToCampaignDb", () => {
  const mockCampaign: Campaign = {
    id: "123",
    store_id: "456",
    product_name: "Produto Teste",
    price: 99.90,
    price_label: "OFERTA",
    audience: "geral",
    objective: "promocao",
    product_positioning: "medio",
    status: "ready",
    campaign_type: "both",
    content_type: "message",
    legacy_content_type: null,
    domain_input: { test: "value" },
    domain_input_version: 1,
    post_status: "ready",
    reels_status: "none",
    origin: "manual",
    weekly_plan_item_id: null,
    image_url: null,
    product_image_url: "https://example.com/img.jpg",
    headline: "Headline teste",
    body_text: null,
    cta: null,
    ai_caption: "Caption AI",
    ai_text: "Texto AI",
    ai_cta: "CTA AI",
    ai_hashtags: "#test",
    ai_generated_at: "2026-04-20T10:00:00Z",
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
    created_at: "2026-04-20T10:00:00Z",
  };

  it("converte Campaign para formato DB com campos snake_case", () => {
    const result = mapDomainToCampaignDb(mockCampaign);
    expect(result.product_name).toBe("Produto Teste");
    expect(result.price).toBe(99.90);
    expect(result.price_label).toBe("OFERTA");
    expect(result.ai_caption).toBe("Caption AI");
  });

  it("usa buildCampaignContentTypeWrite para content_type 'message'", () => {
    const result = mapDomainToCampaignDb(mockCampaign);
    expect(result.content_type).toBe("info"); // "message" → "info" (via buildCampaignContentTypeWrite)
    expect(result.legacy_content_type).toBe("info");
  });

  it("converte content_type 'product' corretamente", () => {
    const productCampaign = { ...mockCampaign, content_type: "product" as const };
    const result = mapDomainToCampaignDb(productCampaign);
    expect(result.content_type).toBe("product");
    expect(result.legacy_content_type).toBe(null);
  });
});
