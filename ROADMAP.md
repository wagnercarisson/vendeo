# Vendeo - Roadmap e Decisões Estratégicas

**Última Atualização:** 03 Mai 2026 por @aiox-master  
**Status Atual:** Phase 2.2 — Governança Intelligence + Agregações (em planejamento)

Este documento centraliza as discussões sobre o futuro do produto, decisões estratégicas de roadmap e funcionalidades mapeadas para próximas fases.

---

## 📍 CONTEXTO ATUAL (Mai 2026)

**Status:** Beta/Pré-lançamento — Refinamento UX + Otimização de IA  
**Milestone Atual:** Phase 2.1 DEPLOYED (migrations 034-035)  
**Próximo Milestone:** Phase 2.2 — Governança Intelligence + Agregações (+2 semanas)  
**Última Migration:** 036 (logo_generations)  
**Próximas Migrations:** 037-040 (JSON Schema validation, agregações, governança)

**Decisão Estratégica (03/05/2026):**  
Foco em **Intelligence Layer** (Phase 2.2) como fundação para backend integration. Logo optimization (Sprint 2) adiado: não-bloqueante + custo adicional desnecessário em fase localhost. Prioridade: refatoração intelligence embarcada antes de expandir features visuais.

---

## 🎯 PHASE 2: MARKETING INTELLIGENCE LAYER (Em Execução)

**Objetivo:** Transformar geração de campanhas em motor inteligente que entende contexto comercial do lojista.

### Phase 2.0 — Base Intelligence (✅ COMPLETA 30/04)
**Migrations:** 031-033  
**Status:** Deployed e validado (11/11 validações OK)

**Entregas:**
- ✅ Tabela `store_intelligence` criada
- ✅ 5 campos críticos: `brand_voice`, `target_audience`, `top_products`, `seasonal_peaks`, `successful_past_ctas`
- ✅ Testes de integração completos

### Phase 2.1 — Expansion Intelligence (✅ COMPLETA 01-02/05)
**Migrations:** 034-035  
**Status:** Deployed e validado (9/9 validações OK + 3 fixes UX críticos 02/05)

**Entregas:**
- ✅ Tabela `store_intelligence` expandida com 10 campos importantes
- ✅ Intelligence Page: 4 tabs completos (Público/Tom, Posicionamento, Conversão, Avançado)
- ✅ UX refinements: máscaras BRL, campos guiados, hints dinâmicos
- ✅ Fixes críticos: autosave navegação, pain points UX, limit enforcement
- ✅ Mobile support (Story 2B - 8/10 ACs)
- ✅ 31 campos validados pelo Marketing Squad

**Métricas alcançadas:**
- Taxa de preenchimento projetada: 60% → 95%
- Tempo de preenchimento projetado: 5min → 2min

### Phase 2.2 — Governança + Agregações (🔄 PRÓXIMO — Planejado 2 semanas)
**Migrations:** 037-040 (a serem criadas)  
**Status:** Em planejamento (início imediato)

**Escopo planejado:**
1. **JSON Schema Validation:**
   - Validação estrutural de `store_intelligence.context`
   - Constraints por tipo de campo
   - Migration 037: schema validation functions

2. **Agregações Intelligence:**
   - Intelligence score tracking (completeness)
   - Analytics de preenchimento por campo
   - Migration 038: aggregations tables

3. **Governança de Dados:**
   - Audit trail de mudanças
   - Versioning de contexto
   - Migration 039: governance layer

4. **Onboarding Progressivo:**
   - Modais de introdução por tab
   - Tooltips contextuais
   - Migration 040: onboarding_state table

**Responsáveis:**
- @data-engineer (Dara): Migrations 037-040
- @ux-design-expert (Uma): Designs de modais
- @dev (Dex): Implementação frontend

**Critérios de sucesso:**
- [ ] JSON Schema valida 100% dos campos
- [ ] Intelligence score calculado corretamente
- [ ] Onboarding modals implementados
- [ ] Audit trail funcionando

### Phase 2.3 — Backend Integration (Futuro)
**Status:** Aguarda conclusão de Phase 2.2

**Escopo:**
- Integrar `store_intelligence.context` nos prompts de geração
- Implementar contexto comercial (@commerce-strategist)
- Testing end-to-end com intelligence ativo
- Métricas de impacto (LTV, conversão)

---

## 📦 PHASE 1: ARQUITETURA DE CAMPANHAS (Contexto Histórico — Março 2026)

**Status:** Planejado mas NÃO EXECUTADO (priorizado Phase 2 Intelligence)

### Contexto da Decisão (Março 2026)
Originalmente planejada refatoração completa de arquitetura de campanhas com contratos, schemas e view models. **Decisão:** Adiar para focar em Intelligence Layer (maior impacto em LTV). Arquitetura de campanhas será revisitada após Phase 2.3 quando integração backend estiver completa.

