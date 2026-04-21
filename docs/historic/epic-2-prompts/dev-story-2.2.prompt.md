# Prompt: @dev — Implementar Story 2.2 (Tipos de Domínio Centralizados)

---

## 📋 ANALYSIS

**Why this prompt structure:**

1. **Imperative Directives:** @dev precisa de comandos executáveis, não abstrações — "Substitua X por Y", "Execute grep", "Valide com typecheck".

2. **Code-First Examples:** Prompts para devs devem incluir código literal copiável — reduz ambiguidade e acelera implementação.

3. **Checkpoint Validation:** Typecheck APÓS cada mudança de arquivo (incremental) — detecta breaking changes imediatamente, não no final.

4. **Diff-Based Reasoning:** Mostrar BEFORE/AFTER concreto para cada refatoração — elimina "como fazer isso?" questions.

5. **Zero Ambiguity on Zod Inference:** Fornecer sintaxe exata de re-export (`export type { X as Y }` vs `export type Y = X`) — previne erros de sintaxe.

**Alignment with AIOX Constitution:**
- Article III (Story-Driven): Implementar EXATAMENTE o que AC especifica — sem gold-plating
- Article V (Quality First): Checkpoint typecheck + CodeRabbit auto-review
- Article IV (No Invention): Usar APENAS tipos descobertos via grep — zero tipos inventados

**Model Recommendation:** Claude Sonnet 4.6 (1x) — tarefa complexa com raciocínio estruturado e validação incremental.

**Self-Healing Integration:** CodeRabbit configurado para auto-review regression + correctness (path_instructions em Story 2.2).

---

## 🤖 SYSTEM PROMPT

Copie tudo abaixo desta linha e envie para @dev.

---

<context>
**Projeto:** Vendeo — sales engine para lojas físicas (Next.js + TypeScript + Supabase)

**Story:** 2.2 — Tipos de Domínio Centralizados  
**Status:** Ready (validado @po 10/10)  
**Epic:** Epic 2 — Arquitetura de Campanhas

**Dependency:** Story 2.1 ✅ (schemas.ts com `CampaignDomainSchema` + `CampaignDomain` entregues)

**Objetivo:** Refatorar `lib/domain/campaigns/types.ts` para que `Campaign`, `ContentType` e `Objective` sejam re-exports/aliases de tipos Zod-inferred. Marcar tipos duplicados em `lib/campaigns/` como `@deprecated`.

**Files modificados:** 3 arquivos (types.ts, contracts.ts, campaigns/types.ts)  
**Files validados:** 8 importadores (typecheck após mudanças)

**Esforço:** 2-3h  
**Modo recomendado:** Interactive (checkpoints educacionais para type system changes)
</context>

---

<critical_requirements>
1. **Zod Inference OBRIGATÓRIA:** `Campaign` DEVE ser re-export de `CampaignDomain` (`z.infer<typeof CampaignDomainSchema>`). Nunca interface manual.

2. **ContentType FECHADO:** Exatamente `"product" | "service" | "message"`. Alias de `CampaignCanonicalContentType`. `"info"` NÃO é atribuível.

3. **Zero breaking changes:** `npm run typecheck` DEVE passar após CADA arquivo modificado. Se falhar, rollback e corrigir.

4. **Deprecation (não deletion):** Marcar `@deprecated` com JSDoc completo. NUNCA deletar arquivos ou tipos.

5. **Checkpoint incremental:** Execute typecheck APÓS cada etapa (4 checkpoints total). Reporte resultado ANTES de prosseguir.

6. **Importadores validados:** Confirmar via grep que todos os 8 importadores listados na story compilam após mudanças.
</critical_requirements>

---

<implementation_plan>
## Workflow Incremental (4 Etapas + 4 Checkpoints)

### Etapa 1: Refatorar lib/domain/campaigns/types.ts
**Ação:** Substituir `Campaign` interface manual por re-export de `CampaignDomain`.

**BEFORE (atual — manual):**
```typescript
export interface Campaign {
  id: string;
  store_id: string;
  product_name: string | null;
  // ... 30+ campos escritos manualmente
}
```

**AFTER (target — Zod-inferred):**
```typescript
// Re-export CampaignDomain de schemas.ts como Campaign
export type { CampaignDomain as Campaign } from "./schemas";

// Adicionar exports de tipos canônicos
import type { CampaignCanonicalContentType } from "./types"; // já existe
export type ContentType = CampaignCanonicalContentType; // alias

// Objective — alias de CampaignObjective de constants/strategy
export type { CampaignObjective as Objective } from "@/lib/constants/strategy";
```

**Checkpoint 1:**
```powershell
npm run typecheck 2>&1 | Select-String "error"
```
**Expected:** Zero erros. Se houver erro, PARE e reporte.

---

### Etapa 2: Marcar @deprecated em lib/campaigns/types.ts
**Ação:** Adicionar JSDoc `@deprecated` na interface `Campaign` (camelCase — legado).

**BEFORE:**
```typescript
export interface Campaign {
  id: string;
  storeId: string; // camelCase — diferente de domain (snake_case)
  productName: string | null;
  // ...
}
```

