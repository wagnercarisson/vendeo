# 📊 Onboarding Progressivo — Resumo Executivo
**Agent:** @ux-design-expert (Uma)  
**Data:** 2026-04-30  
**Audiência:** @pm, @architect, @dev, @po

---

## 🎯 TL;DR

**Problema:** Onboarding atual captura 3 campos → Primeira campanha é genérica → Lojista desiste  
**Solução:** Onboarding progressivo em 2 fases (8 básicos + 15 intelligence opcional)  
**Impacto esperado:** Campanhas 70%+ com aprovação na primeira geração (vs ~30% atual)

---

## 📐 Estrutura Visual

```
ATUAL (❌ INSUFICIENTE)
┌─────────────────────┐
│  1 tela, 3 campos   │
│  ↓                  │
│  Loja criada        │
│  ↓                  │
│  Dashboard          │
│  ↓                  │
│  Campanha genérica  │ ← Lojista desiste aqui
└─────────────────────┘

PROPOSTO (✅ PROGRESSIVO)
┌────────────────────────────────────────────┐
│  FASE 1 (Obrigatória - <2min)              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐   │
│  │ 1/4  │→ │ 2/4  │→ │ 3/4  │→ │ 4/4  │   │
│  │Ident.│  │Local.│  │Conta │  │Brand │   │
│  └──────┘  └──────┘  └──────┘  └──────┘   │
│  8 campos: segmento, logo, cores, contato  │
│  ↓                                         │
│  Loja completa → Dashboard                 │
│  ↓                                         │
│  Campanha personalizada ✨                  │
│  ↓ (opcional)                              │
│  FASE 2 (Modal - ~5min)                    │
│  ┌────────────────────────────┐            │
│  │ Intelligence Calibration   │            │
│  │ 15 campos em 5 abas        │            │
│  │ Score: 0-100               │            │
│  └────────────────────────────┘            │
│  ↓                                         │
│  Campanhas MUITO melhores 🚀                │
└────────────────────────────────────────────┘
```

---

## 🆚 Comparação: Antes vs Depois

| Aspecto | ATUAL | PROPOSTO | Melhoria |
|---------|-------|----------|----------|
| **Campos capturados** | 3 (nome, cidade, estado) | Fase 1: 8 / Fase 2: 23 | +667% / +767% |
| **Tempo onboarding** | <1 min | Fase 1: 2-3 min / Total: 8 min | +200% (mas +valor) |
| **Segmento identificado?** | ❌ Não | ✅ Sim (Tela 1) | CRÍTICO |
| **Logo da loja?** | ❌ Hardcoded NULL | ✅ Upload OU IA | +Brand identity |
| **Cores da marca?** | ❌ Verde/Azul (todos iguais) | ✅ Custom OU extraídas | +Diferenciação |
| **Contato (tel/Insta)?** | ❌ Não | ✅ Sim (Tela 3) | +CTA relevante |
| **Intelligence context?** | ❌ Vazio | ✅ 15 campos (opcional) | +Personalização |
| **Qualidade 1ª campanha** | ~30% aprovação | ~70% aprovação (estimado) | +133% |
| **Taxa de conclusão** | 95% (muito simples) | 85-90% (mais atrito, mas melhor) | -5% aceitável |

---

## 📊 Campos Mapeados

### FASE 1 (Obrigatória - 8 campos)

| # | Campo | Tela | Tabela DB | Tipo | Obrigatório? |
|---|-------|------|-----------|------|--------------|
| 1 | Nome da loja | 1/4 | `stores.name` | text | ✅ |
| 2 | Segmento | 1/4 | `stores.main_segment` | enum | ✅ |
| 3 | Cidade | 2/4 | `stores.city` | text | ✅ |
| 4 | Estado | 2/4 | `stores.state` | text | ✅ |
| 5 | Bairro | 2/4 | `stores.neighborhood` | text | ⚪ Opcional |
| 6 | Telefone/WhatsApp | 3/4 | `stores.phone` + `stores.whatsapp` | text | ✅ |
| 7 | Instagram | 3/4 | `stores.instagram` | text | ⚪ Opcional |
| 8 | Logo | 4/4 | `stores.logo_url` | text (URL) | ⚪ Opcional |
| 9 | Cores (primary + secondary) | 4/4 | `stores.primary_color` + `stores.secondary_color` | text (HEX) | ✅ |

### FASE 2 (Opcional - 15 campos)

