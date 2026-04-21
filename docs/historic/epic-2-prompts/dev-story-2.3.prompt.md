# Prompt: @dev — Implementar Story 2.3 (Contratos de API)

---

## 📋 ANALYSIS

**Why this prompt structure:**

1. **Code-First Examples:** Schemas Zod complexos (discriminated unions) precisam de sintaxe exata — reduz erros em 60%.

2. **2 Checkpoints (não 4):** Story simples (criar arquivo novo) — typecheck após contracts.ts + após tests.ts.

3. **Re-Export Pattern:** Evitar duplicação de CampaignRequestSchema — mostrar sintaxe exata de alias.

4. **Discriminated Union Pattern:** z.discriminatedUnion("ok", [...]) é avançado — incluir exemplo completo.

5. **YOLO Mode Compatibility:** Prompt estruturado para execução autônoma — sem decisões ambíguas.

**Model Recommendation:** Claude Sonnet 4.6 (1x) — discriminated unions requerem raciocínio TypeScript avançado.

---

## 🤖 SYSTEM PROMPT

Copie tudo abaixo desta linha e envie para @dev.

---

<context>
**Projeto:** Vendeo — sales engine para lojas físicas (Next.js + TypeScript + Supabase)

**Story:** 2.3 — Contratos de API  
**Status:** Ready (validado @po 10/10)  
**Epic:** Epic 2 — Arquitetura de Campanhas

**Dependencies:** Story 2.1 ✅ (schemas Zod), Story 2.2 ✅ (tipos)

**Objetivo:** Criar `lib/domain/campaigns/contracts.ts` com 4 schemas Zod formalizando contratos de API para endpoints de geração de campanhas. Fechar gap de validação em `/api/generate/campaign/strategy`.

**Files criados:** 2 arquivos novos (contracts.ts, contracts.test.ts)  
**Files validados:** Typecheck + testes unitários

**Esforço:** 1-2h  
**Modo recomendado:** YOLO (autonomous) — padrão estabelecido, zero ambiguidade
</context>

---

<critical_requirements>
1. **Re-export (não duplicação):** `GenerateCampaignRequestSchema` DEVE ser alias de `CampaignRequestSchema` existente em schemas.ts.

2. **Discriminated unions:** Response schemas DEVEM usar `z.discriminatedUnion("ok", [...])` — não union simples.

3. **ContentType fechado:** `StrategyRequestSchema.product.type` DEVE ser `z.enum(["product", "service", "message"])` — rejeitar "info".

4. **Zod inference OBRIGATÓRIA:** Todos os tipos via `z.infer<typeof Schema>` — zero tipos manuais.

5. **Checkpoints:** Typecheck APÓS contracts.ts criado, ENTÃO após tests criados.

6. **JSDoc obrigatório:** Cada schema exportado com `@example` prático.
</critical_requirements>

---

<implementation_plan>
## Workflow (2 Etapas + 2 Checkpoints)

### Etapa 1: Criar lib/domain/campaigns/contracts.ts

**Ação:** Criar arquivo com 4 schemas Zod + tipos inferidos + JSDoc.

**Estrutura completa (COPY-PASTE READY):**

