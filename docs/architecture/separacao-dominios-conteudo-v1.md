# Separacao Explicita dos Dominios de Conteudo do Vendeo

Status: proposta arquitetural para implementacao incremental
Data: 2026-04-14
Relacionados:
- `docs/architecture/arquitetura-alvo-vendeo-v2.md`
- `docs/architecture/matriz-gaps-v2-vs-atual.md`
- `docs/architecture/contratos-pipeline-visual-v1.md`
- `docs/architecture/camada-identidade-visual-por-loja-v1.md`

## 1. Objetivo

Definir como `product`, `service` e `message` devem existir como dominios de conteudo explicitamente separados dentro do `Campaign Context`, sem:

- duplicar regra de marca
- duplicar regra de campanha
- empurrar regra comercial para o renderer
- empurrar regra de dominio para UI cliente
- tratar `message` como variacao superficial de `product`

O fluxo oficial permanece:

`Store -> Campaign -> Generation -> Approval`

## 2. Decisao Arquitetural

Passa a valer como alvo arquitetural:

1. `Campaign` continua sendo a unidade comum de execucao, aprovacao, rastreabilidade e enforcement de plano para os tres dominios.
2. `content_type` deixa de ser apenas um rotulo operacional solto e passa a ser o discriminador fechado do dominio de conteudo da campanha.
3. Os dominios explicitos do core passam a ser:
   - `product`
   - `service`
  - `message`
4. `product` e `service` compartilham uma base de oferta vendavel em um `OfferInput` comum, com invariantes especificas por dominio.
5. `message` e um dominio centrado na mensagem da peca, nao um subtipo de `product` e nem uma categoria residual generica.
6. O renderer continua agnostico ao dominio; a sensibilidade a dominio termina no `Visual Intent` e na `Composition Spec`.

## 3. Por que separar agora

A separacao explicita precisa acontecer agora por cinco motivos:

1. O sistema ja possui `campaign_type` e `content_type`, mas ainda mistura classificacao comercial, copy e composicao como se `product` fosse o caso padrao.
2. O pipeline visual foi formalizado. Sem dominios explicitos, o `Visual Intent` tendera a embutir heuristicas opacas e dificeis de sustentar.
3. `service` e `message` exigem contratos de entrada e politicas visuais diferentes de `product`, principalmente em preco, sujeito principal, CTA e hierarquia da mensagem.
4. A separacao de planos, regra comercial e regra visual so fica consistente quando o dominio de conteudo e tratado como regra de dominio e nao como detalhe de UI.
5. Adiar a separacao aumenta a chance de consolidar o erro atual em contratos, prompts, preview e renderer, elevando o custo de migracao.

## 4. Unidade Comum e Fronteira Arquitetural

### 4.1 Unidade comum de execucao

A unidade comum entre os tres dominios continua sendo:

- `Campaign` como agregado operacional

Isso significa que os tres dominios compartilham:

- ownership
- origem (`manual` ou `plan`)
- vinculo opcional com `weekly_plan_item_id`
- `campaign_type`
- ciclo de vida de geracao e aprovacao
- status granulares e status operacional derivado
- snapshots aprovados e rastreabilidade

### 4.2 Nova camada logica dentro do Campaign Context

Nome recomendado:

`Campaign Content Domain Layer`

Responsabilidade:

- validar `content_type`
- materializar o contrato discriminado de entrada por dominio
- aplicar invariantes comerciais do dominio
- expor um `Campaign Brief` canonico para conteudo, video e composicao
- separar regra comercial de regra visual e de regra de marca

Nao e responsabilidade desta camada:

- escolher layout final
- publicar `Brand Profile`
- executar renderizacao
- permitir que a UI cliente arbitre dominio

Arquitetura logica:

```text
Store Profile Context
  -> Brand Profile

Campaign Context
  -> Campaign Content Domain Layer
    -> Offer Domain Contract (`product` | `service`)
    -> Message Domain Contract
  -> Campaign Brief

Content Intelligence Context
Visual Intelligence Context
Visual Composition Context
  -> Visual Intent
  -> Composition Spec
  -> Renderer Adapter
  -> Renderer
```

## 5. Definicao dos Tres Dominios

### 5.1 Product

Missao:

vender um item ou conjunto de itens cuja identidade comercial primaria esta no produto ofertado.

Centro semantico:

- item vendavel
- apresentacao do produto
- ancoragem de preco quando existir
- destaque do sujeito visual

Leitura arquitetural:

`product` privilegia a relacao entre oferta, item e imagem principal. Quando houver preco, ele tende a ser parte forte da composicao, mas continua sujeito as regras do dominio e do intento.

### 5.2 Service

Missao:

vender uma prestacao, experiencia, atendimento ou capacidade operacional cuja proposta de valor nao esta concentrada em um item fisico.

Centro semantico:

- servico ofertado
- resultado prometido
- beneficio, conveniencia ou especialidade
- contato e acao desejada

Leitura arquitetural:

`service` compartilha a logica de conversao com `product`, mas o foco de composicao nao pode assumir que o heroi visual e um item fisico com badge de preco destacado.

### 5.3 Message

Missao:

publicar uma mensagem operacional, institucional, educativa, promocional ou de engajamento em que a unidade principal e a mensagem da peca.

Centro semantico:

- mensagem principal
- contexto operacional, institucional, educativo ou promocional
- urgencia, validade ou ocasiao quando houver
- CTA e direcao da acao

Leitura arquitetural:

`message` pode citar produtos ou servicos, mas nao deriva suas regras estruturais deles. O objeto central e a mensagem da peca. Por isso, `message` nao deve herdar obrigatoriamente `offer_name`, `price_badge_policy` ou `subject-first layout`.

## 6. O que e compartilhado e o que e exclusivo

### 6.1 Compartilhado pelos tres dominios

- `Campaign` como agregado central
- `campaign_type` como formato de entrega
- `content_type` como discriminador do dominio
- objetivo, audiencia e origem da campanha
- relacao com `Brand Profile`
- ciclo `Generation -> Approval`
- contratos versionados de brief, intent, spec e approved asset
- enforcement de ownership e de plano no servidor

### 6.2 Exclusivo de product

- item ofertado e a ancora principal da peca
- sujeito visual do produto tende a ser estrutural
- politica de preco pode ser dominante
- preservacao do sujeito e da legibilidade do item tem peso alto

### 6.3 Exclusivo de service

- beneficio ou resultado tem peso igual ou maior que o sujeito visual
- contato e disponibilidade tendem a ter maior relevancia
- preco pode existir, mas frequentemente como ancora secundaria
- a prova visual pode ser ambiente, pessoa, atendimento ou contexto, nao apenas objeto

### 6.4 Exclusivo de message

- a mensagem e o asset semantico principal
- preco pode existir, mas nao e pressuposto estrutural
- validade, ocasiao, chamada ou campanha podem ser obrigatorios conforme o caso
- a peca pode ser `text_dominant` mesmo quando houver imagem

## 7. Invariantes: Campaign Context vs Dominio

### 7.1 Invariantes que pertencem ao Campaign Context

- `Campaign` continua sendo a unidade oficial de execucao e aprovacao
- `campaign_type` define apenas formato de entrega, nunca natureza comercial
- `content_type` define apenas dominio comercial, nunca layout final
- ownership, autorizacao e enforcement de plano sao server-side
- `weekly_plan_item_id` permanece como vinculo oficial entre planejamento e execucao
- promocao de output de motor para estado oficial sempre passa pelo Campaign Context
- snapshots e approved assets continuam vinculados a `campaign_id`

### 7.2 Invariantes que pertencem aos dominios de conteudo

`product`

- o item ofertado precisa ser explicitamente nomeado
- a oferta pode usar preco como ancora forte quando disponivel
- a ausencia de sujeito visual confiavel exige fallback conservador

`service`

- o servico ofertado precisa ser explicitamente nomeado
- o resultado prometido ou beneficio principal precisa ser claro
- CTA de contato, agendamento ou consulta tende a ser estrutural

`message`

- a mensagem comercial principal precisa ser explicitamente definida
- o CTA precisa apontar a acao desejada pela campanha
- a peca nao depende de um produto fisico nomeado para ser valida

## 8. Evolucao de content_type

## 8.1 Regra-alvo

`content_type` deve evoluir para um enum fechado de primeiro nivel:

- `product`
- `service`
- `message`

## 8.2 O que `content_type` pode fazer

- discriminar o dominio da campanha
- selecionar o contrato minimo de entrada
- orientar politicas de copy, video e composicao
- habilitar validacoes e enforcement de plano no servidor

## 8.3 O que `content_type` nao pode fazer

- virar um campo generico de subtipo infinito
- carregar heuristica de layout detalhada
- substituir `campaign_type`
- carregar regra de marca
- concentrar regra de oferta, promocao, template e render em um unico rotulo

## 8.4 Regra de modelagem recomendada

`content_type` continua curto e fechado. O detalhamento entra em contrato discriminado de dominio.

