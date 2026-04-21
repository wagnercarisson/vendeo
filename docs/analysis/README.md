# Documentos de Análise — Vendeo

Este diretório contém análises técnicas, decisões arquiteturais e pareceres de integração do projeto Vendeo.

---

## 📋 Índice de Documentos

### 🔴 CRÍTICOS (Leitura Obrigatória)

| Documento | Data | Status | Descrição |
|-----------|------|--------|-----------|
| [WEEKLY-PLAN-MOTOR-VISUAL-INTEGRACAO.md](./WEEKLY-PLAN-MOTOR-VISUAL-INTEGRACAO.md) | 2026-04-18 | ✅ Aprovado | **Decisão executiva:** Integração Weekly Plan × Motor Visual v2.0. Modelo aprovado (4 variações, modo auto-preferida, herança theme/brief), implementação adiada até Motor v2.0 estável. **CONSULTA OBRIGATÓRIA antes de implementar Story 4.9.** |

### 📄 Documentos de Suporte

| Documento | Descrição |
|-----------|-----------|
| [DECISION-SUMMARY.md](./DECISION-SUMMARY.md) | Sumário executivo de 1 página (referência rápida para issues/PRs) |
| [DECISION-DIAGRAM.md](./DECISION-DIAGRAM.md) | Diagramas visuais da decisão (fluxo de integração, sequência, herança) |
| [STORY-4.9-CHECKLIST.md](./STORY-4.9-CHECKLIST.md) | Checklist completo de implementação (pré-requisitos, spike, desenvolvimento, testes, validação) |

---

## 🎯 Como Usar Este Diretório

### Para Desenvolvedores
Antes de implementar features relacionadas a:
- **Weekly Plan** → Ler `WEEKLY-PLAN-MOTOR-VISUAL-INTEGRACAO.md`
- **Motor Visual v2.0** → Verificar se integração com Weekly Plan está mapeada

### Para Product Managers
Ao criar stories relacionadas a:
- **Weekly Plan (Story 4.9)** → Usar checklist em `WEEKLY-PLAN-MOTOR-VISUAL-INTEGRACAO.md`
- **Priorização de roadmap** → Consultar sequência aprovada (Campanhas → Pricing → Weekly Plan)

### Para Arquitetos
Ao tomar decisões sobre:
- **Integração entre módulos** → Verificar se há documento de análise
- **Mudanças em schemas** → Verificar impacto em integrações futuras

---

## 📁 Estrutura de Documentos de Análise

### Quando Criar um Documento de Análise

Crie documento neste diretório quando:
- Houver decisão arquitetural importante (ex: integração entre 2 módulos complexos)
- Houver bloqueador crítico que exija análise formal
- Houver priorização que impacte múltiplas features
- Houver parecer técnico de múltiplos agentes (@pm, @architect, @analyst)

### Modelo de Documento

```markdown
# [Título da Análise]

**Data de Decisão:** YYYY-MM-DD
**Aprovado por:** [Nome do decisor]
**Participantes:** [Agentes/pessoas envolvidas]
**Status:** [Aprovado / Em Análise / Implementado / Descontinuado]

---

## 🎯 RESUMO EXECUTIVO
[Decisão principal em 2-3 parágrafos]

## 📋 CONTEXTO DO PROBLEMA
[Situação que motivou a análise]

## ✅ DECISÕES APROVADAS
[Lista de decisões com justificativas]

## 🏗️ ARQUITETURA / IMPLEMENTAÇÃO
[Detalhes técnicos se aplicável]

## 🎯 PRIORIZAÇÃO
[Sequência de desenvolvimento se aplicável]

## ⚠️ RISCOS E MITIGAÇÕES
[Tabela de riscos]

## 📚 REFERÊNCIAS
[Links para outros documentos]

## 📋 CHECKLIST DE IMPLEMENTAÇÃO
[Se aplicável - passos para executar decisão]

## ✍️ ASSINATURAS
[Aprovações formais]
```

---

## 🔗 Documentos Relacionados

- [ROADMAP.md](../../ROADMAP.md) — Estratégia de produto e decisões de roadmap
- [PROXIMOS-PASSOS.md](../PROXIMOS-PASSOS.md) — Próximas ações no desenvolvimento
- [CAMPAIGN_FLOW_RULES.md](../CAMPAIGN_FLOW_RULES.md) — Regras de comportamento de campanhas

---

## 📝 Histórico de Análises

| Data | Análise | Decisão | Implementado? |
|------|---------|---------|---------------|
| 2026-04-18 | Weekly Plan × Motor Visual v2.0 | Aprovado modelo, implementação adiada | ⏸️ Aguardando Motor v2.0 |

---

**Última atualização:** 2026-04-20  
**Mantido por:** @aiox-master, @pm, @architect
