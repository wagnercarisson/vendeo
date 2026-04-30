# Intelligence Calibration Sprint 1 - Backlog

**Sprint:** Intelligence Calibration Sprint 1  
**Timeline:** 1-2 semanas  
**Total Effort:** 13 pontos  
**Status:** Draft - Aguardando validação @po  
**Created:** 2026-04-30

---

## 📋 Sprint Overview

### Objective

Implementar Intelligence Calibration Page com 4 abas, auto-save obrigatório, e geração de logo via DALL-E 3 (lazy loading).

### Success Metrics

- [ ] 15 campos de intelligence capturados
- [ ] Auto-save funcional (debounce 500ms)
- [ ] Score 0-100 + badges funcionais
- [ ] Logo IA: 3 sugestões + lazy loading
- [ ] Mobile responsivo (swipe)
- [ ] 100% cobertura de testes

---

## 📚 Stories

### Story 1: Backend - Intelligence API
**File:** [STORY-1-backend-intelligence-api.md](./STORY-1-backend-intelligence-api.md)  
**Effort:** 3 pontos  
**Status:** 🟡 Draft

**Summary:**
- PATCH /api/store/intelligence
- JSONB merge (preserva campos existentes)
- RLS validation (ownership)
- Score calculation (0-100)

**Key ACs:**
- [ ] JSONB merge funcional
- [ ] RLS validation retorna 403 quando apropriado
- [ ] Score = 0-100 baseado em 15 campos
- [ ] Testes unitários 100% cobertura

---

### Story 2: Frontend - Intelligence Page (4 Abas)
**File:** [STORY-2-frontend-intelligence-page.md](./STORY-2-frontend-intelligence-page.md)  
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
