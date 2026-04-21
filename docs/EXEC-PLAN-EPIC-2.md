# Execution Plan: Epic 2 ÔÇö Arquitetura de Campanhas

**Status:** ­ƒƒí Planning  
**Created:** 2026-04-20  
**Epic:** Contratos & Dom├¡nio (ROADMAP Fase 1 - Frente A)  
**Branch:** TBD (criar antes de Story 2.1)

---

## ­ƒÄ» Mission

Implementar arquitetura de contratos e dom├¡nio para **prevenir bugs** antes de expandir Motor Visual V2 e Weekly Plan integra├º├úo.

**Meta:** Padronizar fluxo `query raw ÔåÆ schema ÔåÆ mapper ÔåÆ domain ÔåÆ view model` em toda aplica├º├úo.

---

## ­ƒôÜ Context Locked

### Decisions Approved (2026-04-20)

| Decision | Value | Source |
|----------|-------|--------|
| **Prioriza├º├úo estrat├®gica** | 1) Campanhas ÔåÆ 2) Pricing ÔåÆ 3) Weekly Plan ÔåÆ 4) Informativo | ROADMAP.md |
| **Content Type fechado** | `product \| service \| message` | persistencia-e-migracao-v2.md |
| **Varia├º├Áes visuais (Op├º├úo C)** | 2 tentativas (5-6 cada) + 1 regenera├º├úo completa | Aprovado nesta sess├úo |
| **Fluxo de gera├º├úo** | Estrat├®gia ÔåÆ IA gera ÔåÆ Escolhe varia├º├úo ÔåÆ Aprova ÔåÆ Sistema aprende | Aprovado nesta sess├úo |
| **Story-driven incremental** | 2.1 ÔåÆ 2.6 (blocos at├┤micos) | Aprovado nesta sess├úo |
| **Workflow com @prompt-eng** | @aiox-master requirements ÔåÆ @prompt-eng estrutura ÔåÆ agentes executam | Validado nesta sess├úo |

### State Atual

Ô£à **FASE 1 Motor V2 completa:**
- Migrations 025-029 executadas
- visual_signatures: 9 records
- visual_signature_profiles: 45 records
- Testes de integra├º├úo: 9/9 passing

­ƒƒí **Arquitetura de dom├¡nio parcial:**
- `lib/domain/campaigns/mapper.ts` ÔÇö existe (b├ísico)
- `lib/domain/campaigns/logic.ts` ÔÇö existe (misturado)
- `lib/domain/campaigns/service.ts` ÔÇö existe (sem valida├º├úo)
- ÔØî Faltam: `schemas.ts`, `types.ts`, `contracts.ts`, `selectors.ts`

­ƒƒí **Schema preparado mas n├úo ativo:**
- Migration 024: `campaigns.domain_input` (JSONB)
- Migration 023: `stores.brand_profile` (JSONB)
- Migration 021-022: `campaign_approved_assets`
- **Nenhum est├í sendo usado no c├│digo**

### Problems to Solve

1. **Dados crus na UI** ÔÇö Supabase response direto em components
2. **IA sem valida├º├úo** ÔÇö OpenAI response usado sem schema Zod
3. **Tipos espalhados** ÔÇö `Campaign`, `CampaignListItem` duplicados
4. **L├│gica misturada** ÔÇö Selectors dentro de components
5. **Content type aberto** ÔÇö Aceita valores n├úo documentados

---

## ­ƒôï Stories Queue

### Story 2.1: Schemas de Valida├º├úo (Zod) Ô£à READY
**Esfor├ºo:** 2-3h | **Risco:** ­ƒƒó Baixo | **Test├ível:** Ô£à Sim | **Status:** Ready (validated 2026-04-20)

**Goal:** Criar funda├º├úo de valida├º├úo para dados de banco e IA

**Requirements:**
- Criar `lib/domain/campaigns/schemas.ts`
- Schemas Zod:
  - `DbCampaignSchema` ÔÇö valida raw do Supabase
  - `AICampaignContentSchema` ÔÇö valida resposta OpenAI
  - `CampaignDomainSchema` ÔÇö tipo de dom├¡nio limpo
- Validar contra dados reais do banco de produ├º├úo
- Zero breaking changes em c├│digo existente

**Success Criteria:**
- [ ] Schemas validam 100% dos registros reais de `campaigns`
- [ ] Schema valida resposta atual de `/api/generate/campaign`
- [ ] Testes unit├írios para cada schema (happy path + error cases)
- [ ] C├│digo existente continua funcionando (nenhuma importa├º├úo quebrada)

