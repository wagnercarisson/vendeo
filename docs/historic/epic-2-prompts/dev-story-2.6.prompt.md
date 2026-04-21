# Prompt: @dev — Implementar Story 2.6 (Integration API Routes)

**Story:** 2.6 — Integration API Routes  
**Epic:** Epic 2 — Arquitetura de Campanhas (FINAL STORY)  
**From:** @po (Pax) — Validation Score 10/10 ✅  
**Created:** 2026-04-20  
**Complexity:** 🔴 HIGH RISK (production endpoint + z.enum trap + Epic closure)  
**Estimated Effort:** 3-4h

---

## ANALYSIS — Design Decisions

### 1. **3 Surgical Changes Only** (Zero Scope Creep)

**Why:**
- @po validation confirmed: Story 2.6 closes gap where contracts exist (Story 2.3) but /strategy doesn't use them
- 3 precise changes: export schemas → tighten validation → activate endpoint
- ZERO changes to working endpoints (/campaign, /reels)

**Surgical precision:**
```
Change #1: schemas.ts → Add export to 3 schemas (API expansion only)
Change #2: contracts.ts → Replace StrategySuggestionSchema with StrategyAIOutputSchema (z.enum direct, NO preprocess)
Change #3: strategy/route.ts → Activate safeParse validations (request + AI response)
```

**Alternative considered:** Refactor all 3 endpoints for consistency  
**Rejected because:** /campaign and /reels already work — surgical changes only

---

### 2. **z.preprocess Trap** (🔴 CRITICAL DISTINCTION)

**Why:**
- CampaignObjectiveSchema uses `z.preprocess()` for **legacy input normalization** (user types "reconhecimento" → "awareness")
- StrategyAIOutputSchema must use **z.enum(OBJECTIVE_VALUES) direct** for AI output validation (no preprocessing)
- AI MUST return exact enum values ("awareness", not "reconhecimento")

**Critical code pattern:**
```typescript
// ❌ WRONG — Uses preprocessing (for user input, not AI output)
export const StrategySuggestionSchema = z.object({
  objective: CampaignObjectiveSchema, // Has z.preprocess!
});

// ✅ CORRECT — Direct enum (AI output validation)
export const StrategyAIOutputSchema = z.object({
  objective: z.enum(OBJECTIVE_VALUES), // No preprocessing
});
```

**Alternative considered:** Re-use CampaignObjectiveSchema  
**Rejected because:** AI output validation must not preprocess (enum validation only)

---

### 3. **Production Endpoint Safety** (Manual Tests MANDATORY)

**Why:**
- /strategy is used in production dashboard (CampaignCard.tsx, onboarding/)
- Breaking changes can affect live users
- 2 mandatory manual tests BEFORE commit (DoD items 13-14)

**2 manual tests required:**
1. POST /strategy with actual frontend payload → 200 (verify CampaignCard.tsx payload format)
2. POST /strategy with invalid payload → 400 with details (error handling)

**Alternative considered:** Automated tests only  
**Rejected because:** Production endpoint requires human validation with real payloads

---

### 4. **Epic 2 Closure** (EXEC-PLAN Update)

**Why:**
- Story 2.6 is FINAL story of Epic 2
- DoD item 15: Update EXEC-PLAN-EPIC-2.md to "6/6 stories — 100% complete"
- Closes Epic 2 mission: "Implement contracts & domain architecture to prevent bugs"

**EXEC-PLAN update requirements:**
```markdown
## Estado Atual (2026-04-20)
- ✅ Story 2.1: Domain Schemas (DONE)
- ✅ Story 2.2: Type Consolidation (DONE)
- ✅ Story 2.3: API Contracts (DONE)
- ✅ Story 2.4: Domain Mappers (DONE)
- ✅ Story 2.5: Selector Consolidation (DONE)
- ✅ Story 2.6: Integration API Routes (DONE) ← UPDATE THIS

**Epic 2 Status:** 🎉 **100% Complete (6/6 stories)**

Architecture active in 3 production endpoints:
- /api/generate/campaign (uses full architecture)
- /api/generate/reels (uses full architecture)
- /api/generate/campaign/strategy (uses full architecture) ← NEW
```