**AFTER:**
```typescript
/**
 * @deprecated Use Campaign from '@/lib/domain/campaigns/types' (snake_case fields).
 * Este arquivo (lib/campaigns/) é a camada legada. Migrar para lib/domain/campaigns/.
 */
export interface Campaign {
  id: string;
  storeId: string;
  productName: string | null;
  // ...
}
```

**Checkpoint 2:**
```powershell
npm run typecheck 2>&1 | Select-String "error"
```
**Expected:** Zero erros (JSDoc não afeta compilação). Confirmar que deprecation aparece no IntelliSense.

---

### Etapa 3: Marcar @deprecated em lib/campaigns/contracts.ts
**Ação:** Adicionar JSDoc `@deprecated` em `CampaignStatus`, `CampaignStrategy`, `CampaignObjective`.

**BEFORE:**
```typescript
export type CampaignStatus = (typeof CAMPAIGN_STATUS)[number];

export type CampaignStrategy = (typeof CAMPAIGN_STRATEGIES)[number];

export type CampaignObjective = OfficialCampaignObjective;
```

**AFTER:**
```typescript
/**
 * @deprecated Use CampaignStatus from '@/lib/domain/campaigns/types' when available.
 * Tipo legado — migrar para domain layer.
 */
export type CampaignStatus = (typeof CAMPAIGN_STATUS)[number];

/**
 * @deprecated CampaignStrategy (uppercase) é legado. Use tipos de lib/domain/campaigns/ quando disponíveis.
 */
export type CampaignStrategy = (typeof CAMPAIGN_STRATEGIES)[number];

/**
 * @deprecated Use CampaignObjective from '@/lib/constants/strategy' diretamente, ou Objective from '@/lib/domain/campaigns/types'.
 */
export type CampaignObjective = OfficialCampaignObjective;
```

**Checkpoint 3:**
```powershell
npm run typecheck 2>&1 | Select-String "error"
```
**Expected:** Zero erros.

---

### Etapa 4: Validar importadores
**Ação:** Executar typecheck final E verificar via grep que importadores listados compilam.

**Importadores a validar (da story):**
1. `lib/campaigns/selectors.ts` → importa `Campaign`
2. `lib/domain/weekly-plans/types.ts` → importa `CampaignCanonicalContentType`
3. `lib/domain/weekly-plans/mapper.ts` → importa `CampaignCanonicalContentType`
4. `app/dashboard/plans/_components/types.ts` → importa `Campaign`
5. `app/dashboard/campaigns/new/_components/types.ts` → importa `CampaignCanonicalContentType`
6. `lib/domain/campaigns/mapper.ts` → importa múltiplos tipos
7. `app/dashboard/campaigns/[id]/edit/types.ts` (se existir)
8. `lib/domain/campaigns/service.ts` (se existir)

**Comando:**
```powershell
npm run typecheck
```

**Checkpoint 4 (FINAL):**
```powershell
# Confirmar zero erros globais
npm run typecheck

# Confirmar ContentType fechado (deve rejeitar "info")
# Criar teste temporário:
echo 'import { ContentType } from "@/lib/domain/campaigns/types"; const x: ContentType = "info";' > test-content-type.ts
npx tsc --noEmit test-content-type.ts
# Expected: Erro "Type '"info"' is not assignable to type 'ContentType'"
# Se passar SEM erro, ContentType NÃO está fechado — FALHA
rm test-content-type.ts
```

**Expected:** Typecheck passa + teste "info" REJEITA.

</implementation_plan>

---

<code_examples>
### Exemplo 1: Re-export com alias (sintaxe TypeScript)

**Opção A — Re-export direto com alias:**
```typescript
// types.ts
export type { CampaignDomain as Campaign } from "./schemas";
```

**Opção B — Import + re-export (equivalente):**
```typescript
// types.ts
import type { CampaignDomain } from "./schemas";
export type Campaign = CampaignDomain;
```

**Escolha:** Opção A (mais concisa, semanticamente clara).

---

### Exemplo 2: ContentType canônico (fechado)

**CORRETO (fechado — apenas 3 valores):**
```typescript
// types.ts
export type CampaignCanonicalContentType = "product" | "service" | "message"; // JÁ EXISTE
export type ContentType = CampaignCanonicalContentType; // alias
```

**Teste de validação:**
```typescript
// Deve COMPILAR:
const valid: ContentType = "product"; // ✅

// Deve REJEITAR:
const invalid: ContentType = "info"; // ❌ Type '"info"' is not assignable
```

---

### Exemplo 3: JSDoc @deprecated completo

**Template:**
```typescript
/**
 * @deprecated Use {NewType} from '{NewPath}'.
 * {Razão da deprecação — ex: "Este arquivo é camada legada"}.
 */
export type OldType = ...;
```

**Aplicado:**
```typescript
/**
 * @deprecated Use Campaign from '@/lib/domain/campaigns/types' (snake_case fields).
 * Este arquivo (lib/campaigns/) é a camada legada. Migrar para lib/domain/campaigns/.
 */
export interface Campaign { ... }
```

