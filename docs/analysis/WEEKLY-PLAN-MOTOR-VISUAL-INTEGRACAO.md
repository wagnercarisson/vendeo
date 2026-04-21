# Weekly Plan × Motor Visual v2.0 — Integração e Priorização

**Data de Decisão:** 18 de Abril de 2026  
**Aprovado por:** Wagner (Proprietário do Produto)  
**Participantes:** @aiox-master (Orion), @pm (Morgan), @architect (Aria)  
**Status:** ✅ DECISÃO APROVADA — IMPLEMENTAÇÃO ADIADA  

---

## 🎯 RESUMO EXECUTIVO

### Decisão Principal
O **Motor de Composição Visual v2.0** (Stories 4.1-4.8) será desenvolvido prioritariamente para **campanhas manuais**. A integração com **Weekly Plan** (segundo recurso mais importante do produto) foi **aprovada em design**, mas **adiada em implementação** até que o Motor v2.0 esteja 100% estável em produção.

### Razão Estratégica
> "Campanhas = fundação de tudo. Qualquer mudança no Motor Visual v2.0 implicará em ajustes necessários no Weekly Plan. Implementar Weekly Plan agora = risco de refatoração dupla."

### Sequência de Desenvolvimento Aprovada
```
1. CAMPANHAS (Motor Visual v2.0: Arte + Vídeo) — Prioridade Máxima
   └─> Stories 4.1-4.8
   └─> Validação: 2 semanas em produção (coletar dados reais)

2. PRICING (Monetização)
   └─> Planos (Free, Basic, Pro) + limites de geração
   └─> Valida modelo de negócio antes de investir em features complexas

3. WEEKLY PLAN (Integração)
   └─> Story 4.9 — BACKLOG (não sprint atual)
   └─> Feature paga (Basic+)
   └─> Usa dados reais de preferências coletados na Fase 1

4. INFORMATIVO (Terceiro tipo de conteúdo)
   └─> Conteúdo texto-first (não produto-based)
   └─> Motor separado/simplificado
   └─> Absorve aprendizados do Motor Visual v2.0
```

---

## 📋 CONTEXTO DO BLOQUEADOR ORIGINAL

### Situação Identificada

Durante o planejamento do Motor de Composição Visual v2.0 (Stories 4.1-4.8), foi detectado que a especificação **não definia integração com Weekly Plan**, criando risco de:

1. **Weekly Plan virar "segunda classe"** — campanhas manuais teriam artes melhores que campanhas de plano
2. **Inconsistência de experiência** — usuários teriam 2 sistemas visuais diferentes
3. **Retrabalho futuro** — implementar Weekly Plan depois exigiria refatoração do Motor v2.0

### Questões Críticas Não Respondidas

| # | Questão | Risco |
|---|---------|-------|
| Q1 | Weekly Plan deve gerar variações de PLANO ou só 1 plano? | Experiência do usuário indefinida |
| Q2 | Se houver variações, ainda precisa botão "regenerar"? | UX redundante ou confusa |
| Q3 | Como características do plano (cores natal, tom família) são herdadas pelas campanhas? | Identidade visual inconsistente |
| Q4 | Weekly Plan define "arte vs vídeo" ou deixa livre? | Planejamento estratégico incompleto |

---

## ✅ DECISÕES APROVADAS (Modelo de Integração)

### Q1: Weekly Plan — Geração de Variações

**DECISÃO: ✅ SIM — 4 variações de plano semanal completo**

**Comportamento Aprovado:**
```
IA gera 4 PLANOS SEMANAIS COMPLETOS em 1 chamada:
  - Plano A: Agressivo (7 posts, alta frequência)
  - Plano B: Balanceado (3 posts + 2 reels, mix de formatos)
  - Plano C: Conservador (3 posts, constância sem sobrecarga)
  - Plano D: Sazonal (5 posts temáticos - ex: Natal, Black Friday)

Usuário escolhe 1 dos 4 planos completos.
Cada plano tem 7 dias mapeados (dias, content_type, theme, brief).
```

