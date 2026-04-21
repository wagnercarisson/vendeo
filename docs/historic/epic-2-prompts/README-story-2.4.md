# Story 2.4 — @sm Prompt Engineering Package

**Story:** 2.4 — Mappers Seguros  
**Epic:** Epic 2 — Arquitetura de Campanhas  
**Created:** 2026-04-20  
**Status:** Ready for @sm Execution  
**Risk Level:** 🔴 HIGH RISK (production code, high volume)

---

## 📦 Package Contents

### 1. @sm Prompt (Story Drafting)
**File:** `sm-story-2.4.prompt.md`  
**Purpose:** Criar Story File com discovery de mappers existentes, risk assessment HIGH RISK, AC com `.safeParse()` error handling, testes com dados reais  
**Target Agent:** @sm (River) — Scrum Master  
**Model:** Claude Sonnet 4.6 (1x)  
**Token Count:** ~1390 (+39% vs Story 2.3 — discovery + risk assessment)  
**Status:** ✅ Ready for execution

**Key Features:**
- **Mandatory Discovery:** grep + read mapper.ts ANTES de draftar (Passo 1 do CoT)
- **High Risk Assessment:** 4+ riscos com HIGH/MEDIUM tags e mitigações concretas
- **Error Handling Pattern:** Código de exemplo completo com .safeParse() + try/catch
- **Zero Breaking Changes:** Explicitado em 3 seções (Scope OUT, DoD, Risks)
- **Cross-Story Decisions:** Tabela com ≥4 decisões de Stories 2.1, 2.2, 2.3
- **Write Mapper Creation:** mapDomainToCampaignDb() (domain → DB)
- **Test Strategy:** Dados reais do banco (não sintéticos)

**Testing:** `sm-story-2.4.testing-strategy.md` (8 validation tests)  
**Analysis:** `sm-story-2.4.analysis.md` (7 design decisions, token economy, LOW/MEDIUM vs HIGH RISK comparison)

---

### 2. @dev Prompt (Story Implementation)
**File:** `dev-story-2.4.prompt.md`  
**Purpose:** Refatorar mapper.ts (`.parse()` → `.safeParse()`) + criar mapDomainToCampaignDb() + testes com dados reais  
**Target Agent:** @dev (Dex) — Developer  
**Model:** Claude Sonnet 4.6 (1x)  
**Token Count:** ~3200 (+68% vs Story 2.3 @dev — 6 etapas + BEFORE/AFTER code + fixtures)  
**Status:** ✅ Ready for execution (após @po validation 10/10)

**Key Features:**
- **Progressive Refactoring:** 6 etapas (1 função por vez) com checkpoints — reduz risco
- **Error Strategy Differentiation:** THROW (server-side) vs FALLBACK (client-side UI) — explicit examples
- **BEFORE/AFTER Code:** Cada função mostra estado atual + refatorado (completo, não snippet)
- **Interactive Mode:** Educational checkpoints (não YOLO) — HIGH RISK refactoring
- **REAL_DB_ROW Fixture:** Dados reais Supabase (30+ campos) — não mocks sintéticos
- **Output Validation:** mapDomainToCampaignDb() valida output antes de retornar
- **Zero Breaking Changes:** Assinaturas idênticas — callers não quebram

**Workflow:**
1. **Etapa 1:** Refatorar `mapDbCampaignToDomain()` (THROW strategy) + Checkpoint 1
2. **Etapa 2:** Refatorar `mapDbCampaignToAIContext()` (THROW strategy) + Checkpoint 2
3. **Etapa 3:** Refatorar `mapAiArtToPreview()` e `mapAiReelsToPreview()` (FALLBACK strategy) + Checkpoint 3
4. **Etapa 4:** Atualizar `mapAiCampaignToDomain()` (validação + fallbacks) + Checkpoint 4
5. **Etapa 5:** Criar `mapDomainToCampaignDb()` (write mapper) + Checkpoint 5
6. **Etapa 6:** Criar `mapper.test.ts` com REAL_DB_ROW + Checkpoint 6 FINAL

