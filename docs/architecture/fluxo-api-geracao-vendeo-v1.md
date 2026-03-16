# Fluxo das APIs de Geração do Vendeo v1

Status: Ativo
Versão: 1.0

Este documento descreve o funcionamento das APIs responsáveis pela geração de conteúdo no Vendeo.

Essas APIs conectam o frontend ao motor de geração de conteúdo utilizando IA.


--------------------------------------------------
1. VISÃO GERAL
--------------------------------------------------

O Vendeo utiliza rotas API internas do Next.js para gerar conteúdo.

Essas rotas recebem dados do frontend, processam informações da campanha e executam geração com IA.

Principais rotas:

/api/generate/campaign
/api/generate/reels
/api/generate/weekly-plan


Cada rota possui responsabilidades específicas.


--------------------------------------------------
2. API DE GERAÇÃO DE CAMPANHA
--------------------------------------------------

Rota:

/api/generate/campaign

Responsável por gerar o conteúdo principal da campanha.

Conteúdo gerado:

copy
legenda
CTA
hashtags
estrutura da arte


Fluxo da requisição:

Frontend envia dados da campanha
 ↓
API recebe requisição
 ↓
Validar dados obrigatórios
 ↓
Normalizar dados
 ↓
Construir contexto da campanha
 ↓
Executar geração com IA
 ↓
Processar resposta
 ↓
Salvar resultado no banco
 ↓
Retornar dados para o frontend


--------------------------------------------------
3. API DE GERAÇÃO DE REELS
--------------------------------------------------

Rota:

/api/generate/reels

Responsável por gerar o roteiro do vídeo da campanha.

Conteúdo gerado:

hook inicial
roteiro estruturado
texto na tela
sugestão de áudio
legenda do vídeo
hashtags


Fluxo da requisição:

Frontend solicita geração de vídeo
 ↓
API recebe campanha existente
 ↓
Carregar dados da campanha
 ↓
Construir prompt específico para vídeo
 ↓
Executar geração com IA
 ↓
Salvar roteiro gerado
 ↓
Retornar dados ao frontend


--------------------------------------------------
4. API DE GERAÇÃO DE PLANO SEMANAL
--------------------------------------------------

Rota:

/api/generate/weekly-plan

Responsável por criar um plano estratégico de conteúdo.

Conteúdo gerado:

agenda semanal
tipos de conteúdo
estratégia de cada postagem


Fluxo da requisição:

Frontend solicita geração de plano
 ↓
API recebe dados da loja
 ↓
Construir contexto estratégico
 ↓
Executar geração com IA
 ↓
Criar plano semanal
 ↓
Salvar plano no banco
 ↓
Retornar plano ao frontend


--------------------------------------------------
5. NORMALIZAÇÃO DE DADOS
--------------------------------------------------

Antes de enviar dados para IA, as APIs executam uma etapa de normalização.

Objetivos:

reduzir ambiguidade
garantir consistência
padronizar prompts

Processos:

normalizar objetivo
detectar marca
detectar categoria
resolver imagem


--------------------------------------------------
6. TRATAMENTO DE ERROS
--------------------------------------------------

As APIs devem sempre tratar falhas de geração.

Possíveis erros:

falha de resposta da IA
JSON inválido
timeout de requisição
erro de banco


Estratégias de proteção:

retry automático
fallback de geração
validação de estrutura de resposta


--------------------------------------------------
7. IDEMPOTÊNCIA
--------------------------------------------------

As APIs devem evitar gerar conteúdo duplicado.

Regra:

se conteúdo já existir
não gerar novamente

Exemplo:

se arte já foi gerada
não gerar arte novamente


--------------------------------------------------
8. MODO AUTOMÁTICO
--------------------------------------------------

O sistema pode executar geração automática apenas para conteúdos ausentes.

Exemplo:

arte existe
vídeo não existe

Resultado:

gerar apenas vídeo


--------------------------------------------------
9. RESPOSTA DAS APIs
--------------------------------------------------

Todas as APIs retornam dados estruturados.

Exemplo de resposta:

campaign_id
ai_caption
ai_text
ai_cta
ai_hashtags
reels_script
reels_caption


Esses dados são enviados para o frontend atualizar a interface.


--------------------------------------------------
10. PRINCÍPIOS DAS APIs
--------------------------------------------------

As APIs de geração seguem princípios fundamentais:

previsibilidade
respostas estruturadas
resiliência a erros
consistência de dados


Esses princípios garantem estabilidade do sistema mesmo com evolução do produto.