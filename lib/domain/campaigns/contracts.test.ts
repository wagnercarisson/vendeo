import { describe, it, expect } from "vitest";
import {
  GenerateCampaignRequestSchema,
  GenerateCampaignResponseSchema,
  StrategyRequestSchema,
  StrategyResponseSchema,
} from "./contracts";

describe("GenerateCampaignRequestSchema", () => {
  it("valida request valido (re-export de CampaignRequestSchema)", () => {
    const valid = {
      campaign_id: "123e4567-e89b-12d3-a456-426614174000",
      force: false,
      persist: true,
    };
    const result = GenerateCampaignRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.campaign_id).toBe(valid.campaign_id);
    }
  });
});

describe("GenerateCampaignResponseSchema", () => {
  it("valida response de sucesso com reused=false", () => {
    const valid = {
      ok: true,
      requestId: "req-123",
      reused: false,
      campaign_id: "camp-456",
      output: { headline: "Test", caption: "Test caption" },
    };
    const result = GenerateCampaignResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("valida response de sucesso com reused=true (sem campaign_id)", () => {
    const valid = {
      ok: true,
      requestId: "req-789",
      reused: true,
    };
    const result = GenerateCampaignResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("valida response de erro", () => {
    const valid = {
      ok: false,
      requestId: "req-error",
      error: "CAMPAIGN_NOT_FOUND",
      details: { campaignId: "123" },
    };
    const result = GenerateCampaignResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejeita response sem requestId (campo obrigatorio)", () => {
    const invalid = {
      ok: true,
      reused: false,
    };
    const result = GenerateCampaignResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("StrategyRequestSchema", () => {
  it("valida request valido com todos os campos", () => {
    const valid = {
      product: {
        type: "product" as const,
        productName: "Tenis Nike Air",
        description: "Tenis esportivo",
        price: "299.90",
      },
    };
    const result = StrategyRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("valida request com campos opcionais ausentes", () => {
    const valid = {
      product: {
        type: "service" as const,
        productName: "Consultoria de vendas",
      },
    };
    const result = StrategyRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejeita type=info (nao e valor canonico)", () => {
    const invalid = {
      product: {
        type: "info",
        productName: "Test",
      },
    };
    const result = StrategyRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Invalid enum value");
    }
  });

  it("rejeita productName vazio (min length)", () => {
    const invalid = {
      product: {
        type: "message" as const,
        productName: "",
      },
    };
    const result = StrategyRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("StrategyResponseSchema", () => {
  it("valida response de sucesso com suggestion completa", () => {
    const valid = {
      ok: true,
      requestId: "req-strat-123",
      suggestion: {
        audience: "Atletas amadores 25-40 anos",
        objective: "Destacar beneficios tecnicos",
        productPositioning: "Tenis premium com tecnologia avancada",
        reasoning: "Este publico valoriza performance...",
      },
    };
    const result = StrategyResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("valida response de erro", () => {
    const valid = {
      ok: false,
      error: "INVALID_PRODUCT_TYPE",
    };
    const result = StrategyResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejeita response de sucesso sem suggestion (campo obrigatorio)", () => {
    const invalid = {
      ok: true,
      requestId: "req-123",
    };
    const result = StrategyResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejeita response de sucesso com suggestion.audience ausente", () => {
    const invalid = {
      ok: true,
      requestId: "req-123",
      suggestion: {
        objective: "Test",
        productPositioning: "Test",
        reasoning: "Test",
      },
    };
    const result = StrategyResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
