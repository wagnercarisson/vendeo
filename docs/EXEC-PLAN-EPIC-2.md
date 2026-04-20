# Execution Plan: Epic 2 — Arquitetura de Campanhas

**Status:** 🟡 Planning  
**Created:** 2026-04-20  
**Epic:** Contratos & Domínio (ROADMAP Fase 1 - Frente A)  
**Branch:** TBD (criar antes de Story 2.1)

---

## 🎯 Mission

Implementar arquitetura de contratos e domínio para **prevenir bugs** antes de expandir Motor Visual V2 e Weekly Plan integração.

**Meta:** Padronizar fluxo `query raw → schema → mapper → domain → view model` em toda aplicação.

---

## 📚 Context Locked

### Decisions Approved (2026-04-20)

| Decision | Value | Source |
|----------|-------|--------|
| **Priorização estratégica** | 1) Campanhas → 2) Pricing → 3) Weekly Plan → 4) Informativo | ROADMAP.md |
| **Content Type fechado** | `product \| service \| message` | persistencia-e-migracao-v2.md |
| **Variações visuais (Opção C)** | 2 tentativas (5-6 cada) + 1 regeneração completa | Aprovado nesta sessão |
| **Fluxo de geração** | Estratégia → IA gera → Escolhe variação → Aprova → Sistema aprende | Aprovado nesta sessão |
| **Story-driven incremental** | 2.1 → 2.6 (blocos atômicos) | Aprovado nesta sessão |
| **Workflow com @prompt-eng** | @aiox-master requirements → @prompt-eng estrutura → agentes executam | Validado nesta sessão |

### State Atual

✅ **FASE 1 Motor V2 completa:**
- Migrations 025-029 executadas
- visual_signatures: 9 records
- visual_signature_profiles: 45 records
- Testes de integração: 9/9 passing

🟡 **Arquitetura de domínio parcial:**
- `lib/domain/campaigns/mapper.ts` — existe (básico)
- `lib/domain/campaigns/logic.ts` — existe (misturado)
- `lib/domain/campaigns/service.ts` — existe (sem validação)
- ❌ Faltam: `schemas.ts`, `types.ts`, `contracts.ts`, `selectors.ts`

🟡 **Schema preparado mas não ativo:**
- Migration 024: `campaigns.domain_input` (JSONB)
- Migration 023: `stores.brand_profile` (JSONB)
- Migration 021-022: `campaign_approved_assets`
- **Nenhum está sendo usado no código**

### Problems to Solve

1. **Dados crus na UI** — Supabase response direto em components
2. **IA sem validação** — OpenAI response usado sem schema Zod
3. **Tipos espalhados** — `Campaign`, `CampaignListItem` duplicados
4. **Lógica misturada** — Selectors dentro de components
5. **Content type aberto** — Aceita valores não documentados

---

## 📋 Stories Queue

### Story 2.1: Schemas de Validação (Zod) ✅ READY
**Esforço:** 2-3h | **Risco:** 🟢 Baixo | **Testável:** ✅ Sim | **Status:** Ready (validated 2026-04-20)

**Goal:** Criar fundação de validação para dados de banco e IA

**Requirements:**
- Criar `lib/domain/campaigns/schemas.ts`
- Schemas Zod:
  - `DbCampaignSchema` — valida raw do Supabase
  - `AICampaignContentSchema` — valida resposta OpenAI
  - `CampaignDomainSchema` — tipo de domínio limpo
- Validar contra dados reais do banco de produção
- Zero breaking changes em código existente

**Success Criteria:**
- [ ] Schemas validam 100% dos registros reais de `campaigns`
- [ ] Schema valida resposta atual de `/api/generate/campaign`
- [ ] Testes unitários para cada schema (happy path + error cases)
- [ ] Código existente continua funcionando (nenhuma importação quebrada)

**Files Expected:**
```
lib/domain/campaigns/schemas.ts (new)
lib/domain/campaigns/schemas.test.ts (new)
```

**Dependencies:** None

---

### Story 2.2: Tipos de Domínio Centralizados
**Esforço:** 2-3h | **Risco:** 🟡 Médio | **Testável:** ✅ Sim

**Goal:** Consolidar tipos esparsos em fonte única de verdade

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
- [ ] Enum `ContentType` restrito (não aceita outros valores)
- [ ] Tipos duplicados removidos ou marcados deprecated
- [ ] Importações atualizadas sem breaking changes

**Dependencies:** Story 2.1 (precisa dos schemas)

---

### Story 2.3: Contratos de API
**Esforço:** 1-2h | **Risco:** 🟢 Baixo | **Testável:** ✅ Sim

