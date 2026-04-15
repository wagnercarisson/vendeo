# Camada de Identidade Visual por Loja v1

Status: proposta arquitetural para implementacao incremental
Data: 2026-04-14
Relacionados:
- `docs/architecture/arquitetura-alvo-vendeo-v2.md`
- `docs/architecture/matriz-gaps-v2-vs-atual.md`
- `docs/architecture/contratos-pipeline-visual-v1.md`
- `lib/domain/visual-composition/contracts.ts`

## 1. Objetivo

Definir a camada responsavel por produzir, governar e publicar o `Brand Profile` de cada loja como contrato canonico para o pipeline visual, garantindo:

- personalizacao por loja
- padronizacao entre campanhas
- separacao entre regra visual e regra comercial
- independência do renderer
- evolucao incremental sem quebrar o fluxo `Store -> Campaign -> Generation -> Approval`

O pipeline oficial permanece:

`Campaign Visual Brief + Brand Profile + Visual Reader Output -> Visual Intent -> Composition Spec -> Renderer Input`

## 2. Definicao Arquitetural da Camada

Nome recomendado da capacidade:

`Store Visual Identity Layer`

Natureza:

camada de governanca e publicacao dentro do `Store Profile Context`, nao um motor visual e nao uma extensao do renderer.

Missao:

transformar dados persistidos da loja em um `Brand Profile` canonico, versionado e seguro para consumo por campanhas e pelo pipeline visual.

Responsabilidades da camada:

- normalizar os dados de identidade visual da loja
- validar consistencia minima de marca antes de publicar contrato oficial
- publicar um `Brand Profile` canonico para consumo pelos motores
- impedir que UI, preview e renderer consumam campos soltos de marca como contrato de fato
- manter compatibilidade incremental com o modelo atual baseado em `stores`

Nao e responsabilidade da camada:

- decidir layout final
- decidir copy, oferta, headline, CTA ou posicionamento de produto
- executar renderizacao
- aplicar regras de plano comercial
- arbitrar aprovacao da campanha

Arquitetura logica:

```text
Store Profile Context
  -> Store Visual Identity Layer
       -> Brand Profile Normalizer
       -> Brand Profile Validator
       -> Brand Profile Publisher
  -> Published Brand Profile

Campaign Context
  -> Campaign Visual Brief

Visual Intelligence Context
  -> Visual Reader Output

Visual Composition Context
  -> Visual Intent Resolver
  -> Composition Spec Builder
  -> Renderer Adapter
  -> Renderer
```

## 3. Bounded Context Dono

O bounded context dono desta capacidade deve ser o `Store Profile Context`.

Justificativa:

- a identidade visual pertence a loja, nao a campanha
- o `Brand Profile` precisa sobreviver entre campanhas e ser reutilizavel
- a campanha pode especializar a oferta, mas nao redefinir a marca da loja
- mover essa capacidade para o pipeline visual criaria acoplamento indevido entre governanca de marca e composicao

Decisao arquitetural:

- `Store Profile Context` e dono do dado vivo de marca
- `Campaign Context` e dono do uso comercial da campanha
- `Visual Composition Context` e apenas consumidor do `Brand Profile` publicado

## 4. Fonte de Verdade do Brand Profile

### 4.1 Estado-alvo

A fonte de verdade oficial do `Brand Profile` deve ser um documento canonico publicado pelo `Store Profile Context` e persistido junto ao agregado de loja.

Recomendacao de persistencia alvo:

- `stores.brand_profile` como JSONB canonico publicado
- `stores.brand_profile_version` como versao monotonicamente crescente ou hash estavel
- `stores.brand_profile_updated_at` como carimbo da ultima publicacao

Esse documento publicado e a fonte de verdade para consumo por:

- `Campaign Context` quando precisar snapshotar a marca usada numa geracao/aprovacao
- `Visual Intent Resolver`
- `Composition Spec Builder`
- qualquer preview oficial que precise refletir a mesma identidade usada na geracao

### 4.2 Relacao com o estado atual

Durante a migracao, campos legados em `stores` continuam sendo dados de autoria e compatibilidade:

