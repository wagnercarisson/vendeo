# Persistencia e Estrategia de Migracao para a Arquitetura-Alvo V2

Status: proposta executavel para aterrissagem incremental no banco
Data: 2026-04-14
Relacionados:
- `docs/architecture/arquitetura-alvo-vendeo-v2.md`
- `docs/architecture/matriz-gaps-v2-vs-atual.md`
- `docs/architecture/contratos-pipeline-visual-v1.md`
- `docs/architecture/camada-identidade-visual-por-loja-v1.md`
- `docs/architecture/separacao-dominios-conteudo-v1.md`
- `database/schema.sql`
- `database/migrations/002_rls_owner_based.sql`

## 1. Resumo Executivo

Recomendacao central:

1. `Campaign` permanece como unidade operacional central.
2. `stores` continua sendo o agregado transacional da loja, mas passa a publicar um `brand_profile` canonico para consumo.
3. `campaigns.content_type` deve convergir para enum fechado `product | service | message`, com compatibilidade temporaria para leitura de `info`.
4. `campaigns` deve carregar o estado vivo operacional da campanha e o contrato discriminado minimo de dominio.
5. Aprovacao de asset deve ganhar registro transacional proprio, com `storage_path` como fonte de verdade e snapshots minimos de rastreabilidade.
6. `weekly_plan_items` deve continuar representando planejamento; o dominio planejado precisa ser persistido separadamente do formato de execucao.
7. A migracao deve ser incremental, com dupla leitura temporaria e dual-write curto apenas onde necessario.

Diretriz de modelagem:

- verdade transacional fica em `stores`, `campaigns`, `weekly_plans`, `weekly_plan_items` e em uma nova tabela de assets aprovados
- snapshot de rastreabilidade fica em nova tabela de assets aprovados e opcionalmente em tabelas de versao/publicacao
- dado derivado continua em contrato de aplicacao e nao vira fonte de verdade no banco

## 2. Principios de Persistencia

### 2.1 Fonte de verdade transacional

Deve ser persistido como verdade operacional:

- ownership da loja em `stores.owner_user_id`
- estado vivo da loja em `stores`
- estado vivo da campanha em `campaigns`
- estado vivo do plano em `weekly_plans` e `weekly_plan_items`
- vinculo oficial plano -> execucao em `campaigns.weekly_plan_item_id`
- binario aprovado referenciado por registro transacional canonico

### 2.2 Snapshot de rastreabilidade

Deve ser persistido apenas para reconstituicao e auditoria:

- versao publicada do `Brand Profile` usada na aprovacao
- snapshot minimo do brief da campanha aprovado
- snapshot visual minimo da aprovacao, quando houver pipeline visual canonico ativo
- metadados de origem do asset aprovado

### 2.3 Derivado que nao deve competir com a verdade

Nao deve virar fonte oficial:

- URL assinada
- URL publica derivada de `storage_path`
- escolhas de layout finais fora do contrato aprovado
- flags de preview
- heuristicas de renderer
- normalizacoes de leitura para compatibilidade legado

## 3. Modelo Persistido Recomendado

## 3.1 Brand Profile por loja

### 3.1.1 Recomendacao

Persistir o contrato publicado dentro de `stores`, sem mover a autoria original para outra tabela neste primeiro corte.

Campos recomendados em `stores`:

- `brand_profile jsonb`
- `brand_profile_version integer`
- `brand_profile_updated_at timestamptz`

Forma de uso:

- campos legados continuam sendo autoria e compatibilidade
- `stores.brand_profile` vira a fonte oficial de consumo
- `stores.brand_profile_version` identifica a publicacao oficial vigente
- `stores.brand_profile_updated_at` registra a ultima promocao a contrato oficial

### 3.1.2 O que permanece como campo legado de autoria em `stores`

Devem continuar existindo como campos de autoria humana e compatibilidade:

- `name`
- `city`
- `state`
- `address`
- `neighborhood`
- `phone`
- `whatsapp`
- `instagram`
- `logo_url`
- `primary_color`
- `secondary_color`
- `main_segment`
- `brand_positioning`
- `tone_of_voice`

Regra:

- a UI de manutencao da loja continua editando esses campos primeiro
- a camada de publicacao consolida esses dados em `brand_profile`
- consumidores de dominio e pipeline visual deixam de ler campos soltos diretamente quando `brand_profile` estiver presente

### 3.1.3 Fonte oficial de consumo

Fonte oficial de consumo:

- `stores.brand_profile`

