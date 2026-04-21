# Story 2.4 @dev Prompt — Package Summary

**Created:** 2026-04-20  
**Status:** ✅ Ready for @dev execution  
**Story Validation:** ✅ 10/10 by @po (perfect score)

---

## 📦 Package Deliverables

### 1. Main Prompt
**File:** `dev-story-2.4.prompt.md`  
**Size:** ~3200 tokens (+103% vs Story 2.3)  
**Structure:** THE PROMPT LOOP (Analysis → System Prompt → Testing Strategy)

**Key Sections:**
- **Context:** Story 2.4, Epic 2, HIGH RISK refactoring
- **Critical Requirements:** Error handling strategy table (THROW vs FALLBACK), zero breaking changes
- **Implementation Plan:** 6 etapas + 6 checkpoints (progressive refactoring)
- **BEFORE/AFTER Code:** Complete code examples for all 5 functions
- **Validation Checklist:** 13-point DoD (copy from Story 2.4)
- **Instructions:** Sequential workflow (Etapa 1 → Checkpoint 1 → Etapa 2...)
- **Anti-patterns:** What NOT to do (YOLO mode, batch refactoring, wrong error strategies)
- **Error Recovery:** Common errors + fixes

### 2. Testing Strategy
**File:** `dev-story-2.4.testing-strategy.md`  
**Size:** ~980 tokens  
**Coverage:** 6 test suites, 15+ test cases

**Test Suites:**
- T1: mapDbCampaignToDomain (4 tests — happy path, error, legacy "info", nulls)
- T2: mapDbCampaignToAIContext (3 tests — happy path, fallback, error)
- T3: mapAiArtToPreview (3 tests — valid, invalid, null)
- T4: mapAiReelsToPreview (2 tests — valid, invalid)
- T5: mapAiCampaignToDomain (3 tests — valid, empty, invalid)
- T6: mapDomainToCampaignDb (3 tests — valid, content_type "message", all fields)

### 3. Analysis
**File:** `dev-story-2.4.analysis.md`  
**Size:** ~700 tokens  
**Content:** 7 design decisions + token economy + risk coverage

**Key Decisions:**
1. Progressive Refactoring (6 etapas + checkpoints) — reduces blast radius
2. Error Handling Strategy Differentiation (THROW server, FALLBACK UI)
3. BEFORE/AFTER Code Examples (complete, not snippets) — reduces hallucinations
4. REAL_DB_ROW Fixture (30+ campos) — tests real Supabase data
5. Interactive Mode (educational checkpoints) — @po recommendation
6. Validation Before Returning (mapDomainToCampaignDb) — prevents data corruption
7. Zero Breaking Changes Enforcement — preserves assinaturas

### 4. README Update
**File:** `README-story-2.4.md` (updated)  
**Changes:** Added @dev package section, updated execution flow, metrics, quality gates

---

## 🎯 What @dev Will Do

**Workflow (6 Etapas + 6 Checkpoints):**

```
Etapa 1: mapDbCampaignToDomain() → Checkpoint 1 (typecheck)
Etapa 2: mapDbCampaignToAIContext() → Checkpoint 2 (typecheck)
Etapa 3: mapAi*ToPreview (2 funções) → Checkpoint 3 (typecheck)
Etapa 4: mapAiCampaignToDomain() → Checkpoint 4 (typecheck)
Etapa 5: mapDomainToCampaignDb() → Checkpoint 5 (typecheck)
Etapa 6: mapper.test.ts → Checkpoint 6 FINAL (vitest + typecheck)
```

**Total Time:** 3-4h (6 etapas × 30-40min each)

---

## 🔑 Critical @po Guidance (From Message 8)

### Error Handling Strategy Table

| Function | Strategy | Rationale |
|----------|----------|-----------|
| `mapDbCampaignToDomain()` | **THROW** with useful message | service.ts expects it, callers have try/catch |
| `mapDbCampaignToAIContext()` | **THROW** with useful message | Server-side only, errors should propagate |
| `mapAiArtToPreview()` | **FALLBACK** (no throw) | Client-side UI — degrade gracefully, log error |
| `mapAiReelsToPreview()` | **FALLBACK** (no throw) | Client-side UI — degrade gracefully, log error |

### Risk Alerts

- 🔴 **ALTO:** DbCampaignSchema.safeParse() must accept legacy `content_type: "info"` (verify CampaignReadableContentTypeSchema)
- 🔴 **ALTO:** mapDomainToCampaignDb() output validation required (DbCampaignSchema.partial())

### Implementation Mode

**Interactive** (educational checkpoints for production refactoring) — NOT YOLO

### Validation Sequence

Refactor one function at a time → test after each → checkpoint before next

---

## 📊 Token Economy

| Component | Tokens | Justification |
|-----------|--------|---------------|
| Main Prompt | ~3200 | 6 etapas + BEFORE/AFTER code + fixtures |
| Testing Strategy | ~980 | 6 test suites × ~163 tokens each |
| Analysis | ~700 | 7 design decisions + token economy |
| **TOTAL @dev Package** | **~4880** | HIGH RISK refactoring justifies detail |

**Comparison:**
- Story 2.3 @dev package: ~2400 tokens (MEDIUM RISK creation)
- Story 2.4 @dev package: **~4880 tokens** (+103% increase)
- Justification: HIGH RISK production refactoring + error strategy differentiation + progressive checkpoints

---

## ✅ Success Metrics

**Quality Gates:**
- ✅ All 6 checkpoints pass (typecheck after each etapa)
- ✅ 15+ tests passing (happy path + error cases + fallbacks)
- ✅ Zero breaking changes (assinaturas idênticas)
- ✅ Error messages úteis (não genéricas: `[funcName] Campo inválido: ${path} — ${msg}`)

**Expected Commit:**
```
refactor: add safe error handling to campaign mappers with .safeParse() [Story 2.4]
```

**Next Steps:**
1. @dev executes prompt → implements refactoring + tests
2. @qa validates (7-point QA Gate)
3. @devops pushes to remote (EXCLUSIVE git push authority)

---

## 🚀 Execution Instructions

Copy `dev-story-2.4.prompt.md` and send to @dev:

```
Execute Story 2.4 implementation following the 6-etapa workflow.
Story file: docs/stories/2.4.story.md
Prompt file: docs/stories/prompts/dev-story-2.4.prompt.md
```

**Model:** Claude Sonnet 4.6 (1x) — HIGH RISK refactoring + error handling nuances

---

**END OF PACKAGE SUMMARY**
