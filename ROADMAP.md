# Vendeo - Roadmap e Decisões Estratégicas

Este documento centraliza as discussões sobre o futuro do produto, decisões estratégicas de roadmap e funcionalidades mapeadas para próximas fases.

---

# Estratégia Atual (Foco no Core Value)

Status: foco no Plano Básico ~~(Starter)~~

> Observação histórica: a nomenclatura anterior `Starter / Pro / Premium` evoluiu para `Free / Basic / Pro`. Para a taxonomia vigente, consulte [docs/product/diretrizes-produto-abril-2026.md](docs/product/diretrizes-produto-abril-2026.md) e [docs/analysis/posicionamento-comercial-e-diferenciacao-de-planos.md](docs/analysis/posicionamento-comercial-e-diferenciacao-de-planos.md).

A estratégia imediata do Vendeo é resolver 80% do problema de marketing das lojas físicas focando na combinação mais eficaz atualmente:

• Posts (Imagens Estáticas) focados em conversão e vitrine
• Vídeos Curtos verticais (9:16) com ganchos fortes para alcance e engajamento

Decisão estratégica (Março/2026):

Em vez de desenvolver múltiplos formatos complexos na V1, o foco permanece em aperfeiçoar o núcleo do produto:

criar campanhas úteis, rápidas e fáceis de reutilizar.

O Vendeo deve se comportar como um motor de vendas social para lojas físicas, não como um editor complexo nem como uma agência.

---

# Prioridade Atual de Produto

Status: Beta / Pré‑lançamento controlado

O momento atual exige disciplina de escopo.

A prioridade não é adicionar inteligência avançada ou analytics agora, mas sim deixar o fluxo principal mais claro, utilizável, profissional e confiável para o grupo beta inicial.

Objetivo imediato:

localizar rápido → reconhecer rápido → agir rápido

A tela de campanhas deve funcionar como uma bússola visual de marketing.

Nova diretriz aprovada (Março/2026):

antes de ampliar novas features visuais ou novos fluxos, o projeto deve consolidar a arquitetura de contratos e a camada de domínio de campanhas, para reduzir bugs, inconsistências de tipagem e quebras silenciosas entre banco, IA e UI.

---

# Fase 1 — Beta (Implementar agora)

Status: aprovado para execução

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

## Frente A — Arquitetura de campanhas e prevenção de bugs

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

---

### Objetivo Original:

padronizar os contratos de campanha e impedir que dados crus do banco ou da IA cheguem diretamente à UI.

### Regras oficiais

• nenhum componente ou página deve consumir diretamente o retorno cru do Supabase
• toda resposta de IA deve entrar como unknown e ser validada por schema antes de uso
• toda alteração no banco deve gerar migration versionada antes da aplicação (regra já oficial do projeto)
• cada tela deve consumir seu próprio view model, não o objeto bruto completo de campanha

### Estrutura alvo

Domínio campaigns com:

• contracts.ts
• schemas.ts
• types.ts
• mapper.ts
• selectors.ts
• service.ts

### Etapas definidas para execução incremental

#### Etapa 1 — Base do domínio de campanha

Implementar agora:

• tipos centrais de Campaign
• enums/unions oficiais de objetivo, estratégia e status
• schemas Zod para linha do banco e respostas de IA
• mapper oficial mapDbCampaignToDomain

#### Etapa 2 — View models seguros para UI

Implementar na sequência:

• CampaignListItem
• CampaignDetail
• EditableCampaign
• selectors puros para status, estratégia e presença de arte/vídeo

#### Etapa 3 — Padronização dos fluxos de geração

Implementar depois da base estabilizar:

• contrato de geração de campanha
• contrato de reels
• contrato de plano semanal
• validação e fallback consistentes entre APIs

### Princípio técnico oficial

Fluxo obrigatório:

query raw → schema → mapper → tipo de domínio → view model

---

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

---

## Frente B — Página de campanhas — refinamento final

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

Status: planejado (após Epic 4)

### Melhorias de UX previstas:

• Menu de ações no card (⋯)
• Arquivar campanhas
• Filtros por estratégia
• Pequenos refinamentos de UX

Arquivar campanhas é preferível à exclusão direta para preservar histórico.

### Expansão de Arquitetura:

• Expansão do padrão de contratos para stores, plans e métricas
• Hardening de APIs com validações compartilhadas
• **Pricing/Monetização (Epic 3)**
  - Planos Free/Basic/Pro
  - Limites de geração por plano
  - Sistema de billing

### Integração Weekly Plan:

• **Story 4.9** — Integração Motor v2.0 × Weekly Plan
• 4 variações de plano semanal completo
• Herança de theme/brief para campanhas
• Planejamento estratégico de content_type

---

# Fase 3 — Evolução Inteligente do Produto

Status: futuro

Recursos planejados:

• **Weekly Plan Adaptativo (Basic+)**
  - Sistema aprende preferências de estilo de plano
  - Sugestões de dias/formatos baseadas em histórico
  - Temas sazonais automáticos (Natal, Black Friday, etc)
• Indicador de desempenho de campanhas
• Variações automáticas de campanha
• Sugestões estratégicas
• Analytics de campanhas
• Calendário estratégico
• Gerar variação de imagem na página da campanha (carrossel de artes para escolha)

Esses recursos serão avaliados após validação real de uso.

---

# Estrutura futura de planos

~~Starter~~

~~• gerar campanha~~
~~• editar campanha~~
~~• duplicar campanha~~

~~Pro~~

~~• filtros estratégicos~~
~~• sugestões automáticas~~
~~• campanhas sazonais~~

~~Premium~~

~~• analytics~~
~~• desempenho de campanhas~~
~~• variações automáticas~~

> Observação histórica: esta estrutura foi substituída pela taxonomia `Free / Basic / Pro`.

Free

• criação manual de campanhas
• edição e aprovação da campanha
• uso pontual com limite operacional claro

Basic

• tudo do Free
• plano semanal
• constância operacional
• reaproveitamento rápido de campanhas

Pro

• tudo do Basic
• direcionamento comercial mais inteligente
• campanhas sazonais e sugestões mais estratégicas
• evolução futura de comportamento adaptativo

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
