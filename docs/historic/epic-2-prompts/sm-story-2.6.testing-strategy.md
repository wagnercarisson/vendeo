# Testing Strategy — Story 2.6 (@sm Drafting)

## Test Coverage Requirements

Esta strategy valida que: discovery table está completa, schemas re-usam Story 2.1, AC cobrem validação request/response, manual tests incluídos no DoD, Epic 2 completion documented.

---

## Test Suite 1: Discovery Execution

**Objetivo:** Validar que discovery foi executado corretamente e tabela de 3 endpoints está completa.

| Test Case | Expected Output | Validates |
|-----------|----------------|-----------|
| **T1.1 — Discovery Step 1 executado** | Dev Notes contém findings de `/strategy/route.ts`: `await req.json()` sem validação, `JSON.parse()` sem schema | Discovery read do endpoint atual |
| **T1.2 — Discovery Step 2 executado** | Dev Notes contém patterns de `/campaign/route.ts`: `CampaignRequestSchema.safeParse()`, error 400/500 | Discovery do reference endpoint |
| **T1.3 — Discovery Step 3 executado** | Dev Notes lista schemas disponíveis: CampaignAudienceSchema, CampaignObjectiveSchema, ProductPositioningSchema, ContentTypeSchema | Discovery dos schemas reutilizáveis |
| **T1.4 — Tabela 3 endpoints criada** | Story contém tabela comparando `/campaign` (✅ COMPLETO), `/reels` (✅ COMPLETO), `/strategy` (🔴 TARGET) | Documenta escopo da story |

---

## Test Suite 2: Cross-Story Decisions

**Objetivo:** Validar que Story 2.6 referencia decisões de Stories 2.1-2.5.

| Test Case | Story Referenced | Expected Decision | Validates |
|-----------|------------------|-------------------|-----------|
| **T2.1 — Referência Story 2.1** | 2.1 (Schemas) | CampaignStrategyResponseSchema re-usa CampaignAudienceSchema, CampaignObjectiveSchema, ProductPositioningSchema | Re-uso de schemas (não reinventa) |
| **T2.2 — Referência Story 2.2** | 2.2 (Types) | CampaignStrategyRequestSchema usa ContentTypeSchema | Re-uso de types |
| **T2.3 — Referência Story 2.3** | 2.3 (Contracts) | Seguir pattern XRequestSchema e XResponseSchema | Consistency com Stories anteriores |
| **T2.4 — Referência Story 2.4** | 2.4 (Mappers) | Error responses: 400 INVALID_INPUT, 500 AI_INVALID_OUTPUT | Mesmos códigos de erro |

**Success Criteria:** ≥3 referências explícitas a Stories 2.1-2.5.

---

## Test Suite 3: Acceptance Criteria Coverage

**Objetivo:** Validar que AC cobrem todos os aspectos da integração.

| Test Case | AC Required | Validates |
|-----------|-------------|-----------|
| **T3.1 — AC para schemas** | AC descreve criação de CampaignStrategyRequestSchema e CampaignStrategyResponseSchema | Contratos de API |
| **T3.2 — AC para request validation** | AC descreve validação de request com safeParse() + return 400 | Input validation |
| **T3.3 — AC para AI validation** | AC descreve validação de AI response com safeParse() + return 500 | Output validation |
| **T3.4 — AC para consistency** | AC descreve seguir mesmo padrão de /campaign (error responses, requestId) | Consistency entre endpoints |
| **T3.5 — AC para Epic completion** | AC descreve atualização de EXEC-PLAN-EPIC-2.md para 100% complete | Epic 2 closure |

**Success Criteria:** 5 cenários Gherkin (mínimo 4, máximo 6).

---

## Test Suite 4: Risk Assessment

**Objetivo:** Validar que riscos HIGH e mitigations estão documentados.

| Test Case | Risk | Expected Severity | Mitigation Required |
|-----------|------|------------------|---------------------|
| **T4.1 — Endpoint quebrar em produção** | Endpoint /strategy quebrar em produção | 🔴 HIGH | Manual tests obrigatórios, validar com payloads reais |
| **T4.2 — IA retornar valores inválidos** | IA retornar valores fora do schema | 🟡 MEDIUM | safeParse() bloqueia, error logging, response_format json |
| **T4.3 — Tipos não matcharem** | Tipos Zod não matcharem constantes existentes | 🟡 MEDIUM | Validar contra AUDIENCE_OPTIONS, testes unitários |
| **T4.4 — Regressão em outros endpoints** | Regressão em /campaign ou /reels | 🟢 LOW | Story 2.6 não toca outros endpoints (OUT OF SCOPE) |

**Success Criteria:** 3-4 riscos documentados com severidade + mitigations.

---

## Test Suite 5: Definition of Done Completeness

**Objetivo:** Validar que DoD inclui todos os checkpoints necessários para HIGH RISK story.

