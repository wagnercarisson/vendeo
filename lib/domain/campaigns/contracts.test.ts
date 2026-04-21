import { describe, it, expect } from "vitest";
import {
  GenerateCampaignRequestSchema,
  GenerateCampaignResponseSchema,
  StrategyRequestSchema,
  StrategyResponseSchema,
  StrategyAIOutputSchema,
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
        audience: "geral",
        objective: "promocao",
        productPositioning: "popular",
        reasoning: "Esta combinação funciona porque atinge o público mais amplo com oferta direta.",
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
        objective: "promocao",
        productPositioning: "popular",
        reasoning: "Reasoning com tamanho suficiente para passar na validação do schema.",
      },
    };
    const result = StrategyResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// StrategyAIOutputSchema — enum validation (z.enum direct, NO preprocess)
// ---------------------------------------------------------------------------

describe("StrategyAIOutputSchema", () => {
  it("aceita output válido com todos os enums corretos", () => {
    const result = StrategyAIOutputSchema.safeParse({
      audience: "fitness",
      objective: "novidade",
      productPositioning: "premium",
      reasoning: "Esta combinação funciona porque o público fitness valoriza lançamentos.",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita 'reconhecimento' como objetivo (não está em OBJECTIVE_VALUES — sem normalização)", () => {
    const result = StrategyAIOutputSchema.safeParse({
      audience: "geral",
      objective: "reconhecimento",
      productPositioning: "popular",
      reasoning: "Texto de reasoning com mais de dez caracteres.",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("objective"))).toBe(true);
    }
  });

  it("rejeita audience fora do enum", () => {
    const result = StrategyAIOutputSchema.safeParse({
      audience: "jovens_adultos_nao_existe",
      objective: "promocao",
      productPositioning: "popular",
      reasoning: "Texto de reasoning com comprimento suficiente.",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("audience"))).toBe(true);
    }
  });

  it("rejeita productPositioning fora do enum", () => {
    const result = StrategyAIOutputSchema.safeParse({
      audience: "mulheres",
      objective: "engajamento",
      productPositioning: "luxo_exclusivo",
      reasoning: "Texto de reasoning com comprimento suficiente.",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita reasoning com menos de 10 caracteres", () => {
    const result = StrategyAIOutputSchema.safeParse({
      audience: "geral",
      objective: "sazonal",
      productPositioning: "medio",
      reasoning: "curto",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("reasoning"))).toBe(true);
    }
  });

  it("aceita todos os 11 valores de OBJECTIVE_VALUES sem normalização", () => {
    const objectives = [
      "promocao", "novidade", "queima", "sazonal", "reposicao",
      "combo", "engajamento", "visitas", "informativo", "institucional", "autoridade",
    ];
    for (const objective of objectives) {
      const result = StrategyAIOutputSchema.safeParse({
        audience: "geral",
        objective,
        productPositioning: "medio",
        reasoning: "Texto válido de reasoning com pelo menos dez caracteres.",
      });
      expect(result.success, `objective '${objective}' should be valid`).toBe(true);
    }
  });

  it("rejeita output sem campos obrigatórios", () => {
    const result = StrategyAIOutputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
