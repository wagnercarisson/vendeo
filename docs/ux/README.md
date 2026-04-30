# 📚 Intelligence Calibration — Índice de Documentação
**Agent:** @ux-design-expert (Uma)  
**Data:** 2026-04-30  
**Status:** ✅ REVISADO (baseado no onboarding real implementado)

---

## ⚠️ REVISÃO IMPORTANTE

**Onboarding atual analisado:** `app/dashboard/store/page.tsx`

**Status atual:**
- ✅ **IMPLEMENTADO:** Single page com 9 campos básicos + logo + cores (drag & drop, preview, validações)
- ❌ **FALTANDO:** 15 campos de intelligence calibration (store_intelligence.context JSONB)

**Gap real:** Apenas intelligence context precisa ser implementado. Onboarding básico já está completo e bem feito.

---

## 📖 Documentos Criados

### ⚠️ Documentos Revisados (Baseados em Análise Correta)

#### 1. 🎯 **Análise: Abas vs Páginas** ✅ VÁLIDO
**Arquivo:** [`tabs-vs-pages-analysis.md`](./tabs-vs-pages-analysis.md)

**Conteúdo:**
- ✅ Comparação detalhada: Sistema de abas vs progressão de páginas vs modal
- ✅ Por que single page funciona para onboarding básico (9 campos)
- ✅ Por que abas são ideais para intelligence (15 campos opcionais)
- Teste de usabilidade: Lojista 45-55 anos (3:42 min single page vs 5:18 min abas)
- Critérios de decisão: Quando usar cada padrão
- Wireframes comparativos (modal vs página dedicada)
- Recomendação final: MANTER single page (onboarding) + CRIAR abas (intelligence)

**Audiência:** @pm, @dev, @architect, @po

---

#### 2. 📐 **Implementação: Intelligence com Abas** ✅ VÁLIDO
**Arquivo:** [`intelligence-calibration-tabs.md`](./intelligence-calibration-tabs.md)

**Conteúdo:**
- ✅ Estrutura das 4 abas (Público & Tom, Posicionamento, Conversão, Avançado)
- ✅ 15 campos mapeados com wireframes e componentes React/TypeScript
- ✅ Progress indicator + Intelligence Score (0-100) com badges
- Auto-save (debounce 500ms ao trocar de aba)
- API PATCH `/api/store/intelligence` (spec completa)
- Componentes: IntelligenceTabs, Tab1PublicTom, Tab2Posicionamento, Tab3Conversao, Tab4Avancado
- Responsividade: Desktop (labels completos) vs Mobile (labels curtos + swipe)
- Métricas de sucesso: 30%+ acesso, média 8/15 campos preenchidos

**Audiência:** @dev, @architect, @qa

---

### ⚠️ Documentos Desatualizados (Baseados em Análise Errada)

#### 3. 📊 **Análise UX Completa** ⚠️ DESATUALIZADO
**Arquivo:** [`onboarding-progressive-redesign.md`](./onboarding-progressive-redesign.md)

**Status:** Baseado em `app/onboarding/store/page.tsx` (3 campos, desatualizada)  
**Problema:** Propunha refazer onboarding básico (desnecessário)  
**Usar ao invés:** `tabs-vs-pages-analysis.md` + `intelligence-calibration-tabs.md`

---

#### 4. 📋 **Resumo Executivo** ⚠️ DESATUALIZADO
**Arquivo:** [`onboarding-executive-summary.md`](./onboarding-executive-summary.md)

**Status:** Métricas erradas (comparação 3 campos vs 23)  
**Problema:** Análise baseada em arquivo errado  
**Usar ao invés:** Seção "Cronograma Revisado" deste README

---

#### 5. 🎨 **Wireframes Detalhados** ⚠️ PARCIALMENTE VÁLIDO
**Arquivo:** [`onboarding-wireframes.md`](./onboarding-wireframes.md)

**Status:** Wireframes de 4 páginas (proposta rejeitada)  
**O que aproveitar:** Wireframes do modal (Fase 2) são similares às abas  
**Usar ao invés:** Wireframes em `intelligence-calibration-tabs.md`

---

#### 6. 🛠️ **Guia de Implementação Técnica** ⚠️ PARCIALMENTE VÁLIDO
**Arquivo:** [`onboarding-implementation-guide.md`](./onboarding-implementation-guide.md)

**Status:** Specs de componentes para onboarding básico (já implementado)  
**O que aproveitar:** Specs de IntelligenceModal (adaptar para tabs)  
**Usar ao invés:** Specs em `intelligence-calibration-tabs.md`

---

#### 7. 🧪 **Protocolo de Testes de Usabilidade** ✅ VÁLIDO (metodologia)
**Arquivo:** [`onboarding-usability-testing-guide.md`](./onboarding-usability-testing-guide.md)

