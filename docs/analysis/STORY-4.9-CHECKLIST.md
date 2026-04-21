# Story 4.9 — Checklist de Implementação

**Título:** Integração Weekly Plan × Motor Visual v2.0  
**Status:** 📋 BACKLOG (não sprint atual)  
**Pré-requisito:** Motor Visual v2.0 100% estável (Stories 4.1-4.8 completas)

---

## ⚠️ VALIDAÇÃO DE PRÉ-REQUISITOS

Antes de iniciar Story 4.9, validar:

### Fase 1 Completa
- [ ] Stories 4.1-4.8 (Motor Visual v2.0) finalizadas
- [ ] 4 Motores funcionando (Visual Reader, Intent Resolver, Composer, Renderer)
- [ ] Visual Signature implementada e testada
- [ ] Sistema de variações funcionando (3-6 opções por campanha)
- [ ] Testes de integração passando (100%)

### Validação em Produção (2 semanas)
- [ ] Dados de `preferred_composition` coletados (histórico de aprovações)
- [ ] Taxa de aprovação por tipo de composição medida
- [ ] Feedback sobre Visual Signature coletado (reconhecimento de identidade)
- [ ] Theme inheritance testado em campanhas sazonais (Natal, Black Friday, etc)
- [ ] Padrões de uso documentados (dias preferidos, horários, frequência)

### Pricing Implementado
- [ ] Sistema de planos ativo (Free, Basic, Pro)
- [ ] Limites de geração por plano funcionando
- [ ] Weekly Plan definido como feature Basic+ (não Free)
- [ ] Checkout/pagamento testado

### Dados Necessários Disponíveis
- [ ] Histórico de composições aprovadas (mínimo 50 campanhas)
- [ ] Visual Signatures calibradas (cores, logos, tipografia)
- [ ] Context profiles testados (standard, promotional, seasonal, premium, urgency)
- [ ] Themes pré-definidos (Natal, Black Friday, Páscoa, etc) validados

---

## 📋 SPIKE TÉCNICO (ANTES DE DESENVOLVER)

### Validação de Custo e Performance
- [ ] Testar geração de 4 planos em 1 chamada IA
  - [ ] Medir custo (comparar com 4 chamadas separadas)
  - [ ] Medir latência (target: < 15 segundos)
  - [ ] Validar qualidade (4 planos realmente diferentes e úteis?)
  - [ ] Testar paralelização (se possível)
- [ ] Resultado do spike documentado
- [ ] Decisão GO/NO-GO tomada

---

## 🎨 UX/UI DESIGN

### Wireframes Necessários
- [ ] **Passo 2 do Wizard** (Estratégia):
  - [ ] Layout de 4 cards de planos
  - [ ] Preview de cada plano (dias, content_type, themes)
  - [ ] Interação de seleção
  - [ ] Estados (loading, selecionado, hover)
- [ ] **Passo 3 do Wizard** (Execução):
  - [ ] Lista de dias do plano aprovado
  - [ ] Botão "Gerar campanha" por dia
  - [ ] Modal de geração (loading + preview)
- [ ] **Modo Auto-Preferida**:
  - [ ] Campanha gerada com 1 variação
  - [ ] Botões "Aprovar" / "Ver mais opções"
  - [ ] Estado de loading (gerando +3 variações)
- [ ] **Tela de Campanha** (herança do plano):
  - [ ] Campos herdados (theme, content_type, brief) desabilitados
  - [ ] Badge "Criada do Plano Semanal de [data]"
  - [ ] Link para voltar ao plano

### Aprovações
- [ ] Wireframes revisados por @ux-design-expert
- [ ] Aprovados por @pm
- [ ] Validados com usuários beta (se possível)

---

## 🔧 BACKEND (API)

### Endpoint: `/api/generate/weekly-strategy` (v2)
- [ ] Modificar prompt IA para gerar 4 variações
- [ ] Estruturar resposta como `{ variations: Variation[] }`
- [ ] Paralelizar geração (se viável)
- [ ] Adicionar timeout (max 30s)
- [ ] Tratamento de erro (fallback para 1 plano se IA falhar)
- [ ] Cache de resultados (opcional - validar necessidade)
- [ ] Logging detalhado (custo, latência, qualidade)

### Endpoint: `/api/campaigns/generate-from-plan` (novo)
- [ ] Receber `weekly_plan_item_id` no body
- [ ] Buscar `theme`, `brief`, `content_type` do item
- [ ] Validar ownership (usuário = dono da loja do plano)
- [ ] Chamar Motor Visual com contexto enriquecido
- [ ] Modo `auto_preferred` (1 variação) ou `show_variations` (3-6)
- [ ] Salvar campanha com `weekly_plan_item_id` linkado
- [ ] Retornar campanha + variação(ões)

