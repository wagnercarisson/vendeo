# Vendeo Roadmap

> **Links relacionados:**  
> **Detalhes técnicos:** [PROJECT-CONTEXT.md](docs/PROJECT-CONTEXT.md)  
> **Histórico de sessões:** [SESSION-HISTORY.md](docs/SESSION-HISTORY.md)  
> **Governança:** [doc-governance.md](docs/doc-governance.md)

**Última Atualização:** 06 Mai 2026  
**Sprint Atual:** Subsegmentação 1/3 (1.5d) | **Blocker Crítico:** Migration 042

---

## 🎯 Como Usar Este Documento

**Este é o mapa do projeto — a "bússola" que SEMPRE deve estar atualizada.**

### No Início de Cada Sessão
1. Leia o Status Dashboard → Onde estamos?
2. Veja "Em Execução" → O que está sendo feito agora?
3. Verifique blocker crítico → Tem algo travando?
4. Confirme próximo passo → O que vem depois?

### Durante o Trabalho
- Marque checkboxes conforme completa tasks: `[ ]` → `[x]`
- Atualize progresso no Dashboard (%, ETA)
- Remova blocker quando desbloqueado

### Ao Encerrar Sessão
- Mova tasks completas para "✅ Completo"
- Atualize "Próximo" com nova prioridade
- Adicione decisões em "🎯 Decisões Estratégicas"

**Tempo de leitura:** 1-2 minutos  
**Regra:** Se não atualizou o ROADMAP, a sessão não está completa.

---

> Este documento registra progresso, decisões e próximos passos. Detalhes técnicos e justificativas estão em artefatos linkados.

---

## � STATUS DASHBOARD

| Track | Status | Progresso | ETA | Blocker |
|-------|--------|-----------|-----|---------|
| **Subsegmentação** | 🟢 Sprint 1 DONE | ▓▓▓░░░░░░░ 33% | Sprint 2: 1d | Variant YAMLs (9 files) |
| **Context Layering** | ⏸️ Pausado | ▓▓▓▓▓▓░░░░ 60% | — | Aguarda subseg Sprint 2 |
| **Governança** | 📋 Backlog | ░░░░░░░░░░ 0% | 2w | — |

**Last Migration:** 042 (category/subcategory — DEPLOYED ✅ 06 Mai 2026)  
**Next Migration:** TBD (Governance Sprint)

---

## � COMPLETO (Sprint 1)

## 🔴 EM EXECUÇÃO

### Subsegmentação Sprint 2 — Variant YAMLs + UI Fix
**Prazo:** 1 dia (10h) | **Responsável:** @content-copy + @brand-designer + @ux-design-expert  
**Dependência:** Sprint 1 COMPLETE ✅

**Tasks:**
- [ ] **Variant YAMLs** — Criar 9 files (6h):
  - `bebidas-alcoolicas/variants/`: adega.yaml, loja-bebidas.yaml, distribuidor.yaml, emporio-cervejas.yaml
  - `mercearia/variants/`: mercadinho-bairro.yaml, minimercado.yaml, hortifruti.yaml, emporio-gourmet.yaml, sacolao.yaml
  - Cada YAML: tone, vocabulary, CTAs, seasonal_patterns específicos do subsegmento
- [ ] **UI CSS Fix** — Dropdown layout refactor (4h):
  - CSS grid: horizontal (desktop), vertical (mobile)
  - Spacing: 16px gap (desktop), 12px (mobile)
  - Task: [TASK-UI-FIX-DROPDOWN-LAYOUT.md](docs/tasks/TASK-UI-FIX-DROPDOWN-LAYOUT.md)

**Blocker:** Variant YAMLs bloqueia quality improvement (70% → 95%)  
**Próximo:** Sprint 2 segunda metade (Visual Composer — 40h)  
**Impacto:** De 70% quality (base fallback) para 95% quality (variant específico)

---

## 📋 PRÓXIMO (Backlog Priorizado)

