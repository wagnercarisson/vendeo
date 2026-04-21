# Prompt: @sm — Criar Story 2.5 (Consolidação de Selectors)

---

## 📋 ANALYSIS

**Why this prompt structure:**

1. **Mandatory Discovery (Conflict Detection):** grep + read selectors.ts e logic.ts ANTES de draftar — detectar duplicatas e divergências.

2. **Conflict Resolution Table:** Tabela explícita com 4 conflitos + decisão recomendada para cada — força decisões claras.

3. **Deprecation Pattern:** Re-exports em logic.ts para backward compatibility — zero breaking changes para código legado.

4. **Test Fixture Requirement:** CAMPAIGN_FIXTURE completo — garante testes cobrem cenários reais.

5. **6-Step CoT:** Discovery → Conflicts → Cross-Story → AC → Risks → DoD — progressão lógica com decisões antes de AC.

**Model Recommendation:** Claude Sonnet 4.6 (1x) — MEDIUM RISK refactoring com conflict resolution.

---

## 🤖 SYSTEM PROMPT

Copie tudo abaixo desta linha e envie para @sm.

---

<context>
**Projeto:** Vendeo — sales engine para lojas físicas (Next.js + TypeScript + Supabase)

**Story:** 2.5 — Consolidação de Selectors  
**Epic:** Epic 2 — Arquitetura de Campanhas  
**Dependencies:** Story 2.2 ✅ (Campaign type), Story 2.4 ✅ (mappers refatorados)

**Objetivo:** Consolidar todas as funções puras de campanha em selectors.ts, eliminando duplicatas e divergências entre logic.ts e selectors.ts.

**Complexity:** 🟡 **MEDIUM RISK** — Refactoring com backward compatibility via re-exports

**Esforço:** 2-3h  
**Blocks:** Story 2.6 (Integration precisa de selectors consolidados)
</context>

---

<requirements>
## User Story

Como equipe de engenharia do Vendeo,  
Quero consolidar todas as funções puras de campanha em selectors.ts, eliminando duplicatas e divergências entre logic.ts e selectors.ts,  
Para ter uma única fonte de verdade para seletores, melhorar testabilidade e reduzir confusão sobre qual função usar.

---

## Objective

**Problema:** Atualmente temos 2 arquivos com funções similares:
- `lib/domain/campaigns/selectors.ts` (10 funções já existentes)
- `lib/domain/campaigns/logic.ts` (10 funções, algumas duplicadas, algumas únicas)

**Duplicatas detectadas:**
- `hasAnyVisualAsset()` — Lógicas diferentes (campos vs status)
- `getCampaignDisplayStatuses()` — Implementação quase idêntica

**Divergências:**
- `getContentState()` (logic) vs `getUIStatus()` (selectors) — Retornos diferentes
- `calculateGlobalStatus()` (logic) vs `getGlobalStatus()` (selectors) — Algoritmos diferentes

**Solução:** Migrar funções únicas para selectors.ts, deprecar logic.ts com re-exports, resolver conflitos com renomeações claras.

---

## Acceptance Criteria

```gherkin
DADO que selectors.ts contém 10 funções e logic.ts contém 10 funções (com duplicatas)
QUANDO todas as funções únicas de logic.ts forem migradas para selectors.ts
ENTÃO selectors.ts deve conter 16+ funções (10 existentes + 6 migradas)
E logic.ts deve estar marcado como @deprecated com re-exports funcionais
E zero duplicatas devem existir (mesma função em ambos os arquivos)
E testes verificam: funções únicas funcionam, re-exports funcionam, nenhuma regressão
```

```gherkin
DADO que hasAnyVisualAsset() existe em logic.ts (verifica campos) e selectors.ts (verifica status)
QUANDO conflito de nome for resolvido
ENTÃO logic.hasAnyVisualAsset() deve ser renomeada para hasGeneratedVisualAsset() em selectors.ts
E selectors.hasAnyVisualAsset() deve manter nome original (verifica status)
E ambas devem ter JSDoc clara explicando diferença
E testes verificam: ambas retornam valores corretos, usos diferentes são claros
```

```gherkin
DADO que getCampaignDisplayStatuses() existe em logic.ts e selectors.ts (duplicata idêntica)
QUANDO duplicata for eliminada
ENTÃO selectors.ts mantém a função
E logic.ts cria re-export: export { getCampaignDisplayStatuses } from './selectors'
E JSDoc marca logic.ts como @deprecated
E testes verificam: import de logic.ts funciona (backward compatibility)
```

