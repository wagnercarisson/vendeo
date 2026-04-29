# Arquitetura-Alvo do Novo Vendeo

Status: Revisado para baseline inicial
Versão: 2.0
Data: 2026-04-14

## 1. Objetivo

Este documento define a arquitetura-alvo lógica e operacional do Vendeo para orientar decisões de produto, domínio, persistência e integração entre motores a partir desta fase do projeto.

Ele não descreve um plano detalhado de implementação nem propõe uma reescrita completa do sistema. Seu papel é consolidar o que já é válido no produto atual, eliminar ambiguidades arquiteturais e estabelecer uma base estável para evolução incremental.

A arquitetura-alvo deve preservar o fluxo central do produto:

Store -> Campaign -> Generation -> Approval

O fluxo de Weekly Plan permanece opcional, subordinado ao core de campanhas, sem substituir o fluxo manual nem romper o vínculo entre planejamento e execução.

## 2. Visão do Sistema

### 2.1 Direção arquitetural

O Vendeo deve evoluir como um monólito modular em Next.js, com fronteiras explícitas de domínio, contratos tipados entre motores e Supabase como sistema transacional principal.

Não é o momento de fragmentar o produto em microserviços. O problema atual não é distribuição; é clareza de responsabilidades, padronização dos contratos e redução de acoplamento entre UI, regras de negócio, IA e composição visual.

### 2.2 Missão do sistema

O sistema existe para ajudar lojistas a vender mais por meio de conteúdo social.

### 2.2.1 Objetivos arquiteturais

A arquitetura-alvo precisa garantir:

- preservação do fluxo base de campanha
- coexistência segura do fluxo de Weekly Plan
- separação entre estratégia, geração textual, geração de vídeo, leitura visual e renderização
- persistência determinística dos estados que importam para operação
- isolamento entre arte e vídeo
- rastreabilidade de origem, aprovação e feedback

### 2.3 Macroblocos do sistema

```text
Usuário
  -> App Web (Next.js App Router)
  -> Camada de Aplicação e Orquestração (app/api, server actions, loaders)
  -> Contextos de Domínio (lib/domain)
  -> Capacidades Especializadas consumidas pelos contextos
       - Motor de Estratégia
       - Motor de Conteúdo de Campanha
       - Motor de Vídeo Curto
       - Motor de Leitura Visual
       - Motor de Composição Visual
       - Renderer
  -> Persistência
       - Supabase Postgres
       - Supabase Storage
       - Tabelas de feedback e auditoria
```

### 2.4 Princípios operacionais

- Campaign continua sendo a entidade operacional central do produto.
- Campaign é a única unidade de execução e aprovação do sistema.
- Weekly Plan organiza demanda e estratégia, mas não substitui Campaign como unidade de execução.
- Weekly Plan organiza intenção, agenda e brief, mas não é fonte direta de asset aprovado.
- Motores trocam apenas dados estruturados; texto livre de raciocínio não pode ser contrato entre camadas decisórias.
- Tudo que representa estado operacional ou decisão reprodutível deve ser persistido.
- Tudo que é heurística transitória, inferência efêmera ou dado de UI derivado não deve virar fonte de verdade.

## 3. Bounded Contexts

### 3.1 Identity and Access

Responsabilidade:
autenticação, sessão e autorização por ownership.

Natureza do contexto:
contexto transversal de plataforma, não contexto central de negócio.

Entidades centrais:
user, store ownership.

Fonte atual:
`stores.owner_user_id` com validação server-side.

Regra-alvo:
nenhuma rota privilegiada pode confiar em `store_id` vindo do cliente sem validar ownership no servidor.

### 3.2 Store Profile Context

Responsabilidade:
manter o perfil operacional da loja usado como contexto comercial e visual.

Entidades centrais:
store, store snapshot.

Inclui:

- identidade da loja
- localização
- tom de voz
- segmento principal
- cores e identidade visual

Observação arquitetural:
`stores.brand_positioning` pertence ao contexto da loja e não pode substituir automaticamente `campaigns.product_positioning`.

