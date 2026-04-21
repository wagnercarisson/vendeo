# Prompt: @sm — Criar Story 2.6 (Integration API Routes)

---

## 📋 ANALYSIS

**Why this prompt structure:**

1. **Discovery Table Required (3 endpoints):** Validate which endpoints JÁ USAM arquitetura (campaign, reels) vs qual NÃO USA (strategy) — prevent scope creep.

2. **HIGH RISK Emphasis:** `/campaign/strategy` é endpoint de produção, validação pode quebrar users existentes — mitigation strategies obrigatórias.

3. **Code Pattern Examples:** Request validation e AI response validation patterns from `/campaign` (Story 2.4 reference) — consistency across endpoints.

4. **Manual Test Requirements:** DoD DEVE incluir manual tests (POST with valid/invalid payloads) — automated tests alone insufficient for HIGH RISK.

5. **Scope Boundary:** Out of Scope section MUST be explicit (não refatorar `/campaign` ou `/reels`) — Story 2.6 apenas adiciona validação em `/strategy`.

6. **Epic 2 Completion:** Story 2.6 é final story — DoD inclui atualização de EXEC-PLAN-EPIC-2.md para 100% complete 🎉.

**Model Recommendation:** Claude Sonnet 4.6 (1x) — HIGH RISK integration story with production endpoint validation.

---

## 🤖 SYSTEM PROMPT

Copie tudo abaixo desta linha e envie para @sm.

---

<context>
**Projeto:** Vendeo — sales engine para lojas físicas (Next.js + TypeScript + Supabase)

**Story:** 2.6 — Integration API Routes  
**Epic:** Epic 2 — Arquitetura de Campanhas (FINAL STORY)  
**Dependencies:** Stories 2.1-2.5 ✅ ALL DONE

**Objetivo:** Ativar validação em endpoint `/campaign/strategy` e garantir arquitetura end-to-end funcionando.

**Complexity:** 🔴 **HIGH RISK** — Production endpoint, AI validation, Epic 2 completion

**Esforço:** 4-5h  
**Blocks:** Nenhum (Story 2.6 é final)  
**Blocked by:** Stories 2.1-2.5 ✅ DONE
</context>

---

<requirements>
## User Story

Como equipe de engenharia do Vendeo,  
Quero validar request e response do endpoint `/api/generate/campaign/strategy` usando schemas Zod,  
Para garantir que toda a stack (schemas → mappers → API → AI) funciona end-to-end com contratos seguros.

---

## Objective

**Problema:** Endpoint `/campaign/strategy` NÃO USA validação:
- ❌ Aceita qualquer JSON como input (sem schema Zod)
- ❌ Não valida resposta da IA (apenas `JSON.parse()` sem schema)
- ❌ Pode retornar valores inválidos (ex: objective="invalid_value")
- ❌ Não usa tipos de `lib/domain/campaigns/types.ts`

**Contexto positivo:** `/campaign` e `/reels` JÁ USAM a arquitetura completa (Stories 2.1-2.5).

**Solução:** Adicionar `CampaignStrategyRequestSchema` e `CampaignStrategyResponseSchema`, validar no endpoint, retornar erros 400/500 apropriados.

---

## Discovery Requirements (MANDATORY — Passo 1 do CoT)

ANTES de escrever AC ou DoD, você DEVE executar discovery:

### Discovery Step 1: Analyze Existing Endpoints

```bash
# Read current implementation (WITHOUT validation)
cat app/api/generate/campaign/strategy/route.ts
```

**Expected findings:**
- `await req.json()` sem validação
- `JSON.parse(content)` sem validação
- Retorna objeto sem contrato tipado

### Discovery Step 2: Reference Architecture

```bash
# Read endpoint WITH validation (Story 2.4 reference)
cat app/api/generate/campaign/route.ts
```

**Expected patterns:**
- `CampaignRequestSchema.safeParse()`
- `callAIWithRetry()` com schema validation
- Error responses: `{ ok: false, error: "INVALID_INPUT", details }` (400)

### Discovery Step 3: Analyze Available Schemas

```bash
# Read schemas from Story 2.1
grep -E "export const.*Schema" lib/domain/campaigns/schemas.ts

# Read contracts from Story 2.3
grep -E "export const.*Schema" lib/domain/campaigns/contracts.ts
```

**Expected re-usable schemas:**
- `CampaignAudienceSchema` (ex: "jovens_adultos", "familias")
- `CampaignObjectiveSchema` (ex: "promocao", "lancamento")
- `ProductPositioningSchema` (ex: "premium", "acessivel")
- `ContentTypeSchema` (ex: "product", "service", "message")

### Discovery Step 4: Create Endpoint Comparison Table

**Você DEVE criar uma tabela comparando os 3 endpoints:**