Modelo alvo:

```text
content_type = product | service | message
domain_input = OfferInput | MessageInput
```

Isso impede que `content_type` vire um "supercampo" do tipo `product_with_discount_banner_with_whatsapp`.

## 8.5 Relacao com o estado atual (`info`)

O valor atual `info` deve ser tratado como legado.

Regra de migracao:

1. `info` deixa de ser permitido para novas campanhas no modelo alvo.
2. campanhas historicas `info` precisam ser reclassificadas para `message` ou removidas do pipeline novo se nao representarem intencao comercial.
3. enquanto a migracao nao terminar, a camada de dominio pode aceitar `info` apenas como alias legado de leitura, nunca como semantica nova.

## 9. Shape minimo obrigatorio de entrada por dominio

## 9.1 Envelope comum

Todo dominio entra no pipeline por um envelope comum:

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

## 9.2 OfferInput para `product`

Campos minimos obrigatorios:

- `offer_name`
- `image.source_url`
- pelo menos um ancora comercial: `price`, `price_label` ou `cta`

Campos recomendados:

- `positioning`
- `headline_seed`
- `benefit_hint`

Invariantes de dominio:

- quando `content_type = product`, `offer_name` representa o nome do produto
- o sujeito visual do item ofertado tende a ser estrutural

## 9.3 OfferInput para `service`

Campos minimos obrigatorios:

- `offer_name`
- `service_benefit`
- `image.source_url`
- `cta`

Campos recomendados:

- `price_label`
- `availability_hint`
- `proof_hint`

Invariantes de dominio:

- quando `content_type = service`, `offer_name` representa o nome do servico
- beneficio, conveniencia ou resultado prometido podem ter peso igual ou maior que a imagem

## 9.4 MessageInput

Campos minimos obrigatorios:

- `message_text`
- `cta`

Pelo menos um reforco comercial:

- `promoted_subject`
- `validity_hint`
- `price_label`
- `image.source_url`

Campos recomendados:

- `occasion`
- `urgency_hint`
- `supporting_offer`

## 10. Impacto nos contratos do pipeline

## 10.1 Campaign Brief

O `Campaign Brief` deixa de assumir shape centrado em produto e passa a ser:

- envelope comum de campanha
- payload discriminado por dominio

Regra-alvo:

- `offer_name`, `price` e `image.source_url` deixam de ser pressupostos universais do contrato
- o brief passa a expor `domain_input`
- campos compartilhados continuam no envelope comum

Modelo logico:

```text
CampaignBrief
  common
  -> content_type = product -> OfferInput
  -> content_type = service -> OfferInput
  -> content_type = message -> MessageInput
```

## 10.2 Visual Intent

O `Visual Intent` precisa ser sensivel ao dominio em:

- `composition_type`
- `template_family`
- `text_policy`
- `offer_policy`
- `background_policy`
- `subject.source` e `subject.preserve_entire_subject`

Exemplos de sensibilidade:

- `product`: favorece `balanced` ou `product_dominant` quando a imagem permite
- `service`: favorece `balanced` ou `text_dominant` com CTA e beneficio fortes
- `message`: pode favorecer `text_dominant` mesmo com imagem valida

## 10.3 Composition Spec

A `Composition Spec` continua agnostica na forma, mas nao nos valores produzidos.

O schema base pode continuar igual, desde que o builder varie:

- visibilidade do hero
- proeminencia do badge de preco
- proeminencia do CTA
- bloco de validade ou ocasiao quando existir
- relacao entre headline, body e assinatura

## 10.4 Renderer

O renderer deve continuar completamente agnostico ao dominio.

Regra:

- renderer nao recebe `content_type` para decidir negocio
- renderer nao escolhe layout alternativo por dominio
- renderer apenas executa nodes e slots definidos pela `Composition Spec`

## 11. Regras de composicao: comuns vs variaveis

## 11.1 Regras comuns

- safe zones e legibilidade minima
- contraste de texto e fundo
- respeito ao `Brand Profile` como token de marca, nao como regra comercial
- CTA, preco, contato e assinatura so aparecem se a politica ja vier definida
- reader nunca decide layout
- preview e renderer consomem a mesma spec

## 11.2 Regras que variam por dominio

`product`

- sujeito principal tende a ocupar area hero maior
- preco pode aparecer como badge forte
- headline tende a complementar o item, nao substitui-lo

`service`

- headline e body carregam mais valor explicativo
- CTA de contato ou agendamento tende a ganhar peso
- badge de preco, quando existir, tende a ser mais discreto

`message`

