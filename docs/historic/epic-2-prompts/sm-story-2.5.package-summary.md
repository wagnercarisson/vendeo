# Story 2.5 @sm Prompt — Package Summary

**Created:** 2026-04-20  
**Status:** ✅ Ready for @sm execution  
**Epic Progress:** 4/6 stories complete (67%) — Story 2.5 next

---

## 📦 Package Deliverables

### 1. Main Prompt
**File:** `sm-story-2.5.prompt.md`  
**Size:** ~1200 tokens (MEDIUM RISK refactoring)  
**Structure:** THE PROMPT LOOP (Analysis → System Prompt → Testing Strategy)

**Key Sections:**
- **Context:** Story 2.5, Epic 2, MEDIUM RISK (backward compatibility via re-exports)
- **Requirements:** User Story, Objective, AC (5 cenários Gherkin), Scope IN/OUT
- **Discovery Requirements:** 4 mandatory steps (grep + read + conflict detection)
- **Conflict Resolution:** Tabela com 4 conflitos + decisões explícitas
- **Implementation Guidance:** 6-step CoT (Discovery → Conflicts → Cross-Story → AC → Risks → DoD)
- **Dev Notes:** 3 code examples (migração, deprecation, conflito) + CAMPAIGN_FIXTURE
- **File List:** 4 arquivos (selectors, logic, test, types)

### 2. Testing Strategy
**File:** `sm-story-2.5.testing-strategy.md`  
**Size:** ~950 tokens  
**Coverage:** 5 test suites, 20+ test cases

**Test Suites:**
- T1: Funções Únicas Migradas (8 tests — hasGeneratedArt, hasGeneratedCampaignContent, hasGeneratedVideo, etc.)
- T2: Conflitos Resolvidos (4 tests — hasAnyVisualAsset vs hasGeneratedVisualAsset, getContentState vs getUIStatus)
- T3: Duplicatas Eliminadas (3 tests — getCampaignDisplayStatuses selectors vs logic re-export)
- T4: Backward Compatibility (2 tests — re-exports funcionam, JSDoc @deprecated)
- T5: Fixture Completude (3 tests — campos obrigatórios, campos AI, campos Reels)

### 3. Analysis
**File:** `sm-story-2.5.analysis.md`  
**Size:** ~700 tokens  
**Content:** 7 design decisions + token economy + cross-story dependencies

**Key Decisions:**
1. Mandatory Discovery with Conflict Detection — grep + read ANTES de AC
2. Conflict Resolution Table (Before AC) — 4 conflitos decididos explicitamente
3. Deprecation Pattern (Re-exports) — backward compatibility sem breaking changes
4. CAMPAIGN_FIXTURE Requirement — 20+ campos (não mocks sintéticos)
5. 6-Step CoT — Discovery → Conflicts → Cross-Story → AC → Risks → DoD
6. Medium Risk Classification — Complexity Score 26/100 (refactoring com re-exports)
7. File List Restriction — 4 arquivos (não inflar scope com app/**/*.tsx)

### 4. README
**File:** `README-story-2.5.md`  
**Size:** ~900 tokens  
**Content:** Package overview, execution flow, metrics, quality gates

---

## 🎯 What @sm Will Do

**Workflow (6-Step CoT):**

```
Passo 1: DISCOVERY (MANDATORY)
  - grep export selectors.ts → lista 10 funções
  - read selectors.ts → entende funções existentes
  - grep export logic.ts → lista 10 funções
  - read logic.ts → detecta duplicatas/divergências

Passo 2: CONFLICT RESOLUTION
  - Criar tabela com 4 conflitos:
    1. hasAnyVisualAsset (campos vs status) → Manter ambas, rename
    2. getCampaignDisplayStatuses (duplicata) → Deletar, re-export
    3. getContentState vs getUIStatus (retornos diferentes) → Manter ambas
    4. calculateGlobalStatus vs getGlobalStatus → Reconciliar
  - Documentar decisão + rationale para cada

Passo 3: CROSS-STORY DECISIONS
  - Referenciar Stories 2.1 (schemas), 2.2 (types), 2.4 (mappers)

Passo 4: ACCEPTANCE CRITERIA
  - 5 cenários Gherkin:
    1. Migração de 6 funções
    2. Conflito hasAnyVisualAsset resolvido (rename)
    3. Duplicata getCampaignDisplayStatuses eliminada
    4. Deprecation pattern (re-exports em logic.ts)
    5. Testes com CAMPAIGN_FIXTURE

Passo 5: RISKS & MITIGATIONS
  - 4-5 riscos: lógicas divergentes, quebra imports, testes insuficientes

Passo 6: DEFINITION OF DONE
  - 10-12 checklist items
```

**Total Time:** 45-60min (discovery 15min, conflicts 15min, AC+DoD 15-30min)

---

## 🔑 Key Conflicts & Decisions

### Conflict 1: hasAnyVisualAsset()
**logic.ts:** Verifica campos (`image_url || reels_script`)  
**selectors.ts:** Verifica status (`hasArt() || hasVideo()`)  
**Decisão:** Manter ambas com nomes diferentes
- `hasAnyVisualAsset()` permanece em selectors.ts (status-based)
- `hasGeneratedVisualAsset()` migra de logic.ts (field-based)