| Endpoint | Validação Request | Validação Response | Usa Mappers | Status |
|----------|-------------------|-------------------|-------------|--------|
| `/api/generate/campaign` | ✅ `CampaignRequestSchema.safeParse()` | ✅ `CampaignAISchema` via `callAIWithRetry()` | ✅ `mapDbCampaignToDomain()`, `mapAiCampaignToDomain()` | ✅ COMPLETO (Stories 2.1-2.4) |
| `/api/generate/reels` | ✅ `ShortVideoRequestSchema.safeParse()` | ✅ `ShortVideoAISchema` via `callAIWithRetry()` | ✅ `mapAiShortVideoToDomain()` | ✅ COMPLETO (domain separado) |
| `/api/generate/campaign/strategy` | ❌ Apenas `req.json()` | ❌ Apenas `JSON.parse()` | ❌ Não usa | 🔴 **TARGET STORY 2.6** |

**Rationale:** Essa tabela documenta que 2/3 endpoints já estão completos — Story 2.6 apenas completa o terceiro.

---

## Acceptance Criteria

```gherkin
DADO que endpoint /api/generate/campaign/strategy recebe request sem validação
QUANDO CampaignStrategyRequestSchema e CampaignStrategyResponseSchema forem criados em contracts.ts
ENTÃO ambos schemas devem re-usar schemas de Story 2.1 (Audience, Objective, Positioning, ContentType)
E CampaignStrategyRequestSchema deve validar: product.type (ContentTypeSchema), product.productName (string min 1)
E CampaignStrategyResponseSchema deve validar: audience, objective, productPositioning, reasoning (string min 10)
E TypeScript types automáticos via z.infer (CampaignStrategyRequest, CampaignStrategyResponse)
E testes unitários verificam: schema aceita dados válidos, rejeita dados inválidos com mensagens claras
```

```gherkin
DADO que endpoint /api/generate/campaign/strategy está sem validação de request
QUANDO validação for adicionada no início do route handler
ENTÃO deve importar CampaignStrategyRequestSchema de contracts.ts
E deve validar com body.safeParse(json)
E se body.success === false, retornar NextResponse.json({ ok: false, error: "INVALID_INPUT", details: body.error.flatten() }, { status: 400 })
E se body.success === true, usar body.data (tipado e validado)
E testes manuais verificam: POST com payload válido → 200, POST com payload inválido → 400 com details
```

```gherkin
DADO que endpoint /api/generate/campaign/strategy não valida resposta da IA
QUANDO validação for adicionada após JSON.parse()
ENTÃO deve importar CampaignStrategyResponseSchema de contracts.ts
E deve validar com validated.safeParse(parsed)
E se validated.success === false, retornar NextResponse.json({ ok: false, error: "AI_INVALID_OUTPUT", details: validated.error.flatten() }, { status: 500 })
E se validated.success === true, retornar validated.data (tipado e validado)
E testes manuais verificam: IA retorna dados válidos → 200, IA retorna dados inválidos → 500 (safety net)
```

```gherkin
DADO que endpoints /campaign e /reels já usam arquitetura completa (Stories 2.1-2.5)
QUANDO Story 2.6 for implementada
ENTÃO endpoint /strategy deve seguir MESMO padrão de error responses (400 INVALID_INPUT, 500 AI_INVALID_OUTPUT)
E requestId deve ser incluído em TODAS as respostas (rastreabilidade)
E endpoint /strategy deve retornar: { ok: true/false, requestId, suggestion/error, details }
E testes de regressão verificam: /campaign continua funcionando, /reels continua funcionando (zero breaking changes)
```

```gherkin
DADO que Story 2.6 é a story final do Epic 2
QUANDO Story 2.6 for marcada como Done
ENTÃO EXEC-PLAN-EPIC-2.md deve ser atualizado: Epic 2 100% complete (6/6 stories)
E deve incluir seção "Epic 2 Completion Summary" com link para commit
E deve documentar que arquitetura está ativa em 3 endpoints (/campaign, /reels, /strategy)
E deve listar próximo epic (Epic 3 ou outro)
```

---

## Scope

### IN SCOPE:
✅ Criar `CampaignStrategyRequestSchema` e `CampaignStrategyResponseSchema` em contracts.ts  
✅ Adicionar validação de request no endpoint /strategy (safeParse + return 400)  
✅ Adicionar validação de resposta da IA (safeParse + return 500)  
✅ Seguir padrão de error responses de /campaign (consistency)  
✅ Testes manuais obrigatórios (POST válido → 200, inválido → 400)  
✅ Atualizar EXEC-PLAN-EPIC-2.md (Epic 2 100% complete)