| Test Case | DoD Item Required | Validates |
|-----------|-------------------|-----------|
| **T5.1 — Schema creation** | CampaignStrategyRequestSchema e ResponseSchema criados | Contratos API |
| **T5.2 — Request validation** | Endpoint /strategy valida request com safeParse | Input validation |
| **T5.3 — AI validation** | Endpoint /strategy valida AI response com safeParse | Output validation |
| **T5.4 — Error responses** | Error responses seguem padrão (400 INVALID_INPUT, 500 AI_INVALID_OUTPUT) | Consistency |
| **T5.5 — Typecheck** | TypeScript typecheck passa (npx tsc --noEmit) | Compilação |
| **T5.6 — Manual test: válido** | **Manual test:** POST /strategy com payload válido → 200 | Happy path |
| **T5.7 — Manual test: inválido** | **Manual test:** POST /strategy com payload inválido → 400 | Error handling |
| **T5.8 — Manual test: IA inválida** | **Manual test:** Verificar logs de IA retornando dados inválidos | Safety net |
| **T5.9 — Epic completion** | EXEC-PLAN-EPIC-2.md atualizado: Epic 2 100% complete | Closure |
| **T5.10 — Commit message** | Commit: `feat: add validation to campaign strategy endpoint [Story 2.6]` | Git history |

**Success Criteria:** 12-15 items, incluindo 3+ manual tests.

---

## Test Suite 6: Dev Notes Code Examples

**Objetivo:** Validar que Dev Notes contém 3 code patterns completos (copy-paste ready).

| Test Case | Code Pattern | Expected Content | Validates |
|-----------|--------------|------------------|-----------|
| **T6.1 — Request validation pattern** | Pattern 1: Request Validation | Código completo com `CampaignStrategyRequestSchema.safeParse()`, error 400, body.data tipado | Implementação de validação de input |
| **T6.2 — AI response validation pattern** | Pattern 2: AI Response Validation | Código completo com `CampaignStrategyResponseSchema.safeParse()`, error 500, validated.data tipado | Implementação de validação de output |
| **T6.3 — Schema re-use pattern** | Pattern 3: Schema Re-use | Código completo em contracts.ts com imports de schemas.ts e types.ts, z.infer types | Re-uso de schemas de Story 2.1 |

**Success Criteria:** 3 code examples completos com imports e error handling.

---

## Test Suite 7: File List Completeness

**Objetivo:** Validar que File List inclui todos os arquivos afetados com actions claras.

| Test Case | File | Expected Action | Validates |
|-----------|------|-----------------|-----------|
| **T7.1 — contracts.ts** | `lib/domain/campaigns/contracts.ts` | **UPDATE** — Add CampaignStrategyRequestSchema + ResponseSchema | Novos contratos |
| **T7.2 — route.ts** | `app/api/generate/campaign/strategy/route.ts` | **UPDATE** — Add request + AI response validation | Endpoint validation |
| **T7.3 — contracts.test.ts (opcional)** | `lib/domain/campaigns/contracts.test.ts` | **CREATE** (opcional) — Unit tests para schemas | Test coverage |
| **T7.4 — EXEC-PLAN** | `docs/EXEC-PLAN-EPIC-2.md` | **UPDATE** — Epic 2 100% complete | Epic closure |

**Success Criteria:** 3-4 arquivos com actions (UPDATE/CREATE).

---

## Validation Commands (for @po)

```bash
# Verificar Discovery executado
grep -A 10 "Discovery Step" docs/stories/2.6.story.md

# Verificar Cross-Story Decisions
grep -A 10 "Cross-Story" docs/stories/2.6.story.md

# Verificar AC em Gherkin
grep -c "DADO que\|QUANDO\|ENTÃO" docs/stories/2.6.story.md  # Esperado: 15-20 matches (5 AC × 3-4 lines)

# Verificar Risks documentados
grep -E "🔴|🟡|🟢" docs/stories/2.6.story.md

# Verificar Manual Tests no DoD
grep -i "manual test" docs/stories/2.6.story.md  # Esperado: 3+ matches

# Verificar Dev Notes com 3 patterns
grep -c "Pattern [1-3]:" docs/stories/2.6.story.md  # Esperado: 3 matches
```

---

## Success Criteria

- ✅ Discovery executado (4 steps, tabela 3 endpoints criada)
- ✅ Cross-Story Decisions (≥3 referências a Stories 2.1-2.5)
- ✅ AC em Gherkin (5 cenários cobrindo schemas, request, AI, consistency, Epic)
- ✅ Risks listados (3-4 riscos com severidade + mitigations)
- ✅ DoD completo (12-15 items, incluindo 3+ manual tests)
- ✅ Dev Notes com 3 code examples (request, AI, schema re-use)
- ✅ File List com 3-4 arquivos (contracts, route, tests opcional, EXEC-PLAN)

---

## Risk Mitigation (Testing Edition)

| Risk (from prompt) | Test Coverage |
|-------------------|---------------|
| 🔴 HIGH: Endpoint quebrar em produção | T5.6-T5.8 — 3 manual tests obrigatórios no DoD |
| 🟡 MEDIUM: IA retornar valores inválidos | T3.3 — AC descreve safeParse() + error 500 |
| 🟡 MEDIUM: Tipos não matcharem constantes | T2.1 — Cross-Story verifica re-uso de schemas de 2.1 |
| 🟢 LOW: Regressão em outros endpoints | T3.4 — AC descreve zero breaking changes (OUT OF SCOPE) |

---

**END OF TESTING STRATEGY**
