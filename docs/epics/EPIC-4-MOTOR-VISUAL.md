# EPIC 4: Motor de Composição Visual v2.0

**Epic ID:** 4  
**Epic Owner:** Wagner (Product Owner)  
**Technical Lead:** @architect (Aria)  
**Sprint Planning:** 2026-04-21  
**Status:** 📋 READY FOR EXECUTION  
**Timeline:** 6-8 semanas  
**Priority:** 🔴 CRITICAL (Core Product Feature)

---

## 🎯 Epic Vision

Transformar o Vendeo de um sistema baseado em **layouts fixos** para um **motor de composição visual dinâmica**, capaz de gerar artes personalizadas, consistentes e adaptáveis ao DNA de cada loja.

**O sistema NÃO escolhe layouts fixos.**  
**O sistema gera DIREÇÕES VISUAIS e as transforma em composições inteligentes.**

---

## 📊 Business Value

### Por que isso importa?

**Problema Atual:**
- Layouts fixos limitam criatividade
- Composições genéricas não refletem identidade da loja
- Usuários regeneram múltiplas vezes até acertar
- Taxa de aprovação baixa (~40-50%)

**Valor de Negócio:**
- **↑ Taxa de aprovação:** Meta 75%+ (composições adaptadas à imagem)
- **↓ Custo de IA:** Menos regenerações = menos calls OpenAI
- **↑ Reconhecimento visual:** Visual Signature consistente entre campanhas
- **↑ Satisfação:** Lojista sente que arte "entende" seu negócio

**ROI Estimado:**
- Redução de 50% nas regenerações → economia de $X/mês em API calls
- Aumento de 30% no uso do produto (mais artes geradas)
- Fundação para Weekly Plan v2 (segunda feature mais importante)

---

## 🧩 Architecture Overview

### 4 Motores de IA

```
Imagem + Campanha + Store DNA
        ↓
┌─────────────────────────────────────┐
│ MOTOR 1: Visual Reader              │
│ Analisa imagem do produto           │
│ Output: ImageProfile                │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ MOTOR 2: Intent Resolver            │
│ Determina hierarquia visual         │
│ Output: CreativeDirection           │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ MOTOR 3: Visual Composer            │
│ Gera 3-6 variações de composição    │
│ Output: CompositionVariants         │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ MOTOR 4: Renderer                   │
│ Compõe arte final programaticamente │
│ Output: PNG/JPG (1080x1080)         │
└─────────────────────────────────────┘
```

---

## 🎨 Visual Signature System

**Conceito:** Cada loja tem uma **identidade visual fixa** (core) com **variações contextuais** (profiles).

### Visual Signature (Core)
- Primary color (marca)
- Secondary color (acento)
- Logo da loja
- Tipografia (store name)
- Signature seed (UUID para variações consistentes)

### Context Profiles (5 tipos)

| Profile | Uso | Intensity | Exemplo |
|---------|-----|-----------|---------|
| **standard** | Campanhas diárias | balanced | Produto do dia, novidade |
| **promotional** | Promoções e descontos | strong | Black Friday, 50% OFF |
| **seasonal** | Datas especiais | balanced | Natal, Páscoa, Dia das Mães |
| **premium** | Produtos de luxo | minimal | Coleção premium, edição limitada |
| **urgency** | Ofertas limitadas | strong | Últimas unidades, acaba hoje |

---

## 📦 Stories Breakdown

### Phase 1: Fundação (Stories 4.1-4.4)

| Story | Título | Complexidade | Pontos | Duração |
|-------|--------|--------------|--------|---------|
| **4.1** | Visual Reader — Análise de Imagem | STANDARD | 5 | 3-5 dias |
| **4.2** | Intent Resolver — Hierarquia Visual | COMPLEX | 8 | 5-7 dias |
| **4.3** | Visual Composer — Geração de Variações | COMPLEX | 8 | 5-7 dias |
| **4.4** | Renderer — Arte Final Programática | STANDARD | 5 | 3-5 dias |

**Subtotal Phase 1:** 26 pontos, ~3 semanas

---

### Phase 2: Integração (Stories 4.5-4.6)

| Story | Título | Complexidade | Pontos | Duração |
|-------|--------|--------------|--------|---------|
| **4.5** | Visual Signature Integration | SIMPLE | 3 | 2-3 dias |
| **4.6** | Context Profiles — Aplicação | STANDARD | 5 | 3-4 dias |