- headline e mensagem comercial podem dominar a peca
- hero pode ser secundario ou ausente
- validade, ocasiao ou promocao podem exigir slot proprio

## 12. Capacidades sensiveis ao dominio e partes agnosticas

## 12.1 Capacidades que precisam ser sensiveis ao dominio

- validacao do brief de campanha
- prompts e politicas do motor de conteudo
- prompts e politicas do motor de video
- heuristica do `Visual Intent Resolver`
- regras de visibilidade e hierarquia do `Composition Spec Builder`
- validacao de aprovacao quando depender de elementos comerciais obrigatorios
- enforcement de plano quando certas capacidades forem plano-dependentes

## 12.2 Partes que devem continuar agnosticas ao dominio

- ownership e autorizacao basica
- publicacao do `Brand Profile`
- output bruto do `Visual Reader`
- schema estrutural da `Composition Spec`
- `Renderer Adapter`
- renderer
- storage de assets aprovados
- trilha de auditoria de aprovacao

## 13. Separacao entre regra comercial, regra de marca e regra visual

`Campaign Content Domain Layer`

- dono da regra comercial
- dono da classificacao `content_type`
- dono do contrato minimo por dominio
- ponto de enforcement de plano para capacidades comerciais

`Store Profile Context`

- dono da regra de marca
- dono do `Brand Profile`
- nao conhece preco, promocao, `content_type` nem CTA da campanha

`Visual Composition Context`

- dono da regra visual derivada
- consome brief + marca + reader
- nao inventa regra comercial fora do brief

## 14. Plano incremental de migracao

### Fase 1: decisao e contrato

- aprovar este desenho como baseline arquitetural
- declarar `product`, `service` e `message` como dominios-alvo oficiais
- marcar `info` como legado em documentacao e tipagem de borda

### Fase 2: brief canonico

- evoluir `Campaign Brief` para envelope comum + `domain_input`
- parar de assumir campos de oferta como centro universal do contrato
- adaptar mappers para emitir shape discriminado no servidor

### Fase 3: enforcement do dominio

- centralizar validacao de `content_type` e `domain_input` no Campaign Context
- remover decisao de dominio da UI cliente
- introduzir gates server-side de plano e consistencia por dominio

### Fase 4: pipeline sensivel ao dominio

- adaptar prompts de conteudo e video
- adaptar `Visual Intent Resolver`
- adaptar `Composition Spec Builder`
- manter renderer intocado, consumindo apenas spec

### Fase 5: limpeza do legado

- eliminar `info` dos contratos canonicos
- migrar campanhas legadas quando necessario
- remover heuristicas de product-as-default que sobreviverem em preview, prompts ou mappers

## 15. Criterios para considerar pronto para implementacao

Esta separacao so pode ser considerada pronta para implementacao quando:

1. `content_type` estiver definido como enum fechado de dominio e com plano de migracao explicito do legado.
2. `Campaign Brief` estiver definido como contrato discriminado por dominio.
3. estiver claro o que pertence a `Campaign Context`, ao `Store Profile Context` e ao `Visual Composition Context`.
4. `message` estiver modelado como dominio proprio, sem dependencia estrutural de `offer_name` ou `product layout`.
5. estiver definido quais capacidades do pipeline sao sensiveis ao dominio e quais permanecem agnosticas.
6. o renderer continuar livre de regra comercial e de branching por dominio.
7. houver criterio server-side para enforcement de plano e consistencia por dominio.
8. houver estrategia explicita para campanhas historicas com `content_type = info`.

## 16. Riscos de adiar a separacao

Se a separacao for adiada, os riscos principais sao:

- consolidar `product` como falso caso padrao de todo o sistema
- multiplicar excecoes de `service` e `message` em UI, prompts e renderer
- endurecer contratos errados antes do composer entrar em producao
- misturar regra comercial com regra visual
- dificultar enforcement de plano por capacidade comercial
- aumentar custo de migracao quando preview, spec e renderer ja estiverem acoplados ao legado
- manter `info` como categoria ambigua entre aviso, promocao e mensagem

## 17. Decisao final

Arquiteturalmente, o Vendeo deve operar com um unico core de campanha e tres dominios explicitos de conteudo.

O que muda nao e a entidade operacional central. O que muda e a clareza do contrato comercial que entra nela.

`product` e `service` permanecem proximos onde ha reaproveitamento real.

`message` passa a existir como dominio proprio.

Marca continua no `Brand Profile`.

Regra comercial continua no `Campaign Context`.

Regra visual continua no pipeline de composicao.