Fallback temporario durante migracao:

- se `stores.brand_profile` for nulo, a aplicacao monta o contrato a partir dos campos legados

### 3.1.4 Versionamento

Recomendacao inicial:

- `brand_profile_version integer not null default 1`

Motivo:

- inteiro monotonicamente crescente e mais simples para rollout, logs e snapshots
- hash estavel e util depois, mas nao necessario para destravar a primeira fase

### 3.1.5 Necessidade de tabela de historico

Nao e obrigatoria para a primeira entrega.

Tabela desejavel depois:

- `store_brand_profile_versions`

Uso futuro:

- historico completo de publicacoes
- diff entre versoes
- auditoria de autoria

## 3.2 Campaign por dominio

### 3.2.1 Evolucao de `campaigns.content_type`

Estado-alvo fechado:

- `product`
- `service`
- `message`

Compatibilidade temporaria:

- `info` permanece apenas como valor legado de leitura e migracao

### 3.2.2 Como representar `domain_input`

Opcoes:

1. Apenas JSONB em `campaigns.domain_input`
2. Apenas colunas especificas em `campaigns`
3. Modelo hibrido: colunas canonicas minimas + `domain_input jsonb`

### 3.2.3 Tradeoffs

Opcao 1: apenas JSONB

Vantagens:

- maior flexibilidade de evolucao
- menor custo inicial de schema
- acomoda bem contratos discriminados

Riscos:

- menor enforcement relacional
- queries analiticas mais caras
- maior risco de drift entre aplicacao e banco

Opcao 2: apenas colunas especificas

Vantagens:

- constraints fortes no banco
- queries simples e indexacao mais obvia
- melhor observabilidade SQL

Riscos:

- schema fica acoplado ao detalhe do dominio
- `message` tende a gerar colunas esparsas ou artificiais
- evolucao incremental fica mais cara

Opcao 3: modelo hibrido

Vantagens:

- preserva colunas operacionais de alto valor
- permite contrato discriminado flexivel
- minimiza ruptura com o schema atual
- reduz acoplamento do banco ao detalhe de copy e composicao

Riscos:

- exige disciplina sobre o que e coluna canonica e o que e payload discriminado
- dualidade mal governada pode gerar duplicacao semantica

### 3.2.4 Recomendacao final

Adotar modelo hibrido.

Colunas que devem permanecer em `campaigns` como estado operacional canonico:

- `id`
- `store_id`
- `weekly_plan_item_id`
- `origin`
- `campaign_type`
- `content_type`
- `audience`
- `objective`
- `product_positioning`
- `status`
- `post_status`
- `reels_status`
- campos de copy e reels ja existentes enquanto o runtime ainda depende deles

Novas colunas recomendadas em `campaigns`:

- `domain_input jsonb not null default '{}'::jsonb`
- `domain_input_version integer not null default 1`
- `legacy_content_type text`

Uso recomendado:

- `content_type` identifica o dominio
- `domain_input` carrega o payload discriminado do dominio
- colunas legadas como `product_name`, `price`, `price_label`, `product_image_url` permanecem como compatibilidade operacional e read model temporario

### 3.2.5 Forma do `domain_input`

Recomendacao de shape canonico:

Para `product` e `service`:

```json
{
  "schema_version": 1,
  "domain": "product",
  "offer_name": "...",
  "price": 129.9,
  "price_label": "LANCAMENTO",
  "positioning": "...",
  "benefit": "...",
  "image": {
    "source_url": "...",
    "storage_path": "..."
  }
}
```

Para `message`:

```json
{
  "schema_version": 1,
  "domain": "message",
  "message_title": "...",
  "message_body": "...",
  "cta": "...",
  "valid_until": "2026-04-30",
  "image": {
    "source_url": "...",
    "storage_path": "..."
  }
}
```

### 3.2.6 O que nao deve virar coluna agora

Nao vale abrir coluna dedicada agora para:

- detalhes de mensagem institucional
- parametros de layout
- fragmentos de spec visual
- dados de preview

## 3.3 Campanhas legadas

### 3.3.1 Tratamento de `campaigns.content_type = info`

Recomendacao:

- `info` deve ser semanticamente reclassificado para `message`
- a coluna `legacy_content_type` deve preservar o valor original quando houver backfill

Backfill recomendado:

- `legacy_content_type = content_type` quando `content_type = 'info'`
- `content_type = 'message'` para campanhas existentes com `info`

### 3.3.2 Compatibilidade de leitura

Durante transicao, a aplicacao deve:

- aceitar `info` ao ler registros antigos ainda nao migrados
- normalizar para `message` no contrato interno do dominio
- parar de emitir `info` em qualquer write novo

### 3.3.3 Compatibilidade de escrita

Durante janela de transicao curta:

- escritor canonico persiste apenas `product | service | message`
- leitores legados podem mapear `message -> info` apenas se algum trecho antigo ainda exigir isso

Regra:

- este mapeamento reverso deve existir somente na borda da aplicacao e nunca no banco como nova verdade

## 3.4 Vinculo entre Weekly Plan e Campaign

### 3.4.1 Recomendacao de modelagem

Hoje `weekly_plan_items.content_type` representa formato de entrega `post | reels | both`.

Para evitar colisao semantica, isso nao deve ser reutilizado como dominio comercial.

Modelo recomendado:

- manter `weekly_plan_items.content_type` como legado operacional de formato por compatibilidade imediata
- adicionar `weekly_plan_items.target_content_type text`
- adicionar `weekly_plan_items.target_domain_input jsonb`

Estado-alvo semantico:

- `target_content_type` representa a intencao comercial planejada
- `campaign_type` ou o atual `weekly_plan_items.content_type` representa o formato esperado da execucao

Opcao desejavel depois:

- renomear `weekly_plan_items.content_type` para `target_campaign_type` em uma fase posterior, quando o runtime estiver limpo

### 3.4.2 Quando `target_content_type` vira `campaigns.content_type`

No momento de promocao oficial do item de plano para campanha.

Regra operacional:

- enquanto o item esta em planejamento, `target_content_type` e intencao
- ao criar a campanha derivada, `campaigns.content_type` recebe o valor de `target_content_type`
- `campaigns.domain_input` nasce de `weekly_plan_items.target_domain_input` mais normalizacoes server-side

### 3.4.3 Como evitar colisao semantica entre planejamento e execucao

Separar claramente:

- planejamento: `target_content_type`, `target_domain_input`, brief e agenda
- execucao: `campaigns.content_type`, `campaigns.domain_input`, status e aprovacao

Regra:

- nenhum consumidor deve inferir dominio da campanha a partir do formato planejado

## 3.5 Approved Asset Contract e rastreabilidade minima

### 3.5.1 Recomendacao estrutural

Criar tabela nova:

- `campaign_approved_assets`

Motivo:

- aprovacao e evento transacional proprio
- campanhas podem evoluir apos aprovacao
- snapshots de rastreabilidade nao devem poluir o estado vivo da campanha

### 3.5.2 Campos recomendados

Colunas minimas:

- `id uuid primary key`
- `campaign_id uuid not null references public.campaigns(id) on delete cascade`
- `store_id uuid not null references public.stores(id) on delete cascade`
- `asset_kind text not null`
- `approval_status text not null default 'approved'`
- `approved_at timestamptz not null default now()`
- `approved_by uuid`
- `storage_bucket text not null`
- `storage_path text not null`
- `public_url_legacy text`
- `generation_source text not null`
- `campaign_snapshot jsonb not null`
- `visual_snapshot jsonb`
- `brand_profile_version integer`
- `brand_profile_snapshot jsonb`
- `created_at timestamptz not null default now()`

Constraints recomendadas:

- `asset_kind in ('post_image', 'reels_cover', 'reels_video')`
- `approval_status in ('approved', 'superseded')`
- unique parcial para apenas um asset aprovado ativo por campanha e `asset_kind`, se isso refletir a regra operacional

### 3.5.3 Fonte de verdade do storage

Fonte de verdade persistida:

- `storage_bucket`
- `storage_path`

`public_url_legacy` existe apenas para compatibilidade e observabilidade durante migracao.

### 3.5.4 O que precisa ser persistido para reconstituir aprovacao

Minimo necessario:

- `campaign_id`
- `asset_kind`
- `approved_at`
- `storage_bucket`
- `storage_path`
- `generation_source`
- `campaign_snapshot`
- `brand_profile_version`

Persistencia desejavel quando o visual composer estiver em producao:

- `visual_snapshot`
- `brand_profile_snapshot`

### 3.5.5 Quando snapshotar

No ato de aprovacao:

- snapshotar `campaign_snapshot` sempre
- snapshotar `brand_profile_version` sempre
- snapshotar `brand_profile_snapshot` quando a reprodutibilidade completa for relevante
- snapshotar `visual_snapshot` quando a campanha tiver passado pelo pipeline visual canonico

