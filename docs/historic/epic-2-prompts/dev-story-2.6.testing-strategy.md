# Testing Strategy — Story 2.6 (@dev Implementation)

## Test Coverage Requirements

Esta strategy valida que: schemas exportados, StrategyAIOutputSchema usa z.enum direct (NO preprocess), validações ativas em route.ts, manual tests executados, Epic 2 complete.

---

## Test Suite 1: Schema Export Validation

**Objetivo:** Validar que schemas.ts exporta 3 schemas sem quebrar código existente.

| Test Case | Expected Output | Validates |
|-----------|----------------|-----------|
| **T1.1 — CampaignAudienceSchema exportado** | `export const CampaignAudienceSchema = z.enum(AUDIENCE_VALUES)` | API expansion (contracts.ts pode importar) |
| **T1.2 — CampaignObjectiveSchema exportado** | `export const CampaignObjectiveSchema = z.preprocess(...)` | z.preprocess mantido (user input normalization) |
| **T1.3 — ProductPositioningSchema exportado** | `export const ProductPositioningSchema = z.enum(POSITIONING_VALUES)` | API expansion |
| **T1.4 — AUDIENCE_VALUES exportado** | `export const AUDIENCE_VALUES = [...] as const` | Enum values disponíveis para contracts.ts |
| **T1.5 — POSITIONING_VALUES exportado** | `export const POSITIONING_VALUES = [...] as const` | Enum values disponíveis |
| **T1.6 — Zero logic changes** | Typecheck passa: `npx tsc --noEmit` | Não quebra código existente |

---

## Test Suite 2: StrategyAIOutputSchema (z.enum direct)

**Objetivo:** Validar que StrategyAIOutputSchema usa z.enum() direct (NO preprocess).

| Test Case | Input | Expected Output | Validates |
|-----------|-------|-----------------|-----------|
| **T2.1 — Valid data** | `{ audience: "young_adults", objective: "awareness", productPositioning: "premium", reasoning: "Target young professionals" }` | `{ success: true, data: {...} }` | Happy path |
| **T2.2 — Invalid objective (preprocess would normalize)** | `{ audience: "young_adults", objective: "reconhecimento", productPositioning: "premium", reasoning: "..." }` | `{ success: false, error: {...} }` | 🔴 CRITICAL — Must REJECT (not normalize) |
| **T2.3 — Invalid audience** | `{ audience: "invalid", objective: "awareness", ... }` | `{ success: false, error: {...} }` | Enum validation |
| **T2.4 — Invalid positioning** | `{ ..., productPositioning: "invalid", ... }` | `{ success: false, error: {...} }` | Enum validation |
| **T2.5 — Missing reasoning** | `{ audience: "young_adults", objective: "awareness", productPositioning: "premium" }` | `{ success: false, error: {...} }` | Required field validation |
| **T2.6 — Reasoning too short** | `{ ..., reasoning: "Short" }` | `{ success: false, error: {...} }` | Min length validation (10 chars) |

**Critical Test T2.2 Explanation:**
- `CampaignObjectiveSchema` (user input) uses `z.preprocess()` to normalize "reconhecimento" → "awareness"
- `StrategyAIOutputSchema` (AI output) must use `z.enum(OBJECTIVE_VALUES)` direct
- AI MUST return exact enum values ("awareness", not "reconhecimento")
- Test T2.2 verifies preprocessing is NOT applied (reject invalid value)

---

## Test Suite 3: Request Validation (400 INVALID_INPUT)

**Objetivo:** Validar que route.ts valida request e retorna 400 para inputs inválidos.

| Test Case | Input | Expected Response | Status | Validates |
|-----------|-------|------------------|--------|-----------|
| **T3.1 — Valid request** | `{ product: { type: "product", productName: "Notebook", description: "..." } }` | `{ ok: true, requestId: "...", suggestion: {...} }` | 200 | Happy path |
| **T3.2 — Invalid type** | `{ product: { type: "invalid", productName: "Notebook" } }` | `{ ok: false, requestId: "...", error: "INVALID_INPUT", details: {...} }` | 400 | Enum validation |
| **T3.3 — Missing productName** | `{ product: { type: "product", productName: "" } }` | `{ ok: false, requestId: "...", error: "INVALID_INPUT", details: {...} }` | 400 | Required field |
| **T3.4 — Malformed JSON** | `{ invalid }` | `{ ok: false, requestId: "...", error: "INVALID_INPUT", details: {...} }` | 400 | JSON parsing |
| **T3.5 — requestId present** | Any error | Error response contains `requestId` field | 400 | Debugging capability |

