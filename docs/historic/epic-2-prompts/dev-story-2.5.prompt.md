# Prompt: @dev — Implementar Story 2.5 (Consolidação de Selectors)

---

## 📋 ANALYSIS

**Why this prompt structure:**

1. **7-Step Progressive Migration:** 1 conflict resolution por etapa + checkpoints — reduces risk of breaking multiple conflicts simultaneously.

2. **Conflict Resolution Guidance:** 5 conflicts (hasAnyVisualAsset, getCampaignDisplayStatuses, labels, algorithms, interface) — requires explicit resolution steps with BEFORE/AFTER code.

3. **Caller Inspection Required:** getCampaignDisplayStatuses has 4 callers — MUST inspect to confirm labels ("Rascunho" vs "Aguardando aprovação") before deprecating logic.ts.

4. **Algorithm Equivalence Tests:** calculateGlobalStatus vs getGlobalStatus — MUST write tests proving equivalence before deprecating.

5. **Re-export Pattern Complete:** logic.ts becomes 100% re-exports (zero implementations) — backward compatibility preserved.

6. **Interactive Mode:** @po recommendation for educational checkpoints on conflict resolution decisions.

**Model Recommendation:** Claude Sonnet 4.6 (1x) — MEDIUM RISK refactoring with conflict resolution + caller inspection.

---

## 🤖 SYSTEM PROMPT

Copie tudo abaixo desta linha e envie para @dev.

---

<context>
**Projeto:** Vendeo — sales engine para lojas físicas (Next.js + TypeScript + Supabase)

**Story:** 2.5 — Consolidação de Selectors  
**Status:** Ready (validado @po 10/10)  
**Epic:** Epic 2 — Arquitetura de Campanhas

**Dependencies:** Story 2.2 ✅ (Campaign type), Story 2.4 ✅ (mappers refatorados)

**Objetivo:** Consolidar todas as funções puras de campanha em selectors.ts, eliminando duplicatas e divergências entre logic.ts e selectors.ts.

**Complexity:** 🟡 **MEDIUM RISK** — Refactoring com backward compatibility via re-exports

**Esforço:** 2-3h  
**Modo recomendado:** **INTERACTIVE** (educational checkpoints para conflict resolution)
</context>

---

<critical_requirements>
1. **5 Conflicts MUST Be Resolved (from @po analysis):**

| Conflict | Resolution | Action Required |
|----------|-----------|-----------------|
| **hasAnyVisualAsset()** | Both kept with different names | Add `hasGeneratedVisualAsset()` (CAMPO), preserve `hasAnyVisualAsset()` (STATUS) |
| **getCampaignDisplayStatuses()** | selectors.ts canonical | 🔴 Inspect 4 callers to confirm labels ("Rascunho" vs "Aguardando aprovação") |
| **getCampaignStrategyLabel vs getStrategicLabel** | getStrategicLabel canonical | Re-export with alias in logic.ts |
| **calculateGlobalStatus vs getGlobalStatus** | getGlobalStatus canonical | 🔴 Write equivalence tests before deprecating |
| **DisplayBadge interface** | selectors.ts canonical | Simple re-export in logic.ts |

2. **Zero Breaking Changes:** logic.ts MUST become 100% re-exports (zero implementations remaining).

3. **Backward Compatibility:** All imports from `campaigns/logic` MUST continue working via re-exports.

4. **Risk Alert 🔴 ALTO #1:** Label divergence in getCampaignDisplayStatuses
   - **Action:** Inspect 4 callers: `CampaignCard.tsx`, `CampaignEditForm.tsx`, `CampaignPreviewClient.tsx`, `[id]/page.tsx`
   - **Goal:** Confirm which labels are actually rendered ("Rascunho" vs "Aguardando aprovação")
   - **Decision:** If logic.ts labels differ, preserve logic.ts implementation (NOT a true duplicata)