Detalhamento derivado:
`docs/architecture/camada-identidade-visual-por-loja-v1.md` define a camada de governanca do `Brand Profile` dentro deste contexto.

### 3.3 Campaign Context

Responsabilidade:
orquestrar o ciclo de vida da campanha, da criação até a aprovação.

Entidades centrais:
campaign.

Este é o core do Vendeo e concentra:

- dados comerciais do item ofertado
- intento de formato com `campaign_type`
- natureza comercial com `content_type`
- estados granulares `post_status` e `reels_status`
- estado global derivado e persistido para operação
- vínculo opcional com weekly plan item
- origem da campanha (`manual` ou `plan`)

Decisão-alvo:
todo fluxo de geração, edição, aprovação e regeneração converge para este contexto. Toda persistência operacional derivada de motores que impacte a execução da campanha deve ser arbitrada por este contexto. Nenhum motor externo pode persistir diretamente em tabelas que não pertençam ao seu contrato de saída aprovado pelo Campaign Context.

Evolucao arquitetural aprovada:
o `Campaign Context` deve tratar `content_type` como discriminador fechado do dominio de conteudo da campanha, com separacao explicita entre `product`, `service` e `message`, conforme `docs/architecture/separacao-dominios-conteudo-v1.md`.

### 3.4 Weekly Planning Context

Responsabilidade:
planejar a semana, estruturar intenções por dia e preparar a execução das campanhas.

Entidades centrais:
weekly_plan, weekly_plan_item, strategy item.

Capacidade especializada interna:
Motor de Estratégia Semanal.

Regras-alvo:

- Weekly Plan é opcional.
- Weekly Plan só vira execução quando aprovado.
- Weekly Plan gera briefs e agenda; Campaign executa.
- O vínculo `weekly_plan_item_id` deve ser preservado como elo oficial entre planejamento e execução.

### 3.5 Content Intelligence Context

Responsabilidade:
gerar texto e roteiro comercial a partir de contexto estruturado.

Submotores:

- Motor de Conteúdo de Campanha
- Motor de Vídeo Curto

Entradas:

- contexto de loja
- contexto de campanha
- brief estratégico opcional
- instruções de regeneração opcionais

Saídas:

- copy estruturada
- legenda
- CTA
- hashtags
- headline
- roteiro e shotlist de reels

### 3.6 Visual Intelligence Context

Responsabilidade:
interpretar imagem e devolver sinais estruturados para composição.

Entidades centrais:
visual analysis, crop suggestion.

Regra-alvo:
o reader observa, mas não decide layout.

### 3.7 Visual Composition Context

Responsabilidade:
transformar campanha + sinais visuais + regras da oferta em uma especificação visual determinística.

Submotores:

- Visual Intent Resolver
- Composition Spec Builder
- Renderer Adapter
- Renderer

Regra-alvo:
composição visual deve ser separada da leitura visual e separada da geração textual.

Dependencia arquitetural:
o `Brand Profile` consumido por este contexto deve ser publicado pelo `Store Profile Context`, conforme `docs/architecture/camada-identidade-visual-por-loja-v1.md`.

### 3.8 Feedback and Learning Context

Responsabilidade:
capturar utilidade percebida, feedback qualitativo e sinais para ajuste futuro.

Natureza do contexto:
contexto analítico e de melhoria contínua, não contexto operacional transacional.

Entidades centrais:
generation_feedback, feedback_messages, métricas de uso.

Regra-alvo:
feedback nunca altera diretamente a campanha aprovada. Ele alimenta análise e futuras decisões de prompt, ranking ou heurística.

## 4. Contratos Entre Motores

O problema principal do legado não é falta de funcionalidade; é falta de contratos explícitos entre motores. A arquitetura-alvo formaliza os contratos abaixo.

Regra geral:
todo contrato deve deixar claro quem produz, quem consome, qual contexto arbitra sua promoção a estado oficial e quais campos são operacionais versus apenas diagnósticos.

### 4.1 Contrato A: Store Context

Produtor:
Store Profile Context.