### OUT OF SCOPE:
❌ Refatorar `/campaign` ou `/reels` (já estão completos)  
❌ Modificar `generateCampaignContent()` service (já usa mappers seguros)  
❌ Adicionar retry logic ou caching (feature nova, não validação)  
❌ Criar novos endpoints  
❌ Modificar schemas de Stories 2.1-2.5 (exceto se bug crítico)  
❌ Testes E2E completos (podem ser Story 2.7 separada)

---

## Dev Notes Section (MANDATORY)

Você DEVE incluir uma seção "Dev Notes" com:

### Pattern 1: Request Validation (from `/campaign`)

```typescript
// route.ts (início do handler)
import { CampaignStrategyRequestSchema, CampaignStrategyResponseSchema } from "@/lib/domain/campaigns/contracts";

const json = await req.json().catch(() => null);
const body = CampaignStrategyRequestSchema.safeParse(json);

if (body.success === false) {
  return NextResponse.json(
    { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() },
    { status: 400 }
  );
}

// body.data agora é tipado e validado
const { product } = body.data;
```

### Pattern 2: AI Response Validation

```typescript
// route.ts (após receber resposta da IA)
const content = ai.choices[0].message.content || "{}";
const parsed = JSON.parse(content);
const validated = CampaignStrategyResponseSchema.safeParse(parsed);

if (validated.success === false) {
  console.error("[strategy] AI returned invalid data:", validated.error);
  return NextResponse.json(
    { ok: false, requestId, error: "AI_INVALID_OUTPUT", details: validated.error.flatten() },
    { status: 500 }
  );
}

// validated.data agora é tipado e validado
return NextResponse.json({
  ok: true,
  requestId,
  suggestion: validated.data,
});
```

### Pattern 3: Schema Re-use (contracts.ts)

```typescript
// contracts.ts
import { 
  CampaignAudienceSchema, 
  CampaignObjectiveSchema, 
  ProductPositioningSchema 
} from "./schemas";
import { ContentTypeSchema } from "./types";

export const CampaignStrategyRequestSchema = z.object({
  product: z.object({
    type: ContentTypeSchema, // Re-usa de types.ts
    productName: z.string().min(1, "Nome do produto é obrigatório"),
    description: z.string().optional(),
    price: z.string().optional(),
  }),
});

export const CampaignStrategyResponseSchema = z.object({
  audience: CampaignAudienceSchema, // Re-usa de schemas.ts
  objective: CampaignObjectiveSchema, // Re-usa de schemas.ts
  productPositioning: ProductPositioningSchema, // Re-usa de schemas.ts
  reasoning: z.string().min(10, "Reasoning deve ter no mínimo 10 caracteres"),
});

export type CampaignStrategyRequest = z.infer<typeof CampaignStrategyRequestSchema>;
export type CampaignStrategyResponse = z.infer<typeof CampaignStrategyResponseSchema>;
```

---

## Cross-Story Decisions (Passo 3 do CoT)

Referências a decisões de stories anteriores:

| Story | Decision | Impact on 2.6 |
|-------|----------|---------------|
| 2.1 (Schemas) | `CampaignAudienceSchema`, `CampaignObjectiveSchema`, `ProductPositioningSchema` | Story 2.6 re-usa esses schemas (não cria novos) |
| 2.2 (Types) | `ContentTypeSchema` com valores "product", "service", "message" | Story 2.6 valida product.type com esse schema |
| 2.3 (Contracts) | Pattern de `XRequestSchema` e `XResponseSchema` | Story 2.6 segue mesmo pattern (CampaignStrategyRequest/Response) |
| 2.4 (Mappers) | Error responses: 400 INVALID_INPUT, 500 AI_INVALID_OUTPUT | Story 2.6 usa mesmos códigos de erro (consistency) |
| 2.5 (Selectors) | Funções puras sem validação (assumem dados válidos) | Story 2.6 garante que selectors recebam dados validados |

</requirements>

---

<implementation_guidance>
## Chain-of-Thought Workflow (6 Passos)

### Passo 1: DISCOVERY (MANDATORY)
Execute os 4 discovery steps listados acima ANTES de escrever AC.

**Output esperado:** Tabela com 3 endpoints mostrando que 2/3 já estão completos.

### Passo 2: CROSS-STORY DECISIONS
Adicione tabela com ≥3 referências a Stories 2.1-2.5.

**Output esperado:** Mostrar que Story 2.6 re-usa schemas (não reinventa).

### Passo 3: ACCEPTANCE CRITERIA
Escreva AC usando format Gherkin:
- Criar schemas (CampaignStrategyRequest/Response)
- Validar request (safeParse + 400)
- Validar AI response (safeParse + 500)
- Seguir padrão de /campaign (consistency)
- Atualizar EXEC-PLAN (Epic 2 100%)

