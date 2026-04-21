
# Prompt: @sm — Criar Story 2.1 (Schemas de Validação Zod)

Copie tudo abaixo desta linha e envie para o @sm.

---

Você é @sm (River), Scrum Master do AIOX. Sua única tarefa nesta mensagem é criar o Story File formal da Story 2.1 seguindo o template canônico do projeto.

ANTES de escrever qualquer linha do story file, execute obrigatoriamente o bloco de raciocínio marcado com [THINK]. Só então escreva o arquivo final.

---

[CONTEXT]

Projeto: Vendeo — sales engine para lojas físicas (Next.js + TypeScript + Supabase)

Epic 2 — "Arquitetura de Campanhas" (status: Planning)
Objetivo do epic: Contratos e domínio para prevenir bugs antes de expandir Motor Visual V2. Meta: padronizar fluxo "query raw → schema → mapper → domain → view model" em toda a aplicação.

Estado real dos arquivos em lib/domain/campaigns/:

- schemas.ts → EXISTE (parcialmente preenchido)
  Já contém: DbCampaignSchema, CampaignAISchema, CampaignRequestSchema, CampaignReelsSchema
  Faltam: export canônico AICampaignContentSchema, export CampaignDomainSchema

- schemas.test.ts → NÃO EXISTE (precisa ser criado)

- mapper.ts → EXISTE e importa CampaignAISchema e DbCampaignSchema — não pode quebrar

Restrições absolutas:
- Zero breaking changes: mapper.ts e demais importadores não podem ser afetados
- Content type canônico fechado: "product" | "service" | "message"
- AICampaignContentSchema deve validar a resposta real de /api/generate/campaign
- CampaignDomainSchema representa o tipo limpo após o mapper (não é o raw do banco)

[/CONTEXT]

---

[THINK]

Execute mentalmente cada passo antes de escrever o story file:

Passo 1 — Estado atual:
schemas.ts JÁ EXISTE. A story não é "criar do zero". É "completar schemas.ts com exports ausentes + criar schemas.test.ts". Registre isso no Objective e no Scope IN.

Passo 2 — Scope exato desta story:
- Adicionar export AICampaignContentSchema (pode ser alias seguro de CampaignAISchema já existente, ou novo schema mais estrito — decisão do @dev)
- Adicionar export CampaignDomainSchema representando o shape limpo de domínio
- Criar schemas.test.ts com testes unitários para os 3 schemas: DbCampaignSchema, AICampaignContentSchema, CampaignDomainSchema (happy path + error cases)
- Validar DbCampaignSchema contra fixtures reais do banco de produção

Passo 3 — O que NÃO está nesta story:
- Alterar mapper.ts (escopo de Story 2.2+)
- Criar types.ts ou contracts.ts (Stories 2.2 e 2.3)
- Alterar qualquer componente, rota de API ou UI
- Backfill ou migração de dados
- Modificar nomes de exports existentes (quebraria mapper.ts)

Passo 4 — Riscos reais:
- Renomear CampaignAISchema quebraria mapper.ts → mitigação: re-export com alias, nunca rename
- Schema não cobrir campos opcionais do banco → mitigação: validar com fixtures de registros reais

Passo 5 — Cross-Story Decisions a registrar:
- Decision 1: schemas.ts existe parcialmente (descoberto em 2026-04-20)
- Decision 2: AICampaignContentSchema deve ser alias seguro, não rename de CampaignAISchema

Agora escreva o story file completo.

[/THINK]

---

[INPUT — Requirements]

Story ID: 2.1
Título: Schemas de Validação (Zod)
Goal: Completar fundação de validação para dados de banco e IA
Esforço: 2-3h
Risco: Baixo
Dependências: None
Bloqueada por: None
Bloqueia: Story 2.2 (que infere tipos dos schemas)

Requirements:
- Completar lib/domain/campaigns/schemas.ts adicionando exports ausentes
- Adicionar export AICampaignContentSchema (validação canônica da resposta OpenAI)
- Adicionar export CampaignDomainSchema (tipo de domínio limpo pós-mapper)
- DbCampaignSchema já existe — não reescrever, apenas validar cobertura contra dados reais
- Criar lib/domain/campaigns/schemas.test.ts
- Cobrir os 3 schemas com testes: happy path + error cases
- Zero breaking changes — mapper.ts e demais importadores devem permanecer intactos

