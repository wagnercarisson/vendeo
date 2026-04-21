# Prompt: @sm — Criar Story 2.3 (Contratos de API)

---

## 📋 ANALYSIS

**Why this prompt structure:**

1. **API Discovery Focus:** @sm deve descobrir estrutura REAL de request/response via grep/read dos endpoints existentes — não inventar contratos.

2. **Zod Schema First:** Contratos são schemas Zod, não tipos manuais — reforçar dependência de Story 2.1.

3. **Product Context Integration:** Endpoints servem fluxo real (store → product → audience → IA gera conteúdo) — AC devem refletir isso.

4. **Low-Risk Story Pattern:** Story simples (1-2h, criar arquivo novo) — template deve ser conciso, não over-engineer.

5. **Testing Strategy:** Contratos são testáveis via `.safeParse()` — AC devem incluir happy path + error cases.

**Model Recommendation:** Claude Sonnet 4.6 (1x) — raciocínio estruturado para discovery de API patterns.

---

## 🤖 SYSTEM PROMPT

Copie tudo abaixo desta linha e envie para @sm.

---

<context>
**Projeto:** Vendeo — sales engine para lojas físicas (Next.js + TypeScript + Supabase)

**Epic:** Epic 2 — Arquitetura de Campanhas (status: In Progress)  
**Objetivo:** Contratos e domínio para prevenir bugs antes de expandir Motor Visual V2

**Stories anteriores:**
- 2.1 (Schemas de Validação Zod) — STATUS: Done ✅
- 2.2 (Tipos de Domínio Centralizados) — STATUS: Done ✅

**Esta story:** 2.3 (Contratos de API)  
Criar `lib/domain/campaigns/contracts.ts` com schemas Zod para validação de request/response de endpoints de geração de campanhas
</context>

---

<critical_requirements>
1. **API Discovery OBRIGATÓRIO:** Execute grep/read ANTES de draftar para localizar:
   - Endpoints existentes: `/api/generate/campaign`, `/api/generate/regenerate` (ou similar)
   - Estrutura de request (payload enviado pelo cliente)
   - Estrutura de response (dados retornados pela API)

2. **Zod Schemas First:** TODOS os contratos DEVEM ser schemas Zod — zero tipos manuais. Inferir tipos via `z.infer<typeof Schema>`.

3. **ContentType fechado:** Request schema DEVE validar `content_type: "product" | "service" | "message"` (decisão Story 2.2).

4. **Dependency chain:** Story 2.3 usa tipos de Story 2.2 (`Campaign`, `ContentType`) — AC devem validar imports.

5. **Testabilidade:** Cada schema DEVE ser testável via `.safeParse()` — AC incluem happy path + error cases.

6. **Contexto produto:** Vendeo = lojista cria campanha → API gera conteúdo via IA → retorna Campaign + conteúdo gerado.
</critical_requirements>

---

<think>
**EXECUTE MENTALMENTE ANTES DE DRAFTAR:**

**Passo 1 — Discovery de Endpoints:**
- Execute `grep_search` para localizar rotas de API: `app/api/generate/**` ou `pages/api/generate/**`
- Leia arquivos de rotas para identificar:
  - Campos do request body (ex: `store_id`, `product_name`, `audience`, `objective`, `content_type`)
  - Estrutura do response (ex: `{ campaign: Campaign, ai_content: {...}, status: "success" }`)
- Liste TODOS os campos reais — não invente

**Passo 2 — Estrutura de Contratos:**
- Para cada endpoint identificado, defina contratos:
  - `GenerateCampaignRequest` — payload enviado
  - `GenerateCampaignResponse` — dados retornados
  - `RegenerateCampaignRequest` — payload de re-geração (se endpoint existir)
- Confirme que request usa tipos de Story 2.2 (`ContentType`, etc.)

**Passo 3 — Validação com Zod:**
- Planeje schemas Zod para cada contrato:
  - Campos obrigatórios → `z.string()`, `z.number()`
  - Campos opcionais → `.optional()`, `.nullable()`
  - Enums → `z.enum(["product", "service", "message"])`
- Todos os tipos inferidos: `type X = z.infer<typeof XSchema>`

**Passo 4 — Testabilidade:**
- Planeje testes unitários para schemas:
  - Happy path: payload válido passa `.safeParse()`
  - Error cases: payload inválido falha com erro específico
  - Edge cases: campos opcionais ausentes

**Passo 5 — Dependencies:**
- Story 2.3 depende de 2.1 (schemas Zod) e 2.2 (tipos como Campaign)
- Story 2.3 bloqueia 2.4 (mappers) e 2.6 (API integration)
- Confirmar no File List que contracts.ts importa de schemas.ts e types.ts

**Só escreva o story file após completar os 5 passos mentalmente.**
</think>

---

<input>
**Story ID:** 2.3  
**Título:** Contratos de API  
**Goal:** Definir contratos tipados para endpoints de geração de campanhas

