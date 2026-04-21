# @dev Package Summary — Story 2.5 (Consolidação de Selectors)

**Story:** 2.5 — Consolidação de Selectors  
**Epic:** Epic 2 — Arquitetura de Campanhas  
**Status:** ✅ Ready for @dev execution (@po validated 10/10)  
**Package Created:** 2026-04-20  
**Package Type:** @dev Implementation Package (MEDIUM RISK refactoring)

---

## 📦 Package Deliverables

✅ **dev-story-2.5.prompt.md** (~3000 tokens)
- 7-step progressive workflow with conflict resolution
- Critical requirements from @po (5 conflicts, 2 risk alerts)
- Caller inspection step (Etapa 3) — inspect 4 callers
- Equivalence testing step (Etapa 5) — prove algorithms equivalent
- BEFORE/AFTER code for each conflict
- Re-export pattern (100% re-exports in logic.ts)

✅ **dev-story-2.5.testing-strategy.md** (~900 tokens)
- 6 test suites, 25+ test cases
- Equivalence tests (calculateGlobalStatus === getGlobalStatus)
- Caller validation (getCampaignDisplayStatuses)
- CAMPAIGN_FIXTURE (35+ campos) + EMPTY_CAMPAIGN_FIXTURE

✅ **dev-story-2.5.analysis.md** (~700 tokens)
- 7 design decisions
- Token economy (~4600 total, -6% vs Story 2.4)
- Risk coverage (2 HIGH risks mitigated)

✅ **README-story-2.5.md** (updated)
- Added @dev package section
- Updated Gate 3 (READY)
- Total package documentation

---

## 🚀 @dev Workflow (7 Etapas)