**Testing:** `dev-story-2.4.testing-strategy.md` (6 test suites, 15+ tests)  
**Analysis:** `dev-story-2.4.analysis.md` (7 design decisions, token economy +103% vs Story 2.3, risk coverage)

---

## 🎯 Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. @sm Prompt (Story Drafting)                             │
│    Input: Requirements, mapper.ts discovery                 │
│    Discovery: grep export function + read mapper.ts         │
│    Output: docs/stories/2.4.story.md                        │
│    Validation: 8 tests (discovery, risk, error, write map) │
│    Status: ✅ COMPLETE (Story 2.4 validated 10/10)         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. @po Validation (10-point checklist)                     │
│    Target: GO (≥8/10) — Higher bar for HIGH RISK           │
│    Focus: Discovery executed? Risk assessment complete?     │
│    Status: ✅ COMPLETE (10/10 perfect score)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. @dev Prompt (Implementation) ← YOU ARE HERE             │
│    Input: docs/stories/2.4.story.md + @po guidance         │
│    Workflow: 6 etapas (1 função + checkpoint each)         │
│    Output: mapper.ts (refactored) + mapper.test.ts         │
│    Status: 🟡 READY FOR EXECUTION                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. @qa QA Gate (7-point checklist)                         │
│    Story Lifecycle: Ready → InProgress → InReview → Done   │
│    Status: 🟡 PENDING (awaits @dev completion)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Metrics Summary

### @sm Prompt Metrics (COMPLETE)
| Metric | Target | Status |
|--------|--------|--------|
| Token count | ~1400 | ~1390 ✅ |
| Discovery execution | 100% | ✅ Complete |
| Functions discovered | 6-7 | ✅ 6 functions |
| Cross-Story Decisions | ≥4 entries | ✅ 5 entries |
| Risk assessment | ≥4 risks (2 HIGH, 2 MEDIUM) | ✅ 5 risks (2 HIGH) |
| Error code example | 1 complete pattern | ✅ Complete |
| Zero breaking changes | ≥3 mentions | ✅ 3 sections |
| Write mapper planned | mapDomainToCampaignDb | ✅ Complete |

### @dev Prompt Metrics (READY FOR EXECUTION)
| Metric | Target | Status |
|--------|--------|--------|
| Token count | ~3200 | ~3200 ✅ |
| Etapas (progressive refactoring) | 6 | ✅ 6 etapas + 6 checkpoints |
| BEFORE/AFTER code examples | 5 functions | ✅ Complete |
| Error strategy differentiation | THROW vs FALLBACK | ✅ Explicit table |
| REAL_DB_ROW fixture | 30+ campos | ✅ Complete (Supabase structure) |
| Test suites | 6 | ✅ 15+ tests (testing-strategy.md) |
| Output validation | mapDomainToCampaignDb | ✅ DbCampaignSchema.partial() |
| Zero breaking changes | Assinaturas inalteradas | ✅ Enforced |

### Package Totals
| Package | @sm | @dev | TOTAL |
|---------|-----|------|-------|
| Main Prompt | ~1390 | ~3200 | ~4590 |
| Testing Strategy | ~980 | ~980 | ~1960 |
| Analysis | ~700 | ~700 | ~1400 |
| **TOTAL** | **~3070** | **~4880** | **~7950** |

**Token Increase vs Story 2.3:**
- @sm package: +39% (discovery + risk assessment for HIGH RISK)
- @dev package: +103% (progressive refactoring + BEFORE/AFTER code + fixtures)
- Total package: +67% (complexity justified by HIGH RISK production refactoring)

---

## 🔍 Quality Gates