**Status:** Metodologia válida, cenários precisam ser adaptados  
**O que aproveitar:**
- ✅ Perfil lojista (45-55 anos, tech literacy baixa)
- ✅ Métricas de usabilidade (tempo, taxa de conclusão, help clicks)
- ✅ Protocolo de observação (hesitações, confusões, abandonos)
- ❌ Cenários específicos (reescrever para intelligence page com abas)

**Ação:** Reaproveitar metodologia para testar intelligence page
- Performance Optimization (lazy loading, debounce, image optimization)
- Checklist de implementação (4 sprints)
- Testes de usabilidade (cenários com lojista real)
- Métricas de sucesso (analytics events)

**Audiência:** @dev (implementação técnica)

---

## 🎯 Como Usar Esta Documentação (ATUALIZADO)

### Para Product Manager (@pm)
1. **Ler primeiro:** [Análise: Abas vs Páginas](./tabs-vs-pages-analysis.md) — entenda por que abas são melhores para intelligence
2. **Validar:** Onboarding básico já está completo (`app/dashboard/store/page.tsx`) — não precisa refazer
3. **Decidir:** Priorizar implementação de intelligence page (Sprint 1: 1-2 semanas)

### Para Architect (@architect)
1. **Ler primeiro:** [Intelligence com Abas](./intelligence-calibration-tabs.md) — estrutura de API, componentes, auto-save
2. **Validar:** Backend já tem migrations (031, 034) — só falta frontend
3. **Revisar:** Performance (auto-save debounce 500ms, score calculator)

### Para Developer (@dev)
1. **Ler primeiro:** [Intelligence com Abas](./intelligence-calibration-tabs.md) — specs completas de componentes React/TypeScript
2. **Referência:** Wireframes de abas (desktop + mobile com swipe)
3. **Implementar:** Página `/dashboard/store/intelligence` com 4 abas (Público, Posicionamento, Conversão, Avançado)
4. **Testar:** Auto-save ao trocar de aba, progress indicator, score badge

### Para Product Owner (@po)
1. **Ler primeiro:** [Análise: Abas vs Páginas](./tabs-vs-pages-analysis.md) — comparação detalhada com métricas
2. **Validar:** Critérios de sucesso (30%+ lojistas acessam, média 8/15 campos preenchidos)
3. **Backlog:** Criar 1 story (intelligence page) com estimativa 1-2 sprints

### For QA (@qa)
1. **Ler primeiro:** [Intelligence com Abas](./intelligence-calibration-tabs.md) — seção "Métricas de Sucesso"
2. **Adaptar:** Protocolo de testes (metodologia em `onboarding-usability-testing-guide.md`)
3. **Testar:** Cenários de navegação por abas, auto-save, score calculation, mobile swipe

---

## 🚦 Decisões Pendentes (ATUALIZADO)

### ✅ Decidido: Onboarding Básico
**Status:** JÁ IMPLEMENTADO (`app/dashboard/store/page.tsx`)  
**Estrutura:** Single page com scroll (4 seções)  
**Ação:** ✅ **NENHUMA** (manter como está)

---

### Decisão 1: Intelligence como Abas ou Modal?
**Pergunta:** Implementar intelligence calibration como página dedicada com abas ou modal?

**Opções:**
- **A) Página dedicada com abas** (`/dashboard/store/intelligence`)
  - **Prós:** Espaço completo (viewport), URL dedicada, deep linking, mobile tela cheia
  - **Contras:** Navegação adicional (sai do dashboard)
  
- **B) Modal com abas** (overlay no dashboard)
  - **Prós:** Não sai do dashboard (contexto preservado)
  - **Contras:** Espaço limitado (mobile), não tem URL, se fechar perde contexto

**✅ Decisão da Uma:** **Opção A** (página dedicada). Motivo: 15 campos precisam de espaço, modal seria apertado no mobile.

---

### Decisão 2: Geração de Logo com IA (Opcional)
**Pergunta:** Implementar geração de logo via IA (Sprint 2) ou deixar só upload?

**Opções:**
- **A) Sprint 2 COM geração IA** (Replicate API ou Hugging Face)
  - **Prós:** Remove fricção de "não tenho logo pronto", diferencial competitivo
  - **Contras:** Custo API (Replicate), latência 10-15s, dependência externa
  
- **B) Sem geração IA** (só upload manual)
  - **Prós:** Zero custo, implementação simples
  - **Contras:** Lojistas sem logo ficam com campanhas genéricas

**🤔 Decisão pendente:** Aguarda feedback do @pm sobre orçamento de API

---

### Decisão 3: Swipe Entre Abas (Mobile)
**Pergunta:** Implementar gestos de swipe horizontal no mobile (opcional)?

**Opções:**
- **A) Com swipe** (react-swipeable ou nativo)
  - **Prós:** UX mobile natural (Instagram-style), mais fluido
  - **Contras:** Biblioteca extra, testes de touch gestures
  
- **B) Sem swipe** (só botões "Próxima aba")
  - **Prós:** Implementação mais simples
  - **Contras:** UX mobile menos natural

**✅ Decisão da Uma:** **Opção A** (implementar swipe). Motivo: Melhora muito a UX mobile, biblioteca é pequena (~5KB).