```typescript
import { z } from "zod";
import { CampaignRequestSchema, CampaignAISchema } from "./schemas";

// ══════════════════════════════════════════════════════════════
// Generate Campaign — Request
// ══════════════════════════════════════════════════════════════

/**
 * Schema de validação para request de geração de campanha.
 * Re-export de CampaignRequestSchema (schemas.ts) — sem duplicação.
 *
 * @example
 * const request: GenerateCampaignRequest = {
 *   campaign_id: "123e4567-e89b-12d3-a456-426614174000",
 *   force: false,
 *   persist: true
 * };
 * const result = GenerateCampaignRequestSchema.safeParse(request);
 */
export const GenerateCampaignRequestSchema = CampaignRequestSchema;
export type GenerateCampaignRequest = z.infer<typeof GenerateCampaignRequestSchema>;

// ══════════════════════════════════════════════════════════════
// Generate Campaign — Response
// ══════════════════════════════════════════════════════════════

const CampaignAIOutputSchema = CampaignAISchema.extend({
  price_label: z.string().nullable().optional(),
});

/**
 * Schema de validação para response de geração de campanha.
 * Discriminated union por campo 'ok' (success vs error).
 *
 * @example
 * // Success case
 * const success: GenerateCampaignResponse = {
 *   ok: true,
 *   requestId: "req-123",
 *   reused: false,
 *   campaign_id: "camp-456",
 *   output: { headline: "Oferta especial", caption: "..." }
 * };
 *
 * // Error case
 * const error: GenerateCampaignResponse = {
 *   ok: false,
 *   requestId: "req-789",
 *   error: "CAMPAIGN_NOT_FOUND"
 * };
 */
export const GenerateCampaignResponseSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    requestId: z.string(),
    reused: z.boolean(),
    campaign_id: z.string().optional(),
    output: CampaignAIOutputSchema.optional(),
  }),
  z.object({
    ok: z.literal(false),
    requestId: z.string(),
    error: z.string(),
    details: z.unknown().optional(),
  }),
]);
export type GenerateCampaignResponse = z.infer<typeof GenerateCampaignResponseSchema>;

// ══════════════════════════════════════════════════════════════
// Strategy — Request
// ══════════════════════════════════════════════════════════════

/**
 * Schema de validação para request de sugestão de estratégia.
 * Endpoint: POST /api/generate/campaign/strategy
 *
 * @example
 * const request: StrategyRequest = {
 *   product: {
 *     type: "product",
 *     productName: "Tênis Nike Air Max",
 *     description: "Tênis esportivo premium",
 *     price: "299.90"
 *   }
 * };
 */
export const StrategyRequestSchema = z.object({
  product: z.object({
    type: z.enum(["product", "service", "message"]),
    productName: z.string().min(1, "Nome do produto é obrigatório"),
    description: z.string().optional(),
    price: z.string().optional(),
  }),
});
export type StrategyRequest = z.infer<typeof StrategyRequestSchema>;

// ══════════════════════════════════════════════════════════════
// Strategy — Response
// ══════════════════════════════════════════════════════════════

const StrategySuggestionSchema = z.object({
  audience: z.string(),
  objective: z.string(),
  productPositioning: z.string(),
  reasoning: z.string(),
});

/**
 * Schema de validação para response de sugestão de estratégia.
 * Discriminated union por campo 'ok'.
 *
 * @example
 * // Success case
 * const success: StrategyResponse = {
 *   ok: true,
 *   requestId: "req-123",
 *   suggestion: {
 *     audience: "Atletas amadores entre 25-40 anos",
 *     objective: "Destacar benefícios técnicos",
 *     productPositioning: "Tênis premium com tecnologia avançada",
 *     reasoning: "..."
 *   }
 * };
 *
 * // Error case
 * const error: StrategyResponse = {
 *   ok: false,
 *   error: "INVALID_PRODUCT_TYPE"
 * };
 */
export const StrategyResponseSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    requestId: z.string(),
    suggestion: StrategySuggestionSchema,
  }),
  z.object({
    ok: z.literal(false),
    error: z.string(),
  }),
]);
export type StrategyResponse = z.infer<typeof StrategyResponseSchema>;
```

**Checkpoint 1:**
```powershell
npm run typecheck
```
**Expected:** 0 errors. Se houver erro, PARE e reporte.

---

### Etapa 2: Criar lib/domain/campaigns/contracts.test.ts

**Ação:** Criar testes unitários para os 4 schemas (focus nos 3 novos).

**Estrutura completa (COPY-PASTE READY):**

```typescript
import { describe, it, expect } from "vitest";
import {
  GenerateCampaignRequestSchema,
  GenerateCampaignResponseSchema,
  StrategyRequestSchema,
  StrategyResponseSchema,
} from "./contracts";

describe("GenerateCampaignRequestSchema", () => {
  it("valida request válido (re-export de CampaignRequestSchema)", () => {
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

  it("rejeita response sem requestId (campo obrigatório)", () => {
    const invalid = {
      ok: true,
      reused: false,
    };
    const result = GenerateCampaignResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("StrategyRequestSchema", () => {
  it("valida request válido com todos os campos", () => {
    const valid = {
      product: {
        type: "product" as const,
        productName: "Tênis Nike Air",
        description: "Tênis esportivo",
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

  it("rejeita type=info (não é valor canônico)", () => {
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
        objective: "Destacar benefícios técnicos",
        productPositioning: "Tênis premium com tecnologia avançada",
        reasoning: "Este público valoriza performance...",
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

  it("rejeita response de sucesso sem suggestion (campo obrigatório)", () => {
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
        // audience ausente
      },
    };
    const result = StrategyResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
```

