# Phase 2.3 — Backend Integration: Execution Tracker

**Data Início:** 04 Mai 2026  
**Status Atual:** 🟢 PHASE 2.3B IN PROGRESS — A: 85% (6/10) | B: 60% (6/10) | Overall: ~45%  
**Última Atualização:** 05 Mai 2026 23:45

---

## 📋 ÍNDICE RÁPIDO

- [Contexto & Decisão Arquitetural](#contexto--decisão-arquitetural)
- [Arquitetura: Context Layering (L1/L2/L3)](#arquitetura-context-layering-l1l2l3)
- [Tasks Overview](#tasks-overview)
- [Phase 2.3A: Research & Design](#phase-23a-research--design)
- [Phase 2.3B: Implementation](#phase-23b-implementation)
- [Phase 2.3C: Validation](#phase-23c-validation)
- [Decisões Tomadas](#decisões-tomadas)
- [Riscos & Mitigações](#riscos--mitigações)
- [Bloqueios Ativos](#bloqueios-ativos)

---

## 🎯 CONTEXTO & DECISÃO ARQUITETURAL

### Problema Identificado (04 Mai 2026)

**Insight crítico do lojista:**
> "Mesmo que a intelligence esteja em zero, a IA deve 'entender' quem é o lojista (Adega do João - São Paulo - SP - rua fulano de tal) = IA deve buscar o contexto da adega, incorporar um agente de marketing especializado em adegas, para a capital SP, dentro da vizinhança da rua fulano de tal, para entregar o melhor possível nesse sentido."

**Problema arquitetural:**
- Esboço inicial tratava `store_intelligence.context` como ÚNICA fonte de personalização
- Isso falharia com intelligence score = 0 (store nova sem calibração)
- **Risco:** Campanhas genéricas mesmo com dados básicos da loja disponíveis

### Decisão Arquitetural: Context Layering

**Estratégia aprovada:** 3 camadas de contexto hierárquicas (L1 + L2 + L3)

| Layer | Fonte | Disponibilidade | Exemplo |
|-------|-------|----------------|---------|
| **L1: Store Metadata** | `stores` table (DB) | 100% sempre | Nome, segmento, localização, ticket médio |
| **L2: Intelligence Calibrada** | `store_intelligence.context` | 0-100% gradual | brand_voice, target_audience, seasonal_peaks |
| **L3: Profissional Agêntico** | Prompt Engineering + LLM | 100% emergente | Especialista regional + segmento com "sotaque" local |

**Ganho marginal de L2:**
- L1 + L3 (sem intelligence) → Baseline 70% qualidade
- L1 + L2 + L3 (com intelligence) → Target 95% qualidade
- **Degradação graceful:** Sistema NUNCA gera conteúdo genérico

---

## 🏗️ ARQUITETURA: Context Layering (L1/L2/L3)

### L1: Store Metadata (Database - SEMPRE disponível)

**Fonte:** `stores` table + `store_intelligence` table
**Campos usados:**
```typescript
{
  segment: "bebidas_alcoolicas",        // stores.segment
  subSegment: "adega",                  // stores.sub_segment (se existir)
  location: {
    city: "São Paulo",                  // stores.city
    state: "SP",                        // stores.state
    region: "capital",                  // derivado
    neighborhood: "Vila Mariana",       // stores.address parsing
    address: "Rua Fulano, 123"          // stores.address
  },
  businessProfile: {
    name: "Adega do João",              // stores.name
    yearsInBusiness: 5,                 // calculated from stores.created_at
    avgTicket: 150                      // store_intelligence context ou derivado
  }
}
```

**Status:** ✅ Dados já existem no DB (nenhuma migration necessária)

---

### L2: Intelligence Calibrada (JSONB - 0-100% preenchimento)

**Fonte:** `store_intelligence.context` JSONB field
**Estratégia de fallback:**
- Score < 30%: Ignorar L2, usar apenas L1 + L3
- Score 30-70%: Usar campos preenchidos, fallback para L3 nos vazios
- Score > 70%: Usar 100% do contexto calibrado

**Campos priorizados (top 10 por impacto):**
1. `brand_voice` — Tom de comunicação
2. `target_audience` — Público-alvo
3. `unique_selling_proposition` — Diferencial competitivo
4. `seasonal_peaks` — Sazonalidade
5. `successful_past_ctas` — CTAs testados
6. `conversion_triggers` — Gatilhos de urgência
7. `price_positioning` — Posicionamento de preço
8. `competitors` — Concorrência
9. `customer_pain_points` — Dores do cliente
10. `local_events_calendar` — Eventos locais

**Status:** ✅ Estrutura já existe (migrations 037-041 deployed)

---

### L3: Profissional Agêntico (Prompt Engineering - SEMPRE disponível)

**Fonte:** Registry de especialistas + Geração emergente do LLM
**Componentes:**

#### 3.1. Segment Experts Registry
**Estrutura:**
```yaml
bebidas_alcoolicas:
  title: "Especialista em Marketing para Adegas e Distribuidoras"
  expertise:
    - "Padrões de consumo por estação (verão = cerveja, inverno = vinho)"
    - "Gatilhos de urgência (happy hour, finais de semana, feriados)"
    - "Linguagem do setor (harmonização, teor alcoólico, origem)"
  seasonal_patterns:
    verao: ["Cervejas artesanais", "Vinhos rosés", "Espumantes"]
    inverno: ["Vinhos tintos robustos", "Destilados", "Harmonização com fondue"]
  conversion_triggers:
    - "Happy hour (17h-20h)"
    - "Finais de semana (sexta após 18h)"
    - "Eventos esportivos (Copa, Olimpíadas)"

moda:
  title: "Especialista em Marketing para Moda e Vestuário"
  # ...

farmacia:
  title: "Especialista em Marketing para Farmácias e Drogarias"
  # ...
```

**Status:** � COMPLETED (04 Mai 2026 18:45)

**Arquivos criados:**
- ✅ `lib/ai/prompts/registries/bebidas-alcoolicas/segment-expert.yaml` (380 tokens)
- ✅ `lib/ai/prompts/registries/mercearia/segment-expert.yaml` (350 tokens)

#### 3.2. Regional Experts Registry
**Estrutura:**
```yaml
"SP-capital":
  cultural_context: "Sotaque paulistano, cultura cosmopolita, ritmo acelerado"
  local_events:
    - "Virada Cultural (maio)"
    - "Carnaval de rua (fevereiro)"
    - "Réveillon Paulista (31 dez)"
  linguistic_markers:
    - "Mano/Cara (informal)"
    - "Trânsito/Mobilidade (dor diária)"
    - "Metrô como referência de localização"
  competitive_context:
    bebidas: ["Carrefour", "St. Marché", "Pão de Açúcar (preço)", "Adegas de bairro (curadoria)"]
  seasonal_specifics:
    verao: "Dezembro a março — calor intenso, alta demanda por cervejas"
    inverno: "Junho a agosto — frio moderado, vinhos tintos e espumantes"

"RJ-capital":
  cultural_context: "Sotaque carioca, cultura praiana, lifestyle relaxado"
  # ...

"MG-capital":
  cultural_context: "Sotaque mineiro, cultura hospitaleira, tradição familiar"
  # ...
```

**Status:** 🟢 COMPLETED (04 Mai 2026 18:45)

**Arquivos criados:**
- ✅ `lib/ai/prompts/registries/bebidas-alcoolicas/regional/SP-capital.yaml` (295 tokens)
- ✅ `lib/ai/prompts/registries/bebidas-alcoolicas/regional/RJ-capital.yaml` (280 tokens)
- ✅ `lib/ai/prompts/registries/bebidas-alcoolicas/regional/MG-capital.yaml` (285 tokens)
- ✅ `lib/ai/prompts/registries/mercearia/regional/SP-capital.yaml` (250 tokens)
- ✅ `lib/ai/prompts/registries/mercearia/regional/RJ-capital.yaml` (240 tokens)
- ✅ `lib/ai/prompts/registries/mercearia/regional/MG-capital.yaml` (245 tokens)

---

### Arquitetura de Prompt (Proposta)

```typescript
// Módulos de geração de prompt
function buildCampaignPrompt(storeId: string, campaignType: string): string {
  const L1 = fetchStoreMetadata(storeId)          // DB query
  const L2 = fetchIntelligenceContext(storeId)    // DB query + score check
  const L3 = buildAgenticPersona(L1.segment, L1.location)  // Registry lookup

  return `
## VOCÊ É:
${L3.persona}

## CONTEXTO DA LOJA:
${formatStoreContext(L1)}

## CALIBRAÇÃO DO LOJISTA:
${L2.score >= 30 ? formatIntelligenceContext(L2) : "⚠️ Loja sem calibração — usar expertise de mercado"}

## EXPERTISE REGIONAL:
${L3.regionalContext}

## TAREFA:
Crie uma campanha de ${campaignType} para ${L1.name}.
${L2.score >= 70 ? "Use PRIORITARIAMENTE as preferências calibradas do lojista." : ""}
`
}
```

**Status:** 🔴 NÃO IMPLEMENTADO — Design em validação

---

## 📊 TASKS OVERVIEW

### Legenda de Status
- 🔴 **NOT STARTED** — Task não iniciada
- 🟡 **IN PROGRESS** — Task em execução
- 🟢 **COMPLETED** — Task finalizada e validada
- ⏸️ **BLOCKED** — Task bloqueada (ver seção Bloqueios)
- 🔵 **APPROVED** — Task revisada e aprovada por stakeholder

---

### Phase 2.3A: Research & Design (5-7 dias estimados)

**Objetivo:** Definir arquitetura, registries e estratégia de prompts

| # | Task | Agent(s) | Status | Data | Notas |
|---|------|----------|--------|------|-------|
| A1 | ADR: Context Layering Architecture | @architect | � | 04 Mai 2026 | Interface L1/L2/L3, fallback strategy, extensibility, registry vertical |
| A2 | Segment Experts Registry (2 segmentos MVP) | @analyst + @prompt-eng | 🟢 | 04 Mai 2026 | bebidas_alcoolicas, mercearia — 2/2 YAML files created ✅ |
| A3 | Regional Experts Registry (3 regiões × 2 segmentos) | @analyst | 🟢 | 04 Mai 2026 | SP-capital, RJ-capital, MG-capital — 6/6 YAML files created ✅ |
| A4 | Prompt Template Modular (v1) | @prompt-eng | 🟢 | 04 Mai 2026 | `campaign-prompt-v1.ts` with XML sections, L1/L2/L3 assembly, fallback logic ✅ |
| A5 | Few-shot Examples (3 por segmento) | @prompt-eng | 🔴 | — | Exemplos de sucesso para cada segmento |
| A6 | Token Budget Analysis | @prompt-eng + @architect | 🟢 | 04 Mai 2026 | `phase-2.3-token-budget-analysis.md` with 4 scenarios, truncation rules ✅ |
| A7 | MVP Scope Definition | @pm | 🔴 | — | Quais segmentos/regiões no v1? |
| A8 | Success Metrics Definition | @pm + @analyst | 🔴 | — | Baseline vs. personalizado (taxa aprovação, LTV) |
| A9 | PoC: Prompt com L1+L3 (sem intelligence) | @prompt-eng + @dev | 🔴 | — | Testar com 3 stores reais (score=0) |
| A10 | PoC: Prompt com L1+L2+L3 (intelligence completa) | @prompt-eng + @dev | 🔴 | — | Testar com 3 stores reais (score>70) |

**Entregáveis:**
- [ ] `docs/architecture/ADR-context-layering.md`
- [ ] `lib/ai/prompts/registries/segment-experts.yaml`
- [ ] `lib/ai/prompts/registries/regional-experts.yaml`
- [ ] `lib/ai/prompts/templates/campaign-prompt-v1.ts`
- [ ] `docs/phase-2.3-poc-results.md` (comparação baseline vs. L1+L3 vs. L1+L2+L3)

---

### Phase 2.3B: Implementation (7-10 dias estimados)

**Objetivo:** Implementar Context Builder, Prompt Renderer e integrar no endpoint

| # | Task | Agent(s) | Status | Data | Notas |
|---|------|----------|--------|------|-------|
| B1 | Context Builder Service (L1) | @dev | ✅ | 05 Mai 2026 | fetchStoreMetadata(storeId) — Query stores table, region mapping, 2/2 tests ✅ |
| B2 | Context Builder Service (L2) | @dev | ✅ | 05 Mai 2026 | fetchIntelligenceContext(storeId) + RPC score extraction, 2/2 tests ✅ |
| B3 | Context Builder Service (L3) | @dev + @prompt-eng | ✅ | 05 Mai 2026 | buildAgenticPersona() + buildPromptContext() assembly, 5/5 tests ✅ |
| B4 | Prompt Renderer (Template Engine) | @dev | ✅ | 05 Mai 2026 | buildCampaignPrompt() — L1/L2/L3 integration, threshold logic, 8/8 tests ✅ |
| B5 | Registry Loader (YAML → runtime) | @dev | ✅ | 05 Mai 2026 | Loader + cache + type guards + clearRegistryCaches(), 10/10 tests ✅ |
| B6 | Token Optimizer (truncate > 8K) | @dev + @prompt-eng | 🔴 | — | Priorizar L1 > L3 > L2 (SKIP: otimização prematura) |
| B7 | Feature Flag System | @dev | 🔴 | — | `useL3Persona`, `intelligenceThreshold`, rollback |
| B8 | Integração em `/api/generate/route.ts` | @dev | 🔴 | — | Substituir prompt genérico por buildCampaignPrompt() — NEXT STEP |
| B9 | UI: Toggle "Usar Intelligence" | @dev | 🔴 | — | (Opcional) Permitir user desabilitar personalização |
| B10 | Logging & Observability | @dev | 🔴 | — | Log de qual layer foi usado (L1+L3 vs L1+L2+L3) |

**Entregáveis:**
- [x] `lib/domain/campaigns/context-builder.ts` ✅ 05 Mai 2026 — 320 lines, 9/9 tests passing
- [x] `lib/domain/campaigns/context-builder.test.ts` ✅ 05 Mai 2026 — Complete test coverage
- [x] `lib/ai/prompts/registries/loader.ts` ✅ 05 Mai 2026 — Refined with cache management + type guards
- [x] `lib/ai/prompts/registries/loader.test.ts` ✅ 05 Mai 2026 — 10/10 tests passing
- [x] `lib/ai/prompts/prompt-renderer.ts` ✅ 05 Mai 2026 — 260 lines, 8/8 tests passing, JSDoc complete
- [x] `lib/ai/prompts/prompt-renderer.test.ts` ✅ 05 Mai 2026 — Complete test coverage
- [ ] `lib/ai/prompts/token-optimizer.ts` — Skipped (otimização prematura, B6)
- [ ] Feature flags em `lib/constants/feature-flags.ts` — Pending (B7)
- [ ] Endpoint `/app/api/generate/route.ts` atualizado — Pending (B8)

---

### Phase 2.3C: Validation (5-7 dias estimados)

**Objetivo:** Testar A/B, validar métricas, ajustar baseado em dados

| # | Task | Agent(s) | Status | Data | Notas |
|---|------|----------|--------|------|-------|
| C1 | Test Suite: 20 cenários | @qa | 🔴 | — | Intelligence vazia, parcial, completa |
| C2 | Regression Tests | @qa | 🔴 | — | Campanhas sem intelligence não quebram |
| C3 | Performance Tests | @qa | 🔴 | — | Latência não aumenta > 10% |
| C4 | A/B Test: Baseline vs L1+L3 | @analyst + @qa | 🔴 | — | 20 campanhas cada |
| C5 | A/B Test: L1+L3 vs L1+L2+L3 | @analyst + @qa | 🔴 | — | 20 campanhas cada |
| C6 | Metrics Dashboard | @analyst | 🔴 | — | Taxa aprovação, tempo geração, engagement |
| C7 | Edge Cases: Campos nulos, valores extremos | @qa + @dev | 🔴 | — | Testar robustez |
| C8 | Regional Accuracy Validation | @analyst | 🔴 | — | "Sotaque" regional correto? Referências locais? |
| C9 | Segment Accuracy Validation | @analyst | 🔴 | — | Linguagem do setor correta? Timing adequado? |
| C10 | Final QA Gate | @qa | 🔴 | — | Checklist de 15 pontos |
| C11 | LTV Projection Analysis | @analyst | 🔴 | — | Cohort analysis: baseline vs. intelligence |
| C12 | Go/No-Go Decision | @pm | 🔴 | — | Review executivo de métricas |

**Entregáveis:**
- [ ] `tests/integration/phase-2.3-context-layering.test.ts`
- [ ] `docs/phase-2.3-ab-test-results.md`
- [ ] Dashboard de métricas (ferramenta a definir)
- [ ] `docs/phase-2.3-final-report.md` (LTV, taxa aprovação, impacto)

---

## ✅ DECISÕES TOMADAS

### DEC-001: Context Layering (3 layers)
**Data:** 04 Mai 2026  
**Decisor:** @aiox-master + Lojista  
**Contexto:** Esboço inicial só usava L2 (intelligence), falharia com score=0  
**Decisão:** Implementar L1 (metadata) + L2 (intelligence) + L3 (persona agêntica)  
**Rationale:** Degradação graceful — qualidade NUNCA cai abaixo de 70% mesmo sem calibração  
**Impacto:** +30% complexidade de implementação, -90% risco de campanhas genéricas  

### DEC-002: MVP Scope (Segmentos/Regiões)
**Data:** 04 Mai 2026  
**Decisor:** Lojista + @analyst  
**Contexto:** Lojista priorizou 2 segmentos com melhor retorno para Vendeo  
**Decisão:** 2 segmentos (bebidas_alcoolicas + mercearia) × 3 regiões (SP/RJ/MG)  
**Rationale:** Valida estrutura vertical com 2 casos reais, mantém escopo controlado (6 arquivos)  
**Status:** ✅ RESOLVIDA  

### DEC-003: [Pendente] Template Engine
**Data:** —  
**Decisor:** @architect + @dev  
**Proposta:** Handlebars vs. Template literals vs. Custom DSL  
**Status:** 🔴 PENDENTE — Aguarda ADR de @architect  

### DEC-004: [Pendente] Story Creation
**Data:** —  
**Decisor:** @aiox-master  
**Contexto:** Lojista mencionou "considere o acionamento do agente sm e po na composição e validação das stories"  
**Decisão:** TBD — Avaliar após A10 (PoC completo) se complexidade justifica stories formais  
**Status:** 🟡 EM AVALIAÇÃO

### DEC-005: Registry Verticalizado por Segmento
**Data:** 04 Mai 2026  
**Decisor:** @aiox-master + Lojista  
**Contexto:** Lojista identificou risco de token budget + dispersão da IA com registry horizontal  
**Decisão:** Estrutura vertical (1 pasta por segmento) com lazy loading  
**Rationale:** -82% tokens L3 (5.5K → 1K), especialização regional por segmento, manutenção modular  
**Impacto:** Resolve BLOCK-001 implicitamente, reduz R3 (prompts longos), facilita escalabilidade  
**Status:** ✅ RESOLVIDA  

### DEC-006: B6 Token Optimizer SKIP
**Data:** 05 Mai 2026  
**Decisor:** @aiox-master  
**Contexto:** Token budget analysis mostrou prompts em 800-1200 tokens (< 15% do limite 8K)  
**Decisão:** Pular B6 (otimização prematura) e avançar direto para B8  
**Rationale:** ROI baixo, complexidade alta, não é gargalo real  
**Status:** ✅ RESOLVIDA  

### DEC-007: B8 Endpoint Integration Complete
**Data:** 05 Mai 2026 23:30  
**Decisor:** @dev (Dex)  
**Contexto:** Integração do prompt-renderer em generateCampaignContent()  
**Decisão:** Implementado com feature flag, fallback automático, e logging  
**Entregas:** prompt-resolution.ts (95 lines, 4/4 tests), service.ts integration, legacy deprecation  
**Testes:** 21/21 unit tests passing, fallback validado em testes manuais  
**Status:** ✅ COMPLETE  

### DEC-008: [BLOCKER] Segment Normalization Gap
**Data:** 05 Mai 2026 23:40  
**Decisor:** PENDENTE (usuário solicitou discussão)  
**Contexto:** UI labels ("Loja de bebidas", "Adega") não mapeiam diretamente para registry slugs ("bebidas_alcoolicas")  
**Problema:** Testes E2E bloqueados — usuário precisa usar label exato "Adegas e Distribuidoras" para funcionar  
**Impacto:** Experiência do usuário ruim, fallback excessivo, registry subutilizado  
**Propostas:**
1. Estratégia 1 (MVP): Dicionário de normalização em loader.ts (~15min)
2. Estratégia 2 (Médio): Registry hierárquico com variants (~1 semana)
3. Estratégia 3 (Longo): Normalização no DB com SQL enum (~2-3 dias)
**Status:** 🔴 BLOCKED — Aguarda decisão do usuário após retorno

---

## 🚨 RISCOS & MITIGAÇÕES

| ID | Risco | Prob. | Impacto | Mitigação | Status |
|----|-------|-------|---------|-----------|--------|
| R1 | Persona genérica (não especializa) | Alta | Crítico | Registry mantido manualmente + validação com lojistas reais | 🟡 Monitorar |
| R2 | Sotaque/cultura errada | Média | Alto | Beta test com lojistas de cada região antes de deploy | 🔴 Não mitigado |
| R3 | Prompts muito longos (> 8K tokens) | Alta | Alto | Token optimizer prioriza L1 > L3 > L2, trunca se necessário | 🟡 Design em validação |
| R4 | LLM não infere corretamente sem L2 | Média | Médio | Few-shot examples no prompt (3 por segmento) | 🟡 Pending @prompt-eng |
| R5 | Refatoração futura (arquitetura errada) | Baixa | Crítico | ADR documenta decisões, migrations versionam schema | 🟢 Mitigado (ADR obrigatório) |
| R6 | Latência aumenta > 20% | Baixa | Médio | Context caching, lazy loading, performance tests (C3) | 🔴 Não testado |
| R7 | Registry desatualizado (novos segmentos) | Média | Baixo | Processo de onboarding de novos segmentos documentado | 🔴 Não definido |

---

## 🚧 BLOQUEIOS ATIVOS

### ~~BLOCK-001: Definição de MVP Scope~~ ✅ RESOLVIDO
**Bloqueava:** A2, A3, A7  
**Resolução:** DEC-002 — 2 segmentos × 3 regiões (bebidas + mercearia)  
**Data:** 04 Mai 2026  
**Status:** ✅ DESBLOQUEADO  

### BLOCK-002: ADR de Context Layering
**Bloqueando:** B1-B10  
**Responsável:** @architect (Aria)  
**Detalhes:** Interface entre L1/L2/L3 precisa ser formalmente definida antes de implementação  
**Impacto:** Sem ADR, risco de refatoração durante implementação  
**Prazo:** 🟡 ALTA PRIORIDADE — Pode iniciar A2/A3 em paralelo, mas bloqueia B1  

---

## 📝 LOG DE ATUALIZAÇÕES

| Data | Autor | Mudança | Seção Afetada |
|------|-------|---------|---------------|
| 04 Mai 2026 17:30 | @aiox-master | Criação inicial do tracker | Todas |
| 04 Mai 2026 18:05 | @architect | Início da Task A1 (ADR Context Layering) | Phase 2.3A |
| 04 Mai 2026 18:15 | @prompt-eng | Análise técnica de L3 + registry determinístico | Phase 2.3A |
| 04 Mai 2026 18:25 | @aiox-master | DEC-005 (registry vertical) + DEC-002 (MVP 2 segmentos) | Decisões |
| 04 Mai 2026 18:25 | @architect | ADR revisado com registry vertical | A1 |
| 04 Mai 2026 18:25 | @aiox-master | BLOCK-001 resolvido, A2/A3 desbloqueadas | Bloqueios |
| 04 Mai 2026 18:45 | @analyst | Task A2/A3 COMPLETED — 8/8 YAML registries criados ✅ | Phase 2.3A |
| 04 Mai 2026 18:50 | @prompt-eng | Task A4 COMPLETED — `campaign-prompt-v1.ts` com template XML ✅ | Phase 2.3A |
| 04 Mai 2026 18:50 | @prompt-eng | Task A6 COMPLETED — `phase-2.3-token-budget-analysis.md` ✅ | Phase 2.3A |
| 04 Mai 2026 19:20 | @aiox-master | Convocação A2/A3 Review — Gap structure analysis | Phase 2.3A |
| 04 Mai 2026 19:30 | @analyst | Opção C aplicada — Mercearia registries enriquecidos ✅ | Phase 2.3A |
| 04 Mai 2026 19:40 | @aiox-master | YAML validation + correções — 8/8 arquivos válidos ✅ | Phase 2.3A |

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

1. **[AGORA]** Lojista aprova arquitetura de 3 layers (L1/L2/L3)?
   - ✅ Aprovado → Convocar @architect, @prompt-eng, @analyst
   - ❌ Revisar → Iterar proposta

2. **[APÓS APROVAÇÃO]** Resolver BLOCK-001 (MVP Scope)
   - Convocar @pm para decisão de segmentos/regiões
   - Input: 3 segmentos × 3 regiões (9 contextos) é viável?

3. **[PARALELO]** Iniciar A1 (ADR) com @architect
   - Resolver BLOCK-002 antes de começar implementação

4. **[DECISÃO]** DEC-004 (Story Creation)
   - Após PoC (A9/A10), avaliar se complexidade justifica stories formais
   - Se sim: Convocar @sm + @po

---

**Duração total estimada:** 17-24 dias úteis  
**Status atual:** 🔴 PLANNING  
**Bloqueios críticos:** 2 (BLOCK-001, BLOCK-002)  
**Próximo milestone:** Aprovação da arquitetura + resolução de BLOCK-001
