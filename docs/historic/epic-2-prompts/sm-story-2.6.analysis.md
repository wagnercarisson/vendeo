# Analysis — Story 2.6 (@sm Package)

## Prompt Design Decisions

### 1. Discovery Table Required (4 steps → tabela 3 endpoints)

**Why:**
- Story 2.6 could easily scope creep (refatorar /campaign, /reels)
- Tabela documenta EXPLICITAMENTE: 2/3 endpoints já completos, apenas /strategy precisa de work
- Discovery steps forçam @sm a ler código atual antes de escrever AC

**Discovery workflow:**
```
Step 1: Read /strategy/route.ts → sem validação
Step 2: Read /campaign/route.ts → COM validação (reference pattern)
Step 3: Grep schemas disponíveis → list re-usable schemas
Step 4: Create tabela → 3 endpoints comparison
```

**Alternative considered:** Assumir que @sm conhece estado dos endpoints  
**Rejected because:** HIGH RISK story — discovery obrigatório para prevenir scope errors

### 2. HIGH RISK Emphasis (🔴 production endpoint)

**Why:**
- `/campaign/strategy` é usado em production dashboard
- Validação pode quebrar users existentes se types mismatch
- Manual tests OBRIGATÓRIOS (automated tests alone insufficient)

**Mitigation strategies integrated:**
- DoD DEVE incluir 3+ manual tests (POST válido, inválido, IA inválida)
- Risk section documenta 4 risks (1 HIGH, 2 MEDIUM, 1 LOW)
- OUT OF SCOPE explícito (não refatorar outros endpoints)

**Alternative considered:** Automated tests only  
**Rejected because:** HIGH RISK requires human validation before production deploy

### 3. Code Pattern Examples (3 patterns from Story 2.4)

**Why:**
- @sm precisa mostrar para @dev EXATAMENTE como implementar
- Consistency com /campaign endpoint (Story 2.4 reference)
- Copy-paste ready code reduces implementation errors

**3 patterns required:**
1. Request validation (from /campaign) — safeParse() + error 400
2. AI response validation — safeParse() + error 500
3. Schema re-use (contracts.ts) — import schemas de 2.1, z.infer types

**Alternative considered:** Apenas descrever em texto  
**Rejected because:** Code examples garantem consistency entre endpoints

### 4. Epic 2 Completion (DoD inclui EXEC-PLAN update)

**Why:**
- Story 2.6 é FINAL story do Epic 2
- DoD DEVE incluir atualização de EXEC-PLAN-EPIC-2.md para 100% complete
- Documenta que arquitetura está ativa em 3 endpoints

**Completion checklist:**
- [ ] EXEC-PLAN atualizado: Epic 2 100% complete (6/6 stories)
- [ ] Seção "Epic 2 Completion Summary" com link para commit
- [ ] Documentar arquitetura ativa em /campaign, /reels, /strategy

**Alternative considered:** Story 2.6 apenas como story normal (sem Epic closure)  
**Rejected because:** Epic completion deve ser explícito no DoD

### 5. Scope Boundary (OUT OF SCOPE explícito)

**Why:**
- HIGH RISK de scope creep (refatorar /campaign, /reels)
- OUT OF SCOPE section MUST be explicit
- Story 2.6 apenas adiciona validação em /strategy

**OUT OF SCOPE checklist:**
```
❌ Refatorar /campaign ou /reels (já estão completos)
❌ Modificar generateCampaignContent() service
❌ Adicionar retry logic ou caching
❌ Criar novos endpoints
❌ Modificar schemas de Stories 2.1-2.5
```

**Alternative considered:** Apenas IN SCOPE (sem OUT OF SCOPE)  
**Rejected because:** HIGH RISK story requires explicit boundaries

### 6. Manual Test Requirements (3+ tests obrigatórios)

**Why:**
- Automated tests alone insufficient para HIGH RISK
- DoD DEVE incluir 3 manual tests
- Tests validam happy path + error handling + safety net