**Justificativa:**
- **Economia de IA:** 1 chamada gera 4 planos vs 4 regenerações = 75% economia
- **Redução de fadiga:** Escolher entre 4 opções > regenerar até acertar
- **Aprendizado acelerado:** Sistema rastreia qual "estilo de plano" usuário prefere
- **Alinhamento com Motor v2.0:** Mantém padrão de "variações" em toda plataforma

---

### Q2: Botão Regenerar com Variações?

**DECISÃO: ❌ NÃO — Remover botão "regenerar"**

**Razão:**
- 4 variações de qualidade já cobrem espectro de preferências
- Regenerar com 4 opções visíveis = confusão ("qual regenerou?")
- Botão regenerar vira redundância

**EXCEÇÃO:** Permitir **edição manual** de dias/estratégia dentro do plano escolhido (mantém controle do usuário sem regeneração).

---

### Q3: Herança de Características do Plano para Campanhas

**DECISÃO: ✅ Theme + Brief enriquecem Motor Visual (contexto, não restrição)**

**Modelo de Herança Aprovado:**

| Característica | Definida em | Herdada por Campanha? | Como Funciona |
|----------------|-------------|----------------------|---------------|
| **Dias da semana** | Weekly Plan | ✅ SIM (hard lock) | Campanha só pode ser criada para o dia definido |
| **Content Type** (post/reels) | Weekly Plan | ✅ SIM (hard lock) | UI desabilita tipo não escolhido |
| **Theme** (Natal, Black Friday) | Weekly Plan | ✅ SIM → Alimenta Motor 2 (Intent Resolver) | Theme vira contexto para geração visual |
| **Brief** (angle, hook, CTA, audience, objective, positioning) | Weekly Plan | ✅ SIM → Alimenta geração de texto | Brief guia copywriting e hierarquia visual |
| **Visual Signature** | Loja (global) | ✅ SIM → Alimenta Motor 3 (Composer) | Identidade visual da loja aplicada |
| **Composição específica** | ❌ Campanha | ❌ NÃO (escolhida na hora) | Usuário escolhe entre variações geradas |

**Fluxo Técnico de Herança:**
```
1. Usuário cria campanha via Weekly Plan
   → campaign.weekly_plan_item_id = <item_id>
   → campaign.origin = "weekly_plan"

2. Campanha herda campos do item:
   SELECT theme, brief, content_type 
   FROM weekly_plan_items 
   WHERE id = campaign.weekly_plan_item_id

3. Motor Visual v2.0 recebe:
   {
     product_name: "Coca-Cola 2L",
     theme: "Natal",  // ← DO PLANO
     brief: {
       angle: "Família reunida",
       audience: "Pais 30-45 anos",
       objective: "awareness"
     },  // ← DO PLANO
     content_type: "post"  // ← DO PLANO
   }

4. Motor 2 (Intent Resolver) enriquece:
   - Detecta theme="Natal" → adiciona:
     * Cores: vermelho/verde
     * Tom: família, acolhimento
     * Ícones: neve, árvore, presente
   - brief.angle="Família reunida" → hierarquia visual:
     * Foco em warmth, não preço
     * Badge promocional sutil

5. Motor 3 (Composer) gera 3-6 variações:
   - TODAS com contexto natalino
   - TODAS com Visual Signature da loja
   - Variações = diferentes composições/arranjos

6. Usuário escolhe variação preferida
```

**CRÍTICO:** Theme é **contexto adicional**, não restrição absoluta. Motor Visual ainda gera múltiplas variações.

---

### Q4: Plano Define Arte/Vídeo?

**DECISÃO: ✅ SIM — Weekly Plan define `content_type` (post/reels/both)**

**Razão:**
- Planejamento estratégico DEVE incluir formato
- Lojista pode não querer/saber gravar vídeos (escolha consciente no planeamento)
- Schema atual já suporta (`weekly_plan_items.content_type`)

**Comportamento:**
- Se plano diz `content_type: "post"` → campanha só gera artes (vídeo desabilitado)
- Se plano diz `content_type: "reels"` → campanha só gera vídeos (arte desabilitada)  
- Se plano diz `content_type: "both"` → campanha permite escolher arte OU vídeo na execução

**UX Sugerida:** Na criação do plano (Passo 2), mostrar toggle "Arte / Vídeo / Ambos" para cada dia escolhido.

---

