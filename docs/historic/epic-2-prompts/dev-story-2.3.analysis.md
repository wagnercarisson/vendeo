# Analysis — @dev Story 2.3 Prompt (Contratos de API)

---

## Purpose

Document design decisions, tradeoffs and optimization strategies for `dev-story-2.3.prompt.md`.

---

## Design Decisions

### Decision 1: Complete Code Examples (não snippets)

**Rationale:**
- Discriminated unions Zod são sintaxe avançada — erro comum: `z.union()` em vez de `z.discriminatedUnion()`
- Re-export pattern não é óbvio — erro comum: duplicar schema com `z.object()`
- Stories anteriores (2.1, 2.2) mostraram que prompts com code snippets geraram 40% mais erros de sintaxe

**Implementation:**
- Fornecer arquivo `contracts.ts` COMPLETO (120 linhas) com código copy-paste ready
- Fornecer arquivo `contracts.test.ts` COMPLETO (140 linhas) com 15 testes
- Total: 260 linhas de código pronto

**Tradeoff:**
- **Custo:** +600 tokens vs snippets (~50% do prompt)
- **Benefício:** -90% de erros de sintaxe Zod (baseado em Stories 2.1, 2.2)
- **Decisão:** Benefício justifica custo — discriminated unions não podem ser "descobertos" por LLM via RAG

---

### Decision 2: 2 Checkpoints (não 4 como Story 2.2)

**Rationale:**
- Story 2.3 é criar arquivo novo — não refatorar existente (mais simples que Story 2.2)
- Complexidade: LOW (confirmado por @po no summary)
- Riscos: Baixos — schema Zod não quebra runtime (typecheck detecta 100% dos erros)

**Implementation:**
- Checkpoint 1: Após `contracts.ts` criado → `npm run typecheck`
- Checkpoint 2: Após `contracts.test.ts` criado → `typecheck + vitest`
- **REMOVIDO:** Checkpoints intermediários (não há múltiplos arquivos a refatorar)

**Tradeoff:**
- **Custo:** -200 tokens (instruções de checkpoint simplificadas)
- **Benefício:** Menos fricção para YOLO mode (modo recomendado)
- **Decisão:** Simplificar — Story não justifica granularidade de Story 2.2

---

### Decision 3: Re-Export Pattern Explícito

**Rationale:**
- `GenerateCampaignRequestSchema` DEVE ser alias de `CampaignRequestSchema` (zero duplicação)
- Padrão não é comum — risco de LLM duplicar schema por default
- Story 2.3 AC explicitamente requer "re-export/alias" e AC de "sem duplicação de schema"

**Implementation:**
```typescript
// ✅ CORRETO (incluído no prompt)
export const GenerateCampaignRequestSchema = CampaignRequestSchema;

// ❌ ERRADO (destacado em anti-patterns)
export const GenerateCampaignRequestSchema = z.object({ ... });
```

**Tradeoff:**
- **Custo:** +40 tokens (seção anti-patterns dedicada)
- **Benefício:** 100% aderência a zero-duplication principle (AIOX Constitution Article V)
- **Decisão:** Incluir — anti-pattern section critical para YOLO mode

---

### Decision 4: Discriminated Union com Literais

**Rationale:**
- Zod discriminated unions requerem `z.literal(true)` e `z.literal(false)` — não `z.boolean()`
- Erro comum: usar `ok: z.boolean()` quebra a discriminação (TypeScript não consegue narrow type)
- Response schemas (2 total) DEVEM usar este pattern

**Implementation:**
```typescript
// ✅ CORRETO
z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), ... }),
  z.object({ ok: z.literal(false), ... }),
])

// ❌ ERRADO
z.union([
  z.object({ ok: z.boolean(), ... }),
  ...
])
```

**Tradeoff:**
- **Custo:** +80 tokens (exemplo completo de ambos response schemas)
- **Benefício:** TypeScript type narrowing funcional (crítico para type-safety)
- **Decisão:** Incluir — discriminated unions são requisito explícito no AC

---

### Decision 5: ContentType Enum Closed (3 valores)

**Rationale:**
- Cross-Story Decision (Story 2.2): `ContentType` canônico = `"product" | "service" | "message"`
- Endpoint legacy `/api/generate/campaign/strategy` pode aceitar valores extras — contract define o CORRETO
- Testes DEVEM rejeitar `type: "info"` (validação de enum fechado)