```gherkin
DADO que funções migradas precisam estar em selectors.ts
QUANDO hasGeneratedArt(), hasGeneratedCampaignContent(), hasGeneratedVideo(), getCampaignListStatus(), getCampaignStatusLine() forem adicionadas
ENTÃO cada função deve ter JSDoc com @example mostrando uso
E cada função deve ter type signature explícita (c: Campaign): ReturnType
E testes verificam: happy path com Campaign completo, edge cases (campos null, status "none")
```

```gherkin
DADO que lib/domain/campaigns/selectors.test.ts deve validar todos os selectors
QUANDO testes forem criados (ou expandidos se arquivo existe)
ENTÃO cada função deve ter mínimo 2 cenários: happy path + edge case
E fixture CAMPAIGN_FIXTURE deve ter todos os campos (post_status, reels_status, image_url, ai_caption, reels_script, etc.)
E npm test passa com 0 falhas
E npm run typecheck passa com 0 erros
```

---

## Scope

### IN SCOPE:
✅ Migrar 6+ funções únicas de logic.ts → selectors.ts  
✅ Resolver 2 conflitos de nome (hasAnyVisualAsset, calculateGlobalStatus)  
✅ Eliminar 2 duplicatas (getCampaignDisplayStatuses, etc.)  
✅ Deprecar logic.ts com re-exports e JSDoc @deprecated  
✅ Criar/expandir selectors.test.ts com fixture completa  
✅ Atualizar File List com 3 arquivos principais

### OUT OF SCOPE:
❌ Atualizar imports em app/components/lib (Story 2.5 implementa, não drafta)  
❌ Deletar logic.ts (manter com re-exports para backward compatibility)  
❌ Modificar assinaturas de funções existentes em selectors.ts (zero breaking changes)  
❌ Criar novos selectors além dos 6 listados (escopo fixo)

---

## Discovery Requirements (MANDATORY — Passo 1 do CoT)

ANTES de escrever AC ou DoD, você DEVE executar discovery:

### Discovery Step 1: List Functions
```bash
# Terminal 1: Funções em selectors.ts
grep -E "^export (const|function)" lib/domain/campaigns/selectors.ts

# Terminal 2: Funções em logic.ts
grep -E "^export (const|function)" lib/domain/campaigns/logic.ts
```

**Expected output:** Lista de ~10 funções em cada arquivo.

### Discovery Step 2: Read selectors.ts
```bash
# Ler arquivo completo
cat lib/domain/campaigns/selectors.ts
```

**Objetivo:** Entender funções existentes e patterns usados (hasArt, hasVideo, getUIStatus, etc.).

### Discovery Step 3: Read logic.ts
```bash
# Ler arquivo completo
cat lib/domain/campaigns/logic.ts
```

**Objetivo:** Detectar funções únicas vs duplicatas vs divergências.

### Discovery Step 4: Conflict Detection
**Você DEVE criar uma tabela com TODOS os conflitos detectados:**

| Conflito | logic.ts | selectors.ts | Decisão | Rationale |
|----------|----------|--------------|---------|-----------|
| `hasAnyVisualAsset()` | Verifica `image_url \|\| reels_script` | Verifica `hasArt() \|\| hasVideo()` | Manter ambas — Renomear logic para `hasGeneratedVisualAsset()` | Lógicas diferentes: campos vs status |
| `getCampaignDisplayStatuses()` | Duplicata idêntica | Duplicata idêntica | Deletar de logic.ts, re-export de selectors | Implementação idêntica |
| `getContentState()` vs `getUIStatus()` | Retorna "art_and_video" | Retorna "complete" | Manter ambas | Tipos de retorno diferentes (ContentState vs UIStatus) |
| `calculateGlobalStatus()` vs `getGlobalStatus()` | Usa scores (min) | Usa statuses.includes | Reconciliar — Validar equivalência ou manter ambas | Algoritmos diferentes |

---

## Conflict Resolution Decisions (MANDATORY — Passo 2 do CoT)

Para CADA conflito na tabela acima, você DEVE documentar:

### Decision 1: hasAnyVisualAsset Conflict
**Opção A (logic):** Verifica presença de campos (`image_url || reels_script`)  
**Opção B (selectors):** Verifica status de geração (`hasArt() || hasVideo()`)  
**Decisão:** Manter ambas com nomes diferentes
- `hasAnyVisualAsset()` permanece em selectors.ts (status-based)
- `hasGeneratedVisualAsset()` migra de logic.ts para selectors.ts (field-based)
**Rationale:** Uso semântico diferente — status vs campos preenchidos

### Decision 2: getCampaignDisplayStatuses Duplicata
**Análise:** Implementações idênticas em ambos os arquivos  
**Decisão:** Deletar de logic.ts, criar re-export
```typescript
/** @deprecated Use from './selectors' instead */
export { getCampaignDisplayStatuses } from './selectors';
```
**Rationale:** Backward compatibility mantida, zero breaking changes

### Decision 3: getContentState vs getUIStatus
**Análise:** Nomes diferentes, tipos de retorno diferentes  
**Decisão:** Manter ambas (não são duplicatas)
- `getContentState()`: Retorna `"art_and_video"|"art_only"|"video_only"|"none"` (ContentState)
- `getUIStatus()`: Retorna `"complete"|"art"|"video"|"none"` (UIStatus)
**Rationale:** Tipos diferentes para contextos diferentes (ContentState vs UI labels)

### Decision 4: calculateGlobalStatus vs getGlobalStatus
**Análise:** Algoritmos diferentes (scores vs includes)  
**Decisão:** Validar equivalência com testes — Se equivalentes, deletar calculateGlobalStatus; Se não, manter ambas com nomes claros  
**Rationale:** Precisa de testes para confirmar se são intercambiáveis

---

## Cross-Story Decisions (Passo 3 do CoT)

Referências a decisões de stories anteriores:

| Story | Decision | Impact on 2.5 |
|-------|----------|---------------|
| 2.1 | `CampaignStatusSchema` define "draft"\|"ready"\|"approved" | Selectors usam esses statuses (getGlobalStatus, isCampaignReady) |
| 2.2 | `Campaign` type com 40+ campos | Selectors acessam post_status, reels_status, image_url, ai_caption, reels_script |
| 2.4 | Mappers usam `.safeParse()` para validação | Selectors são funções puras (não validam, assumem Campaign válido) |

</requirements>

---

<implementation_guidance>
## Chain-of-Thought Workflow (6 Passos)

### Passo 1: DISCOVERY (MANDATORY)
Execute os 4 discovery steps listados acima ANTES de escrever AC.

### Passo 2: CONFLICT RESOLUTION
Crie tabela de conflitos + 4 decisões (uma por conflito).

### Passo 3: CROSS-STORY DECISIONS
Adicione tabela com ≥3 referências a Stories 2.1, 2.2, 2.4.

### Passo 4: ACCEPTANCE CRITERIA
Escreva AC usando format Gherkin:
- Migração de funções (6 funções)
- Conflito de nomes (hasAnyVisualAsset → hasGeneratedVisualAsset)
- Duplicatas eliminadas (getCampaignDisplayStatuses)
- Deprecation pattern (re-exports em logic.ts)
- Testes (selectors.test.ts com fixture)

### Passo 5: RISKS & MITIGATIONS
Liste 4-5 riscos com severidade 🔴/🟡/🟢:
- Lógicas divergentes entre duplicatas (🔴 HIGH)
- Quebra de imports legados (🟡 MEDIUM)
- Testes insuficientes (🟡 MEDIUM)
- Confusão sobre qual função usar (🟢 LOW)

### Passo 6: DEFINITION OF DONE
Checklist com 10-12 itens:
- [ ] 6+ funções migradas para selectors.ts
- [ ] Conflito hasAnyVisualAsset resolvido (renomeado para hasGeneratedVisualAsset)
- [ ] Duplicata getCampaignDisplayStatuses eliminada
- [ ] logic.ts marcado @deprecated com re-exports
- [ ] selectors.test.ts com CAMPAIGN_FIXTURE completa
- [ ] Cada função tem JSDoc com @example
- [ ] npm run typecheck passa
- [ ] npm test passa (selectors.test.ts)

---

## Dev Notes Section (MANDATORY)

Você DEVE incluir uma seção "Dev Notes" com:

### Pattern de Migração (3 exemplos de código):

**Para funções únicas (sem conflito):**
```typescript
// selectors.ts
/**
 * Verifica se a campanha tem conteúdo textual gerado pela IA.
 * @example hasGeneratedCampaignContent(campaign) // true se ai_caption ou ai_text existem
 */
export const hasGeneratedCampaignContent = (c: Campaign): boolean =>
  !!(c.ai_caption || c.ai_text || c.ai_cta);
```