</code_examples>

---

<validation_checklist>
## Definition of Done (copie da story)

Marque cada item APÓS confirmar:

- [ ] `lib/domain/campaigns/types.ts` exporta `Campaign` como re-export de `CampaignDomain`
- [ ] `lib/domain/campaigns/types.ts` exporta `ContentType` como alias de `CampaignCanonicalContentType`
- [ ] `lib/domain/campaigns/types.ts` exporta `Objective` como alias de `CampaignObjective`
- [ ] `ContentType` é fechado: teste com `"info"` REJEITA (Checkpoint 4)
- [ ] `lib/campaigns/types.ts` → `Campaign` marcado `@deprecated` com JSDoc
- [ ] `lib/campaigns/contracts.ts` → `CampaignStatus`, `CampaignStrategy`, `CampaignObjective` marcados `@deprecated`
- [ ] `npm run typecheck` passa com 0 erros (Checkpoint 4)
- [ ] Todos os 8 importadores listados compilam sem erros
- [ ] Nenhum arquivo deletado

**Reporte:** Ao marcar DoD completo, forneça output de `npm run typecheck` e confirme que teste "info" rejeitou.

</validation_checklist>

---

<instructions>
1. **Leia schemas.ts** para confirmar que `CampaignDomain` existe (Story 2.1 entregou)
2. **Execute Etapa 1** → Refatorar types.ts → **Checkpoint 1** (typecheck)
3. **Execute Etapa 2** → Marcar @deprecated em campaigns/types.ts → **Checkpoint 2** (typecheck)
4. **Execute Etapa 3** → Marcar @deprecated em campaigns/contracts.ts → **Checkpoint 3** (typecheck)
5. **Execute Etapa 4** → Validar importadores → **Checkpoint 4 FINAL** (typecheck + teste "info")
6. **Marque DoD** como completo na story (`docs/stories/2.2.story.md`)
7. **Commit com conventional commit:** `refactor: consolidate domain types to Zod-inferred sources [Story 2.2]`
8. **NÃO push** — aguardar @devops (Article II: Agent Authority)
9. **Reporte para @qa** para QA Gate quando pronto
</instructions>

---

<anti_patterns>
❌ **NEVER DO:**
- Escrever `Campaign` como interface manual (deve ser re-export de Zod)
- Permitir `ContentType` aceitar `"info"` (deve rejeitar)
- Deletar arquivos ou tipos legados (apenas `@deprecated`)
- Prosseguir para próxima etapa se typecheck falhar
- Modificar schemas.ts (fonte de verdade de Story 2.1)
- Alterar lógica de mapper.ts ou selectors.ts (fora do escopo)

✅ **ALWAYS DO:**
- Re-export com alias (`export type { X as Y }`)
- Typecheck após CADA etapa (incremental)
- JSDoc `@deprecated` completo com novo path
- Teste de validação de ContentType fechado (rejeitar "info")
- Reportar resultado de cada checkpoint antes de prosseguir
</anti_patterns>

---

<error_recovery>
### Se Checkpoint falhar (typecheck com erros):

**Erro comum 1:** `Cannot find name 'CampaignDomain'`
**Causa:** schemas.ts não exporta `CampaignDomain`
**Fix:** Verificar que Story 2.1 foi entregue. Ler schemas.ts linhas 88-120 para confirmar export.

**Erro comum 2:** `Type 'CampaignDomain' is not assignable to 'Campaign'`
**Causa:** Shapes incompatíveis entre Zod schema e uso existente
**Fix:** Confirmar que `CampaignDomainSchema` em schemas.ts espelha exatamente a interface `Campaign` atual. Se houver divergência, reportar para @architect.

**Erro comum 3:** `Module '"./schemas"' has no exported member 'CampaignDomain'`
**Causa:** Sintaxe de re-export incorreta
**Fix:** Usar `export type { CampaignDomain as Campaign } from "./schemas";` (com `type` keyword).

**Erro comum 4:** Teste "info" NÃO rejeita (ContentType aberto)
**Causa:** ContentType não é alias de CampaignCanonicalContentType
**Fix:** Confirmar que linha é exatamente: `export type ContentType = CampaignCanonicalContentType;`

</error_recovery>

---

<coderabbit_context>
CodeRabbit está configurado para auto-review (Story 2.2 CodeRabbit Integration section).

**Focus Areas (da story):**
- `Campaign` inferido de `CampaignDomainSchema` (não escrito manualmente)
- `ContentType` restrito a 3 valores
- Tipos em `lib/campaigns/` têm `@deprecated` com JSDoc completo
- Zero breaking changes — typecheck passa

**Path Instructions:**
- `lib/domain/campaigns/types.ts`: Verificar que Campaign é alias de CampaignDomain. ContentType fechado.
- `lib/campaigns/*.ts`: Verificar que tipos @deprecated têm JSDoc completo.

**Self-Healing:** CodeRabbit pode sugerir fixes se detectar regression — revisar antes de aceitar.

</coderabbit_context>

---

**END OF PROMPT**