### Conflict 2: getCampaignDisplayStatuses()
**Análise:** Implementações idênticas em ambos os arquivos  
**Decisão:** Deletar de logic.ts, criar re-export
```typescript
/** @deprecated Use from './selectors' instead */
export { getCampaignDisplayStatuses } from './selectors';
```

### Conflict 3: getContentState() vs getUIStatus()
**Análise:** Nomes diferentes, tipos de retorno diferentes  
**Decisão:** Manter ambas (não são duplicatas)
- `getContentState()`: Retorna `"art_and_video"|"art_only"|"video_only"|"none"`
- `getUIStatus()`: Retorna `"complete"|"art"|"video"|"none"`

### Conflict 4: calculateGlobalStatus() vs getGlobalStatus()
**Análise:** Algoritmos diferentes (scores vs includes)  
**Decisão:** Validar equivalência com testes — se equivalentes, deletar; se não, manter ambas

---

## 📊 Token Economy

| Component | Tokens | Justification |
|-----------|--------|---------------|
| Main Prompt | ~1200 | Discovery (400) + Conflicts (250) + CoT (550) |
| Testing Strategy | ~950 | 5 test suites × ~190 tokens each |
| Analysis | ~700 | 7 design decisions + token economy |
| **TOTAL @sm Package** | **~2850** | MEDIUM RISK refactoring |

**Comparison:**
- Story 2.2 @sm package: ~2800 tokens (MEDIUM RISK creation)
- Story 2.3 @sm package: ~2700 tokens (MEDIUM RISK creation)
- Story 2.4 @sm package: ~3900 tokens (HIGH RISK refactoring)
- Story 2.5 @sm package: **~2850 tokens** (MEDIUM RISK refactoring, consistent)

**Pattern:** MEDIUM RISK ~2700-2850 tokens, HIGH RISK ~3900 tokens (+37%)

---

## 🎨 Unique Features (vs Stories 2.2/2.3/2.4)

### Story 2.5 Distinctive Features:

1. **Mandatory Discovery (4 Steps):**
   - Story 2.2/2.3: Discovery optional
   - Story 2.4: Discovery obrigatório (2 steps)
   - **Story 2.5: Discovery obrigatório (4 steps: grep → read → read → conflict table)**

2. **Conflict Resolution Table:**
   - Story 2.2/2.3/2.4: Decisões inline
   - **Story 2.5: Tabela explícita com 4 conflitos + decisões ANTES de AC**

3. **Deprecation Pattern:**
   - Story 2.2/2.3/2.4: Criação (não deprecation)
   - **Story 2.5: Re-exports em logic.ts para backward compatibility**

4. **CAMPAIGN_FIXTURE Requirement:**
   - Story 2.2/2.3: Mocks sintéticos OK
   - Story 2.4: REAL_DB_ROW obrigatória
   - **Story 2.5: CAMPAIGN_FIXTURE com 20+ campos (domain type, não DB)**

---

## ✅ Success Metrics

**Quality Gates:**
- ✅ Discovery executado (4 steps completos)
- ✅ Conflict table com 4 conflitos + decisões explícitas
- ✅ Cross-Story Decisions (≥3 referências a Stories 2.1/2.2/2.4)
- ✅ AC com 5 cenários Gherkin
- ✅ Risks listados (4-5 riscos com mitigações)
- ✅ DoD checklist (10-12 items)
- ✅ Dev Notes com 3 code examples + CAMPAIGN_FIXTURE
- ✅ @po score ≥7/10

**Expected Story Output:**
- `docs/stories/2.5.story.md`
- Conflict table in Dev Notes
- File List: selectors.ts (add), logic.ts (deprecate), selectors.test.ts (create), types.ts (read)

---

## 🚀 Execution Instructions

Copy `sm-story-2.5.prompt.md` and send to @sm:

```
Execute Story 2.5 drafting following the 6-step CoT workflow.
Story: 2.5 — Consolidação de Selectors
Requirements file: docs/stories/prompts/sm-story-2.5.prompt.md
Output: docs/stories/2.5.story.md
```

**Model:** Claude Sonnet 4.6 (1x) — MEDIUM RISK refactoring com conflict resolution

---

## 📈 Epic 2 Progress After Story 2.5

**Current state (before 2.5):**
- ✅ Story 2.1 — Schemas de Validação (Zod) — DONE
- ✅ Story 2.2 — Tipos de Domínio Centralizados — DONE
- ✅ Story 2.3 — Contratos de API — DONE
- ✅ Story 2.4 — Mappers Seguros — DONE (QA Gate: CONCERNS accepted)
- 🟡 Story 2.5 — Consolidação de Selectors — READY (next)
- ⚪ Story 2.6 — Integration (API + Service) — Blocked by 2.5

**Progress:** 67% complete (4/6 stories)

**After Story 2.5:**
- Progress: 83% complete (5/6 stories)
- Story 2.6 unblocked (Integration precisa de selectors consolidados)

---

## 🔗 Cross-Story Dependencies

### Story 2.5 Depends On:
- **Story 2.1 ✅:** CampaignStatusSchema define statuses usados por selectors (getGlobalStatus)
- **Story 2.2 ✅:** Campaign type com 40+ campos acessados por selectors
- **Story 2.4 ✅:** Pattern de funções puras estabelecido (mappers validam, selectors não)

### Story 2.5 Blocks:
- **Story 2.6:** Integration precisa de selectors consolidados (não pode ter duplicatas)

---

**END OF PACKAGE SUMMARY**