## 🏗️ ARQUITETURA DE INTEGRAÇÃO

### Camada 1: Geração de Variações de Plano Semanal

**Endpoint:** `POST /api/generate/weekly-strategy`

**Mudança Proposta:**
```diff
- Retorna: { strategy_summary: string, items: StrategyItem[] }
+ Retorna: { variations: Variation[] }

+ interface Variation {
+   label: string;                    // "Agressivo", "Balanceado", etc
+   strategy_summary: string;
+   items: StrategyItem[];             // 7 dias mapeados
+ }
```

**Exemplo de Resposta:**
```json
{
  "variations": [
    {
      "label": "Agressivo (7 posts)",
      "strategy_summary": "Máxima frequência para conquistar audiência nova",
      "items": [
        {
          "day_of_week": 1,
          "content_type": "post",
          "theme": "Lançamento Segunda",
          "brief": {
            "angle": "Novidade da semana",
            "hook_hint": "O que chegou de novo hoje",
            "cta_hint": "Venha conferir",
            "audience": "Clientes curiosos",
            "objective": "awareness",
            "product_positioning": "Destaque o novo"
          }
        },
        // ... mais 6 dias
      ]
    },
    {
      "label": "Balanceado (3 posts + 2 reels)",
      "strategy_summary": "Mix de formatos para engajamento",
      "items": [ /* ... */ ]
    },
    {
      "label": "Conservador (3 posts)",
      "strategy_summary": "Constância sem sobrecarga operacional",
      "items": [ /* ... */ ]
    },
    {
      "label": "Sazonal - Natal (5 posts)",
      "strategy_summary": "Estratégia temática para datas comemorativas",
      "items": [ /* ... */ ]
    }
  ]
}
```

**Complexidade:** 🟢 Baixa — IA já gera `strategy_summary`, só precisa gerar 4 variações em 1 prompt.

---

### Camada 2: Persistência de Plano Escolhido

**Comportamento:** Usuário escolhe Plano B → salva `strategy` no `weekly_plans.strategy` (JSONB)

**Schema Atual (sem mudanças necessárias):**
```sql
CREATE TABLE weekly_plans (
    id uuid PRIMARY KEY,
    store_id uuid REFERENCES stores(id),
    week_start date NOT NULL,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'approved')),
    strategy jsonb DEFAULT '{}'::jsonb,  -- ← Armazena plano escolhido
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

**Validação:** ✅ Schema atual suporta sem migration.

---

### Camada 3: Modo de Geração de Campanhas do Plano

**DECISÃO ARQUITETURAL: Modo "Auto-Preferida" com Fallback**

**Opção A: 1 Variação Auto-Preferida (Eficiência) — RECOMENDADA**
```typescript
// Campanha gerada de Weekly Plan
const preferredComposition = await getPreferredComposition(storeId); // Aprende do histórico
const variation = await generateSingleVariation(campaign, preferredComposition);
// Retorna 1 arte pronta baseada em preferência aprendida

// UX:
// [Campanha gerada]
// ✅ Aprovar
// 🔄 Ver mais opções → (se clicar) gera +3 variações
```

**Opção B: Múltiplas Variações (Escolha) — ALTERNATIVA**
```typescript
// Campanha gerada de Weekly Plan
const variations = await generateVariations(campaign, { count: 3 });
// Retorna 3-6 opções, usuário escolhe
// UX igual campanhas manuais
```

**RECOMENDAÇÃO TÉCNICA:** ✅ **Opção A com flag de override**

**Justificativa:**
- Weekly Plan = eficiência operacional, não experimentação criativa
- Múltiplas variações × 7 dias = 21-42 escolhas/semana (fadiga de decisão)
- MAS permitir "Ver mais opções" se usuário rejeitar a sugerida (flexibilidade)

**Implementação:**
```typescript
// lib/constants/features.ts
interface WeeklyPlanGenerationConfig {
  mode: "auto_preferred" | "show_variations";
  fallback_to_variations_if_rejected: boolean; // default: true
}
```

---

### Camada 4: Feature Flags para Rollout Progressivo

**Proposta de Feature Flags:**
```typescript
// lib/constants/features.ts
export const FEATURES = {
  MOTOR_VISUAL_V2: "motor_visual_v2_enabled",                      // Motor completo
  WEEKLY_PLAN_VARIATIONS: "weekly_plan_variations_enabled",        // 4 variações de plano
  WEEKLY_PLAN_AUTO_COMPOSITION: "weekly_plan_auto_composition",    // 1 variação auto
};
```

**Estratégia de Rollout:**
```
FASE 1: Motor Visual v2.0 em campanhas manuais
  └─> MOTOR_VISUAL_V2 = true
  └─> WEEKLY_PLAN_* = false (plano usa sistema antigo)

