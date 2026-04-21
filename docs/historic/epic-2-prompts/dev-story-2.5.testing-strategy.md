# Testing Strategy — Story 2.5 (@dev Implementation)

## Test Coverage Requirements

Esta strategy valida que: funções migradas funcionam, conflitos resolvidos corretamente, equivalence proven, re-exports funcionam.

---

## Test Suite 1: Funções Migradas (7 funções)

**Objetivo:** Validar que as 7 funções migradas de logic.ts → selectors.ts funcionam corretamente.

| Test Case | Function | Input | Expected Output | Validates |
|-----------|----------|-------|----------------|-----------|
| **T1.1 — hasGeneratedArt (happy path)** | `hasGeneratedArt()` | `CAMPAIGN_FIXTURE` (image_url, ai_caption, ai_generated_at preenchidos) | `true` | Campos AI completos |
| **T1.2 — hasGeneratedArt (edge case)** | `hasGeneratedArt()` | `EMPTY_CAMPAIGN_FIXTURE` (campos null) | `false` | Campos AI ausentes |
| **T1.3 — hasGeneratedArt (apenas image_url)** | `hasGeneratedArt()` | Campaign com `image_url` mas sem `ai_caption` | `false` | Requer campos AI, não apenas image |
| **T1.4 — hasGeneratedCampaignContent** | `hasGeneratedCampaignContent()` | Campaign com `ai_caption: "Test"` | `true` | Pelo menos um campo AI texto |
| **T1.5 — hasGeneratedVideo** | `hasGeneratedVideo()` | Campaign com `reels_script`, `reels_hook` | `true` | Campos de vídeo |
| **T1.6 — getCampaignListStatus** | `getCampaignListStatus()` | Campaign com `status: "approved"` | `"approved"` | Status simplificado |
| **T1.7 — getCampaignStatusLine** | `getCampaignStatusLine()` | Campaign com `post_status: "ready"`, `reels_status: "ready"` | `"Campanha completa"` | String amigável |
| **T1.8 — getContentState** | `getContentState()` | Campaign com `post_status: "ready"`, `reels_status: "ready"` | `"art_and_video"` | ContentState type |

---

## Test Suite 2: Conflict #1 Resolution (hasAnyVisualAsset)

**Objetivo:** Provar que `hasAnyVisualAsset()` (STATUS) e `hasGeneratedVisualAsset()` (CAMPO) têm semânticas diferentes.

| Test Case | Function | Input | Expected Output | Validates |
|-----------|----------|-------|----------------|-----------|
| **T2.1 — hasGeneratedVisualAsset (campo presente)** | `hasGeneratedVisualAsset()` | Campaign com `image_url: "url"`, `post_status: "none"` | `true` | Verifica CAMPO |
| **T2.2 — hasAnyVisualAsset (status presente)** | `hasAnyVisualAsset()` | Campaign com `image_url: null`, `post_status: "ready"` | `true` | Verifica STATUS |
| **T2.3 — Divergência clara** | Ambas funções | Campaign com `image_url: "url"`, `post_status: "none"` | `hasGeneratedVisualAsset: true`, `hasAnyVisualAsset: false` | Semânticas diferentes |
| **T2.4 — Ambas true** | Ambas funções | Campaign com `image_url: "url"`, `post_status: "ready"` | `hasGeneratedVisualAsset: true`, `hasAnyVisualAsset: true` | Ambas podem ser true simultaneamente |

---

## Test Suite 3: Conflict #4 Resolution (Algorithm Equivalence)

**Objetivo:** Provar que `calculateGlobalStatus()` e `getGlobalStatus()` são equivalentes para todos os inputs válidos.

| Test Case | Input (post_status, reels_status) | Expected Output | Validates |
|-----------|-----------------------------------|----------------|-----------|
| **T3.1 — Approved + Approved** | `("approved", "approved")` | `"approved"` | Ambos funções retornam "approved" |
| **T3.2 — Ready + Ready** | `("ready", "ready")` | `"ready"` | Ambos funções retornam "ready" |
| **T3.3 — Draft + Ready** | `("draft", "ready")` | `"draft"` | Hierarquia: draft < ready |
| **T3.4 — None + None** | `("none", "none")` | `"none"` | Ambos funções retornam "none" |
| **T3.5 — Ready + Approved** | `("ready", "approved")` | `"ready"` | Hierarquia: ready < approved |
| **T3.6 — Equivalence assertion** | Todos os casos acima | `calculateGlobalStatus === getGlobalStatus` | Algoritmos equivalentes |

---

## Test Suite 4: Backward Compatibility (Re-exports)

**Objetivo:** Validar que imports de logic.ts funcionam via re-export.