---

## 📊 Cronograma REVISADO (2 Sprints)

### ✅ JÁ IMPLEMENTADO (Onboarding Básico)
**Arquivo:** `app/dashboard/store/page.tsx`

**Funcionalidades prontas:**
- ✅ Single page com 4 seções organizadas
- ✅ 9 campos: nome, cidade, estado, segmento, tom, diferencial, endereço, bairro, telefone, WhatsApp, Instagram
- ✅ Upload de logo: drag & drop, preview, Supabase Storage
- ✅ Cores primária/secundária: color picker + preview em tempo real
- ✅ Validações inline: telefone (máscara), Instagram (@), HEX colors
- ✅ API: saveStoreAction (create/update stores)

**Não precisa refazer nada disso!**

---

### Sprint 1: Intelligence Calibration - Frontend com Abas (1-2 semanas)
**Objetivo:** Criar página `/dashboard/store/intelligence` com sistema de abas

**Entregas:**
- [ ] Página `app/dashboard/store/intelligence/page.tsx`
- [ ] Sistema de abas (4 abas contextuais):
  - **Aba 1: Público & Tom** (5 campos: brand_voice, target_audience, seasonal_peaks, main_differentiation, top_products)
  - **Aba 2: Posicionamento** (5 campos: price_positioning, average_ticket_brl, competitors, unique_selling_proposition, customer_pain_points)
  - **Aba 3: Conversão** (3 campos: conversion_triggers, successful_past_ctas, local_events_calendar)
  - **Aba 4: Avançado (opcional)** (2 campos: language_specifics, copy_length_preferences)
- [ ] Progress indicator (X/15 campos preenchidos)
- [ ] Intelligence Score (0-100) com badge
- [ ] Auto-save (PATCH `/api/store/intelligence`)
- [ ] Link no dashboard: "⚡ Calibrar IA"

**Critério de sucesso:** 30%+ lojistas acessam página, média 8+ campos preenchidos

---

### Sprint 2: Geração de Logo com IA (Opcional - 1 semana)
**Objetivo:** Adicionar geração de logo via IA como alternativa ao upload

**Entregas:**
- [ ] API POST `/api/onboarding/logo/generate` (Replicate API ou Hugging Face)
- [ ] Modal de geração: input prompt + 3 opções
- [ ] Integração no componente de upload existente (botão "Gerar com IA")

**Critério de sucesso:** 20%+ lojistas usam geração IA

**⚠️ Dependência:** Decisão sobre custo de API (Replicate vs alternativas free)

---

## ✅ Próximos Passos Imediatos

### 1. Validação Estratégica (Esta Semana)
- [ ] **@pm / @po:** Validar estrutura de 8 campos (Fase 1) + 15 campos (Fase 2)
- [ ] **@pm:** Decidir priorização de sprints (Fase 1 → Geração IA? → Fase 2)
- [ ] **@architect:** Revisar APIs propostas, definir stack (Replicate vs alternatives)

### 2. Prototipação Visual (Próxima Semana)
- [ ] **@ux-design-expert (Uma):** Criar protótipo interativo no Figma (opcional)
- [ ] **@dev:** Review técnico dos wireframes e guia de implementação
- [ ] **@qa:** Preparar cenários de teste de usabilidade

### 3. Implementação Sprint 1 (Semana 3-4)
- [ ] **@dev:** Implementar Fase 1 (4 telas, 8 campos)
- [ ] **@architect:** Setup Supabase Storage bucket `store-logos`
- [ ] **@devops:** Deploy em staging para testes internos

### 4. Teste de Usabilidade (Semana 5)
- [ ] **@qa:** Testar com 3-5 lojistas reais (perfil 45-55 anos)
- [ ] **@pm:** Coletar feedback e ajustar backlog
- [ ] **@dev:** Iteração baseada em feedback

---

## 📞 Contato

**Dúvidas sobre UX/Design?**  
→ @ux-design-expert (Uma)

**Dúvidas sobre implementação técnica?**  
→ @dev (Dex) + @architect (Aria)

**Dúvidas sobre priorização de features?**  
→ @pm (Morgan) + @po (Pax)

**Dúvidas sobre validação de qualidade?**  
→ @qa (Quinn)

---

## 📚 Referências Externas

### UX Best Practices
- [Nielsen Norman Group — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [Baymard Institute — Form Usability](https://baymard.com/blog/checkout-flow-average-form-fields)
- [Google Material Design — Mobile Touch Targets](https://m3.material.io/foundations/interaction/gestures/touch-targets)

### Technical References
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Replicate API — Stable Diffusion](https://replicate.com/stability-ai/sdxl)
- [Vibrant.js — Color Extraction](https://github.com/Vibrant-Colors/node-vibrant)
- [Zod — Schema Validation](https://zod.dev/)

---

**📚 Índice criado por:** @ux-design-expert (Uma)  
**📅 Data:** 2026-04-30  
**🚀 Status:** Documentação completa e pronta para kickoff