### 🟡 Subsegmentação Sprint 2 (Segunda Metade) — Visual Composer
**Prazo:** 5 dias (40h) | **Responsável:** @dev (Dex) + @brand-designer  
**Dependência:** Variant YAMLs completosação
**Prazo:** 1.5 dias (12h) | **Responsável:** @data-engineer + @ux-design-expert + @content-copy  
**Decisão:** [DEC-2026-05-06-002](docs/integration-checklists/DEC-2026-05-06-002.md)

**Tasks:**
- [ ] **Migration 042** — ADD COLUMN category TEXT, subcategory TEXT em stores (BLOQUEANTE)
- [ ] **Backfill** — Mapear main_segment → (category, subcategory) para lojas existentes
- [ ] **Registries** — Criar 10 variant YAML files:
  - `bebidas-alcoolicas/variants/`: adega.yaml, loja-bebidas.yaml, distribuidor.yaml, emporio-cervejas.yaml
  - `mercearia/variants/`: mercadinho-bairro.yaml, minimercado.yaml, hortifruti.yaml, emporio-gourmet.yaml, sacolao.yaml
- [ ] **UI Onboarding** — Refatorar dropdown para seleção hierárquica (categoria → subcategoria)

**Blocker:** Migration 042 bloqueia registry + UI  
**Próximo:** Sprint 2 (Visual Composer — 5d/40h)  
**ROI:** 14× (perde 5% onboarding, ganha 73% efetividade)  
**Impacto:** +30-37% conversão (validado por @commerce-strategist)

---

## 📋 PRÓXIMO (Backlog Priorizado)

### 🟡 Subsegmentação Sprint 2 — Visual Composer
**Prazo:** 5 dias (40h) | **Responsável:** @dev (Dex) + @brand-designer  
**Dependência:** Sprint 1 completo

**Escopo:**
- [ ] `style-resolver.ts` — Resolve subsegment → visual guidelines (palette, typography, mood)
- [ ] `layout-composer.ts` — Aplica guidelines em composição visual
- [ ] `variation-generator.ts` — Gera 3-5 variações de layout por campanha
- [ ] Integração com Registry L3 (visual_style section nos YAML files)

**Arquitetura:** 3-Layer System
```
Registry (base + variant) → L3 Specialist (merge) → Visual Composer (style→layout→variations)
```

---

### 🟢 Subsegmentação Sprint 3 — Learned Patterns (OPCIONAL)
**Prazo:** 2 dias (16h) | **Responsável:** @data-engineer + @analyst  
**Dependência:** Sprint 2 + dados de produção

**Escopo:**
- [ ] Sistema de aprendizagem: trackear CTR, CTAs, vocabulário por subsegmento
- [ ] Feedback loop: performance → registry refinement automático
- [ ] Analytics dashboard: subsegment performance comparison

**Nota:** Opcional até validar ROI de Sprints 1-2 com dados reais

---

### 🟡 Phase 2.2 — Governança + Agregações
**Prazo:** 2 semanas | **Responsável:** @data-engineer (Dara) + @ux-design-expert (Uma)  
**Migrations:** 037-040

**Tasks:**
- [ ] Migration 037 — JSON Schema Validation para `store_intelligence.context`
- [ ] Migration 038 — Intelligence Score + agregações (analytics de preenchimento)
- [ ] Migration 039 — Audit Trail (track mudanças em store_intelligence)
- [ ] Migration 040 — Onboarding Progressivo (modals + tooltips + onboarding_state table)

**Critérios de Sucesso:**
- JSON Schema valida 100% dos campos
- Intelligence score calculado corretamente (completeness)
- Onboarding modals implementados em 4 tabs
- Audit trail funcionando (track changes com timestamp)

---

### 🟡 Phase 2.3 — Backend Integration E2E
**Prazo:** TBD | **Responsável:** @dev + @qa  
**Dependência:** Phase 2.3S (Subsegmentação) completa