5. **Risk Alert 🔴 ALTO #2:** Algorithm equivalence
   - **Action:** Write equivalence tests comparing `calculateGlobalStatus()` vs `getGlobalStatus()`
   - **Test inputs:** (post_status="ready", reels_status="approved"), (post_status="none", reels_status="draft"), etc.
   - **Goal:** Prove equivalence for all valid inputs before deprecating calculateGlobalStatus

6. **Test Coverage:** selectors.test.ts MUST have fixtures: `CAMPAIGN_FIXTURE` (35+ campos) + `EMPTY_CAMPAIGN_FIXTURE` (edge cases).

</critical_requirements>

---

<implementation_plan>
## Workflow (7 Etapas + 7 Checkpoints)

### Etapa 1: Migrate 7 Functions to selectors.ts

**Ação:** Adicionar 7 funções únicas de logic.ts → selectors.ts com JSDoc completo.

**Functions to migrate:**
1. `hasGeneratedArt()` — Verifica `image_url && ai_caption && ai_generated_at`
2. `hasGeneratedCampaignContent()` — Verifica `ai_caption || ai_text || ai_cta`
3. `hasGeneratedVideo()` — Verifica `reels_script && reels_hook`
4. `getCampaignListStatus()` — Returns "approved"|"pending"|"none"
5. `getCampaignStatusLine()` — String amigável ("Campanha completa", "Aguardando aprovação")
6. `getContentState()` — Returns "art_and_video"|"art_only"|"video_only"|"none"
7. `hasGeneratedVisualAsset()` — Renomeado de `hasAnyVisualAsset()` (logic.ts), verifica `image_url || reels_script`

**Pattern (para cada função):**
```typescript
// selectors.ts
/**
 * Verifica se a campanha tem arte gerada pela IA.
 * @param c Campaign
 * @returns true se image_url, ai_caption e ai_generated_at existem
 * @example
 * const campaign = { image_url: "url", ai_caption: "caption", ai_generated_at: "2026-04-20" };
 * hasGeneratedArt(campaign); // true
 */
export const hasGeneratedArt = (c: Campaign): boolean =>
  !!(c.image_url && c.ai_caption && c.ai_generated_at);
```

**Checkpoint 1:**
```powershell
npm run typecheck
```
**Expected:** 0 errors. Se houver erro, PARE e reporte.

---

### Etapa 2: Resolve Conflict #1 (hasAnyVisualAsset)

**Ação:** Manter `hasAnyVisualAsset()` em selectors.ts (verifica STATUS), adicionar `hasGeneratedVisualAsset()` (verifica CAMPOS).

**CURRENT STATE (selectors.ts):**
```typescript
export const hasAnyVisualAsset = (c: Campaign): boolean =>
  hasArt(c) || hasVideo(c); // Verifica STATUS (post_status/reels_status)
```

**ACTION:** Add new function with clear JSDoc distinction:
```typescript
// selectors.ts
/**
 * Verifica se a campanha tem qualquer asset visual gerado (baseado em CAMPOS).
 * Diferente de hasAnyVisualAsset() que verifica STATUS de geração.
 * @param c Campaign
 * @returns true se image_url OU reels_script existem
 * @example
 * const campaign = { image_url: "url", post_status: "none" };
 * hasGeneratedVisualAsset(campaign); // true (CAMPO preenchido)
 * hasAnyVisualAsset(campaign); // false (STATUS none)
 */
export const hasGeneratedVisualAsset = (c: Campaign): boolean =>
  !!(c.image_url || c.reels_script);
```

**Checkpoint 2:**
```powershell
npm run typecheck
```
**Expected:** 0 errors.

---

### Etapa 3: Resolve Conflict #2 (getCampaignDisplayStatuses - CALLER INSPECTION)

**🔴 CRITICAL ACTION:** Inspect 4 callers BEFORE assuming duplicata.

**Step 3.1: Inspect Callers**
```powershell
# Find all usages
grep -r "getCampaignDisplayStatuses" app/ components/ --include="*.tsx"
```