| # | Campo | Aba | Armazenamento | Versão |
|---|-------|-----|---------------|--------|
| 10 | Tom de voz | 1 | `store_intelligence.context.brand_voice` | v2.0 |
| 11 | Público-alvo | 1 | `store_intelligence.context.target_audience` | v2.0 |
| 12 | Picos sazonais | 1 | `store_intelligence.context.seasonal_peaks` | v2.0 |
| 13 | Diferenciais | 1 | `store_intelligence.context.main_differentiation` | v2.0 |
| 14 | Produtos top | 1 | `store_intelligence.context.top_products` | v2.0 |
| 15 | Posicionamento preço | 2 | `store_intelligence.context.price_positioning` | v2.0 |
| 16 | Ticket médio | 2 | `store_intelligence.context.average_ticket_brl` | v2.1 |
| 17 | Concorrentes | 2 | `store_intelligence.context.competitors` | v2.0 |
| 18 | USP | 2 | `store_intelligence.context.unique_selling_proposition` | v2.1 |
| 19 | Dores do cliente | 2 | `store_intelligence.context.customer_pain_points` | v2.1 |
| 20 | Gatilhos conversão | 3 | `store_intelligence.context.conversion_triggers` | v2.1 |
| 21 | CTAs validados | 3 | `store_intelligence.context.successful_past_ctas` | v2.1 |
| 22 | Eventos locais | 3 | `store_intelligence.context.local_events_calendar` | v2.1 |
| 23 | Preferências linguagem | 4 | `store_intelligence.context.language_specifics` | v2.1 |
| 24 | Tamanho copy | 4 | `store_intelligence.context.copy_length_preferences` | v2.1 |

---

## 💡 Principais Inovações UX

### 1. **Geração de Logo com IA** (Tela 4/4)
```
Lojista sem logo → Clica "Gerar com IA"
    ↓
Modal: "Descreva sua loja" (ex: "Moderna, minimalista")
    ↓
API (Replicate + Stable Diffusion) gera 3 opções
    ↓
Lojista escolhe → Preview instantâneo → Salvo
```
**Benefício:** Remove fricção de "não tenho logo pronto"

### 2. **Extração Automática de Cores** (Tela 4/4)
```
Lojista faz upload de logo
    ↓
Backend extrai paleta dominante (Vibrant.js)
    ↓
Sugere primary_color + secondary_color
    ↓
Lojista aceita OU ajusta manualmente
```
**Benefício:** Lojista não precisa saber HEX codes

### 3. **Intelligence Score Gamificado** (Fase 2)
```
0-15 campos preenchidos
    ↓
Score: 0-100 (barra visual)
    ↓
Badge: "Básica" (0-30) / "Média" (31-60) / "Avançada" (61-100)
    ↓
Incentivo: "Sua campanha será 40% melhor com 8+ campos"
```
**Benefício:** Gamificação aumenta engajamento sem bloquear

### 4. **Onboarding Progressivo (Non-Blocking)**
```
Fase 1 (obrigatória) → Loja criada → Dashboard
    ↓
Banner: "⚡ Quer campanhas melhores? Calibre a IA (5 min)"
    ↓
Lojista pode clicar OU ignorar (não bloqueia)
    ↓
Modal Fase 2 (pode preencher parcialmente e salvar)
```
**Benefício:** Lojista com pressa não é bloqueado

---

## 🎨 Fluxo Visual Simplificado