Consumidores:
Motor de Estratégia, Motor de Campanha, Motor de Vídeo, Composição Visual.

Campos mínimos:

- `store_id`
- `name`
- `city`
- `state`
- `main_segment`
- `tone_of_voice`
- `brand_positioning`
- `primary_color`
- `secondary_color`
- `logo_url`

Regra:
é contexto de marca e operação, não fallback automático para estratégia de produto.

### 4.2 Contrato B: Strategy Item Contract

Produtor:
Motor de Estratégia Semanal.

Consumidores:
Weekly Planning Context e Campaign Context.

Campos mínimos:

- `day_of_week`
- `objective`
- `audience`
- `positioning`
- `target_content_type`
- `reasoning`

Regra:
esse contrato pode conter `reasoning` para exibição e auditoria, mas o Campaign Context só promove para fonte operacional os campos estruturados. `target_content_type` representa a intenção de domínio da futura campanha e só vira `content_type` quando o item de planejamento é promovido para execução.

### 4.3 Contrato C: Campaign Brief Contract

Produtor:
Campaign Context.

Consumidores:
Motor de Conteúdo, Motor de Vídeo, Visual Composition Context.

Campos mínimos:

- `campaign_id`
- `store_id`
- `origin`
- `weekly_plan_item_id`
- `campaign_type`
- `content_type`
- `objective`
- `audience`
- `theme`
- `domain_input`

Regra:
este é o contrato operacional central do sistema e a entrada canônica para motores que produzem saída operacional de campanha.

Evolucao aprovada:
este contrato passa a ser um envelope comum de campanha + `domain_input` discriminado por `content_type`, preservando `Campaign` como unidade de execucao e sem acoplar dominio ao renderer. `product` e `service` compartilham um `OfferInput` com campos neutros como `offer_name`, `price`, `price_label`, `positioning` e `image.source_url`; `message` usa um contrato proprio orientado a mensagem. Detalhamento em `docs/architecture/separacao-dominios-conteudo-v1.md`.

### 4.4 Contrato D: Campaign Copy Output

Produtor:
Motor de Conteúdo de Campanha.

Consumidor:
Campaign Context.

Campos mínimos:

- `headline`
- `caption`
- `text`
- `cta`
- `hashtags`
- `price_label`

Regra:
trata-se de output intermediário de motor. Ele só vira estado oficial da campanha após validação estrutural e persistência arbitrada pelo Campaign Context.

### 4.5 Contrato E: Short Video Output

Produtor:
Motor de Vídeo Curto.

Consumidor:
Campaign Context.

Campos mínimos:

- `hook`
- `script`
- `shotlist`
- `on_screen_text`
- `audio_suggestion`
- `duration_seconds`
- `caption`
- `cta`
- `hashtags`

Regra:
trata-se de output intermediário de motor. Ele só vira estado oficial da campanha após validação estrutural e persistência arbitrada pelo Campaign Context.

### 4.6 Contrato F: Visual Analysis Contract

Produtor:
Motor de Leitura Visual.

Consumidor:
Visual Composition Context.

Campos mínimos:

- `matchType`
- `detected`
- `matchedTarget`
- `sceneType`
- `targetBox`
- `targetOrientation`
- `targetPosition`
- `targetOccupancy`
- `imageQuality`
- `visibility`
- `framing`
- `backgroundNoise`
- `backgroundType`
- `hasBackground`
- `subjectCutoff`
- `safeExpansionPotential`
- `focusClarity`
- `visualIsolation`
- `confidence`

Regra crítica:
`reasoningSummary` pode existir apenas para debug, inspeção e observabilidade. Ele não pode ser usado como entrada decisória do compositor nem promovido a regra de negócio.

### 4.7 Contrato G: Composition Intent Contract

Produtor:
Visual Intent Resolver.

Consumidor:
Composition Spec Builder.

Campos mínimos:

- `composition_type`
- `layout_family`
- `text_priority`
- `image_usage_mode`
- `crop_policy`
- `price_badge_policy`
- `headline_policy`
- `cta_policy`
- `store_signature_policy`
- `safe_zones`

