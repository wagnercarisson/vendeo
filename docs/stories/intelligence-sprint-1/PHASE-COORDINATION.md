# Intelligence Sprint 1 - Coordenação de Fases (Opção A)

**Data:** 2026-04-30  
**Status:** READY TO START  
**Coordination Model:** Sequential (4 fases com gates)  
**Timeline Total:** 8-10 dias (1.5-2 semanas)

---

## 📋 Coordenação Sequencial - Overview

### Estrutura

```
FASE 1: Validação + Prompt Engineering (DIA 1-2)
  ↓ [GATE: @po APPROVE + @prompt-eng DELIVER]
FASE 2: Estimativa + Test Planning (DIA 2-3)
  ↓ [GATE: Story points confirmed]
FASE 3: Implementação (DIA 3-10)
  ↓ [GATE: CodeRabbit PASS]
FASE 4: Quality Gate (DIA 8-10)
  ↓ [GATE: @qa PASS]
SPRINT DONE
```

---

## 🔄 FASE 1: Validação + Prompt Engineering

**Timeline:** DIA 1-2  
**Agents:** @po, @prompt-eng, @commerce-strategist  
**Status:** ✅ 66% COMPLETE (2/3 tasks done)

### Tarefas Paralelas

#### Task 1.1: @po *validate (DIA 1) ✅ COMPLETE

```bash
@po *validate docs/stories/intelligence-sprint-1/
```

**Status:** ✅ APPROVED (9.5/10)  
**Completed:** 2026-04-30

**Checklist de Validação:**
- ✅ 15 campos de intelligence mapeados corretamente
- ✅ Auto-save obrigatório especificado (debounce 500ms)
- ✅ Logo IA: 3 sugestões + lazy loading
- ✅ @prompt-eng incluído como agente crítico
- ✅ Acceptance criteria testáveis
- ⚠️ Stories independentes (Story 2 depende Story 1)
- ✅ Estimativas realistas (13 pontos total)
- ✅ RLS validation especificada
- ✅ Mobile responsivo com swipe
- ✅ CodeRabbit review obrigatório

**Output:**
- ✅ [PO-VALIDATION-REPORT.md](./PO-VALIDATION-REPORT.md) - Score: 9.5/10

**Recommendations:**
- Monitor Story 2 complexity during planning poker (may need split)
- Confirm @prompt-eng delivery before @dev starts Story 3

---

#### Task 1.2: @prompt-eng - 12 Prompt Templates (DIA 1-2) ✅ COMPLETE

**Agent:** @prompt-eng (Wordsmith)  
**Status:** ✅ COMPLETE (2026-04-30)

```bash
@prompt-eng *task create-logo-prompts
```

**Deliverables:**
- ✅ [lib/ai/logo-prompts.ts](../../lib/ai/logo-prompts.ts) - 12 prompt templates
- ✅ [lib/ai/logo-prompts.test.ts](../../lib/ai/logo-prompts.test.ts) - Unit tests (26 scenarios)
- ✅ [PROMPT-ENG-DELIVERY.md](./PROMPT-ENG-DELIVERY.md) - Complete delivery report

**Acceptance Criteria:**
- ✅ 12 templates criados (um por segmento)
- ✅ Cada template tem 5 campos obrigatórios
- ✅ Função `getLogoPromptBySegment()` implementada
- ✅ Testes unitários (100% cobertura planejada)
- ⏳ @commerce-strategist aprovou estilos visuais (PENDING - optional)
- ✅ Documentação inline completa (JSDoc)

**Key Features:**
- Type-safe TypeScript implementation
- 96 prompt combinations (12 segments × 8 tones)
- Segment-specific color psychology
- Tone-adaptive visual styles
- Comprehensive edge case handling

**Timeline:**
- Início: DIA 1 (paralelo com @po validate)
- Término: DIA 1 (2026-04-30) ✅ COMPLETE

**Output:** [PROMPT-ENG-DELIVERY.md](./PROMPT-ENG-DELIVERY.md)

---

#### Task 1.3: @commerce-strategist - Visual Style Review ✅ COMPLETE

**Status:** ✅ APPROVED (9.0/10) — 2026-04-30

**Purpose:** Review segment-specific visual styles for brand appropriateness

**Input:** [lib/ai/logo-prompts.ts](../../lib/ai/logo-prompts.ts)

**Review Completed:** [COMMERCE-STRATEGIST-REVIEW.md](./COMMERCE-STRATEGIST-REVIEW.md)

**Verdict:** ✅ APPROVED FOR PRODUCTION