### 3.5.6 O que fica em `campaigns` e o que sai

Em `campaigns` deve permanecer:

- estado operacional vivo
- ponteiros operacionais temporarios ainda usados pelo runtime atual, como `image_url`

Em `campaign_approved_assets` deve ficar:

- registro canonico de aprovacao
- snapshots de rastreabilidade
- referencia oficial ao arquivo aprovado

Recomendacao pratica:

- manter `campaigns.image_url` por compatibilidade de leitura no curto prazo
- padronizar novas escritas para apontar para `storage_path` quando usado como ponteiro temporario
- migrar consumidores para ler o asset aprovado canonico

## 3.6 Governanca de storage

### 3.6.1 Padrao de `storage_path`

Padrao recomendado para artefatos aprovados:

`stores/{store_id}/campaigns/{campaign_id}/approved/{asset_kind}/{timestamp}-{slug}.{ext}`

Exemplos:

- `stores/STORE_ID/campaigns/CAMPAIGN_ID/approved/post_image/20260414T143500Z-main.png`
- `stores/STORE_ID/campaigns/CAMPAIGN_ID/approved/reels_video/20260414T143700Z-v1.mp4`

Motivos:

- separa ownership logico por loja
- separa campanha como unidade operacional
- distingue area aprovada de area de trabalho futura
- facilita auditoria e limpeza controlada

### 3.6.2 URL assinada vs fonte de verdade

Regra:

- `storage_path` e a verdade persistida
- URL assinada e derivada efemera de acesso
- URL publica, quando existir, e apenas compatibilidade de transicao

### 3.6.3 Compatibilidade com registros antigos que salvam URL publica

Migracao recomendada em duas etapas:

1. backfill heuristico para extrair `storage_path` quando a URL aponta para bucket conhecido
2. quando nao for possivel extrair, preservar URL antiga em `public_url_legacy` e marcar o registro como legado sem rastreabilidade completa

Regra de leitura:

- primeiro ler `storage_path`
- se ausente, cair para `public_url_legacy`
- nao persistir novas aprovacoes somente com URL publica

## 3.7 RLS, ownership e seguranca

### 3.7.1 Impactos em RLS

O modelo owner-based atual continua valido e deve ser preservado.

Novas estruturas que exigem atencao:

- `campaign_approved_assets`
- novas colunas JSONB em `campaigns`
- novas colunas de planejamento em `weekly_plan_items`
- possivel bucket novo ou nova policy de bucket atual para area aprovada

### 3.7.2 RLS para `campaign_approved_assets`

Politica recomendada:

- select, insert, update e delete condicionados por ownership da loja vinculada ao asset

Expressao-base:

- `exists (select 1 from public.stores s where s.id = campaign_approved_assets.store_id and s.owner_user_id = auth.uid())`

### 3.7.3 Risco atual de storage

Hoje o bucket `campaign-images` aceita insert de qualquer usuario autenticado e ownership e delegado ao owner do objeto em `storage.objects`.

Isso nao expressa ownership de loja.

Recomendacao incremental:

- manter bucket atual na transicao para nao quebrar upload
- endurecer contrato de nome de caminho por `store_id/campaign_id`
- validar server-side se o objeto aprovado pertence a campanha e a loja do usuario

Recomendacao desejavel depois:

- criar politicas de storage mais restritas por prefixo ou mediar aprovacao apenas por backend confiavel

### 3.7.4 Colunas novas com atencao especial

Devem ser tratadas como dados de dominio sensiveis e nao manipuladas livremente pelo cliente:

- `stores.brand_profile`
- `stores.brand_profile_version`
- `campaigns.domain_input`
- `weekly_plan_items.target_domain_input`
- `campaign_approved_assets.campaign_snapshot`
- `campaign_approved_assets.visual_snapshot`
- `campaign_approved_assets.brand_profile_snapshot`

Regra:

- escrita deve ser arbitrada por services server-side do dominio, nao por update aberto do cliente

## 4. Plano de Migracao por Fases

## 4.1 Fase 0 - Compatibilidade de leitura

Objetivo:

- preparar a aplicacao para ler o futuro schema antes de exigir novas colunas

Acoes:

- normalizar `info -> message` no dominio de leitura
- introduzir leitor de `Brand Profile` com fallback dos campos legados
- introduzir resolvedor de asset aprovado que prefira `storage_path` e caia para URL legada

Dependencias:

- apenas contrato de aplicacao

## 4.2 Fase 1 - Extensoes aditivas no banco

Objetivo:

- adicionar colunas e tabela nova sem quebrar runtime atual

Migrations SQL minimas:

1. adicionar em `stores`:
   - `brand_profile jsonb`
   - `brand_profile_version integer not null default 1`
   - `brand_profile_updated_at timestamptz`
2. adicionar em `campaigns`:
   - `domain_input jsonb not null default '{}'::jsonb`
   - `domain_input_version integer not null default 1`
   - `legacy_content_type text`
3. adicionar em `weekly_plan_items`:
   - `target_content_type text`
   - `target_domain_input jsonb not null default '{}'::jsonb`
4. criar `campaign_approved_assets`
5. criar indexes auxiliares
6. criar RLS de `campaign_approved_assets`

Compatibilidade:

- nenhuma coluna antiga e removida
- nenhuma constraint antiga e endurecida ainda

## 4.3 Fase 2 - Backfill e publicacao controlada

Objetivo:

- preencher novas estruturas a partir do legado

Acoes SQL e operacionais:

1. backfill de `stores.brand_profile` a partir dos campos legados
2. backfill de `campaigns.domain_input` a partir de `product_name`, `price`, `price_label`, `product_positioning`, `product_image_url`
3. backfill de `campaigns.legacy_content_type` quando houver `info`
4. reclassificacao de `campaigns.content_type = 'info'` para `message`
5. backfill de `weekly_plan_items.target_content_type` com heuristica inicial ou valor seguro definido pelo dominio
6. popular `campaign_approved_assets` para campanhas aprovadas quando houver `image_url` mapeavel para storage

Observacao:

- o backfill de `weekly_plan_items.target_content_type` pode exigir regra de aplicacao e revisao de negocio; se a heuristica nao for confiavel, aceitar nulo temporariamente e preencher apenas para novos registros

## 4.4 Fase 3 - Dual-read canonico e dual-write curto

Objetivo:

- trocar consumidores para as novas fontes de verdade

Acoes:

- leitores de marca passam a preferir `stores.brand_profile`
- criacao de campanha passa a preencher `content_type` novo e `domain_input`
- promocao de item de plano passa a copiar `target_content_type` e `target_domain_input`
- aprovacao passa a escrever em `campaign_approved_assets`
- leitura de asset aprovado passa a vir da nova tabela

Compatibilidade temporaria:

- continuar atualizando `campaigns.image_url` enquanto a UI ainda depender dela
- continuar mantendo colunas legadas de oferta enquanto relatórios e telas antigas dependerem delas

## 4.5 Fase 4 - Endurecimento de constraints

Objetivo:

- tornar o novo modelo obrigatorio para novas escritas

Migrations SQL:

1. alterar check de `campaigns.content_type` para `('product', 'service', 'message')`
2. adicionar check em `weekly_plan_items.target_content_type` quando a cobertura estiver completa
3. adicionar check semantico minimo em `campaigns.domain_input` com funcao SQL ou constraint leve apenas se o custo operacional valer a pena
4. opcionalmente adicionar unique parcial de asset aprovado ativo por campanha e `asset_kind`

Regra:

- so endurecer depois que o runtime deixar de escrever legado

## 4.6 Fase 5 - Corte do legado

Objetivo:

- remover dependencias antigas, nao necessariamente remover colunas de imediato

Criterios de corte:

- nenhum writer novo emite `info`
- nenhum consumidor oficial le campos soltos de marca quando `brand_profile` existe
- aprovacao e leitura de asset usam `campaign_approved_assets`
- nenhuma tela critica depende de URL publica persistida como verdade

Remocoes ou reducoes possiveis depois:

- parar de usar `campaigns.image_url` como fonte de verdade
- parar de usar `weekly_plan_items.content_type` como fonte semantica de dominio
- avaliar renome de `weekly_plan_items.content_type` para `target_campaign_type`
- avaliar remocao futura de colunas redundantes de oferta se `domain_input` ja cobrir tudo

## 5. Migrations Necessarias

## 5.1 Minimas para destravar desenvolvimento

1. migration de `stores.brand_profile`, `brand_profile_version`, `brand_profile_updated_at`
2. migration de `campaigns.domain_input`, `domain_input_version`, `legacy_content_type`
3. migration de `weekly_plan_items.target_content_type`, `target_domain_input`
4. migration de criacao de `campaign_approved_assets`
5. migration de RLS para `campaign_approved_assets`

## 5.2 Desejaveis depois