**Expected callers (from Story 2.5):**
1. `app/dashboard/campaigns/[id]/page.tsx`
2. `components/campaigns/CampaignCard.tsx`
3. `components/campaigns/CampaignEditForm.tsx`
4. `components/campaigns/CampaignPreviewClient.tsx`

**Step 3.2: Analyze Implementations**
Read both implementations:
- `lib/domain/campaigns/selectors.ts` → `getCampaignDisplayStatuses()`
- `lib/domain/campaigns/logic.ts` → `getCampaignDisplayStatuses()`

**Step 3.3: Decision Logic**
```
IF implementations are IDENTICAL:
  → Keep selectors.ts version
  → Create re-export in logic.ts
ELSE IF labels differ ("Rascunho" vs "Aguardando aprovação"):
  → Check which labels are rendered in callers
  → Keep implementation that matches rendered labels
  → Re-export the OTHER one
```

**ACTION (if implementations are identical):**
```typescript
// logic.ts
/**
 * @deprecated Use getCampaignDisplayStatuses from './selectors' instead
 */
export { getCampaignDisplayStatuses } from './selectors';
```

**Checkpoint 3:**
```powershell
npm run typecheck
```
**Expected:** 0 errors. Document decision in commit message.

---

### Etapa 4: Resolve Conflict #3 (getCampaignStrategyLabel vs getStrategicLabel)

**Ação:** `getStrategicLabel()` (selectors.ts) is canonical — create alias re-export in logic.ts.

**ANALYSIS (from Story 2.5 Dev Notes):**
- `getStrategicLabel()` (selectors): 9 cases (promocao, lancamento, engajamento, informativo, etc.)
- `getCampaignStrategyLabel()` (logic): Fewer cases, less comprehensive

**ACTION:**
```typescript
// logic.ts
/**
 * @deprecated Use getStrategicLabel from './selectors' instead
 * Alias for backward compatibility
 */
export { getStrategicLabel as getCampaignStrategyLabel } from './selectors';
```

**Checkpoint 4:**
```powershell
npm run typecheck
```
**Expected:** 0 errors.

---

### Etapa 5: Resolve Conflict #4 (calculateGlobalStatus vs getGlobalStatus - EQUIVALENCE TESTS)

**🔴 CRITICAL ACTION:** Write equivalence tests BEFORE deprecating.

**Step 5.1: Create Equivalence Test**
```typescript
// selectors.test.ts
describe('calculateGlobalStatus equivalence', () => {
  it('equivalente a getGlobalStatus para inputs válidos', () => {
    const tests = [
      { post: 'ready', reels: 'approved', expected: 'approved' },
      { post: 'ready', reels: 'ready', expected: 'ready' },
      { post: 'draft', reels: 'ready', expected: 'draft' },
      { post: 'none', reels: 'none', expected: 'none' },
    ];

    tests.forEach(({ post, reels, expected }) => {
      const campaign: Campaign = {
        ...CAMPAIGN_FIXTURE,
        post_status: post as any,
        reels_status: reels as any,
      };
      
      // Import calculateGlobalStatus from logic.ts BEFORE deprecating
      const legacyResult = calculateGlobalStatus(campaign);
      const newResult = getGlobalStatus(campaign);
      
      expect(legacyResult).toBe(expected);
      expect(newResult).toBe(expected);
      expect(legacyResult).toBe(newResult); // MUST be equivalent
    });
  });
});
```

**Step 5.2: Run Equivalence Test**
```powershell
npx vitest run lib/domain/campaigns/selectors.test.ts -t "calculateGlobalStatus equivalence"
```
**Expected:** Test passes — proves equivalence.

**Step 5.3: Deprecate calculateGlobalStatus**
```typescript
// logic.ts
/**
 * @deprecated Use getGlobalStatus from './selectors' instead
 * Equivalence proven by selectors.test.ts
 */
export { getGlobalStatus as calculateGlobalStatus } from './selectors';
```

