# @dev Package Summary — Story 2.6 (Integration API Routes)

**Story:** 2.6 — Integration API Routes (FINAL STORY of Epic 2)  
**Epic:** Epic 2 — Arquitetura de Campanhas  
**Status:** ✅ Ready for @dev implementation  
**Package Created:** 2026-04-20  
**Package Type:** @dev Implementation Package (HIGH RISK production endpoint + Epic closure)  
**@po Validation Score:** 10/10 (perfect score)

---

## 📦 Package Deliverables

✅ **dev-story-2.6.prompt.md** (~4800 tokens)
- Analysis (6 design decisions)
- System Prompt (Context, Requirements, 3 Surgical Changes, 6-step implementation guide)
- Validation Checklist (11 items before commit)
- Instructions (9 step-by-step actions)
- Anti-patterns (6 NEVER, 6 ALWAYS)
- Risk Mitigation (4 risks from @po validation)
- Expected commit message

✅ **dev-story-2.6.testing-strategy.md** (~1400 tokens)
- 7 test suites (32 test cases: 30 automated + 2 manual)
- Critical Test T2.2: "reconhecimento" must REJECT (no preprocessing)
- Manual test commands (POST válido, inválido)
- Regression prevention tests
- Validation commands (typecheck, tests, EXEC-PLAN)

✅ **dev-story-2.6.analysis.md** (~900 tokens)
- 6 design decisions (3 surgical changes, z.preprocess trap, manual tests, Epic closure)
- Token economy (~8300 total, +6% vs Story 2.4)
- Cross-story dependencies (Stories 2.1-2.5)
- Risk coverage (4 risks with mitigation)
- CodeRabbit self-healing expectations (max 2 iterations)

✅ **dev-story-2.6.package-summary.md** (this file)
- Package overview and 3 surgical changes table
- Quick reference (copy-paste commands)
- Epic 2 progress (83% → 100%)
- z.preprocess trap explanation

---

## 🎯 @dev Workflow (3 Surgical Changes)

```
┌─────────────────────────────────────────────────────────────┐
│ Change #1: Export Schemas (schemas.ts)                     │
│   Add export to 3 schemas + 2 value arrays                 │
│   ZERO logic changes (z.preprocess stays)                  │
│   Time: 15min                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Change #2: Tighten Validation (contracts.ts)               │
│   Replace StrategySuggestionSchema                         │
│   Create StrategyAIOutputSchema (z.enum direct, NO preprocess) │
│   Time: 30min                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Change #3: Activate Endpoint (strategy/route.ts)           │
│   Add safeParse() for request (400)                        │
│   Add safeParse() for AI response (500)                    │
│   Add requestId to all error responses                     │
│   Time: 45min                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Create Tests (contracts.test.ts)                           │
│   Test StrategyAIOutputSchema with valid data              │
│   CRITICAL: Test "reconhecimento" REJECTS (no preprocess)  │
│   Time: 30-45min                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Execute Manual Tests (DoD Items 13-14)                     │
│   Test 1: POST válido → 200 (frontend payload)            │
│   Test 2: POST inválido → 400 with details                │
│   Time: 30min                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Update EXEC-PLAN (DoD Item 15)                             │
│   Mark Story 2.6 DONE                                       │
│   Epic 2 Status: 🎉 100% Complete (6/6 stories)           │
│   Time: 15min                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Commit + Report to @qa                                     │
│   Commit: feat: activate validation in strategy endpoint   │
│   Report to @qa for QA Gate validation                     │
│   Time: 15min                                               │
└─────────────────────────────────────────────────────────────┘
```

**Total Time:** 3-4h (HIGH RISK implementation + manual tests + Epic closure)

---

## 🔴 3 Surgical Changes (MUST follow exactly)

| Change | File | Action | Critical Note |
|--------|------|--------|---------------|
| **1. Export schemas** | `lib/domain/campaigns/schemas.ts` | Add `export` to CampaignAudienceSchema, CampaignObjectiveSchema, ProductPositioningSchema, AUDIENCE_VALUES, POSITIONING_VALUES | 🟢 ZERO logic changes — only API expansion |
| **2. Tighten validation** | `lib/domain/campaigns/contracts.ts` | Replace `StrategySuggestionSchema` with `StrategyAIOutputSchema` using `z.enum()` direct (NO preprocess) | 🔴 Must NOT use CampaignObjectiveSchema (has preprocess) |
| **3. Activate endpoint** | `app/api/generate/campaign/strategy/route.ts` | Add safeParse() for request (400) + AI response (500) + requestId in all errors | 🔴 Manual test with frontend payload MANDATORY |