**3 manual tests required:**
1. POST /strategy com payload válido → 200 (happy path)
2. POST /strategy com payload inválido → 400 com details (error handling)
3. Verificar logs de IA retornando dados inválidos → 500 (safety net)

**Alternative considered:** Apenas testes automatizados  
**Rejected because:** Production endpoint requires human validation

### 7. Chain-of-Thought (6 passos com ênfase em Discovery)

**Why:**
- Passo 1 (Discovery) é MANDATORY — executar ANTES de AC
- Workflow força ordem lógica: Discovery → Cross-Story → AC → Risks → DoD → Dev Notes

**6 passos:**
1. Discovery (4 steps → tabela 3 endpoints)
2. Cross-Story Decisions (≥3 referências a 2.1-2.5)
3. Acceptance Criteria (5 Gherkin scenarios)
4. Risks & Mitigations (3-4 risks com severidade)
5. Definition of Done (12-15 items + 3+ manual tests)
6. Dev Notes (3 code examples)

**Alternative considered:** Workflow sem ordem específica  
**Rejected because:** Discovery MUST happen before AC (prevent incorrect assumptions)

---

## Token Economy

| Component | Tokens | Justification |
|-----------|--------|---------------|
| **Main Prompt** | ~2400 | Discovery (4 steps), AC (5 Gherkin), Dev Notes (3 code examples), Risks (4 risks), Epic completion |
| **Testing Strategy** | ~800 | 7 test suites (Discovery, Cross-Story, AC, Risks, DoD, Dev Notes, File List) |
| **Analysis** (este arquivo) | ~600 | 7 design decisions + token economy + risk coverage |
| **TOTAL @sm Package** | ~3800 | HIGH RISK integration story |

**Comparison:**
- Story 2.2 @sm package: ~2800 tokens (MEDIUM RISK creation)
- Story 2.3 @sm package: ~2700 tokens (MEDIUM RISK creation)
- Story 2.4 @sm package: ~3900 tokens (HIGH RISK refactoring)
- Story 2.5 @sm package: ~2850 tokens (MEDIUM RISK consolidation)
- Story 2.6 @sm package: **~3800 tokens** (HIGH RISK integration, -3% vs 2.4)

**Why ~3800 tokens (similar to Story 2.4)?**
- HIGH RISK story (production endpoint)
- Discovery obrigatório (4 steps + tabela)
- 3+ manual tests requirement
- Epic 2 completion (EXEC-PLAN update)
- OUT OF SCOPE explícito (prevent scope creep)
- 3 code pattern examples (request, AI, schema re-use)

**Efficiency vs Story 2.4:**
- -3% token count (~100 tokens less)
- Similar complexity (integration vs refactoring)
- Different focus (endpoint validation vs mapper safety)

---

## Cross-Story Dependencies

| Story | Dependency Type | Impact on 2.6 |
|-------|----------------|---------------|
| 2.1 (Schemas) | Schema dependency | Story 2.6 re-usa CampaignAudienceSchema, CampaignObjectiveSchema, ProductPositioningSchema |
| 2.2 (Types) | Type dependency | Story 2.6 re-usa ContentTypeSchema |
| 2.3 (Contracts) | Pattern dependency | Story 2.6 segue pattern XRequestSchema e XResponseSchema |
| 2.4 (Mappers) | Error pattern dependency | Story 2.6 usa mesmos error codes (400 INVALID_INPUT, 500 AI_INVALID_OUTPUT) |
| 2.5 (Selectors) | Validation assumption | Story 2.6 garante que selectors recebam dados validados |

---

## Risk Coverage