### Frente A — Arquitetura de campanhas e prevenção de bugs (ADIADO)

**Objetivo original:**  
Padronizar os contratos de campanha e impedir que dados crus do banco ou da IA cheguem diretamente à UI.

**Regras definidas (ainda válidas):**
- Nenhum componente deve consumir diretamente retorno cru do Supabase
- Toda resposta de IA deve ser validada por schema antes de uso
- Toda alteração no banco deve gerar migration versionada
- Cada tela deve consumir view model específico

**Estrutura alvo (ainda válida):**
```
lib/domain/campaigns/
├── contracts.ts
├── schemas.ts
├── types.ts
├── mapper.ts
├── selectors.ts
└── service.ts
```

**Etapas definidas (preservadas para futuro):**
1. Base do domínio de campanha (tipos, enums, schemas)
2. View models seguros para UI (CampaignListItem, CampaignDetail, EditableCampaign)
3. Padronização dos fluxos de geração (validação consistente)

**Princípio técnico oficial (ainda válido):**  
Fluxo obrigatório: `query raw → schema → mapper → tipo de domínio → view model`

### Frente B — Página de campanhas — refinamento final (ADIADO)

**Objetivo original:**  
Lista de campanhas deve mostrar apenas o necessário para refrescar a memória do usuário e orientar próxima ação.

**Estrutura do card de campanha (ainda válida):**
- Miniatura da arte (preview premium)
- Nome do produto
- Preço + público + objetivo
- Estratégia da campanha
- Data da campanha
- Status do conteúdo gerado
- Botões condicionais conforme conteúdo existente

**Regras visuais definidas:**
- Não mostrar dados da loja na lista
- Não mostrar textos longos da campanha
- Thumb apresentada como peça pronta
- Separação visual entre thumb e conteúdo
- Hover lift permanece

**Estratégias padronizadas:**
- OFERTA
- COMBO
- MOMENTO
- DESTAQUE
- PRESENTE

(UI traduz posicionamentos complexos para essas categorias simples)

**Botões condicionais:**
- Arte apenas: Ver arte • Editar
- Vídeo apenas: Ver vídeo • Editar
- Arte + vídeo: Ver arte • Ver vídeo • Editar

**Edição de campanha - Campos editáveis:**
- preço, público, objetivo
- textos, CTA

**Regra oficial:** Arte não é editável, Arte pode ser regenerada

**Duplicar campanha permitirá:**
- Reaproveitar campanhas
- Ajustar preço
- Gerar nova arte ou vídeo

---

## 📦 PHASE 1 PLUS: PÓS-LANÇAMENTO (Contexto Histórico — Futuro)

**Status:** Planejado para após Phase 2.3

**Melhorias previstas:**
- Menu de ações no card (⋯)
- Arquivar campanhas
- Filtros por estratégia
- Pequenos refinamentos de UX
- Expansão do padrão de contratos para stores, plans e métricas
- Hardening de APIs com validações compartilhadas

**Nota:** Arquivar campanhas é preferível à exclusão direta para preservar histórico.

---

## 🚀 PHASE 3: EVOLUÇÃO INTELIGENTE (Futuro Distante)

**Status:** Planejado para após validação real de uso

**Recursos planejados:**
- Indicador de desempenho de campanhas
- Variações automáticas de campanha
- Sugestões estratégicas
- Analytics de campanhas
- Calendário estratégico
- Gerar variação de imagem na página da campanha (carrossel de artes para escolha)

**Estrutura futura de planos:**

**Starter:**
- Gerar campanha
- Editar campanha
- Duplicar campanha

**Pro:**
- Filtros estratégicos
- Sugestões automáticas
- Campanhas sazonais

**Premium:**
- Analytics
- Desempenho de campanhas
- Variações automáticas

---

## 💡 PRINCÍPIOS DE DESIGN

**Decisão de UX da tela de campanhas:**

A tela de campanhas é uma tela de:
- Reconhecimento rápido
- Memória rápida
- Navegação rápida

Detalhes completos ficam nas telas:
- Editar campanha
- Ver arte
- Ver vídeo

**Estratégia de produto atual (Março 2026 - ainda válida):**

Foco no Plano Básico (Starter). Resolver 80% do problema de marketing das lojas físicas focando na combinação mais eficaz:
- Posts (Imagens Estáticas) focados em conversão e vitrine
- Vídeos Curtos verticais (9:16) com ganchos fortes para alcance e engajamento

**Decisão estratégica central:**

Em vez de desenvolver múltiplos formatos complexos na V1, o foco permanece em aperfeiçoar o núcleo do produto: criar campanhas úteis, rápidas e fáceis de reutilizar.

**O Vendeo deve se comportar como um motor de vendas social para lojas físicas, não como um editor complexo nem como uma agência.**