Regra:
esse contrato deve ser 100% determinístico a partir de Campaign Brief + Visual Analysis. Trata-se de contrato-alvo ainda em consolidação arquitetural e deve ser implementado como especificação explícita, nunca como objeto implícito espalhado entre preview, UI e renderer.

### 4.8 Contrato H: Composition Spec Contract

Produtor:
Composition Spec Builder.

Consumidores:
Preview da campanha, aprovacao visual, renderer adapter.

Campos mínimos:

- `schema_version`
- `spec_id`
- `campaign_id`
- `store_id`
- `canvas.width`
- `canvas.height`
- `canvas.safe_margin_px`
- `template.family`
- `template.variant`
- `tokens.colors`
- `tokens.typography`
- `assets.hero_image.url`
- `assets.hero_image.focal_box`
- `assets.logo.url`
- `slots.hero`
- `slots.headline`
- `slots.body`
- `slots.cta`
- `slots.price_badge`
- `slots.store_signature`
- `slots.contact`

Regra:
esse contrato materializa a geometria e a tipografia finais em canvas space e passa a ser a fonte oficial comum para preview e renderizacao. Nenhum consumidor pode recalcular layout principal fora da spec. `Renderer Input` deixa de ser contrato arquitetural primario e passa a ser apenas artefato derivado, backend-specific, produzido pelo `Renderer Adapter` exclusivamente a partir desta `Composition Spec`. Nenhum `measured_*`, shape de preview legado ou medicao de DOM permanece valido como contrato oficial. O renderer continua cego a regra de negocio e apenas executa os nodes recebidos do adapter.

### 4.9 Contrato I: Approved Asset Contract

Produtor:
Campaign Context após aprovação.

Consumidores:
Storage, Dashboard, Feedback Context.

Campos mínimos:

- `campaign_id`
- `asset_kind`
- `approved_at`
- `storage_path`
- `generation_source`
- `campaign_snapshot`
- `visual_snapshot` quando aplicável

Regra:
este é um contrato de registro e rastreabilidade pós-aprovação, não um contrato de geração. O sistema deve conseguir reconstituir o que foi aprovado, de qual versão de conteúdo isso nasceu e qual era o vínculo operacional da campanha naquele momento.

## 5. Fontes de Verdade

### 5.1 Verdades estruturais

- Ownership da loja: `stores.owner_user_id`.
- Perfil da loja: tabela `stores`.
- Campanha operacional: tabela `campaigns`.
- Plano semanal: tabelas `weekly_plans` e `weekly_plan_items`.
- Feedback operacional: tabelas de feedback dedicadas.
- Binários aprovados: Supabase Storage, sempre referenciado por registro transacional canônico.

### 5.2 Verdades semânticas do domínio

- Origem funcional oficial de `objective`, `audience` e `product_positioning`: `app/dashboard/campaigns/new/_components/constants.ts`.
- Espelhamento tipado e reutilizável de `objective`, `audience` e `product_positioning`: `lib/constants/strategy.ts`.
- Intento de formato da campanha: `campaigns.campaign_type`.
- Natureza comercial da campanha: `campaigns.content_type`, tratado como enum fechado do dominio de conteudo e nao como campo generico.
- Status granular de arte: `campaigns.post_status`.
- Status granular de vídeo: `campaigns.reels_status`.
- Vínculo oficial entre planejamento e execução: `campaigns.weekly_plan_item_id`.
- Origem de execução: `campaigns.origin`.

### 5.3 Verdades derivadas que não devem competir com a persistência

- Aba inicial da UI.
- Status visual agregado de cards.
- Status global calculado apenas para exibição, quando não corresponder ao estado operacional persistido.
- Leitura visual em runtime.
- Heurísticas de crop.
- Badges e labels da interface.

Se um valor pode ser recalculado de forma confiável a partir de dados persistidos, ele não deve virar uma nova fonte de verdade.

### 5.4 Regra-alvo de coerência

Nenhum módulo pode manter definição paralela de enums estratégicos.