**Esforço:** 1-2h  
**Risco:** Baixo (criar arquivo novo, sem refatoração)  
**Testável:** Sim (testes unitários via `.safeParse()`)

**Dependencies:**
- **Blocked by:** Story 2.1 (schemas Zod) ✅, Story 2.2 (tipos) ✅
- **Blocks:** Story 2.4 (mappers), Story 2.6 (API integration)

**Requirements:**
1. Criar arquivo `lib/domain/campaigns/contracts.ts` (novo)
2. Definir contratos para `/api/generate/campaign`:
   - `GenerateCampaignRequestSchema` — valida payload do cliente
   - `GenerateCampaignResponseSchema` — valida resposta da API
3. Definir contrato para regeneração (se endpoint existir):
   - `RegenerateCampaignRequestSchema` — valida payload de re-geração
4. Todos os schemas baseados em Zod (não tipos manuais)
5. Inferir tipos TypeScript via `z.infer<typeof Schema>`
6. JSDoc completo com exemplos de uso
7. Criar `contracts.test.ts` com testes unitários (happy path + error cases)

**Success Criteria:**
- `contracts.ts` exporta schemas Zod + tipos inferidos
- Request schema valida `content_type` como enum fechado (product|service|message)
- Response schema valida estrutura completa retornada pela API
- JSDoc inclui exemplos práticos de uso
- Testes unitários cobrem happy path e error cases
- `npm run typecheck` passa sem erros
- Zero dependências além de `zod` e tipos de Story 2.1/2.2

**Files:**
- `lib/domain/campaigns/contracts.ts` (create — schemas + types)
- `lib/domain/campaigns/contracts.test.ts` (create — validação)
- `app/api/generate/campaign/route.ts` (read — descobrir request/response)
- (Outros endpoints descobertos via grep)
</input>

---

<few_shot_examples>
### Exemplo: Acceptance Criteria (formato Gherkin)

```gherkin
GIVEN que /api/generate/campaign recebe payload com store_id, product_name, content_type
WHEN GenerateCampaignRequestSchema validar payload válido
THEN .safeParse() retorna success: true
AND parsed data contém todos os campos esperados
AND content_type é validado como "product" | "service" | "message" (não aceita "info")
```

```gherkin
GIVEN que /api/generate/campaign retorna Campaign + conteúdo gerado
WHEN GenerateCampaignResponseSchema validar response válida
THEN .safeParse() retorna success: true
AND response.campaign tem tipo Campaign (de Story 2.2)
AND response.ai_content contém headline, caption, etc
```

```gherkin
GIVEN payload inválido (campo obrigatório ausente)
WHEN GenerateCampaignRequestSchema.safeParse() for executado
THEN retorna success: false
AND error.issues descreve campo ausente
AND testes unitários capturam error cases
```

### Exemplo: Cross-Story Decisions Table

| Decision | Source | Impact on This Story |
|----------|--------|----------------------|
| ContentType fechado: "product" \| "service" \| "message" | Story 2.2 | GenerateCampaignRequestSchema DEVE validar content_type com `z.enum(["product", "service", "message"])` |
| Campaign = CampaignDomain (Zod-inferred) | Story 2.2 | GenerateCampaignResponseSchema usa `Campaign` type de types.ts |
| Schemas Zod como fonte de verdade | Story 2.1 | Todos os contratos DEVEM ser schemas Zod — tipos inferidos via z.infer |

### Exemplo: Risks & Mitigations Table

| Risk | Impact | Mitigation |
|------|--------|------------|
| Request schema não reflete estrutura real do endpoint | High | Executar grep/read de app/api/generate/campaign/route.ts ANTES de definir schema |
| Response schema diverge do que API retorna em produção | Medium | Validar contra response real (se disponível) ou mock baseado no código da rota |
| Campos opcionais vs obrigatórios mal definidos | Medium | Documentar no JSDoc quais campos são required vs optional com exemplos |

### Exemplo: Dev Notes

**Estrutura esperada de contratos:**

```typescript
// lib/domain/campaigns/contracts.ts
import { z } from "zod";
import type { Campaign } from "./types";

// Request schema
export const GenerateCampaignRequestSchema = z.object({
  store_id: z.string().uuid(),
  product_name: z.string().min(1),
  price: z.number().positive().nullable(),
  audience: z.string().nullable(),
  objective: z.enum([...]), // valores de CampaignObjective
  content_type: z.enum(["product", "service", "message"]),
  campaign_type: z.enum(["post", "reels", "both"]),
});

// Type inference
export type GenerateCampaignRequest = z.infer<typeof GenerateCampaignRequestSchema>;

/**
 * @example
 * const request: GenerateCampaignRequest = {
 *   store_id: "123e4567-e89b-12d3-a456-426614174000",
 *   product_name: "Tênis Nike Air",
 *   price: 299.90,
 *   content_type: "product",
 *   campaign_type: "post"
 * };
 */
```
</few_shot_examples>

---

<output_format>
**Template obrigatório:** Salve em `docs/stories/2.3.story.md`