- `name`
- `phone`
- `whatsapp`
- `address`
- `primary_color`
- `secondary_color`
- `logo_url`
- `tone_of_voice`
- `brand_positioning`

Regra de transicao:

- enquanto `stores.brand_profile` nao existir, a camada publica o contrato a partir desses campos
- depois da publicacao canonica, consumidores deixam de ler campos soltos diretamente
- os campos legados passam a ser fonte de autoria, nao fonte de consumo

## 5. Contrato Oficial de Entrada e Saida

## 5.1 Entrada oficial da camada

Nome recomendado:

`Store Brand Identity Input Contract`

Produtor:

`Store Profile Context`

Consumidor:

`Store Visual Identity Layer`

Campos obrigatorios:

- `schema_version`
- `store_id`
- `store_name`
- `contact.whatsapp`
- `contact.phone`
- `location.address`
- `location.city`
- `location.state`
- `visual.primary_color`
- `visual.secondary_color`
- `visual.logo_url`
- `voice.tone_of_voice`
- `voice.brand_positioning`

Campos opcionais recomendados para governanca futura sem mudar o pipeline:

- `visual.logo_storage_path`
- `location.neighborhood`
- `metadata.updated_by`
- `metadata.updated_at`

Invariantes:

- nao carrega `campaign_id`
- nao carrega `objective`, `audience`, `product_name`, `price` ou `content_type`
- nao carrega regra de plano comercial
- nao carrega heuristica de layout

## 5.2 Saida oficial publicada pela camada

Nome oficial de consumo:

`Brand Profile`

Produtor:

`Store Visual Identity Layer`

Consumidores:

- `Visual Intent Resolver`
- `Composition Spec Builder`
- `Campaign Context` para snapshot de rastreabilidade quando necessario

Contrato externo canonico:

deve permanecer compativel com o `BrandProfileSchema` ja definido em `lib/domain/visual-composition/contracts.ts`.

Campos obrigatorios:

- `schema_version`
- `store_id`
- `store_name`
- `contact.whatsapp`
- `contact.phone`
- `location.address`
- `visual.primary_color`
- `visual.secondary_color`
- `visual.logo_url`
- `voice.tone_of_voice`
- `voice.brand_positioning`

Metadados internos recomendados de governanca:

- `profile_version`
- `published_at`
- `completeness_level`
- `source = store_profile_context`

Regra arquitetural:

- o payload do `Brand Profile` e contrato de consumo
- os metadados de governanca pertencem ao `Store Profile Context` e nao devem vazar como dependencia obrigatoria do renderer

## 6. O que Persistir e o que Derivar

### 6.1 Persistir sempre

- cores de marca aprovadas pela loja
- referencia oficial do logo da loja
- nome de exibicao da loja
- contatos oficiais da loja
- endereco base da loja quando fizer parte da assinatura
- `tone_of_voice`
- `brand_positioning`
- documento publicado `brand_profile`
- `brand_profile_version`
- timestamp de publicacao

### 6.2 Persistir seletivamente

- snapshot de `brand_profile_version` usado em uma geracao ou aprovacao, quando a campanha precisar reprodutibilidade forte
- snapshot do payload de marca dentro do `Approved Asset Contract`, quando a aprovacao precisar ser auditavel no futuro

### 6.3 Derivar sempre

- contraste final entre texto e fundo
- `template_family`
- `composition_type`
- visibilidade de preco
- visibilidade de CTA
- visibilidade de assinatura da loja
- `contact_mode`
- `background_policy`
- geometria final dos slots
- tamanhos finais de fonte
- `safe_zones`

### 6.4 Nao persistir como fonte de verdade

- layout escolhido na UI
- medicao de DOM
- fallback de preview
- cor calculada apenas para legibilidade de uma peca especifica
- decisao de mostrar ou ocultar preco numa campanha especifica

## 7. Regras de Autoridade Entre Contextos

## 7.1 Store Profile Context

Pode decidir:

- quais atributos compoem a identidade visual persistida da loja
- quando um `Brand Profile` esta valido para publicacao
- qual versao canonica de marca esta ativa

