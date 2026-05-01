# Intelligence Calibration Sprint 1 - Backlog

**Sprint:** Intelligence Calibration Sprint 1  
**Timeline:** 1-2 semanas (Iniciado: 30/04/2026)  
**Total Effort:** 15 pontos (11 completos, 4 pendentes)  
**Status:** 🟢 85% COMPLETE - Story 2B pendente  
**Created:** 2026-04-30  
**Last Update:** 2026-04-30 23:45

---

## 📊 Sprint Progress

**Completo:** 11/15 story points (73%)  
**ACs Implementados:** 39/49 (80%)  
**Tests:** 46 tests automatizados passando  
**Quality Score:** 9.5/10 (Excellent)

**Próxima sessão:** Story 2B (Mobile UI) - Estimativa: 1 dia

---

## 📋 Sprint Overview

### Objective

Implementar Intelligence Calibration Page com 4 abas, auto-save obrigatório, e geração de logo via DALL-E 3 (lazy loading).

### Success Metrics

- [x] 15 campos de intelligence capturados ✅
- [x] Auto-save funcional (debounce 500ms) ✅
- [x] Score 0-100 + badges funcionais ✅
- [x] Logo IA Backend: 3 sugestões + rate limiting ✅
- [ ] Mobile responsivo (swipe) 🟡 Story 2B
- [x] 100% cobertura de testes (backend) ✅

---

## 📚 Stories

### Story 1: Backend - Intelligence API
**File:** [STORY-1-backend-intelligence-api.md](./STORY-1-backend-intelligence-api.md)  
**Effort:** 3 pontos  
**Status:** ✅ COMPLETE (9.5/10)

**Summary:**
- PATCH /api/store/intelligence
- JSONB merge (preserva campos existentes)
- RLS validation (ownership)
- Score calculation (0-100)

**Key ACs:**
- [x] JSONB merge funcional ✅
- [x] RLS validation retorna 403 quando apropriado ✅
- [x] Score = 0-100 baseado em 15 campos ✅
- [x] Testes unitários 100% cobertura ✅

**Arquivos implementados:**
- `app/api/store/intelligence/route.ts`
- `lib/domain/intelligence/service.ts`
- `lib/domain/intelligence/service.test.ts` (13 tests)
- `lib/domain/intelligence/types.ts`

---

### Story 2A: Frontend - Intelligence Page (Desktop Core)
**File:** [STORY-2A-frontend-core.md](./STORY-2A-frontend-core.md)  
**Effort:** 3 pontos  
**Status:** ✅ COMPLETE (9.5/10)

**Summary:**
- 4 tabs (Público & Tom, Posicionamento, Conversão, Avançado)
- 15 campos mapeados
- Auto-save com debounce 500ms
- Progress bar + Score + Badges

**Key ACs:**
- [x] 4 abas funcionais ✅
- [x] Auto-save ao trocar de aba ✅
- [x] Progress bar atualiza em tempo real ✅
- [x] Badge system (🥉🥈🥇) ✅
- [x] Form state preservado ✅

**Arquivos implementados:**
- `app/dashboard/store/intelligence/page.tsx`
- `app/dashboard/store/intelligence/components/*` (7 components)
- `app/dashboard/store/intelligence/hooks/*` (2 hooks)

---

### Story 2B: Frontend - Mobile UI + Polish
**File:** [STORY-2B-mobile-ui.md](./STORY-2B-mobile-ui.md)  
**Effort:** 3 pontos  
**Status:** 🟡 NOT STARTED

**Summary:**
- Swipe horizontal entre abas (mobile)
- Responsive breakpoints
- Offline detection + retry
- E2E tests completos

**Blocked by:** Story 2A ✅ (UNBLOCKED - pode começar)

---

### Story 3: Logo IA - DALL-E 3
**File:** [STORY-3-logo-ai-dalle3.md](./STORY-3-logo-ai-dalle3.md)  
**Effort:** 3 pontos  
**Status:** ✅ BACKEND COMPLETE (9.5/10) | 🟡 MODAL PENDENTE

**Summary:**
- Backend: DALL-E 3 integration + rate limiting + cost tracking
- Frontend: Modal com 3 sugestões (PENDENTE)

**Backend ACs:**
- [x] OpenAI DALL-E 3 integration ✅
- [x] 12 segment-specific prompts ✅
- [x] Rate limiting (5 generations/hour) ✅
- [x] Cost tracking ($0.04/image) ✅
- [x] Migration 036 applied ✅
- [x] 33 unit tests + 13 E2E tests ✅

