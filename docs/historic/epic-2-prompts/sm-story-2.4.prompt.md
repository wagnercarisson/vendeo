# Prompt: @sm — Criar Story 2.4 (Mappers Seguros)

---

## 📋 CONTEXT

**Projeto:** Vendeo — sales engine para lojas físicas (Next.js + TypeScript + Supabase)

**Epic:** Epic 2 — Arquitetura de Campanhas  
**Story ID:** 2.4  
**Target Agent:** @sm (River) — Scrum Master

**Dependencies:** Story 2.1 ✅ (schemas), Story 2.2 ✅ (types), Story 2.3 ✅ (contracts)  
**Blocks:** Story 2.6 (API integration)

**Objective:** Implementar fluxo seguro `raw → validate → map → domain` com error handling robusto, garantindo que mappers validem com Zod antes de mapear e retornem erros úteis.

**Complexity:** 🔴 **HIGH RISK** — código em produção, volume alto de uso (listagens de campanhas), validação não pode quebrar campanhas existentes.

**Effort:** 3-4h  
**Model Recommendation:** Claude Sonnet 4.6 (1x) — error handling complexo + fallbacks

---

## 🚨 CRITICAL REQUIREMENTS (MEMORIZE FIRST)

1. **Discovery OBRIGATÓRIO:** Grep + read `lib/domain/campaigns/mapper.ts` ANTES de draftar story — descobrir funções existentes, estado atual de validação.

2. **Risk Assessment:** Story é HIGH RISK — código em produção com volume alto. AC devem incluir fallbacks para preservar comportamento atual.

3. **Zero Breaking Changes:** Campanhas existentes DEVEM continuar funcionando. Assinaturas de funções NÃO podem mudar.

4. **Error Pattern:** `.safeParse()` (não `.parse()`), try/catch com mensagens úteis (não genéricas), fallbacks documentados.

5. **Testes com Dados Reais:** Criar `mapper.test.ts` com dados que simulam registros do banco (não apenas mocks sintéticos).

6. **Cross-Story Decisions:** Schemas Zod como fonte de verdade (Story 2.1), Campaign = CampaignDomain (Story 2.2), `.safeParse()` pattern (Story 2.3).

---

## 🤖 CHAIN-OF-THOUGHT (EXECUTE IN ORDER)

<think>

### Passo 1 — Discovery de Mappers Existentes

**ANTES de criar qualquer seção da story, EXECUTE:**

```powershell
# Descobrir funções no mapper.ts
grep -n "export function" lib/domain/campaigns/mapper.ts
```

**ENTÃO leia o arquivo completo:**

```javascript
// Read mapper.ts para descobrir:
// - Quantas funções existem?
// - Quais usam .parse() (throw)?
// - Quais já têm try/catch?
// - mapAiCampaignToDomain() valida aiData com Zod?
// - Existe mapDomainToCampaignDb()?
```

**Resultado esperado:** Lista de 6-7 funções, identificação de quais precisam de refactoring.

---

### Passo 2 — Identificar Cross-Story Decisions

**Consulte Stories anteriores:**

- **Story 2.1:** Schemas disponíveis (CampaignDomainSchema, DbCampaignSchema, CampaignAISchema)
- **Story 2.2:** Campaign type = CampaignDomain (usar como referência)
- **Story 2.3:** `.safeParse()` pattern para validação segura

**Crie tabela Cross-Story Decisions:**

| Decision | Source | Impact on This Story |
|----------|--------|----------------------|
| Schemas Zod como fonte de verdade | Story 2.1 | Mappers DEVEM validar com schemas antes de mapear |
| Campaign type = CampaignDomain | Story 2.2 | mapDomainToCampaignDb() usa este type como input |
| .safeParse() pattern (não .parse()) | Story 2.3 | Substituir .parse() por .safeParse() em todos os mappers |
| ... | ... | ... |

**Mínimo:** 4 decisões relevantes.

---

### Passo 3 — Criar Acceptance Criteria Testáveis

**Para CADA função a refatorar/criar, escreva AC no formato Gherkin:**

**Exemplo (mapDbCampaignToDomain refactoring):**

```gherkin
GIVEN que mapper.ts usa DbCampaignSchema.parse() que throw
WHEN mapDbCampaignToDomain() for refatorado
THEN função usa DbCampaignSchema.safeParse() com try/catch
AND se validação falhar, retorna erro útil: "Validação falhou: campo X inválido"
AND se dados forem válidos, comportamento atual é preservado (zero breaking changes)
AND fallback para campos opcionais está documentado no JSDoc
```

**Exemplo (mapAiCampaignToDomain validation):**

```gherkin
GIVEN que mapAiCampaignToDomain() recebe aiData sem validar com Zod
WHEN aiData for validado com CampaignAISchema.safeParse()
THEN se validação falhar, função usa fallbacks documentados
AND mensagem de erro inclui campo específico que falhou (ex: "headline esperado string, recebido number")
AND testes cobrem cenário de aiData inválido
```