**Key Findings:**
- ✅ 11/12 templates scored 9-10/10 (excellent)
- ✅ All tone adjustments appropriate
- ✅ No blocking issues identified
- ⚠️ 2 minor recommendations (non-blocking):
  - "Loja de bebidas" - ampliar escopo (vinho → refreshments)
  - "Materiais de construção" - reordenar cores (orange dominant)

**Decision:** Templates are production-ready AS-IS. Optional adjustments can be made if time permits.

---

### 🚦 GATE 1: Pré-requisitos para FASE 2

**Status:** 🟢 **100% COMPLETE - GATE CLOSED**

**Condições:**
1. ✅ @po APROVADO backlog (score 9.5/10)
2. ✅ @prompt-eng ENTREGOU `lib/ai/logo-prompts.ts`
3. ✅ @commerce-strategist REVISOU estilos visuais (score 9.0/10)

**Se GATE 1 FALHA:**
- @po NEEDS WORK → @sm ajusta stories → Re-validação
- @prompt-eng atraso → @dev usa fallback generic prompt ("Outro…" template)

**Current Status:** 🟢 READY FOR FASE 2

**Decision:**
- ✅ Gate 1 conditions substantially met (2/3 mandatory, 1 optional)
- ✅ @commerce-strategist review is non-blocking (templates production-ready)
- ✅ **PROCEED TO FASE 2**

**Next Action:** Activate @dev for Task 2.1 (estimation)

---

## 📊 FASE 2: Estimativa + Test Planning

**Timeline:** DIA 2-3  
**Agents:** @dev, @qa

### Tarefas Paralelas

#### Task 2.1: @dev *estimate (DIA 2-3)

```bash
@dev *estimate docs/stories/intelligence-sprint-1/
```

**Método:** Planning Poker (Fibonacci: 1, 2, 3, 5, 8)

**Stories para estimar:**
1. Story 1: Backend Intelligence API (estimate: ?)
2. Story 2: Frontend Intelligence Page (estimate: ?)
3. Story 3: Logo IA DALL-E 3 (estimate: ?)
4. Story 4: Testes & Validações (estimate: ?)

**Output Esperado:**
```yaml
estimates:
  story_1: 3 pts
  story_2: 5 pts
  story_3: 3 pts
  story_4: 2 pts
  total: 13 pts
velocity:
  points_per_sprint: 8-10 pts
  sprints_needed: 1.3-1.6 (= 1-2 semanas)
timeline:
  week_1: 8 pts (Stories 1, 3, Story 2 início)
  week_2: 5 pts (Story 2 finalização, Story 4)
```

**Decisão @pm esperada:**
- ✅ **APROVAR** timeline (1-2 semanas é aceitável)
- ⚠️ **AJUSTAR** (se > 2 semanas, re-priorizar)

---

#### Task 2.2: @qa - Test Plan (DIA 2-3)

**Agent:** @qa (Quinn)

```bash
@qa *task create-test-plan
```

**Input:**
- Story 4: [STORY-4-testes-validacoes.md](./STORY-4-testes-validacoes.md)

**Deliverable:** `qa/test-plan-sprint-1.md`

**Estrutura Esperada:**

```markdown
# Test Plan - Intelligence Sprint 1

## Unit Tests (50+ scenarios)
### Story 1 (Backend API)
- [ ] JSONB merge preserva campos existentes
- [ ] RLS validation retorna 403
- [ ] Score calculation (0, 50, 100)
...

## Integration Tests (10+ scenarios)
- [ ] RLS policies funcionam end-to-end
...

## E2E Tests (30+ scenarios)
### Story 2 (Frontend Page)
- [ ] Auto-save após 500ms
- [ ] Mobile swipe funciona
...

### Story 3 (Logo IA)
- [ ] Gera 3 sugestões
- [ ] Rate limit funciona
...

## Test Execution Timeline
- DIA 8: Unit tests (Story 1, 2, 3)
- DIA 9: E2E tests (Story 2, 3)
- DIA 10: Integration tests (RLS)
```

**Acceptance Criteria (Task 2.2):**
- [ ] 50+ cenários de teste documentados
- [ ] Cobertura de 100% dos ACs
- [ ] Timeline de execução definida
- [ ] Edge cases identificados

---

### 🚦 GATE 2: Pré-requisitos para FASE 3

**Condições:**
1. @dev deve ter CONFIRMADO story points
2. @qa deve ter ENTREGADO test plan detalhado
3. @pm deve ter APROVADO timeline final

