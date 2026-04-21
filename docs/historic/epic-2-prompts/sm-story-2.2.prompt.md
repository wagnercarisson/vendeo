# Prompt: @sm — Criar Story 2.2 (Tipos de Domínio Centralizados)

---

## 📋 ANALYSIS

**Why this prompt structure:**

1. **Chain-of-Thought (CoT):** Força @sm a executar grep search ANTES de draftar — previne duplicação e garante mapeamento completo de tipos legados.

2. **XML Tagging:** Separa contexto (CONTEXT), raciocínio obrigatório (THINK), inputs estruturados (INPUT) e formato de saída (OUTPUT) — reduz ambiguidade e melhora aderência.

3. **Few-Shot Examples:** Inclui exemplos concretos de Acceptance Criteria e DoD para garantir testabilidade e rastreabilidade.

4. **Zero-Hallucination Directive:** Instrui explicitamente para usar grep_search e read_file antes de escrever — todos os tipos citados devem existir no codebase.

5. **Token Efficiency:** Prompt compacto (~800 tokens) vs. verbose instructions (~2K+). Foca em imperatives diretos.

**Alignment with AIOX Constitution:**
- Article III (Story-Driven Development): Story completa com AC testáveis e dependencies explícitas
- Article IV (No Invention): Grep search obrigatório antes de draftar — zero tipos inventados
- Article V (Quality First): Cross-Story Decisions table rastreia escolhas críticas

**Model Recommendation:** Claude Sonnet 4.6 (1x) — tarefa requer raciocínio estruturado e aderência a regras.

---

## 🤖 SYSTEM PROMPT

Copie tudo abaixo desta linha e envie para @sm.

---

<context>
**Projeto:** Vendeo — sales engine para lojas físicas (Next.js + TypeScript + Supabase)

**Epic:** Epic 2 — Arquitetura de Campanhas (status: Planning)  
**Objetivo:** Contratos e domínio para prevenir bugs antes de expandir Motor Visual V2

**Story anterior:** 2.1 (Schemas de Validação Zod) — STATUS: Done  
Entregou: `schemas.ts` completo com `AICampaignContentSchema`, `CampaignDomainSchema`, `DbCampaignSchema` + testes 12/12 passing

**Esta story:** 2.2 (Tipos de Domínio Centralizados)  
Criar `lib/domain/campaigns/types.ts` consolidando tipos esparsos em fonte única de verdade, inferidos dos schemas Zod (Story 2.1)
</context>

---

<critical_requirements>
1. **Grep search OBRIGATÓRIO:** Execute `grep_search` no workspace ANTES de draftar para localizar:
   - Todos os arquivos que exportam `Campaign`, `CampaignListItem`, `CampaignDetail`, `ContentType`, `Objective`, `Strategy`, `CampaignStatus`
   - Tipos duplicados ou esparsos em lib/, app/, components/

2. **Inferência de Zod:** TODOS os tipos de domínio DEVEM ser inferidos de schemas Zod via `z.infer<typeof Schema>`

3. **ContentType FECHADO:** Enum canônico restrito a `"product" | "service" | "message"` (decisão aprovada — EXEC-PLAN-EPIC-2.md)

4. **Deprecation (não deletion):** Tipos legados encontrados via grep DEVEM ser marcados `@deprecated` com referência ao novo tipo — NUNCA deletados

5. **Zero breaking changes:** Nenhuma importação existente pode ser quebrada — verificar importadores via grep antes de marcar DoD

6. **Contexto produto:** Vendeo = motor de vendas para lojistas físicos. ContentType = estratégias reais de conteúdo para vendas (produto físico, serviço, mensagem institucional)
</critical_requirements>

---

<think>
**EXECUTE MENTALMENTE ANTES DE DRAFTAR:**

**Passo 1 — Discovery via Grep:**
- Execute `grep_search` para localizar exportações de `Campaign`, `ContentType`, `Objective`, `Strategy` no workspace
- Liste TODOS os arquivos que declaram esses tipos (ex: `lib/domain/campaigns/mapper.ts`, `lib/domain/campaigns/types.ts`, `lib/constants/campaigns.ts`)
- Identifique duplicados ou variantes (ex: `CampaignContentType` vs `ContentType`)

**Passo 2 — Inferência de Schemas:**
- Leia `lib/domain/campaigns/schemas.ts` para confirmar schemas disponíveis
- Verifique que `CampaignDomainSchema` existe (entregue por Story 2.1)
- Planeje inferência: `type Campaign = z.infer<typeof CampaignDomainSchema>`

**Passo 3 — Consolidação sem quebra:**
- Para cada tipo duplicado encontrado, decida:
  - **Manter como canonical** (novo `types.ts`)
  - **Marcar @deprecated** (arquivo antigo com referência)
  - **Re-export seguro** (se usado em múltiplos lugares)

