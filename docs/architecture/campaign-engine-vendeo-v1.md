# Campaign Engine do Vendeo v1

Status: Ativo
Versão: 1.0

Este documento define a entidade central do sistema Vendeo: a campanha.

Toda a geração de conteúdo do sistema gira em torno dessa entidade.


--------------------------------------------------
1. DEFINIÇÃO DA CAMPANHA
--------------------------------------------------

Uma campanha representa um conteúdo de marketing completo criado a partir de um produto, serviço ou informação.

Uma campanha pode conter:

arte
vídeo
copy
legenda
CTA
hashtags

A campanha é o núcleo do sistema.


--------------------------------------------------
2. ESTRUTURA CONCEITUAL DA CAMPANHA
--------------------------------------------------

Uma campanha possui os seguintes dados principais:

id
store_id

product_name
price

objective
audience
product_positioning

details
image_url

ai_caption
ai_text
ai_cta
ai_hashtags

reels_script
reels_caption
reels_cta
reels_hashtags

status
created_at


--------------------------------------------------
3. CAMPANHA COMO UNIDADE DE CONTEÚDO
--------------------------------------------------

No Vendeo, uma campanha representa um único conteúdo comercial.

Exemplos:

Coca Cola 2L
Heineken 600ml
Troca de óleo
Combo churrasco

Mesmo quando existem múltiplos produtos, o sistema trata como um único conteúdo.

Exemplo:

Coca + Doritos

Isso é considerado um "combo".


--------------------------------------------------
4. TIPOS DE CAMPANHA
--------------------------------------------------

O sistema pode criar campanhas em dois contextos.

Criação manual

Usuário cria diretamente uma campanha.

Resultado:

gera arte
gera vídeo

Criação derivada de plano

Campanha criada a partir de um plano semanal.

post → gera arte
reels → gera vídeo


--------------------------------------------------
5. CICLO DE VIDA DA CAMPANHA
--------------------------------------------------

Uma campanha possui estados.

rascunho
gerada
editada
aprovada

Fluxo típico:

rascunho
↓
gerada
↓
editada
↓
aprovada


--------------------------------------------------
6. EDIÇÃO DA CAMPANHA
--------------------------------------------------

Após a geração, o usuário pode editar o conteúdo.

O conteúdo visual é separado em abas.

Arte

editar
regenerar
aprovar

Vídeo

editar
regenerar
aprovar

A campanha é considerada completa quando todos os conteúdos necessários foram aprovados.


--------------------------------------------------
7. RELAÇÃO COM PLANOS SEMANAIS
--------------------------------------------------

Uma campanha pode ou não estar vinculada a um plano semanal.

Estrutura:

weekly_plan
↓
weekly_plan_item
↓
campaign

Ou seja:

um plano possui itens
um item gera uma campanha


--------------------------------------------------
8. DUPLICAÇÃO DE CAMPANHA
--------------------------------------------------

O sistema permite duplicar campanhas.

Ao duplicar:

copiar dados estruturais
limpar conteúdos gerados

Campos copiados:

product_name
price
objective
audience
details

Campos limpos:

arte
vídeo
copy gerada


--------------------------------------------------
9. PRINCÍPIOS DA CAMPANHA
--------------------------------------------------

A campanha é a entidade central do Vendeo.

Todas as funcionalidades devem respeitar os seguintes princípios:

uma campanha representa um conteúdo comercial

campanhas devem ser rápidas de criar

campanhas devem ser fáceis de editar

campanhas devem gerar conteúdo focado em vendas


--------------------------------------------------
10. OBJETIVO DO CAMPAIGN ENGINE
--------------------------------------------------

O Campaign Engine existe para garantir:

consistência de dados
previsibilidade do sistema
facilidade de evolução do produto

Toda nova funcionalidade do Vendeo deve se integrar a essa entidade central.