Success Criteria:
- DbCampaignSchema valida 100% dos registros reais de campaigns
- AICampaignContentSchema valida a resposta atual de /api/generate/campaign
- CampaignDomainSchema representa o shape limpo após o mapper
- schemas.test.ts cobre happy path + error cases para os 3 schemas
- Nenhuma importação existente quebrada após a entrega

Files:
- lib/domain/campaigns/schemas.ts (modify — adicionar exports ausentes)
- lib/domain/campaigns/schemas.test.ts (new)

[/INPUT]

---

[FEW-SHOT — Exemplos do padrão esperado]

Exemplo de Acceptance Criteria canônica para esta story:

GIVEN o schemas.ts existente com DbCampaignSchema e CampaignAISchema já definidos
WHEN os exports ausentes forem adicionados
THEN AICampaignContentSchema e CampaignDomainSchema passam a existir como exports nomeados em schemas.ts
AND mapper.ts continua importando DbCampaignSchema e CampaignAISchema sem qualquer alteração

GIVEN o schemas.test.ts criado com fixtures de dados reais
WHEN os testes unitários forem executados
THEN DbCampaignSchema valida 100% dos registros de campaigns do banco de produção
AND AICampaignContentSchema valida a resposta atual de /api/generate/campaign
AND CampaignDomainSchema valida o shape limpo esperado após o mapper

Exemplo de Definition of Done canônico para esta story:

- [ ] AICampaignContentSchema exportado e validando resposta real de /api/generate/campaign
- [ ] CampaignDomainSchema exportado representando o tipo limpo de domínio
- [ ] schemas.test.ts criado com happy path + error cases para os 3 schemas
- [ ] Nenhuma importação existente quebrada (mapper.ts, service.ts verificados)
- [ ] DbCampaignSchema validado contra dados reais do banco de produção

[/FEW-SHOT]

---

[OUTPUT FORMAT — Template obrigatório]

Use exatamente este template para gerar o story file. Salve em docs/stories/2.1.story.md.

# Story 2.1: Schemas de Validação (Zod)

**Epic:** Epic 2 — Arquitetura de Campanhas
**Story ID:** 2.1
**Sprint:** Backlog inicial
**Priority:** High
**Points:** 2
**Effort:** 2-3h
**Status:** Draft
**Type:** Infrastructure

---

## Cross-Story Decisions

| Decision | Source | Impact on This Story |
|----------|--------|----------------------|
| schemas.ts existe parcialmente com DbCampaignSchema e CampaignAISchema | Descoberto em 2026-04-20 durante planejamento do Epic 2 | A story deve completar o arquivo existente, não recriar do zero |
| AICampaignContentSchema deve ser alias seguro de CampaignAISchema, nunca rename | docs/EXEC-PLAN-EPIC-2.md | Impede breaking change em mapper.ts e demais importadores |
| Content type canônico fechado: "product" | "service" | "message" | docs/architecture/persistencia-e-migracao-v2.md | CampaignDomainSchema deve usar este enum fechado |

---

## User Story

**Como** equipe de engenharia do Vendeo,
**Quero** completar os schemas Zod de validação em lib/domain/campaigns/schemas.ts e criar testes unitários para cada schema,
**Para** garantir que dados do banco (Supabase) e da IA (OpenAI) sejam validados na entrada, prevenindo bugs no domínio antes da expansão do Motor Visual V2.

---

## Objective

Adicionar os exports ausentes (AICampaignContentSchema e CampaignDomainSchema) ao schemas.ts existente e criar schemas.test.ts com cobertura de happy path e error cases para os 3 schemas. Esta story entrega a fundação de validação sem alterar qualquer código existente.

---

## Scope IN

- Adicionar export AICampaignContentSchema em schemas.ts (alias seguro ou schema mais estrito de CampaignAISchema)
- Adicionar export CampaignDomainSchema em schemas.ts (shape limpo de domínio pós-mapper)
- Criar schemas.test.ts com testes unitários para DbCampaignSchema, AICampaignContentSchema e CampaignDomainSchema
- Validar DbCampaignSchema contra fixtures de dados reais do banco de produção