Nao pode decidir:

- copy da campanha
- politica comercial da oferta
- layout final
- aprovacao de asset

## 7.2 Campaign Context

Pode decidir:

- `campaign_type`
- `content_type`
- `product_name`
- `price`
- `price_label`
- `objective`
- `audience`
- `product_positioning`
- imagem de origem da campanha
- estado operacional e aprovacao

Nao pode decidir:

- mudar a identidade visual persistida da loja
- redefinir cor oficial ou logo da loja para todas as campanhas
- escrever regra visual estrutural no renderer

## 7.3 Visual Composition Context

Pode decidir:

- interpretacao semantica de composicao a partir de `Campaign Visual Brief + Brand Profile + Visual Reader Output`
- especificacao geometrica final para preview e renderizacao

Nao pode decidir:

- alterar `Brand Profile` publicado
- criar regra comercial fora do que veio de campanha
- inferir plano do cliente

## 7.4 Regras de plano e separacao comercial vs visual

Regra obrigatoria:

- enforcement de plano pertence a camada comercial e de aplicacao, nunca ao `Brand Profile`, ao `Visual Intent Resolver` ou ao renderer

Consequencia pratica:

- `plan_tier` nao entra no `Brand Profile`
- `plan_tier` nao entra no `Renderer Input`
- se um plano restringe uma capacidade, a chamada ao pipeline deve chegar ja autorizada ou bloqueada antes

## 8. Fronteiras de Responsabilidade

## 8.1 O que pertence ao Brand Profile

- identidade visual persistente da loja
- cores oficiais da marca
- referencia oficial do logo
- assinatura institucional da loja
- contatos institucionais da loja
- `tone_of_voice`
- `brand_positioning`
- dados de localizacao que compoem a assinatura institucional

## 8.2 O que pertence ao Visual Intent Resolver

- escolha de `template_family`
- escolha de `composition_type`
- politica de enfase textual
- politica de preco
- politica de CTA
- politica de assinatura da loja
- politica de contato
- politica de fundo e overlay
- regras semanticas de preservacao do sujeito

## 8.3 O que pertence ao Composition Spec Builder

- tamanho do canvas
- frames finais dos slots
- tokens finais aplicados a peca
- hierarquia tipografica final em px
- `visible = true|false` por slot
- `focal_box` final consumido pelo renderer adapter

## 8.4 O que nao pertence a nenhum desses e continua no Campaign Context

- `campaign_type`
- `content_type`
- `product_name`
- `service_name` ou descricao da oferta
- `price`
- `price_label`
- `objective`
- `audience`
- `product_positioning`
- copy da campanha
- status da campanha
- aprovacao
- origem `manual|plan`
- vinculo com `weekly_plan_item_id`
- feedback de regeneracao

Regra adicional para tipos de conteudo:

- `Brand Profile` deve ser agnostico a `product`, `service` e futuro uso publicitario
- adaptacao por tipo de oferta pertence ao `Campaign Visual Brief` e ao `Visual Intent Resolver`
- nenhuma variacao de `content_type` pode virar atalho para duplicar regra de marca em UI ou renderer

## 9. Evolucao Incremental sem Quebrar o Sistema Atual

### Fase 0 - Compatibilidade imediata

- manter leitura dos campos atuais de `stores`
- introduzir um mapper canonico `stores -> Brand Profile`
- proibir novos consumidores diretos de `primary_color`, `secondary_color` e `logo_url` fora do contexto dono

### Fase 1 - Publicacao canonica

- persistir `stores.brand_profile`
- persistir `stores.brand_profile_version`
- publicar `Brand Profile` server-side a partir do `Store Profile Context`
- tornar esse contrato o unico insumo oficial de marca para preview e pipeline visual

### Fase 2 - Consumo governado pelo pipeline

- fazer `Visual Intent Resolver` consumir apenas `Campaign Visual Brief`, `Brand Profile` e `Visual Reader Output`
- impedir que o renderer leia campos soltos de marca
- impedir que preview imponha fallback de layout como contrato oficial

### Fase 3 - Rastreabilidade de campanha