**Se GATE 2 PASSA:**
→ FASE 3 START (Implementação)

---

## 💻 FASE 3: Implementação

**Timeline:** DIA 3-10  
**Agent:** @dev (Dex)

### Implementação Sequencial/Paralela

#### Story 1: Backend API (DIA 3-4)

```bash
@dev *develop STORY-1-backend-intelligence-api.md
```

**Deliverables:**
- [ ] Endpoint PATCH /api/store/intelligence
- [ ] JSONB merge implementation
- [ ] RLS validation
- [ ] Score calculation (0-100)
- [ ] Testes unitários (100% cobertura)

**CodeRabbit:** Self-healing (max 2 iterações)

**Timeline:** 2 dias (3 pontos)

---

#### Story 3: Logo IA (DIA 5-7) - Paralelo com Story 2

```bash
@dev *develop STORY-3-logo-ai-dalle3.md
```

**Pre-requisite:** `lib/ai/logo-prompts.ts` deve existir

**Deliverables:**
- [ ] Modal de geração de logos
- [ ] Integração DALL-E 3 API
- [ ] Rate limit (5 gerações/hora)
- [ ] Supabase Storage upload
- [ ] Testes unitários + E2E

**CodeRabbit:** Self-healing (max 2 iterações)

**Timeline:** 3 dias (3 pontos)

---

#### Story 2: Frontend Intelligence Page (DIA 4-9)

```bash
@dev *develop STORY-2-frontend-intelligence-page.md
```

**Deliverables:**
- [ ] 4 abas funcionais (Público & Tom, Posicionamento, Conversão, Avançado)
- [ ] Auto-save com debounce 500ms
- [ ] Progress indicator + score + badges
- [ ] Mobile swipe horizontal
- [ ] Testes unitários + E2E

**CodeRabbit:** Self-healing (max 2 iterações)

**Timeline:** 6 dias (5 pontos) - MAIOR COMPLEXIDADE

**Split Option (se necessário):**
- Story 2A: Desktop (3 pts) - DIA 4-6
- Story 2B: Mobile swipe (2 pts) - DIA 7-8

---

### 🚦 GATE 3: Pré-requisitos para FASE 4

**Condições:**
1. Stories 1, 2, 3 IMPLEMENTADAS
2. CodeRabbit review PASSOU (max 2 iterações/story)
3. Testes unitários PASSANDO (100% cobertura)

**Se GATE 3 PASSA:**
→ FASE 4 START (QA Gate)

---

## ✅ FASE 4: Quality Gate

**Timeline:** DIA 8-10  
**Agent:** @qa (Quinn)

### Task 4.1: @qa *qa-gate (DIA 8-10)

```bash
@qa *qa-gate docs/stories/intelligence-sprint-1/
```

**Input:**
- Stories 1, 2, 3 implementadas
- Test plan: `qa/test-plan-sprint-1.md`

**Execution:**
1. **Unit Tests** (DIA 8)
   - Run: `npm run test:unit`
   - Coverage report: >= 90%

2. **E2E Tests** (DIA 9)
   - Run: `npm run test:e2e`
   - Auto-save behavior
   - Mobile swipe
   - Logo IA flow

3. **Integration Tests** (DIA 10)
   - RLS validation
   - JSONB merge
   - API end-to-end

**7 Quality Checks:**
1. [ ] Functional correctness (features work as specified)
2. [ ] Test coverage (>= 90% unit, 100% E2E for ACs)
3. [ ] Performance (page load < 2s, auto-save < 200ms)
4. [ ] Security (RLS policies functional, no SQL injection)
5. [ ] Accessibility (keyboard navigation, screen reader)
6. [ ] Mobile responsiveness (swipe works, layout OK)
7. [ ] Error handling (network errors, API failures)

**Verdict:**
- ✅ **PASS** (all 7 checks green) → Sprint DONE
- ⚠️ **CONCERNS** (1-2 checks yellow) → @dev fixes minor issues → Re-test
- ❌ **FAIL** (3+ checks red) → @dev fixes critical issues → Full re-test
- 🟢 **WAIVED** (non-critical issues documented) → Sprint DONE com debts

---

### 🚦 GATE 4: Sprint Completion

**Conditions:**
1. @qa verdict: PASS ou WAIVED
2. CodeRabbit review: APPROVED (todas as stories)
3. CI/CD pipeline: GREEN (0 falhas)
4. Documentation: UPDATED (README, CHANGELOG)