| Risk (from prompt) | Mitigation in @sm Prompt |
|-------------------|--------------------------|
| 🔴 HIGH: Endpoint quebrar em produção | DoD inclui 3+ manual tests obrigatórios (POST válido, inválido, IA inválida) |
| 🟡 MEDIUM: IA retornar valores inválidos | AC descreve safeParse() + error 500, Dev Notes com code example |
| 🟡 MEDIUM: Tipos não matcharem constantes | Cross-Story table documenta re-uso de schemas de 2.1 (não reinventa) |
| 🟢 LOW: Regressão em outros endpoints | OUT OF SCOPE explícito (Story 2.6 NÃO TOCA /campaign ou /reels) |

---

## Model Recommendation

**Claude Sonnet 4.6 (1x):**
- HIGH RISK integration story
- Complex decision-making: Discovery → Cross-Story → AC → Risks → DoD
- Code pattern examples require precision
- Epic 2 completion requires comprehensive understanding

**GPT-4.5 mini (0.33x) NÃO recomendado:**
- Pode pular discovery steps (assume estado dos endpoints)
- Risco de omitir manual tests do DoD
- Risco de criar AC sem OUT OF SCOPE boundary

---

## Success Metrics

**Quality Gates:**
- ✅ Discovery executado (4 steps, tabela 3 endpoints criada)
- ✅ Cross-Story Decisions (≥3 referências a 2.1-2.5)
- ✅ AC em Gherkin (5 cenários: schemas, request, AI, consistency, Epic)
- ✅ Risks listados (3-4 risks com severidade + mitigations)
- ✅ DoD completo (12-15 items, incluindo 3+ manual tests)
- ✅ Dev Notes com 3 code examples (request, AI, schema re-use)
- ✅ File List com 3-4 arquivos (contracts, route, tests opcional, EXEC-PLAN)

**Timeline:**
- Estimated: 4-5h (HIGH RISK)
- Discovery: 30-45min (read 3 files, create tabela)
- AC: 45-60min (5 Gherkin scenarios)
- DoD: 30min (12-15 items + manual tests)
- Dev Notes: 30min (3 code examples)

**Next Steps:**
1. @sm executes `sm-story-2.6.prompt.md`
2. Creates `docs/stories/2.6.story.md`
3. Reports to @po for validation (target ≥7/10)
4. @po validates → @dev implements → @qa validates → @devops pushes

---

## Pattern Evolution (Stories 2.1 → 2.6)

| Story | Risk | Token Count | Key Feature |
|-------|------|-------------|-------------|
| 2.1 | LOW | ~2400 | Schema creation (foundation) |
| 2.2 | MEDIUM | ~2800 | Type consolidation |
| 2.3 | MEDIUM | ~2700 | API contracts |
| 2.4 | HIGH | ~3900 | Mapper refactoring (error handling) |
| 2.5 | MEDIUM | ~2850 | Selector consolidation (conflict resolution) |
| 2.6 | HIGH | **~3800** | **Integration (endpoint validation, Epic closure)** |

**Story 2.6 distinctive features:**
- Discovery table (3 endpoints comparison)
- OUT OF SCOPE explícito (prevent scope creep)
- 3+ manual tests obrigatórios (HIGH RISK)
- Epic 2 completion (EXEC-PLAN update)
- Code pattern examples (request, AI, schema re-use)

---

## CodeRabbit Self-Healing Expectations (for @dev later)

**Auto-review will check:**
1. CampaignStrategyRequestSchema re-usa schemas de 2.1 (não reinventa)
2. Endpoint /strategy valida request com safeParse() (error 400)
3. Endpoint /strategy valida AI response com safeParse() (error 500)
4. Error responses seguem padrão de /campaign (consistency)
5. EXEC-PLAN-EPIC-2.md atualizado (Epic 2 100% complete)

**Max 2 iterations:**
- Iteration 1: @dev implementa seguindo story draft
- CodeRabbit review: Issues detectados automaticamente
- Iteration 2: @dev corrige issues (se necessário)
- Se iteration 3 necessária → escalate to @architect

---

**END OF ANALYSIS**