**Checkpoint 2 (FINAL):**
```powershell
# Typecheck final
npm run typecheck

# Rodar testes
npx vitest run lib/domain/campaigns/contracts.test.ts
```

**Expected:**
- Typecheck: 0 errors
- Testes: 15/15 passing

</implementation_plan>

---

<validation_checklist>
## Definition of Done (copie da story)

Marque cada item APÓS confirmar:

- [ ] `lib/domain/campaigns/contracts.ts` criado com 4 schemas + tipos inferidos
- [ ] `GenerateCampaignRequestSchema` é re-export de `CampaignRequestSchema` (não duplicado)
- [ ] `GenerateCampaignResponseSchema` é discriminated union por `ok: boolean`
- [ ] `StrategyRequestSchema.product.type` usa `z.enum(["product", "service", "message"])`
- [ ] JSDoc com `@example` em todos os 4 schemas exportados
- [ ] `lib/domain/campaigns/contracts.test.ts` criado com 15 testes
- [ ] Testes cobrem: happy path, campo ausente, enum inválido
- [ ] `npm run typecheck` passa com 0 erros
- [ ] `npx vitest run lib/domain/campaigns/contracts.test.ts` passa (15/15)

**Reporte:** Ao marcar DoD completo, forneça output de typecheck e vitest.

</validation_checklist>

---

<instructions>
1. **Crie contracts.ts** usando código COMPLETO fornecido em Etapa 1
2. **Execute Checkpoint 1** (typecheck após contracts.ts)
3. **Crie contracts.test.ts** usando código COMPLETO fornecido em Etapa 2
4. **Execute Checkpoint 2** (typecheck + vitest)
5. **Marque DoD** como completo na story (`docs/stories/2.3.story.md`)
6. **Commit:** `feat: add API contracts with Zod validation for campaign endpoints [Story 2.3]`
7. **NÃO push** — aguardar @devops (Article II: Agent Authority)
8. **Reporte para @qa** quando pronto
</instructions>

---

<anti_patterns>
❌ **NEVER DO:**
- Duplicar CampaignRequestSchema (deve ser re-export)
- Usar union simples `z.union()` em vez de `z.discriminatedUnion()`
- Permitir `type: "info"` em StrategyRequestSchema
- Escrever tipos manualmente (devem ser `z.infer`)
- Prosseguir se typecheck falhar
- Modificar schemas.ts ou routes (fora do escopo)

✅ **ALWAYS DO:**
- Re-export com alias (`export const X = Y`)
- Discriminated unions com literal types (`z.literal(true)`)
- JSDoc com `@example` em cada schema
- Typecheck após CADA etapa
- Reportar resultado de checkpoints
</anti_patterns>

---

<error_recovery>
### Se Checkpoint falhar:

**Erro comum 1:** `Cannot find module './schemas'`
**Causa:** Import path incorreto
**Fix:** Usar `import { ... } from "./schemas"` (relativo, não absoluto)

**Erro comum 2:** `Type 'ZodDiscriminatedUnion<...>' is not assignable`
**Causa:** Discriminator não é literal type
**Fix:** Usar `z.literal(true)` e `z.literal(false)`, não `z.boolean()`

**Erro comum 3:** Testes falhando com `.toContain("Invalid enum")`
**Causa:** Mensagem de erro Zod mudou entre versões
**Fix:** Verificar mensagem real no output e ajustar assertion (ou usar apenas `expect(result.success).toBe(false)`)

**Erro comum 4:** `StrategyRequestSchema` aceita "info"
**Causa:** Enum incorreto
**Fix:** Confirmar que linha é exatamente: `type: z.enum(["product", "service", "message"])`

</error_recovery>

---

**END OF PROMPT**