**Output esperado:** 5 cenários Gherkin (mínimo 4, máximo 6).

### Passo 4: RISKS & MITIGATIONS
Liste 3-4 riscos com severidade 🔴/🟡/🟢:
- Endpoint /strategy quebrar em produção (🔴 HIGH)
- IA retornar valores fora do schema (🟡 MEDIUM)
- Tipos Zod não matcharem constantes existentes (🟡 MEDIUM)
- Regressão em /campaign ou /reels (🟢 LOW, se OUT_OF_SCOPE respeitado)

**Output esperado:** Tabela com 3-4 riscos + mitigation strategies.

### Passo 5: DEFINITION OF DONE
Checklist com 12-15 itens:
- [ ] `CampaignStrategyRequestSchema` criado em contracts.ts
- [ ] `CampaignStrategyResponseSchema` criado em contracts.ts
- [ ] Endpoint /strategy valida request com safeParse
- [ ] Endpoint /strategy valida AI response com safeParse
- [ ] Error responses seguem padrão (400 INVALID_INPUT, 500 AI_INVALID_OUTPUT)
- [ ] TypeScript typecheck passa (npx tsc --noEmit)
- [ ] **Manual test:** POST /strategy com payload válido → 200
- [ ] **Manual test:** POST /strategy com payload inválido → 400 com details
- [ ] **Manual test:** Verificar logs de IA retornando dados inválidos (safety net)
- [ ] Testes unitários para schemas (opcional mas recomendado)
- [ ] EXEC-PLAN-EPIC-2.md atualizado: Epic 2 100% complete
- [ ] Commit: `feat: add validation to campaign strategy endpoint [Story 2.6]`

**Ênfase:** Manual tests são OBRIGATÓRIOS (HIGH RISK).

### Passo 6: DEV NOTES
Incluir 3 code patterns:
1. Request validation (from /campaign)
2. AI response validation
3. Schema re-use (contracts.ts)

**Output esperado:** Seção Dev Notes com 3 exemplos de código completos (copy-paste ready).

---

## File List (MANDATORY)

| File | Action | Notes |
|------|--------|-------|
| `lib/domain/campaigns/contracts.ts` | **UPDATE** | Add CampaignStrategyRequestSchema + CampaignStrategyResponseSchema (re-usa schemas de 2.1) |
| `app/api/generate/campaign/strategy/route.ts` | **UPDATE** | Add request validation (safeParse + 400) + AI response validation (safeParse + 500) |
| `lib/domain/campaigns/contracts.test.ts` | **CREATE** (opcional) | Unit tests para CampaignStrategyRequest/Response schemas |
| `docs/EXEC-PLAN-EPIC-2.md` | **UPDATE** | Mark Epic 2 as 100% complete (6/6 stories), add completion summary |

</implementation_guidance>

---

<validation>
## Story Validation Checklist (for @po)

Esta story está pronta para @po quando:

- ✅ Discovery executado (3 endpoints comparados, tabela criada)
- ✅ Cross-Story Decisions (≥3 referências a Stories 2.1-2.5)
- ✅ AC em Gherkin (4-6 cenários: schemas, request validation, AI validation, consistency, Epic completion)
- ✅ Risks listados (3-4 riscos com severidade, mitigations)
- ✅ DoD checklist (12-15 itens, incluindo 3+ manual tests)
- ✅ Dev Notes com 3 code examples (request, AI response, schema re-use)
- ✅ File List com 3-4 arquivos (contracts.ts UPDATE, route.ts UPDATE, tests opcional, EXEC-PLAN UPDATE)

</validation>

---

<instructions>
1. **Execute Discovery** (Passo 1) — read route.ts atual, read /campaign (reference), grep schemas disponíveis, criar tabela 3 endpoints
2. **Adicione Cross-Story Decisions** (Passo 2) — ≥3 referências a 2.1-2.5
3. **Escreva AC** (Passo 3) — 5 cenários Gherkin (schemas, request, AI, consistency, Epic completion)
4. **Liste Risks** (Passo 4) — 3-4 riscos com mitigations
5. **Crie DoD** (Passo 5) — 12-15 checklist items (incluindo 3+ manual tests)
6. **Escreva Dev Notes** (Passo 6) — 3 code examples
7. **Preencha File List** — 3-4 arquivos com actions
8. **Salve story** em `docs/stories/2.6.story.md`
9. **NÃO commit** — aguardar @po validation
10. **Reporte para @po** quando pronto
</instructions>

---