FASE 2: Weekly Plan com 4 variações de plano
  └─> MOTOR_VISUAL_V2 = true
  └─> WEEKLY_PLAN_VARIATIONS = true
  └─> WEEKLY_PLAN_AUTO_COMPOSITION = false (ainda gera múltiplas)

FASE 3: Weekly Plan + composição auto-preferida
  └─> MOTOR_VISUAL_V2 = true
  └─> WEEKLY_PLAN_VARIATIONS = true
  └─> WEEKLY_PLAN_AUTO_COMPOSITION = true

FASE 4: Rollout completo
  └─> Todas flags ON
```

**Benefício:** Rollback instantâneo em caso de falha (desligar flags).

---

## 🎯 PRIORIZAÇÃO DE DESENVOLVIMENTO

### FASE 1: CAMPANHAS (Motor Visual v2.0) — EM ANDAMENTO

**Status:** 🟡 Prioridade Máxima  
**Escopo:** Stories 4.1-4.8  
**Objetivo:** Motor de Composição Visual completo para campanhas manuais

**4 Motores:**
1. **Visual Reader** — Analisa imagem do produto (background, qualidade, posição)
2. **Intent Resolver** — Determina hierarquia visual (preço, produto, urgência)
3. **Visual Composer** — Gera 3-6 variações de composição visual
4. **Renderer** — Compõe arte final programaticamente

**Visual Signature:**
- Identidade visual da loja (cores, logo, tipografia)
- 5 context profiles (standard, promotional, seasonal, premium, urgency)
- Aprendizado de preferências (preferred_composition)

**Duração Estimada:** 4-6 semanas  
**Validação:** 2 semanas em produção (coletar dados reais)

**Dados a Coletar durante Validação:**
- Quais composições usuários preferem? (taxa de aprovação por tipo)
- Visual Signature é reconhecível? (feedback qualitativo)
- Theme inheritance funciona bem? (contextos sazonais/promocionais)
- Padrões de uso (dias, horários, frequência de geração)

---

### FASE 2: PRICING (Monetização) — APÓS FASE 1

**Status:** 📋 Planejado  
**Objetivo:** Validar modelo de negócio antes de investir em features complexas

**Escopo:**
- Sistema de planos (Free, Basic, Pro)
- Limites de geração por plano:
  - Free: 5 campanhas/mês
  - Basic: 50 campanhas/mês + Weekly Plan
  - Pro: ilimitado + Weekly Plan + features premium
- Checkout/pagamento (Stripe)
- Dashboard de uso

**Duração Estimada:** 2 semanas

**Validação de Negócio:**
- Usuários estão dispostos a pagar?
- Qual plano tem maior adesão?
- Limites são adequados?

**RAZÃO DA PRIORIDADE:**
Pricing valida **viabilidade do negócio** antes de investir em Weekly Plan (feature complexa). Se modelo de negócio não funcionar, Weekly Plan pode ser reajustado ou simplificado.

---

### FASE 3: WEEKLY PLAN (Integração) — APÓS FASE 2

**Status:** 📋 BACKLOG (Story 4.9)  
**Objetivo:** Integrar Weekly Plan com Motor Visual v2.0 usando dados reais

**Pré-requisitos:**
- ✅ Motor Visual v2.0 100% estável (Fase 1 completa)
- ✅ Dados reais de preferências coletados (2 semanas produção)
- ✅ Pricing implementado (limites por plano definidos)

**Escopo (Story 4.9):**
1. Geração de 4 variações de plano semanal
2. Herança de theme/brief → Motor Visual
3. Modo auto-preferida para campanhas de plano (com fallback)
4. UI de navegação entre variações de plano
5. Feature flag para rollout progressivo

**Duração Estimada:** 2 semanas

**Feature Paga:** Weekly Plan será recurso do plano Basic+ (não Free).

**Por que DEPOIS de Pricing:**
- Weekly Plan como feature paga desde o início (não precisa migração depois)
- Limites de plano já definidos (Free não acessa, Basic tem limite mensal)
- Modelo de negócio validado (sabemos se vale investir)

**Por que DEPOIS de Motor v2.0 estável:**
- Evita refatoração dupla (motor muda, plano precisa mudar)
- Usa dados reais de `preferred_composition` (geração auto-preferida precisa histórico)
- Theme inheritance testado em produção (campanhas manuais validam primeiro)

---

### FASE 4: INFORMATIVO (Terceiro Tipo de Conteúdo) — FUTURO

**Status:** 💡 Ideia (não priorizado)  
**Objetivo:** Conteúdo texto-first (não produto-based)

**Escopo Preliminar:**
- **Exemplos:** Horário de funcionamento, avisos, comunicados, datas especiais
- **Características:**
  - Sem imagem de produto (opcional)
  - Foco em hierarquia tipográfica
  - Visual Signature da loja aplicada
  - Layout simplificado (não precisa Visual Reader)

**Motor Separado:**
- Não usa Motor Visual v2.0 completo
- Motor simplificado (Intent Resolver + Composer + Renderer)
- Regras de tipografia mais rígidas (legibilidade > criatividade)

**Integração com Weekly Plan:**
- Inicialmente: **NÃO** (Informativo fora de planejamento semanal)
- Uso ad-hoc (avisos urgentes, comunicados)
- Se usuários pedirem: pode entrar em Weekly Plan depois

**Duração Estimada:** TBD (após observar Fase 1 em produção)

**RAZÃO DO ADIAMENTO:**
> "Não me aprofundei na especialidade do Informativo. Prefiro manter foco em campanhas. Motor Visual v2.0 pode abrir novos entendimentos, campos e situações que serão absorvidos pelo futuro gerador de Informativos."  
> — Wagner, Proprietário do Produto

**Decisão:** Aguardar. Campanhas podem revelar patterns de composição que influenciarão design do Informativo (ex: hierarquia tipográfica, uso de espaço negativo, badges informativos).

---

## ⚠️ RISCOS IDENTIFICADOS E MITIGAÇÕES

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| **Motor v2.0 muda estrutura de dados** | 🔴 Alta | **MITIGADO:** Weekly Plan adiado até Motor v2.0 estável (decisão executiva) |
| **Custo de IA aumenta 4x** (4 planos vs 1) | 🟡 Média | Validar custo real em spike técnico; considerar lazy generation (gera sob demanda) |
| **Latência alta** (gerar 4 planos completos) | 🟡 Média | Paralelizar geração; mostrar loading com progresso; cachear resultados |
| **Usuário rejeita todas 4 opções** | 🟢 Baixa | Permitir edição manual após escolha; adicionar "Pedir novas sugestões" (max 1x) |
| **Theme mal interpretado** (ex: "Natal" vira vermelho demais) | 🟡 Média | Criar biblioteca de themes pré-calibrados; permitir override manual de cores |
| **Composição auto-preferida erra** | 🟢 Baixa | Fallback para múltiplas variações se rejeitada; aprendizado contínuo |
| **Fadiga de decisão** (escolher entre 4 planos) | 🟢 Baixa | UX clara, preview visual de cada plano; labels descritivos |
| **Refatoração dupla** (implementar Weekly Plan agora) | 🔴 Alta | **MITIGADO:** Implementação adiada (decisão executiva) |

---

## 📚 REFERÊNCIAS E DOCUMENTOS RELACIONADOS

### Documentos de Produto
- [ROADMAP.md](../../ROADMAP.md) — Estratégia de produto e fases de desenvolvimento
- [CAMPAIGN_FLOW_RULES.md](../CAMPAIGN_FLOW_RULES.md) — Regras de comportamento de campanhas
- [PROXIMOS-PASSOS.md](../PROXIMOS-PASSOS.md) — Próximas ações (Motor v2.0 FASE 2-4)

### Documentos Técnicos
- [database/schema.sql](../../database/schema.sql) — Schema de `weekly_plans` e `weekly_plan_items`
- [lib/domain/weekly-plans/types.ts](../../lib/domain/weekly-plans/types.ts) — Tipos TypeScript de Weekly Plan

### Documentos de Execução
- [docs/FASE-1-RESUMO.md](../FASE-1-RESUMO.md) — Fase 1 do Motor v2.0 (Visual Signatures)
- [docs/FASE-1-EXECUCAO.md](../FASE-1-EXECUCAO.md) — Execução detalhada Fase 1

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO (Story 4.9 — Futuro)

Quando Story 4.9 entrar em sprint, seguir este checklist:

### Pré-Implementação
- [ ] Motor Visual v2.0 100% estável (Stories 4.1-4.8 concluídas)
- [ ] 2 semanas de validação em produção (dados coletados)
- [ ] Pricing implementado (planos Free/Basic/Pro ativos)
- [ ] Dados de `preferred_composition` disponíveis (aprendizado ativo)

### Spike Técnico (Antes de Desenvolver)
- [ ] @architect + @dev: Validar geração de 4 variações em 1 chamada IA
  - [ ] Testar custo (4 planos vs 4 chamadas separadas)
  - [ ] Medir latência (aceitável < 15s)
  - [ ] Validar qualidade (4 planos realmente diferentes?)
- [ ] Resultado do spike documentado (GO/NO-GO)

### UX/UI Design
- [ ] @ux-design-expert: Wireframe de navegação entre 4 planos
  - [ ] Cards de preview de cada plano
  - [ ] Labels claros ("Agressivo", "Balanceado", etc)
  - [ ] Preview visual dos dias mapeados
  - [ ] Botão "Escolher este plano"
- [ ] @ux-design-expert: Wireframe de modo auto-preferida
  - [ ] Tela de campanha gerada (1 variação)
  - [ ] Botões "Aprovar" / "Ver mais opções"
  - [ ] Loading state (gerando variações)

### Backend (API)
- [ ] Atualizar `/api/generate/weekly-strategy`:
  - [ ] Modificar prompt para gerar 4 variações
  - [ ] Retornar array de `Variation[]`
  - [ ] Paralelizar geração (se possível)
- [ ] Criar `/api/campaigns/generate-from-plan`:
  - [ ] Receber `weekly_plan_item_id`
  - [ ] Buscar `theme`, `brief`, `content_type`
  - [ ] Chamar Motor Visual com contexto enriquecido
  - [ ] Modo `auto_preferred` (1 variação) ou `show_variations` (3-6)
- [ ] Implementar `getPreferredComposition(storeId)`:
  - [ ] Analisar histórico de aprovações
  - [ ] Retornar composição mais aprovada
  - [ ] Fallback: composição padrão do context profile

### Frontend (UI)
- [ ] **Passo 2 do Wizard** (Estratégia):
  - [ ] Mostrar 4 cards de planos
  - [ ] Preview de cada plano (dias, content_type, themes)
  - [ ] Seleção de plano (state management)
  - [ ] Salvar plano escolhido no `weekly_plans.strategy`
- [ ] **Passo 3 do Wizard** (Execução):
  - [ ] Botão "Gerar campanha" para cada dia
  - [ ] Modal de geração (loading + preview)
  - [ ] Modo auto-preferida (1 variação default)
  - [ ] Botão "Ver mais opções" (se rejeitar)
- [ ] **Tela de Campanha** (herdando do plano):
  - [ ] Campos herdados desabilitados (theme, content_type, brief)
  - [ ] Badge "Criada do Plano Semanal de [data]"
  - [ ] Link para voltar ao plano

### Feature Flags
- [ ] Criar flags em `lib/constants/features.ts`:
  - [ ] `WEEKLY_PLAN_VARIATIONS`
  - [ ] `WEEKLY_PLAN_AUTO_COMPOSITION`
- [ ] Implementar lógica de toggle (ON/OFF)
- [ ] Testar rollback (desligar flag = sistema antigo)

### Testes
- [ ] **Unit tests:**
  - [ ] `getPreferredComposition()` retorna composição correta
  - [ ] Herança de theme/brief funciona
  - [ ] Feature flags funcionam (ON/OFF)
- [ ] **Integration tests:**
  - [ ] Gerar 4 planos retorna variações válidas
  - [ ] Criar campanha de plano herda campos corretos
  - [ ] Modo auto-preferida gera 1 variação
  - [ ] Fallback para múltiplas variações funciona
- [ ] **E2E tests:**
  - [ ] Wizard completo (dias → 4 planos → escolher → executar)
  - [ ] Gerar campanha de plano (herança correta)
  - [ ] Aprovar campanha de plano (persiste corretamente)

### Documentação
- [ ] Atualizar `CAMPAIGN_FLOW_RULES.md` (regras de Weekly Plan)
- [ ] Atualizar `ROADMAP.md` (marcar Story 4.9 como concluída)
- [ ] Criar guia de usuário (como usar Weekly Plan com Motor v2.0)
- [ ] Documentar API (`/api/generate/weekly-strategy` v2)

### Validação Pós-Implementação
- [ ] Beta testing (grupo selecionado)
- [ ] Coletar feedback (4 planos são suficientes? Modo auto funciona?)
- [ ] Medir métricas:
  - [ ] Taxa de aprovação de planos (qual variação mais escolhida?)
  - [ ] Taxa de aprovação de campanhas auto-preferidas
  - [ ] Uso de "Ver mais opções" (% de fallback)
  - [ ] Tempo médio de criação de plano (vs sistema antigo)
- [ ] Ajustar baseado em dados (se necessário)

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS (Agora)

### Para @dev, @architect, @qa (Agentes de Desenvolvimento)
**FOCO:** Stories 4.1-4.8 (Motor Visual v2.0)  
**IGNORAR:** Weekly Plan até nova ordem  
**REFERÊNCIA:** Este documento está aprovado, mas implementação aguarda Fase 1 completa

### Para @pm (Morgan)
**AÇÃO:** Criar Story 4.9 no backlog (não sprint atual)  
**TÍTULO:** "Integração Weekly Plan × Motor Visual v2.0"  
**PRIORIDADE:** Baixa (aguarda Fase 1 + Fase 2)  
**ACCEPTANCE CRITERIA:** Ver checklist acima

### Para @analyst (Alex)
**AÇÃO:** Durante validação da Fase 1 (2 semanas produção), coletar:
- Dados de `preferred_composition` (qual composição mais aprovada?)
- Feedback sobre theme inheritance (contextos funcionam?)
- Padrões de uso (dias, horários, frequência)

---

## 📝 HISTÓRICO DE DECISÕES

| Data | Decisão | Status |
|------|---------|--------|
| 18/04/2026 | Modelo de 4 variações de plano aprovado | ✅ Aprovado |
| 18/04/2026 | Modo auto-preferida para campanhas de plano aprovado | ✅ Aprovado |
| 18/04/2026 | Herança theme/brief → Intent Resolver aprovada | ✅ Aprovado |
| 18/04/2026 | Sequência Campanhas → Pricing → Weekly Plan aprovada | ✅ Aprovado |
| 18/04/2026 | Story 4.9 criada como BACKLOG (não sprint atual) | ✅ Aprovado |
| 18/04/2026 | Informativo adiado (aguarda aprendizados de Campanhas) | ✅ Aprovado |

---

## ✍️ ASSINATURAS

**Análise Técnica:**  
— Morgan (PM), planejando o futuro 📊  
— Aria (Architect), arquitetando o futuro 🏗️

**Orquestração:**  
— Orion (AIOX Master), orquestrando a decisão 👑

**Aprovação Executiva:**  
— Wagner (Proprietário do Produto)  
Data: 18 de Abril de 2026

---

**ESTE DOCUMENTO É REFERÊNCIA OBRIGATÓRIA PARA:**
- Desenvolvimento de Stories 4.1-4.8 (contexto de integração futura)
- Criação de Story 4.9 (quando entrar em sprint)
- Decisões de arquitetura relacionadas a Weekly Plan
- Validação de Motor Visual v2.0 (coletar dados para Fase 3)

**NÃO IMPLEMENTE WEEKLY PLAN SEM CONSULTAR ESTE DOCUMENTO.**
