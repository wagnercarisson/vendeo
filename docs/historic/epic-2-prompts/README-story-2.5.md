# Story 2.5 — @sm Prompt Engineering Package

**Story:** 2.5 — Consolidação de Selectors  
**Epic:** Epic 2 — Arquitetura de Campanhas  
**Created:** 2026-04-20  
**Status:** Ready for @sm Execution  
**Risk Level:** 🟡 MEDIUM RISK (refactoring com backward compatibility)

---

## 📦 Package Contents

### 1. @sm Prompt (Story Drafting)
**File:** `sm-story-2.5.prompt.md`  
**Purpose:** Criar Story File com discovery obrigatório (grep + read), conflict resolution table, deprecation pattern, testes com fixture completa  
**Target Agent:** @sm (River) — Scrum Master  
**Model:** Claude Sonnet 4.6 (1x)  
**Token Count:** ~1200 tokens (MEDIUM RISK refactoring)  
**Status:** ✅ Ready for execution

**Key Features:**
- **Mandatory Discovery (4 Steps):** grep export + read selectors.ts + read logic.ts + conflict detection
- **Conflict Resolution Table:** 4 conflitos com decisões explícitas (hasAnyVisualAsset, getCampaignDisplayStatuses, etc.)
- **Deprecation Pattern:** Re-exports em logic.ts para backward compatibility (`export { funcName } from './selectors'`)
- **CAMPAIGN_FIXTURE Requirement:** 20+ campos (post_status, reels_status, image_url, ai_caption, reels_script)
- **6-Step CoT:** Discovery → Conflicts → Cross-Story → AC → Risks → DoD
- **Zero Breaking Changes:** Re-exports mantêm imports legados funcionando

**Testing:** `sm-story-2.5.testing-strategy.md` (5 test suites, 20+ tests)  
**Analysis:** `sm-story-2.5.analysis.md` (7 design decisions, token economy, cross-story dependencies)

---

### 2. @dev Prompt (Implementation)
**File:** `dev-story-2.5.prompt.md`  
**Purpose:** Implementar consolidação de selectors com conflict resolution, caller inspection, equivalence tests  
**Target Agent:** @dev (Dex) — Developer  
**Model:** Claude Sonnet 4.6 (1x)  
**Token Count:** ~3000 tokens (MEDIUM RISK refactoring)  
**Status:** ✅ Ready for execution (after @po validation 10/10)

**Key Features:**
- **7-Step Progressive Workflow:** 1 conflict resolution por etapa + checkpoints (reduce risk of breaking multiple conflicts)
- **Conflict Resolution Guidance:** 5 conflicts (hasAnyVisualAsset, getCampaignDisplayStatuses, labels, algorithms, interface) with BEFORE/AFTER code
- **🔴 Caller Inspection Required (Etapa 3):** Inspect 4 callers (CampaignCard.tsx, CampaignEditForm.tsx, CampaignPreviewClient.tsx, [id]/page.tsx) to confirm labels ("Rascunho" vs "Aguardando aprovação") before deprecating
- **🔴 Equivalence Tests Required (Etapa 5):** Write tests proving calculateGlobalStatus === getGlobalStatus (5+ inputs) before deprecating
- **Re-export Pattern Complete:** logic.ts becomes 100% re-exports (zero implementations) — backward compatibility preserved
- **Interactive Mode:** @po recommendation for educational checkpoints on conflict resolution decisions
- **CAMPAIGN_FIXTURE (35+ campos) + EMPTY_CAMPAIGN_FIXTURE:** Complete fixture for happy path + edge cases
- **Zero Breaking Changes:** All imports from `campaigns/logic` continue working via re-exports

**Testing:** `dev-story-2.5.testing-strategy.md` (6 test suites, 25+ tests including equivalence tests and caller validation)  
**Analysis:** `dev-story-2.5.analysis.md` (7 design decisions including caller inspection rationale, equivalence testing strategy)