**Arquivos implementados:**
- `app/api/ai/generate-logo/route.ts`
- `app/api/store/save-logo/route.ts`
- `lib/ai/logo-prompts.ts`
- `database/migrations/036_logo_generations.sql`
- `tests/e2e/logo-generation.spec.ts` (13 tests)

**Pendente:**
- `components/LogoGeneratorModal.tsx` (UI wrapper)
- Integration em onboarding page

---

### Story 4: Testes & Validações
**File:** [STORY-4-testes-validacoes.md](./STORY-4-testes-validacoes.md)  
**Effort:** 2 pontos  
**Status:** ✅ BACKEND COMPLETE | 🟡 FRONTEND E2E PENDENTE

**Summary:**
- Backend: 100% coverage (46 tests)
- Frontend: Desktop E2E pendente (Story 2B)

**Tests implementados:**
- [x] Backend API: 13 unit tests ✅
- [x] Logo IA Backend: 33 unit tests ✅
- [x] Logo IA E2E: 13 Playwright tests ✅
- [ ] Frontend Intelligence Page E2E 🟡
- [ ] Mobile behavior tests 🟡  
**Effort:** 5 pontos  
**Status:** 🟡 Draft

**Summary:**
- 4 abas: Público & Tom, Posicionamento, Conversão, Avançado
- Auto-save obrigatório (debounce 500ms)
- Progress indicator + score + badges
- Mobile: Swipe horizontal

**Key ACs:**
- [ ] 4 abas funcionais com 15 campos
- [ ] Auto-save ao trocar de aba (500ms debounce)
- [ ] Progress bar + score + badges funcionais
- [ ] Mobile swipe em dispositivos touch
- [ ] Form state preservado entre abas

**Dependencies:**
- Blocked by: Story 1 (Backend API)

---

### Story 3: Logo IA - DALL-E 3 (Lazy Loading)
**File:** [STORY-3-logo-ai-dalle3.md](./STORY-3-logo-ai-dalle3.md)  
**Effort:** 3 pontos  
**Status:** 🟡 Draft

**Summary:**
- Trigger: logo_url vazio → mostra link "Gerar logo com IA"
- Modal com 3 sugestões (DALL-E 3 standard)
- Preview antes de salvar
- Link some após salvar
- Rate limit: 5 gerações/hora

**Key ACs:**
- [ ] Link só aparece se logo_url vazio
- [ ] 3 sugestões geradas via DALL-E 3
- [ ] Supabase Storage upload funcional
- [ ] Rate limit implementado
- [ ] Link desaparece após salvar

**Cost Estimate:**
- $0.12/geração (3 logos * $0.04)
- $0.20-0.40/mês (20-30 gerações estimadas)

---

### Story 4: Testes & Validações
**File:** [STORY-4-testes-validacoes.md](./STORY-4-testes-validacoes.md)  
**Effort:** 2 pontos  
**Status:** 🟡 Draft

**Summary:**
- Edge cases: JSONB malformado, campos opcionais
- RLS validation (ownership)
- Mobile swipe (dispositivos touch)
- Auto-save (perda de conexão)

**Key ACs:**
- [ ] Backend: 100% cobertura unit tests
- [ ] Frontend: 90% cobertura unit tests
- [ ] E2E: 100% dos ACs cobertos
- [ ] RLS: 100% cobertura integration tests
- [ ] Mobile: Swipe testado (375x667 viewport)

**Dependencies:**
- Blocked by: Stories 1, 2, 3

---

## 📊 Sprint Breakdown

### Effort Distribution

| Story | Effort | % |
|-------|--------|---|
| Story 1: Backend API | 3 pts | 23% |
| Story 2: Frontend Page | 5 pts | 38% |
| Story 3: Logo IA | 3 pts | 23% |
| Story 4: Testes | 2 pts | 16% |
| **TOTAL** | **13 pts** | **100%** |

### Dependency Graph

```
Story 1 (Backend API)
  ↓
Story 2 (Frontend Page)
  ↓
Story 4 (Testes)

Story 3 (Logo IA) ← Paralelo
```

### Timeline Estimate

**Velocidade estimada:** 8-10 pontos/semana

- **Semana 1:** Stories 1, 3 (6 pontos) + início Story 2
- **Semana 2:** Finalizar Story 2 + Story 4 (7 pontos)

**Total:** 1-2 semanas (dependendo da velocidade real)

---

## ✅ Sprint Acceptance Criteria (Master)