| Test Case | Function | Import Source | Expected Behavior | Validates |
|-----------|----------|--------------|-------------------|-----------|
| **T4.1 — Re-export hasGeneratedArt** | `hasGeneratedArt()` | `from './logic'` | Retorna `true` para Campaign com AI fields | Re-export correto |
| **T4.2 — Re-export alias getCampaignStrategyLabel** | `getCampaignStrategyLabel()` | `from './logic'` | Retorna label correto (alias de getStrategicLabel) | Alias funciona |
| **T4.3 — Re-export calculateGlobalStatus** | `calculateGlobalStatus()` | `from './logic'` | Retorna status correto (alias de getGlobalStatus) | Equivalence preservada |
| **T4.4 — JSDoc @deprecated presente** | (manual check) | Verificar JSDoc de logic.ts | `@deprecated` tag presente em TODAS as funções | Deprecation marcada |

---

## Test Suite 5: Caller Validation (getCampaignDisplayStatuses)

**Objetivo:** Confirmar qual implementação de getCampaignDisplayStatuses é usada pelos callers.

| Test Case | Caller File | Expected | Validates |
|-----------|------------|----------|-----------|
| **T5.1 — CampaignCard.tsx** | `components/campaigns/CampaignCard.tsx` | Inspecionar labels renderizados | Qual implementação é usada |
| **T5.2 — CampaignEditForm.tsx** | `components/campaigns/CampaignEditForm.tsx` | Inspecionar labels renderizados | Consistência de labels |
| **T5.3 — CampaignPreviewClient.tsx** | `components/campaigns/CampaignPreviewClient.tsx` | Inspecionar labels renderizados | Qual versão é canonical |
| **T5.4 — [id]/page.tsx** | `app/dashboard/campaigns/[id]/page.tsx` | Inspecionar labels renderizados | Decisão final: duplicata ou divergência? |

**Manual inspection command:**
```powershell
grep -A 5 "getCampaignDisplayStatuses" components/campaigns/CampaignCard.tsx
grep -A 5 "getCampaignDisplayStatuses" components/campaigns/CampaignEditForm.tsx
```

---

## Test Suite 6: Edge Cases (EMPTY_CAMPAIGN_FIXTURE)

**Objetivo:** Validar que funções não quebram com campos null.

| Test Case | Function | Input | Expected Output | Validates |
|-----------|----------|-------|----------------|-----------|
| **T6.1 — hasGeneratedArt com campos null** | `hasGeneratedArt()` | `EMPTY_CAMPAIGN_FIXTURE` | `false` | Não quebra com null |
| **T6.2 — hasGeneratedCampaignContent vazio** | `hasGeneratedCampaignContent()` | `EMPTY_CAMPAIGN_FIXTURE` | `false` | Retorna false (não throw) |
| **T6.3 — getContentState com status "none"** | `getContentState()` | Campaign com `post_status: "none"`, `reels_status: "none"` | `"none"` | Edge case válido |

---

## Validation Commands

```powershell
# Rodar testes
npx vitest run lib/domain/campaigns/selectors.test.ts

# Rodar apenas equivalence tests
npx vitest run lib/domain/campaigns/selectors.test.ts -t "calculateGlobalStatus equivalence"

# Typecheck
npm run typecheck

# Inspecionar callers manualmente
grep -r "getCampaignDisplayStatuses" app/ components/ --include="*.tsx"
```

---

## Success Criteria

- ✅ 25+ tests passing (6 suites × 4+ casos cada)
- ✅ Equivalence tests passam (calculateGlobalStatus === getGlobalStatus)
- ✅ Conflict distinction tests passam (hasGeneratedVisualAsset ≠ hasAnyVisualAsset)
- ✅ Backward compatibility tests passam (re-exports funcionam)
- ✅ Edge cases com EMPTY_CAMPAIGN_FIXTURE passam
- ✅ Caller inspection documentada (getCampaignDisplayStatuses decision)
- ✅ Typecheck passa com 0 erros

---

## Risk Mitigation (Testing Edition)

| Risk (from @po) | Test Coverage |
|----------------|---------------|
| 🔴 ALTO #1: Label divergence | T5.1-T5.4 — Caller inspection para confirmar labels renderizados |
| 🔴 ALTO #2: Algorithm equivalence | T3.1-T3.6 — Equivalence tests com 5+ inputs |
| Lógicas divergentes (hasAnyVisualAsset) | T2.1-T2.4 — Provar semânticas diferentes (CAMPO vs STATUS) |
| Quebra de imports legados | T4.1-T4.4 — Re-export tests garantem backward compatibility |

---

**END OF TESTING STRATEGY**