**@po Validation Result:**
- **Score:** 10/10 ✅ PERFECT
- **Risk Alerts:** 2 HIGH risks identified with mitigation strategies
- **Key Guidance:** Real discovery execution (11 items per file), zero breaking change risk (0 callers of logic.ts confirmed), explicit conflict resolution (5 conflicts documented), algorithm equivalence proof

**Critical Requirements from @po:**
1. **5 Conflicts MUST Be Resolved:**
   - hasAnyVisualAsset() → Both kept with different names (add hasGeneratedVisualAsset, preserve hasAnyVisualAsset)
   - getCampaignDisplayStatuses() → 🔴 Inspect 4 callers to confirm labels
   - getCampaignStrategyLabel vs getStrategicLabel → getStrategicLabel canonical (alias in logic.ts)
   - calculateGlobalStatus vs getGlobalStatus → 🔴 Write equivalence tests before deprecating
   - DisplayBadge interface → selectors.ts canonical (simple re-export)

2. **Risk Alert 🔴 ALTO #1:** Label divergence in getCampaignDisplayStatuses
   - Action: Inspect 4 callers to confirm which labels are actually rendered
   - Decision: If labels differ, preserve logic.ts implementation (NOT a true duplicata)

3. **Risk Alert 🔴 ALTO #2:** Algorithm equivalence
   - Action: Write equivalence tests comparing both functions with inputs: (ready, approved), (none, draft), etc.
   - Goal: Prove equivalence for all valid inputs before deprecating calculateGlobalStatus

**Workflow (7 Etapas):**
1. Migrate 7 functions to selectors.ts with JSDoc
2. Resolve Conflict #1 (hasAnyVisualAsset → add hasGeneratedVisualAsset)
3. Resolve Conflict #2 (getCampaignDisplayStatuses — inspect 4 callers) 🔴
4. Resolve Conflict #3 (getCampaignStrategyLabel alias)
5. Resolve Conflict #4 (calculateGlobalStatus equivalence tests) 🔴
6. Convert logic.ts to 100% re-exports
7. Create selectors.test.ts with fixtures (CAMPAIGN_FIXTURE 35+ campos + EMPTY_CAMPAIGN_FIXTURE)

**Validation Sequence:**
- Migrate 7 functions → Checkpoint 1 (typecheck)
- Resolve conflicts → Checkpoints 2-5 (typecheck after each)
- Convert to re-exports → Checkpoint 6 (typecheck)
- Create tests → Checkpoint 7 FINAL (npm test + typecheck)

**Success Criteria:**
- ✅ All 7 checkpoints pass
- ✅ Caller inspection completed (getCampaignDisplayStatuses decision documented)
- ✅ Equivalence tests pass (calculateGlobalStatus === getGlobalStatus)
- ✅ 25+ tests passing (migration + conflicts + equivalence + backward compat)
- ✅ Zero breaking changes (logic.ts re-exports work)

---

## 📦 @dev Package Contents

### Files Created
1. **dev-story-2.5.prompt.md** (~3000 tokens)
   - 7-step progressive workflow with conflict resolution
   - Critical requirements from @po (5 conflicts, 2 risk alerts)
   - Caller inspection step (Etapa 3)
   - Equivalence testing step (Etapa 5)
   - BEFORE/AFTER code examples for each conflict
   - Re-export pattern complete (100% re-exports)
   - Validation checklist (DoD from story)

2. **dev-story-2.5.testing-strategy.md** (~900 tokens)
   - 6 test suites: Migration, Conflict #1, Equivalence, Backward Compat, Callers, Edge Cases
   - 25+ test cases covering all aspects
   - Caller inspection commands (grep + read)
   - Equivalence test pattern (5+ inputs)
   - CAMPAIGN_FIXTURE (35+ campos) + EMPTY_CAMPAIGN_FIXTURE

3. **dev-story-2.5.analysis.md** (~700 tokens)
   - 7 design decisions (7 steps, caller inspection, equivalence tests, interactive mode, fixtures, re-export pattern, conflict order)
   - Token economy comparison (~4600 tokens, -6% vs Story 2.4)
   - Cross-story dependencies (2.1 schemas, 2.2 types, 2.4 mappers)
   - Risk coverage table (2 HIGH risks mitigated)

