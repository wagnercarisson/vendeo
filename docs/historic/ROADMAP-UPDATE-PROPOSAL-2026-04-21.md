# Proposta de Atualização do ROADMAP.md

**Data:** 21 Abril 2026  
**Baseado em:** Epic 2 completo + Decisões Weekly Plan × Motor Visual

---

## 📋 Mudanças Propostas

### **1. Frente A — Arquitetura de Campanhas (MARCAR COMO CONCLUÍDA)**

**Status atual:** "aprovado para execução"  
**Status proposto:** ✅ **CONCLUÍDO (Epic 2 — Abril 2026)**

**Adicionar seção de conclusão:**

```markdown
### ✅ Status: CONCLUÍDO (Epic 2 — Abril 2026)

Epic 2 implementou 100% da arquitetura de contratos e domínio:

**Entregues (Stories 2.1-2.6):**
- ✅ Schemas Zod (DbCampaignSchema, AICampaignContentSchema)
- ✅ Tipos centralizados (Campaign, ContentType, Objective)
- ✅ Contratos de API (GenerateCampaignRequest/Response, StrategyRequest/Response)
- ✅ Mappers seguros (mapDbCampaignToDomain, mapAiCampaignToDomain)
- ✅ Selectors puros (getCampaignStatus, hasGeneratedContent, etc)
- ✅ Validação ativa em 3 endpoints de produção

**Resultados:**
- 100 testes passando (12+13+15+40+20)
- Zero breaking changes
- Arquitetura `query raw → schema → mapper → domain → view model` ativa
- Endpoints validam request + response AI com safeParse()

**Documentação:** `docs/EXEC-PLAN-EPIC-2.md`
```

---

### **2. Adicionar Frente C — Motor de Composição Visual v2.0**

**Inserir ANTES de "Frente B — Página de campanhas"**

```markdown
## Frente C — Motor de Composição Visual v2.0

Status: 🎯 PRIORIDADE ATUAL (Pós Epic 2)

Objetivo:

Substituir motor de composição atual por arquitetura modular de 3 motores:
- Motor 1 (Visual Reader): Leitura de imagens de produto
- Motor 2 (Intent Resolver): Contexto semântico + preferências
- Motor 3 (Composer): Montagem final com variações

### Decisão Estratégica Aprovada (Abril 2026)

Motor v2.0 será desenvolvido para **campanhas manuais primeiro**.

Integração com Weekly Plan (segundo recurso mais importante) foi **aprovada em design**, mas **adiada em implementação** até Motor v2.0 estar 100% estável em produção.

**Sequência de Desenvolvimento:**
1. ✅ Epic 2: Arquitetura de Campanhas (CONCLUÍDO)
2. 🎯 **Epic 4: Motor Visual v2.0** (ATUAL — Stories 4.1-4.8)
3. ⏭️ Epic 3: Pricing/Monetização
4. 📅 Epic 5: Weekly Plan (Integração - BACKLOG)
5. 📅 Epic 6: Informativo (Terceiro tipo de conteúdo)

**Razão:** Qualquer mudança no Motor Visual v2.0 implicará ajustes no Weekly Plan. Implementar Weekly Plan agora = risco de refatoração dupla.

### Stories 4.1-4.8 (Motor Visual v2.0)

**4.1** - Motor 1: Visual Reader (leitura de produto)
**4.2** - Motor 2: Intent Resolver (contexto semântico)
**4.3** - Motor 3: Composer (montagem com variações)
**4.4** - Geração de variações (3-6 opções por campanha)
**4.5** - Preview e seleção de variação
**4.6** - Visual Signature System (identidade visual da loja)
**4.7** - Context Profiles (standard, promotional, seasonal, premium, urgency)
**4.8** - Integração end-to-end com campanhas manuais

**Meta:** 2 semanas em produção coletando dados reais antes de expandir.

### Integração Futura com Weekly Plan (Story 4.9 — BACKLOG)

**Modelo de Integração Aprovado:**

Weekly Plan gera **4 variações completas** de plano semanal em 1 chamada:
- Plano A: Agressivo (7 posts, alta frequência)
- Plano B: Balanceado (3 posts + 2 reels, mix formatos)
- Plano C: Conservador (3 posts, constância)
- Plano D: Sazonal (5 posts temáticos)

**Herança de Características:**
- `theme` e `brief` do plano → enriquecem Motor 2 (contexto, não restrição)
- `content_type` do plano → hard lock (post/reels/both)
- `Visual Signature` da loja → aplicada em todas variações
- Usuário escolhe variação preferida dentro do contexto definido

**Botão Regenerar:** ❌ Removido (4 variações cobrem espectro de preferências)

**Documentação Completa:** `docs/analysis/WEEKLY-PLAN-MOTOR-VISUAL-INTEGRACAO.md`
```