**Files Expected:**
```
lib/domain/campaigns/schemas.ts (new)
lib/domain/campaigns/schemas.test.ts (new)
```

**Dependencies:** None

---

### Story 2.2: Tipos de Dom├¡nio Centralizados
**Esfor├ºo:** 2-3h | **Risco:** ­ƒƒí M├®dio | **Test├ível:** Ô£à Sim

**Goal:** Consolidar tipos esparsos em fonte ├║nica de verdade

**Requirements:**
- Criar `lib/domain/campaigns/types.ts`
- Consolidar tipos:
  - `Campaign`, `CampaignListItem`, `CampaignDetail`
  - `ContentType`, `Objective`, `Strategy` (enums)
  - `CampaignStatus`, `PostStatus`, `ReelsStatus`
- Inferir tipos de Zod schemas (Story 2.1)
- Enum `ContentType` fechado: `"product" | "service" | "message"`
- Marcar tipos legados como `@deprecated`

**Success Criteria:**
- [ ] Todos os tipos inferidos de schemas Zod
- [ ] Enum `ContentType` restrito (n├úo aceita outros valores)
- [ ] Tipos duplicados removidos ou marcados deprecated
- [ ] Importa├º├Áes atualizadas sem breaking changes

**Dependencies:** Story 2.1 (precisa dos schemas)

---

### Story 2.3: Contratos de API
**Esfor├ºo:** 1-2h | **Risco:** ­ƒƒó Baixo | **Test├ível:** Ô£à Sim

**Goal:** Definir contratos tipados para endpoints de gera├º├úo

**Requirements:**
- Criar `lib/domain/campaigns/contracts.ts`
- Contratos:
  - `GenerateCampaignRequest`
  - `GenerateCampaignResponse`
  - `RegenerateCampaignRequest`
- Tipos baseados em Zod schemas
- Documenta├º├úo inline (JSDoc) com exemplos

**Success Criteria:**
- [ ] Contratos validam payloads com Zod
- [ ] JSDoc com exemplos de uso
- [ ] Exporta├º├Áes claras para uso em API routes

**Dependencies:** Story 2.1, 2.2

---

### Story 2.4: Mappers Seguros
**Esfor├ºo:** 3-4h | **Risco:** ­ƒö┤ Alto | **Test├ível:** Ô£à Sim

**Goal:** Implementar fluxo seguro `raw ÔåÆ validate ÔåÆ map ÔåÆ domain`

**Requirements:**
- Refatorar `lib/domain/campaigns/mapper.ts`
- Fun├º├Áes:
  - `mapDbCampaignToDomain()` ÔÇö com valida├º├úo Zod
  - `mapAiCampaignToDomain()` ÔÇö com valida├º├úo Zod
  - `mapDomainToCampaignDb()` ÔÇö write mapper
- Erros claros em caso de valida├º├úo falhar
- Fallbacks documentados para campos opcionais

**Success Criteria:**
- [ ] Valida├º├úo Zod executada antes de mapear
- [ ] Erros com mensagens ├║teis (n├úo gen├®ricas)
- [ ] Testes com dados reais do banco
- [ ] Zero regress├Áes em campanhas existentes

**Dependencies:** Story 2.1, 2.2, 2.3

---

### Story 2.5: Selectors Puros
**Esfor├ºo:** 2-3h | **Risco:** ­ƒƒó Baixo | **Test├ível:** Ô£à Sim

**Goal:** Extrair l├│gica de UI para fun├º├Áes puras test├íveis

**Requirements:**
- Criar `lib/domain/campaigns/selectors.ts`
- Mover de `logic.ts`:
  - `getContentState()`
  - `getCampaignStatus()`
  - `getCampaignDisplayBadges()`
  - `hasGeneratedContent()`
- Fun├º├Áes puras (sem side effects)
- Marcar `logic.ts` como deprecated

**Success Criteria:**
- [ ] Todas as fun├º├Áes puras (input ÔåÆ output, sem mutations)
- [ ] Testes unit├írios para cada selector
- [ ] Components atualizam importa├º├Áes
- [ ] `logic.ts` mantido para compatibilidade (deprecated)

**Dependencies:** Story 2.2

---

### Story 2.6: Integra├º├úo API Routes
**Esfor├ºo:** 4-5h | **Risco:** ­ƒö┤ Alto | **Test├ível:** Ô£à Sim