### Service: `getPreferredComposition(storeId)`
- [ ] Analisar histórico de aprovações (`campaigns` where `store_id` and `status=approved`)
- [ ] Agrupar por tipo de composição (grid, overlay, product-focused, text-heavy, etc)
- [ ] Calcular taxa de aprovação por tipo
- [ ] Retornar composição mais aprovada
- [ ] Fallback: composição padrão do context profile
- [ ] Cache (1 hora - invalidar ao aprovar nova campanha)

### Validações
- [ ] Schema Zod para validar resposta IA (4 variações)
- [ ] Schema Zod para validar herança de campos (theme, brief, content_type)
- [ ] RLS policies (weekly_plan_items só acessíveis pelo dono da loja)
- [ ] Testes unitários (service `getPreferredComposition`)
- [ ] Testes de integração (endpoint completo)

---

## 🖥️ FRONTEND (UI)

### Passo 2 do Wizard (Estratégia)
- [ ] Componente `WeeklyPlanVariations.tsx`
  - [ ] Fetch de 4 variações do endpoint
  - [ ] Renderizar 4 cards com preview
  - [ ] State management (plano selecionado)
  - [ ] Loading state (skeleton)
  - [ ] Error state (retry)
- [ ] Preview de cada plano:
  - [ ] Lista de dias (ex: "Segunda, Quarta, Sexta")
  - [ ] Content types (ex: "3 posts + 2 reels")
  - [ ] Themes destacados (ex: "Natal, Oferta, Lançamento")
- [ ] Salvar plano escolhido em `weekly_plans.strategy`
- [ ] Transição para Passo 3

### Passo 3 do Wizard (Execução)
- [ ] Componente `WeeklyPlanExecution.tsx`
  - [ ] Lista de dias do plano aprovado
  - [ ] Botão "Gerar campanha" por dia
  - [ ] Estado (pendente, gerando, gerada, erro)
- [ ] Modal `CampaignGenerationModal.tsx`:
  - [ ] Loading (gerando campanha)
  - [ ] Preview da variação gerada
  - [ ] Botões "Aprovar" / "Ver mais opções"
- [ ] Modo auto-preferida:
  - [ ] Exibir 1 variação default
  - [ ] Botão "Ver mais opções" → fetch +3 variações
  - [ ] Navegação entre variações (se múltiplas)

### Tela de Campanha (Herança do Plano)
- [ ] Detectar `campaign.weekly_plan_item_id !== null`
- [ ] Buscar dados do item (theme, brief, content_type)
- [ ] Desabilitar campos herdados (visual: opacity 0.6, disabled)
- [ ] Badge "Criada do Plano Semanal de [data]"
- [ ] Link "← Voltar ao plano" (redireciona para Wizard Passo 3)

### States e Validações
- [ ] Loading states (skeleton, spinner)
- [ ] Error states (retry, mensagens claras)
- [ ] Empty states (nenhuma variação retornada)
- [ ] Validações (não permitir avançar sem escolher plano)
- [ ] Confirmações (descartar plano em progresso?)

---

## 🚩 FEATURE FLAGS

### Flags a Criar
- [ ] `WEEKLY_PLAN_VARIATIONS` (4 variações de plano)
- [ ] `WEEKLY_PLAN_AUTO_COMPOSITION` (modo auto-preferida)

### Implementação
- [ ] Adicionar flags em `lib/constants/features.ts`
- [ ] Implementar toggle ON/OFF
- [ ] Lógica de fallback (flag OFF = sistema antigo)
- [ ] Dashboard de controle de flags (admin)
- [ ] Testar rollback (desligar flag restaura sistema antigo)

### Rollout Progressivo
- [ ] FASE A: Ativar para grupo beta (10 lojas)
- [ ] FASE B: Validar por 1 semana
- [ ] FASE C: Expandir para 50% das lojas
- [ ] FASE D: Rollout completo (100%)

---

## ✅ TESTES

### Unit Tests
- [ ] `getPreferredComposition()` retorna composição correta
- [ ] Herança de theme funciona (theme → Intent Resolver)
- [ ] Herança de brief funciona (brief → copywriting)
- [ ] Herança de content_type funciona (post/reels lock)
- [ ] Feature flags funcionam (ON/OFF)

### Integration Tests
- [ ] Endpoint `/api/generate/weekly-strategy` retorna 4 variações válidas
- [ ] Endpoint `/api/campaigns/generate-from-plan` cria campanha com herança correta
- [ ] Modo auto-preferida gera 1 variação
- [ ] Fallback para múltiplas variações funciona (rejeitar → +3)
- [ ] RLS policies bloqueiam acesso entre lojas

