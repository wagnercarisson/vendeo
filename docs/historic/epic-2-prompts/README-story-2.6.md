# Story 2.6 — Prompt Engineering Packages (Complete)

**Story:** 2.6 — Integration API Routes  
**Epic:** Epic 2 — Arquitetura de Campanhas (FINAL STORY)  
**Created:** 2026-04-20  
**Updated:** 2026-04-20 (added @dev package after @po validation 10/10)  
**Status:** ✅ @sm Package Complete, ✅ @dev Package Complete  
**Risk Level:** 🔴 HIGH RISK (production endpoint + AI validation + Epic 2 completion)

---

## 📦 Package Contents

### 1. @sm Prompt (Story Drafting) — ✅ COMPLETE
**File:** `sm-story-2.6.prompt.md`  
**Purpose:** Criar Story File com discovery obrigatório (3 endpoints comparison), validation schemas, manual tests, Epic 2 completion  
**Target Agent:** @sm (River) — Scrum Master  
**Model:** Claude Sonnet 4.6 (1x)  
**Token Count:** ~2400 tokens (HIGH RISK integration)  
**Status:** ✅ EXECUTED (@po validation 10/10)

**Key Features:**
- **Mandatory Discovery (4 Steps):** Read /strategy atual, read /campaign (reference), grep schemas disponíveis, create tabela 3 endpoints
- **Discovery Table:** Comparar `/campaign` (✅ COMPLETO), `/reels` (✅ COMPLETO), `/strategy` (🔴 TARGET)
- **Schema Re-use:** CampaignStrategyRequestSchema e ResponseSchema re-usam schemas de Story 2.1
- **Code Pattern Examples:** 3 patterns (request validation, AI response validation, schema re-use)
- **Manual Test Requirements:** DoD DEVE incluir 3+ manual tests (POST válido, inválido, IA inválida)
- **OUT OF SCOPE:** Explícito (não refatorar /campaign ou /reels)
- **Epic 2 Completion:** EXEC-PLAN-EPIC-2.md update obrigatório no DoD
- **6-Step CoT:** Discovery → Cross-Story → AC → Risks → DoD → Dev Notes

**Testing:** `sm-story-2.6.testing-strategy.md` (7 test suites validating discovery, AC, risks, DoD)  
**Analysis:** `sm-story-2.6.analysis.md` (7 design decisions, token economy, cross-story dependencies)

---

### 2. @dev Prompt (Implementation) — ✅ COMPLETE
**File:** `dev-story-2.6.prompt.md`  
**Purpose:** Implementar Story 2.6 com 3 surgical changes (export schemas, tighten validation, activate endpoint)  
**Target Agent:** @dev (Dex) — Developer  
**Model:** Claude Sonnet 4.6 (1x)✅ COMPLETE                 │
│    Input: Requirements, discovery obrigatório (3 endpoints) │
│    Discovery: Read /strategy, /campaign, grep schemas       │
│    Output: docs/stories/2.6.story.md + tabela 3 endpoints   │
│    Validation: 7 test suites (Discovery, AC, Risks, DoD)    │
│    Status: ✅ EXECUTED                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. @po Validation (10-point checklist) ✅ COMPLETE         │
│    Score: 10/10 (perfect)                                   │
│    Highlights: Gap closure, surgical scope, z.preprocess    │
│    Status: ✅ GO (Story 2.6 Ready for implementation)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. @dev Prompt (Implementation) ← YOU ARE HERE             │
│    Input: docs/stories/2.6.story.md                         │
│    Output: 3 surgical changes (export, validation, activate)│
│    Status: 🔴 READY FOR EXECUTION (HIGH RISK)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. @qa QA Gate (7-point checklist)                         │
│    Story Lifecycle: Ready → InProgress → InReview → Donets) │
│    Discovery: Read /strategy, /campaign, grep schemas       │
│    Output: docs/stories/2.6.story.md + tabela 3 endpoints   │
│    Validation: 7 test suites (Discovery, AC, Risks, DoD)    │
│    Status: 🔴 READY FOR EXECUTION (HIGH RISK)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. @po Validation (10-point checklist)                     │
│    Target: GO (≥7/10)                                       │
│    Focus: Discovery executado? Manual tests no DoD?         │
│    Status: 🟡 PENDING                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. @dev Prompt (Implementation)                            │
│    Input: docs/stories/2.6.story.md                         │
│    Output: contracts.ts UPDATE, route.ts UPDATE             │
│    Status: ⚪ NOT CREATED YET                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. @qa QA Gate (7-point checklist)                         │
│    Story Lifecycle: Draft → Ready → InProgress → Done      │
│    Status: 🟡 PENDING (awaits @dev completion)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Epic 2 Completion 🎉                                    │
│    EXEC-PLAN-EPIC-2.md updated: 100% complete (6/6)        │
│    Arquitetura ativa em 3 endpoints: /campaign, /reels, /strategy │
│    Status: 🟡 PENDING (awaits Story 2.6 Done)              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Metrics Summary