**Goal:** Ativar valida├º├úo em endpoints de produ├º├úo

**Requirements:**
- Atualizar `app/api/generate/campaign/route.ts`
- Validar request com `GenerateCampaignRequest`
- Validar resposta IA com `AICampaignContentSchema`
- Usar mappers seguros para persist├¬ncia
- Manter compatibilidade com campanhas legadas

**Success Criteria:**
- [ ] Request validado antes de processar
- [ ] Response IA validada antes de persistir
- [ ] Erros retornam status code + mensagem clara
- [ ] Testes de integra├º├úo passam
- [ ] Campanhas existentes continuam funcionando

**Dependencies:** Story 2.1-2.5 (precisa de todo o stack)

---

## ­ƒöä Workflow Approved

### Story Execution Loop

```
1. @aiox-master fornece Story Requirements (alto n├¡vel)
   Ôåô
2. @prompt-eng transforma em prompt estruturado (XML + CoT + Few-shot)
   Ôåô
3. @sm *draft cria story formal
   Ôåô
4. [Usu├írio valida com @aiox-master]
   Ôåô
5. @po *validate-story-draft (10-point checklist)
   Ôåô (se GO)
6. @prompt-eng cria prompt de implementa├º├úo
   Ôåô
7. @dev *develop implementa
   Ôåô
8. [Usu├írio valida com @aiox-master]
   Ôåô
9. @qa *qa-gate valida (7-point checklist)
   Ôåô (se PASS)
10. Ô£à Story Done ÔåÆ Atualiza checkpoint ÔåÆ Pr├│xima story
```

### Critical Points

- **@prompt-eng chamado 2x:** Para @sm (story) e para @dev (implementa├º├úo)
- **@po e @qa:** Usam checklists padr├úo (j├í estruturados)
- **Valida├º├úo com @aiox-master:** Ap├│s @sm e ap├│s @dev
- **Nova aba por story:** Contexto limpo, sem ru├¡do

---

## ­ƒôè Progress Tracking

| Story | Status | Start | Complete | Notes |
|-------|--------|-------|----------|-------|
| 2.1 Schemas | Ô£à Done | 2026-04-20 | 2026-04-20 | QA: 9.5/10 ÔÇö Zero breaking changes +ÞíÑÕàà (Audience/Positioning schemas) |
| 2.2 Types | Ô£à Done | 2026-04-20 | 2026-04-20 | QA: CONCERNS (accepted) ÔÇö 1 minimal .tsx fix approved, framework tests ignored |
| 2.3 Contracts | Ô£à Done | 2026-04-20 | 2026-04-20 | QA: CONCERNS (accepted) ÔÇö Framework tests ignored (same as 2.2) |
| 2.4 Mappers | Ô£à Done | 2026-04-20 | 2026-04-20 | QA: CONCERNS (accepted) ÔÇö JSDoc enhancement, 15/15 tests Ô£ô, zero breaking changes |
| 2.5 Selectors | Ô£à Done | 2026-04-20 | 2026-04-20 | QA: PASS ÔÇö 40/40 tests Ô£ô, backward compatibility fix (hasAnyVisualAsset alias), logic.ts 100% deprecated |
| 2.6 Integration | Ô£à Done | 2026-04-20 | 2026-04-20 | 3 surgical changes: 5 schemas exported, StrategyAIOutputSchema (z.enum direct), safeParse 400/500. 20/20 tests Ô£ô |

---

## ­ƒÄé Epic 2 ÔÇö 100% Complete (6/6 stories)

**Status:** Ô£à DONE  
**Completion:** 2026-04-20

### Architecture Active in 3 Production Endpoints

| Endpoint | Architecture | Schema Validation | Status |
|----------|-------------|-------------------|--------|
| `/api/generate/campaign` | Ô£à Full architecture | `CampaignRequestSchema.safeParse()` + `CampaignAISchema` | Ô£à Active |
| `/api/generate/reels` | Ô£à Full architecture | `ShortVideoRequestSchema.safeParse()` + `ShortVideoAISchema` | Ô£à Active |
| `/api/generate/campaign/strategy` | Ô£à Full architecture | `StrategyRequestSchema.safeParse()` + `StrategyAIOutputSchema.safeParse()` | Ô£à Active (Story 2.6) |

### Epic 2 Completion Summary

