# Testing Strategy — Story 2.5 (Consolidação de Selectors)

## Test Coverage Requirements

Esta strategy valida que funções migradas preservam comportamento + duplicatas eliminadas + re-exports funcionam.

---

## Test Suite 1: Funções Únicas Migradas

**Objetivo:** Validar que as 6 funções migradas de logic.ts funcionam corretamente em selectors.ts.

| Test Case | Function | Input | Expected Output | Validates |
|-----------|----------|-------|----------------|-----------|
| **T1.1 — hasGeneratedArt (happy path)** | `hasGeneratedArt()` | Campaign com `image_url`, `ai_caption`, `ai_generated_at` preenchidos | `true` | Verifica presença de campos AI |
| **T1.2 — hasGeneratedArt (edge case)** | `hasGeneratedArt()` | Campaign com apenas `image_url` (sem ai_caption) | `false` | Requer campos AI, não apenas image |
| **T1.3 — hasGeneratedCampaignContent (happy path)** | `hasGeneratedCampaignContent()` | Campaign com `ai_caption: "Test"` | `true` | Pelo menos um campo AI texto |
| **T1.4 — hasGeneratedCampaignContent (edge case)** | `hasGeneratedCampaignContent()` | Campaign com todos AI fields `null` | `false` | Nenhum conteúdo gerado |
| **T1.5 — hasGeneratedVideo (happy path)** | `hasGeneratedVideo()` | Campaign com `reels_script`, `reels_hook` preenchidos | `true` | Verifica campos de vídeo |
| **T1.6 — getCampaignListStatus (draft)** | `getCampaignListStatus()` | Campaign com `status: "draft"` | `"none"` | Status simplificado para listagens |
| **T1.7 — getCampaignListStatus (approved)** | `getCampaignListStatus()` | Campaign com `status: "approved"` | `"approved"` | Mapeamento correto |
| **T1.8 — getCampaignStatusLine (complete)** | `getCampaignStatusLine()` | Campaign com `post_status: "ready"`, `reels_status: "ready"` | `"Campanha completa"` | String amigável de status |

---

## Test Suite 2: Conflitos Resolvidos

**Objetivo:** Validar que conflitos foram resolvidos corretamente com renomeações.

| Test Case | Function | Input | Expected Output | Validates |
|-----------|----------|-------|----------------|-----------|
| **T2.1 — hasAnyVisualAsset (status-based)** | `hasAnyVisualAsset()` | Campaign com `post_status: "ready"`, `reels_status: "none"` | `true` | Usa hasArt() (status) |
| **T2.2 — hasGeneratedVisualAsset (field-based)** | `hasGeneratedVisualAsset()` | Campaign com `image_url: "url"`, `post_status: "none"` | `true` | Verifica campos, não status |
| **T2.3 — Divergência clara** | Ambas funções | Campaign com `image_url: null`, `post_status: "ready"` | `hasAnyVisualAsset: true`, `hasGeneratedVisualAsset: false` | Lógicas diferentes |
| **T2.4 — getContentState vs getUIStatus** | Ambas funções | Campaign com `post_status: "ready"`, `reels_status: "ready"` | `getContentState: "art_and_video"`, `getUIStatus: "complete"` | Retornos diferentes |

---

## Test Suite 3: Duplicatas Eliminadas

**Objetivo:** Validar que duplicatas foram eliminadas e re-exports funcionam.

| Test Case | Function | Import Source | Expected Behavior | Validates |
|-----------|----------|--------------|-------------------|-----------|
| **T3.1 — getCampaignDisplayStatuses (selectors)** | `getCampaignDisplayStatuses()` | `from './selectors'` | Retorna badges corretos | Fonte original |
| **T3.2 — getCampaignDisplayStatuses (logic re-export)** | `getCampaignDisplayStatuses()` | `from './logic'` | Retorna badges corretos (idêntico a T3.1) | Backward compatibility |
| **T3.3 — calculateGlobalStatus reconciliado** | `getGlobalStatus()` | `from './selectors'` | Status hierárquico correto | Lógica consolidada |

---

## Test Suite 4: Backward Compatibility (Re-exports)

**Objetivo:** Validar que imports legados de logic.ts funcionam via re-export.

| Test Case | Function | Import | Expected Behavior | Validates |
|-----------|----------|--------|-------------------|-----------|
| **T4.1 — Re-export funciona** | `hasGeneratedArt()` | `from './logic'` | Retorna `true` para Campaign com AI fields | Re-export correto |
| **T4.2 — JSDoc @deprecated presente** | (manual check) | Verificar JSDoc de logic.ts | `@deprecated` tag presente em TODAS as funções | Deprecation marcada |

---

## Test Suite 5: Fixture Completude

**Objetivo:** Validar que CAMPAIGN_FIXTURE tem todos os campos necessários para testes.

| Test Case | Validation | Expected | Validates |
|-----------|-----------|----------|-----------|
| **T5.1 — Campos obrigatórios** | CAMPAIGN_FIXTURE tem `id`, `store_id`, `post_status`, `reels_status`, `campaign_type` | Todos presentes | Fixture completa |
| **T5.2 — Campos AI** | CAMPAIGN_FIXTURE tem `image_url`, `ai_caption`, `ai_text`, `ai_generated_at` | Todos presentes | Testa funções AI |
| **T5.3 — Campos Reels** | CAMPAIGN_FIXTURE tem `reels_script`, `reels_hook`, `reels_generated_at` | Todos presentes | Testa funções vídeo |

---

## Validation Commands

```powershell
# Rodar testes de selectors
npx vitest run lib/domain/campaigns/selectors.test.ts

# Typecheck
npm run typecheck

# Cobertura (opcional)
npx vitest run lib/domain/campaigns/selectors.test.ts --coverage
```

---

## Success Criteria

- ✅ 20+ tests passing (5 suites × 4+ casos cada)
- ✅ Zero tests skipped (todos habilitados)
- ✅ Testes cobrem: funções migradas + conflitos resolvidos + duplicatas eliminadas + re-exports
- ✅ CAMPAIGN_FIXTURE tem 20+ campos (completo)
- ✅ Typecheck passa com 0 erros
- ✅ Re-exports de logic.ts funcionam (backward compatibility)

---

## Risk Mitigation (Testing Edition)

| Risk | Test Coverage |
|------|---------------|
| Lógicas divergentes entre duplicatas | T2.3 — Valida que hasAnyVisualAsset e hasGeneratedVisualAsset retornam valores diferentes |
| Quebra de imports legados | T4.1 — Valida que import de logic.ts funciona via re-export |
| Testes insuficientes | T1.1-T1.8 — Cobertura mínima de 2 cenários por função |
| Confusão sobre qual função usar | T2.1, T2.2 — Testes mostram uso correto de cada função |

---

**END OF TESTING STRATEGY**
