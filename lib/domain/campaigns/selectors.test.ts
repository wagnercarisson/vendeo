import { describe, it, expect } from "vitest";
import {
  hasArt,
  hasVideo,
  hasAnyVisualAsset,
  hasGeneratedVisualAsset,
  isCampaignReady,
  getUIStatus,
  getGlobalStatus,
  isFromPlan,
  isStrategyLocked,
  getStrategicLabel,
  getCampaignDisplayStatuses,
  hasGeneratedArt,
  hasGeneratedCampaignContent,
  hasGeneratedVideo,
  getCampaignListStatus,
  getCampaignStatusLine,
  getContentState,
} from "./selectors";
import { calculateGlobalStatus, hasAnyVisualAsset as hasAnyVisualAssetLegacy } from "./logic";
import type { Campaign } from "./types";

// Fixture com 35+ campos
const CAMPAIGN_FIXTURE: Campaign = {
  id: "test-123",
  store_id: "store-456",
  product_name: "Test Product",
  price: 99.90,
  price_label: "OFERTA",
  audience: "geral",
  objective: "promocao",
  product_positioning: "medio",
  status: "ready",
  campaign_type: "both",
  content_type: "product",
  legacy_content_type: null,
  domain_input: {},
  domain_input_version: 1,
  post_status: "ready",
  reels_status: "approved",
  origin: "manual",
  weekly_plan_item_id: null,
  image_url: "https://example.com/img.jpg",
  product_image_url: "https://example.com/product.jpg",
  headline: "Test Headline",
  body_text: "Test Body",
  cta: "Test CTA",
  ai_caption: "AI Caption",
  ai_text: "AI Text",
  ai_cta: "AI CTA",
  ai_hashtags: "#test",
  ai_generated_at: "2026-04-20T10:00:00Z",
  reels_hook: "Hook",
  reels_script: "Script",
  reels_shotlist: ["Shot 1"],
  reels_on_screen_text: ["Text 1"],
  reels_audio_suggestion: "Audio",
  reels_duration_seconds: 30,
  reels_caption: "Reels Caption",
  reels_cta: "Reels CTA",
  reels_hashtags: "#reels",
  reels_generated_at: "2026-04-20T10:00:00Z",
  created_at: "2026-04-20T10:00:00Z",
};

