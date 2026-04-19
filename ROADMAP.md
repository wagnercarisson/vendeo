# Vendeo - Roadmap e Decisões Estratégicas

Este documento centraliza as discussões sobre o futuro do produto, decisões estratégicas de roadmap e funcionalidades mapeadas para próximas fases.

---

## ✅ Motor V2 - Visual Signature System (CONCLUÍDO - Abril 2026)

**Status:** ✅ FASE 1 completa (Schema Clean)  
**Branch:** `intra-motor-visual`  
**Data:** 2026-04-19

### Objetivo

Evoluir o Vendeo de layouts fixos para um **motor de composição visual dinâmica**, capaz de gerar artes personalizadas, consistentes e adaptáveis à identidade de cada loja.

### Conquistas

- ✅ Infraestrutura de banco de dados criada (migrations 025-029)
- ✅ Sistema de Visual Signatures implementado (core identity + context profiles)
- ✅ 5 contextos visuais criados: standard, promotional, seasonal, premium, urgency
- ✅ 9 lojas migradas, 45 profiles gerados
- ✅ 100% dos testes de integração passando
- ✅ Zero downtime, sistema antigo coexistindo

### Próximas Fases

| Fase | Status | Objetivo |
|------|--------|----------|
| **FASE 1** | ✅ Concluída | Schema Clean - infraestrutura de dados |
| **FASE 2** | 📋 Planejada | UI para configurar Visual Signatures |
| **FASE 3** | 📋 Planejada | Motor de composição (Visual Reader + Intent Resolver) |
| **FASE 4** | 📋 Planejada | Deprecação de schema legado |

**Documentação:** `docs/FASE-1-RESUMO.md`, `docs/FASE-1-EXECUCAO.md`

---

# Estratégia Atual (Foco no Core Value)

Status: foco no Plano Básico (Starter)

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

## Frente A — Arquitetura de campanhas e prevenção de bugs

Objetivo:

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
