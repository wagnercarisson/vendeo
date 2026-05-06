# Vendeo — Project Context (Session Bootstrap)

**Última Atualização:** 2026-05-06 por @aiox-master  
**Propósito:** Contexto obrigatório para @aiox-master no início de cada sessão

---

## 🎯 O QUE É O VENDEO

Motor de vendas social para varejo físico (adegas, farmácias, moda, beauty, home/decor). Gera campanhas de marketing profissionais em 2-5 minutos via IA. **Objetivo:** Aumentar vendas do lojista através de conteúdo social consistente e conversível. **Segmento piloto:** Adegas/Mercearias (60k lojas Brasil, score 8.6/10). **Missão:** Fazer lojistas venderem mais, não apenas "fazerem posts bonitos".

---

## 📍 ONDE ESTAMOS AGORA

**Fase:** Beta/Pré-lançamento — Backend Integration (Phase 2.3B + Subsegmentação)  
**Status Técnico:** Phase 2.2 DEPLOYED ✅ + Phase 2.3B IN PROGRESS (60% completo)  
**Último Milestone:** DEC-2026-05-06-002 APPROVED — Subsegmentação implementação aprovada

**Phase 2.3B Progress (Context Layering System):**
- ✅ **B1-B3:** Context Builder completo (L1/L2/L3 assembly, 9/9 tests passing)
- ✅ **B4:** Prompt Renderer completo (L1/L2/L3 integration, 8/8 tests passing, JSDoc completo)
- ✅ **B5:** Registry Loader completo (YAML loading, caching, type guards, 10/10 tests passing)
- ✅ **B7/B8:** Endpoint Integration + Feature Flags COMPLETE (21/21 tests passing, fallback validated)
- 🟡 **BLOCKER IDENTIFICADO:** Segment normalization gap (UI "Loja de bebidas" → DB → Registry "bebidas_alcoolicas")
- 🎯 **PRÓXIMO:** Resolver normalização de segmentos (3 estratégias propostas) + B10 Logging

**3 Gaps Críticos Identificados:**
1. **Marketing Intelligence Layer** (COMPLETO) — Phase 2.1 deployed + 2.2 deployed
2. **Conversion Science / Agency Principles** (EM PROGRESSÃO) — Context Layering System 60% completo + Subsegmentação aprovada
3. **Conteúdo Unidimensional** (EM PROGRESSÃO) — Subsegmentação hierárquica (Sprint 1-3 definido)

**Trabalho Concluído (01-02/05/2026):**
- ✅ **Intelligence UX Refinements** — 8 melhorias implementadas (máscaras BRL, campos guiados, hints)
- ✅ **Intelligence Critical Fixes (02/05)** — 3 fixes UX críticos + limit enforcement (autosave navegação, pain points UX, guidance)
- ✅ **Logo IA Optimization Sprint 1** — v2 prompts + A/B testing infrastructure completo
- ✅ **Intelligence Mobile Support** — Story 2B (8 de 10 ACs completos)
- ✅ **Navigation Integration** — Intelligence integrada no dashboard flow
- ✅ **Documentação Estratégica** — Marketing Squad + análises commitadas
- ✅ **Protocolo AIOX-MASTER atualizado** — FASE 6 (CLOSURE & HANDOFF) adicionada

**Squad Marketing Completo:** 5 agentes especializados criados
- @commerce-strategist (Especialista em Varejo) — Contexto comercial, sazonalidade
- @brand-designer (Palette) — Identidade visual, reconhecimento de marca
- @content-copy (Lyric) — Copy que converte, CTAs por segmento
- @prompt-eng (Wordsmith) — Otimização de prompts IA
- @ux-design-expert (Uma) — UX para lojista (tempo até campanha ≤5 min)

**Validação de Campos:** Squad Marketing revisou e validou 31 campos críticos/importantes para Phase 2

---

## 🎯 PARA ONDE VAMOS

**Próximo Objetivo:** Implementar Subsegmentação (DEC-2026-05-06-002)  
**Sprint 1 (12h):** Migration 042 + 10 Registry Variants + Onboarding UI hierárquico  
**Sprint 2 (40h):** Visual Composer System (style-resolver + layout-composer + variation-generator)  
**Sprint 3 (16h, opcional):** Learned Patterns tracking por subsegmento  
**Blocker Crítico:** Migration 042 (category/subcategory columns) — Bloqueia tudo  
**Meta de Impacto:** CTR +30-37%, LTV +200-300% (R$ 200-300 → R$ 900-1.200), ROI 14×

