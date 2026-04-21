# Analysis — Story 2.5 (@dev Package)

## Prompt Design Decisions

### 1. 7-Step Progressive Workflow (not 6)

**Why:**
- 7 functions to migrate (not 6 like Story 2.4)
- 5 conflicts to resolve (each needs dedicated step)
- Caller inspection (getCampaignDisplayStatuses) requires separate step
- Equivalence testing (calculateGlobalStatus) requires separate step

**Alternative considered:** Batch migration (all 7 functions at once)  
**Rejected because:** Conflicts require sequential resolution with checkpoints

### 2. Caller Inspection Required (Etapa 3)

**Why:**
- @po identified Risk Alert 🔴 ALTO #1: Label divergence in getCampaignDisplayStatuses
- Cannot assume duplicata without inspecting 4 callers
- Decision: If labels differ, keep implementation matching rendered labels

**Inspection workflow:**
```
grep -r "getCampaignDisplayStatuses" app/ components/
→ Read 4 files (CampaignCard, CampaignEditForm, CampaignPreviewClient, [id]/page.tsx)
→ Analyze which labels are rendered ("Rascunho" vs "Aguardando aprovação")
→ Decision: Duplicata (re-export) OR Divergência (keep both)
```

**Alternative considered:** Assume duplicata (skip inspection)  
**Rejected because:** @po explicit requirement — MUST inspect callers

### 3. Equivalence Tests Required (Etapa 5)

**Why:**
- @po identified Risk Alert 🔴 ALTO #2: Algorithm equivalence
- Cannot deprecate calculateGlobalStatus without proving equivalence
- Test 5+ inputs: (ready, approved), (draft, ready), (none, none), etc.

**Test pattern:**
```typescript
const legacyResult = calculateGlobalStatus(campaign);
const newResult = getGlobalStatus(campaign);
expect(legacyResult).toBe(newResult); // MUST be equivalent
```

**Alternative considered:** Skip equivalence tests (assume equivalent)  
**Rejected because:** @po explicit requirement + Dev Notes analyze algorithms

### 4. Interactive Mode (not YOLO)

**Why:**
- @po recommendation: "Interactive (educational checkpoints for conflict resolution decisions)"
- 5 conflicts require decisions at each step
- Caller inspection needs confirmation before proceeding
- Equivalence tests need validation before deprecating

**Alternative considered:** YOLO mode (autonomous execution)  
**Rejected because:** @po explicit recommendation for educational checkpoints

### 5. CAMPAIGN_FIXTURE (35+ campos) + EMPTY_CAMPAIGN_FIXTURE

**Why:**
- Story 2.5 Dev Notes specify 35+ fields (not 20+ like Story 2.4)
- EMPTY_CAMPAIGN_FIXTURE tests edge cases (campos null, status "none")
- Conflict tests need divergent fixtures (image_url present but post_status "none")

**Fixtures required:**
- CAMPAIGN_FIXTURE: All fields populated (happy path)
- EMPTY_CAMPAIGN_FIXTURE: All optional fields null (edge cases)
- Divergent fixture: `{ image_url: "url", post_status: "none" }` (conflict test)

**Alternative considered:** Single fixture (CAMPAIGN_FIXTURE only)  
**Rejected because:** Edge cases need empty fixture, conflicts need divergent fixture

### 6. Re-export Pattern Complete (100% re-exports)

**Why:**
- Backward compatibility — existing imports from logic.ts MUST work
- Zero breaking changes — callers don't need to update imports
- Deprecation strategy — JSDoc @deprecated marks file for future removal

**Pattern:**
```typescript
// logic.ts
/** @deprecated Use from './selectors' instead */
export { funcName } from './selectors';
export { newName as oldName } from './selectors'; // Alias for getCampaignStrategyLabel
```

**Alternative considered:** Delete logic.ts (force import updates)  
**Rejected because:** Breaking change — violates Story 2.5 requirement

### 7. Conflict Resolution Order (hasAnyVisualAsset first)

**Why:**
- Conflict #1 (hasAnyVisualAsset) is simplest — add new function, preserve old
- Conflict #2 (getCampaignDisplayStatuses) requires caller inspection (more complex)
- Conflict #4 (calculateGlobalStatus) requires equivalence tests (most complex)

**Progressive complexity:**
1. Simple rename (hasAnyVisualAsset)
2. Caller inspection (getCampaignDisplayStatuses)
3. Alias creation (getCampaignStrategyLabel)
4. Equivalence testing (calculateGlobalStatus)
5. Interface re-export (DisplayBadge)

---

## Token Economy

| Component | Tokens | Justification |
|-----------|--------|---------------|
| **Main Prompt** | ~3000 | 7 etapas + conflict resolution guidance + caller inspection + equivalence tests |
| **Testing Strategy** | ~900 | 6 test suites (migration, conflicts, equivalence, backward compat, callers, edge cases) |
| **Analysis** (este arquivo) | ~700 | 7 design decisions + token economy + risk coverage |
| **TOTAL @dev Package** | ~4600 | MEDIUM RISK refactoring with conflict resolution |