<anti_patterns>
❌ **NEVER DO:**
- Pular Discovery (MANDATORY — tabela 3 endpoints é crítica)
- Refatorar /campaign ou /reels (OUT OF SCOPE)
- Criar novos schemas que duplicam 2.1 (MUST re-usar Audience, Objective, Positioning)
- Omitir manual tests do DoD (HIGH RISK — automated tests alone insufficient)
- Esquecer de atualizar EXEC-PLAN-EPIC-2.md (Epic 2 completion)
- Criar AC sem Gherkin format (consistency com Stories 2.1-2.5)

✅ **ALWAYS DO:**
- Discovery ANTES de AC (tabela 3 endpoints documenta escopo)
- Re-usar schemas de 2.1 (Audience, Objective, Positioning, ContentType)
- Seguir padrão de /campaign (400 INVALID_INPUT, 500 AI_INVALID_OUTPUT)
- Incluir 3+ manual tests no DoD (POST válido, inválido, IA inválida)
- Atualizar EXEC-PLAN-EPIC-2.md (Epic 2 100% complete)
- Dev Notes com 3 code examples (request, AI, schema re-use)
</anti_patterns>

---

<risk_mitigation>
## HIGH RISK Mitigation Strategies

### Risk #1: Endpoint /strategy quebrar em produção
**Severity:** 🔴 HIGH  
**Mitigation:**
- Manual tests OBRIGATÓRIOS antes de commit (POST com payloads reais)
- Validar contra payloads já usados em produção (se disponíveis)
- Considerar feature flag se risco for muito alto
- Adicionar logging completo de erros de validação

### Risk #2: IA retornar valores fora do schema
**Severity:** 🟡 MEDIUM  
**Mitigation:**
- Validação com safeParse() bloqueia valores inválidos (retorna 500)
- Prompt da IA já usa `response_format: { type: "json_object" }`
- Schema Zod força valores específicos (enum literals)
- Error logging para monitorar falhas da IA

### Risk #3: Tipos Zod não matcharem constantes existentes
**Severity:** 🟡 MEDIUM  
**Mitigation:**
- Validar contra constantes: `AUDIENCE_OPTIONS`, `OBJECTIVE_VALUES`, `PRODUCT_POSITIONING_OPTIONS`
- Se possível, usar mesmos arrays dos schemas (export de schemas.ts)
- Testes unitários verificam que Zod aceita valores das constantes

### Risk #4: Regressão em /campaign ou /reels
**Severity:** 🟢 LOW (se OUT_OF_SCOPE respeitado)  
**Mitigation:**
- Story 2.6 NÃO TOCA /campaign ou /reels (apenas /strategy)
- Manual test: POST /campaign continua funcionando após deploy de 2.6
- Se houver testes E2E, rodar após implementação de 2.6

</risk_mitigation>

---

**END OF PROMPT**
# Prompt: @sm — Criar Story 2.6 (Integration API Routes)

---

## 📋 ANALYSIS

**Why this prompt structure:**

1. **Discovery Table Required (3 endpoints):** Validate which endpoints JÁ USAM arquitetura (campaign, reels) vs qual NÃO USA (strategy) — prevent scope creep.

2. **HIGH RISK Emphasis:** `/campaign/strategy` é endpoint de produção, validação pode quebrar users existentes — mitigation strategies obrigatórias.

3. **Code Pattern Examples:** Request validation e AI response validation patterns from `/campaign` (Story 2.4 reference) — consistency across endpoints.

4. **Manual Test Requirements:** DoD DEVE incluir manual tests (POST with valid/invalid payloads) — automated tests alone insufficient for HIGH RISK.

5. **Scope Boundary:** Out of Scope section MUST be explicit (não refatorar `/campaign` ou `/reels`) — Story 2.6 apenas adiciona validação em `/strategy`.

6. **Epic 2 Completion:** Story 2.6 é final story — DoD inclui atualização de EXEC-PLAN-EPIC-2.md para 100% complete 🎉.

**Model Recommendation:** Claude Sonnet 4.6 (1x) — HIGH RISK integration story with production endpoint validation.

---

## 🤖 SYSTEM PROMPT

Copie tudo abaixo desta linha e envie para @sm.

---

<context>
**Projeto:** Vendeo — sales engine para lojas físicas (Next.js + TypeScript + Supabase)

**Story:** 2.6 — Integration API Routes  
**Epic:** Epic 2 — Arquitetura de Campanhas (FINAL STORY)  
**Dependencies:** Stories 2.1-2.5 ✅ ALL DONE

---

## Context

Stories 2.1-2.5 criaram a arquitetura completa de contratos e domínio:
- ✅ Story 2.1: Schemas Zod (validação de dados)
- ✅ Story 2.2: Tipos centralizados
- ✅ Story 2.3: Contratos de API
- ✅ Story 2.4: Mappers seguros (safeParse + error handling)
- ✅ Story 2.5: Selectors puros (lógica extraída)

**Story 2.6 é a integração final:** ativar validação em endpoints de produção e garantir que toda a stack funciona end-to-end.