Nenhuma camada de UI pode inferir regra de negócio contrária ao domínio persistido.

Nenhum motor de IA pode se tornar fonte de verdade direta sem passar por validação e mapeamento no domínio.

## 6. Estratégia de Persistência

### 6.1 Postgres transacional como backbone

O Supabase Postgres continua sendo a espinha dorsal do produto para:

- entidades centrais
- relacionamento entre planejamento e execução
- status operacionais
- feedback estruturado
- auditoria mínima de geração e aprovação

### 6.2 Storage como sistema de arquivos aprovados

O Supabase Storage deve ser usado para:

- imagens finais aprovadas
- artefatos intermediários relevantes apenas quando houver rastreabilidade exigida
- futuros snapshots de preview aprovado, se adotados

Regra:
URL pública não é fonte de verdade. A fonte de verdade é o caminho controlado de storage associado ao registro transacional.

Uso prioritário:
storage deve ser tratado principalmente como repositório de artefatos finais e rastreáveis, não como depósito difuso de saídas intermediárias sem governança.

### 6.3 O que persistir sempre

- qualquer identificador de relacionamento entre contextos
- qualquer status que afete fluxo de negócio
- qualquer decisão necessária para reabrir a campanha sem ambiguidade
- qualquer dado aprovado pelo usuário
- qualquer vínculo com plano semanal
- qualquer feedback que deva orientar evolução futura

### 6.4 O que persistir de forma seletiva

- snapshots de estratégia no plano
- snapshots de campanha no momento da aprovação
- snapshots de leitura visual somente quando passarem a sustentar reprodutibilidade ou analytics

### 6.5 O que não persistir

- estados apenas visuais da UI
- raciocínio textual do modelo como regra de negócio
- decisões de layout que possam ser reconstruídas de forma determinística
- dados efêmeros de regeneração não aprovados, salvo necessidade explícita de auditoria

### 6.6 Modelo-alvo de escrita

Toda escrita relevante deve obedecer a este padrão:

1. validar ownership e input
2. mapear para contrato de domínio
3. executar motor especializado
4. validar saída estruturada
5. persistir via contexto dono da entidade
6. recalcular status derivados persistidos apenas quando forem consequência legítima dos estados granulares ou da aprovação

Isso reduz escrita dispersa e protege consistência entre campanha, plano, IA e renderização.

Regra complementar:
nenhuma camada deve atualizar status global por conveniência de fluxo, UI ou simplificação de implementação.

### 6.7 Persistência operacional versus analítica

Persistência operacional:
mantém estado transacional, relacionamento entre entidades, dados aprovados e informações necessárias para reabrir o fluxo sem ambiguidade.

Persistência analítica:
mantém feedback, métricas, sinais de uso, diagnósticos e insumos de aprendizado.

Regra:
persistência analítica pode apoiar evolução do sistema, mas não pode competir com a cadeia de autoridade do estado operacional da campanha.

## 7. Plano de Migração do Legado

Princípio transversal:
a migração deve preservar continuamente o fluxo base do produto, manter compatibilidade com campanhas e planos já existentes e evitar ruptura operacional para usuários ativos.

Regra de execução:
sempre preferir migração incremental com convivência temporária, adaptação e corte posterior, em vez de substituição brusca de contratos, módulos ou caminhos críticos.

### 7.1 Diagnóstico do estado atual

O sistema atual já possui boa parte da arquitetura-alvo em forma embrionária, mas ainda com sinais de legado:

- coexistência de módulos de campanha em `lib/campaigns` e `lib/domain/campaigns`
- documentação v1 descrevendo parcialmente o sistema atual, mas já defasada em alguns pontos
- motores presentes, porém sem um catálogo formal único de contratos
- composição visual ainda parcialmente implícita entre preview, renderer e regras de campanha
- persistência de aprovação e rastreabilidade ainda mais forte para texto do que para artefatos visuais

O alvo não é reescrever. O alvo é consolidar.

### 7.2 Fase 0: Congelamento conceitual