**Goal:** Definir contratos tipados para endpoints de geração

**Requirements:**
- Criar `lib/domain/campaigns/contracts.ts`
- Contratos:
  - `GenerateCampaignRequest`
  - `GenerateCampaignResponse`
  - `RegenerateCampaignRequest`
- Tipos baseados em Zod schemas
- Documentação inline (JSDoc) com exemplos

**Success Criteria:**
- [ ] Contratos validam payloads com Zod
- [ ] JSDoc com exemplos de uso
- [ ] Exportações claras para uso em API routes

**Dependencies:** Story 2.1, 2.2

---

### Story 2.4: Mappers Seguros
**Esforço:** 3-4h | **Risco:** 🔴 Alto | **Testável:** ✅ Sim

**Goal:** Implementar fluxo seguro `raw → validate → map → domain`

**Requirements:**
- Refatorar `lib/domain/campaigns/mapper.ts`
- Funções:
  - `mapDbCampaignToDomain()` — com validação Zod
  - `mapAiCampaignToDomain()` — com validação Zod
  - `mapDomainToCampaignDb()` — write mapper
- Erros claros em caso de validação falhar
- Fallbacks documentados para campos opcionais

**Success Criteria:**
- [ ] Validação Zod executada antes de mapear
- [ ] Erros com mensagens úteis (não genéricas)
- [ ] Testes com dados reais do banco
- [ ] Zero regressões em campanhas existentes

**Dependencies:** Story 2.1, 2.2, 2.3

---

### Story 2.5: Selectors Puros
**Esforço:** 2-3h | **Risco:** 🟢 Baixo | **Testável:** ✅ Sim

**Goal:** Extrair lógica de UI para funções puras testáveis

**Requirements:**
- Criar `lib/domain/campaigns/selectors.ts`
- Mover de `logic.ts`:
  - `getContentState()`
  - `getCampaignStatus()`
  - `getCampaignDisplayBadges()`
  - `hasGeneratedContent()`
- Funções puras (sem side effects)
- Marcar `logic.ts` como deprecated

**Success Criteria:**
- [ ] Todas as funções puras (input → output, sem mutations)
- [ ] Testes unitários para cada selector
- [ ] Components atualizam importações
- [ ] `logic.ts` mantido para compatibilidade (deprecated)

**Dependencies:** Story 2.2

---

### Story 2.6: Integração API Routes
**Esforço:** 4-5h | **Risco:** 🔴 Alto | **Testável:** ✅ Sim

**Goal:** Ativar validação em endpoints de produção

**Requirements:**
- Atualizar `app/api/generate/campaign/route.ts`
- Validar request com `GenerateCampaignRequest`
- Validar resposta IA com `AICampaignContentSchema`
- Usar mappers seguros para persistência
- Manter compatibilidade com campanhas legadas

**Success Criteria:**
- [ ] Request validado antes de processar
- [ ] Response IA validada antes de persistir
- [ ] Erros retornam status code + mensagem clara
- [ ] Testes de integração passam
- [ ] Campanhas existentes continuam funcionando

**Dependencies:** Story 2.1-2.5 (precisa de todo o stack)

---

## 🔄 Workflow Approved

### Story Execution Loop

```
1. @aiox-master fornece Story Requirements (alto nível)
   ↓
2. @prompt-eng transforma em prompt estruturado (XML + CoT + Few-shot)
   ↓
3. @sm *draft cria story formal
   ↓
4. [Usuário valida com @aiox-master]
   ↓
5. @po *validate-story-draft (10-point checklist)
   ↓ (se GO)
6. @prompt-eng cria prompt de implementação
   ↓
7. @dev *develop implementa
   ↓
8. [Usuário valida com @aiox-master]
   ↓
9. @qa *qa-gate valida (7-point checklist)
   ↓ (se PASS)
10. ✅ Story Done → Atualiza checkpoint → Próxima story
```

### Critical Points

- **@prompt-eng chamado 2x:** Para @sm (story) e para @dev (implementação)
- **@po e @qa:** Usam checklists padrão (já estruturados)
- **Validação com @aiox-master:** Após @sm e após @dev
- **Nova aba por story:** Contexto limpo, sem ruído

---

## 📊 Progress Tracking

