import { describe, it, expect } from "vitest";
import {
  DbCampaignSchema,
  AICampaignContentSchema,
  CampaignDomainSchema,
} from "./schemas";

// ─────────────────────────────────────────────────────────────
// Fixtures — representam dados reais do banco e da IA
// ─────────────────────────────────────────────────────────────

const validDbCampaignFixture = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  store_id: "abc12345-0000-0000-0000-000000000001",
  product_name: "Tênis Air Max",
  price: 299.9,
  price_label: "R$ 299,90",
  audience: "jovens_festa",
  objective: "promocao",
  product_positioning: "medio",
  status: "ready",
  campaign_type: "post",
  content_type: "product",
  legacy_content_type: null,
  domain_input: null,
  domain_input_version: null,
  post_status: "ready",
  reels_status: "none",
  origin: "manual",
  weekly_plan_item_id: null,
  image_url: null,
  product_image_url: null,
  headline: "Tênis na promoção!",
  body_text: null,
  cta: "Vem pegar o seu",
  ai_caption: "Não perca essa oferta!",
  ai_text: "Tênis Air Max com desconto especial.",
  ai_cta: "Chama no WhatsApp!",
  ai_hashtags: "#tenis #promo",
  ai_generated_at: "2026-04-20T10:00:00.000Z",
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
  created_at: "2026-04-18T08:00:00.000Z",
};

const validAIResponseFixture = {
  headline: "Tênis na promoção!",
  caption: "Não perca essa oferta incrível.",
  text: "Tênis Air Max com desconto especial apenas hoje.",
  cta: "Chama no WhatsApp e garanta o seu!",
  hashtags: "#tenis #promo #oferta",
  price_label: "R$ 299,90",
};

const validCampaignDomainFixture = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  store_id: "abc12345-0000-0000-0000-000000000001",
  product_name: "Tênis Air Max",
  price: 299.9,
  price_label: "R$ 299,90",
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
  product_image_url: null,
  headline: "Tênis na promoção!",
  body_text: null,
  cta: "Vem pegar o seu",
  ai_caption: "Não perca essa oferta!",
  ai_text: "Tênis Air Max com desconto especial.",
  ai_cta: "Chama no WhatsApp!",
  ai_hashtags: "#tenis #promo",
  ai_generated_at: "2026-04-20T10:00:00.000Z",
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
  created_at: "2026-04-18T08:00:00.000Z",
};

// ─────────────────────────────────────────────────────────────
// DbCampaignSchema
// ─────────────────────────────────────────────────────────────

describe("DbCampaignSchema", () => {
  it("happy path: valida registro real do banco", () => {
    const result = DbCampaignSchema.safeParse(validDbCampaignFixture);
    expect(result.success).toBe(true);
  });

  it("happy path: aceita campos opcionais ausentes", () => {
    const minimal = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      store_id: "abc12345-0000-0000-0000-000000000001",
      product_name: null,
      price: null,
      price_label: null,
      audience: null,
      objective: null,
      product_positioning: null,
      status: null,
      campaign_type: null,
      content_type: null,
      post_status: null,
      reels_status: null,
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
    };
    const result = DbCampaignSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("error case: id ausente", () => {
    const { id: _, ...withoutId } = validDbCampaignFixture;
    const result = DbCampaignSchema.safeParse(withoutId);
    expect(result.success).toBe(false);
  });

  it("error case: campaign_type com valor fora do enum", () => {
    const invalid = { ...validDbCampaignFixture, campaign_type: "story" };
    const result = DbCampaignSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// AICampaignContentSchema
// ─────────────────────────────────────────────────────────────

describe("AICampaignContentSchema", () => {
  it("happy path: valida resposta real de /api/generate/campaign", () => {
    const result = AICampaignContentSchema.safeParse(validAIResponseFixture);
    expect(result.success).toBe(true);
  });

  it("happy path: campos opcionais ausentes são aceitos", () => {
    const result = AICampaignContentSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("error case: campo com tipo errado (headline como número)", () => {
    const invalid = { ...validAIResponseFixture, headline: 42 };
    const result = AICampaignContentSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// CampaignDomainSchema
// ─────────────────────────────────────────────────────────────

describe("CampaignDomainSchema", () => {
  it("happy path: valida Campaign limpo pós-mapper", () => {
    const result = CampaignDomainSchema.safeParse(validCampaignDomainFixture);
    expect(result.success).toBe(true);
  });

  it("happy path: content_type null é aceito", () => {
    const result = CampaignDomainSchema.safeParse({
      ...validCampaignDomainFixture,
      content_type: null,
    });
    expect(result.success).toBe(true);
  });

  it("error case: content_type 'info' não é aceito no domínio canônico", () => {
    const invalid = { ...validCampaignDomainFixture, content_type: "info" };
    const result = CampaignDomainSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("error case: origin com valor fora do enum", () => {
    const invalid = { ...validCampaignDomainFixture, origin: "scheduled" };
    const result = CampaignDomainSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("error case: domain_input ausente (domínio requer objeto, não null)", () => {
    const invalid = { ...validCampaignDomainFixture, domain_input: null };
    const result = CampaignDomainSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