Objetivo:
aprovar este documento como baseline.

Entregas:

- arquitetura-alvo aprovada
- glossário final de contextos
- catálogo final de contratos

Tipo de entrega:
decisão arquitetural e baseline documental.

### 7.3 Fase 1: Canonicalização dos contratos

Objetivo:
garantir que todo motor troque somente contratos formais tipados.

Ações:

- consolidar tipos centrais de campanha, plano e store
- explicitar contratos de entrada e saída por motor
- eliminar campos implícitos que trafegam apenas por convenção

Tipo de entrega:
endurecimento de contratos, tipagem e interfaces internas.

Critério de saída:
nenhuma rota de geração depende de shape informal de objeto.

### 7.4 Fase 2: Consolidação dos contextos de domínio

Objetivo:
fazer `lib/domain` virar a única casa oficial de regra de negócio.

Ações:

- migrar usos restantes de `lib/campaigns` para `lib/domain/campaigns`
- concentrar lógica de status, seleção, mapper e contratos no contexto dono
- remover duplicações e mirrors legados apenas após estabilização, verificação de uso e corte seguro

Tipo de entrega:
refatoração estrutural de código sem mudança de comportamento de produto.

Critério de saída:
um único caminho canônico por contexto.

### 7.5 Fase 3: Separação real dos motores visuais

Objetivo:
formalizar a cadeia Reader -> Composer -> Renderer.

Ações:

- promover Visual Intent Resolver a componente explícito
- definir Composition Intent Contract
- isolar renderer de qualquer decisão de negócio

Tipo de entrega:
separação arquitetural entre leitura, composição e execução visual.

Critério de saída:
troca de imagem reprocessa leitura; troca textual não reinterpreta imagem; renderer opera por spec.

### 7.6 Fase 4: Endurecimento da persistência

Objetivo:
garantir rastreabilidade suficiente para aprovação e reabertura.

Ações:

- revisar persistência do snapshot aprovado de arte
- formalizar storage path canônico por asset
- reforçar atualização de status global a partir dos status granulares
- aplicar migrations versionadas com rollout seguro e compatibilidade reversível quando possível

Tipo de entrega:
ajuste estrutural de dados, rastreabilidade e segurança de persistência.

Critério de saída:
o sistema consegue explicar o que foi aprovado, de qual campanha veio e qual vínculo com plano existia.

### 7.7 Fase 5: Aprendizado operacional

Objetivo:
usar feedback sem contaminar o fluxo transacional.

Ações:

- padronizar taxonomia de feedback
- separar feedback de utilidade, qualidade visual e aderência estratégica
- preparar insumos para analytics, revisão humana e tuning futuro

Tipo de entrega:
estrutura analítica e insumos para melhoria contínua.

Critério de saída:
feedback útil para evolução, sem acoplamento indevido ao core operacional.

## 8. Decisões Arquiteturais Que Ficam Valendo Agora

Estas decisões passam a valer como baseline arquitetural. Em caso de ambiguidade com documentação anterior, este documento prevalece para a nova fase do Vendeo.

- Campaign permanece como entidade central do produto.
- Weekly Plan permanece opcional e subordinado ao fluxo de execução por campanha.
- `campaign_type` continua sendo a fonte de verdade do intento de formato.
- `content_type` continua sendo a fonte de verdade da natureza comercial da campanha.
- `post_status` e `reels_status` continuam sendo as verdades granulares de execução.
- Store context jamais substitui estratégia explícita de campanha.
- Reader não decide layout.
- Renderer não decide negócio.
- Toda evolução nova deve nascer em torno de contratos explícitos, não de objetos ad hoc.

## 9. Próximos Passos Recomendados

1. Aprovar este documento como baseline arquitetural.
2. Derivar um catálogo técnico curto de contratos em arquivos de tipo dedicados.
3. Mapear gaps entre a arquitetura-alvo e os módulos atuais, com foco em `lib/domain`, contratos de geração e cadeia visual.
4. Executar a Fase 1 e a Fase 2 antes de qualquer expansão relevante de motores visuais.