**Checkpoint 5:**
```powershell
npm run typecheck
```
**Expected:** 0 errors. Equivalence test passes.

---

### Etapa 6: Convert logic.ts to 100% Re-exports

**Ação:** Remove ALL implementations from logic.ts, keep ONLY re-exports + @deprecated JSDoc.

**PATTERN:**
```typescript
// logic.ts
/**
 * @deprecated This file is deprecated. Import from './selectors' instead.
 * 
 * All functions below are re-exported for backward compatibility.
 * 
 * Migration guide:
 * - Change: import { hasGeneratedArt } from '@/lib/domain/campaigns/logic'
 * - To:     import { hasGeneratedArt } from '@/lib/domain/campaigns/selectors'
 */

// Re-exports (11 funções)
export { hasGeneratedArt } from './selectors';
export { hasGeneratedCampaignContent } from './selectors';
export { hasGeneratedVideo } from './selectors';
export { getCampaignListStatus } from './selectors';
export { getCampaignStatusLine } from './selectors';
export { getContentState } from './selectors';
export { hasGeneratedVisualAsset } from './selectors';
export { getCampaignDisplayStatuses } from './selectors';
export { getStrategicLabel as getCampaignStrategyLabel } from './selectors';
export { getGlobalStatus as calculateGlobalStatus } from './selectors';
export type { DisplayBadge } from './selectors';
```

**Checkpoint 6:**
```powershell
npm run typecheck
```
**Expected:** 0 errors. logic.ts has ZERO implementations, only re-exports.

---

### Etapa 7: Create selectors.test.ts with Fixtures

**Ação:** Criar testes unit para TODAS as funções migradas + fixtures completas.

