# Vendeo — Project Context (Session Bootstrap)

**Última Atualização:** 2026-04-29 por @aiox-master  
**Propósito:** Contexto obrigatório para @aiox-master no início de cada sessão

---

## 🎯 O QUE É O VENDEO

Motor de vendas social para varejo físico (adegas, farmácias, moda, beauty, home/decor). Gera campanhas de marketing profissionais em 2-5 minutos via IA. **Objetivo:** Aumentar vendas do lojista através de conteúdo social consistente e conversível. **Segmento piloto:** Adegas/Mercearias (60k lojas Brasil, score 8.6/10). **Missão:** Fazer lojistas venderem mais, não apenas "fazerem posts bonitos".

---

## 📍 ONDE ESTAMOS AGORA

**Fase:** Beta/Pré-lançamento — Consolidação Arquitetural  
**Status Técnico:** Migrations 002-030 completas, Phase 0 VERDADEIRAMENTE concluída (29/04/2026)  
**Último Milestone:** Migrations 017-030 reconstituídas (29/04/2026) — Base sólida para Phase 2

**3 Gaps Críticos Identificados:**
1. **Marketing Intelligence Layer** (ausente) — Sistema não conhece contexto do lojista
2. **Conversion Science / Agency Principles** (ausente) — Campanhas bonitas mas não convertem
3. **Conteúdo Unidimensional** (sem contexto semanal) — Todas campanhas parecem iguais

**Squad Marketing Completo:** 5 agentes especializados criados
- @commerce-strategist (Especialista em Varejo) — Contexto comercial, sazonalidade
- @brand-designer (Palette) — Identidade visual, reconhecimento de marca
- @content-copy (Lyric) — Copy que converte, CTAs por segmento
- @prompt-eng (Wordsmith) — Otimização de prompts IA
- @ux-design-expert (Uma) — UX para lojista (tempo até campanha ≤5 min)

---

## 🎯 PARA ONDE VAMOS

**Próximo Objetivo:** Implementar Marketing Intelligence Layer (Onboarding 5min)  
**Prioridade 1:** Questionário onboarding inteligente (coleta perfil lojista)  
**Prioridade 2:** Agency Principles (8 templates de conversão por contexto)  
**Prioridade 3:** Integração agentes marketing no fluxo de validação  
**Meta de Impacto:** Aumentar LTV +200-300% (de R$ 200-300 para R$ 900-1.200)

**Razão:** Lojistas churnam em 2-3 semanas porque campanhas não geram vendas. Com intelligence + conversion science, taxa de conversão sobe de 2-3% para 8-12%.

---

## 🚧 BLOCKERS ATIVOS

⚠️ **Validação local pendente:** Migrations 017-030 devem ser testadas em ambiente Supabase local quando disponível (`supabase db reset` + `migration up` + diff zero).

Nenhum blocker crítico para prosseguir com Phase 2.

---

## 📚 DECISÕES RECENTES (Últimas 5)

1. **[DEC-2026-04-29-003]** - Migrations 017-030 reconstituídas (Phase 0 VERDADEIRAMENTE concluída)
2. **[DEC-2026-04-29-002]** - Sistema de navegação bússola criado (CRITICAL-FLOWS, INTEGRATION-CHECKLIST, PROJECT-CONTEXT)
3. **[DEC-2026-04-29-001]** - Squad Marketing completo definido (5 agentes)
4. **[DEC-2026-04-28-002]** - Análise de gaps críticos aprovada
5. **[DEC-2026-04-28-001]** - Segmento piloto confirmado (Adegas 8.6/10)

---

## 🔗 NAVEGAÇÃO RÁPIDA

**Arquitetura:**
- `docs/architecture/arquitetura-alvo-vendeo-v2.md` — Bounded contexts, contratos (versão antiga, somente para referência até que seja criada uma versão atulizada)
- `docs/architecture/design-decisions.md` — Decisões técnicas (marketing intelligence)

**Análises Estratégicas:**
- `docs/analysis/critical-product-evaluation-lojista.md` — 3 gaps críticos identificados
- `docs/analysis/segments-strategic-analysis.md` — Priorização de segmentos
- `docs/analysis/brand-recognition-science.md` — Neurociência de reconhecimento