---

### 5. **CodeRabbit Self-Healing** (Max 2 Iterations)

**Why:**
- CodeRabbit will auto-review for: breaking changes, type safety, enum validation, manual test execution
- Max 2 iterations: Implementation → Review → Fix (if needed)
- If iteration 3 required → escalate to @architect

**CodeRabbit checks:**
- ✅ Schemas exported from schemas.ts (no logic changes)
- ✅ StrategyAIOutputSchema uses z.enum() direct (no preprocessing)
- ✅ route.ts has safeParse() for request (400) + AI response (500)
- ✅ Manual tests executed (POST válido, inválido)
- ✅ EXEC-PLAN updated (Epic 2 100%)

---

### 6. **Error Response Consistency** (400 vs 500)

**Why:**
- Follow /campaign pattern: 400 INVALID_INPUT (user error), 500 AI_INVALID_OUTPUT (AI error)
- requestId in ALL error responses (debugging)

**Error pattern:**
```typescript
// 400 — User sent invalid input
return NextResponse.json(
  { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() },
  { status: 400 }
);

// 500 — AI returned invalid output
return NextResponse.json(
  { ok: false, requestId, error: "AI_INVALID_OUTPUT", details: validated.error.flatten() },
  { status: 500 }
);
```

---

## SYSTEM PROMPT — @dev Implementation

### Context

**Story:** 2.6 — Integration API Routes (FINAL STORY of Epic 2)  
**Dependencies:** Stories 2.1-2.5 ✅ ALL DONE  
**Objective:** Ativar validação em endpoint /strategy usando schemas Zod (close gap from Story 2.3)  
**Complexity:** 🔴 HIGH RISK (production endpoint, z.enum trap, Epic closure)  
**Effort:** 3-4h  

**@po Validation:** 10/10 (perfect score)  
**Key insight:** Contracts exist (Story 2.3) but /strategy doesn't use them — Story 2.6 closes this gap with 3 surgical changes

---

### Requirements

#### User Story
Como desenvolvedor  
Quero ativar validação no endpoint /strategy  
Para garantir que request e AI response seguem schemas Zod (arquitetura end-to-end)

#### Objective
Endpoint `/api/generate/campaign/strategy` atualmente NÃO USA validação:
1. ❌ Request validation: Apenas `await req.json()` (qualquer JSON aceito)
2. ❌ AI response validation: Apenas `JSON.parse()` (não valida enums)
3. ❌ Error responses: Não segue padrão (400/500)
4. ❌ Schema export: CampaignAudienceSchema, CampaignObjectiveSchema, ProductPositioningSchema não exportados

**Story 2.6 ativa validação com 3 surgical changes.**

---

#### 3 Surgical Changes (MUST follow exactly)

| Change | File | Action | Critical Note |
|--------|------|--------|---------------|
| **1. Export schemas** | `schemas.ts` | Add `export` to CampaignAudienceSchema, CampaignObjectiveSchema, ProductPositioningSchema, AUDIENCE_VALUES, POSITIONING_VALUES | ZERO logic changes — only API expansion |
| **2. Tighten validation** | `contracts.ts` | Replace `StrategySuggestionSchema` with `StrategyAIOutputSchema` using `z.enum()` direct (NO preprocess) | 🔴 Must NOT use CampaignObjectiveSchema (has preprocess) |
| **3. Activate endpoint** | `strategy/route.ts` | Add safeParse() for request (400) + AI response (500) + requestId in all errors | 🔴 Manual test with frontend payload mandatory |

---

#### Acceptance Criteria (from @po validation)

**AC1: Export schemas from schemas.ts (API expansion)**
```gherkin
DADO que CampaignAudienceSchema, CampaignObjectiveSchema, ProductPositioningSchema são usados apenas internamente
QUANDO adiciono export antes de cada schema
ENTÃO esses schemas ficam disponíveis para contracts.ts (sem quebrar código existente)
```

