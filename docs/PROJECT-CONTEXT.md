# Vendeo — Project Context (Session Bootstrap)

**Última Atualização:** 2026-04-30 por @aiox-master  
**Propósito:** Contexto obrigatório para @aiox-master no início de cada sessão

---

## 🎯 O QUE É O VENDEO

Motor de vendas social para varejo físico (adegas, farmácias, moda, beauty, home/decor). Gera campanhas de marketing profissionais em 2-5 minutos via IA. **Objetivo:** Aumentar vendas do lojista através de conteúdo social consistente e conversível. **Segmento piloto:** Adegas/Mercearias (60k lojas Brasil, score 8.6/10). **Missão:** Fazer lojistas venderem mais, não apenas "fazerem posts bonitos".

---

## 📍 ONDE ESTAMOS AGORA

**Fase:** Beta/Pré-lançamento — Consolidação Arquitetural  
**Status Técnico:** Phase 0 + Phase 1 + Phase 2.0 + Phase 2.1 DEPLOYED ✅ (30/04/2026)  
**Último Milestone:** Marketing Intelligence Layer expandida — 15 campos críticos + importantes deployados

**3 Gaps Críticos Identificados:**
1. **Marketing Intelligence Layer** (em implementação) — Phase 2 Híbrida aprovada
2. **Conversion Science / Agency Principles** (planejado) — Após Phase 2.0
3. **Conteúdo Unidimensional** (planejado) — Weekly Plan contextualizado

**Squad Marketing Completo:** 5 agentes especializados criados
- @commerce-strategist (Especialista em Varejo) — Contexto comercial, sazonalidade
- @brand-designer (Palette) — Identidade visual, reconhecimento de marca
- @content-copy (Lyric) — Copy que converte, CTAs por segmento
- @prompt-eng (Wordsmith) — Otimização de prompts IA
- @ux-design-expert (Uma) — UX para lojista (tempo até campanha ≤5 min)

**Validação de Campos:** Squad Marketing revisou e validou 31 campos críticos/importantes para Phase 2

---

## 🎯 PARA ONDE VAMOS

**Próximo Objetivo:** Phase 2.2 — Governança + Agregações (+2 semanas)  
**Prioridade 1:** @ux-design-expert entrega designs de modais de onboarding progressivo  
**Prioridade 2:** @data-engineer implementa migrations 036-039 (JSON Schema validation, agregações)  
**Prioridade 3:** Backend integration (Phase 4) — integrar store_intelligence.context nos prompts  
**Meta de Impacto:** LTV +200-300% (de R$ 200-300 para R$ 900-1.200) via intelligence-driven campaigns

**Abordagem:** Phase 2 Híbrida (Opção C)
- **Phase 2.0 (1 dia):** 5 campos críticos mínimos
- **Phase 2.1 (+1 semana):** 10 campos importantes
- **Phase 2.2 (+2 semanas):** Governança + otimização

**Razão:** Deploy rápido + validação iterativa + risco distribuído. Lojistas churnam em 2-3 semanas porque campanhas não geram vendas. Com intelligence + conversion science incremental, taxa de conversão sobe de 2-3% para 8-12% progressivamente.

---

## 🚧 BLOCKERS ATIVOS

Nenhum blocker ativo. Pronto para Phase 2.

---

## 📚 DECISÕES RECENTES (Últimas 5)

1. **[DEC-2026-04-30-004]** - Phase 2.1 deployada com sucesso (migrations 034-035, 9/9 validações OK)
2. **[DEC-2026-04-30-003]** - Phase 2.0 deployada com sucesso (migrations 031-033, 11/11 validações OK)
3. **[DEC-2026-04-30-002]** - Phase 2 Híbrida aprovada (Opção C: 2.0 → 2.1 → 2.2 incremental) ✅ EXECUTED
4. **[DEC-2026-04-30-001]** - Phase 1 documentada como concluída (reconciliação schema.sql executada em 29/04)
3. **[DEC-2026-04-29-003]** - Migrations 017-030 reconstituídas (Phase 0 VERDADEIRAMENTE concluída)
4. **[DEC-2026-04-29-002]** - Sistema de navegação bússola criado (CRITICAL-FLOWS, INTEGRATION-CHECKLIST, PROJECT-CONTEXT)
5. **[DEC-2026-04-29-001]** - Squad Marketing completo definido (5 agentes)

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

Nenhuma questão pendente.
- ✅ Migrations 002-030 no repositório remoto
- ✅ CAPABILITIES-INVENTORY.md = bússola anti-duplicação
- ✅ AIOX-MASTER-PROTOCOL.md = guia de decisões (+ protocolo de fechamento adicionado)
- ✅ Phase 2 com decisões aprovadas (design-decisions.md)
- ⚠️ Arquitetura-alvo v2 desatualizada (usar com cautela)