**Passo 4 — Enum ContentType:**
- Confirme que enum usa APENAS `"product" | "service" | "message"`
- Valores legados como `"info"` DEVEM ser marcados deprecated ou removidos do tipo canônico

**Passo 5 — Verificação de importadores:**
- Execute grep para encontrar `import.*Campaign.*from` e `import.*ContentType.*from`
- Liste todos os importadores no File List da story
- Planeje strategy de migração gradual (se necessário)

**Só escreva o story file após completar os 5 passos mentalmente.**
</think>

---

<input>
**Story ID:** 2.2  
**Título:** Tipos de Domínio Centralizados  
**Goal:** Consolidar tipos esparsos em fonte única inferida de schemas Zod

**Esforço:** 2-3h  
**Risco:** Médio (tipos podem estar espalhados em múltiplos arquivos)  
**Testável:** Sim (typecheck + testes de importação)

**Dependencies:**
- **Blocked by:** Story 2.1 (precisa dos schemas Zod)
- **Blocks:** Story 2.3 (contratos de API usam esses tipos)

**Requirements:**
1. Criar `lib/domain/campaigns/types.ts` como fonte única de verdade
2. Inferir tipos de domínio primários de schemas Zod:
   - `Campaign` ← `z.infer<typeof CampaignDomainSchema>`
   - `CampaignListItem` (se houver schema correspondente)
   - `CampaignDetail` (se houver schema correspondente)
3. Definir enums fechados:
   - `ContentType = "product" | "service" | "message"` (canônico)
   - `Objective` (valores de domain logic)
   - `Strategy` (valores de domain logic)
4. Localizar tipos duplicados via grep search
5. Marcar legados como `@deprecated` com JSDoc apontando para novo tipo
6. Atualizar importações críticas (mapper, service, selectors) para usar novo `types.ts`
7. Zero breaking changes — importadores devem continuar funcionando

**Success Criteria:**
- `Campaign`, `ContentType`, `Objective`, `Strategy` exportados de `types.ts`
- Todos os tipos de domínio inferidos de schemas Zod (não manualmente escritos)
- Enum `ContentType` FECHADO (não aceita outros valores)
- Tipos duplicados encontrados via grep marcados `@deprecated`
- `npm run typecheck` passa sem erros
- Nenhuma importação existente quebrada (verificado via grep + typecheck)

**Files:**
- `lib/domain/campaigns/types.ts` (create — fonte única de verdade)
- `lib/domain/campaigns/mapper.ts` (read — verificar imports)
- `lib/domain/campaigns/service.ts` (read — verificar imports)
- `lib/constants/campaigns.ts` (modify — marcar deprecated se existir)
- (Outros arquivos descobertos via grep)
</input>

---

<few_shot_examples>
### Exemplo: Acceptance Criteria (formato Gherkin)

```gherkin
GIVEN schemas.ts com CampaignDomainSchema definido (Story 2.1)
WHEN types.ts for criado com tipos inferidos via z.infer
THEN Campaign é inferido de CampaignDomainSchema
AND ContentType é enum fechado com valores ["product", "service", "message"]
AND nenhum tipo é escrito manualmente (todos inferidos ou derivados)
```

```gherkin
GIVEN tipos duplicados localizados via grep search
WHEN consolidação for executada
THEN tipos legados são marcados @deprecated com JSDoc
AND novos tipos são re-exportados em types.ts
AND nenhuma importação existente é quebrada (typecheck passa)
```

### Exemplo: Cross-Story Decisions Table

| Decision | Source | Impact on This Story |
|----------|--------|----------------------|
| ContentType canônico fechado: "product" \| "service" \| "message" | EXEC-PLAN-EPIC-2.md (2026-04-20) | Enum ContentType DEVE usar esses 3 valores — "info" não entra no canônico |
| Todos os tipos de domínio inferidos de Zod schemas | Story 2.1 entregou CampaignDomainSchema | Campaign = z.infer<typeof CampaignDomainSchema> |
| Tipos legados marcados @deprecated, não deletados | AIOX Constitution Article V (zero breaking changes) | Marcar com JSDoc /** @deprecated Use Campaign from types.ts */ |

### Exemplo: Risks & Mitigations Table

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tipos esparsos em 5+ arquivos diferentes não localizados | Medium | Executar grep_search obrigatório para Campaign, ContentType, Objective antes de draftar |
| Importadores quebrados após consolidação | High | Verificar importadores via grep, manter re-exports seguros, executar typecheck antes de marcar DoD |
| ContentType aceitar valores além de product/service/message | Medium | Usar `z.enum(["product", "service", "message"])` — nunca string union aberto |
</few_shot_examples>

---

<output_format>
**Template obrigatório:** Salve em `docs/stories/2.2.story.md`