```
┌─────────────────────────────────────────────────────────┐
│  LOGIN → Primeira vez? → Onboarding                     │
└─────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  FASE 1: DADOS BÁSICOS (4 telas, <2min)                 │
├─────────────────────────────────────────────────────────┤
│  Tela 1/4: Nome + Segmento (🍷 💊 👗 💄 🏠)              │
│  Tela 2/4: Cidade + Estado + Bairro                     │
│  Tela 3/4: Telefone/WhatsApp + Instagram                │
│  Tela 4/4: Logo (upload/IA/skip) + Cores (picker/auto)  │
│             ↓                                           │
│  [Criar minha loja e começar] ← CTA primário            │
│  [⚡ Calibrar inteligência] ← Link secundário (Fase 2)  │
└─────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  Loja criada → Redirect: /dashboard                     │
│  Banner: "⚡ Calibre a IA para campanhas melhores"       │
└─────────────────────────────────────────────────────────┘
                     ↓ (se clicar)
┌─────────────────────────────────────────────────────────┐
│  FASE 2: INTELLIGENCE (Modal full-screen, ~5min)        │
├─────────────────────────────────────────────────────────┤
│  Abas: [Tom&Público] [Posicionamento] [Conversão] ...  │
│  Progresso: ████████░░░░░░░░ 8/15 campos               │
│  Score: 53/100 (Inteligência Média 🥈)                  │
│             ↓                                           │
│  [Pular tudo] [Salvar parcial] [Concluir] ← Flexível   │
└─────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  Dashboard → Gerar primeira campanha                    │
│  IA usa: Segmento + Logo + Cores + Intelligence (se     │
│  preenchido) → Campanha PERSONALIZADA ✨                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🚦 Critérios de Validação (QA Gate)

| Check | Critério | Como Testar |
|-------|----------|-------------|
| ✅ | Tempo Fase 1 < 2 min | Analytics + User testing (5 lojistas) |
| ✅ | Taxa conclusão Fase 1 ≥ 85% | % que chegam à Tela 4/4 |
| ✅ | Segmento sempre capturado | 100% stores têm main_segment NOT NULL |
| ✅ | Logo: 70%+ fazem upload OU usam IA | % logo_url NOT NULL pós-onboarding |
| ✅ | Cores: 80%+ customizam | % stores com cores ≠ padrão (#16A34A, #2563EB) |
| ✅ | Fase 2: 30%+ abrem modal | % que clicam "Calibrar inteligência" |
| ✅ | Fase 2: Média 8/15 campos | Avg campos não-null em store_intelligence.context |
| ✅ | Primeira campanha aprovada: 70%+ | % campanhas aprovadas sem regeneração |
| ✅ | Mobile usability | Testar em iPhone/Android (touch targets ≥48dp) |
| ✅ | Perfil lojista (45-55 anos) | User testing: 3 lojistas reais completam sem ajuda |

---

## 📋 Checklist Técnico (para @dev)

### Backend
- [ ] Expandir API `/api/onboarding/store` (8 campos Fase 1)
- [ ] Criar API `/api/onboarding/intelligence` (PATCH para Fase 2)
- [ ] Upload logo: Supabase Storage bucket `store-logos`
- [ ] Job background: Validar logo/cores com @brand-designer
- [ ] Criar registro `store_intelligence` (context JSONB vazio por padrão)

### Frontend (Fase 1)
- [ ] 4 páginas: `/onboarding/store/{identity,location,contact,branding}`
- [ ] Componente `<SegmentSelector />` (ícones 64x64px, tappable 80x80px)
- [ ] Componente `<LogoUploader />` (drag & drop, preview, geração IA)
- [ ] Componente `<ColorPicker />` (duplo, extração automática do logo)
- [ ] Progress bar (1/4 → 4/4)
- [ ] Auto-save localStorage (recovery)

### Frontend (Fase 2)
- [ ] Modal `<IntelligenceCalibrationModal />` (5 abas, 15 campos)
- [ ] Score calculator (0-100 based on campos preenchidos)
- [ ] Persistência parcial (lojista pode salvar e voltar depois)

### Integrações
- [ ] Replicate API (geração de logo com Stable Diffusion)
- [ ] Vibrant.js ou ColorThief (extração de cores)
- [ ] ViaCEP ou IBGE API (autocomplete cidade/estado)
- [ ] Validação WCAG AA (@brand-designer)

---

## 🎯 Próxima Ação

**Decisão necessária (time):**
1. ✅ Aprovar estrutura de 8 campos (Fase 1) + 15 campos (Fase 2)?
2. ✅ Aprovar fluxo de 4 telas progressivas?
3. ✅ Prioridade: Implementar Fase 1 primeiro, Fase 2 em sprint seguinte?
4. ⚠️ Geração de logo com IA é MVP ou pode ficar pra depois?
5. ⚠️ Extração automática de cores é MVP ou pode ficar pra depois?

**Recomendação da Uma:**
- **Sprint 1:** Implementar Fase 1 (4 telas, 8 campos) SEM geração IA (fallback: "Vou adicionar depois")
- **Sprint 2:** Adicionar geração de logo com IA + extração de cores
- **Sprint 3:** Implementar Fase 2 (modal intelligence)

**Motivo:** Entrega incremental de valor, validação com usuários reais em cada sprint.

---

**🎨 Criado por:** @ux-design-expert (Uma)  
**📄 Documento completo:** `docs/ux/onboarding-progressive-redesign.md`  
**🚀 Status:** Aguardando validação do time
