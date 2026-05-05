import assert from "node:assert/strict";
import test from "node:test";

import { resolveCampaignPrompt } from "./prompt-resolution.ts";
import type { CampaignContext } from "./types.ts";
import type { StoreContext } from "../stores/types.ts";

function createCampaign(overrides: Partial<CampaignContext> = {}): CampaignContext {
  return {
    id: "campaign-1",
    store_id: "store-1",
    product_name: "Cerveja Artesanal",
    price: "29.90",
    price_label: null,
    audience: "geral",
    objective: "promocao",
    product_positioning: "premium",
    theme: null,
    ...overrides,
  };
}

function createStore(overrides: Partial<StoreContext> = {}): StoreContext {
  return {
    id: "store-1",
    name: "Adega da Vila",
    city: "São Paulo",
    state: "SP",
    main_segment: "bebidas_alcoolicas",
    brand_positioning: "premium",
    tone_of_voice: "informal",
    whatsapp: "5511999999999",
    phone: "1133334444",
    instagram: null,
    address: null,
    neighborhood: "Moema",
    primary_color: null,
    secondary_color: null,
    logo_url: null,
    ...overrides,
  };
}

test("resolveCampaignPrompt uses layered prompt and appends campaign context", async () => {
  const promptCalls: unknown[] = [];

  const result = await resolveCampaignPrompt(
    {
      campaign: createCampaign(),
      store: createStore(),
      storeId: "store-1",
      description: "Campanha para giro rapido",
    },
    {
      buildLayeredPrompt: async (...args) => {
        promptCalls.push(args);
        return "<prompt>LAYERED</prompt>";
      },
      buildLegacyPrompt: () => "LEGACY",
      featureFlags: { USE_CONTEXT_LAYERING_PROMPT: true },
    }
  );

  assert.equal(result.source, "layered");
  assert.match(result.prompt, /<prompt>LAYERED<\/prompt>/);
  assert.match(result.prompt, /CONTEXTO ESPECIFICO DA CAMPANHA:/);
  assert.match(result.prompt, /PRODUTO: Cerveja Artesanal/);
  assert.deepEqual(promptCalls[0], ["store-1", "promocao", { intelligenceThreshold: 30 }]);
});

test("resolveCampaignPrompt uses strategic theme when campaign comes from weekly plan", async () => {
  const result = await resolveCampaignPrompt(
    {
      campaign: createCampaign({ objective: "novidade" }),
      store: createStore(),
      storeId: "store-1",
      strategicTheme: "Dia das Maes",
    },
    {
      buildLayeredPrompt: async (_storeId, campaignType) => campaignType,
      buildLegacyPrompt: () => "LEGACY",
      featureFlags: { USE_CONTEXT_LAYERING_PROMPT: true },
    }
  );

  assert.match(result.prompt, /^dia das maes/);
});

test("resolveCampaignPrompt falls back to legacy when feature flag is disabled", async () => {
  const result = await resolveCampaignPrompt(
    {
      campaign: createCampaign(),
      store: createStore(),
      storeId: "store-1",
    },
    {
      buildLayeredPrompt: async () => {
        throw new Error("should not be called");
      },
      buildLegacyPrompt: () => "LEGACY",
      featureFlags: { USE_CONTEXT_LAYERING_PROMPT: false },
    }
  );

  assert.equal(result.source, "legacy");
  assert.equal(result.prompt, "LEGACY");
});

test("resolveCampaignPrompt falls back to legacy when layered prompt throws", async () => {
  let capturedError: unknown = null;

  const result = await resolveCampaignPrompt(
    {
      campaign: createCampaign(),
      store: createStore(),
      storeId: "store-1",
    },
    {
      buildLayeredPrompt: async () => {
        throw new Error("unsupported region");
      },
      buildLegacyPrompt: () => "LEGACY",
      featureFlags: { USE_CONTEXT_LAYERING_PROMPT: true },
      onFallbackError: (error) => {
        capturedError = error;
      },
    }
  );

  assert.equal(result.source, "legacy-fallback");
  assert.equal(result.prompt, "LEGACY");
  assert.match(String(capturedError), /unsupported region/);
});