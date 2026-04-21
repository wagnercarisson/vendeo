# Testing Strategy: @dev Story 2.2 Implementation

**Prompt File:** `docs/stories/prompts/dev-story-2.2.prompt.md`  
**Target Agent:** @dev (Dex)  
**Story:** 2.2 — Tipos de Domínio Centralizados  
**Type:** Infrastructure (Type System Refactoring)

---

## 🎯 Success Metrics

### Primary KPIs
| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Checkpoint compliance** | 4/4 passed | Verificar que @dev executou typecheck após CADA etapa |
| **Zero breaking changes** | 0 typecheck errors | `npm run typecheck` output final |
| **ContentType restriction** | "info" rejected | Teste validação ContentType (Checkpoint 4) |
| **DoD completion** | 9/9 checkboxes | Story 2.2 DoD section marcada |
| **Deprecation coverage** | 100% | Todos os tipos legados têm JSDoc @deprecated |

### Secondary KPIs
| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Zod inference** | 100% | Campaign é re-export de CampaignDomain (não manual) |
| **Importers validated** | 8/8 | Grep confirma que importadores compilam |
| **Time to complete** | 2-3h | Tracking desde início até commit |
| **CodeRabbit score** | ≥8/10 | Auto-review score (se disponível) |

---

## 🧪 Validation Tests

### Test 1: Incremental Checkpoint Execution
**Objetivo:** Confirmar que @dev executou typecheck APÓS cada etapa (não apenas no final)

**Procedure:**
1. Revisar histórico de terminal commands
2. Verificar se `npm run typecheck` aparece 4 vezes (1 por etapa)
3. Confirmar que nenhuma etapa prosseguiu após erro de typecheck

**Expected Result:**
```
Checkpoint 1 (após types.ts refactor): 0 errors
Checkpoint 2 (após campaigns/types.ts @deprecated): 0 errors
Checkpoint 3 (após contracts.ts @deprecated): 0 errors
Checkpoint 4 (final + teste "info"): 0 errors + "info" rejected
```

**Pass Criteria:** 4 checkpoints executados sequencialmente, todos com 0 errors

---

### Test 2: Campaign Type Zod Inference
**Objetivo:** Validar que `Campaign` é re-export de `CampaignDomain` (Zod-inferred), não interface manual

**Procedure:**
1. Ler `lib/domain/campaigns/types.ts`
2. Localizar definição de `Campaign`
3. Confirmar sintaxe: `export type { CampaignDomain as Campaign } from "./schemas"`
   OU: `export type Campaign = CampaignDomain`

**Expected Result:**
```typescript
// lib/domain/campaigns/types.ts
export type { CampaignDomain as Campaign } from "./schemas";
```

**Pass Criteria:** 
- `Campaign` é alias/re-export de `CampaignDomain`
- Nenhuma interface `Campaign { ... }` manual existe em types.ts
- Import de `CampaignDomain` vem de `./schemas`

---

### Test 3: ContentType Restriction (Closed Enum)
**Objetivo:** Confirmar que `ContentType` aceita APENAS "product" | "service" | "message" (rejeita "info")

**Procedure:**
1. Criar arquivo temporário `test-content-type.ts`:
```typescript
import { ContentType } from "@/lib/domain/campaigns/types";
const validProduct: ContentType = "product"; // deve compilar
const validService: ContentType = "service"; // deve compilar
const validMessage: ContentType = "message"; // deve compilar
const invalidInfo: ContentType = "info"; // deve REJEITAR
```

2. Executar: `npx tsc --noEmit test-content-type.ts`

3. Verificar output:
   - Linhas 2-4: ✅ compilam sem erro
   - Linha 5: ❌ erro `Type '"info"' is not assignable to type 'ContentType'`

4. Deletar arquivo de teste

**Expected Result:**
```
test-content-type.ts:5:7 - error TS2322: Type '"info"' is not assignable to type '"product" | "service" | "message"'.
```

**Pass Criteria:** 
- "product", "service", "message" compilam
- "info" gera erro de tipo
- ContentType é exatamente 3 valores (fechado)

---

### Test 4: Deprecation Markers Completeness
**Objetivo:** Validar que TODOS os tipos legados têm JSDoc `@deprecated` completo

**Procedure:**
1. Ler `lib/campaigns/types.ts` → verificar `Campaign` interface
2. Ler `lib/campaigns/contracts.ts` → verificar `CampaignStatus`, `CampaignStrategy`, `CampaignObjective`
3. Confirmar que cada tipo tem JSDoc com:
   - Tag `@deprecated`
   - Referência ao novo tipo (path completo)
   - Razão da deprecação (legado / migrar para domain)

**Expected Result:**
```typescript
// lib/campaigns/types.ts
/**
 * @deprecated Use Campaign from '@/lib/domain/campaigns/types' (snake_case fields).
 * Este arquivo (lib/campaigns/) é a camada legada. Migrar para lib/domain/campaigns/.
 */
export interface Campaign { ... }

// lib/campaigns/contracts.ts
/**
 * @deprecated Use CampaignStatus from '@/lib/domain/campaigns/types' when available.
 * Tipo legado — migrar para domain layer.
 */
export type CampaignStatus = ...;

/** @deprecated CampaignStrategy (uppercase) é legado. Use tipos de lib/domain/campaigns/ quando disponíveis. */
export type CampaignStrategy = ...;

/** @deprecated Use CampaignObjective from '@/lib/constants/strategy' diretamente, ou Objective from '@/lib/domain/campaigns/types'. */
export type CampaignObjective = ...;
```

