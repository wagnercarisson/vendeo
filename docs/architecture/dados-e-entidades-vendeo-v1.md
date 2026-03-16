# Dados e Entidades do Vendeo v1

Status: Ativo
Versão: 1.0

Este documento descreve as principais entidades de dados do sistema Vendeo.

Ele serve como referência para evolução do banco de dados, integração entre serviços e manutenção do backend.


--------------------------------------------------
1. VISÃO GERAL DAS ENTIDADES
--------------------------------------------------

O sistema Vendeo é composto pelas seguintes entidades principais:

User
Store
Campaign
WeeklyPlan
WeeklyPlanItem
GenerationFeedback


Estrutura conceitual:

User
 ↓
Store
 ↓
Campaign
 ↓
Conteúdo gerado

Planejamento:

WeeklyPlan
 ↓
WeeklyPlanItem
 ↓
Campaign


--------------------------------------------------
2. USER
--------------------------------------------------

Representa o usuário autenticado no sistema.

Campos principais:

id
email
created_at

Um usuário pode possuir uma ou mais lojas.


--------------------------------------------------
3. STORE
--------------------------------------------------

Representa a loja física do usuário.

Campos principais:

id
name
city
state

brand_positioning
main_segment
tone_of_voice

address
neighborhood

phone
whatsapp
instagram

primary_color
secondary_color

created_at


A loja fornece o contexto para geração de campanhas.


--------------------------------------------------
4. CAMPAIGN
--------------------------------------------------

A campanha é a entidade central do sistema.

Campos principais:

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

ai_generated_at
created_at


Uma campanha pode conter:

arte
vídeo
copy
legenda
CTA
hashtags


--------------------------------------------------
5. WEEKLY PLAN
--------------------------------------------------

Representa um plano de conteúdo semanal.

Campos principais:

id
store_id
plan_name
created_at

Um plano organiza campanhas dentro de uma estratégia semanal.


--------------------------------------------------
6. WEEKLY PLAN ITEM
--------------------------------------------------

Representa um item específico dentro de um plano semanal.

Campos principais:

id
weekly_plan_id
campaign_id
created_at


Exemplo:

segunda → post
quarta → reels
sexta → post


Cada item pode gerar ou vincular uma campanha.


--------------------------------------------------
7. GENERATION FEEDBACK
--------------------------------------------------

Registra feedback do usuário sobre conteúdos gerados.

Campos principais:

id
campaign_id
content_type

vote
created_at


Exemplo:

content_type = campaign
vote = yes

Esse feedback ajuda a medir utilidade da geração.


--------------------------------------------------
8. RELAÇÕES ENTRE ENTIDADES
--------------------------------------------------

User
 └── Store

Store
 └── Campaign

Store
 └── WeeklyPlan

WeeklyPlan
 └── WeeklyPlanItem

WeeklyPlanItem
 └── Campaign

Campaign
 └── GenerationFeedback


--------------------------------------------------
9. PRINCÍPIOS DE MODELAGEM
--------------------------------------------------

As entidades do Vendeo seguem alguns princípios.

Campanha é a entidade central.

Planos semanais organizam campanhas.

A loja fornece contexto de geração.

O feedback melhora a qualidade da IA.


--------------------------------------------------
10. REGRA DE EVOLUÇÃO DO BANCO
--------------------------------------------------

Toda alteração no banco de dados deve seguir a regra:

Criar migration versionada antes da aplicação.

Essa é a regra de ouro do projeto.