**AC2: Create StrategyAIOutputSchema com z.enum direct (NO preprocess)**
```gherkin
DADO que StrategySuggestionSchema usa CampaignObjectiveSchema (que tem z.preprocess)
QUANDO crio StrategyAIOutputSchema usando z.enum(OBJECTIVE_VALUES) direct
ENTÃO AI output validation não preprocessa valores (enum validation only)
E testes validam que "reconhecimento" é rejeitado (não normalizado para "awareness")
```

**AC3: Activate request validation (400 INVALID_INPUT)**
```gherkin
DADO que /strategy recebe POST com body
QUANDO valido com CampaignStrategyRequestSchema.safeParse()
E body.success === false
ENTÃO retorno { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() } com status 400
```

**AC4: Activate AI response validation (500 AI_INVALID_OUTPUT)**
```gherkin
DADO que IA retorna JSON
QUANDO valido com StrategyAIOutputSchema.safeParse()
E validated.success === false
ENTÃO retorno { ok: false, requestId, error: "AI_INVALID_OUTPUT", details: validated.error.flatten() } com status 500
E logo error no console
```

**AC5: Update EXEC-PLAN (Epic 2 100% complete)**
```gherkin
DADO que Story 2.6 é a última story do Epic 2
QUANDO marco Story 2.6 como DONE
ENTÃO atualizo EXEC-PLAN-EPIC-2.md: "Epic 2 Status: 🎉 100% Complete (6/6 stories)"
E documento arquitetura ativa em 3 endpoints (/campaign, /reels, /strategy)
```

---

#### Scope

**IN SCOPE (Story 2.6):**
- ✅ Export 3 schemas de schemas.ts (+ AUDIENCE_VALUES, POSITIONING_VALUES)
- ✅ Create StrategyAIOutputSchema com z.enum() direct (replace StrategySuggestionSchema)
- ✅ Activate request validation (safeParse + 400)
- ✅ Activate AI response validation (safeParse + 500)
- ✅ Create contracts.test.ts (unit tests para enum validation)
- ✅ Execute 2 mandatory manual tests (POST válido, inválido)
- ✅ Update EXEC-PLAN-EPIC-2.md (Epic 2 100%)

**OUT OF SCOPE (NEVER touch):**
- ❌ Refatorar /campaign ou /reels (já funcionam perfeitamente)
- ❌ Modificar generateCampaignContent() service
- ❌ Adicionar retry logic ou caching
- ❌ Criar novos endpoints
- ❌ Modificar CampaignObjectiveSchema (manter z.preprocess para user input)

---

#### Dev Notes — 3 Code Patterns

**Pattern 1: Export Schemas (schemas.ts)**
```typescript
// BEFORE (internal only)
const CampaignAudienceSchema = z.enum(AUDIENCE_VALUES);
const CampaignObjectiveSchema = z.preprocess(...);
const ProductPositioningSchema = z.enum(POSITIONING_VALUES);

// AFTER (exported for contracts.ts)
export const CampaignAudienceSchema = z.enum(AUDIENCE_VALUES);
export const CampaignObjectiveSchema = z.preprocess(...); // Keep preprocess for user input
export const ProductPositioningSchema = z.enum(POSITIONING_VALUES);
export const AUDIENCE_VALUES = [...] as const;
export const POSITIONING_VALUES = [...] as const;
```

**Pattern 2: StrategyAIOutputSchema (contracts.ts)**
```typescript
// IMPORT direct values (NO preprocess schema)
import { AUDIENCE_VALUES, OBJECTIVE_VALUES, POSITIONING_VALUES } from "./schemas";
import { ContentTypeSchema } from "./types";

// ❌ OLD — Uses preprocessing (WRONG for AI output)
export const StrategySuggestionSchema = z.object({
  audience: z.enum(AUDIENCE_VALUES), // ✅ OK
  objective: CampaignObjectiveSchema, // ❌ WRONG — has preprocess
  productPositioning: z.enum(POSITIONING_VALUES), // ✅ OK
  reasoning: z.string().min(10),
});

// ✅ NEW — Direct enum validation (CORRECT for AI output)
export const StrategyAIOutputSchema = z.object({
  audience: z.enum(AUDIENCE_VALUES), // Direct enum
  objective: z.enum(OBJECTIVE_VALUES), // Direct enum (NO preprocess)
  productPositioning: z.enum(POSITIONING_VALUES), // Direct enum
  reasoning: z.string().min(10, "Reasoning deve ter no mínimo 10 caracteres"),
});

export type StrategyAIOutput = z.infer<typeof StrategyAIOutputSchema>;
```