**Comparison:**
- Story 2.2 @dev package: ~2400 tokens (MEDIUM RISK creation)
- Story 2.3 @dev package: ~1900 tokens (MEDIUM RISK creation)
- Story 2.4 @dev package: ~4880 tokens (HIGH RISK refactoring)
- Story 2.5 @dev package: **~4600 tokens** (MEDIUM RISK refactoring, -6% vs 2.4)

**Why -6% vs Story 2.4:**
- Story 2.4: Error handling strategies (THROW vs FALLBACK) + BEFORE/AFTER code for 6 functions
- Story 2.5: Conflict resolution (5 conflicts) + caller inspection + equivalence tests
- Similar complexity, different focus (error strategies vs conflicts)

---

## Cross-Story Dependencies

| Story | Dependency Type | Impact on 2.5 |
|-------|----------------|---------------|
| 2.1 (Schemas) | Type dependency | CampaignStatusSchema define statuses usados por getGlobalStatus |
| 2.2 (Types) | Type dependency | Campaign type tem 40+ campos acessados por selectors |
| 2.4 (Mappers) | Pattern dependency | Mappers usam `.safeParse()`, selectors são pure functions (sem validação) |

---

## Risk Coverage

| Risk (from @po) | Mitigation in @dev Prompt |
|----------------|---------------------------|
| 🔴 ALTO #1: Label divergence | Etapa 3 — Caller inspection obrigatória (4 arquivos), decision documented |
| 🔴 ALTO #2: Algorithm equivalence | Etapa 5 — Equivalence tests com 5+ inputs, deprecate ONLY if proven equivalent |
| Lógicas divergentes (hasAnyVisualAsset) | Etapa 2 — Add hasGeneratedVisualAsset(), preserve hasAnyVisualAsset() with JSDoc distinction |
| Quebra de imports legados | Etapa 6 — 100% re-exports em logic.ts, backward compatibility tests |
| Confusão sobre qual função usar | JSDoc @example em TODAS as funções, semantic distinction clear |

---

## Model Recommendation

**Claude Sonnet 4.6 (1x):**
- Complex decision-making: 5 conflicts + caller inspection + equivalence proof
- Refactoring patterns: Re-exports, aliases, deprecation
- Educational checkpoints: @po recommendation for interactive mode

**GPT-4.5 mini (0.33x) NÃO recomendado:**
- Pode confundir conflitos (hasAnyVisualAsset CAMPO vs STATUS)
- Risco de pular caller inspection (assume duplicata)
- Risco de pular equivalence tests (assume equivalence)

---

## Success Metrics

**Quality Gates:**
- ✅ All 7 checkpoints pass (typecheck after each etapa)
- ✅ Caller inspection completed (getCampaignDisplayStatuses decision documented)
- ✅ Equivalence tests pass (calculateGlobalStatus === getGlobalStatus)
- ✅ 25+ tests passing (migration + conflicts + equivalence + backward compat)
- ✅ Zero breaking changes (logic.ts re-exports work)

**Timeline:**
- Estimated: 2-3h (7 etapas × 15-25min each)
- Etapa 3 (caller inspection): +15min (grep + read 4 files)
- Etapa 5 (equivalence tests): +20min (write 5+ test cases)

---

## Pattern Evolution (Stories 2.2 → 2.3 → 2.4 → 2.5)

| Story | Risk | Token Count | Key Feature |
|-------|------|-------------|-------------|
| 2.2 | MEDIUM | ~2400 | Type creation (LOW complexity) |
| 2.3 | MEDIUM | ~1900 | API contracts (discriminated unions) |
| 2.4 | HIGH | ~4880 | Mappers refactoring (error handling strategies) |
| 2.5 | MEDIUM | **~4600** | **Selector consolidation (5 conflicts + caller inspection)** |

**Story 2.5 distinctive features:**
- Caller inspection (not present in 2.2/2.3/2.4)
- Equivalence testing (not present in 2.2/2.3/2.4)
- 100% re-export pattern (deprecation without deletion)

---

## CodeRabbit Self-Healing Expectations

**Auto-review will check:**
1. logic.ts is 100% re-exports (zero implementations)
2. hasGeneratedVisualAsset() added, hasAnyVisualAsset() preserved
3. Equivalence tests pass (calculateGlobalStatus === getGlobalStatus)
4. JSDoc @deprecated em TODAS as funções de logic.ts
5. Zero breaking changes (imports de logic.ts funcionam)

**Max 2 iterations:**
- Iteration 1: @dev implementa seguindo prompt
- CodeRabbit review: Issues detectados automaticamente
- Iteration 2: @dev corrige issues (se necessário)
- Se iteration 3 necessária → escalate to @architect (architecture issue, não code quality)

---

**END OF ANALYSIS**