---

## Discovery Executed (2026-04-20)

### Endpoints Analisados

| Endpoint | Status | Validação Request | Validação Response | Usa Mappers |
|----------|--------|-------------------|-------------------|-------------|
| `/api/generate/campaign` | ✅ COMPLETO | `CampaignRequestSchema.safeParse()` | `CampaignAISchema` via `callAIWithRetry()` | ✅ `mapDbCampaignToDomain()`, `mapAiCampaignToDomain()` |
| `/api/generate/reels` | ✅ COMPLETO | `ShortVideoRequestSchema.safeParse()` | `ShortVideoAISchema` via `callAIWithRetry()` | ✅ `mapAiShortVideoToDomain()` |
| `/api/generate/campaign/strategy` | ❌ INCOMPLETO | ❌ Apenas `req.json()` | ❌ Apenas `JSON.parse()` | ❌ Não usa schemas/mappers |

### Critical Findings

1. **`/api/generate/campaign` JÁ USA a arquitetura completa:**
   - Request: `CampaignRequestSchema.safeParse()` (Story 2.1)
   - Service: `generateCampaignContent()` usa `mapDbCampaignToDomain()` (Story 2.4)
   - AI validation: `CampaignAISchema` via `callAIWithRetry()` (Story 2.1)
   - Mapper: `mapAiCampaignToDomain()` com safeParse (Story 2.4)
   - Persistence: usa campos normalizados do `normalized` object

2. **`/api/generate/reels` também JÁ USA a arquitetura:**
   - Request: `ShortVideoRequestSchema.safeParse()`
   - Service: `generateShortVideoContent()` usa mappers
   - Domain: `lib/domain/short-videos/` (separado, mas mesmo padrão)

3. **`/api/generate/campaign/strategy` NÃO USA validação:**
   - ❌ Não valida entrada (aceita qualquer JSON)
   - ❌ Não valida resposta da IA (apenas `JSON.parse()` sem schema)
   - ❌ Retorna objeto sem contrato definido
   - ❌ Não usa tipos de `lib/domain/campaigns/types.ts`
   - ⚠️ Usa constantes diretas (`AUDIENCE_OPTIONS`, `OBJECTIVE_VALUES`, `PRODUCT_POSITIONING_OPTIONS`)

---

## Story 2.6 Goals

### Primary Goal
**Ativar validação em endpoint `/campaign/strategy` e garantir arquitetura end-to-end funcionando.**

### Secondary Goals
1. Criar contratos tipados para estratégia (request + response)
2. Adicionar validação Zod no endpoint de estratégia
3. Criar testes de integração end-to-end (opcional, mas recomendado)
4. Documentar que `/campaign` e `/reels` já usam a arquitetura completa

---

## Requirements

### R1: Criar Contratos de Estratégia (Story 2.3 extension)

**File:** `lib/domain/campaigns/contracts.ts` (UPDATE - já existe)

**Add:**
```typescript
// Strategy suggestion request
export const CampaignStrategyRequestSchema = z.object({
  product: z.object({
    type: ContentTypeSchema, // Re-usa de types.ts
    productName: z.string().min(1),
    description: z.string().optional(),
    price: z.string().optional(),
  }),
});

// Strategy suggestion response
export const CampaignStrategyResponseSchema = z.object({
  audience: CampaignAudienceSchema, // Re-usa de schemas.ts
  objective: CampaignObjectiveSchema, // Re-usa de schemas.ts
  productPositioning: ProductPositioningSchema, // Re-usa de schemas.ts
  reasoning: z.string().min(10),
});

export type CampaignStrategyRequest = z.infer<typeof CampaignStrategyRequestSchema>;
export type CampaignStrategyResponse = z.infer<typeof CampaignStrategyResponseSchema>;
```

**Rationale:**
- Re-usa schemas de Story 2.1 (Audience, Objective, Positioning)
- Garante que IA só pode retornar valores válidos
- TypeScript types automáticos via `z.infer`

---

### R2: Validar Endpoint `/campaign/strategy`

**File:** `app/api/generate/campaign/strategy/route.ts` (UPDATE)

**Changes:**
1. **Import contracts:**
   ```typescript
   import { CampaignStrategyRequestSchema, CampaignStrategyResponseSchema } from "@/lib/domain/campaigns/contracts";
   ```

2. **Validate request:**
   ```typescript
   const json = await req.json().catch(() => null);
   const body = CampaignStrategyRequestSchema.safeParse(json);
   
   if (body.success === false) {
     return NextResponse.json(
       { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() },
       { status: 400 }
     );
   }
   ```