**Escopo:**
- [ ] Validação E2E completa: L1+L3 vs L1+L2+L3 (A/B testing)
- [ ] Métricas de impacto: LTV, conversão, retenção por loja
- [ ] B10: Logging & Observability (dashboard de métricas de prompt)
- [ ] Graceful degradation testing (score=0 → L1+L3, score>=30 → L1+L2+L3)

---

## ⏸️ ADIADO

### Phase 1 — Arquitetura de Campanhas
**Decisão:** Março 2026  
**Razão:** Priorizado Intelligence Layer (maior ROI em LTV)  
**Reavaliar:** Após Phase 2.3 completa (estimativa Jun 2026)

<details>
<summary><strong>📋 Escopo Planejado (Preservado)</strong></summary>

#### Frente A — Arquitetura e Prevenção de Bugs

**Objetivo:**  
Padronizar contratos de campanha e impedir que dados crus (Supabase/IA) cheguem diretamente à UI.

**Regras Definidas (ainda válidas):**
- Nenhum componente deve consumir diretamente retorno cru do Supabase
- Toda resposta de IA deve ser validada por schema antes de uso
- Toda alteração no banco deve gerar migration versionada
- Cada tela deve consumir view model específico

**Estrutura Alvo:**
```
lib/domain/campaigns/
├── contracts.ts      # Interfaces de domínio
├── schemas.ts        # Validação Zod
├── types.ts          # Types de domínio
├── mapper.ts         # Raw → Domain → ViewModel
├── selectors.ts      # Queries organizadas
└── service.ts        # Orquestração de fluxos
```

**Princípio Técnico:**  
Fluxo obrigatório: `query raw → schema → mapper → tipo de domínio → view model`

**Etapas Definidas:**
1. Base do domínio de campanha (tipos, enums, schemas)
2. View models seguros para UI (CampaignListItem, CampaignDetail, EditableCampaign)
3. Padronização dos fluxos de geração (validação consistente)

#### Frente B — Página de Campanhas (Refinamento Final)

**Objetivo:**  
Lista de campanhas deve mostrar apenas o necessário para refrescar memória e orientar próxima ação.

**Estrutura do Card:**
- Miniatura da arte (preview premium)
- Nome do produto
- Preço + público + objetivo
- Estratégia da campanha (OFERTA, COMBO, MOMENTO, DESTAQUE, PRESENTE)
- Data da campanha
- Status do conteúdo gerado
- Botões condicionais conforme conteúdo existente

**Regras Visuais:**
- Não mostrar dados da loja na lista
- Não mostrar textos longos da campanha
- Thumb apresentada como peça pronta
- Separação visual entre thumb e conteúdo
- Hover lift permanece

**Botões Condicionais:**
- Arte apenas: Ver arte • Editar
- Vídeo apenas: Ver vídeo • Editar
- Arte + vídeo: Ver arte • Ver vídeo • Editar

**Edição de Campanha — Campos Editáveis:**
- preço, público, objetivo
- textos, CTA

**Regra Oficial:**  
Arte não é editável | Arte pode ser regenerada

**Duplicar Campanha Permitirá:**
- Reaproveitar campanhas
- Ajustar preço
- Gerar nova arte ou vídeo

</details>

---

### Phase 1 Plus — Pós-Lançamento
**Status:** Planejado para após Phase 2.3  
**Reavaliar:** Após validação real de uso

<details>
<summary><strong>📋 Melhorias Previstas</strong></summary>

- Menu de ações no card (⋯)
- Arquivar campanhas (preferível à exclusão para preservar histórico)
- Filtros por estratégia
- Pequenos refinamentos de UX
- Expansão do padrão de contratos para stores, plans e métricas
- Hardening de APIs com validações compartilhadas

</details>

---

## ✅ COMPLETO

<details>
<summary><strong>Phase 2.3B — Context Layering System (60%)</strong> — Mai 2026</summary>