**Subtotal Phase 2:** 8 pontos, ~1 semana

---

### Phase 3: Learning (Story 4.8)

| Story | Título | Complexidade | Pontos | Duração |
|-------|--------|--------------|--------|---------|
| **4.8** | Variation Selection & Learning | STANDARD | 5 | 3-5 dias |

**Subtotal Phase 3:** 5 pontos, ~1 semana

---

**Epic Total:** 39 pontos, ~5 semanas

**Note:** Story 4.7 (Video Script Generation) foi movida para BACKLOG. Vendeo gera roteiros de vídeo (cenas, hashtags, CTAs), não renderiza vídeos.

---

## 🎯 Success Metrics

### Primary Metrics

| Métrica | Baseline (atual) | Meta | Measurement |
|---------|------------------|------|-------------|
| Taxa de aprovação | ~45% | 75%+ | % campanhas aprovadas sem regeneração |
| Tempo médio de geração | ~8s | <12s | Tempo de API call completo (4 motores) |
| Taxa de regeneração | ~2.3x/campanha | <1.5x | Média de regenerações antes de aprovar |
| Reconhecimento visual | N/A | 80%+ | Survey: "Arte parece ser da sua loja?" |

### Secondary Metrics

| Métrica | Meta | Measurement |
|---------|------|-------------|
| Custo de IA por campanha | <$0.15 | Soma de tokens dos 4 motores |
| Preferred composition detection | >60% | % acertos do auto-selection (4.8) |
| Context profile accuracy | >70% | Intent Resolver escolhe profile correto |
| Edge case handling | 95%+ | % imagens problemáticas tratadas sem erro |

---

## 🔄 Dependencies & Integration Points

### External Dependencies

| Dependency | Type | Impact if Delayed |
|------------|------|-------------------|
| OpenAI GPT-4o (multimodal) | External API | BLOCKER (Visual Reader needs vision) |
| Canvas API (Node.js) | Library | BLOCKER (Renderer needs canvas) |
| Sharp (image processing) | Library | BLOCKER (Rendering pipeline) |
| Supabase Storage | Infrastructure | HIGH (Imagem upload) |

### Internal Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| Visual Signatures Schema (Fase 1) | @data-engineer | ✅ DONE |
| Campaign flow refactor | Epic 2 | ✅ DONE (Abril 2026) |
| Pricing system | Epic 3 (future) | ⏳ PLANNED |

---

## ⚠️ Risks & Mitigations

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| **Visual Reader hallucina sobre background type** | 🔴 High | Medium | XML tagging + few-shot examples + @prompt-eng optimization |
| **Intent Resolver gera direções impossíveis** | 🔴 High | Medium | Constraint validation layer (regras hard-coded) |
| **Renderer performance degrada com múltiplas variações** | 🟡 Medium | Medium | Paralelizar rendering + caching de elementos |
| **Visual Signature não aplicada consistentemente** | 🟡 Medium | Low | Unit tests para cada context profile |
| **Custo de IA explode** (4 LLM calls por campanha) | 🟡 Medium | High | Token optimization + cachear Visual Reader quando imagem repetida |
| **Video Generation muito lento** | 🟡 Medium | High | Async processing + background job queue |
| **Weekly Plan precisa refatoração após Motor v2.0** | 🔴 High | Medium | **MITIGADO:** Story 4.9 adiada até Motor v2.0 estável |

---

## 📚 Technical Documentation

### Key Documents

- [Motor de Composição Visual (Spec Original)](../Vendeo%20-%20Motor%20de%20composição%20visual%20.md)
- [FASE 1 — Schema Visual Signatures (Concluída)](../FASE-1-RESUMO.md)
- [Weekly Plan × Motor Visual — Decisões de Integração](../analysis/WEEKLY-PLAN-MOTOR-VISUAL-INTEGRACAO.md)
- [ROADMAP.md](../../ROADMAP.md)

### Architecture Decisions

| Decision | Rationale | Document |
|----------|-----------|----------|
| 4 motores separados (não pipeline único) | Debugging, testing, reusabilidade | Spec original |
| Visual Signature como sistema separado | Escalabilidade para Weekly Plan | FASE-1-RESUMO.md |
| Weekly Plan integration adiada (Story 4.9) | Evitar refatoração dupla | WEEKLY-PLAN-MOTOR-VISUAL-INTEGRACAO.md |
| Context profiles (5 tipos) | Balancear flexibilidade e simplicidade | Spec original |