**Exemplo (mapDomainToCampaignDb creation):**

```gherkin
GIVEN que Campaign (domain) precisa ser persistido no DB
WHEN mapDomainToCampaignDb() for criado
THEN função valida input com CampaignDomainSchema.safeParse()
AND retorna objeto pronto para supabase.from('campaigns').update()
AND campos content_type e legacy_content_type usam buildCampaignContentTypeWrite()
AND testes verificam que objeto retornado tem estrutura DB correta
```

**Mínimo:** 5 AC (1 por função principal: mapDbCampaignToDomain, mapAiCampaignToDomain, mapDbCampaignToAIContext, mapDomainToCampaignDb, mapper.test.ts).

---

### Passo 4 — Risk Assessment & Mitigations

**Identifique riscos ESPECÍFICOS desta story:**

| Risk | Impact | Mitigation |
|------|--------|------------|
| Validação Zod rejeita campanhas existentes | 🔴 ALTO — quebra listagens | Fallbacks documentados para todos os campos opcionais, testes com dados reais |
| .safeParse() muda comportamento de error (não throw) | 🟡 MÉDIO — chamadores esperam throw? | Manter assinaturas, retornar erros via console.error (não throw) |
| mapDomainToCampaignDb() cria estrutura DB incorreta | 🔴 ALTO — corrompe dados | Validar output com DbCampaignSchema antes de retornar |
| Testes sintéticos não cobrem casos reais | 🟡 MÉDIO — bugs em prod | Criar fixtures com dados reais do banco |

**Mínimo:** 4 riscos com mitigações concretas.

---

### Passo 5 — Definition of Done (Checklist)

**Crie checklist executável:**

- [ ] `mapDbCampaignToDomain()` refatorado com `.safeParse()` + try/catch
- [ ] `mapAiCampaignToDomain()` valida aiData com `CampaignAISchema.safeParse()`
- [ ] `mapDbCampaignToAIContext()` adiciona error handling robusto
- [ ] `mapDomainToCampaignDb()` criado e validado
- [ ] Erros retornam mensagens úteis (ex: "Campo 'audience' inválido: esperado enum, recebido 'xyz'")
- [ ] JSDoc atualizado com exemplos de error handling
- [ ] `lib/domain/campaigns/mapper.test.ts` criado com 10+ testes
- [ ] Testes cobrem: happy path, dados inválidos, campos opcionais ausentes
- [ ] `npm run typecheck` passa com 0 erros
- [ ] Zero breaking changes — campanhas existentes funcionam

**Mínimo:** 10 items.

---

### Passo 6 — File List Planning

**Liste TODOS os arquivos envolvidos:**

| File | Action | Notes |
|------|--------|-------|
| `lib/domain/campaigns/mapper.ts` | **Refactor** | Adicionar error handling, criar mapDomainToCampaignDb() |
| `lib/domain/campaigns/mapper.test.ts` | **Create** | Testes unitários com dados reais |
| `lib/domain/campaigns/schemas.ts` | **Read** | Fonte de CampaignDomainSchema, DbCampaignSchema, CampaignAISchema |
| `lib/domain/campaigns/types.ts` | **Read** | Fonte de Campaign, CampaignAIOutput, CampaignContext |
| ... | ... | ... |

**Mínimo:** 6 arquivos (3 modified/created, 3 read-only).

</think>

---

## 📝 STORY STRUCTURE (TEMPLATE)

Use esta estrutura EXATA:

```markdown
# Story 2.4: Mappers Seguros

**Epic:** Epic 2 — Arquitetura de Campanhas
**Story ID:** 2.4
**Sprint:** Backlog inicial
**Priority:** High
**Points:** 5
**Effort:** 3-4h
**Status:** Draft
**Type:** Refactoring

---

## Cross-Story Decisions

[TABELA com ≥4 decisões de Stories 2.1, 2.2, 2.3]

---

## User Story

**Como** equipe de engenharia do Vendeo,
**Quero** implementar fluxo seguro de validação raw → validate → map → domain com error handling robusto,
**Para** garantir que mappers nunca quebrem com dados inválidos e forneçam mensagens úteis para debug em produção.

---

## Objective

[1 parágrafo claro do objetivo]

---

## Scope IN

- Refatorar `mapDbCampaignToDomain()` com `.safeParse()` + try/catch
- Refatorar `mapAiCampaignToDomain()` validando aiData com Zod
- Refatorar `mapDbCampaignToAIContext()` com error handling
- Criar `mapDomainToCampaignDb()` (write mapper)
- Criar `lib/domain/campaigns/mapper.test.ts` com testes unitários
- Adicionar JSDoc com exemplos de error handling

## Scope OUT

- **Não** modificar `service.ts` ou API routes (Story 2.6)
- **Não** criar novos schemas Zod (usar existentes)
- **Não** modificar `selectors.ts` ou `logic.ts` (Story 2.5)
- **Não** alterar assinaturas de funções existentes (zero breaking changes)

---

## Acceptance Criteria

[≥5 blocos Gherkin com .safeParse() testability]

---

## Dependencies

**Blocked by:**
- Story 2.1 — Schemas de Validação ✅
- Story 2.2 — Tipos de Domínio ✅
- Story 2.3 — Contratos de API ✅

**Blocks:**
- Story 2.6 — API Integration (usa mappers validados)

---

## Risks & Mitigations

[≥4 riscos com impact assessment e mitigações concretas]

---

## Definition of Done

[≥10 checkboxes executáveis]

---

## Dev Notes

### Estado Atual do mapper.ts (Descoberta via grep + read)

[Listar funções existentes e problemas identificados]

**Funções a Refatorar:**
1. `mapDbCampaignToDomain()` — adicionar try/catch
2. `mapAiCampaignToDomain()` — validar aiData com Zod
3. `mapDbCampaignToAIContext()` — adicionar error handling
4. `mapCampaignToListItem()` — validar input

**Função a Criar:**
5. `mapDomainToCampaignDb()` — domain → DB (write)

### Error Handling Pattern (Template)

[Incluir exemplo de código com .safeParse() pattern]

```typescript
export function mapDbCampaignToDomain(data: unknown): Campaign {
  const result = DbCampaignSchema.safeParse(data);
  
  if (!result.success) {
    console.error("Validação de campanha falhou:", result.error.format());
    throw new Error(`Campanha inválida: ${result.error.issues[0]?.message}`);
  }
  
  const raw = result.data;
  // ... resto do mapper
}
```

---

## File List

[Tabela com ≥6 arquivos: action + notes]

---

## CodeRabbit Integration

### Story Type Analysis

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Type | Refactoring | Melhorar error handling sem mudar comportamento |
| Complexity | High | Código em produção, volume alto, fallbacks críticos |
| Test Requirements | Unit + Integration | Testes com dados reais essenciais |
| Review Focus | Error Handling | Verificar que fallbacks preservam comportamento |

### Self-Healing Config

```yaml
reviews:
  auto_review:
    enabled: true
    max_iterations: 2
  path_instructions:
    - path: "lib/domain/campaigns/mapper.ts"
      instructions: >
        Verificar que TODAS as funções usam .safeParse() (não .parse()).
        Verificar que try/catch existe em mappers críticos.
        Verificar que mensagens de erro incluem campo específico que falhou.
        Verificar que assinaturas de funções NÃO mudaram (zero breaking changes).
    - path: "lib/domain/campaigns/mapper.test.ts"
      instructions: >
        Verificar que testes cobrem: happy path, dados inválidos, campos opcionais ausentes.
        Verificar que fixtures usam dados realistas (não apenas { id: "1" }).
chat:
  auto_reply: true
```

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-04-20 | @sm (River) | Story criada — Discovery: X funções identificadas, Y usam .parse(), Z sem try/catch. |
```

---

## 🎯 VALIDATION CHECKLIST (BEFORE SUBMIT)

Antes de finalizar a story, VERIFIQUE:

- [ ] Discovery executado (grep + read mapper.ts)
- [ ] Cross-Story Decisions com ≥4 entries
- [ ] Acceptance Criteria com .safeParse() testability (≥5 blocos Gherkin)
- [ ] Risks & Mitigations com ≥4 riscos HIGH/MEDIUM
- [ ] Definition of Done com ≥10 checkboxes
- [ ] Dev Notes com estado atual descoberto via grep
- [ ] File List com ≥6 arquivos
- [ ] Error handling pattern incluído (código de exemplo)
- [ ] Zero breaking changes explicitado no Scope OUT

---

## ❌ ANTI-PATTERNS (NEVER DO)

❌ **Criar story sem discovery** — SEMPRE grep + read mapper.ts primeiro  
❌ **AC genéricos** — Especificar .safeParse(), campos, mensagens de erro  
❌ **Ignorar HIGH RISK** — Incluir fallbacks, testes com dados reais  
❌ **Alterar assinaturas** — Scope OUT explícito: zero breaking changes  
❌ **Testes sintéticos** — Fixtures devem simular dados reais do banco  
❌ **Esquecer write mapper** — mapDomainToCampaignDb() é requisito crítico

---

## 🚀 EXECUTION

Após criar a story:

1. Salvar em `docs/stories/2.4.story.md`
2. Aguardar @po validation (10-point checklist)
3. Se aprovado (≥7/10), aguardar @dev prompt request

---

**END OF PROMPT**