---

### **3. Atualizar Fase 2 — Pós‑lançamento**

**Status atual:** "planejado"  
**Status proposto:** "planejado (após Epic 4)"

**Adicionar items:**

```markdown
### Melhorias de UX previstas (Fase 2):

• Menu de ações no card (⋯)
• Arquivar campanhas
• Filtros por estratégia
• Pequenos refinamentos de UX

### Expansão de Arquitetura (Fase 2):

• Expansão do padrão de contratos para stores, plans e métricas
• Hardening de APIs com validações compartilhadas
• **Pricing/Monetização (Epic 3)**
  - Planos Free/Basic/Pro
  - Limites de geração por plano
  - Sistema de billing

### Integração Weekly Plan (Fase 2):

• **Story 4.9** — Integração Motor v2.0 × Weekly Plan
• 4 variações de plano semanal completo
• Herança de theme/brief para campanhas
• Planejamento estratégico de content_type
```

---

### **4. Atualizar Fase 3 — Evolução Inteligente**

**Adicionar como primeiro item:**

```markdown
• **Weekly Plan Adaptativo (Basic+)**
  - Sistema aprende preferências de estilo de plano
  - Sugestões de dias/formatos baseadas em histórico
  - Temas sazonais automáticos (Natal, Black Friday, etc)
```

---

### **5. Adicionar Seção de Progresso**

**Inserir após "Fase 1 — Beta"**

```markdown
---

# 📊 Progresso de Implementação

| Epic | Status | Stories | Testes | Conclusão |
|------|--------|---------|--------|-----------|
| Epic 1 | ✅ DONE | 1.1-1.7 | 9/9 ✓ | Março 2026 |
| Epic 2 | ✅ DONE | 2.1-2.6 | 100/100 ✓ | Abril 2026 |
| Epic 4 | 🎯 ATUAL | 4.1-4.8 | - | Em andamento |
| Epic 3 | 📅 PLANEJADO | - | - | Após Epic 4 |
| Epic 5 | 📅 BACKLOG | 4.9 + expansão | - | Após Epic 3 |

**Legenda:**
- ✅ DONE: Implementado, testado e em produção
- 🎯 ATUAL: Em desenvolvimento ativo
- 📅 PLANEJADO: Próxima fase após atual
- 📅 BACKLOG: Arquitetura aprovada, implementação adiada

---
```

---

## 🔄 Resumo das Mudanças

| Seção | Mudança | Tipo |
|-------|---------|------|
| Frente A | Marcar como ✅ CONCLUÍDA | Status |
| Frente C | **NOVA** — Motor Visual v2.0 (prioridade atual) | Adição |
| Fase 2 | Adicionar Epic 3 (Pricing) e Story 4.9 (Weekly Plan) | Expansão |
| Fase 3 | Adicionar Weekly Plan Adaptativo | Adição |
| Progresso | **NOVA** — Tabela de progresso de Epics | Adição |

---

## ✅ Próximos Passos

1. Revisar proposta
2. Aplicar mudanças em ROADMAP.md
3. Commitar atualização
4. Iniciar planejamento Epic 4 (Motor Visual v2.0)

---

**Aguardando aprovação para aplicar mudanças** 🎯