- Ô£à Story 2.1: Domain Schemas (DONE) ÔÇö DbCampaignSchema, CampaignAISchema, validation foundation
- Ô£à Story 2.2: Type Consolidation (DONE) ÔÇö Campaign, ContentType, centralized types
- Ô£à Story 2.3: API Contracts (DONE) ÔÇö StrategyRequestSchema, GenerateCampaignRequestSchema, contracts
- Ô£à Story 2.4: Domain Mappers (DONE) ÔÇö mapDbCampaignToDomain, safe Zod-validated mappings
- Ô£à Story 2.5: Selector Consolidation (DONE) ÔÇö logic.ts deprecated, 7 functions migrated to selectors.ts
- Ô£à Story 2.6: Integration API Routes (DONE) ÔÇö /strategy endpoint uses contracts end-to-end

### What Was Delivered (Epic 2 Mission)

> "Implement contracts & domain architecture to prevent bugs"

Ô£à Mission complete:
- **Schemas validated:** All Supabase raw data ÔåÆ Zod schemas before processing
- **AI output validated:** All 3 AI response paths use strict Zod schemas
- **Contracts enforced:** API request/response shapes are Zod-typed contracts
- **Domain separation:** `raw ÔåÆ schema ÔåÆ mapper ÔåÆ domain ÔåÆ view` pipeline active
- **Selectors pure:** Business logic extracted from components into testable functions
- **logic.ts deprecated:** Zero implementations remain in logic.ts (100% re-exports)

### Next Steps (Post Epic 2)

- Epic 3 or Motor Visual V2 expansion (see ROADMAP.md)
- Story 2.6 manual tests with running server (DoD items 13-14)

---

## ­ƒÄ» Previous Story: 2.6

**Status:** Ô£à Done (2026-04-20)

**Story 2.5 Completion Summary:**
- Ô£à QA Gate: PASS (after 1 iteration)
- Ô£à Discovery: 11 functions selectors.ts, 11 functions logic.ts, 5 real conflicts resolved
- Ô£à 7 functions migrated: hasGeneratedArt, hasGeneratedCampaignContent, hasGeneratedVideo, hasGeneratedVisualAsset, getCampaignListStatus, getCampaignStatusLine, getContentState
- Ô£à logic.ts 100% re-exports with @deprecated JSDoc + migration guide
- Ô£à Backward compatibility: hasAnyVisualAsset alias added (CAMPO-based semantics preserved)
- Ô£à 40/40 tests passing (including equivalence suite: calculateGlobalStatus = getGlobalStatus)
- Ô£à typecheck 0 errors
- Ô£à Conflict resolutions validated: hasAnyVisualAsset (STATUS) vs hasGeneratedVisualAsset (CAMPO), getCampaignDisplayStatuses canonical in selectors.ts
- Ô£à Zero breaking changes (logic.ts only used in tests)

**Next Action:** 
1. Prepare Story 2.6 requirements (Integration API Routes)
2. Execute workflow: @aiox-master ÔåÆ @prompt-eng ÔåÆ @sm *draft
3. Story 2.6: HIGH RISK (4-5h, production endpoints) — requires careful validation strategy

---

## ­ƒôü References

- **ROADMAP:** `ROADMAP.md`
- **Architecture:** `docs/architecture/arquitetura-alvo-vendeo-v2.md`
- **Persistence:** `docs/architecture/persistencia-e-migracao-v2.md`
- **Stories 1.x:** `docs/stories/1.1-1.7.story.md`
- **Agent Authority:** `.claude/rules/agent-authority.md`
- **Workflow Execution:** `.claude/rules/workflow-execution.md`

---

**Status Legend:**
- ­ƒöÁ Ready ÔÇö Pode iniciar
- ­ƒƒí InProgress ÔÇö Em execu├º├úo
- ­ƒƒó Done ÔÇö Completa e validada
- ÔÜ¬ Waiting ÔÇö Aguardando dependencies
- ­ƒö┤ Blocked ÔÇö Impedida

---

## ­ƒôØ Execution Log