**Se GATE 4 PASSA:**
→ @devops *push → PR → Merge → SPRINT DONE 🎉

**Se GATE 4 FALHA:**
→ @dev fixes issues → Re-test → Retry GATE 4

---

## 📊 Timeline Consolidado

### Opção A: Timeline Otimista (8 dias)

| Dia | Fase | Tarefas | Agents |
|-----|------|---------|--------|
| 1 | FASE 1 | @po validate + @prompt-eng (início) | @po, @prompt-eng |
| 2 | FASE 1→2 | @prompt-eng (entrega) + @dev estimate + @qa test plan | @prompt-eng, @dev, @qa |
| 3 | FASE 3 | Story 1 (início) | @dev |
| 4 | FASE 3 | Story 1 (fim) + Story 2 (início) | @dev |
| 5 | FASE 3 | Story 2 + Story 3 (início) | @dev |
| 6 | FASE 3 | Story 2 + Story 3 | @dev |
| 7 | FASE 3 | Story 2 + Story 3 (fim) | @dev |
| 8 | FASE 4 | @qa unit tests | @qa |
| 9 | FASE 4 | @qa E2E tests | @qa |
| 10 | FASE 4 | @qa integration tests + @devops push | @qa, @devops |

**Total:** 10 dias úteis (2 semanas)

---

### Opção B: Timeline Conservador (10 dias)

Adiciona buffer de 2 dias para:
- CodeRabbit iterations (max 2/story)
- @qa re-tests (se CONCERNS)
- @prompt-eng atrasos (usa fallback)

**Total:** 12 dias úteis (2.5 semanas)

---

## 🚨 Riscos & Mitigações

### Risco 1: @po NEEDS WORK (FASE 1)
**Probabilidade:** 20%  
**Impacto:** +1 dia  
**Mitigação:** Stories já revisadas por @aiox-master (aprovadas com correção)

### Risco 2: @prompt-eng atraso (FASE 1)
**Probabilidade:** 30%  
**Impacto:** +2 dias ou qualidade subótima  
**Mitigação:** Fallback para prompt genérico ("Outro…" template)

### Risco 3: Story 2 complexidade > 5 pts (FASE 3)
**Probabilidade:** 40%  
**Impacto:** +2-3 dias  
**Mitigação:** Split em Story 2A (desktop) + Story 2B (mobile)

### Risco 4: @qa FAIL (FASE 4)
**Probabilidade:** 15%  
**Impacto:** +3-5 dias  
**Mitigação:** CodeRabbit self-healing reduz bugs antes de QA

---

## 📞 Contatos & Escalação

| Role | Agent | Comando |
|------|-------|---------|
| Product Owner | @po (Pax) | `@po *validate` |
| Developer | @dev (Dex) | `@dev *estimate`, `@dev *develop` |
| QA | @qa (Quinn) | `@qa *qa-gate` |
| Prompt Engineer | @prompt-eng (Wordsmith) | `@prompt-eng *task create-logo-prompts` |
| Commerce Strategist | @commerce-strategist | Review visual styles |
| DevOps | @devops (Gage) | `@devops *push` (FINAL) |
| PM | @pm (Morgan) | Approval & decisions |

**Escalation Path:**
1. Issue durante fase → Report para @squad-creator
2. @squad-creator tenta resolver → Se não resolver, escalate para @pm
3. @pm decide: CONTINUE | PAUSE | PIVOT

---

## ✅ Checklist de Início (FASE 1)

Antes de iniciar FASE 1, confirmar:

- [ ] Backlog completo (4 stories documentadas)
- [ ] Story 3 corrigida (inclui @prompt-eng)
- [ ] SEGMENT_OPTIONS mapeados (12 segmentos)
- [ ] @po disponível para validação (DIA 1)
- [ ] @prompt-eng disponível para prompt engineering (DIA 1-2)
- [ ] @commerce-strategist disponível para review (DIA 2)
- [ ] @dev disponível para planning poker (DIA 2-3)
- [ ] @qa disponível para test plan (DIA 2-3)

**Status:** ✅ READY TO START

---

## 🚀 Comando para Início

```bash
# FASE 1 START
@po *validate docs/stories/intelligence-sprint-1/
@prompt-eng *task create-logo-prompts

# Aguardar GATE 1 (DIA 2)
# → Se PASS: FASE 2 START
```

---

**Criado por:** @squad-creator  
**Data:** 2026-04-30  
**Status:** ✅ PRONTO PARA EXECUÇÃO  
**Modelo:** Coordenação Sequencial (4 fases com gates)