---

## 🔴 z.preprocess Trap (CRITICAL DISTINCTION)

### Why This Matters

**CampaignObjectiveSchema** (user input normalization):
```typescript
// For USER INPUT — normalizes "reconhecimento" → "awareness"
export const CampaignObjectiveSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      const normalized = OBJECTIVE_NORMALIZATION_MAP[val.toLowerCase()];
      return normalized || val;
    }
    return val;
  },
  z.enum(OBJECTIVE_VALUES)
);
```

**StrategyAIOutputSchema** (AI output validation):
```typescript
// For AI OUTPUT — must return exact enum values (NO preprocessing)
export const StrategyAIOutputSchema = z.object({
  audience: z.enum(AUDIENCE_VALUES),
  objective: z.enum(OBJECTIVE_VALUES), // Direct enum — NO preprocess
  productPositioning: z.enum(POSITIONING_VALUES),
  reasoning: z.string().min(10),
});
```

### Critical Test

**contracts.test.ts MUST include:**
```typescript
// ❌ This should REJECT (not normalize)
it("rejects invalid objective from AI (no preprocessing)", () => {
  const invalid = {
    audience: "young_adults",
    objective: "reconhecimento", // ❌ Invalid — AI must return "awareness"
    productPositioning: "premium",
    reasoning: "Valid reasoning text",
  };
  const result = StrategyAIOutputSchema.safeParse(invalid);
  expect(result.success).toBe(false); // ✅ Must REJECT
});
```

---

## 📋 Quick Reference — Copy-Paste Commands

### Change #1: Export Schemas (schemas.ts)

```typescript
// Add export before these 3 schemas
export const CampaignAudienceSchema = z.enum(AUDIENCE_VALUES);
export const CampaignObjectiveSchema = z.preprocess(...); // Keep preprocess!
export const ProductPositioningSchema = z.enum(POSITIONING_VALUES);

// Add export before these 2 value arrays
export const AUDIENCE_VALUES = [...] as const;
export const POSITIONING_VALUES = [...] as const;
```

### Change #2: Tighten Validation (contracts.ts)

```typescript
// IMPORT direct values (NO preprocess schema)
import { 
  AUDIENCE_VALUES, 
  OBJECTIVE_VALUES, 
  POSITIONING_VALUES 
} from "./schemas";

// REPLACE StrategySuggestionSchema with StrategyAIOutputSchema
export const StrategyAIOutputSchema = z.object({
  audience: z.enum(AUDIENCE_VALUES),
  objective: z.enum(OBJECTIVE_VALUES), // Direct enum — NO preprocess
  productPositioning: z.enum(POSITIONING_VALUES),
  reasoning: z.string().min(10, "Reasoning deve ter no mínimo 10 caracteres"),
});

export type StrategyAIOutput = z.infer<typeof StrategyAIOutputSchema>;
```

### Change #3: Activate Endpoint (route.ts)

```typescript
import { 
  CampaignStrategyRequestSchema, 
  StrategyAIOutputSchema 
} from "@/lib/domain/campaigns/contracts";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  // Validate REQUEST
  const json = await req.json().catch(() => null);
  const body = CampaignStrategyRequestSchema.safeParse(json);
  if (body.success === false) {
    return NextResponse.json(
      { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() },
      { status: 400 }
    );
  }

  // Call AI (existing logic)
  const ai = await openai.chat.completions.create({...});

  // Validate AI RESPONSE
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

  return NextResponse.json({
    ok: true,
    requestId,
    suggestion: validated.data,
  });
}
```

---

## 🧪 Testing Commands