---

## 🔧 ESCALABILIDADE TÉCNICA (Direções Futuras)

Considerações para futuro:
- Compressão e redimensionamento automático de imagens
- Limpeza de arquivos órfãos
- Otimização CDN
- Contratos compartilhados entre domínios
- Redução de acoplamento entre banco, IA e UI
- Preservar mídia original do produto para regenerações e variações

---

## 📝 RESUMO EXECUTIVO

**Foco atual do Vendeo (Mai 2026):**
1. ✅ Consolidar Intelligence Layer (Phase 2.0-2.2)
2. 🔄 Implementar governança intelligence + agregações (Phase 2.2 - em andamento)
3. 📅 Integrar intelligence no backend de geração (Phase 2.3 - próximo)
4. 📅 Revisar arquitetura de campanhas (Phase 1 adiada - após Phase 2.3)
5. 📅 Refinar UX com base em validação real
6. 📅 Observar usuários e evoluir incrementalmente

**Princípio de disciplina de escopo:**

A prioridade não é adicionar inteligência avançada ou analytics agora, mas sim:
- Deixar o fluxo principal mais claro, utilizável, profissional e confiável
- Consolidar contratos e camada de domínio antes de ampliar features
- Reduzir bugs, inconsistências de tipagem e quebras silenciosas

**Objetivo imediato:**  
localizar rápido → reconhecer rápido → agir rápido

---

*Documento atualizado em 03/05/2026 por @aiox-master para refletir Phase 2.2 como milestone atual*

A lista de campanhas deve mostrar apenas o necessário para refrescar a memória do usuário e orientar a próxima ação.

### Estrutura do card de campanha

Cada card deve exibir:

• Miniatura da arte (preview premium)
• Nome do produto
• Preço + público + objetivo
• Estratégia da campanha
• Data da campanha
• Status do conteúdo gerado
• Botões condicionais conforme conteúdo existente

### Regras visuais

• Não mostrar dados da loja na lista
• Não mostrar textos longos da campanha
• Thumb apresentada como peça pronta
• Separação visual entre thumb e conteúdo
• Hover lift permanece

### Estratégias padronizadas

OFERTA
COMBO
MOMENTO
DESTAQUE
PRESENTE

A UI traduz posicionamentos complexos para essas categorias simples.

### Botões condicionais

Arte apenas:
Ver arte • Editar

Vídeo apenas:
Ver vídeo • Editar

Arte + vídeo:
Ver arte • Ver vídeo • Editar

Mostrar apenas o que existe.

### Edição de campanha

Campos editáveis:

• preço
• público
• objetivo
• textos
• CTA

Regra oficial:

Arte não é editável
Arte pode ser regenerada

### Duplicar campanha

Duplicar campanha permitirá:

• reaproveitar campanhas
• ajustar preço
• gerar nova arte ou vídeo

---

# Fase 2 — Pós‑lançamento

Status: planejado

Melhorias previstas:

• Menu de ações no card (⋯)
• Arquivar campanhas
• Filtros por estratégia
• Pequenos refinamentos de UX
• Expansão do padrão de contratos para stores, plans e métricas
• Hardening de APIs com validações compartilhadas

Arquivar campanhas é preferível à exclusão direta para preservar histórico.

---

# Fase 3 — Evolução Inteligente do Produto

Status: futuro

Recursos planejados:

• Indicador de desempenho de campanhas
• Variações automáticas de campanha
• Sugestões estratégicas
• Analytics de campanhas
• Calendário estratégico
• Gerar variação de imagem na página da campanha (carrossel de artes para escolha)

Esses recursos serão avaliados após validação real de uso.

---

# Estrutura futura de planos

Starter

• gerar campanha
• editar campanha
• duplicar campanha

Pro

• filtros estratégicos
• sugestões automáticas
• campanhas sazonais

Premium

• analytics
• desempenho de campanhas
• variações automáticas

---

# Decisão de UX da tela de campanhas

A tela de campanhas é uma tela de:

• reconhecimento rápido
• memória rápida
• navegação rápida

Detalhes completos ficam nas telas:

• editar campanha
• ver arte
• ver vídeo

---

# Escalabilidade técnica

Direções futuras:

• compressão e redimensionamento automático de imagens
• limpeza de arquivos órfãos
• otimização CDN
• contratos compartilhados entre domínios
• redução de acoplamento entre banco, IA e UI

Também considerar futuramente preservar mídia original do produto para regenerações e variações.

---

# Resumo executivo

O foco atual do Vendeo é:

• consolidar a arquitetura de campanhas
• reduzir bugs antes da expansão de escopo
• refinar UX
• lançar beta
• observar usuários
• evoluir com base em uso real

A tela de campanhas foi definida para ser:

simples
rápida
visual
estratégica

sem excesso de informação.