**Pass Criteria:**
- 4 tipos têm JSDoc @deprecated
- Cada JSDoc inclui path do novo tipo
- Mensagem clara sobre legado

---

### Test 5: Importers Validation (Zero Breaking Changes)
**Objetivo:** Confirmar que TODOS os 8 importadores listados na story compilam após mudanças

**Procedure:**
1. Executar `npm run typecheck` (global)
2. Confirmar 0 errors
3. Executar grep para confirmar que importadores existem:
```powershell
Get-Content lib/campaigns/selectors.ts | Select-String "import.*Campaign"
Get-Content lib/domain/weekly-plans/types.ts | Select-String "import.*CampaignCanonicalContentType"
Get-Content lib/domain/weekly-plans/mapper.ts | Select-String "import.*CampaignCanonicalContentType"
Get-Content app/dashboard/plans/_components/types.ts | Select-String "import.*Campaign"
Get-Content app/dashboard/campaigns/new/_components/types.ts | Select-String "import.*CampaignCanonicalContentType"
Get-Content lib/domain/campaigns/mapper.ts | Select-String "import.*Campaign"
```

**Expected Result:**
- `npm run typecheck`: 0 errors
- Grep: Cada importador lista acima retorna match (confirma que arquivo importa o tipo)

**Pass Criteria:**
- Typecheck global passa
- Todos os 8 importadores existem e importam tipos corretos
- Nenhum importador quebrado

---

### Test 6: File Integrity (No Deletions)
**Objetivo:** Confirmar que NENHUM arquivo foi deletado (apenas modificados com @deprecated)

**Procedure:**
1. Verificar existência de arquivos:
```powershell
Test-Path lib/campaigns/types.ts
Test-Path lib/campaigns/contracts.ts
Test-Path lib/domain/campaigns/types.ts
```

2. Confirmar que git diff NÃO mostra deletions de arquivos:
```powershell
git status
git diff --stat
```

**Expected Result:**
```
lib/campaigns/types.ts: True
lib/campaigns/contracts.ts: True
lib/domain/campaigns/types.ts: True

git diff --stat:
lib/domain/campaigns/types.ts | X insertions, Y deletions
lib/campaigns/types.ts | Z insertions (apenas JSDoc)
lib/campaigns/contracts.ts | W insertions (apenas JSDoc)
(NO file deletions)
```

**Pass Criteria:**
- Todos os arquivos existem
- Git diff mostra apenas modifications, não deletions

---

### Test 7: Definition of Done Completion
**Objetivo:** Validar que DoD na story foi marcado completo

**Procedure:**
1. Ler `docs/stories/2.2.story.md` seção "Definition of Done"
2. Verificar que todos os 9 checkboxes estão marcados: `[x]`
3. Confirmar que File List na story lista os 3 arquivos modificados

**Expected Result:**
```markdown
## Definition of Done

- [x] lib/domain/campaigns/types.ts exporta Campaign como re-export de CampaignDomain
- [x] lib/domain/campaigns/types.ts exporta ContentType como alias de CampaignCanonicalContentType
- [x] lib/domain/campaigns/types.ts exporta Objective como alias de CampaignObjective
- [x] ContentType é fechado: teste com "info" REJEITA
- [x] lib/campaigns/types.ts → Campaign marcado @deprecated
- [x] lib/campaigns/contracts.ts → tipos marcados @deprecated
- [x] npm run typecheck passa com 0 erros
- [x] Todos os 8 importadores compilam
- [x] Nenhum arquivo deletado
```

**Pass Criteria:** 9/9 checkboxes marcados

---

## 🔍 Failure Modes & Diagnostics

### Failure Mode 1: Typecheck falha após Etapa 1 (types.ts refactor)
**Symptom:** `npm run typecheck` retorna erros após re-export de `CampaignDomain`

**Root Cause:** 
- `CampaignDomain` não existe em schemas.ts (Story 2.1 não entregue)
- Sintaxe de re-export incorreta (`export type` omitido)

**Diagnostic:**
```powershell
# Verificar se CampaignDomain existe
Get-Content lib/domain/campaigns/schemas.ts | Select-String "export type CampaignDomain"
```

**Fix:**
- Se `CampaignDomain` não existe → BLOCK, Story 2.1 deve ser concluída primeiro
- Se sintaxe incorreta → Corrigir para `export type { CampaignDomain as Campaign } from "./schemas"`

---

### Failure Mode 2: Teste "info" NÃO rejeita (ContentType aberto)
**Symptom:** `const x: ContentType = "info"` compila sem erro

**Root Cause:**
- `ContentType` não é alias de `CampaignCanonicalContentType`
- `ContentType` foi definido como `CampaignReadableContentType` (que inclui "info")