```bash
# Typecheck (should pass after all 3 changes)
npx tsc --noEmit

# Unit tests — contracts.test.ts (including CRITICAL T2.2)
npx vitest run lib/domain/campaigns/contracts.test.ts

# All domain tests (regression check)
npx vitest run lib/domain/campaigns/

# Manual Test 1: POST válido → 200
curl -X POST http://localhost:3000/api/generate/campaign/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "type": "product",
      "productName": "Notebook Dell Inspiron",
      "description": "Notebook com processador Intel i5",
      "price": "R$ 3.500,00"
    }
  }'
# Expected: { ok: true, requestId: "...", suggestion: {...} }

# Manual Test 2: POST inválido → 400
curl -X POST http://localhost:3000/api/generate/campaign/strategy \
  -H "Content-Type: application/json" \
  -d '{"product":{"type":"invalid","productName":""}}'
# Expected: { ok: false, requestId: "...", error: "INVALID_INPUT", details: {...} }

# Verify EXEC-PLAN updated (Epic 2 100%)
grep "100% Complete" docs/EXEC-PLAN-EPIC-2.md
```

---

## 📊 Metrics Summary

### Package Totals
| Component | Tokens | Status |
|-----------|--------|--------|
| Main Prompt | ~4800 | ✅ Ready |
| Testing Strategy | ~1400 | ✅ Ready |
| Analysis | ~900 | ✅ Ready |
| Package Summary | ~1200 | ✅ Ready |
| **TOTAL @dev Package** | **~8300** | ✅ Ready |

**Token Comparison:**
- Story 2.2 (MEDIUM): ~5200 tokens
- Story 2.3 (MEDIUM): ~5800 tokens
- Story 2.4 (HIGH): ~7800 tokens
- Story 2.5 (HIGH): ~6900 tokens
- Story 2.6 (HIGH): **~8300 tokens** (+6% vs Story 2.4, highest in Epic 2)

**Why ~8300 tokens?**
- HIGH RISK production endpoint (manual tests mandatory)
- z.preprocess trap (extensive explanation required)
- Epic 2 closure (EXEC-PLAN update + architecture documentation)
- 32 test cases (30 automated + 2 manual)

---

## ✅ Quality Gates

### Gate 1: Implementation (3 Surgical Changes)
- 🔴 **READY FOR EXECUTION** — Execute `dev-story-2.6.prompt.md`
- Success criteria:
  - schemas.ts: 3 schemas exported (zero logic changes)
  - contracts.ts: StrategyAIOutputSchema with z.enum direct
  - route.ts: safeParse for request + AI response
- Validation: Typecheck passes, tests pass

### Gate 2: Manual Tests (DoD Items 13-14)
- 🔴 **MANDATORY BEFORE COMMIT**
- Test 1: POST válido → 200 (frontend payload format)
- Test 2: POST inválido → 400 with details
- Documentation: Results in commit message or story file

### Gate 3: Epic Closure (DoD Item 15)
- 🔴 **MANDATORY FOR STORY COMPLETION**
- EXEC-PLAN-EPIC-2.md updated
- Story 2.6 marked DONE
- Epic 2 Status: 🎉 100% Complete (6/6 stories)
- Architecture documented (3 endpoints)

### Gate 4: @qa QA Gate
- 🟡 **PENDING** — Awaits implementation completion
- Focus areas:
  - Manual tests executed? (DoD items 13-14)
  - EXEC-PLAN updated? (Epic 2 100%)
  - Zero breaking changes in /campaign and /reels?
  - z.preprocess preserved for user input?

---

## 🎯 Story 2.6 Objectives (from @po validation)

### Problem Statement
- **Gap identified:** Contracts exist (Story 2.3) but /strategy doesn't use them
- **Current state:** /strategy apenas `req.json()` e `JSON.parse()` (no validation)
- **Issues:**
  - ❌ Sem validação de request (qualquer JSON aceito)
  - ❌ Sem validação de AI response (pode retornar enums inválidos)
  - ❌ Error responses não seguem padrão (400/500)

### Solution (3 Surgical Changes)
- **Export schemas:** API expansion para contracts.ts
- **Tighten validation:** StrategyAIOutputSchema com z.enum direct (NO preprocess)
- **Activate endpoint:** safeParse para request (400) + AI response (500)

### Epic 2 Completion
- **Before:** 5/6 stories (83%), arquitetura em 2 endpoints (/campaign, /reels)
- **After:** 6/6 stories (100%), arquitetura em 3 endpoints (/campaign, /reels, /strategy)
- **Mission accomplished:** "Implement contracts & domain architecture to prevent bugs"

---

## 🔗 Files Affected