---

## Test Suite 4: AI Response Validation (500 AI_INVALID_OUTPUT)

**Objetivo:** Validar que route.ts valida AI response e retorna 500 para outputs inválidos.

| Test Case | AI Output | Expected Response | Status | Validates |
|-----------|-----------|------------------|--------|-----------|
| **T4.1 — Valid AI output** | `{ audience: "young_adults", objective: "awareness", productPositioning: "premium", reasoning: "..." }` | `{ ok: true, requestId: "...", suggestion: {...} }` | 200 | Happy path |
| **T4.2 — Invalid objective** | `{ ..., objective: "reconhecimento", ... }` | `{ ok: false, requestId: "...", error: "AI_INVALID_OUTPUT", details: {...} }` | 500 | 🔴 Enum validation (NO preprocess) |
| **T4.3 — Invalid audience** | `{ audience: "invalid", ... }` | `{ ok: false, requestId: "...", error: "AI_INVALID_OUTPUT", details: {...} }` | 500 | Enum validation |
| **T4.4 — Missing reasoning** | `{ audience: "...", objective: "...", productPositioning: "..." }` | `{ ok: false, requestId: "...", error: "AI_INVALID_OUTPUT", details: {...} }` | 500 | Required field |
| **T4.5 — Console logging** | Invalid AI output | `console.error("[strategy] AI returned invalid data:", ...)` | — | Debugging production issues |
| **T4.6 — requestId present** | Any error | Error response contains `requestId` field | 500 | Debugging capability |

---

## Test Suite 5: Manual Tests (DoD Items 13-14)

**Objetivo:** Validar endpoint com payloads reais do frontend.

### Manual Test 1: POST válido → 200 (DoD Item 13)

```bash
# Test com payload do frontend (CampaignCard.tsx format)
curl -X POST http://localhost:3000/api/generate/campaign/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "type": "product",
      "productName": "Notebook Dell Inspiron",
      "description": "Notebook com processador Intel i5, 8GB RAM",
      "price": "R$ 3.500,00"
    }
  }'

# Expected response:
{
  "ok": true,
  "requestId": "123e4567-e89b-12d3-a456-426614174000",
  "suggestion": {
    "audience": "young_adults",
    "objective": "awareness",
    "productPositioning": "premium",
    "reasoning": "Target young professionals who need performance for work and study"
  }
}

# Validation checklist:
- [ ] Status 200
- [ ] ok: true
- [ ] requestId presente
- [ ] suggestion.audience é enum válido (AUDIENCE_VALUES)
- [ ] suggestion.objective é enum válido (OBJECTIVE_VALUES)
- [ ] suggestion.productPositioning é enum válido (POSITIONING_VALUES)
- [ ] suggestion.reasoning tem ≥10 caracteres
```

### Manual Test 2: POST inválido → 400 (DoD Item 14)

```bash
# Test com payload inválido
curl -X POST http://localhost:3000/api/generate/campaign/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "type": "invalid_type",
      "productName": ""
    }
  }'

# Expected response:
{
  "ok": false,
  "requestId": "123e4567-e89b-12d3-a456-426614174000",
  "error": "INVALID_INPUT",
  "details": {
    "fieldErrors": {
      "product.type": ["Invalid enum value. Expected 'product' | 'service' | 'message', received 'invalid_type'"],
      "product.productName": ["String must contain at least 1 character(s)"]
    }
  }
}

# Validation checklist:
- [ ] Status 400
- [ ] ok: false
- [ ] requestId presente
- [ ] error: "INVALID_INPUT"
- [ ] details.fieldErrors contém erros específicos
```

---

## Test Suite 6: EXEC-PLAN Update (DoD Item 15)

