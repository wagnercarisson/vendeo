# Vendeo — Project Context (Session Bootstrap)

**Última Atualização:** 2026-04-29 por @aiox-master  
**Propósito:** Contexto obrigatório para @aiox-master no início de cada sessão

---

## 🎯 O QUE É O VENDEO

Motor de vendas social para varejo físico (adegas, farmácias, moda, beauty, home/decor). Gera campanhas de marketing profissionais em 2-5 minutos via IA. **Objetivo:** Aumentar vendas do lojista através de conteúdo social consistente e conversível. **Segmento piloto:** Adegas/Mercearias (60k lojas Brasil, score 8.6/10). **Missão:** Fazer lojistas venderem mais, não apenas "fazerem posts bonitos".

---

## 📍 ONDE ESTAMOS AGORA

**Fase:** Beta/Pré-lançamento — Consolidação Arquitetural  
**Status Técnico:** Motor Visual (Motor 3) funciona, schema drift resolvido (Phase 0 concluída)  
**Último Milestone:** Análise de gaps críticos completa (28/04/2026) + Squad Marketing definido (28/04/2026)

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

Nenhum blocker técnico identificado atualmente.

---

## 📚 DECISÕES RECENTES (Últimas 5)

1. **[DEC-2026-04-29-001]** - Squad Marketing completo definido (5 agentes)
2. **[DEC-2026-04-28-002]** - Análise de gaps críticos aprovada
3. **[DEC-2026-04-28-001]** - Segmento piloto confirmado (Adegas 8.6/10)
4. **[DEC-2026-04-22-002]** - Schema drift resolvido (Phase 0)
5. **[DEC-2026-04-22-001]** - Protocolo AIOX-MASTER-PROTOCOL.md criado

---

## 🔗 NAVEGAÇÃO RÁPIDA

**Arquitetura:**
- `docs/architecture/arquitetura-alvo-vendeo-v2.md` — Bounded contexts, contratos
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
- `docs/CAPABILITIES-INVENTORY.md` — Inventário técnico completo
- `docs/CRITICAL-FLOWS.md` — Fluxos que NÃO PODEM regredir
- `docs/INTEGRATION-CHECKLIST.md` — Checklist mandatório de integração