```markdown
# Story 2.3: Contratos de API

**Epic:** Epic 2 — Arquitetura de Campanhas
**Story ID:** 2.3
**Sprint:** Backlog inicial
**Priority:** High
**Points:** 2
**Effort:** 1-2h
**Status:** Draft
**Type:** Infrastructure

---

## Cross-Story Decisions

| Decision | Source | Impact on This Story |
|----------|--------|----------------------|
| (Preencher após API discovery) | | |

---

## User Story

**Como** equipe de engenharia do Vendeo,
**Quero** definir contratos tipados com schemas Zod para endpoints de geração de campanhas,
**Para** garantir validação automática de payloads de request/response e prevenir bugs de integração antes de conectar API routes (Story 2.6).

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

**Blocked by:** Story 2.1 — Schemas de Validação (Zod) ✅, Story 2.2 — Tipos de Domínio Centralizados ✅
**Blocks:** Story 2.4 — Mappers, Story 2.6 — API Integration

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| ... | ... | ... |

---

## Definition of Done

- [ ] contracts.ts criado com schemas Zod + tipos inferidos
- [ ] GenerateCampaignRequestSchema valida content_type fechado
- [ ] GenerateCampaignResponseSchema valida estrutura completa
- [ ] JSDoc com exemplos práticos de uso
- [ ] contracts.test.ts com happy path + error cases
- [ ] npm run typecheck passa
- [ ] (Adicionar outros checkpoints)

---

## Dev Notes

(Insights para @dev — estado atual de API routes, convenções, referências)

**Estrutura de contratos esperada:**
```typescript
// Incluir exemplo de schema + type inference
```

**Endpoints a investigar:**
- `app/api/generate/campaign/route.ts` (ou `pages/api/generate/campaign.ts`)
- (Listar após grep discovery)

---

## File List

| File | Action | Notes |
|------|--------|-------|
| lib/domain/campaigns/contracts.ts | Create | Schemas Zod + tipos inferidos |
| lib/domain/campaigns/contracts.test.ts | Create | Testes unitários (safeParse) |
| (Outros descobertos via grep) | Read | Para discovery de request/response |

---

## CodeRabbit Integration

### Story Type Analysis

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Type | Infrastructure | Criação de contratos sem mudar comportamento |
| Complexity | Low | Arquivo novo, sem refatoração |
| Test Requirements | Unit | Testes via `.safeParse()` |
| Review Focus | Correctness | Verificar que schemas refletem API real |

### Agent Assignment

| Role | Agent | Responsibility |
|------|-------|----------------|
| Primary | @dev | Implementar schemas Zod e testes |
| Secondary | @qa | Validar cobertura de testes |

### Self-Healing Config

```yaml
reviews:
  auto_review:
    enabled: true
    drafts: false
  path_instructions:
    - path: "lib/domain/campaigns/contracts.ts"
      instructions: "Verificar que todos os tipos são inferidos de schemas Zod (z.infer). content_type deve ser enum fechado (product|service|message). JSDoc com exemplos completos."
    - path: "lib/domain/campaigns/contracts.test.ts"
      instructions: "Verificar cobertura de happy path e error cases. Cada schema deve ter teste com .safeParse()."
chat:
  auto_reply: true
```

### Focus Areas

- [ ] Todos os tipos inferidos de schemas Zod (não manuais)
- [ ] content_type validado como enum fechado
- [ ] JSDoc com exemplos práticos
- [ ] Testes cobrem happy path + error cases
- [ ] Schemas refletem estrutura real da API

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-04-20 | @sm (River) | Story criada — Epic 2 Planning |
```
</output_format>

---

<instructions>
1. **Execute grep_search** para localizar API routes em `app/api/generate/` ou `pages/api/generate/`
2. **Leia routes** identificadas para descobrir estrutura de request/response
3. **Preencha Cross-Story Decisions** com decisões de ContentType, Campaign type, Zod schemas
4. **Escreva Acceptance Criteria** testáveis (mínimo 3 cenários Gherkin)
5. **Liste Risks & Mitigations** reais baseados em API discovery
6. **Crie File List** completo com endpoints descobertos
7. **Salve em** `docs/stories/2.3.story.md`
8. **Nunca invente** estruturas de request/response — use APENAS o que foi descoberto via grep/read
</instructions>

---

<anti_patterns>
❌ **NEVER DO:**
- Draftar story sem executar grep search para API routes primeiro
- Inventar campos de request/response que não existem no código
- Criar tipos manuais (devem ser inferidos de Zod)
- Permitir content_type aceitar valores além de product/service/message
- Esquecer de planejar testes unitários (contracts.test.ts)

✅ **ALWAYS DO:**
- Grep search → Read routes → Discovery → Cross-Story Decisions → AC → File List
- Validar que contratos refletem estrutura REAL da API
- Inferir tipos de schemas Zod via z.infer
- Incluir JSDoc com exemplos práticos
- Planejar testes via `.safeParse()`
</anti_patterns>

---

**END OF PROMPT**
