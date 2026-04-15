# Contratos do Pipeline Visual v1

Status: baseline canonico para implementacao
Data: 2026-04-14
Relacionados:
- `docs/architecture/arquitetura-alvo-vendeo-v2.md`
- `docs/architecture/camada-identidade-visual-por-loja-v1.md`
- `docs/architecture/visual-reader-spec-v1.md`
- `lib/visual-reader/contracts.ts`
- `lib/domain/visual-composition/contracts.ts`

## 1. Objetivo

Fechar os contratos do pipeline visual completo antes da implementacao do composer, para impedir que heuristicas de composicao vazem para:

- componentes de UI
- rotas API
- preview de campanha
- renderer

O pipeline oficial passa a ser:

`Campaign Visual Brief + Brand Profile + Visual Reader Output -> Visual Intent -> Composition Spec -> Renderer Input`

Regra central:

- Reader observa
- Intent Resolver decide
- Spec Builder detalha
- Renderer executa

Nota de evolucao de dominio:

- `content_type` deve evoluir para os dominios explicitos `product`, `service` e `message`
- `info` permanece apenas como valor legado durante migracao
- a sensibilidade a dominio pertence ao brief, ao intent e ao spec builder, nunca ao renderer

## 2. Autoridade por Etapa

| Etapa | Produtor | Consumidor principal | Pode decidir layout? | Pode reinterpretar imagem? | Pode aplicar heuristica comercial? |
| --- | --- | --- | --- | --- | --- |
| Campaign Visual Brief | Campaign Context | Visual Intent Resolver | Nao | Nao | Sim, apenas no nivel de campanha/oferta |
| Brand Profile | Store Context | Visual Intent Resolver / Spec Builder | Nao | Nao | Nao |
| Visual Reader Output | Visual Reader | Visual Intent Resolver | Nao | Sim, apenas leitura visual estruturada | Nao |
| Visual Intent | Visual Intent Resolver | Composition Spec Builder | Sim, no nivel semantico | Nao | Sim |
| Composition Spec | Composition Spec Builder | Preview / Renderer Adapter | Sim, no nivel geometrico e tipografico | Nao | Nao |
| Renderer Input | Renderer Adapter | Renderer | Nao | Nao | Nao |

## 3. Contratos Canonicos

### 3.1 Contract A: Campaign Visual Brief

Responsabilidade:
descrever o que a campanha quer vender e quais elementos textuais e comerciais entram na composicao.

Produtor:
Campaign Context.

Consumidores:
Visual Intent Resolver.

Campos obrigatorios:

- `schema_version`
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
- `copy.headline`
- `copy.body_text`
- `copy.cta`

Campos diagnosticos opcionais:

- `copy.caption`
- `copy.hashtags`

Invariantes:

1. O contract deve carregar apenas informacao comercial e operacional.
2. Nenhum campo de layout entra aqui.
3. Nenhum campo de medicao de DOM entra aqui.
4. `campaign_type` continua sendo a fonte oficial de formato de entrega.
5. `content_type` continua sendo a fonte oficial da natureza comercial da peca.
6. o valor-alvo de `content_type` deve convergir para `product`, `service` ou `message`, com `info` apenas como compatibilidade legado.
7. `domain_input` e o payload canonico discriminado por `content_type`.
8. `product` e `service` compartilham um `OfferInput` com campos neutros como `offer_name`, `price`, `price_label`, `positioning` e `image.source_url`; `message` usa um contrato proprio de mensagem.

### 3.2 Contract B: Brand Profile

Responsabilidade:
fornecer identidade visual e assinatura da loja sem substituir estrategia de campanha.

Produtor:
Store Context.

Consumidores:
Visual Intent Resolver e Composition Spec Builder.

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

Invariantes:

1. Brand Profile nao promove automaticamente posicionamento de produto.
2. Cores e logo sao tokens de marca, nao decisoes de layout.
3. Contato da loja pode ser exibido ou ocultado pelo Intent, nunca decidido no renderer.

### 3.3 Contract C: Visual Reader Output

Responsabilidade:
fornecer sinais visuais estruturados sobre a imagem.

Produtor:
Visual Reader.

Consumidores:
Visual Intent Resolver.

Fonte oficial:
`lib/visual-reader/contracts.ts`

Campos obrigatorios:

- `detected`
- `matchType`
- `matchedTarget`
- `sceneType`
- `targetBox`
- `targetOrientation`
- `targetPosition`
- `targetOccupancy`
- `confidence`
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

Invariantes:

1. Reader nao retorna `compositionType`.
2. Reader nao escolhe `layout`.
3. Reader nunca inventa `targetBox` quando `matchType = none`.
4. `reasoningSummary` e diagnostico; nao entra em decisao deterministica do builder.

### 3.4 Contract D: Visual Intent Output

Responsabilidade:
transformar campanha + marca + leitura visual em decisoes semanticas deterministicas de composicao.

Produtor:
Visual Intent Resolver.

Consumidores:
Composition Spec Builder.

Campos obrigatorios:

- `schema_version`
- `intent_id`
- `campaign_id`
- `store_id`
- `template_family`
- `composition_type`
- `subject.source`
- `subject.box`
- `subject.anchor`
- `subject.preserve_entire_subject`
- `subject.expansion_mode`
- `text_policy.emphasis`
- `text_policy.max_headline_lines`
- `text_policy.max_body_lines`
- `text_policy.cta_visibility`
- `offer_policy.price_visibility`
- `offer_policy.price_style`
- `offer_policy.store_signature`
- `offer_policy.contact_mode`
- `background_policy.mode`
- `background_policy.overlay_strength`
- `layout_constraints.safe_zones`
- `layout_constraints.avoid_subject_overlap`
- `layout_constraints.minimum_margin_ratio`
- `decision_trace.fallback_level`
- `decision_trace.reader_reliance`

Decisoes que pertencem ao Intent e nao ao renderer:

- qual familia de template usar: `solid`, `floating`, `split`
- se a peca e `text_dominant`, `balanced` ou `product_dominant`
- se preco aparece e em qual tratamento
- se CTA aparece
- se assinatura da loja usa logo + nome, so nome ou fica oculta
- se contato usa WhatsApp, telefone ou fica oculto
- se a imagem recebe overlay, blur ou preservacao limpa
- quanto o sujeito pode expandir sem risco

Invariantes:

1. Intent pode usar fallback conservador, mas deve explicitar isso em `decision_trace`.
2. Intent nunca acessa medicao de UI.
3. Intent nunca devolve coordenadas finais de pixel.
4. Intent precisa ser derivavel apenas de contratos de dominio + reader.

### 3.5 Contract E: Composition Spec

Responsabilidade:
materializar o intent em uma especificacao geometrica e tipografica deterministica, independente do backend de render.

Produtor:
Composition Spec Builder.

Consumidores:
Preview da campanha, aprovacao visual, renderer adapter.

Campos obrigatorios:

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

Regras:

1. Composition Spec ja sai com geometrias finais em canvas space.
2. Preview e renderer devem consumir a mesma spec.
3. Nenhum consumidor pode recalcular layout principal fora da spec.
4. Se um slot estiver oculto, isso deve aparecer como `visible = false`, nao por ausencia heuristica do campo.

### 3.6 Contract F: Renderer Input

Responsabilidade:
achatar a Composition Spec em comandos executaveis por um backend concreto de renderizacao.

Produtor:
Renderer Adapter.

Consumidores:
Canvas renderer, eventualmente HTML renderer ou outro backend.

Campos obrigatorios:

- `schema_version`
- `renderer`
- `canvas.width`
- `canvas.height`
- `assets`
- `nodes`

Tipos minimos de node:

- `image`
- `text`
- `shape`
- `icon`

Invariantes:

1. Renderer Input nao pode conter regra de negocio.
2. Renderer Input nao pode conter `measured*` vindo do DOM.
3. O renderer nao decide mostrar preco, CTA, contato ou assinatura.
4. O renderer apenas desenha os nodes na ordem definida.

## 4. Regras de Derivacao Entre Etapas

### 4.1 Campaign Visual Brief + Brand Profile + Reader -> Visual Intent

O Intent Resolver pode decidir:

- `template_family`
- `composition_type`
- `subject.anchor`
- `background_policy`
- `offer_policy`
- `text_policy`

O Intent Resolver nao pode decidir:

- coordenadas finais de pixel
- tamanhos finais de fonte em px
- borda, sombra ou radius final do backend