```markdown
# Story 2.2: Tipos de Domínio Centralizados

**Epic:** Epic 2 — Arquitetura de Campanhas
**Story ID:** 2.2
**Sprint:** Backlog inicial
**Priority:** High
**Points:** 3
**Effort:** 2-3h
**Status:** Draft
**Type:** Infrastructure

---

## Cross-Story Decisions

| Decision | Source | Impact on This Story |
|----------|--------|----------------------|
| (Preencher após grep search) | | |

---

## User Story

**Como** equipe de engenharia do Vendeo,
**Quero** consolidar tipos de domínio esparsos em lib/domain/campaigns/types.ts como fonte única de verdade inferida de schemas Zod,
**Para** eliminar duplicações, prevenir inconsistências de tipo e garantir que todos os tipos de domínio derivam dos contratos de validação estabelecidos na Story 2.1.

---

## Objective

(Descrever objetivo claro e conciso — uma frase)

---

## Scope IN

(Lista de bullets — O QUE está nesta story)

## Scope OUT

(Lista de bullets — O QUE NÃO está nesta story)

---

## Acceptance Criteria

(Mínimo 3 cenários em formato Gherkin)

```gherkin
GIVEN ...
WHEN ...
THEN ...
AND ...
```

---

## Dependencies

**Blocked by:** Story 2.1 — Schemas de Validação (Zod)
**Blocks:** Story 2.3 — Contratos de API

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| ... | ... | ... |

---

## Definition of Done

- [ ] types.ts criado com tipos inferidos de schemas Zod
- [ ] ContentType enum fechado (product/service/message)
- [ ] Tipos duplicados marcados @deprecated
- [ ] Importações atualizadas sem breaking changes
- [ ] npm run typecheck passa
- [ ] (Adicionar outros checkpoints)

---

## Dev Notes

(Insights para @dev — estado atual dos arquivos, convenções, referências)

---

## File List

| File | Action | Notes |
|------|--------|-------|
| lib/domain/campaigns/types.ts | Create | Fonte única de verdade |
| (Outros descobertos via grep) | Modify/Read | (Preencher após discovery) |

---

## CodeRabbit Integration

### Story Type Analysis

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Type | Infrastructure | Consolidação de tipos sem mudar comportamento |
| Complexity | Medium | Requer grep search + consolidação multi-arquivo |
| Test Requirements | Type-checking | Validação via typecheck + testes de importação |
| Review Focus | Regression, Logic | Verificar que nenhuma importação quebrou |

### Agent Assignment

| Role | Agent | Responsibility |
|------|-------|----------------|
| Primary | @dev | Implementar types.ts e migrar importações |
| Secondary | @qa | Validar zero breaking changes |

### Self-Healing Config

```yaml
reviews:
  auto_review:
    enabled: true
    drafts: false
  path_instructions:
    - path: "lib/domain/campaigns/types.ts"
      instructions: "Verificar que todos os tipos são inferidos de schemas Zod. ContentType deve ser enum fechado (product|service|message). Nunca permitir string unions abertos."
    - path: "lib/**/*.ts"
      instructions: "Verificar que importações de Campaign, ContentType usam novo types.ts. Tipos deprecated devem ter JSDoc @deprecated."
chat:
  auto_reply: true
```

### Focus Areas

- [ ] Todos os tipos inferidos de schemas Zod (não escritos manualmente)
- [ ] ContentType enum restrito a 3 valores
- [ ] Tipos legados marcados @deprecated com JSDoc
- [ ] Zero breaking changes (typecheck passa)
- [ ] Importações atualizadas para usar novo types.ts

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-04-20 | @sm (River) | Story criada — Epic 2 Planning |
```
</output_format>

---

<instructions>
1. **Execute grep_search** para localizar tipos existentes ANTES de escrever qualquer seção da story
2. **Leia schemas.ts** para confirmar schemas disponíveis (Story 2.1)
3. **Preencha Cross-Story Decisions** com decisões críticas de ContentType e inferência Zod
4. **Escreva Acceptance Criteria** testáveis (mínimo 3 cenários Gherkin)
5. **Liste Risks & Mitigations** reais baseados em grep discovery
6. **Crie File List** completo com TODOS os arquivos afetados (descobertos via grep)
7. **Salve em** `docs/stories/2.2.story.md`
8. **Nunca invente** tipos ou arquivos — use APENAS o que foi descoberto via grep/read_file
</instructions>

---

<anti_patterns>
❌ **NEVER DO:**
- Draftar story sem executar grep search primeiro
- Inventar tipos ou arquivos que não existem no codebase
- Permitir ContentType aceitar valores além de product/service/message
- Deletar tipos legados (marque @deprecated apenas)
- Escrever tipos manualmente quando podem ser inferidos de Zod
- Quebrar importações existentes

✅ **ALWAYS DO:**
- Grep search → Discovery → Cross-Story Decisions → Acceptance Criteria → File List
- Inferir tipos de schemas Zod via z.infer
- Marcar legados com @deprecated + JSDoc
- Verificar importadores via grep antes de consolidar
- Executar typecheck após mudanças
</anti_patterns>

---

**END OF PROMPT**