**Estratégia:** Context Layering System (L1/L2/L3)
- **L1 (Store Metadata):** 100% disponível (nome, segmento, localização)
- **L2 (Intelligence Calibrada):** 0-100% disponível (threshold-based: score >= 30)
- **L3 (Profissional Agêntico):** 100% disponível (segment + regional experts)

**Razão:** Campanhas genéricas não convertem. Com L1+L2+L3, mesmo lojas sem calibração (score=0) recebem conteúdo contextualizado via L1+L3 (70% qualidade baseline). Com calibração, qualidade sobe para 95% (L1+L2+L3).

---

## 🚧 BLOCKERS ATIVOS

**Blocker 1:** Migration 042 (DB Schema category/subcategory) — 🔴 CRÍTICO  
**Blocker 2:** Registry Variants (10 YAML files) — 🟡 ALTO  
**Blocker 3:** Visual Composer System (40h implementation) — 🟡 MÉDIO  
**Blocker 4:** Onboarding UI Refactor (dropdown hierárquico) — 🟢 BAIXO

---

## 📚 DECISÕES RECENTES (Últimas 10)

1. **[DEC-2026-05-06-002]** - Subsegmentação APROVADA: Implementação hierárquica (category + subcategory) em 3 sprints; Migration 042 + 10 Registry Variants + Visual Composer; ROI 14× (CTR +30-37%, perde 5% onboarding); Validado por @commerce-strategist (Mercer) e @analyst (Alex)
2. **[DEC-2026-05-05-003]** - Phase 2.3B (B8) completo: Endpoint integration com feature flag, fallback automático, logging; 21/21 tests passing; **Blocker identificado:** Segment normalization gap (UI labels não mapeiam diretamente para registry slugs)
3. **[DEC-2026-05-05-002]** - Testes manuais B8 revelaram: (1) Fallback funciona perfeitamente para regiões não suportadas (Rio do Sul, SC), (2) "Loja de bebidas" no UI não mapeia para "bebidas_alcoolicas" no registry, (3) Proposta de 3 estratégias progressivas para normalização
4. **[DEC-2026-05-05-001]** - Phase 2.3B (B4) completo: Prompt Renderer aprovado com JSDoc completa, 8/8 tests passing; B6 (Token Optimizer) pulado por ser otimização prematura
5. **[DEC-2026-05-03-001]** - Phase 2.2 confirmada como próximo milestone (governance + aggregations); Logo Sprint 2 adiado (não-bloqueante em localhost)
6. **[DEC-2026-05-02-003]** - Hints dinâmicos aprovados: educação progressiva > tooltips (reduz fricção cognitiva, acessível)
4. **[DEC-2026-05-02-002]** - Pain points limit enforcement: isOptionDisabled pattern + removable cards (solução generalizada, feedback visual claro)
5. **[DEC-2026-05-02-001]** - Autosave strategy: event listeners (beforeunload, visibilitychange, popstate, click) + fetch keepalive (sendBeacon incompatível com application/json)
6. **[DEC-2026-05-01-003]** - Git workflow modificado: usuário assume controle de commits/push (após incidente com git stash)
7. **[DEC-2026-05-01-002]** - Intelligence UX: guided selections aprovado como padrão (vs free text fields)
8. **[DEC-2026-05-01-001]** - Logo v2 prompts ready for A/B testing (6 vulnerabilidades corrigidas)
9. **[DEC-2026-04-30-004]** - Phase 2.1 deployada com sucesso (migrations 034-035, 9/9 validações OK)

## 🔗 NAVEGAÇÃO RÁPIDA

**Arquitetura:**
- `docs/architecture/arquitetura-alvo-vendeo-v2.md` — Bounded contexts, contratos (versão antiga, somente para referência até que seja criada uma versão atulizada)
- `docs/architecture/design-decisions.md` — Decisões técnicas (marketing intelligence)