### Gate 1: @sm Story Drafting
- ✅ **COMPLETE** — Story 2.4 created, validated 10/10 by @po
- Success criteria: 8/8 tests pass (discovery, risk, error, write mapper) ✅
- @po score: 10/10 (perfect score, HIGH RISK bar met)

### Gate 2: @po Story Validation
- ✅ **COMPLETE** — Perfect 10/10 score with critical @po guidance
- Focus areas validated:
  - ✅ Discovery executed (Dev Notes lista 6 funções)
  - ✅ Risk assessment HIGH RISK complete (5 riscos, 2 HIGH)
  - ✅ Error handling pattern presente (código de exemplo)
  - ✅ Zero breaking changes explícito (Scope OUT + DoD)
- **Critical @po Guidance Provided:**
  - Error Handling Strategy Table (THROW vs FALLBACK by function)
  - Risk Alerts (legacy "info" support, output validation)
  - Implementation Mode (Interactive with educational checkpoints)
  - Validation Sequence (one function at a time)

### Gate 3: @dev Implementation (CURRENT STEP)
- 🟡 **READY FOR EXECUTION** — Execute `dev-story-2.4.prompt.md`
- Success criteria: 6/6 checkpoints pass (typecheck after each etapa)
- Expected outcome: mapper.ts (refactored) + mapper.test.ts (15+ tests passing)
- Commit message: `refactor: add safe error handling to campaign mappers with .safeParse() [Story 2.4]`

### Gate 4: @qa QA Gate
- 🟡 **PENDING** — Awaits @dev completion
- Focus areas:
  - Zero breaking changes (assinaturas inalteradas)
  - Error messages úteis (não genéricas)
  - Testes cobrem happy path + error cases + fallbacks
  - THROW strategy em server-side, FALLBACK em UI functions

### Gate 3: @dev Implementation
- ⚪ **NOT CREATED** — @dev prompt not yet delivered
- Expected complexity: 3-4h (HIGH RISK refactoring)

### Gate 4: @qa QA Gate
- 🟡 **PENDING** — Awaits @dev completion
- Critical checks: Campanhas existentes funcionam? Testes com dados reais passam?

---

## 📁 File Organization

```
docs/stories/prompts/
├── sm-story-2.4.prompt.md              # @sm executable prompt ✅ READY
├── sm-story-2.4.testing-strategy.md    # @sm validation tests (8)
├── sm-story-2.4.analysis.md            # @sm design decisions & comparison
└── README-story-2.4.md                 # This file (index)

docs/stories/
└── 2.4.story.md                         # Story File (output — pending)

lib/domain/campaigns/
├── mapper.ts                            # To be refactored (discovery target)
└── mapper.test.ts                       # To be created
```

---

## 🚀 How to Use

### For @sm (Story Drafting) — ⚡ EXECUTE NOW
```bash
# Step 1: Send prompt to @sm
@sm < docs/stories/prompts/sm-story-2.4.prompt.md

# Step 2: Monitor discovery (CRITICAL)
# Watch for grep_search → "export function" in mapper.ts
# Watch for read_file → mapper.ts (complete read)
# Expected: 6-7 functions discovered

# Step 3: Verify CoT execution
# Passo 1: Discovery (funções listadas em Dev Notes)
# Passo 2: Cross-Story Decisions (≥4 entries)
# Passo 3: AC Testability (.safeParse() pattern)
# Passo 4: Risk Assessment (≥4 riscos HIGH/MEDIUM)
# Passo 5: DoD (≥10 checkboxes)
# Passo 6: File List (≥6 arquivos)

# Step 4: Validate with testing-strategy.md (8 tests)
# - Test 1: Mapper Discovery Enforcement
# - Test 2: Cross-Story Decisions Traceability
# - Test 3: AC Testability (.safeParse())
# - Test 4: High Risk Assessment
# - Test 5: Error Handling Example Presence
# - Test 6: Zero Breaking Changes Enforcement
# - Test 7: Test Strategy Planning (dados reais)
# - Test 8: Write Mapper Creation (mapDomainToCampaignDb)

# Step 5: Review output
# Story saved at: docs/stories/2.4.story.md

# Step 6: Await @po validation
# Target: ≥8/10 score (higher bar for HIGH RISK)
```