### @sm Prompt Metrics (EXECUTED — @po score 10/10)
| Metric | Target | Status |
|--------|--------|--------|
| Token count | ~2400 | ~2400 ✅ |
| Discovery execution | 4 steps | ✅ Completed |
| Endpoint comparison table | 3 endpoints | ✅ Created |
| Cross-Story Decisions | ≥3 entries | ✅ 5 entries |
| Acceptance Criteria | 5 Gherkin scenarios | ✅ 5 scenarios |
| Risks | 3-4 com severidade | ✅ 4 risks |
| DoD | 12-15 items + 3+ manual tests | ✅ 15 items (including 2 manual tests) |
| Dev Notes | 3 code examples | ✅ 3 patterns |

### @dev Prompt Metrics (READY FOR EXECUTION)
| Metric | Target | Status |
|--------|--------|--------|
| Token count | ~4800 | ~4800 ✅ |
| 3 Surgical Changes | Export → Validation → Activation | 🔴 Ready |
| z.preprocess trap explanation | Critical distinction documented | ✅ Complete |
| Manual tests | 2 mandatory (DoD 13-14) | 🔴 Pending execution |
| Epic closure | EXEC-PLAN update (DoD 15) | 🔴 Pending |
| Test suites | 7 suites, 32 test cases | ✅ Documented |
| Code examples | 3 patterns | ✅ Complete |

### Package Totals
| Component | @sm Package | @dev Package | Combined |
|-----------|-------------|--------------|----------|
| Main Prompt | ~2400 | ~4800 | ~7200 |
| Testing Strategy | ~800 | ~1400 | ~2200 |
| Analysis | ~600 | ~900 | ~1500 |
| Package Summary | ~1100 | ~1200 | ~2300 |
| **TOTAL** | **~4900** | **~8300** | **~13,200** |

**Token Comparison (Full Story 2.6 Cycle):**
- Story 2.2 (MEDIUM): ~8000 tokens (@sm + @dev)
- Story 2.3 (MEDIUM): ~8500 tokens (@sm + @dev)
- Story 2.4 (HIGH): ~11,700 tokens (@sm + @dev)
- Story 2.5 (HIGH): ~9750 tokens (@sm + @dev)
- Story 2.6 (HIGH): **~13,200 tokens** (@sm + @dev, +13% vs Story 2.4)

**Why ~13,200 tokens (highest in Epic 2)?**
- HIGH RISK production endpoint (extensive manual test documentation)
- z.preprocess trap (requires detailed explanation for @dev)
- Epic 2 closure (EXEC-PLAN update + architecture documentation)
- 3 surgical changes (precision requirements increase token count)
- 32 test cases total (30 automated + 2 manual)

---

## 🎉 Package Delivery Complete

**@sm Package:** ✅ Complete (executed, @po validation 10/10)  
**@dev Package:** ✅ Complete (ready for execution)  
**Total Token Investment:** ~13,200 tokens (highest in Epic 2)  
**Epic 2 Progress:** 83% → 100% (after Story 2.6 implementation)

---

**For @dev execution, see:** `dev-story-2.6.package-summary.md` (quick reference with copy-paste commands)

---

**END OF README**
