# @sm Package Summary — Story 2.6 (Integration API Routes)

**Story:** 2.6 — Integration API Routes  
**Epic:** Epic 2 — Arquitetura de Campanhas (FINAL STORY)  
**Status:** ✅ Ready for @sm execution  
**Package Created:** 2026-04-20  
**Package Type:** @sm Story Drafting Package (HIGH RISK integration)

---

## 📦 Package Deliverables

✅ **sm-story-2.6.prompt.md** (~2400 tokens)
- 6-step Chain-of-Thought workflow
- Mandatory discovery (4 steps → tabela 3 endpoints)
- 5 Acceptance Criteria (Gherkin format)
- 3 code pattern examples (request, AI, schema re-use)
- 3+ manual tests requirement
- OUT OF SCOPE explícito (prevent scope creep)
- Epic 2 completion (EXEC-PLAN update)

✅ **sm-story-2.6.testing-strategy.md** (~800 tokens)
- 7 test suites validating story completeness
- Discovery execution validation
- Cross-Story decisions validation
- AC coverage validation
- Risk assessment validation
- DoD completeness (12-15 items + manual tests)
- Dev Notes code examples validation

✅ **sm-story-2.6.analysis.md** (~600 tokens)
- 7 design decisions
- Token economy (~3800 total, -3% vs Story 2.4)
- Risk coverage (1 HIGH, 2 MEDIUM, 1 LOW)
- Cross-story dependencies (Stories 2.1-2.5)

✅ **README-story-2.6.md** (this file)
- Package overview and execution flow
- Metrics summary and quality gates
- Discovery table requirements
- Files affected (4 files)

---

## 🚀 @sm Workflow (6 Passos)

```
┌─────────────────────────────────────────────────────────────┐
│ Passo 1: DISCOVERY (MANDATORY)                             │
│   Step 1: Read /strategy/route.ts (sem validação)          │
│   Step 2: Read /campaign/route.ts (reference pattern)      │
│   Step 3: Grep schemas disponíveis (2.1 re-usable)         │
│   Step 4: Create tabela 3 endpoints (2 completos, 1 target)│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Passo 2: CROSS-STORY DECISIONS                             │
│   Referências: 2.1 (Schemas), 2.2 (Types), 2.3 (Contracts),│
│                2.4 (Error codes), 2.5 (Selectors)           │
│   Tabela: ≥3 referências com impact on 2.6                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Passo 3: ACCEPTANCE CRITERIA                               │
│   5 cenários Gherkin:                                       │
│   1. Criar schemas (CampaignStrategyRequest/Response)      │
│   2. Validar request (safeParse + 400)                     │
│   3. Validar AI response (safeParse + 500)                 │
│   4. Seguir padrão de /campaign (consistency)              │
│   5. Atualizar EXEC-PLAN (Epic 2 100%)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Passo 4: RISKS & MITIGATIONS                               │
│   4 riscos:                                                 │
│   🔴 HIGH: Endpoint quebrar em produção                    │
│   🟡 MEDIUM: IA retornar valores inválidos                 │
│   🟡 MEDIUM: Tipos não matcharem constantes                │
│   🟢 LOW: Regressão em outros endpoints                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Passo 5: DEFINITION OF DONE                                │
│   12-15 items:                                              │
│   - Schemas criados, validação request/AI                  │
│   - Error responses seguem padrão                           │
│   - Typecheck passa                                         │
│   - 3+ MANUAL TESTS (POST válido, inválido, IA inválida)  │
│   - EXEC-PLAN atualizado (Epic 2 100%)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Passo 6: DEV NOTES                                         │
│   3 code examples:                                          │
│   1. Request validation (from /campaign)                   │
│   2. AI response validation                                │
│   3. Schema re-use (contracts.ts)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔴 HIGH RISK Requirements

### Mandatory Discovery Table

**Você DEVE criar uma tabela comparando os 3 endpoints:**

| Endpoint | Validação Request | Validação Response | Usa Mappers | Status |
|----------|-------------------|-------------------|-------------|--------|
| `/api/generate/campaign` | ✅ `CampaignRequestSchema.safeParse()` | ✅ `CampaignAISchema` via `callAIWithRetry()` | ✅ `mapDbCampaignToDomain()` | ✅ COMPLETO |
| `/api/generate/reels` | ✅ `ShortVideoRequestSchema.safeParse()` | ✅ `ShortVideoAISchema` via `callAIWithRetry()` | ✅ `mapAiShortVideoToDomain()` | ✅ COMPLETO |
| `/api/generate/campaign/strategy` | ❌ Apenas `req.json()` | ❌ Apenas `JSON.parse()` | ❌ Não usa | 🔴 **TARGET** |

**Rationale:** Esta tabela documenta explicitamente que 2/3 endpoints já estão completos — Story 2.6 apenas completa o terceiro (previne scope creep).

---

### 3+ Manual Tests OBRIGATÓRIOS

**DoD DEVE incluir:**

1. **Manual test: POST válido → 200**
   ```bash
   curl -X POST http://localhost:3000/api/generate/campaign/strategy \
     -H "Content-Type: application/json" \
     -d '{"product":{"type":"product","productName":"Notebook"}}'
   # Expected: { ok: true, requestId: "...", suggestion: {...} }
   ```

2. **Manual test: POST inválido → 400**
   ```bash
   curl -X POST http://localhost:3000/api/generate/campaign/strategy \
     -H "Content-Type: application/json" \
     -d '{"product":{"type":"invalid","productName":""}}'
   # Expected: { ok: false, error: "INVALID_INPUT", details: {...} }
   ```

3. **Manual test: IA retorna dados inválidos → 500 (safety net)**
   - Monitorar logs quando IA retorna `objective="invalid_value"`
   - Expected: { ok: false, error: "AI_INVALID_OUTPUT", details: {...} }

---

### OUT OF SCOPE (Prevenir Scope Creep)

❌ **NEVER DO:**
- Refatorar `/campaign` ou `/reels` (já estão completos)
- Modificar `generateCampaignContent()` service (já usa mappers)
- Adicionar retry logic ou caching (feature nova, não validação)
- Criar novos endpoints
- Modificar schemas de Stories 2.1-2.5 (exceto bug crítico)

✅ **ALWAYS DO:**
- Apenas adicionar validação em `/strategy`
- Re-usar schemas de 2.1 (CampaignAudience, Objective, Positioning)
- Seguir padrão de error responses de /campaign (400, 500)
- Atualizar EXEC-PLAN-EPIC-2.md (Epic 2 100%)

---

## 📋 3 Code Pattern Examples (Dev Notes)

### Pattern 1: Request Validation (from `/campaign`)

```typescript
// route.ts (início do handler)
import { CampaignStrategyRequestSchema, CampaignStrategyResponseSchema } from "@/lib/domain/campaigns/contracts";