## Scope OUT

- Não alterar mapper.ts, service.ts ou qualquer importador existente
- Não criar types.ts (escopo de Story 2.2)
- Não criar contracts.ts (escopo de Story 2.3)
- Não alterar rotas de API, componentes ou UI
- Não executar backfill ou migrations
- Não renomear exports existentes (DbCampaignSchema, CampaignAISchema permanecem intactos)

---

## Acceptance Criteria

```gherkin
GIVEN o schemas.ts existente com DbCampaignSchema e CampaignAISchema já definidos
WHEN os exports ausentes forem adicionados
THEN AICampaignContentSchema e CampaignDomainSchema passam a existir como exports nomeados
AND mapper.ts continua importando DbCampaignSchema e CampaignAISchema sem alteração
```

```gherkin
GIVEN o schemas.test.ts criado com fixtures de dados reais
WHEN os testes unitários forem executados
THEN DbCampaignSchema valida 100% dos registros de campaigns do banco de produção
AND AICampaignContentSchema valida a resposta atual de /api/generate/campaign
AND CampaignDomainSchema valida o shape limpo esperado após o mapper
```

```gherkin
GIVEN o código existente que importa de schemas.ts
WHEN a story for entregue
THEN nenhuma importação existente é quebrada
AND os testes de schemas passam sem erros
```

---

## Dependencies

**Blocked by:** None
**Blocks:** Story 2.2 — Tipos de Domínio Centralizados (infere tipos dos schemas desta story)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AICampaignContentSchema implementado como rename de CampaignAISchema quebra mapper.ts | High | Implementar como alias ou novo export independente, nunca rename do existente |
| DbCampaignSchema não cobrir campos opcionais do banco | Medium | Validar contra fixtures reais antes de marcar DoD como completo |
| CampaignDomainSchema divergir do shape real produzido pelo mapper | Medium | Revisar mapper.ts para inferir o shape esperado antes de definir o schema |

---

## Definition of Done

- [ ] AICampaignContentSchema exportado e validando resposta real de /api/generate/campaign
- [ ] CampaignDomainSchema exportado representando o tipo limpo de domínio pós-mapper
- [ ] schemas.test.ts criado com happy path + error cases para os 3 schemas
- [ ] Nenhuma importação existente quebrada (mapper.ts, service.ts verificados)
- [ ] DbCampaignSchema validado contra dados reais do banco de produção
- [ ] npm run typecheck passa sem erros
- [ ] npm run test passa para schemas.test.ts

---

## CodeRabbit Integration

### Story Type Analysis

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Type | Infrastructure | Adiciona validação de contrato sem alterar comportamento existente |
| Complexity | Low | Escopo restrito a um arquivo existente + um arquivo novo de testes |
| Test Requirements | Unit | schemas.test.ts com fixtures reais cobre happy path e error cases |
| Review Focus | Logic, Regression | Verificar que nenhum export existente foi renomeado ou removido |

### Agent Assignment

| Role | Agent | Responsibility |
|------|-------|----------------|
| Primary | @dev | Implementar exports ausentes e criar schemas.test.ts |
| Secondary | @qa | Validar cobertura de testes e ausência de breaking changes |

### Self-Healing Config

```yaml
reviews:
  auto_review:
    enabled: true
    drafts: false
  path_instructions:
    - path: "lib/domain/campaigns/schemas.ts"
      instructions: "Verifique que exports existentes (DbCampaignSchema, CampaignAISchema) não foram removidos ou renomeados. Novos exports devem ser aditivos."
    - path: "lib/domain/campaigns/schemas.test.ts"
      instructions: "Verifique cobertura de happy path e error cases para os 3 schemas. Fixtures devem representar dados reais do banco de produção."
chat:
  auto_reply: true
```

### Focus Areas

- [ ] Exports existentes DbCampaignSchema e CampaignAISchema preservados intactos
- [ ] AICampaignContentSchema implementado como alias ou novo export, nunca rename
- [ ] CampaignDomainSchema consistente com o shape produzido por mapper.ts
- [ ] schemas.test.ts com fixtures de dados reais do banco

[/OUTPUT FORMAT]