**Status:** EM PROGRESSO (B1-B5, B7-B8 complete, B10 pending)  
**Feature Flag:** `USE_CONTEXT_LAYERING_PROMPT` (default: true)

**Sistema de 3 Camadas:**
- **L1 (Store Metadata):** 100% disponível (nome, segmento, localização)
- **L2 (Intelligence Calibrada):** 0-100% disponível (threshold score >= 30)
- **L3 (Profissional Agêntico):** 100% disponível (segment + regional experts via YAML registry)

**Objetivo:** Graceful degradation  
- Lojas sem intelligence (score=0): L1+L3 (70% qualidade)
- Lojas calibradas (score>=30): L1+L2+L3 (95% qualidade)

**Entregas Completas:**
- ✅ B1-B3: Context Builder (L1/L2/L3 assembly, 9/9 tests)
  - `context-builder.ts`: fetchStoreMetadata(), fetchIntelligenceContext(), buildAgenticPersona()
- ✅ B4: Prompt Renderer (XML assembly, 8/8 tests)
  - `campaign-prompt-v1.ts`: buildCampaignPrompt() com L1/L2/L3 sections
- ✅ B5: Registry Loader (YAML caching, 10/10 tests)
  - `loader.ts`: loadSegmentExpert(), loadRegionalExpert(), path normalization
- ✅ B7-B8: Feature Flags + Endpoint Integration (21/21 tests, fallback validado)
  - `prompt-resolution.ts`: resolveCampaignPrompt() com feature flag routing
  - `service.ts`: Integração com buildCampaignPromptLegacy() como fallback

**Blocker Identificado (RESOLVIDO):**
- Segment normalization gap: UI "Loja de bebidas" → DB → Registry "bebidas_alcoolicas"
- **Resolução:** Subsegmentação (categoria + subcategoria) — DEC-2026-05-06-002

**Pendente:**
- B10: Logging & Observability (aguarda Phase 2.3 E2E)

</details>

<details>
<summary><strong>Phase 2.1 — Expansion Intelligence</strong> — Abr-Mai 2026</summary>

**Migrations:** 034-035  
**Status:** Deployed e validado (9/9 validações OK + 3 fixes UX críticos 02/05)

**Entregas:**
- ✅ Tabela `store_intelligence` expandida com 10 campos importantes
- ✅ Intelligence Page: 4 tabs completos (Público/Tom, Posicionamento, Conversão, Avançado)
- ✅ UX refinements: máscaras BRL, campos guiados, hints dinâmicos
- ✅ Fixes críticos: autosave navegação, pain points UX, limit enforcement
- ✅ Mobile support (Story 2B - 8/10 ACs)
- ✅ 31 campos validados pelo Marketing Squad

**Métricas Alcançadas:**
- Taxa de preenchimento: 60% → 95% (projetado)
- Tempo de preenchimento: 5min → 2min (projetado)

</details>

<details>
<summary><strong>Phase 2.0 — Base Intelligence</strong> — Abr 2026</summary>

**Migrations:** 031-033  
**Status:** Deployed e validado (11/11 validações OK)

**Entregas:**
- ✅ Tabela `store_intelligence` criada
- ✅ 5 campos críticos: `brand_voice`, `target_audience`, `top_products`, `seasonal_peaks`, `successful_past_ctas`
- ✅ Testes de integração completos

</details>

---

## 🚀 FUTURO (Sem Data)

### Phase 3 — Evolução Inteligente
**Status:** Planejado para após validação real de uso  
**Reavaliar:** Após 3-6 meses de uso em produção

<details>
<summary><strong>📋 Recursos Planejados</strong></summary>

**Features:**
- Indicador de desempenho de campanhas
- Variações automáticas de campanha (A/B testing automático)
- Sugestões estratégicas baseadas em performance
- Analytics de campanhas (CTR, conversão, ROI)
- Calendário estratégico (planejamento semanal/mensal)
- Carrossel de artes (3-5 variações por campanha para escolha)