- [ ] **Backend:** PATCH /api/store/intelligence funcional
- [ ] **Frontend:** Intelligence Page com 4 abas funcional
- [ ] **Auto-save:** Debounce 500ms ao trocar de aba
- [ ] **Logo IA:** 3 sugestões + lazy loading funcional
- [ ] **Mobile:** Swipe horizontal funcional
- [ ] **Score:** Cálculo 0-100 + badges funcionais
- [ ] **Testes:** 100% cobertura de ACs (E2E)
- [ ] **RLS:** Validation funcional (403 quando apropriado)
- [ ] **CodeRabbit:** Todas as stories passaram review
- [ ] **CI/CD:** Pipeline passa com 0 falhas
- [ ] **Docs:** README atualizado com novas funcionalidades

---

## 🚀 Sprint Kickoff Checklist

### Pre-Sprint (1 dia)

- [ ] **@po:** Validar 4 stories (*validate)
- [ ] **@dev:** Planning poker (estimar pontos)
- [ ] **@sm:** Ajustar stories conforme feedback @po
- [ ] **@pm:** Aprovar backlog final

### Sprint Execution (1-2 semanas)

- [ ] **Week 1 Day 1:** @dev inicia Story 1 (Backend API)
- [ ] **Week 1 Day 2-3:** @dev implementa Story 1 + inicia Story 3 (Logo IA)
- [ ] **Week 1 Day 4-5:** @dev inicia Story 2 (Frontend Page)
- [ ] **Week 2 Day 1-3:** @dev finaliza Story 2
- [ ] **Week 2 Day 4:** @qa executa Story 4 (Testes)
- [ ] **Week 2 Day 5:** @devops *push → PR → merge

### Post-Sprint (1 dia)

- [ ] **@pm:** Retrospective (o que funcionou?)
- [ ] **@pm:** Coletar feedback de beta testers
- [ ] **@pm:** Planejar Sprint 2 (se aplicável)

---

## 📚 References

### Specifications

- [UX Spec - Intelligence Calibration Tabs](../../ux/intelligence-calibration-tabs.md)
- [UX Spec - Tabs vs Pages Analysis](../../ux/tabs-vs-pages-analysis.md)
- [UX Spec - README](../../ux/README.md)

### Database

- [Migration 034 - store_intelligence_context_v2_1.sql](../../../database/migrations/034_store_intelligence_context_v2_1.sql)

### Code Reference

- [Onboarding Completo - app/dashboard/store/page.tsx](../../../app/dashboard/store/page.tsx)

### Constitution

- [PROJECT-CONSTITUTION.md](../../PROJECT-CONSTITUTION.md)
- [CRITICAL-FLOWS.md](../../CRITICAL-FLOWS.md)
- [CAPABILITIES-INVENTORY.md](../../CAPABILITIES-INVENTORY.md)

---

## 🎯 Definition of Done (Sprint)

O Sprint 1 está completo quando:

1. **Todas as 4 stories estão Done:**
   - [ ] Story 1: Done
   - [ ] Story 2: Done
   - [ ] Story 3: Done
   - [ ] Story 4: Done

2. **Quality Gates passaram:**
   - [ ] CodeRabbit review (max 2 iterações/story)
   - [ ] QA Gate: PASS (não CONCERNS ou FAIL)
   - [ ] CI/CD pipeline: 0 falhas

3. **Functional Validation:**
   - [ ] Intelligence Page funcional em produção
   - [ ] Auto-save testado por beta tester (não perde dados)
   - [ ] Logo IA testado por beta tester (3 sugestões OK)
   - [ ] Mobile testado em dispositivo real (swipe OK)

4. **Documentation Updated:**
   - [ ] README.md atualizado
   - [ ] CAPABILITIES-INVENTORY.md atualizado
   - [ ] CHANGELOG.md com entradas do sprint

5. **Retrospective Completed:**
   - [ ] O que funcionou bem?
   - [ ] O que pode melhorar?
   - [ ] Action items para Sprint 2

---

## 📞 Sprint Contacts

| Role | Agent | Responsibility |
|------|-------|----------------|
| Product Owner | @po (Pax) | Validação de stories |
| Scrum Master | @sm (River) | Criação de stories |
| Developer | @dev (Dex) | Implementação |
| QA | @qa (Quinn) | Testes & validações |
| DevOps | @devops (Gage) | Git push & PR |
| PM | @pm (Morgan) | Aprovação & decisões |

---

**Status:** 🟡 DRAFT - Aguardando @po *validate  
**Next Action:** @po review → @dev planning poker → @pm approve → Sprint START