1. migration para ajustar check de `campaigns.content_type` para `message`
2. migration para renomear `weekly_plan_items.content_type` para algo que expresse formato, quando o runtime permitir
3. migration para criar `store_brand_profile_versions`
4. migration para endurecer politicas de storage ou criar bucket dedicado de aprovados

## 6. Decisoes que Dependem de SQL vs Contrato de Aplicacao

## 6.1 Dependem de migration SQL

- novas colunas em `stores`
- novas colunas em `campaigns`
- novas colunas em `weekly_plan_items`
- nova tabela `campaign_approved_assets`
- novos indexes
- novos checks e ajustes de enum fechado
- politicas RLS da nova tabela

## 6.2 Podem ficar em contrato de aplicacao por enquanto

- normalizacao `info -> message` na borda de leitura
- construcao do `brand_profile` a partir de campos legados quando nulo
- shape detalhado de `domain_input`
- regra de preenchimento do `target_domain_input`
- criterio de quando incluir `visual_snapshot`
- geracao de URL assinada a partir de `storage_path`
- mapeamento de leitura de `campaigns.image_url` para asset aprovado ate o corte completo

## 7. Riscos e Tradeoffs

## 7.1 Complexidade operacional

Risco:

- periodo de coexistencia entre campos legados e novas fontes de verdade

Mitigacao:

- definir precedence clara de leitura
- limitar dual-write ao menor tempo possivel

## 7.2 Custo de query

Risco:

- JSONB aumenta custo de introspecao e analytics

Mitigacao:

- manter colunas operacionais mais consultadas fora do JSONB
- indexar apenas o que for realmente consultado

## 7.3 Flexibilidade futura

Beneficio:

- modelo hibrido acomoda bem novos detalhes de `service` e `message`

Risco:

- excesso de liberdade no JSONB virar schema paralelo invisivel

Mitigacao:

- versionar `domain_input`
- validar no service do dominio

## 7.4 Auditoria

Risco atual:

- aprovacao sem registro canonico proprio compromete reconstituicao

Mitigacao:

- adotar `campaign_approved_assets` cedo

## 7.5 Acoplamento indevido entre persistencia e dominio

Risco:

- tentar refletir cada detalhe do contrato visual em colunas SQL

Mitigacao:

- persistir apenas o minimo operacional e de rastreabilidade
- deixar layout, intent e spec como contratos versionados de aplicacao e snapshot quando aprovados

## 8. Recomendacao Final Executavel

## 8.1 Esquema alvo recomendado

`stores`

- manter campos legados de autoria
- adicionar `brand_profile`, `brand_profile_version`, `brand_profile_updated_at`

`campaigns`

- manter campanha como agregado operacional central
- fechar `content_type` em `product | service | message`
- adicionar `domain_input`, `domain_input_version`, `legacy_content_type`
- manter campos legados de oferta e copy por compatibilidade de rollout

`weekly_plan_items`

- manter vinculo com o plano
- adicionar `target_content_type`, `target_domain_input`
- manter o campo legado atual de formato ate renome controlado

`campaign_approved_assets`

- nova tabela canonica para aprovacao, storage e snapshots minimos

## 8.2 O que deve ser implementado primeiro no banco para destravar o dev

Ordem recomendada:

1. `stores.brand_profile*`
2. `campaigns.domain_input*`
3. `weekly_plan_items.target_content_type` e `target_domain_input`
4. `campaign_approved_assets`
5. RLS e indexes da nova tabela

Razao:

- isso destrava modelagem de dominio, pipeline visual e aprovacao sem forcar corte imediato do legado

## 8.3 Ordem de implementacao recomendada

1. adaptar aplicacao para leitura compativel
2. aplicar migrations aditivas
3. executar backfill controlado
4. migrar writes do dominio
5. endurecer constraints
6. cortar legado por criterio objetivo

## 8.4 Posicao final

O desenho mais seguro para o Vendeo neste momento nao e reescrever o schema em torno de micro-entidades novas. O caminho correto e:

- manter `campaigns` como centro operacional
- publicar `Brand Profile` dentro de `stores`
- discriminar dominio em `campaigns.content_type`
- carregar detalhe de dominio em `campaigns.domain_input`
- separar aprovacao em registro transacional proprio
- tratar `storage_path` como verdade persistida
- migrar por adicao, backfill, dual-read e endurecimento gradual

Esse desenho preserva o fluxo `Store -> Campaign -> Generation -> Approval`, mantem o ownership atual, evita empurrar regra comercial para storage ou renderer e reduz risco de quebra durante a transicao.