| File | Action | LOC Change | Critical Note |
|------|--------|------------|---------------|
| `lib/domain/campaigns/schemas.ts` | **UPDATE** | +5 exports | Add export keyword (zero logic changes) |
| `lib/domain/campaigns/contracts.ts` | **UPDATE** | +15 lines | Replace StrategySuggestionSchema, add StrategyAIOutputSchema |
| `app/api/generate/campaign/strategy/route.ts` | **UPDATE** | +30 lines | Add safeParse validations (request + AI) |
| `lib/domain/campaigns/contracts.test.ts` | **CREATE** | +50 lines | Unit tests including CRITICAL T2.2 ("reconhecimento" rejects) |
| `docs/EXEC-PLAN-EPIC-2.md` | **UPDATE** | +5 lines | Mark Story 2.6 DONE, Epic 2 100% complete |
| `docs/stories/2.6.story.md` | **UPDATE** | Checkboxes | Mark progress (InProgress → InReview → Done) |

**Total:** 6 files (~100 LOC added)

---

## 🚀 Execution Command

Copy `dev-story-2.6.prompt.md` and execute:

```
Implement Story 2.6 following 3 surgical changes workflow.
Requirements: docs/stories/prompts/dev-story-2.6.prompt.md
Mode: Interactive (educational checkpoints for production endpoint)
Timeline: 3-4h
```

**Model:** Claude Sonnet 4.6 (1x) — HIGH RISK production endpoint + z.preprocess trap

---

## 🎨 Unique Features (vs Stories 2.1-2.5)

### Unique to Story 2.6:

| Feature | Stories 2.1-2.5 | Story 2.6 |
|---------|----------------|-----------|
| 3 surgical changes table | ❌ | ✅ (export → validation → activation) |
| z.preprocess trap explanation | ❌ | ✅ (CRITICAL — user input vs AI output) |
| 2 mandatory manual tests | ❌ (implicit) | ✅ (EXPLICIT — DoD items 13-14) |
| Epic closure | ❌ | ✅ (EXEC-PLAN update mandatory) |
| Production endpoint safety | ❌ | ✅ (frontend payload testing) |

### Shared with Story 2.4 (HIGH RISK):

| Feature | Story 2.4 | Story 2.6 |
|---------|-----------|-----------|
| HIGH RISK classification | ✅ | ✅ |
| Token count ~7800-8300 | ✅ (~7800) | ✅ (~8300) |
| Manual tests requirement | ✅ (implicit) | ✅ (explicit 2 mandatory) |
| CodeRabbit max 2 iterations | ✅ | ✅ |

---

## 🎉 Epic 2 Progress After Story 2.6

**Current State (Before Implementation):**
- Epic 2: 83% complete (5/6 stories)
- Architecture: Active in 2 endpoints (/campaign, /reels)
- /strategy: No validation (gap to close)

**After Story 2.6 Implementation:**
- Epic 2: **100% complete** 🎉 (6/6 stories)
- Architecture: Active in **3 endpoints** (/campaign, /reels, /strategy)
- End-to-end validation: Request → AI → Response (all endpoints)
- Epic 2 mission: **ACCOMPLISHED** ✅

**Next:**
- Epic 3 (TBD): Visual Composition Engine or Weekly Plan intelligence
- Foundation ready: Domain architecture validated in production

---

## 📝 Expected Commit Message

```
feat: activate validation in strategy endpoint [Story 2.6]

Story 2.6 completion — Integration API Routes (FINAL STORY Epic 2):

3 surgical changes:
- schemas.ts: Export 3 schemas + 2 value arrays (API expansion only)
- contracts.ts: Replace StrategySuggestionSchema with StrategyAIOutputSchema 
  (z.enum direct, NO preprocess for AI output validation)
- strategy/route.ts: Activate request (400) + AI response (500) validation

Manual tests executed:
- POST /strategy with valid payload → 200 ✅
- POST /strategy with invalid payload → 400 with details ✅

Epic 2 Status: 🎉 100% Complete (6/6 stories)
Architecture active in 3 production endpoints:
- /api/generate/campaign (full architecture)
- /api/generate/reels (full architecture)
- /api/generate/campaign/strategy (full architecture) ← NEW

[Story 2.6]
```

---

**Package delivery: COMPLETE** ✅  
**Ready for @dev execution** 🚀

---

**END OF PACKAGE SUMMARY**