**Pattern 3: Request + AI Validation (strategy/route.ts)**
```typescript
import { CampaignStrategyRequestSchema, StrategyAIOutputSchema } from "@/lib/domain/campaigns/contracts";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  // 1. Validate REQUEST (400 if invalid)
  const json = await req.json().catch(() => null);
  const body = CampaignStrategyRequestSchema.safeParse(json);

  if (body.success === false) {
    return NextResponse.json(
      { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() },
      { status: 400 }
    );
  }

  // 2. Call AI (existing logic)
  const { product } = body.data;
  const ai = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: systemPrompt }, ...],
  });

  // 3. Validate AI RESPONSE (500 if invalid)
  const content = ai.choices[0].message.content || "{}";
  const parsed = JSON.parse(content);
  const validated = StrategyAIOutputSchema.safeParse(parsed);

  if (validated.success === false) {
    console.error("[strategy] AI returned invalid data:", validated.error);
    return NextResponse.json(
      { ok: false, requestId, error: "AI_INVALID_OUTPUT", details: validated.error.flatten() },
      { status: 500 }
    );
  }

  // 4. Return validated data
  return NextResponse.json({
    ok: true,
    requestId,
    suggestion: validated.data,
  });
}
```

---

#### Cross-Story Decisions

| Story | Decision | Impact on 2.6 |
|-------|----------|---------------|
| 2.1 (Schemas) | Schemas criados mas não exportados | Story 2.6 exporta 3 schemas (API expansion) |
| 2.2 (Types) | ContentTypeSchema criado | Story 2.6 usa em CampaignStrategyRequestSchema |
| 2.3 (Contracts) | CampaignStrategyRequestSchema criado | Story 2.6 ativa validação no endpoint |
| 2.4 (Mappers) | Error codes 400/500 padronizados | Story 2.6 segue mesmo padrão (consistency) |
| 2.5 (Selectors) | Selectors assumem dados validados | Story 2.6 garante validação end-to-end |

---

### Implementation Guidance — 6 Steps

**Passo 1: Export Schemas (schemas.ts)**
- Add `export` before CampaignAudienceSchema, CampaignObjectiveSchema, ProductPositioningSchema
- Add `export` before AUDIENCE_VALUES, POSITIONING_VALUES
- DO NOT change any logic (z.preprocess must stay for user input)
- Verify typecheck: `npx tsc --noEmit`

**Passo 2: Create StrategyAIOutputSchema (contracts.ts)**
- Import AUDIENCE_VALUES, OBJECTIVE_VALUES, POSITIONING_VALUES from schemas.ts
- Replace StrategySuggestionSchema with StrategyAIOutputSchema
- Use `z.enum(OBJECTIVE_VALUES)` direct (NOT CampaignObjectiveSchema)
- Add JSDoc explaining z.enum direct (AI output validation, no preprocessing)

**Passo 3: Activate Request Validation (strategy/route.ts)**
- Import CampaignStrategyRequestSchema from contracts.ts
- Add safeParse() at start of POST handler
- Return 400 INVALID_INPUT if body.success === false (with requestId)
- Use body.data (typed) instead of raw json

**Passo 4: Activate AI Response Validation (strategy/route.ts)**
- Import StrategyAIOutputSchema from contracts.ts
- Add safeParse() after JSON.parse() of AI response
- Return 500 AI_INVALID_OUTPUT if validated.success === false (with requestId)
- Log error to console for debugging
- Use validated.data (typed) in response