### 4.2 Visual Intent + Brand Profile + Campaign Visual Brief -> Composition Spec

O Spec Builder pode decidir:

- areas finais de hero, headline, body, CTA, badge e assinatura
- tipografia final em px
- hierarquia visual final
- tokens finais aplicados

O Spec Builder nao pode decidir:

- reinterpretar se o produto foi detectado ou nao
- mudar politica comercial definida no intent

### 4.3 Composition Spec -> Renderer Input

O Adapter pode decidir:

- flatten de slots em draw nodes
- ordem de desenho
- normalizacao de assets para um backend especifico

O Adapter nao pode decidir:

- layout alternativo
- mostrar/ocultar componentes
- fallback de preco, CTA ou assinatura

## 5. Campos Derivados Oficiais

Os campos abaixo sao permitidos apenas como derivados fora do reader:

- `composition_type`
- `template_family`
- `subject.source`
- `offer_policy.*`
- `background_policy.*`

Os campos abaixo ficam proibidos fora do pipeline canonico:

- `layout` decidido na UI
- `measuredBadge*`, `measuredHeadline*`, `measuredCTA*` e similares como contrato oficial
- qualquer `any` que funcione como contrato de fato entre preview e renderer

## 6. Politica de Fallback

Fallback oficial do pipeline:

1. campanha
2. reader estruturado
3. heuristica conservadora explicita no `decision_trace`

Regras obrigatorias:

1. `matchType = none` nunca gera sujeito inventado.
2. campanha `content_type = message` prioriza composicao `text_dominant` ou `balanced`; durante migracao, `info` segue a mesma policy como alias legado.
3. campanha sem preco nao permite badge de preco visivel.
4. ausencia de logo nao bloqueia assinatura por nome.
5. ausencia de contato nao pode gerar placeholder visual enganoso.

## 7. Persistencia e Ciclo de Vida

Persistencia minima obrigatoria:

- Campaign continua sendo a entidade operacional central.
- Visual Reader Output pode ser snapshotado, mas nao e obrigatorio em v1.
- Visual Intent e Composition Spec devem ser trataveis como artefatos reprodutiveis, mesmo que inicialmente so em runtime.

Persistencia proibida como fonte de verdade:

- renderer input backend-specific
- medicoes de DOM do preview

## 8. Contrato de Preview

O preview deixa de ser autoridade de layout.

Nova regra:

- Preview consome `CompositionSpec`.
- Ajustes editoriais alteram Campaign Visual Brief ou, quando aplicavel, parametros de intent autorizados.
- Preview nao cria geometria propria para depois o renderer imitar.

## 9. Mapeamento do Estado Atual para o Estado-Alvo

| Estado atual | Problema | Estado-alvo |
| --- | --- | --- |
| `CampaignPreviewData.layout` | layout nasce na UI | `VisualIntent.template_family` |
| `GraphicInput.measured*` | DOM virou contrato de render | `CompositionSpec.slots.*.frame` |
| preview gera forma final e renderer persegue paridade | autoridade invertida | preview e renderer consomem a mesma `CompositionSpec` |
| renderer decide fallback de preco e assinatura | regra comercial vazou para execucao | `offer_policy` definido no intent |
| objetos `any` entre mappers e componentes | contrato implicito e fragil | contratos tipados e versionados |

## 10. Decisao Arquitetural

Passa a valer como baseline do produto:

1. `lib/visual-reader/contracts.ts` continua sendo a fonte oficial do output do reader.
2. `lib/domain/visual-composition/contracts.ts` passa a ser a fonte oficial dos contratos do composer, spec builder e renderer adapter.
3. Nenhum componente de UI pode consumir diretamente sinais do reader para decidir layout final.
4. Nenhuma rota pode montar input do renderer a partir de shape de preview.
5. Nenhum renderer pode depender de medicao de DOM para paridade.

## 11. Proximos Passos

1. Criar `VisualIntentResolver` consumindo apenas os contratos A, B e C.
2. Criar `CompositionSpecBuilder` consumindo apenas D + tokens de marca.
3. Adaptar preview para ler E em vez de `CampaignPreviewData` como shape final.
4. Criar adapter `CompositionSpec -> RendererInput` e migrar o renderer atual para F.
5. Remover progressivamente `measured*` do contrato publico do renderer.