---

## 🚀 Rollout Strategy

### Feature Flags

```typescript
MOTOR_VISUAL_V2: "motor_visual_v2_enabled"  // Master toggle
MOTOR_VIDEO: "motor_video_enabled"          // Story 4.7 específico
LEARNING_ENGINE: "learning_engine_enabled"  // Story 4.8 específico
```

### Rollout Phases

```
Phase 1: Beta Users (5-10 lojas) — 1 semana
  └─> Coleta de feedback qualitativo
  └─> Ajustes rápidos no Intent Resolver

Phase 2: Early Adopters (50 lojas) — 1 semana
  └─> Métricas quantitativas (taxa aprovação, regeneração)
  └─> Calibração de Context Profiles

Phase 3: General Availability (100%) — Gradual
  └─> Monitor custo de IA
  └─> Monitor performance (latência)
```

---

## 🎓 Learning & Iteration

### Dados a Coletar (2 semanas pós-lançamento)

1. **Composições preferidas:** Quais tipos usuários aprovam mais? (hero, split-dynamic, stacked, etc)
2. **Visual Signature recognition:** Lojas reconhecem sua identidade visual nas artes?
3. **Theme inheritance:** Contextos sazonais (Natal, Black Friday) funcionam bem?
4. **Edge cases:** Quais tipos de imagem quebram o Visual Reader?
5. **Custo real:** Qual o custo médio de IA por campanha gerada?

### Iteration Plan

**Story 4.9 (BACKLOG):** Weekly Plan Integration
- **Pre-requisitos:**
  - ✅ Motor v2.0 estável (Stories 4.1-4.8 completas)
  - ✅ 2 semanas de dados reais em produção
  - ✅ Preferred composition model calibrado (Story 4.8)
- **Escopo:**
  - Geração de 4 variações de plano semanal
  - Herança de theme/brief → Motor Visual
  - Modo auto-preferida para campanhas de plano

---

## ✅ Definition of Done (Epic Level)

### Code Quality
- [ ] Todos os testes unitários passando (Jest)
- [ ] Cobertura de código >80% nos 4 motores
- [ ] Lint e typecheck sem erros
- [ ] CodeRabbit review aprovado (zero blocker issues)

### Functionality
- [ ] Motor v2.0 gera artes para campanhas manuais
- [ ] Visual Signature aplicada consistentemente
- [ ] Context profiles funcionando (5 tipos)
- [ ] Video generation pipeline funcional
- [ ] Learning engine tracking preferências

### Performance
- [ ] Tempo de geração <12s (4 motores)
- [ ] Custo de IA <$0.15/campanha
- [ ] 95%+ edge cases tratados sem erro

### Documentation
- [ ] README.md atualizado (como usar Motor v2.0)
- [ ] Diagrama de arquitetura dos 4 motores
- [ ] Guia de troubleshooting (common issues)
- [ ] Prompt engineering doc (@prompt-eng)

### Deployment
- [ ] Feature flags configurados
- [ ] Rollout faseado completo (beta → GA)
- [ ] Métricas coletadas (2 semanas produção)
- [ ] Feedback qualitativo de 10+ lojas

---

## 👥 Team & Responsibilities

| Role | Agent | Responsibility |
|------|-------|----------------|
| **Product Owner** | Wagner | Decisões de priorização, aceite final |
| **Technical Lead** | @architect (Aria) | Arquitetura dos 4 motores, decisões técnicas |
| **Implementation** | @dev (Dex) | Código dos motores, testes, integração |
| **Prompt Engineering** | @prompt-eng (Wordsmith) | Otimização de prompts (Visual Reader, Intent Resolver) |
| **Quality Assurance** | @qa (Quinn) | Testes, validação de métricas, edge cases |
| **DevOps** | @devops (Gage) | Deploy, feature flags, monitoring |
| **Data Engineer** | @data-engineer (Dara) | Schema Visual Signatures (já concluído) |

---

**Created:** 2026-04-21  
**Last Updated:** 2026-04-21  
**Next Review:** Após Story 4.4 (fim da Phase 1)

---

*AIOX Epic — Synced from docs/epics/EPIC-4-MOTOR-VISUAL.md*