**Passo 5: Create Tests (contracts.test.ts)**
- Test StrategyAIOutputSchema with valid data (all enums valid)
- Test with invalid objective ("reconhecimento" should REJECT, not normalize)
- Test with invalid audience, invalid positioning
- Test with missing reasoning (should fail)

**Passo 6: Manual Tests + EXEC-PLAN Update**
- Execute 2 mandatory manual tests (DoD items 13-14)
- Update EXEC-PLAN-EPIC-2.md (Story 2.6 DONE, Epic 2 100%)
- Commit with message: `feat: activate validation in strategy endpoint [Story 2.6]`

---

### Validation Checklist (Before Commit)

- [ ] schemas.ts: 3 schemas exportados (+ AUDIENCE_VALUES, POSITIONING_VALUES)
- [ ] contracts.ts: StrategyAIOutputSchema criado com z.enum() direct (NO preprocess)
- [ ] strategy/route.ts: Request validation com safeParse() + error 400
- [ ] strategy/route.ts: AI response validation com safeParse() + error 500
- [ ] strategy/route.ts: requestId em TODOS os error responses
- [ ] contracts.test.ts: 4-6 testes para enum validation (including "reconhecimento" reject)
- [ ] Typecheck passa: `npx tsc --noEmit`
- [ ] Testes unitários passam: `npx vitest run lib/domain/campaigns/contracts.test.ts`
- [ ] **Manual test 1:** POST válido → 200 (com payload do frontend)
- [ ] **Manual test 2:** POST inválido → 400 com details
- [ ] EXEC-PLAN-EPIC-2.md atualizado (Epic 2 100% complete)

---

### Instructions (Step by Step)

1. **Read Story File:**
   - Open `docs/stories/2.6.story.md`
   - Review Discovery (Endpoint Comparison Table), AC (5 scenarios), DoD (15 items)

2. **Change #1 — Export Schemas:**
   - Open `lib/domain/campaigns/schemas.ts`
   - Add `export` before CampaignAudienceSchema, CampaignObjectiveSchema, ProductPositioningSchema
   - Add `export` before AUDIENCE_VALUES, POSITIONING_VALUES
   - Verify: No logic changes (z.preprocess stays)

3. **Change #2 — Tighten Validation:**
   - Open `lib/domain/campaigns/contracts.ts`
   - Import AUDIENCE_VALUES, OBJECTIVE_VALUES, POSITIONING_VALUES from schemas.ts
   - Replace StrategySuggestionSchema with StrategyAIOutputSchema
   - Use `z.enum(OBJECTIVE_VALUES)` direct (NOT CampaignObjectiveSchema)
   - Add type: `export type StrategyAIOutput = z.infer<typeof StrategyAIOutputSchema>`

4. **Change #3 — Activate Endpoint:**
   - Open `app/api/generate/campaign/strategy/route.ts`
   - Import CampaignStrategyRequestSchema, StrategyAIOutputSchema
   - Add safeParse() for request (beginning of handler)
   - Add safeParse() for AI response (after JSON.parse())
   - Add requestId to all error responses

5. **Create Tests:**
   - Create `lib/domain/campaigns/contracts.test.ts`
   - Test StrategyAIOutputSchema with valid data
   - Test with invalid objective ("reconhecimento" should REJECT)
   - Run tests: `npx vitest run lib/domain/campaigns/contracts.test.ts`

6. **Execute Manual Tests:**
   - Test 1: POST /strategy with valid payload → 200
   - Test 2: POST /strategy with invalid payload → 400 with details
   - Document results in story or commit message

7. **Update EXEC-PLAN:**
   - Open `docs/EXEC-PLAN-EPIC-2.md`
   - Mark Story 2.6 as DONE
   - Update Epic 2 Status: "🎉 100% Complete (6/6 stories)"
   - Document architecture active in 3 endpoints

8. **Commit:**
   - `git add` all changed files
   - `git commit -m "feat: activate validation in strategy endpoint [Story 2.6]"`
   - DON'T push (await @qa validation)

9. **Report to @qa:**
   - Notify @qa that Story 2.6 is ready for QA Gate
   - Provide manual test results

---

### Anti-Patterns