**Análises Estratégicas:**
- `docs/analysis/critical-product-evaluation-lojista.md` — 3 gaps críticos identificados
- `docs/analysis/segments-strategic-analysis.md` — Priorização de segmentos
- `docs/analysis/brand-recognition-science.md` — Neurociência de reconhecimento
- `docs/analysis/BRAND-RECOGNITION-RESEARCH-STRATEGY-2026-04-28.md` — Estratégia de pesquisa
- `docs/analysis/LOGO-GENERATION-STRATEGY-AND-INSIGHTS-2026-04-28.md` — Insights de geração
- `docs/analysis/SEGMENT-STRATEGIC-ANALYSIS-COMPREHENSIVE-2026-04-28.md` — Análise completa
- `docs/analysis/SEGMENT-VIABILITY-ANALYSIS-2026-04-28.md` — Viabilidade de segmentos
- `docs/analysis/VENDEO-CRITICAL-EVALUATION-LOJISTA-PERSPECTIVE-2026-04-28.md` — Perspectiva lojista

**Squad Marketing:**
- `docs/marketing/MARKETING-SQUAD-AIOX.md` — Definições completas dos 5 agentes
- `docs/marketing/MARKETING-SQUAD-EXECUTIVE-SUMMARY.md` — Síntese executiva
- `docs/marketing/MARKETING-SQUAD-TECHNICAL-INTEGRATION.md` — Integração técnica detalhada
- `docs/marketing/START-HERE-MARKETING-SQUAD.md` — Guia de início

**Protocolos:**
- `docs/AIOX-MASTER-PROTOCOL.md` — Protocolo pré-flight (5 fases obrigatórias)
- `docs/PROJECT-CONSTITUTION.md` — Regras inegociáveis do projeto
- `docs/PRE-DECISION-PROTOCOL.md` — Protocolo de decisões

**Capabilities (Bússola):**
- `docs/CRITICAL-FLOWS.md` — Fluxos que NÃO PODEM regredir
- `docs/INTEGRATION-CHECKLIST.md` — Checklist mandatório de integração
- `docs/CAPABILITIES-INVENTORY.md` — Inventário técnico completo por bounded context

**Padrões:**
- `docs/architecture/git-standards.md` — Padrão oficial de commits (PT-BR)

---

## 📋 RESUMO DA SESSÃO ATUAL (01/05/2026)

### ✅ Conquistas do Dia

1. **Intelligence UX Refinements COMPLETE**
   - 8 melhorias implementadas (máscaras BRL, campos guiados, CTAs simplificados)
   - 3 documentos UX criados (1.907 linhas totais)
   - Métricas esperadas: preenchimento 60%→95%, tempo 5min→2min

2. **Intelligence Mobile Support (Story 2B)**
   - Swipe gestures, retry logic, offline detection
   - A11Y enhancements, keyboard navigation
   - 6 unit tests criados
   - 8 de 10 ACs completos

3. **Logo IA Optimization Sprint 1 COMPLETE**
   - logo-prompts-v2.ts criado (598 linhas)
   - 6 vulnerabilidades corrigidas
   - A/B testing infrastructure completa
   - 8 documentos criados (2.647 linhas)
   - Ready for testing (target: 70%+ approval)

4. **V1/V2 Prompt Switching**
   - Dual import system implementado
   - Env var + request param support
   - Backward compatible (default v1)

5. **Navigation Integration**
   - Intelligence integrada no dashboard flow
   - Sidebar limpo (-285 linhas)

6. **Documentação Realinhada**
   - Marketing Squad documentação commitada
   - 5 análises estratégicas (28/04) commitadas
   - PRE-DECISION-PROTOCOL commitado
   - visual-composer e qa/ artifacts commitados

7. **Git Standards Estabelecido**
   - `docs/architecture/git-standards.md` criado
   - Formato oficial: `[tipo]: descrição`
   - Idioma: PT-BR
   - Changelog público: apenas impacto visível

8. **Session Closure Document**
   - Fechamento completo documentado
   - Lições aprendidas registradas
   - Próximos passos claros

### ➡️ Próximos Passos (Retomada Amanhã)

**Prioridade 1: Logo A/B Testing**
- Executar `logo-ab-test.ts` com 9 segmentos
- Comparar v1 vs v2 vs Flux
- Decisão de deploy baseada em approval rate

**Prioridade 2: Intelligence Guided Selections**
- Implementar proposta de campos guiados
- Transformar 5 campos texto livre em seleções
- Medir taxa de preenchimento

**Prioridade 3: Phase 2.2 Planning**
- @data-engineer: migrations 036-039 (governança)
- JSON Schema validation
- Agregações de intelligence score