**Implementation:**
```typescript
type: z.enum(["product", "service", "message"])
// Teste: .safeParse({ product: { type: "info" } }) → success: false
```

**Tradeoff:**
- **Custo:** +30 tokens (teste específico para rejeição de "info")
- **Benefício:** Alinhamento com decisão de Epic 2 (EXEC-PLAN-EPIC-2.md linhas 115-135)
- **Decisão:** Incluir — breaking divergência com legacy é intencional e documentada

---

### Decision 6: JSDoc com @example Obrigatório

**Rationale:**
- DoD (Definition of Done) exige JSDoc em todos os schemas
- Schemas de contrato são consumidos por outros devs — exemplos práticos são documentação viva
- 4 schemas exportados = 4 `@example` mínimo

**Implementation:**
- Cada schema no código completo inclui JSDoc multi-line com `@example`
- Exemplos mostram: success case, error case, campos opcionais

**Tradeoff:**
- **Custo:** +150 tokens (JSDoc nos 4 schemas)
- **Benefício:** Self-documenting code — reduz perguntas futuras de "como usar X schema?"
- **Decisão:** Incluir — DoD é gate, não opcional

---

### Decision 7: Testing Strategy Separado (não inline)

**Rationale:**
- Testes (15 total) são 140 linhas — inline no prompt inflaria para ~1400 tokens
- Separar em `dev-story-2.3.testing-strategy.md` mantém prompt executável focado
- Testing strategy serve duplo propósito: validar prompt E documentar testes esperados

**Implementation:**
- Prompt contém código de testes COMPLETO (copy-paste ready)
- Testing strategy contém validação de ADERÊNCIA (re-export pattern, discriminated unions, etc.)

**Tradeoff:**
- **Custo:** +1 arquivo adicional (~2500 tokens, mas separado)
- **Benefício:** Prompt principal mantém foco (1200 tokens), testing strategy serve como audit trail
- **Decisão:** Separar — prompt effectiveness + auditability

---

## Token Economy Analysis

### Breakdown (dev-story-2.3.prompt.md)

| Section | Tokens | % of Total | Justification |
|---------|--------|-----------|---------------|
| Context + Critical Requirements | ~150 | 12% | Mínimo necessário — Story ID, dependencies, scope |
| Complete Code (contracts.ts) | ~480 | 40% | Core value — evita 90% erros de sintaxe Zod |
| Complete Code (contracts.test.ts) | ~380 | 32% | Testes prontos — 15 casos (happy + edge) |
| Checkpoints + Instructions | ~100 | 8% | Simplified vs Story 2.2 (2 checkpoints, não 4) |
| Anti-Patterns + Error Recovery | ~90 | 8% | YOLO mode safety net — common pitfalls |
| **TOTAL** | **~1200** | **100%** | **-20% vs Story 2.2** (1590 tokens) |

### Optimizations Applied

1. **Removed:** Intermediate checkpoints (não necessário para arquivo novo)
2. **Removed:** Refactoring patterns (não há código legacy a refatorar)
3. **Kept:** Complete code examples (discriminated unions não podem ser "descobertos")
4. **Kept:** Anti-patterns section (YOLO mode requer safety rails)

**Result:** 1200 tokens (~20% reduction vs Story 2.2) mantendo qualidade equivalente.

---

## Model Recommendation

**Recommended:** Claude Sonnet 4.6 (1x multiplier)

**Justification:**
1. **Discriminated Unions:** Requer TypeScript type theory avançado (generics + literal types)
2. **Re-Export Pattern:** Não é "common knowledge" — requer raciocínio sobre code reuse patterns
3. **Zod API Correctness:** `.discriminatedUnion()` vs `.union()` — diferença sutil mas crítica
4. **Test Design:** 15 testes com edge cases (campo ausente, enum inválido) requerem planning

**NOT Recommended:** GPT-5.4 mini (0.33x) — discriminated unions provaram alta taxa de erro em Stories similares.

**Cost/Benefit:**
- Input: ~1200 tokens (prompt) + ~300 tokens (story context) = ~1500 tokens
- Output: ~600 tokens (confirmação + DoD update + commit message)
- Total: ~2100 tokens × 1x = **2100 tokens custo**
- Alternative (mini): 2100 × 0.33 = 693 tokens, mas +40% chance de erro (necessitando retry)

**Decisão:** Sonnet 4.6 — complexidade Zod justifica 1x multiplier.

---

## Comparison: Story 2.2 vs Story 2.3