**Diagnostic:**
```powershell
Get-Content lib/domain/campaigns/types.ts | Select-String "export type ContentType"
```

**Expected:** `export type ContentType = CampaignCanonicalContentType;`  
**If found:** `export type ContentType = CampaignReadableContentType;` → FAIL

**Fix:** Alterar para `ContentType = CampaignCanonicalContentType` (3 valores apenas)

---

### Failure Mode 3: Importadores quebrados após mudanças
**Symptom:** `npm run typecheck` mostra erros em selectors.ts, mapper.ts, etc.

**Root Cause:**
- `Campaign` re-export quebrou compatibilidade estrutural
- Importadores usam campos que não existem em `CampaignDomain`

**Diagnostic:**
```powershell
npm run typecheck 2>&1 | Select-String "error TS"
# Identificar qual arquivo e qual campo está causando erro
```

**Fix:**
- Se `CampaignDomain` falta campos que `Campaign` manual tinha → Reportar para @architect (schema incompleto)
- Se campos foram renomeados → Verificar snake_case vs camelCase

---

### Failure Mode 4: JSDoc @deprecated incompleto
**Symptom:** Tipos legados têm `@deprecated` mas sem referência ao novo tipo

**Root Cause:** @dev esqueceu de incluir path completo no JSDoc

**Diagnostic:**
```powershell
Get-Content lib/campaigns/types.ts | Select-String -Pattern "@deprecated" -Context 0,2
```

**Expected:** JSDoc com 2 linhas: `@deprecated Use X from 'Y'` + razão

**Fix:** Adicionar path completo: `@deprecated Use Campaign from '@/lib/domain/campaigns/types'`

---

## 📊 Metrics Collection

### How to Collect Metrics

1. **Checkpoint compliance:**
   - Revisar terminal history: `Get-History | Where-Object { $_.CommandLine -match "typecheck" }`
   - Contar ocorrências (target: 4)

2. **Zero breaking changes:**
   - Output de `npm run typecheck` final
   - Contar erros: `npm run typecheck 2>&1 | Select-String "error" | Measure-Object`

3. **ContentType restriction:**
   - Executar teste "info" (Test 3)
   - Verificar que erro TS2322 é retornado

4. **Time to complete:**
   - Timestamp início (first commit after story marked Ready)
   - Timestamp fim (commit "refactor: consolidate domain types")
   - Delta: target 2-3h

### Baseline (Story 2.1 Execution)
- Checkpoints: 4/4 (100%)
- Breaking changes: 0
- Time: ~2.5h
- CodeRabbit score: 9.5/10

### Target (Story 2.2)
- Checkpoints: 4/4 (100%)
- Breaking changes: 0
- ContentType test: "info" rejected
- Time: 2-3h
- CodeRabbit score: ≥8/10

---

## ✅ Acceptance Criteria for This Testing Strategy

- [ ] 7 validation tests definidos com pass criteria claros
- [ ] 4 failure modes documentados com diagnostics + fixes
- [ ] Metrics collection procedure descrito
- [ ] Baseline e target metrics definidos

---

## 📝 Test Execution Log

| Test | Result | Evidence | Notes |
|------|--------|----------|-------|
| Test 1: Checkpoints | TBD | Terminal history | Target: 4/4 |
| Test 2: Zod Inference | TBD | types.ts code review | Campaign is re-export |
| Test 3: ContentType Restriction | TBD | tsc output | "info" rejected |
| Test 4: Deprecation Completeness | TBD | JSDoc review | 4 types marked |
| Test 5: Importers Validation | TBD | typecheck output | 0 errors |
| Test 6: File Integrity | TBD | git status | No deletions |
| Test 7: DoD Completion | TBD | Story file | 9/9 checked |

---

## 🔄 Post-Implementation Review

### Questions for @dev (after completion):

1. **Checkpoints:** Quantos typecheck executions foram necessários antes de Checkpoint 4 passar?
2. **Blockers:** Algum erro inesperado durante refatoração? Qual e como resolveu?
3. **ContentType test:** Teste "info" rejeitou na primeira tentativa ou precisou ajustar?
4. **Time:** Tempo total desde início até commit? Dentro de 2-3h?
5. **CodeRabbit:** Auto-review sugeriu algum fix? Se sim, qual?

### Retrospective Actions:
- Se checkpoints falharam múltiplas vezes → Revisar se prompt foi claro sobre sintaxe de re-export
- Se teste "info" passou (falso positivo) → Reforçar instrução de ContentType canônico no prompt
- Se tempo >3h → Investigar se dev notes na story foram suficientes

---

**Next Steps:**
1. @dev executa implementação seguindo prompt
2. @qa executa Tests 1-7 durante/após implementação
3. Preencher Test Execution Log
4. Se ≥6/7 tests passed → APPROVE para QA Gate
5. Se <6/7 tests passed → ITERATE (corrigir failures e re-testar)

---

**Status:** ✅ Testing Strategy Ready  
**Estimated Test Execution Time:** 30-45 min (paralelo com implementação)  
**Risk Level:** 🟢 Low (testes automáticos + typecheck determinístico)