**FIXTURES (from Story 2.5):**
```typescript
// selectors.test.ts
import { describe, it, expect } from 'vitest';
import {
  hasGeneratedArt,
  hasGeneratedCampaignContent,
  hasGeneratedVideo,
  getCampaignListStatus,
  getCampaignStatusLine,
  getContentState,
  hasAnyVisualAsset,
  hasGeneratedVisualAsset,
  getGlobalStatus,
} from './selectors';
import type { Campaign } from './types';

// Fixture com 35+ campos
const CAMPAIGN_FIXTURE: Campaign = {
  id: "test-123",
  store_id: "store-456",
  product_name: "Test Product",
  price: 99.90,
  price_label: "OFERTA",
  audience: "geral",
  objective: "promocao",
  product_positioning: "medio",
  status: "ready",
  campaign_type: "both",
  content_type: "product",
  legacy_content_type: null,
  domain_input: {},
  domain_input_version: 1,
  post_status: "ready",
  reels_status: "approved",
  origin: "manual",
  weekly_plan_item_id: null,
  image_url: "https://example.com/img.jpg",
  product_image_url: "https://example.com/product.jpg",
  headline: "Test Headline",
  body_text: "Test Body",
  cta: "Test CTA",
  ai_caption: "AI Caption",
  ai_text: "AI Text",
  ai_cta: "AI CTA",
  ai_hashtags: "#test",
  ai_generated_at: "2026-04-20T10:00:00Z",
  reels_hook: "Hook",
  reels_script: "Script",
  reels_shotlist: ["Shot 1"],
  reels_on_screen_text: ["Text 1"],
  reels_audio_suggestion: "Audio",
  reels_duration_seconds: 30,
  reels_caption: "Reels Caption",
  reels_cta: "Reels CTA",
  reels_hashtags: "#reels",
  reels_generated_at: "2026-04-20T10:00:00Z",
  created_at: "2026-04-20T10:00:00Z",
};

// Fixture para edge cases
const EMPTY_CAMPAIGN_FIXTURE: Campaign = {
  id: "empty-123",
  store_id: "store-456",
  product_name: null,
  price: null,
  price_label: null,
  audience: null,
  objective: null,
  product_positioning: null,
  status: null,
  campaign_type: "both",
  content_type: "product",
  legacy_content_type: null,
  domain_input: {},
  domain_input_version: 1,
  post_status: "none",
  reels_status: "none",
  origin: "manual",
  weekly_plan_item_id: null,
  image_url: null,
  product_image_url: null,
  headline: null,
  body_text: null,
  cta: null,
  ai_caption: null,
  ai_text: null,
  ai_cta: null,
  ai_hashtags: null,
  ai_generated_at: null,
  reels_hook: null,
  reels_script: null,
  reels_shotlist: null,
  reels_on_screen_text: null,
  reels_audio_suggestion: null,
  reels_duration_seconds: null,
  reels_caption: null,
  reels_cta: null,
  reels_hashtags: null,
  reels_generated_at: null,
  created_at: "2026-04-20T10:00:00Z",
};

describe('hasGeneratedArt', () => {
  it('retorna true quando arte gerada está completa', () => {
    expect(hasGeneratedArt(CAMPAIGN_FIXTURE)).toBe(true);
  });

  it('retorna false quando campos AI ausentes', () => {
    expect(hasGeneratedArt(EMPTY_CAMPAIGN_FIXTURE)).toBe(false);
  });

  it('retorna false quando apenas image_url presente (sem AI fields)', () => {
    const partial = { ...EMPTY_CAMPAIGN_FIXTURE, image_url: "url" };
    expect(hasGeneratedArt(partial)).toBe(false);
  });
});

describe('hasGeneratedVisualAsset vs hasAnyVisualAsset', () => {
  it('hasGeneratedVisualAsset verifica CAMPOS', () => {
    const withFields = { ...EMPTY_CAMPAIGN_FIXTURE, image_url: "url", post_status: "none" };
    expect(hasGeneratedVisualAsset(withFields)).toBe(true); // CAMPO preenchido
  });

  it('hasAnyVisualAsset verifica STATUS', () => {
    const withStatus = { ...EMPTY_CAMPAIGN_FIXTURE, image_url: null, post_status: "ready" };
    expect(hasAnyVisualAsset(withStatus)).toBe(true); // STATUS ready
  });

  it('funções divergem quando campo presente mas status none', () => {
    const divergent = { ...EMPTY_CAMPAIGN_FIXTURE, image_url: "url", post_status: "none" };
    expect(hasGeneratedVisualAsset(divergent)).toBe(true); // CAMPO
    expect(hasAnyVisualAsset(divergent)).toBe(false); // STATUS
  });
});

// ... demais testes para cada função (20+ tests total)
```

**Checkpoint 7 (FINAL):**
```powershell
# Rodar testes
npx vitest run lib/domain/campaigns/selectors.test.ts

# Typecheck final
npm run typecheck
```

**Expected:**
- Testes: 20+ passing (happy path + edge cases + equivalence tests)
- Typecheck: 0 errors

</implementation_plan>

---

<validation_checklist>
## Definition of Done (copie da story)

Marque cada item APÓS confirmar:

- [ ] 7 funções migradas para selectors.ts com JSDoc completo
- [ ] Conflict #1 resolvido: `hasGeneratedVisualAsset()` adicionada, `hasAnyVisualAsset()` preservada
- [ ] Conflict #2 resolvido: `getCampaignDisplayStatuses()` — 4 callers inspecionados, decisão documentada
- [ ] Conflict #3 resolvido: `getCampaignStrategyLabel` alias criado em logic.ts
- [ ] Conflict #4 resolvido: Equivalence tests passam, `calculateGlobalStatus` deprecado
- [ ] Conflict #5 resolvido: `DisplayBadge` interface re-exportada
- [ ] logic.ts é 100% re-exports (zero implementations)
- [ ] JSDoc @deprecated em TODAS as funções de logic.ts
- [ ] selectors.test.ts criado com CAMPAIGN_FIXTURE (35+ campos) + EMPTY_CAMPAIGN_FIXTURE
- [ ] Equivalence tests: `calculateGlobalStatus` vs `getGlobalStatus` passam
- [ ] Testes cobrem: happy path + edge cases + conflict distinctions
- [ ] `npm run typecheck` passa com 0 erros
- [ ] `npx vitest run lib/domain/campaigns/selectors.test.ts` passa
- [ ] Zero breaking changes (imports de logic.ts funcionam via re-export)