---

## 🧪 Testing Checklist

### @sm Prompt Validation (🟡 PENDING EXECUTION)
- [ ] Test 1: Mapper Discovery Enforcement (grep + read executed)
- [ ] Test 2: Cross-Story Decisions Traceability (≥4 entries from 2.1, 2.2, 2.3)
- [ ] Test 3: AC Testability (.safeParse() pattern in ≥5 AC)
- [ ] Test 4: High Risk Assessment (≥2 HIGH, ≥2 MEDIUM with mitigations)
- [ ] Test 5: Error Handling Example Presence (complete code in Dev Notes)
- [ ] Test 6: Zero Breaking Changes Enforcement (≥3 mentions)
- [ ] Test 7: Test Strategy Planning (dados reais, não sintéticos)
- [ ] Test 8: Write Mapper Creation (mapDomainToCampaignDb in ≥4 sections)

---

## 🎓 Key Learnings (Design Highlights)

### 1. First HIGH RISK Story in Epic 2

**What:** Story 2.4 é o primeiro refactoring de código em produção no epic.

**Why:** Mappers usados em volume alto (listagens) — falha impacta todos os usuários.

**Impact:** Prompt precisa de +39% tokens para discovery + risk assessment vs Stories LOW RISK.

**Pattern:**
- Discovery OBRIGATÓRIO (grep + read)
- Risk assessment com HIGH/MEDIUM tags
- Error handling code example
- Zero breaking changes em 3 seções

---

### 2. Refactoring vs Creation (Different Pattern)

**Refactoring (Story 2.4):**
- Discovery de código existente
- Preservar assinaturas (zero breaking changes)
- Testes com dados reais (casos existentes)
- Error handling pattern (não implementation)

**Creation (Stories 2.1-2.3):**
- Criar arquivo novo
- Definir assinaturas
- Testes sintéticos OK
- Complete code examples

**Token Difference:** Refactoring +16-39% para discovery, Creation +50-70% para complete code.

---

### 3. Error Pattern vs Error Implementation

**Story 2.4 (Pattern):**
- Código de exemplo: 15 lines
- Mostra COMO fazer (.safeParse() → check → error)
- @dev aplica pattern em 4-5 funções

**Story 2.3 @dev (Implementation):**
- Código completo: 260 lines
- Mostra O QUE fazer (contracts.ts completo)
- @dev copia código pronto

**Use Pattern when:** Refactoring múltiplas funções com mesmo pattern.  
**Use Implementation when:** Criar arquivo novo com sintaxe complexa (discriminated unions).

---

### 4. Test Strategy Evolution (Synthetic → Real Data)

**Stories 2.1-2.3 (Synthetic OK):**
- Schemas novos → dados inventados OK
- Contracts novos → payloads genéricos OK

**Story 2.4 (Real Data REQUIRED):**
- Mappers em produção → dados reais essenciais
- Campos opcionais ausentes → casos reais do banco
- Enums legacy → valores históricos

**AC Wording:**
- LOW RISK: "Testes cobrem happy path e error cases"
- HIGH RISK: "Testes cobrem: happy path, dados inválidos, campos opcionais ausentes (dados reais do banco)"

---

## 📊 Story 2.3 vs Story 2.4 Comparison

