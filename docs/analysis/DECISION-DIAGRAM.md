# Weekly Plan × Motor Visual v2.0 — Diagrama de Decisão

**Data:** 2026-04-18 | **Status:** ✅ Aprovado, ⏸️ Implementação Adiada

---

## 🗺️ Fluxo de Integração Aprovado

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WEEKLY PLAN WIZARD                                │
│                                                                          │
│  PASSO 1: Escolher Dias (Segunda, Quarta, Sexta)                        │
│  ────────────────────────────────────────────────────────────           │
│  [x] Seg  [x] Qua  [ ] Qui  [x] Sex  [ ] Sáb  [ ] Dom                   │
│                                                                          │
│  PASSO 2: IA Gera 4 VARIAÇÕES DE PLANO                                  │
│  ────────────────────────────────────────────────────────────           │
│  ┌──────────────────┐  ┌──────────────────┐                             │
│  │ Plano A          │  │ Plano B          │                             │
│  │ Agressivo        │  │ Balanceado       │                             │
│  │ (7 posts)        │  │ (3 posts + 2     │ ← ESCOLHER 1               │
│  │                  │  │ reels)           │                             │
│  └──────────────────┘  └──────────────────┘                             │
│  ┌──────────────────┐  ┌──────────────────┐                             │
│  │ Plano C          │  │ Plano D          │                             │
│  │ Conservador      │  │ Sazonal (Natal)  │                             │
│  │ (3 posts)        │  │ (5 posts)        │                             │
│  └──────────────────┘  └──────────────────┘                             │
│                                                                          │
│  PASSO 3: Aprovar Plano → status = approved                             │
│  ────────────────────────────────────────────────────────────           │
│  [Aprovar Plano B] [Voltar] [Cancelar]                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXECUÇÃO DE CAMPANHAS                                │
│                                                                          │
│  Plano Semanal de 13-17 de Maio (Balanceado)                            │
│  ────────────────────────────────────────────────────────────           │
│  Segunda (13/05) - Post - Lançamento        [Gerar Campanha]            │
│  Quarta  (15/05) - Reels - Bastidores       [Gerar Campanha]            │
│  Sexta   (17/05) - Post - Oferta Especial   [Gerar Campanha]            │
│                                                                          │
│  ────────────────────────────────────────────────────────────           │
│  Usuário clica "Gerar campanha para Segunda"                            │
│                                                                          │
│  → Cria campaign com:                                                   │
│     - weekly_plan_item_id = <item_segunda>                              │
│     - origin = "weekly_plan"                                            │
│     - Herda: theme="Lançamento", content_type="post", brief={}          │
│                                                                          │
│  → Motor Visual v2.0 executa:                                           │
│                                                                          │
│     ┌────────────────────────────────────────────────────┐              │
│     │ MOTOR 1: Visual Reader                            │              │
│     │ Analisa imagem do produto                         │              │
│     │ (background, qualidade, posição)                  │              │
│     └────────────────┬───────────────────────────────────┘              │
│                      ↓                                                  │
│     ┌────────────────────────────────────────────────────┐              │
│     │ MOTOR 2: Intent Resolver                          │              │
│     │ Detecta theme="Lançamento" (DO PLANO)             │              │
│     │ → Adiciona: cores vibrantes, tom empolgante,      │              │
│     │   badge "NOVO", hierarquia (produto > preço)      │              │
│     │                                                    │              │
│     │ Usa brief DO PLANO:                               │              │
│     │ - angle: "Novidade da semana"                     │              │
│     │ - audience: "Clientes curiosos"                   │              │
│     │ - objective: "awareness"                          │              │
│     └────────────────┬───────────────────────────────────┘              │
│                      ↓                                                  │
│     ┌────────────────────────────────────────────────────┐              │
│     │ MOTOR 3: Visual Composer                          │              │
│     │                                                    │              │
│     │ MODO: AUTO-PREFERIDA (Weekly Plan)                │              │
│     │                                                    │              │
│     │ 1. Busca preferred_composition(store_id)          │              │
│     │ 2. Gera 1 VARIAÇÃO baseada em preferência         │              │
│     │    (ex: grid limpo, produto centralizado)         │              │
│     │ 3. Aplica Visual Signature da loja                │              │
│     │ 4. Aplica contexto "Lançamento" (do plano)        │              │
│     └────────────────┬───────────────────────────────────┘              │
│                      ↓                                                  │
│     ┌────────────────────────────────────────────────────┐              │
│     │ MOTOR 4: Renderer                                 │              │
│     │ Compõe arte final programaticamente               │              │
│     └────────────────────────────────────────────────────┘              │
│                                                                          │
│  ────────────────────────────────────────────────────────────           │
│  RESULTADO: 1 Arte gerada (contexto "Lançamento" + Visual Signature)    │
│                                                                          │
│  [Preview da arte]                                                      │
│                                                                          │
│  ✅ [Aprovar]    🔄 [Ver mais opções] → (gera +3 variações)             │
│                                                                          │
│  Se usuário clicar "Ver mais opções":                                   │
│    → Motor 3 gera +3 variações COM mesmo contexto                       │
│    → Usuário escolhe entre as 4 opções                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Sequência de Desenvolvimento

