# Arquitetura Geral do Vendeo v1

Status: Ativo
Versão: 1.0

Este documento descreve a arquitetura geral do sistema Vendeo.

O objetivo é fornecer uma visão clara de como os componentes do sistema interagem entre si.


--------------------------------------------------
1. VISÃO GERAL DA ARQUITETURA
--------------------------------------------------

O Vendeo é composto por quatro camadas principais:

Frontend
API Backend
Banco de Dados
Motor de IA


Estrutura geral:

Usuário
 ↓
Frontend (Next.js)
 ↓
API Backend
 ↓
Serviços de Geração
 ↓
Banco de Dados (Supabase)
 ↓
Serviços de IA


--------------------------------------------------
2. FRONTEND
--------------------------------------------------

Tecnologia principal:

Next.js 14
App Router
TypeScript

Responsabilidades do frontend:

renderizar interface
coletar dados do usuário
exibir campanhas
exibir artes e vídeos gerados
permitir edição e regeneração
mostrar status de aprovação


Principais páginas do sistema:

/dashboard
/store
/campaigns
/campaigns/new
/campaigns/[id]
/plans


Componentes importantes:

CampaignPreview
CampaignEditForm
ReelsPreviewCard
PostModal


--------------------------------------------------
3. API BACKEND
--------------------------------------------------

O backend é implementado através de rotas API do Next.js.

Essas rotas são responsáveis por:

receber dados do frontend
executar geração de conteúdo
armazenar resultados no banco
retornar dados para o frontend


Principais rotas de geração:

/api/generate/campaign
/api/generate/reels
/api/generate/weekly-plan


Responsabilidades das rotas:

validar entrada
normalizar dados
montar contexto da campanha
executar geração de IA
salvar resultado


--------------------------------------------------
4. BANCO DE DADOS
--------------------------------------------------

O sistema utiliza Supabase com PostgreSQL.

Principais tabelas:

stores
campaigns
weekly_plans
weekly_plan_items
generation_feedback


Responsabilidades do banco:

armazenar campanhas
armazenar planos semanais
armazenar identidade da loja
registrar feedback de geração


--------------------------------------------------
5. MOTOR DE GERAÇÃO
--------------------------------------------------

O motor de geração utiliza modelos de IA para produzir conteúdo de marketing.

Responsabilidades:

gerar copy
gerar legendas
gerar hashtags
gerar roteiro de vídeo
gerar estrutura da arte


Entrada do motor:

dados da campanha
contexto da loja
estratégia
público


Saída do motor:

arte
vídeo
copy
legenda
CTA
hashtags


--------------------------------------------------
6. FLUXO DE GERAÇÃO
--------------------------------------------------

O fluxo típico de geração segue o seguinte caminho:

Usuário cria campanha
 ↓
Frontend envia dados
 ↓
API recebe requisição
 ↓
API normaliza dados
 ↓
API chama motor de geração
 ↓
IA gera conteúdo
 ↓
API salva resultado no banco
 ↓
Frontend recebe dados
 ↓
Usuário edita e aprova campanha


--------------------------------------------------
7. EDIÇÃO E REGENERAÇÃO
--------------------------------------------------

Após a geração, o usuário pode:

editar texto
regenerar arte
regenerar vídeo
aprovar conteúdo

Conteúdos visuais são separados em abas:

Arte
Vídeo


--------------------------------------------------
8. PRINCÍPIOS DA ARQUITETURA
--------------------------------------------------

A arquitetura do Vendeo segue os seguintes princípios:

simplicidade de implementação
modularidade
baixo acoplamento
facilidade de evolução


--------------------------------------------------
9. OBJETIVO DA ARQUITETURA
--------------------------------------------------

A arquitetura foi desenhada para permitir:

evolução rápida do produto
integração fácil com IA
manutenção simples
crescimento do sistema sem perda de estabilidade