```
┌─────────────────────────────────────────────────────────────┐
│ Etapa 1: Migrate 7 Functions to selectors.ts               │
│   Input: logic.ts functions                                 │
│   Output: 7 functions added to selectors.ts with JSDoc      │
│   Checkpoint 1: npm run typecheck                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Etapa 2: Resolve Conflict #1 (hasAnyVisualAsset)           │
│   Action: Add hasGeneratedVisualAsset(), preserve original  │
│   Distinction: CAMPO (new) vs STATUS (original)             │
│   Checkpoint 2: npm run typecheck                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Etapa 3: Resolve Conflict #2 (getCampaignDisplayStatuses)  │
│   🔴 CRITICAL: Inspect 4 callers                            │
│   Files: CampaignCard.tsx, CampaignEditForm.tsx, etc.       │
│   Decision: Duplicata (re-export) OR Divergência (keep both)│
│   Checkpoint 3: npm run typecheck + document decision       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Etapa 4: Resolve Conflict #3 (getCampaignStrategyLabel)    │
│   Action: Create alias re-export in logic.ts                │
│   Pattern: export { getStrategicLabel as ... }              │
│   Checkpoint 4: npm run typecheck                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Etapa 5: Resolve Conflict #4 (calculateGlobalStatus)       │
│   🔴 CRITICAL: Write equivalence tests                      │
│   Inputs: (ready, approved), (draft, ready), (none, none)   │
│   Assertion: calculateGlobalStatus === getGlobalStatus      │
│   Checkpoint 5: npm run typecheck + vitest -t "equivalence" │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Etapa 6: Convert logic.ts to 100% Re-exports               │
│   Action: Remove ALL implementations, keep re-exports only   │
│   Pattern: /** @deprecated */ export { ... } from './sel'   │
│   Checkpoint 6: npm run typecheck                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Etapa 7: Create selectors.test.ts                          │
│   Fixtures: CAMPAIGN_FIXTURE (35+ campos) + EMPTY_FIXTURE   │
│   Tests: 25+ tests (migration, conflicts, equivalence, etc.)│
│   Checkpoint 7 FINAL: npm test + typecheck                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔴 Critical Requirements (@po Analysis)

### 5 Conflicts MUST Be Resolved

| Conflict | Resolution | Action Required |
|----------|-----------|-----------------|
| **#1 hasAnyVisualAsset()** | Both kept with different names | Add hasGeneratedVisualAsset (CAMPO), preserve hasAnyVisualAsset (STATUS) |
| **#2 getCampaignDisplayStatuses()** | 🔴 Inspect callers | Inspect 4 callers to confirm labels ("Rascunho" vs "Aguardando aprovação") |
| **#3 getCampaignStrategyLabel** | Alias in logic.ts | export { getStrategicLabel as getCampaignStrategyLabel } from './selectors' |
| **#4 calculateGlobalStatus()** | 🔴 Equivalence tests | Write tests proving calculateGlobalStatus === getGlobalStatus (5+ inputs) |
| **#5 DisplayBadge interface** | Simple re-export | export type { DisplayBadge } from './selectors' |

---

### 2 Risk Alerts from @po

**🔴 ALTO #1: Label Divergence (getCampaignDisplayStatuses)**
- **Issue:** logic.ts and selectors.ts MAY have different labels
- **Mitigation:** Etapa 3 — Inspect 4 callers before assuming duplicata
- **Files to inspect:**
  - `app/dashboard/campaigns/[id]/page.tsx`
  - `components/campaigns/CampaignCard.tsx`
  - `components/campaigns/CampaignEditForm.tsx`
  - `components/campaigns/CampaignPreviewClient.tsx`
- **Decision logic:**
  ```
  IF implementations are IDENTICAL:
    → Keep selectors.ts version, re-export in logic.ts
  ELSE IF labels differ:
    → Check which labels are rendered in callers
    → Keep implementation matching rendered labels
  ```

**🔴 ALTO #2: Algorithm Equivalence (calculateGlobalStatus)**
- **Issue:** calculateGlobalStatus (scores/min) vs getGlobalStatus (includes) may not be equivalent
- **Mitigation:** Etapa 5 — Write equivalence tests before deprecating
- **Test inputs required:**
  - (post_status="ready", reels_status="approved")
  - (post_status="ready", reels_status="ready")
  - (post_status="draft", reels_status="ready")
  - (post_status="none", reels_status="none")
  - (post_status="ready", reels_status="draft")
- **Assertion:** `calculateGlobalStatus(c) === getGlobalStatus(c)` for ALL inputs
- **If test fails:** DO NOT deprecate — keep both with clear JSDoc distinction

---

## 📋 Testing Coverage (6 Suites, 25+ Tests)

### Suite 1: Funções Migradas (8 tests)
- hasGeneratedArt (happy path, edge case, partial fields)
- hasGeneratedCampaignContent
- hasGeneratedVideo
- getCampaignListStatus
- getCampaignStatusLine
- getContentState

### Suite 2: Conflict #1 Resolution (4 tests)
- hasGeneratedVisualAsset verifica CAMPOS
- hasAnyVisualAsset verifica STATUS
- Divergência clara (campo presente, status "none")
- Ambas true simultaneamente

### Suite 3: Conflict #4 Equivalence (6 tests)
- 5 input combinations (approved+approved, ready+ready, etc.)
- Equivalence assertion (calculateGlobalStatus === getGlobalStatus)

### Suite 4: Backward Compatibility (4 tests)
- Re-export hasGeneratedArt from logic.ts
- Re-export alias getCampaignStrategyLabel
- Re-export calculateGlobalStatus
- JSDoc @deprecated presente

### Suite 5: Caller Validation (4 manual inspections)
- CampaignCard.tsx label usage
- CampaignEditForm.tsx label usage
- CampaignPreviewClient.tsx label usage
- [id]/page.tsx label usage

### Suite 6: Edge Cases (3 tests)
- hasGeneratedArt with null fields
- hasGeneratedCampaignContent empty
- getContentState with status "none"

---

## 🎯 Success Metrics

**Quality Gates:**
- ✅ All 7 checkpoints pass (typecheck after each etapa)
- ✅ Caller inspection completed (decision documented in commit message)
- ✅ Equivalence tests pass (calculateGlobalStatus === getGlobalStatus)
- ✅ 25+ tests passing
- ✅ Zero breaking changes (logic.ts re-exports work)
- ✅ DoD complete (14 items checked)

**Timeline:**
- Estimated: 2-3h (7 etapas × 15-25min each)
- Etapa 3 (caller inspection): +15min (grep + read 4 files)
- Etapa 5 (equivalence tests): +20min (write 5+ test cases)

**Next Steps:**
1. @dev executes `dev-story-2.5.prompt.md`
2. Interactive mode (educational checkpoints)
3. Report to @qa after completion
4. @devops pushes after @qa approval

---

## 🎨 Unique Features (vs Stories 2.2/2.3/2.4)

### Unique to Story 2.5 @dev Package:

| Feature | Story 2.2 | Story 2.3 | Story 2.4 | Story 2.5 |
|---------|-----------|-----------|-----------|-----------|
| Caller inspection step | ❌ | ❌ | ❌ | ✅ (Etapa 3) |
| Equivalence testing | ❌ | ❌ | ❌ | ✅ (Etapa 5) |
| 100% re-export pattern | ❌ | ❌ | ❌ | ✅ (logic.ts) |
| Conflict resolution (5 conflicts) | ❌ | ❌ | ❌ | ✅ |
| Risk alerts from @po | ❌ | ❌ | ❌ | ✅ (2 HIGH) |
| EMPTY_CAMPAIGN_FIXTURE | ❌ | ❌ | ❌ | ✅ (edge cases) |

### Shared with Story 2.4:

| Feature | Story 2.4 | Story 2.5 |
|---------|-----------|-----------|
| Progressive etapas workflow | ✅ (6 etapas) | ✅ (7 etapas) |
| Interactive mode | ✅ | ✅ |
| Checkpoints after each etapa | ✅ | ✅ |
| BEFORE/AFTER code examples | ✅ (mappers) | ✅ (conflicts) |
| Token count HIGH | ✅ (~4880) | ✅ (~4600) |

---

## 📊 Token Economy Comparison

| Story | Risk | Token Count | Key Feature |
|-------|------|-------------|-------------|
| 2.2 @dev | MEDIUM | ~2400 | Type creation (LOW complexity) |
| 2.3 @dev | MEDIUM | ~1900 | API contracts (discriminated unions) |
| 2.4 @dev | HIGH | ~4880 | Mappers refactoring (error handling) |
| 2.5 @dev | MEDIUM | **~4600** | **Selector consolidation (5 conflicts + caller inspection)** |

**Why ~4600 tokens (similar to Story 2.4 HIGH RISK)?**
- 5 conflicts to resolve (each needs guidance)
- 2 HIGH risk alerts (caller inspection + equivalence tests)
- 7-step workflow (not 6)
- CAMPAIGN_FIXTURE (35+ campos, not 20+)
- Caller inspection instructions (grep + read + decision logic)
- Equivalence test pattern (5+ inputs with assertions)

**Efficiency vs Story 2.4:**
- -6% token count (-280 tokens)
- Similar complexity (conflicts vs error strategies)
- Different focus (consolidation vs refactoring)

---

## 🔗 Epic 2 Progress After Story 2.5

**Current State:**
- Story 2.1 ✅ Done (schemas.test.ts 12/12 passing)
- Story 2.2 ✅ Done (types.test.ts passing)
- Story 2.3 ✅ Done (contracts.test.ts passing)
- Story 2.4 ✅ Done (mapper.test.ts 15/15 passing)
- Story 2.5 🟡 **Ready for @dev** (@po validated 10/10, @dev package complete)
- Story 2.6 🟡 Blocked (awaits Story 2.5 completion)

**After Story 2.5 completion:**
- Epic 2 progress: 67% → 83% (5/6 stories)
- Remaining: Story 2.6 (Integration — API + Service layer)

---

## 🚀 Execution Command

Copy `dev-story-2.5.prompt.md` and send to @dev:

```
Execute Story 2.5 implementation following the 7-etapa workflow.
Requirements: docs/stories/prompts/dev-story-2.5.prompt.md
Mode: INTERACTIVE (educational checkpoints)
Output: selectors.ts (16+ funções), logic.ts (100% re-exports), selectors.test.ts (25+ tests)
```

**Model:** Claude Sonnet 4.6 (1x) — MEDIUM RISK refactoring com conflict resolution

---

**END OF PACKAGE SUMMARY**