**NEVER DO:**
- ❌ Use CampaignObjectiveSchema in StrategyAIOutputSchema (has z.preprocess)
- ❌ Refatorar /campaign ou /reels (already working)
- ❌ Skip manual tests (production endpoint requires human validation)
- ❌ Forget requestId in error responses (debugging essential)
- ❌ Commit without updating EXEC-PLAN (Epic 2 closure mandatory)
- ❌ Change CampaignObjectiveSchema preprocessing (user input needs normalization)

**ALWAYS DO:**
- ✅ Use z.enum(OBJECTIVE_VALUES) direct in StrategyAIOutputSchema (AI output validation)
- ✅ Export schemas from schemas.ts (zero logic changes)
- ✅ Execute 2 mandatory manual tests BEFORE commit
- ✅ Add requestId to ALL error responses (400 and 500)
- ✅ Update EXEC-PLAN-EPIC-2.md (Epic 2 100% complete)
- ✅ Log AI invalid output to console (debugging production issues)

---

### Risk Mitigation (from @po validation)

**🔴 ALTO #1: Production endpoint quebrar**
- **Mitigation:** Manual test with actual frontend payload BEFORE commit (verify CampaignCard.tsx, onboarding/ payloads)
- **Test:** POST /strategy with production payload format → must return 200

**🔴 ALTO #2: z.preprocess trap**
- **Mitigation:** StrategyAIOutputSchema must use z.enum(OBJECTIVE_VALUES) direct, NOT CampaignObjectiveSchema
- **Test:** contracts.test.ts must verify "reconhecimento" is REJECTED (not normalized)

**🟡 MÉDIO #3: Tipos não matcharem constantes**
- **Mitigation:** Import OBJECTIVE_VALUES, AUDIENCE_VALUES, POSITIONING_VALUES direct from schemas.ts
- **Test:** TypeScript typecheck must pass

**🟢 BAIXO #4: Regressão em outros endpoints**
- **Mitigation:** Story 2.6 doesn't touch /campaign or /reels (OUT OF SCOPE)
- **Verification:** Manual test POST /campaign after deploy (optional)

---

## File List

| File | Action | Notes |
|------|--------|-------|
| `lib/domain/campaigns/schemas.ts` | **UPDATE** | Export CampaignAudienceSchema, CampaignObjectiveSchema, ProductPositioningSchema, AUDIENCE_VALUES, POSITIONING_VALUES (zero logic changes) |
| `lib/domain/campaigns/contracts.ts` | **UPDATE** | Replace StrategySuggestionSchema with StrategyAIOutputSchema (z.enum direct, NO preprocess) |
| `app/api/generate/campaign/strategy/route.ts` | **UPDATE** | Add safeParse() for request (400) + AI response (500) + requestId |
| `lib/domain/campaigns/contracts.test.ts` | **CREATE** | Unit tests for StrategyAIOutputSchema (enum validation, "reconhecimento" reject) |
| `docs/EXEC-PLAN-EPIC-2.md` | **UPDATE** | Mark Story 2.6 DONE, Epic 2 100% complete, architecture active in 3 endpoints |
| `docs/stories/2.6.story.md` | **UPDATE** | Mark all checkboxes as [x], update status to InProgress → InReview → Done |

---

## Expected Commit Message

```
feat: activate validation in strategy endpoint [Story 2.6]

Story 2.6 completion — Integration API Routes (FINAL STORY Epic 2):

3 surgical changes:
- schemas.ts: Export 3 schemas + 2 value arrays (API expansion only)
- contracts.ts: Replace StrategySuggestionSchema with StrategyAIOutputSchema (z.enum direct, NO preprocess)
- strategy/route.ts: Activate request (400) + AI response (500) validation

Manual tests executed:
- POST /strategy with valid payload → 200 ✅
- POST /strategy with invalid payload → 400 with details ✅

Epic 2 Status: 🎉 100% Complete (6/6 stories)
Architecture active in 3 production endpoints: /campaign, /reels, /strategy

[Story 2.6]
```

---

**END OF @dev PROMPT**