**Estrutura Futura de Planos:**

**Starter:**
- Gerar campanha
- Editar campanha
- Duplicar campanha

**Pro:**
- Filtros estratégicos
- Sugestões automáticas
- Campanhas sazonais

**Premium:**
- Analytics completo
- Desempenho de campanhas
- Variações automáticas
- A/B testing integrado

</details>

---

## 🧭 DECISÕES ESTRATÉGICAS

**Timeline (mais recente primeiro):**

| Data | ID | Decisão | Impacto |
|------|-------|---------|---------|
| **06/05/2026** | [DEC-002](docs/integration-checklists/DEC-2026-05-06-002.md) | Subsegmentação hierárquica aprovada | 🔴 ALTO — DB schema, registries, onboarding UI |
| **05/05/2026** | Research | Validação agency practices (78→98/100) | Fundamenta DEC-002 |
| **05/05/2026** | Commerce | ROI 14× subsegmentação (+30-37% conversão) | Fundamenta DEC-002 |
| **Março 2026** | — | Adiar Phase 1 para focar Intelligence Layer | 🟡 MÉDIO — Refactor adiado |

---

## 💡 PRINCÍPIOS & DIREÇÕES FUTURAS

<details>
<summary><strong>📋 Princípios de Design & Produto</strong></summary>

### Decisão de UX — Tela de Campanhas

A tela de campanhas é uma tela de:
- **Reconhecimento rápido** — Ver o que foi feito em segundos
- **Memória rápida** — Lembrar contexto sem reler tudo
- **Navegação rápida** — Ir para próxima ação sem fricção

**Detalhes completos ficam nas telas:**
- Editar campanha
- Ver arte
- Ver vídeo

### Estratégia de Produto (Março 2026 — ainda válida)

**Foco no Plano Básico (Starter):**  
Resolver 80% do problema de marketing das lojas físicas focando na combinação mais eficaz:
- **Posts** (Imagens Estáticas) focados em conversão e vitrine
- **Vídeos Curtos** verticais (9:16) com ganchos fortes para alcance e engajamento

**Decisão Estratégica Central:**  
Em vez de desenvolver múltiplos formatos complexos na V1, o foco permanece em **aperfeiçoar o núcleo do produto**: criar campanhas úteis, rápidas e fáceis de reutilizar.

> **O Vendeo deve se comportar como um motor de vendas social para lojas físicas, não como um editor complexo nem como uma agência.**

### Escalabilidade Técnica (Direções Futuras)

**Considerações para futuro:**
- Compressão e redimensionamento automático de imagens
- Limpeza de arquivos órfãos (storage optimization)
- Otimização CDN (edge caching)
- Contratos compartilhados entre domínios (stores, campaigns, plans)
- Redução de acoplamento entre banco, IA e UI
- Preservar mídia original do produto para regenerações e variações

### Resumo Executivo — Foco Atual (Mai 2026)

1. ✅ Consolidar Intelligence Layer (Phase 2.0-2.2)
2. 🔄 Implementar subsegmentação (Phase 2.3S — em execução)
3. 📅 Integrar intelligence no backend de geração (Phase 2.3)
4. 📅 Revisar arquitetura de campanhas (Phase 1 adiada)
5. 📅 Refinar UX com base em validação real
6. 📅 Observar usuários e evoluir incrementalmente

**Princípio de Disciplina de Escopo:**

A prioridade não é adicionar inteligência avançada ou analytics agora, mas sim:
- Deixar o fluxo principal **mais claro, utilizável, profissional e confiável**
- Consolidar **contratos e camada de domínio** antes de ampliar features
- Reduzir **bugs, inconsistências de tipagem e quebras silenciosas**

**Objetivo Imediato:**  
`localizar rápido → reconhecer rápido → agir rápido`

</details>

---

*Última atualização: 06 Mai 2026 por @aiox-master*