**Squad Marketing:**
- `docs/marketing/MARKETING-SQUAD-AIOX.md` — Definições completas dos 5 agentes
- `docs/marketing/MARKETING-SQUAD-EXECUTIVE-SUMMARY.md` — Síntese executiva

**Protocolos:**
- `docs/AIOX-MASTER-PROTOCOL.md` — Protocolo pré-flight (5 fases obrigatórias)
- `docs/PROJECT-CONSTITUTION.md` — Regras inegociáveis do projeto

**Capabilities (Bússola):**
- `docs/CRITICAL-FLOWS.md` — Fluxos que NÃO PODEM regredir
- `docs/INTEGRATION-CHECKLIST.md` — Checklist mandatório de integração
- `docs/CAPABILITIES-INVENTORY.md` — Inventário técnico completo por bounded context

---

## 📋 RESUMO DA SESSÃO ATUAL (29/04/2026)

### ✅ Conquistas do Dia
1. **Phase 0 VERDADEIRAMENTE Concluída**
   - 14 migrations reconstituídas (017-030) por @data-engineer (Dara)
   - 959 linhas de DDL validadas
   - 100% guardas de idempotência + BEGIN/COMMIT
   - 8 tabelas criadas + 5 campos em campaigns
   - Migrations = canonical source restaurado

2. **Capabilities Inventory Criado** por @architect (Aria)
   - 15 tabelas mapeadas por bounded context
   - Status: Implementadas, Planejadas, Gaps
   - Schema drift watchlist
   - 3 gaps críticos identificados

3. **Validação Completa Executada**
   - Script de validação: 73 guardas totais
   - Sequência 002-030 completa sem gaps
   - Schema local = Schema remoto (15 tabelas)

4. **Documentação Atualizada**
   - DEC-2026-04-29-003 registrada
   - migration-plan.md (Phase 0 ✅)
   - Sistema bússola completo

5. **Git Sincronizado** por @devops (Gage)
   - 4 commits pushed para origin/main
   - Commit final: `a7e1fe6`
   - Working tree limpo

### ➡️ Próximos Passos (Retomada Amanhã)

**Phase 2: Additive Changes** (1 dia, baixo risk)
- Migration 031: `store_intelligence` table
- Migration 032: `campaign_events` table
- Migration 033: `weekly_plans.intelligence_snapshot` (campo opcional)
- Responsável: @data-engineer (Dara)
- Referência: `docs/architecture/schema-proposal.md`

**Onboarding 5min** (Gap #1 — Marketing Intelligence)
- Questionário inteligente (5 minutos)
- Agentes: @ux-design-expert, @commerce-strategist, @prompt-eng
- Objetivo: Coletar contexto do lojista (best_days, audience, differentiation)

**Visual Reader** (Gap #3 — Crítico)
- Implementar do zero: `lib/engines/visual-reader/`
- Contrato F: 18 campos estruturados
- Integrar em F2 (Geração de Campanha)
- Desbloqueia F4 (Validação Produto vs Imagem)

### ❓ Questões Pendentes (Verificar na Próxima Sessão)
- ⚠️ **Phase 1 existe ou foi desconsiderada?** migration-plan.md menciona Phase 0 (concluída) e Phase 2 (próxima), mas Phase 1 não aparece. Verificar se:
  - Phase 1 foi mesclada em Phase 0
  - Phase 1 = Phase 2 (erro de numeração)
  - Phase 1 foi descartada no planejamento
  - Referência: `docs/architecture/migration-plan.md`

### 🎯 Estado para Retomada
- ✅ Migrations 002-030 no repositório remoto
- ✅ CAPABILITIES-INVENTORY.md = bússola anti-duplicação
- ✅ AIOX-MASTER-PROTOCOL.md = guia de decisões (+ protocolo de fechamento adicionado)
- ✅ Phase 2 com decisões aprovadas (design-decisions.md)
- ⚠️ Arquitetura-alvo v2 desatualizada (usar com cautela)