### Package Totals
| Component | Tokens | Status |
|-----------|--------|--------|
| Main Prompt | ~3000 | ✅ Ready |
| Testing Strategy | ~900 | ✅ Ready |
| Analysis | ~700 | ✅ Ready |
| **TOTAL @dev Package** | **~4600** | ✅ Ready |

**Token Comparison:**
- Story 2.2 @dev: ~2400 tokens (MEDIUM RISK creation)
- Story 2.3 @dev: ~1900 tokens (MEDIUM RISK creation)
- Story 2.4 @dev: ~4880 tokens (HIGH RISK refactoring)
- Story 2.5 @dev: **~4600 tokens** (MEDIUM RISK refactoring, -6% vs 2.4)

---

## 🎯 Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. @sm Prompt (Story Drafting) ← YOU ARE HERE              │
│    Input: Requirements, discovery obrigatório               │
│    Discovery: grep + read selectors.ts + logic.ts           │
│    Output: docs/stories/2.5.story.md + conflict table       │
│    Validation: 5 test suites (20+ tests)                    │
│    Status: 🟡 READY FOR EXECUTION                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. @po Validation (10-point checklist)                     │
│    Target: GO (≥7/10)                                       │
│    Focus: Discovery executado? Conflict table completa?     │
│    Status: 🟡 PENDING                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. @dev Prompt (Implementation)                            │
│    Input: docs/stories/2.5.story.md                         │
│    Output: selectors.ts (16+ funções), logic.ts (re-exports)│
│    Status: ⚪ NOT CREATED YET                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. @qa QA Gate (7-point checklist)                         │
│    Story Lifecycle: Draft → Ready → InProgress → Done      │
│    Status: 🟡 PENDING (awaits @dev completion)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Metrics Summary

### @sm Prompt Metrics (TARGETS)
| Metric | Target | Status |
|--------|--------|--------|
| Token count | ~1200 | ~1200 ✅ |
| Discovery execution | 4 steps | 🟡 Pending execution |
| Conflict table | 4 conflitos + decisões | 🟡 Pending |
| Cross-Story Decisions | ≥3 entries | 🟡 Pending |
| Funções migradas | 6 funções | 🟡 Pending |
| Re-exports em logic.ts | TODAS as funções | 🟡 Pending |
| CAMPAIGN_FIXTURE | 20+ campos | 🟡 Pending |
| Test suites | 5 suites | 🟡 Pending |

### Package Totals
| Component | Tokens | Status |
|-----------|--------|--------|
| Main Prompt | ~1200 | ✅ Ready |
| Testing Strategy | ~950 | ✅ Ready |
| Analysis | ~700 | ✅ Ready |
| **TOTAL @sm Package** | **~2850** | ✅ Ready |

**Token Comparison:**
- Story 2.2 (MEDIUM): ~2800 tokens
- Story 2.3 (MEDIUM): ~2700 tokens
- Story 2.4 (HIGH): ~3900 tokens
- Story 2.5 (MEDIUM): **~2850 tokens** (consistent with MEDIUM RISK)

---

## 🔍 Quality Gates

### Gate 1: @sm Story Drafting (CURRENT STEP)
- 🟡 **READY FOR EXECUTION** — Execute `sm-story-2.5.prompt.md`
- Success criteria: 5/5 test suites pass (testing-strategy.md)
- Target: ≥7/10 @po score (MEDIUM RISK bar)

### Gate 2: @po Story Validation
- 🟡 **PENDING** — Awaits story creation
- Focus areas:
  - Discovery executado? (Dev Notes lista funções de ambos arquivos)
  - Conflict table completa? (4 conflitos com decisões)
  - Deprecation pattern presente? (Re-exports em logic.ts)
  - CAMPAIGN_FIXTURE completa? (20+ campos)

### Gate 3: @dev Implementation
- ✅ **READY** — @po validated 10/10, @dev package complete
- Expected deliverables:
  - selectors.ts (16+ funções total)
  - logic.ts (deprecated com re-exports)
  - selectors.test.ts (25+ tests)