**Objetivo:** Validar que EXEC-PLAN-EPIC-2.md reflete Epic 2 completion.

| Test Case | Expected Content | Validates |
|-----------|-----------------|-----------|
| **T6.1 — Story 2.6 marked DONE** | `✅ Story 2.6: Integration API Routes (DONE)` | Story status updated |
| **T6.2 — Epic 2 status 100%** | `**Epic 2 Status:** 🎉 **100% Complete (6/6 stories)**` | Epic closure |
| **T6.3 — Architecture documentation** | Lists 3 endpoints: /campaign, /reels, /strategy (all using full architecture) | Architecture active |
| **T6.4 — Completion timestamp** | `Updated: 2026-04-20` or similar | Audit trail |

---

## Test Suite 7: Regression Prevention

**Objetivo:** Validar que /campaign e /reels não foram afetados.

| Test Case | Endpoint | Expected Behavior | Validates |
|-----------|----------|------------------|-----------|
| **T7.1 — /campaign still works** | POST /campaign with valid payload → 200 | ✅ Working | Zero breaking changes |
| **T7.2 — /reels still works** | POST /reels with valid payload → 200 | ✅ Working | Zero breaking changes |
| **T7.3 — CampaignObjectiveSchema unchanged** | User input "reconhecimento" → normalizes to "awareness" | ✅ Preprocessing active | User input normalization preserved |

---

## Validation Commands

```bash
# Typecheck (should pass)
npx tsc --noEmit

# Unit tests — contracts.test.ts
npx vitest run lib/domain/campaigns/contracts.test.ts
# Expected: All tests passing, including T2.2 ("reconhecimento" rejects)

# Unit tests — all domain tests
npx vitest run lib/domain/campaigns/
# Expected: All tests passing (schemas, contracts, mappers, selectors)

# Manual test 1 (POST válido)
curl -X POST http://localhost:3000/api/generate/campaign/strategy \
  -H "Content-Type: application/json" \
  -d '{"product":{"type":"product","productName":"Notebook"}}'
# Expected: 200 with suggestion

# Manual test 2 (POST inválido)
curl -X POST http://localhost:3000/api/generate/campaign/strategy \
  -H "Content-Type: application/json" \
  -d '{"product":{"type":"invalid","productName":""}}'
# Expected: 400 with INVALID_INPUT

# Verify EXEC-PLAN updated
grep "100% Complete" docs/EXEC-PLAN-EPIC-2.md
# Expected: Match found

# Regression test (optional)
curl -X POST http://localhost:3000/api/generate/campaign \
  -H "Content-Type: application/json" \
  -d '{"objective":"reconhecimento",...}'
# Expected: Still normalizes to "awareness" (preprocessing active for user input)
```

---

## Success Criteria

- ✅ Test Suite 1: 6/6 passing (schemas exportados, zero logic changes)
- ✅ Test Suite 2: 6/6 passing (StrategyAIOutputSchema z.enum direct, T2.2 CRITICAL)
- ✅ Test Suite 3: 5/5 passing (request validation 400)
- ✅ Test Suite 4: 6/6 passing (AI validation 500)
- ✅ Test Suite 5: 2/2 manual tests executed (POST válido, inválido)
- ✅ Test Suite 6: 4/4 passing (EXEC-PLAN updated)
- ✅ Test Suite 7: 3/3 passing (regression prevention)

**Total:** 32 test cases (30 automated + 2 manual)

---

## Risk Coverage

| Risk (from @po validation) | Test Coverage |
|---------------------------|---------------|
| 🔴 ALTO #1: Production endpoint quebrar | Manual Test 1 com payload do frontend (DoD Item 13) |
| 🔴 ALTO #2: z.preprocess trap | Test Suite 2 T2.2 (CRITICAL — "reconhecimento" must REJECT) |
| 🟡 MÉDIO #3: Tipos não matcharem | Test Suite 2 T2.1-T2.6 (enum validation) + TypeScript typecheck |
| 🟢 BAIXO #4: Regressão em outros endpoints | Test Suite 7 (regression prevention) |

---

**END OF TESTING STRATEGY**