3. **Validate AI response:**
   ```typescript
   const content = ai.choices[0].message.content || "{}";
   const parsed = JSON.parse(content);
   const validated = CampaignStrategyResponseSchema.safeParse(parsed);
   
   if (validated.success === false) {
     return NextResponse.json(
       { ok: false, requestId, error: "AI_INVALID_OUTPUT", details: validated.error.flatten() },
       { status: 500 }
     );
   }
   
   return NextResponse.json({
     ok: true,
     requestId,
     suggestion: validated.data,
   });
   ```

**Rationale:**
- Mesma estrutura de `/campaign` e `/reels` (consistência)
- Retorna `400` para input inválido (client error)
- Retorna `500` para IA retornar valores fora do schema (server error)
- `requestId` para rastreabilidade

---

### R3: Atualizar Prompt da IA (opcional, mas recomendado)

**File:** `app/api/generate/campaign/strategy/route.ts` (UPDATE)

**Rationale:**
- Prompt atual usa constantes hardcoded (`AUDIENCE_OPTIONS`, etc.)
- Melhor usar valores diretamente dos schemas Zod
- Exemplo:
  ```typescript
  import { AUDIENCE_VALUES, OBJECTIVE_VALUES, POSITIONING_VALUES } from "@/lib/domain/campaigns/types";
  ```

**Note:** Isso depende se `types.ts` exporta os arrays de valores. Se não, pode-se extrair via `.options` do Zod schema.

---

### R4: Testes (opcional para Story 2.6, mas documentar)

**Escopo sugerido:**
1. **Unit tests:** Validar schemas com dados válidos/inválidos
2. **Integration tests:** POST para `/campaign/strategy` com payloads válidos
3. **E2E tests:** Fluxo completo: criar campanha → sugerir estratégia → gerar conteúdo → persistir

**Note:** Pode ser Story 2.7 separada (Testing) ou parte de Story 2.6 (decisão do @sm).

---

## Success Criteria

### Must Have (Story 2.6 mínima)
- [ ] `CampaignStrategyRequestSchema` e `CampaignStrategyResponseSchema` criados em `contracts.ts`
- [ ] Endpoint `/campaign/strategy` valida request com `safeParse()`
- [ ] Endpoint `/campaign/strategy` valida resposta da IA com `safeParse()`
- [ ] Retorna `400` para input inválido, `500` para AI output inválido
- [ ] TypeScript typecheck passa sem erros
- [ ] Documentação inline (JSDoc) nos novos contratos

### Should Have (se tempo permitir)
- [ ] Testes unitários para `CampaignStrategyRequestSchema` e `CampaignStrategyResponseSchema`
- [ ] Teste de integração POST `/campaign/strategy` (happy path)
- [ ] Prompt da IA atualizado para usar valores dos schemas (não hardcoded)

### Nice to Have (Story 2.7?)
- [ ] Testes E2E para fluxo completo de geração
- [ ] CodeRabbit self-healing validação do prompt da IA
- [ ] Documentação de arquitetura atualizada com diagrama

---

## Out of Scope (NÃO FAZER)

- ❌ Refatorar `/campaign` ou `/reels` (já estão completos)
- ❌ Criar novos endpoints
- ❌ Modificar `generateCampaignContent()` service (já usa mappers seguros)
- ❌ Adicionar features novas (ex: retry logic, caching)
- ❌ Modificar schemas de Stories 2.1-2.5 (exceto se bug crítico)

---

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Endpoint `/strategy` quebrar em produção | 🔴 HIGH | Testar com payloads reais antes de commit |
| IA retornar valores fora do schema | 🟡 MEDIUM | Validação bloqueia e retorna 500 (IA deve ajustar temperatura) |
| Tipos do Zod não matcharem constantes existentes | 🟡 MEDIUM | Validar contra `AUDIENCE_OPTIONS`, `OBJECTIVE_VALUES`, etc. |
| Prompt da IA não gerar JSON válido | 🟢 LOW | `response_format: { type: "json_object" }` já configurado |

---

## Dependencies

**Blocks:** Nenhum (Story 2.6 é final do Epic 2)  
**Blocked by:** Stories 2.1-2.5 (todas ✅ DONE)

**Files to read:**
- `lib/domain/campaigns/contracts.ts` (Story 2.3)
- `lib/domain/campaigns/schemas.ts` (Story 2.1)
- `lib/domain/campaigns/types.ts` (Story 2.2)
- `app/api/generate/campaign/strategy/route.ts` (atual, sem validação)
- `app/api/generate/campaign/route.ts` (referência de estrutura)

---

## Code Examples (for @sm context)

### Example 1: Request validation pattern (from `/campaign`)

```typescript
const json = await req.json().catch(() => null);
const body = CampaignRequestSchema.safeParse(json);

if (body.success === false) {
  return NextResponse.json(
    { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() },
    { status: 400 }
  );
}

// body.data agora é tipado e validado
const { campaign_id, force, persist } = body.data;
```

