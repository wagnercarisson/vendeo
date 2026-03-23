# Mapa do Sistema Vendeo v1

Status: Ativo
Versão: 1.0

Este documento apresenta a visão estrutural completa do sistema Vendeo.

Ele descreve como as camadas do sistema se organizam e como elas se conectam.


--------------------------------------------------
1. VISÃO GERAL DO SISTEMA
--------------------------------------------------

O Vendeo é composto por múltiplas camadas que trabalham juntas para transformar produtos em campanhas de marketing.

Estrutura geral:

Usuário
 ↓
Interface (Frontend)
 ↓
Fluxo de Produto
 ↓
Campaign Engine
 ↓
AI Engine
 ↓
Banco de Dados
 ↓
Infraestrutura


--------------------------------------------------
2. CAMADA DE PRODUTO
--------------------------------------------------

Essa camada representa a lógica do produto.

Ela define como o usuário interage com o sistema.

Componentes principais:

Dashboard
Criação de campanha
Edição de campanha
Lista de campanhas
Planos semanais


Responsabilidade:

organizar o fluxo de uso do produto.


--------------------------------------------------
3. CAMADA DE UX
--------------------------------------------------

Essa camada define como a experiência do usuário funciona.

Responsabilidades:

interfaces simples
decisões guiadas
redução de carga cognitiva
ações claras


Exemplos:

uso de abas
botões consistentes
indicadores de progresso


--------------------------------------------------
4. CAMPAIGN ENGINE
--------------------------------------------------

O Campaign Engine é o núcleo do sistema.

Ele representa a entidade campanha.

Responsabilidades:

armazenar dados da campanha
gerenciar geração de conteúdo
controlar estado da campanha


Estrutura:

campaign
 ↓
conteúdo gerado


--------------------------------------------------
5. AI ENGINE
--------------------------------------------------

O AI Engine é responsável pela geração de conteúdo.

Funções:

gerar copy
gerar legenda
gerar hashtags
gerar roteiro de vídeo
gerar estrutura de arte


Entrada:

dados da campanha
contexto da loja
estratégia
público


Saída:

conteúdo de marketing


--------------------------------------------------
6. API LAYER
--------------------------------------------------

A camada de API conecta o frontend ao motor de geração.

Principais rotas:

/api/generate/campaign
/api/generate/reels
/api/generate/weekly-plan


Responsabilidades:

receber requisições
validar dados
normalizar informações
executar geração
salvar resultados


--------------------------------------------------
7. CAMADA DE DADOS
--------------------------------------------------

O sistema utiliza Supabase (PostgreSQL).

Principais tabelas:

stores
campaigns
weekly_plans
weekly_plan_items
generation_feedback


Responsabilidade:

persistência de dados.


--------------------------------------------------
8. INFRAESTRUTURA
--------------------------------------------------

O sistema é hospedado em infraestrutura moderna.

Componentes:

Next.js
Vercel
Supabase
OpenAI


Responsabilidades:

execução do sistema
armazenamento
integração com IA


--------------------------------------------------
9. FLUXO COMPLETO DO SISTEMA
--------------------------------------------------

Fluxo principal:

Usuário cria campanha
 ↓
Frontend envia dados
 ↓
API recebe requisição
 ↓
Campaign Engine organiza dados
 ↓
AI Engine gera conteúdo
 ↓
Resultado salvo no banco
 ↓
Frontend exibe campanha


--------------------------------------------------
10. PRINCÍPIO DA ARQUITETURA
--------------------------------------------------

A arquitetura do Vendeo segue três princípios fundamentais.

Simplicidade

O sistema deve ser fácil de manter.


Modularidade

Cada camada possui responsabilidades claras.


Escalabilidade

O sistema deve permitir crescimento sem perda de estabilidade.