| Story | Status | Start | Complete | Notes |
|-------|--------|-------|----------|-------|
| 2.1 Schemas | ✅ Done | 2026-04-20 | 2026-04-20 | QA: 9.5/10 — Zero breaking changes +补充 (Audience/Positioning schemas) |
| 2.2 Types | ✅ Done | 2026-04-20 | 2026-04-20 | QA: CONCERNS (accepted) — 1 minimal .tsx fix approved, framework tests ignored |
| 2.3 Contracts | ✅ Done | 2026-04-20 | 2026-04-20 | QA: CONCERNS (accepted) — Framework tests ignored (same as 2.2) |
| 2.4 Mappers | 🔵 Ready | — | — | Dependencies met (2.1 ✅, 2.2 ✅, 2.3 ✅) |
| 2.5 Selectors | ⚪ Waiting | — | — | Após 2.2 |
| 2.6 Integration | ⚪ Waiting | — | — | Após 2.1-2.5 |

---

## 🎯 Current Story: 2.4

**Status:** 🔵 Ready (dependencies met: 2.1 ✅, 2.2 ✅, 2.3 ✅)

**Ready for:** @sm *draft Story 2.4 (Mappers Seguros)

**Story 2.3 Completion Summary:**
- ✅ QA Gate: CONCERNS (accepted)
- ✅ 4 schemas Zod criados (GenerateCampaignRequest/Response, StrategyRequest/Response)
- ✅ Re-export sem duplicação (GenerateCampaignRequestSchema = CampaignRequestSchema)
- ✅ Discriminated unions por `ok: boolean`
- ✅ Enum fechado (product|service|message) sem "info"
- ✅ JSDoc completo com @example
- ✅ 13/13 testes passing
- ⚠️ Framework tests ignored (out of scope)

**Next Action:** 
1. Prepare Story 2.4 requirements for @sm
2. Execute workflow: @aiox-master → @prompt-eng → @sm *draft
3. Story 2.4: Mappers Seguros (raw → validate → map → domain)

---

## 📁 References

- **ROADMAP:** `ROADMAP.md`
- **Architecture:** `docs/architecture/arquitetura-alvo-vendeo-v2.md`
- **Persistence:** `docs/architecture/persistencia-e-migracao-v2.md`
- **Stories 1.x:** `docs/stories/1.1-1.7.story.md`
- **Agent Authority:** `.claude/rules/agent-authority.md`
- **Workflow Execution:** `.claude/rules/workflow-execution.md`

---

**Status Legend:**
- 🔵 Ready — Pode iniciar
- 🟡 InProgress — Em execução
- 🟢 Done — Completa e validada
- ⚪ Waiting — Aguardando dependencies
- 🔴 Blocked — Impedida

---

## 📝 Execution Log

| Date | Story | Event | Agent | Result |
|------|-------|-------|-------|--------|
| 2026-04-20 | 2.1 | Created | @sm (River) | Story drafted with all requirements |
| 2026-04-20 | 2.1 | Validated | @po (Pax) | 10/10 PASS — Draft → Ready |
| 2026-04-20 | 2.1 | Implemented | @dev (Dex) | 12/12 tests ✓, typecheck ✓ — Ready → InReview |
| 2026-04-20 | 2.1 | QA Gate | @qa (Quinn) | 9.5/10 PASS — InReview → Done |
| 2026-04-20 | 2.1 |补充 | @dev (Dex) | Adicionados CampaignAudienceSchema, ProductPositioningSchema (discovered in 2.2 implementation) |
| 2026-04-20 | 2.2 | Created | @sm (River) | Story drafted — Discovery: 2 Campaign duplicados, 5 importadores, ContentType já existe |
| 2026-04-20 | 2.2 | Validated | @po (Pax) | 10/10 PASS — Draft → Ready |
| 2026-04-20 | 2.2 | Implemented | @dev (Dex) | typecheck ✓, ContentType rejects "info" ✓, DoD 9/9 ✓ — Ready → InReview |
| 2026-04-20 | 2.2 | QA Gate | @qa (Quinn) | CONCERNS (accepted) — 1 .tsx minimal fix approved, framework tests ignored — InReview → Done |
| 2026-04-20 | 2.3 | Created | @sm (River) | Story drafted — Discovery: 2 endpoints, gap em strategy route |
| 2026-04-20 | 2.3 | Validated | @po (Pax) | 10/10 PASS — Draft → Ready |
| 2026-04-20 | 2.3 | Implemented | @dev (Dex) | 13/13 tests ✓, typecheck ✓, DoD 10/10 ✓ — Ready → InReview |
| 2026-04-20 | 2.3 | QA Gate | @qa (Quinn) | CONCERNS (accepted) — Framework tests ignored (same as 2.2) — InReview → Done |

---

*Last Updated: 2026-04-20 21:00 UTC — Stories 2.1-2.3 DONE, Story 2.4 READY — By @aiox-master (Orion)*