- snapshotar `brand_profile_version` na geracao/aprovacao quando necessario
- registrar o snapshot no `Approved Asset Contract` se a reprodutibilidade de aprovacao virar requisito operacional

## 10. Riscos Arquiteturais e Tradeoffs

### 10.1 Duplicacao temporaria de dados

Tradeoff:

- durante a migracao, dados de marca existirao em campos legados e no `brand_profile` publicado

Mitigacao:

- manter regra clara de autoria vs consumo
- novos consumidores leem apenas o contrato publicado

### 10.2 Rigidez excessiva do contrato

Tradeoff:

- um `Brand Profile` rigido demais pode dificultar variacoes futuras de campanha e anuncio

Mitigacao:

- manter o contrato de marca enxuto e estavel
- deixar variacao de composicao no `Visual Intent Resolver`

### 10.3 Marca fraca demais para composicao consistente

Tradeoff:

- lojas com poucos dados visuais terao composicao menos personalizada

Mitigacao:

- permitir `completeness_level`
- aplicar fallback conservador no intent, nunca no renderer

### 10.4 Acoplamento indevido entre campanha e marca

Tradeoff:

- levar `content_type` ou preco para dentro do `Brand Profile` simplificaria alguns casos, mas quebraria ownership

Mitigacao:

- manter a fronteira: marca e persistente; oferta e situacional

### 10.5 Drift entre preview e render final

Tradeoff:

- se preview continuar lendo estado legado e renderer ler contrato novo, a paridade quebra

Mitigacao:

- preview oficial e renderer devem consumir a mesma `Composition Spec`

## 11. Recomendacao de Migracao do Estado Atual para o Estado-alvo

Recomendacao principal:

adotar publicacao canonica em `Store Profile Context` antes de tentar sofisticar o composer.

Sequencia recomendada:

1. Formalizar `Store Visual Identity Layer` no dominio de loja.
2. Criar mapper canonico dos campos atuais de `stores` para `Brand Profile`.
3. Introduzir persistencia opcional de `stores.brand_profile` e `stores.brand_profile_version` sem quebrar leitores atuais.
4. Migrar preview e pipeline visual para consumir somente o `Brand Profile` publicado.
5. Remover leitura direta de cores, logo e assinatura da loja no renderer.
6. Snapshotar `brand_profile_version` apenas quando a cadeia de aprovacao exigir rastreabilidade forte.

Regra de migracao:

- primeiro centralizar leitura e publicacao
- depois trocar consumidores
- por ultimo reduzir o legado

## 12. Criterios para Considerar a Camada Pronta para Implementacao

Esta camada pode ser considerada pronta para implementacao quando todos os criterios abaixo estiverem fechados:

- ownership definido: `Store Profile Context` e dono explicito do `Brand Profile`
- fonte de verdade definida: `brand_profile` publicado e versionado
- contrato de entrada definido e validavel server-side
- contrato de saida compativel com `BrandProfileSchema`
- separacao de responsabilidades aceita entre `Brand Profile`, `Visual Intent Resolver`, `Composition Spec Builder` e `Campaign Context`
- enforcement de plano mantido fora da camada visual
- migracao incremental definida sem ruptura do fluxo atual
- politica de persistencia vs derivacao explicitada
- preview e renderer comprometidos a consumir a mesma `Composition Spec`
- nenhum novo ponto do sistema pode ler regra de marca solta como contrato de fato

## 13. Decisao Final Recomendada

Decisao recomendada para o estado-alvo:

- criar a `Store Visual Identity Layer` dentro do `Store Profile Context`
- publicar `Brand Profile` canonico e versionado como contrato oficial de marca por loja
- manter `Campaign Context` como unico dono das regras comerciais e operacionais da campanha
- manter `Visual Intent Resolver` como unico dono das decisoes semanticas de composicao
- manter `Composition Spec Builder` como unico dono da geometria final
- manter o renderer cego a regra de negocio e cego a dados soltos de marca

Esse desenho preserva o fluxo atual do produto, melhora padronizacao entre campanhas, reduz acoplamento e prepara o sistema para evolucao visual incremental sem inventar fluxo novo de produto.