**Para duplicatas (logic.ts deprecado):**
```typescript
// logic.ts
/**
 * @deprecated Use `getCampaignDisplayStatuses` from './selectors' instead
 */
export { getCampaignDisplayStatuses } from './selectors';
```

**Para conflitos (ambas mantidas, rename necessário):**
```typescript
// selectors.ts
export const hasAnyVisualAsset = (c: Campaign): boolean =>
  hasArt(c) || hasVideo(c); // Verifica STATUS

export const hasGeneratedVisualAsset = (c: Campaign): boolean =>
  !!(c.image_url || c.reels_script); // Verifica CAMPOS
```

### Fixture para Testes:
```typescript
const CAMPAIGN_FIXTURE: Campaign = {
  id: "test-123",
  store_id: "store-456",
  post_status: "ready",
  reels_status: "approved",
  campaign_type: "both",
  content_type: "product",
  image_url: "https://example.com/img.jpg",
  ai_caption: "Test caption",
  ai_text: "Test text",
  reels_script: "Test script",
  reels_hook: "Hook",
  product_name: "Test Product",
  // ... demais campos
};
```

---

## File List (MANDATORY)

| File | Action | Notes |
|------|--------|-------|
| `lib/domain/campaigns/selectors.ts` | **Add** | Migrar 6 funções de logic.ts + resolver conflitos (16+ funções total) |
| `lib/domain/campaigns/logic.ts` | **Deprecate** | Marcar @deprecated, criar re-exports, manter arquivo para backward compatibility |
| `lib/domain/campaigns/selectors.test.ts` | **Create/Expand** | Testes unit para cada selector (2+ cenários por função) |
| `lib/domain/campaigns/types.ts` | **Read** | Fonte de Campaign type — não modificar |

</implementation_guidance>

---

<validation>
## Story Validation Checklist (for @po)

Esta story está pronta para @po quando:

- ✅ Discovery executado (4 steps: list, read, read, conflict table)
- ✅ Tabela de conflitos com 4 conflitos + decisões
- ✅ Cross-Story Decisions (≥3 referências a Stories 2.1/2.2/2.4)
- ✅ AC em Gherkin (5 cenários: migração, conflito, duplicata, deprecation, testes)
- ✅ Risks listados (4-5 riscos com severidade)
- ✅ DoD checklist (10-12 itens)
- ✅ Dev Notes com 3 code examples + fixture
- ✅ File List com 4 arquivos

</validation>

---

<instructions>
1. **Execute Discovery** (Passo 1) — grep + read selectors.ts e logic.ts
2. **Crie Conflict Table** (Passo 2) — 4 conflitos + decisões
3. **Adicione Cross-Story Decisions** (Passo 3) — ≥3 referências
4. **Escreva AC** (Passo 4) — 5 cenários Gherkin
5. **Liste Risks** (Passo 5) — 4-5 riscos com mitigações
6. **Crie DoD** (Passo 6) — 10-12 checklist items
7. **Escreva Dev Notes** — 3 code examples + fixture
8. **Preencha File List** — 4 arquivos com actions
9. **Salve story** em `docs/stories/2.5.story.md`
10. **NÃO commit** — aguardar @po validation
11. **Reporte para @po** quando pronto
</instructions>

---

<anti_patterns>
❌ **NEVER DO:**
- Pular Discovery (MANDATORY antes de escrever AC)
- Criar AC sem tabela de conflitos (decisões devem vir antes)
- Ignorar conflitos (hasAnyVisualAsset DEVE ser resolvido)
- Deletar logic.ts (MUST manter para backward compatibility)
- Modificar assinaturas de funções existentes em selectors.ts (zero breaking changes)
- Criar testes sem CAMPAIGN_FIXTURE completa (fixture DEVE ter 20+ campos)

✅ **ALWAYS DO:**
- Discovery ANTES de AC (grep → read → conflict table)
- Resolver TODOS os conflitos na tabela (4 decisões explícitas)
- Re-exports em logic.ts (backward compatibility)
- JSDoc @deprecated em TODAS as funções de logic.ts
- CAMPAIGN_FIXTURE com campos reais (post_status, reels_status, image_url, etc.)
- Mínimo 2 cenários por função nos testes
</anti_patterns>

---

**END OF PROMPT**