const json = await req.json().catch(() => null);
const body = CampaignStrategyRequestSchema.safeParse(json);

if (body.success === false) {
  return NextResponse.json(
    { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() },
    { status: 400 }
  );
}

// body.data agora é tipado e validado
const { product } = body.data;
```

### Pattern 2: AI Response Validation

```typescript
// route.ts (após receber resposta da IA)
const content = ai.choices[0].message.content || "{}";
const parsed = JSON.parse(content);
const validated = CampaignStrategyResponseSchema.safeParse(parsed);

if (validated.success === false) {
  console.error("[strategy] AI returned invalid data:", validated.error);
  return NextResponse.json(
    { ok: false, requestId, error: "AI_INVALID_OUTPUT", details: validated.error.flatten() },
    { status: 500 }
  );
}

// validated.data agora é tipado e validado
return NextResponse.json({
  ok: true,
  requestId,
  suggestion: validated.data,
});
```

### Pattern 3: Schema Re-use (contracts.ts)

```typescript
// contracts.ts
import { 
  CampaignAudienceSchema, 
  CampaignObjectiveSchema, 
  ProductPositioningSchema 
} from "./schemas";
import { ContentTypeSchema } from "./types";

export const CampaignStrategyRequestSchema = z.object({
  product: z.object({
    type: ContentTypeSchema, // Re-usa de types.ts
    productName: z.string().min(1, "Nome do produto é obrigatório"),
    description: z.string().optional(),
    price: z.string().optional(),
  }),
});

export const CampaignStrategyResponseSchema = z.object({
  audience: CampaignAudienceSchema, // Re-usa de schemas.ts
  objective: CampaignObjectiveSchema, // Re-usa de schemas.ts
  productPositioning: ProductPositioningSchema, // Re-usa de schemas.ts
  reasoning: z.string().min(10, "Reasoning deve ter no mínimo 10 caracteres"),
});