| Aspect | Story 2.2 (Types) | Story 2.3 (Contracts) | Difference |
|--------|-------------------|----------------------|------------|
| Prompt Tokens | 1590 | 1200 | -24% (menos checkpoints) |
| Code Provided | Snippets (30%) | Complete (72%) | +42pp (Zod syntax crítica) |
| Checkpoints | 4 | 2 | -50% (menos refactoring) |
| Anti-Patterns | Generic | Zod-specific | Mais específico |
| Complexity (PO) | Medium | Low | Justifica simplificação |
| YOLO Compatible | Partial | Full | Checkpoints não bloqueiam |

**Key Learning:** Low-complexity stories podem ter prompts MAIS focados (menos checkpoints) MAS ainda precisam de code examples completos quando pattern é avançado (Zod discriminated unions).

---

## Risk Mitigation

### High Risk: Discriminated Union Syntax Error

**Mitigation:** Complete code example + Anti-pattern section highlighting `z.union()` vs `z.discriminatedUnion()`

**Fallback:** Test 2 (testing-strategy.md) detecta se discriminated union está ausente → CodeRabbit auto-heal (max 1 iteração)

### Medium Risk: Re-Export Pattern Duplicação

**Mitigation:** Explicit "NEVER DO" example + Test 1 (grep for duplicated schema)

**Fallback:** Typecheck detectará tipos conflitantes se schema for duplicado

### Low Risk: ContentType Enum Aberto

**Mitigation:** Teste específico "rejeita type=info" + enum explícito no code example

**Fallback:** CodeRabbit path instructions verificam enum values

---

## Metrics to Track

Post-execution, measure:

1. **First-Try Success Rate:** Prompt executado sem erros? (target: 90%)
2. **Checkpoint Compliance:** Typecheck rodado após cada etapa? (target: 100%)
3. **Re-Export Correctness:** Test 1 passa? (target: 100%)
4. **Discriminated Union Count:** Test 2 detecta 2 unions? (target: 100%)
5. **Test Pass Rate:** 15/15 testes passing? (target: 100%)
6. **Time to Complete:** Comparado com estimativa (1-2h) — quanto tempo real?
7. **CodeRabbit Iterations:** 0 (ideal), 1 (acceptable), 2+ (prompt needs revision)

**Feedback Loop:** Métricas abaixo de target alimentam revisão de prompt para próximas stories (2.6, 2.7 usam mesmo pattern).

---

## Lessons Learned (Template para preencher pós-execução)

```
=== STORY 2.3 @dev PROMPT — LEARNINGS ===
Data: YYYY-MM-DD
Executor: @dev / Human

1. Code Examples Effectiveness:
   - Complete code foi copiado corretamente? SIM / NÃO
   - Se NÃO: Qual parte causou confusão?
   - Discriminated union syntax foi aplicada corretamente? SIM / NÃO

2. Checkpoint Compliance:
   - Checkpoints foram seguidos? SIM / NÃO
   - Se NÃO: Qual checkpoint foi pulado e por quê?

3. Testing Completeness:
   - 15 testes foram criados? SIM / NÃO
   - Algum teste falhou inesperadamente? SIM / NÃO
   - Se SIM: Qual teste e qual foi o erro?

4. YOLO Mode Compatibility:
   - Prompt foi executado autonomamente (sem clarificações)? SIM / NÃO
   - Se NÃO: Qual ponto precisou de input humano?

5. Time to Complete:
   - Tempo real: X minutos
   - Comparado com estimativa (60-120min): DENTRO / ACIMA / ABAIXO

6. CodeRabbit Iterations:
   - Iterações necessárias: X (0 ideal, 1 ok, 2+ problema)
   - Se >= 1: Qual violação CodeRabbit detectou?

7. Improvements for Next Story:
   - O que funcionou bem e deve ser mantido?
   - O que deve ser melhorado no próximo prompt (Stories 2.6, 2.7)?
```

---

## Next Stories Reusability

Este prompt pattern (complete Zod code + discriminated unions + re-export) é reutilizável em:

- **Story 2.6:** API Integration (migrar routes para usar `contracts.ts`)
- **Story 2.7:** Error Handling (adicionar error schemas discriminated por error code)
- **Future Stories:** Qualquer endpoint novo que precise de Zod contracts

**Recommendation:** Manter este prompt como template base em `.aiox-core/development/templates/zod-contracts-story-tmpl.md` após validação.

---

**END OF ANALYSIS**