### E2E Tests
- [ ] Wizard completo:
  - [ ] Passo 1: Escolher dias
  - [ ] Passo 2: IA gera 4 planos → usuário escolhe
  - [ ] Passo 3: Aprovar plano → executar
- [ ] Gerar campanha de plano:
  - [ ] Clicar "Gerar campanha para Segunda"
  - [ ] Verificar herança de campos (theme, brief, content_type)
  - [ ] Aprovar campanha
  - [ ] Validar persistência
- [ ] Modo auto-preferida:
  - [ ] Campanha gerada mostra 1 variação
  - [ ] Clicar "Ver mais opções" → mostra +3
  - [ ] Escolher variação → aprovar
- [ ] Feature flags:
  - [ ] Desligar `WEEKLY_PLAN_VARIATIONS` → sistema antigo restaurado
  - [ ] Religar → novo sistema ativo

---

## 📚 DOCUMENTAÇÃO

### Docs a Atualizar
- [ ] `CAMPAIGN_FLOW_RULES.md` (adicionar regras de Weekly Plan)
- [ ] `ROADMAP.md` (marcar Story 4.9 como concluída)
- [ ] `docs/analysis/WEEKLY-PLAN-MOTOR-VISUAL-INTEGRACAO.md` (atualizar status)
- [ ] API docs (endpoints `/api/generate/weekly-strategy` v2 e `/api/campaigns/generate-from-plan`)

### Docs a Criar
- [ ] Guia de usuário: "Como usar Weekly Plan com Motor Visual v2.0"
- [ ] Guia técnico: "Arquitetura de Herança (theme/brief → Motor Visual)"
- [ ] Troubleshooting: "Problemas comuns e soluções"

---

## 📊 VALIDAÇÃO PÓS-IMPLEMENTAÇÃO

### Beta Testing
- [ ] Selecionar grupo beta (5-10 lojas ativas)
- [ ] Treinamento: como usar 4 variações + modo auto-preferida
- [ ] Período de teste: 2 semanas
- [ ] Coletar feedback estruturado:
  - [ ] 4 planos são suficientes? Qual costuma escolher?
  - [ ] Modo auto-preferida funciona bem? Taxa de aprovação?
  - [ ] Herança de theme é útil? Contextos bem aplicados?
  - [ ] Campos herdados bloqueados são claros?

### Métricas a Medir
- [ ] Taxa de aprovação de planos (qual variação mais escolhida?)
- [ ] Taxa de aprovação de campanhas auto-preferidas (vs múltiplas variações)
- [ ] Uso de "Ver mais opções" (% de fallback)
- [ ] Tempo médio de criação de plano (vs sistema antigo)
- [ ] Custo de IA (4 planos vs sistema antigo)
- [ ] Latência média (geração de 4 planos)
- [ ] Taxa de erro (falhas na geração)

### Critérios de Sucesso
- [ ] Taxa de aprovação de planos >= 70%
- [ ] Taxa de aprovação auto-preferida >= 60%
- [ ] Fallback para múltiplas variações <= 30%
- [ ] Custo de IA não aumenta mais de 30%
- [ ] Latência < 20 segundos (p95)
- [ ] Taxa de erro < 5%
- [ ] Feedback qualitativo positivo (>= 4/5 estrelas)

### Ajustes Pós-Beta
- [ ] Revisar labels de planos (se confusos)
- [ ] Ajustar algoritmo de preferred_composition (se taxa baixa)
- [ ] Calibrar themes (se mal interpretados)
- [ ] Otimizar latência (se acima de target)
- [ ] Documentar lições aprendidas

---

## ✍️ ASSINATURAS DE CONCLUSÃO

Ao completar todos os itens acima, validar com:

- [ ] **@dev (Dex)** — Implementação completa e testada
- [ ] **@qa (Quinn)** — Todos testes passando, QA gate aprovado
- [ ] **@architect (Aria)** — Arquitetura conforme planejado
- [ ] **@pm (Morgan)** — Acceptance criteria atendidos
- [ ] **@po (Pax)** — Story validada e aprovada

**Aprovação final:** Wagner (Proprietário do Produto)

---

## 📄 REFERÊNCIAS

- [Documento completo de integração](./WEEKLY-PLAN-MOTOR-VISUAL-INTEGRACAO.md)
- [Sumário de decisão (1 página)](./DECISION-SUMMARY.md)
- [CAMPAIGN_FLOW_RULES.md](../CAMPAIGN_FLOW_RULES.md)
- [ROADMAP.md](../../ROADMAP.md)

---

**ESTE CHECKLIST É MANDATÓRIO PARA IMPLEMENTAÇÃO DE STORY 4.9.**

Não pule etapas. Cada validação evita retrabalho e garante qualidade.