export type CampaignStrategyRequest = z.infer<typeof CampaignStrategyRequestSchema>;
export type CampaignStrategyResponse = z.infer<typeof CampaignStrategyResponseSchema>;
```

---

## 🎯 Success Metrics

**Quality Gates:**
- ✅ Discovery executado (4 steps, tabela 3 endpoints criada)
- ✅ Cross-Story Decisions (≥3 referências a 2.1-2.5)
- ✅ AC em Gherkin (5 cenários: schemas, request, AI, consistency, Epic)
- ✅ Risks listados (3-4 risks com severidade + mitigations)
- ✅ DoD completo (12-15 items, incluindo 3+ manual tests)
- ✅ Dev Notes com 3 code examples (copy-paste ready)
- ✅ File List com 3-4 arquivos (contracts, route, tests opcional, EXEC-PLAN)

**Timeline:**
- Estimated: 4-5h (HIGH RISK integration story)
- Discovery: 30-45min (read 3 files, create tabela)
- AC: 45-60min (5 Gherkin scenarios)
- DoD: 30min (12-15 items + manual tests)
- Dev Notes: 30min (3 code examples)

**Next Steps:**
1. @sm executes `sm-story-2.6.prompt.md`
2. Creates `docs/stories/2.6.story.md`
3. Reports to @po for validation (target ≥7/10)
4. @po validates → @dev implements → @qa validates → @devops pushes
5. Epic 2 COMPLETE 🎉 (6/6 stories)

---

## 🎨 Unique Features (vs Stories 2.1-2.5)

### Unique to Story 2.6 @sm Package:

| Feature | Stories 2.1-2.5 | Story 2.6 |
|---------|----------------|-----------|
| Discovery table (3 endpoints) | ❌ | ✅ (2 completos, 1 target) |
| OUT OF SCOPE explícito | ❌ | ✅ (prevent scope creep) |
| 3+ manual tests obrigatórios | ❌ | ✅ (HIGH RISK production endpoint) |
| Epic 2 completion | ❌ | ✅ (EXEC-PLAN update obrigatório) |
| Code pattern examples | ✅ (Story 2.4) | ✅ (3 patterns: request, AI, schema re-use) |

### Shared with Story 2.4 (HIGH RISK):

| Feature | Story 2.4 | Story 2.6 |
|---------|-----------|-----------|
| HIGH RISK classification | ✅ | ✅ |
| Token count ~3800-3900 | ✅ (~3900) | ✅ (~3800) |
| Manual tests requirement | ✅ (implicit) | ✅ (explicit 3+) |
| Code pattern examples | ✅ (6 etapas) | ✅ (3 patterns) |

---

## 📊 Token Economy Comparison

| Story | Risk | Token Count | Key Feature |
|-------|------|-------------|-------------|
| 2.1 @sm | LOW | ~2400 | Schema creation (foundation) |
| 2.2 @sm | MEDIUM | ~2800 | Type consolidation |
| 2.3 @sm | MEDIUM | ~2700 | API contracts |
| 2.4 @sm | HIGH | ~3900 | Mapper refactoring (error handling) |
| 2.5 @sm | MEDIUM | ~2850 | Selector consolidation (conflict resolution) |
| 2.6 @sm | HIGH | **~3800** | **Integration (endpoint validation + Epic closure)** |

**Why ~3800 tokens (similar to Story 2.4)?**
- HIGH RISK story (production endpoint)
- Discovery obrigatório (4 steps + tabela 3 endpoints)
- 3+ manual tests requirement (explicit)
- OUT OF SCOPE explícito (prevent scope creep)
- Epic 2 completion (EXEC-PLAN update)
- 3 code pattern examples (request, AI, schema re-use)

**Efficiency vs Story 2.4:**
- -3% token count (-100 tokens)
- Similar complexity (integration vs refactoring)
- Different focus (endpoint validation vs mapper safety)

---

## 🔗 Epic 2 Progress After Story 2.6

**Current State:**
- Story 2.1 ✅ Done (schemas.test.ts 12/12 passing)
- Story 2.2 ✅ Done (types.test.ts passing)
- Story 2.3 ✅ Done (contracts.test.ts passing)
- Story 2.4 ✅ Done (mapper.test.ts 15/15 passing)
- Story 2.5 ✅ Done (selectors.test.ts 40/40 passing)
- Story 2.6 🟡 **Ready for @sm** (prompt package complete)

**After Story 2.6 completion:**
- Epic 2 progress: 83% → **100%** 🎉 (6/6 stories)
- Arquitetura ativa em 3 endpoints: `/campaign`, `/reels`, `/strategy`
- EXEC-PLAN-EPIC-2.md updated: Epic 2 COMPLETE
- Next: Epic 3 (TBD)

---

## 🚀 Execution Command

Copy `sm-story-2.6.prompt.md` and send to @sm:

```
Execute Story 2.6 drafting following the 6-step CoT workflow.
Requirements: docs/stories/prompts/sm-story-2.6.prompt.md
Output: docs/stories/2.6.story.md
```

**Model:** Claude Sonnet 4.6 (1x) — HIGH RISK integration story

---

**END OF PACKAGE SUMMARY**