| Aspect | Story 2.3 (Contracts) | Story 2.4 (Mappers) | Difference |
|--------|----------------------|---------------------|------------|
| **Risk Level** | LOW | HIGH | Critical |
| **Code Action** | Create new file | Refactor existing | Different pattern |
| **@sm Prompt Tokens** | 1000 | 1390 | +39% |
| **Discovery** | API routes (grep) | Mapper functions (grep + read) | +100% depth |
| **Risk Assessment** | 2-3 generic risks | 4+ with HIGH/MEDIUM tags | Structured |
| **Error Example** | None (AC only) | Complete code (15 lines) | Pattern template |
| **Breaking Changes** | Not critical | ZERO tolerance | Explicit in 3 sections |
| **Test Data** | Synthetic OK | Real data REQUIRED | Quality bar |
| **@po Target Score** | ≥7/10 | ≥8/10 | Higher bar |
| **@dev Effort** | 1-2h | 3-4h | +100-200% |

**Key Insight:** HIGH RISK refactoring stories precisam de prompts mais longos (+39% tokens) mas ainda menores que implementation stories com complete code (Story 2.3 @dev = 1200 tokens).

---

## 🔄 Troubleshooting & FAQ

### Q: @sm pulou discovery — Dev Notes está genérico
**A:** Discovery é BLOCKING requirement (Test 1). Se pulado:
1. Execute manualmente: `grep -n "export function" lib/domain/campaigns/mapper.ts`
2. Read mapper.ts completo
3. Listar funções descobertas em Dev Notes
4. Identificar problemas: ".parse() que throw", "sem try/catch"

### Q: Risk assessment tem riscos genéricos (sem HIGH/MEDIUM tags)
**A:** Reescrever tabela Risks & Mitigations:
- Identificar ≥2 riscos 🔴 ALTO (ex: quebrar campanhas existentes, corromper dados DB)
- Identificar ≥2 riscos 🟡 MÉDIO (ex: mudar error behavior, testes sintéticos)
- Cada risco precisa de mitigação CONCRETA (não "testar bem")

### Q: AC não especificam .safeParse() pattern
**A:** Reescrever AC com testability:
```gherkin
WHEN mapDbCampaignToDomain() for refatorado
THEN função usa DbCampaignSchema.safeParse() com try/catch
AND se validação falhar, retorna erro útil: "Campo X inválido"
```

### Q: @po deu score <8 — quais itens falharam?
**A:** Verificar checklist de 10 pontos:
1. Discovery executado? (Dev Notes lista funções)
2. Risk assessment HIGH RISK? (≥4 riscos com tags)
3. AC testáveis? (.safeParse() pattern)
4. Zero breaking changes? (3 seções)
5. Error example? (código completo em Dev Notes)
6. Write mapper? (mapDomainToCampaignDb planejado)
7. Test strategy? (dados reais mencionados)
8. DoD completo? (≥10 checkboxes)
9. File List? (≥6 arquivos)
10. CodeRabbit config? (path_instructions)

---

## 🎯 Next Steps After Story 2.4

Once @sm completes story drafting and @po approves:

1. **@dev Prompt Creation** (Decision Point) — aguardar aprovação @po antes de criar
2. **Story 2.5 — Selectors & Logic** (próxima story do Epic 2)
3. **Story 2.6 — API Integration** (blocked by 2.4 — usa mappers validados)

**Template Reuse:** `sm-story-2.4.prompt.md` pattern (discovery + risk + error example) pode ser salvo como template para futuras HIGH RISK refactoring stories.

---

## 🚨 Critical Reminders

### Before Execution:
- ✅ Leia requirements completos (fornecidos pelo usuário)
- ✅ Confirme que mapper.ts existe e está em produção
- ✅ Entenda que Story 2.4 é HIGH RISK (primeiro refactoring do epic)

### During Execution:
- ✅ Monitor discovery (grep + read DEVE acontecer)
- ✅ Verifique que CoT está sendo seguido (6 passos)
- ✅ Confirme que código de exemplo foi incluído em Dev Notes

### After Execution:
- ✅ Valide com 8 tests (testing-strategy.md)
- ✅ Aguarde @po score ≥8/10 (não prosseguir se <8)
- ✅ NÃO criar @dev prompt até @po aprovar

---

**END OF README**