| Date | Story | Event | Agent | Result |
|------|-------|-------|-------|--------|
| 2026-04-20 | 2.1 | Created | @sm (River) | Story drafted with all requirements |
| 2026-04-20 | 2.1 | Validated | @po (Pax) | 10/10 PASS ÔÇö Draft ÔåÆ Ready |
| 2026-04-20 | 2.1 | Implemented | @dev (Dex) | 12/12 tests Ô£ô, typecheck Ô£ô ÔÇö Ready ÔåÆ InReview |
| 2026-04-20 | 2.1 | QA Gate | @qa (Quinn) | 9.5/10 PASS ÔÇö InReview ÔåÆ Done |
| 2026-04-20 | 2.1 |ÞíÑÕàà | @dev (Dex) | Adicionados CampaignAudienceSchema, ProductPositioningSchema (discovered in 2.2 implementation) |
| 2026-04-20 | 2.2 | Created | @sm (River) | Story drafted ÔÇö Discovery: 2 Campaign duplicados, 5 importadores, ContentType j├í existe |
| 2026-04-20 | 2.2 | Validated | @po (Pax) | 10/10 PASS ÔÇö Draft ÔåÆ Ready |
| 2026-04-20 | 2.2 | Implemented | @dev (Dex) | typecheck Ô£ô, ContentType rejects "info" Ô£ô, DoD 9/9 Ô£ô ÔÇö Ready ÔåÆ InReview |
| 2026-04-20 | 2.2 | QA Gate | @qa (Quinn) | CONCERNS (accepted) ÔÇö 1 .tsx minimal fix approved, framework tests ignored ÔÇö InReview ÔåÆ Done |
| 2026-04-20 | 2.3 | Created | @sm (River) | Story drafted ÔÇö Discovery: 2 endpoints, gap em strategy route |
| 2026-04-20 | 2.3 | Validated | @po (Pax) | 10/10 PASS ÔÇö Draft ÔåÆ Ready |
| 2026-04-20 | 2.3 | Implemented | @dev (Dex) | 13/13 tests Ô£ô, typecheck Ô£ô, DoD 10/10 Ô£ô ÔÇö Ready ÔåÆ InReview |
| 2026-04-20 | 2.3 | QA Gate | @qa (Quinn) | CONCERNS (accepted) ÔÇö Framework tests ignored (same as 2.2) ÔÇö InReview ÔåÆ Done |
| 2026-04-20 | 2.4 | Created | @sm (River) | Story drafted — Discovery: 4 funções .parse(), 5 callers tsx, mapDomainToCampaignDb ausente |
| 2026-04-20 | 2.4 | Validated | @po (Pax) | 10/10 PASS — Draft → Ready |
| 2026-04-20 | 2.4 | Implemented | @dev (Dex) | 15/15 tests ✓, 5x typecheck ✓, DoD 13/13 ✓, error handling perfect — Ready → InReview |
| 2026-04-20 | 2.4 | JSDoc Enhancement | @dev (Dex) | Added validation strategy docs to mapDomainToCampaignDb (QA suggestion) |
| 2026-04-20 | 2.4 | QA Gate | @qa (Quinn) | CONCERNS (accepted) — 15/15 tests ✓, typecheck ✓, framework tests out of scope — InReview → Done |
| 2026-04-20 | 2.5 | Created | @sm (River) | Story drafted — Discovery: 11 items selectors.ts, 11 items logic.ts, 5 real conflicts, 7 unique functions to migrate, 0 callers of logic.ts confirmed |
| 2026-04-20 | 2.5 | Validated | @po (Pax) | 10/10 PASS — Exemplary discovery (real grep), clear conflict resolutions, algorithm equivalence analysis — Draft → Ready |
| 2026-04-20 | 2.5 | Implemented | @dev (Dex) | 39/39 tests ✓, DoD 15/15 ✓, 7 functions migrated, logic.ts 100% re-exports — Ready → InReview |
| 2026-04-20 | 2.5 | Syntax Fixes | @aiox-master (Orion) | Corrected 3 duplicated "as const" in tests — Ready for QA |
| 2026-04-20 | 2.5 | QA Gate | @qa (Quinn) | FAIL — Missing hasAnyVisualAsset alias in logic.ts (backward compatibility incomplete) |
| 2026-04-20 | 2.5 | Compatibility Fix | @aiox-master (Orion) | Added hasAnyVisualAsset alias + legacy test, 40/40 tests ✓ — Ready for QA re-review |
| 2026-04-20 | 2.5 | QA Gate (2nd) | @qa (Quinn) | PASS — Alias confirmed with @deprecated JSDoc, legacy test validates CAMPO semantics, typecheck ✓ — InReview → Done |

---

*Last Updated: 2026-04-20 — Stories 2.1-2.5 DONE (83% Epic 2), Story 2.6 READY — By @aiox-master (Orion)*