```
FASE 1: CAMPANHAS (Motor Visual v2.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stories 4.1-4.8
▪ Visual Reader (análise de imagem)
▪ Intent Resolver (hierarquia visual)
▪ Visual Composer (variações)
▪ Renderer (composição final)
▪ Visual Signature (identidade loja)

Duração: 4-6 semanas
Validação: 2 semanas produção
Status: 🟡 EM ANDAMENTO
        ↓
        ↓ [VALIDAÇÃO: Coletar dados reais]
        ↓ - Preferred compositions
        ↓ - Taxa de aprovação
        ↓ - Feedback Visual Signature
        ↓
FASE 2: PRICING (Monetização)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▪ Planos (Free, Basic, Pro)
▪ Limites de geração
▪ Checkout/pagamento
▪ Validação de negócio

Duração: 2 semanas
Status: 📋 PLANEJADO
        ↓
        ↓ [VALIDAÇÃO: Modelo de negócio]
        ↓ - Usuários pagam?
        ↓ - Qual plano preferem?
        ↓
FASE 3: WEEKLY PLAN (Integração)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Story 4.9 - BACKLOG
▪ 4 variações de plano semanal
▪ Herança theme/brief → Motor Visual
▪ Modo auto-preferida
▪ Feature paga (Basic+)

Duração: 2 semanas
Status: 📋 BACKLOG (aguarda Fase 1+2)
        ↓
        ↓ [VALIDAÇÃO: Feedback beta]
        ↓ - Taxa de aprovação planos
        ↓ - Taxa de aprovação auto-preferida
        ↓
FASE 4: INFORMATIVO (Terceiro Tipo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▪ Conteúdo texto-first
▪ Motor separado/simplificado
▪ Fora de Weekly Plan (ad-hoc)

Status: 💡 FUTURO (TBD)
```

---

## 🔄 Modelo de Herança (Weekly Plan → Campanha)

```
weekly_plans
┌────────────────────────────────────────┐
│ id: uuid                               │
│ store_id: uuid                         │
│ week_start: date (segunda-feira)       │
│ status: draft | approved               │
│ strategy: jsonb ─┐                     │
└──────────────────┼─────────────────────┘
                   │
                   │ [Plano escolhido]
                   │ - strategy_summary
                   │ - items[] (7 dias mapeados)
                   │
                   ↓
weekly_plan_items
┌────────────────────────────────────────┐
│ id: uuid                               │
│ plan_id: uuid (FK → weekly_plans)      │
│ day_of_week: int (1-7)                 │
│ content_type: post | reels ────────┐   │
│ theme: text ───────────────────┐   │   │
│ brief: jsonb ──────────────┐   │   │   │
│   - angle              ────┼───┼───┼───┼── HERANÇA
│   - hook_hint              │   │   │   │
│   - cta_hint               │   │   │   │
│   - audience               │   │   │   │
│   - objective              │   │   │   │
│   - product_positioning    │   │   │   │
└────────────────────────────┼───┼───┼───┘
                             │   │   │
                             ↓   ↓   ↓
campaigns
┌────────────────────────────────────────┐
│ id: uuid                               │
│ store_id: uuid                         │
│ weekly_plan_item_id: uuid (FK) ────────┼─ LINK
│ origin: weekly_plan                    │
│                                        │
│ [CAMPOS HERDADOS - BLOQUEADOS NA UI]   │
│ theme: (do item) ──────────────────────┤
│ brief: (do item) ──────────────────────┤
│ campaign_type: (do item.content_type)──┤
│                                        │
│ [CAMPOS LIVRES]                        │
│ product_name, price, image_url, etc    │
└────────────────────────────────────────┘
         │
         ↓
    MOTOR VISUAL V2.0
         │
    ┌────┴────┐
    │ theme   │ → Intent Resolver
    │         │    (contexto: Natal, Lançamento, Oferta)
    │ brief   │ → Copywriting
    │         │    (angle, audience, objective)
    └─────────┘
         ↓
    1 VARIAÇÃO AUTO-PREFERIDA
    (ou +3 se rejeitar)
```

---

## ⚠️ Riscos e Mitigações

```
┌───────────────────────────────────────────────────────────────┐
│ RISCO                            │ MITIGAÇÃO                  │
├──────────────────────────────────┼────────────────────────────┤
│ 🔴 Motor v2.0 muda estrutura     │ ✅ Weekly Plan ADIADO até  │
│    → Refatoração dupla           │    Motor 100% estável      │
├──────────────────────────────────┼────────────────────────────┤
│ 🟡 Custo IA aumenta 4x           │ Validar em spike técnico;  │
│    (4 planos vs 1)               │ Lazy generation opcional   │
├──────────────────────────────────┼────────────────────────────┤
│ 🟡 Latência alta (gerar 4)       │ Paralelizar; loading state │
├──────────────────────────────────┼────────────────────────────┤
│ 🟢 Usuário rejeita todas 4       │ Edição manual; "pedir mais"│
├──────────────────────────────────┼────────────────────────────┤
│ 🟡 Theme mal interpretado        │ Biblioteca pré-calibrada;  │
│    (ex: Natal vermelho demais)   │ Override manual de cores   │
├──────────────────────────────────┼────────────────────────────┤
│ 🟢 Auto-preferida erra           │ Fallback p/ múltiplas      │
│                                  │ variações (aprendizado++)  │
└──────────────────────────────────┴────────────────────────────┘
```

---

## 📄 Referências

- **Documento Completo:** [WEEKLY-PLAN-MOTOR-VISUAL-INTEGRACAO.md](./WEEKLY-PLAN-MOTOR-VISUAL-INTEGRACAO.md)
- **Sumário (1 página):** [DECISION-SUMMARY.md](./DECISION-SUMMARY.md)
- **Checklist Implementação:** [STORY-4.9-CHECKLIST.md](./STORY-4.9-CHECKLIST.md)
- **ROADMAP:** [../../ROADMAP.md](../../ROADMAP.md)
- **CAMPAIGN_FLOW_RULES:** [../CAMPAIGN_FLOW_RULES.md](../CAMPAIGN_FLOW_RULES.md)

---

**Aprovado por:** Wagner (Proprietário do Produto)  
**Data:** 2026-04-18  
**Análise:** @pm (Morgan), @architect (Aria), @aiox-master (Orion)