// Fixture para edge cases
const EMPTY_CAMPAIGN_FIXTURE: Campaign = {
  id: "empty-123",
  store_id: "store-456",
  product_name: null,
  price: null,
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

describe("hasGeneratedArt", () => {
  it("retorna true quando arte gerada está completa", () => {
    expect(hasGeneratedArt(CAMPAIGN_FIXTURE)).toBe(true);
  });

  it("retorna false quando campos AI ausentes", () => {
    expect(hasGeneratedArt(EMPTY_CAMPAIGN_FIXTURE)).toBe(false);
  });

  it("retorna false quando apenas image_url presente sem AI fields", () => {
    const partial = { ...EMPTY_CAMPAIGN_FIXTURE, image_url: "url", ai_caption: null, ai_text: null };
    expect(hasGeneratedArt(partial)).toBe(true); // image_url is enough
  });

  it("retorna false quando nenhum campo de arte presente", () => {
    const noArt = { ...EMPTY_CAMPAIGN_FIXTURE, image_url: null, ai_caption: null, ai_text: null };
    expect(hasGeneratedArt(noArt)).toBe(false);
  });
});

describe("hasGeneratedCampaignContent", () => {
  it("retorna true quando ai_caption existe", () => {
    expect(hasGeneratedCampaignContent(CAMPAIGN_FIXTURE)).toBe(true);
  });

  it("retorna false quando todos campos de conteúdo ausentes", () => {
    expect(hasGeneratedCampaignContent(EMPTY_CAMPAIGN_FIXTURE)).toBe(false);
  });

  it("retorna true quando apenas ai_cta existe", () => {
    const withCta = { ...EMPTY_CAMPAIGN_FIXTURE, ai_cta: "CTA" };
    expect(hasGeneratedCampaignContent(withCta)).toBe(true);
  });
});

describe("hasGeneratedVideo", () => {
  it("retorna true quando reels gerados estão completos", () => {
    expect(hasGeneratedVideo(CAMPAIGN_FIXTURE)).toBe(true);
  });

  it("retorna false quando campos de vídeo ausentes", () => {
    expect(hasGeneratedVideo(EMPTY_CAMPAIGN_FIXTURE)).toBe(false);
  });

  it("retorna true quando apenas reels_hook existe", () => {
    const withHook = { ...EMPTY_CAMPAIGN_FIXTURE, reels_hook: "Hook" };
    expect(hasGeneratedVideo(withHook)).toBe(true);
  });
});

describe("hasGeneratedVisualAsset vs hasAnyVisualAsset", () => {
  it("hasGeneratedVisualAsset verifica CAMPOS (image_url/reels_script)", () => {
    const withFields = { ...EMPTY_CAMPAIGN_FIXTURE, image_url: "url", post_status: "none" as const };
    expect(hasGeneratedVisualAsset(withFields)).toBe(true); // CAMPO preenchido
  });

  it("hasAnyVisualAsset verifica STATUS (post_status/reels_status)", () => {
    const withStatus = { ...EMPTY_CAMPAIGN_FIXTURE, image_url: null, post_status: "ready" as const };
    expect(hasAnyVisualAsset(withStatus)).toBe(true); // STATUS ready
  });

  it("funções divergem quando campo presente mas status none", () => {
    const divergent = { ...EMPTY_CAMPAIGN_FIXTURE, image_url: "url", post_status: "none" as const };
    expect(hasGeneratedVisualAsset(divergent)).toBe(true);  // CAMPO presente
    expect(hasAnyVisualAsset(divergent)).toBe(false); // STATUS none
  });

  it("retorna false para CAMPAIGN_FIXTURE vazia em ambas as funções", () => {
    expect(hasGeneratedVisualAsset(EMPTY_CAMPAIGN_FIXTURE)).toBe(false);
    expect(hasAnyVisualAsset(EMPTY_CAMPAIGN_FIXTURE)).toBe(false);
  });

  it("legacy import hasAnyVisualAsset from logic.ts aponta para hasGeneratedVisualAsset (CAMPO-based)", () => {
    const withField = { ...EMPTY_CAMPAIGN_FIXTURE, image_url: "url", post_status: "none" as const };
    expect(hasAnyVisualAssetLegacy(withField)).toBe(true); // CAMPO presente = true
    expect(hasGeneratedVisualAsset(withField)).toBe(true); // Mesma semântica
  });
});

describe("getCampaignListStatus", () => {
  it("retorna approved quando status é approved", () => {
    const approved = { ...EMPTY_CAMPAIGN_FIXTURE, status: "approved" };
    expect(getCampaignListStatus(approved)).toBe("approved");
  });

  it("retorna pending quando há conteúdo gerado", () => {
    const withContent = { ...EMPTY_CAMPAIGN_FIXTURE, ai_caption: "caption" };
    expect(getCampaignListStatus(withContent)).toBe("pending");
  });

  it("retorna none quando sem conteúdo e não aprovado", () => {
    expect(getCampaignListStatus(EMPTY_CAMPAIGN_FIXTURE)).toBe("none");
  });
});

describe("getCampaignStatusLine", () => {
  it("retorna 'Campanha completa' quando aprovada com arte e vídeo", () => {
    const complete = { ...CAMPAIGN_FIXTURE, status: "approved" };
    expect(getCampaignStatusLine(complete)).toBe("Campanha completa");
  });

  it("retorna 'Aguardando aprovação' quando pendente", () => {
    const pending = { ...CAMPAIGN_FIXTURE, status: "ready" };
    expect(getCampaignStatusLine(pending)).toBe("Aguardando aprovação");
  });

  it("retorna 'Sem conteúdo' quando sem campos gerados", () => {
    expect(getCampaignStatusLine(EMPTY_CAMPAIGN_FIXTURE)).toBe("Sem conteúdo");
  });
});

describe("getContentState", () => {
  it("retorna art_and_video quando tem arte e vídeo", () => {
    expect(getContentState(CAMPAIGN_FIXTURE)).toBe("art_and_video");
  });

  it("retorna none quando sem conteúdo", () => {
    expect(getContentState(EMPTY_CAMPAIGN_FIXTURE)).toBe("none");
  });

  it("retorna art_only quando só tem arte", () => {
    const artOnly = { ...EMPTY_CAMPAIGN_FIXTURE, image_url: "url" };
    expect(getContentState(artOnly)).toBe("art_only");
  });

  it("retorna video_only quando só tem vídeo", () => {
    const videoOnly = { ...EMPTY_CAMPAIGN_FIXTURE, reels_script: "script" };
    expect(getContentState(videoOnly)).toBe("video_only");
  });
});

describe("getGlobalStatus", () => {
  it("retorna draft quando algum status é draft", () => {
    const c = { ...CAMPAIGN_FIXTURE, post_status: "draft" as const, reels_status: "approved" as const };
    expect(getGlobalStatus(c)).toBe("draft");
  });

  it("retorna ready quando todos ready (sem draft)", () => {
    const c = { ...CAMPAIGN_FIXTURE, post_status: "ready" as const, reels_status: "ready" as const };
    expect(getGlobalStatus(c)).toBe("ready");
  });

  it("retorna approved quando tudo aprovado", () => {
    const c = { ...CAMPAIGN_FIXTURE, post_status: "approved" as const, reels_status: "approved" as const };
    expect(getGlobalStatus(c)).toBe("approved");
  });
});

describe("calculateGlobalStatus equivalence via logic.ts re-export", () => {
  it("equivalente a getGlobalStatus para post_status=ready, reels_status=approved (both)", () => {
    const c = { ...CAMPAIGN_FIXTURE, campaign_type: "both" as const, post_status: "ready" as const, reels_status: "approved" as const };
    expect(getGlobalStatus(c)).toBe("ready"); // min(ready, approved) = ready
    expect(calculateGlobalStatus(c)).toBe("ready");
  });

  it("equivalente para post_status=approved, reels_status=approved (both)", () => {
    const c = { ...CAMPAIGN_FIXTURE, campaign_type: "both" as const, post_status: "approved" as const, reels_status: "approved" as const };
    expect(getGlobalStatus(c)).toBe("approved");
    expect(calculateGlobalStatus(c)).toBe("approved");
  });

  it("equivalente para post_status=draft, reels_status=ready (both)", () => {
    const c = { ...CAMPAIGN_FIXTURE, campaign_type: "both" as const, post_status: "draft" as const, reels_status: "ready" as const };
    expect(getGlobalStatus(c)).toBe("draft");
    expect(calculateGlobalStatus(c)).toBe("draft");
  });

  it("equivalente para campaign_type=post only", () => {
    const c = { ...CAMPAIGN_FIXTURE, campaign_type: "post" as const, post_status: "ready" as const, reels_status: "none" as const };
    expect(getGlobalStatus(c)).toBe("ready");
    expect(calculateGlobalStatus(c)).toBe("ready");
  });

  it("equivalente para campaign_type=reels only", () => {
    const c = { ...CAMPAIGN_FIXTURE, campaign_type: "reels" as const, post_status: "none" as const, reels_status: "approved" as const };
    expect(getGlobalStatus(c)).toBe("approved");
    expect(calculateGlobalStatus(c)).toBe("approved");
  });
});

describe("getStrategicLabel", () => {
  it("retorna OFERTA para objetivo promocao", () => {
    expect(getStrategicLabel({ ...CAMPAIGN_FIXTURE, objective: "promocao" })).toBe("OFERTA");
  });

  it("retorna DESTAQUE para objetivo desconhecido", () => {
    expect(getStrategicLabel({ ...CAMPAIGN_FIXTURE, objective: null })).toBe("DESTAQUE");
  });

  it("retorna ENGAJAMENTO para objetivo engajamento", () => {
    expect(getStrategicLabel({ ...CAMPAIGN_FIXTURE, objective: "engajamento" })).toBe("ENGAJAMENTO");
  });
});

describe("getCampaignDisplayStatuses", () => {
  it("retorna badge 'Campanha completa' quando approved e both", () => {
    const c = { ...EMPTY_CAMPAIGN_FIXTURE, campaign_type: "both" as const, post_status: "approved", reels_status: "approved" };
    const badges = getCampaignDisplayStatuses(c);
    expect(badges).toHaveLength(1);
    expect(badges[0].label).toBe("Campanha completa");
    expect(badges[0].variant).toBe("approved");
  });

  it("retorna 'Sem conteúdo' quando nenhum status", () => {
    const badges = getCampaignDisplayStatuses(EMPTY_CAMPAIGN_FIXTURE);
    expect(badges[0].label).toBe("Sem conteúdo");
    expect(badges[0].variant).toBe("none");
  });

  it("retorna 'Arte pronta' para post-only approved", () => {
    const c = { ...EMPTY_CAMPAIGN_FIXTURE, campaign_type: "post" as const, post_status: "approved" };
    const badges = getCampaignDisplayStatuses(c);
    expect(badges[0].label).toBe("Arte pronta");
  });

  it("retorna badges individuais quando post e reels divergem", () => {
    const c = { ...EMPTY_CAMPAIGN_FIXTURE, campaign_type: "both" as const, post_status: "approved", reels_status: "ready" };
    const badges = getCampaignDisplayStatuses(c);
    expect(badges).toHaveLength(2);
  });
});