### 🚨 Lições Aprendidas

**Git Workflow Change (CRÍTICO):**
- Agentes NÃO executam git operations sem autorização
- Usuário assume controle de commits/push
- Nunca usar `git stash` sem necessidade absoluta
- **Regra:** Agentes documentam, usuário commita

### 📊 Métricas da Sessão

- Commits criados: 8
- Linhas adicionadas: ~7.500
- Arquivos modificados: 28
- Arquivos criados: 25+
- Documentação: 15 arquivos
- Testes: 9
- Duração: ~6 horas

---

**Session closure:** `docs/sessions/session-2026-05-01-closure.md`

---

## 📋 RESUMO DA SESSÃO ATUAL (05/05/2026 23:45)

### ✅ Conquistas do Dia

1. **B8 - Endpoint Integration COMPLETE ✅**
   - Implementação: `prompt-resolution.ts` (95 lines, 4/4 tests)
   - Integration: `service.ts` com fallback automático + logging
   - Deprecation: `buildCampaignPrompt` → `buildCampaignPromptLegacy`
   - Feature flag: `USE_CONTEXT_LAYERING_PROMPT` em `feature-flags.ts`
   - 21/21 tests passing (8 renderer + 9 context + 4 service)
   - Quality Score: 9/10

2. **Testes Manuais**
   - ✅ Fallback automático funciona (Rio do Sul, SC → legacy-fallback)
   - ✅ Fallback automático funciona (segment unmapped → legacy-fallback)
   - ⚠️ Next.js image config issue fixed (emporiodifiori.com.br)

3. **BLOCKER IDENTIFICADO: Segment Normalization Gap**
   - UI labels ("Loja de bebidas") não mapeiam para registry slugs ("bebidas_alcoolicas")
   - 3 estratégias propostas (dicionário, registry hierárquico, DB enum)
   - Discussão pausada — aguarda retorno do usuário

### 📊 Progresso Phase 2.3
- **Phase 2.3A:** 85% complete (6/10 tasks)
- **Phase 2.3B:** 60% complete (6/10 tasks) — B1-B5, B7-B8 done
- **Overall:** ~45% complete

### 🚧 Bloqueio Ativo
**BLOCK-001: Segment Normalization Gap**
- **Severity:** 🟡 MÉDIO (workaround disponível)
- **Impact:** Testes E2E bloqueados, UX degradada
- **Proposta:** 3 estratégias progressivas documentadas
- **Decisão:** PENDENTE (usuário solicitou discussão após retorno)
- **Doc:** [docs/sessions/2026-05-05-segment-normalization-discussion.md](docs/sessions/2026-05-05-segment-normalization-discussion.md)

### ➡️ Próximos Passos (Retomada)

**IMEDIATO (ao retornar):**
1. Decidir estratégia de normalização (15min se Estratégia 1)
2. Implementar solução escolhida
3. Testes E2E completos (score < 30, score >= 30)
4. Marcar B8 como VALIDATED no tracker

**PRÓXIMOS MILESTONES:**
- B10: Logging & Observability (dashboard de métricas)
- Phase 2.3C: Validation (A/B testing, LTV projection)

---

**Session closure:** `docs/sessions/2026-05-05-segment-normalization-discussion.md`
- Implementar buildCampaignPrompt() function body
- Assemblar XML structure com L1/L2/L3 formatters
- Owner: @dev | Estimativa: 2 dias
- **BLOQUEANDO:** B8 (API Integration)

### 🎯 Estado para Retomada
- ✅ 19/19 tests passing (10 loader + 9 context-builder)
- ✅ Zero TypeScript compilation errors
- ✅ Test runner compatibility resolved
- ✅ Git: 10 commits ahead of origin/main
- ⚠️ B4 é próximo blocker crítico (desbloqueia B8)

### 📊 Métricas da Sessão
- Commits criados: 7
- Linhas adicionadas: ~1.200
- Arquivos novos: 5 (types.ts, loader.ts+test, context-builder.ts+test)
- Arquivos modificados: 3 (tsconfig, prompt template, tracker)
- Tests: 19/19 passing (100%)
- Duração: ~4 horas

---

**Session closure:** Registrado em `AIOX-MASTER-PROTOCOL.md` (Histórico de Sessões)