**Reporte:** Ao marcar DoD completo, forneça output de typecheck e vitest.

</validation_checklist>

---

<instructions>
1. **Etapa 1:** Migrate 7 functions to selectors.ts + Checkpoint 1
2. **Etapa 2:** Resolve hasAnyVisualAsset conflict + Checkpoint 2
3. **Etapa 3:** Inspect getCampaignDisplayStatuses callers + Checkpoint 3
4. **Etapa 4:** Create getCampaignStrategyLabel alias + Checkpoint 4
5. **Etapa 5:** Write equivalence tests + deprecate calculateGlobalStatus + Checkpoint 5
6. **Etapa 6:** Convert logic.ts to 100% re-exports + Checkpoint 6
7. **Etapa 7:** Create selectors.test.ts with fixtures + Checkpoint 7 FINAL
8. **Marque DoD** como completo na story (`docs/stories/2.5.story.md`)
9. **Commit:** `refactor: consolidate campaign selectors, deprecate logic.ts [Story 2.5]`
10. **NÃO push** — aguardar @devops (Article II: Agent Authority)
11. **Reporte para @qa** quando pronto
</instructions>

---

<anti_patterns>
❌ **NEVER DO:**
- Skip caller inspection (getCampaignDisplayStatuses MUST be inspected)
- Skip equivalence tests (calculateGlobalStatus MUST be proven equivalent)
- Delete logic.ts (MUST keep with re-exports for backward compatibility)
- Modify function signatures in selectors.ts (zero breaking changes)
- Leave ANY implementations in logic.ts (100% re-exports only)
- Proceed if any checkpoint fails

✅ **ALWAYS DO:**
- Inspect 4 callers BEFORE assuming getCampaignDisplayStatuses is duplicata
- Write equivalence tests BEFORE deprecating calculateGlobalStatus
- Keep hasAnyVisualAsset() AND hasGeneratedVisualAsset() (semantic distinction)
- Document decision for getCampaignDisplayStatuses in commit message
- Use CAMPAIGN_FIXTURE (35+ campos) AND EMPTY_CAMPAIGN_FIXTURE in tests
- Report result of EACH checkpoint
</anti_patterns>

---

<error_recovery>
### Se Checkpoint falhar:

**Erro comum 1:** getCampaignDisplayStatuses labels divergem entre logic.ts e selectors.ts
**Causa:** Não são duplicatas verdadeiras — labels diferentes ("Rascunho" vs "Aguardando aprovação")
**Fix:** Inspecionar 4 callers → determinar qual implementação é renderizada → deprecar a OUTRA

**Erro comum 2:** Equivalence test falha (calculateGlobalStatus ≠ getGlobalStatus)
**Causa:** Algoritmos não são equivalentes para todos os inputs
**Fix:** NÃO deprecar calculateGlobalStatus — manter ambas com nomes claros + JSDoc explicando diferença

**Erro comum 3:** Typecheck falha com "Module has no exported member 'DisplayBadge'"
**Causa:** Esqueceu de re-exportar interface em logic.ts
**Fix:** Adicionar `export type { DisplayBadge } from './selectors';` em logic.ts

**Erro comum 4:** Testes de hasGeneratedVisualAsset vs hasAnyVisualAsset retornam valores iguais
**Causa:** Fixtures não testam divergência (campo presente mas status "none")
**Fix:** Usar fixture: `{ image_url: "url", post_status: "none" }` — hasGeneratedVisualAsset=true, hasAnyVisualAsset=false

</error_recovery>

---

**END OF PROMPT**