### Gate 4: @qa QA Gate
- 🟡 **PENDING** — Awaits @dev completion
- Focus areas:
  - Zero duplicatas (mesma função em ambos arquivos)
  - Re-exports funcionam (backward compatibility)
  - Testes passam (20+ tests)
  - Typecheck passa

---

## 🎯 Story 2.5 Objectives

### Problem Statement
- **Current state:** 2 arquivos com funções similares (selectors.ts 10 funções, logic.ts 10 funções)
- **Issues:**
  - 2 duplicatas detectadas (`hasAnyVisualAsset`, `getCampaignDisplayStatuses`)
  - Lógicas divergentes (campos vs status)
  - Confusão sobre qual função usar

### Solution
- **Consolidar:** Migrar 6 funções únicas de logic.ts → selectors.ts
- **Resolver conflitos:** Renomear hasAnyVisualAsset → hasGeneratedVisualAsset
- **Deprecar:** logic.ts com re-exports para backward compatibility
- **Testar:** selectors.test.ts com CAMPAIGN_FIXTURE completa (20+ campos)

---

## 🔑 Key Conflicts to Resolve

| Conflito | logic.ts | selectors.ts | Decisão Recomendada |
|----------|----------|--------------|---------------------|
| **hasAnyVisualAsset()** | Verifica `image_url \|\| reels_script` (campos) | Verifica `hasArt() \|\| hasVideo()` (status) | Manter ambas — Renomear logic para `hasGeneratedVisualAsset()` |
| **getCampaignDisplayStatuses()** | Duplicata idêntica | Duplicata idêntica | Deletar de logic.ts, re-export de selectors |
| **getContentState() vs getUIStatus()** | Retorna "art_and_video" | Retorna "complete" | Manter ambas — Tipos diferentes (ContentState vs UIStatus) |
| **calculateGlobalStatus() vs getGlobalStatus()** | Usa scores (min) | Usa statuses.includes | Reconciliar — Validar equivalência ou manter ambas |

---

## 📁 Files Affected

| File | Action | Notes |
|------|--------|-------|
| `lib/domain/campaigns/selectors.ts` | **Add** | Migrar 6 funções + resolver conflitos (16+ funções total) |
| `lib/domain/campaigns/logic.ts` | **Deprecate** | Marcar @deprecated, criar re-exports |
| `lib/domain/campaigns/selectors.test.ts` | **Create/Expand** | 20+ tests com CAMPAIGN_FIXTURE |
| `lib/domain/campaigns/types.ts` | **Read** | Fonte de Campaign type — não modificar |

---

## 🚀 Execution Instructions

Copy `sm-story-2.5.prompt.md` and send to @sm:

```
Execute Story 2.5 drafting following the 6-step CoT workflow.
Requirements: docs/stories/prompts/sm-story-2.5.prompt.md
Output: docs/stories/2.5.story.md
```

**Model:** Claude Sonnet 4.6 (1x) — MEDIUM RISK refactoring com conflict resolution

---

## 🎨 Design Decisions

### 1. Discovery Before AC
Discovery (grep + read) MUST happen BEFORE writing AC — previne AC incorretos baseados em assumptions.

### 2. Conflict Table
Tabela com 4 conflitos + decisões explícitas — força @sm a resolver conflitos ANTES de AC.

### 3. Deprecation Pattern
Re-exports em logic.ts mantêm backward compatibility:
```typescript
/** @deprecated Use from './selectors' instead */
export { getCampaignDisplayStatuses } from './selectors';
```

### 4. CAMPAIGN_FIXTURE Requirement
Fixture com 20+ campos (não mocks sintéticos) — testes realistas.

---

## ✅ Success Metrics

**Story is ready when:**
- ✅ Discovery executado (4 steps completos)
- ✅ Conflict table com 4 conflitos + decisões
- ✅ AC com 5 cenários Gherkin
- ✅ DoD com 10-12 items
- ✅ Dev Notes com 3 code examples + fixture
- ✅ @po score ≥7/10

**Expected commit (by @dev later):**
```
refactor: consolidate campaign selectors, deprecate logic.ts [Story 2.5]
```

---

**END OF README**