### Example 2: AI response validation

```typescript
const content = ai.choices[0].message.content || "{}";
const parsed = JSON.parse(content);
const validated = CampaignStrategyResponseSchema.safeParse(parsed);

if (validated.success === false) {
  console.error("[strategy] AI returned invalid data:", validated.error);
  return NextResponse.json(
    { ok: false, requestId, error: "AI_INVALID_OUTPUT", details: validated.error.flatten() },
    { status: 500 }
  );
}

// validated.data agora é tipado e validado
return NextResponse.json({
  ok: true,
  requestId,
  suggestion: validated.data,
});
```

---

## Acceptance Criteria (Gherkin Preview for @sm)

```gherkin
Feature: Campaign Strategy Endpoint Validation

Scenario: Valid strategy request returns validated suggestion
  Given user is authenticated with valid storeId
  When POST /api/generate/campaign/strategy with valid product data
  Then response status is 200
  And response contains "audience", "objective", "productPositioning", "reasoning"
  And all fields match schema types (audience є AUDIENCE_VALUES, etc.)

Scenario: Invalid request payload returns 400
  Given user is authenticated
  When POST /api/generate/campaign/strategy with invalid product data
  Then response status is 400
  And response contains "error": "INVALID_INPUT"
  And response contains Zod validation details

Scenario: AI returns invalid data (safety net)
  Given OpenAI returns data outside schema (ex: objective="invalid_value")
  When validateAIResponse() is called
  Then endpoint returns 500
  And response contains "error": "AI_INVALID_OUTPUT"
  And error is logged for monitoring

Scenario: Existing endpoints continue working
  Given Stories 2.1-2.5 are deployed
  When POST /api/generate/campaign with valid payload
  Then response is validated and successful (no regression)
```

---

## Definition of Done (Story 2.6)

- [ ] `CampaignStrategyRequestSchema` created in `contracts.ts`
- [ ] `CampaignStrategyResponseSchema` created in `contracts.ts`
- [ ] Endpoint `/campaign/strategy` validates request with schema
- [ ] Endpoint `/campaign/strategy` validates AI response with schema
- [ ] Error responses follow pattern (`INVALID_INPUT` 400, `AI_INVALID_OUTPUT` 500)
- [ ] TypeScript `npx tsc --noEmit` passes with 0 errors
- [ ] Manual test: POST `/strategy` with valid payload → 200
- [ ] Manual test: POST `/strategy` with invalid payload → 400
- [ ] Git commit with message: `feat: add validation to campaign strategy endpoint [Story 2.6]`
- [ ] Story 2.6 status updated: Ready → InProgress → InReview → Done
- [ ] EXEC-PLAN-EPIC-2.md updated: Epic 2 100% complete 🎉

---

## Notes for @sm

### Story Complexity
- **Effort:** 4-5h (HIGH RISK per EXEC-PLAN)
- **Points:** 5 (suggested)
- **Type:** Integration/Validation
- **Risk:** 🔴 HIGH (production endpoint, IA validation)

### Why HIGH RISK?
1. Endpoint `/strategy` is used in production dashboard
2. Validation can block existing users if types mismatch
3. IA output validation is critical (pode retornar valores inesperados)
4. Story 2.6 fecha Epic 2 (precisa estar 100% correto)

### Mitigation Strategy
1. Test with real payloads from production before deploy
2. Add comprehensive error logging
3. Consider feature flag if risk is too high
4. Manual QA validation required (not just automated tests)

---

## @prompt-eng Action Required

**Task:** Transform this requirements document into structured prompt for @sm to create Story 2.6 draft.

**Output format:** `docs/stories/prompts/sm-story-2.6.prompt.md` (structured XML + CoT + Few-shot examples)

**Key sections to emphasize in prompt:**
1. Discovery results (3 endpoints, 1 needs work)
2. R1-R2 requirements (contratos + validação)
3. Success Criteria (Must Have vs Should Have)
4. Risk Assessment (HIGH RISK, production endpoint)
5. Out of Scope (não refatorar outros endpoints)
6. Code Examples (request validation, AI response validation)
7. Acceptance Criteria (Gherkin preview)

**Expected @sm output:** `docs/stories/2.6.story.md` with:
- Discovery table (3 endpoints)
- 4-6 Acceptance Criteria (Gherkin)
- Dev Notes with validation patterns
- File List (2-3 files: contracts.ts UPDATE, route.ts UPDATE, contracts.test.ts CREATE opcional)
- Risks section (3-4 risks, 1-2 🔴 HIGH)
- DoD checklist (12-15 items, incluindo manual tests)

---

**Ready for @prompt-eng processing.**
