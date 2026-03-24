# Fluxo Definitivo de Criação de Campanha - Vendeo v1

Status: Ativo
Versão: 1.0

Este documento descreve o fluxo completo de criação de campanha no Vendeo.

Ele integra decisões de produto, UX, arquitetura e geração de conteúdo.


--------------------------------------------------
1. OBJETIVO DO FLUXO
--------------------------------------------------

O fluxo de criação de campanha foi projetado para ser:

rápido
simples
assistido pela IA
focado em vendas

O usuário deve conseguir criar uma campanha em poucos passos.


--------------------------------------------------
2. INÍCIO DO FLUXO
--------------------------------------------------

O fluxo começa na dashboard.

Ação principal:

Criar campanha


Usuário acessa:

/campaigns/new


--------------------------------------------------
3. FORMULÁRIO DE CRIAÇÃO
--------------------------------------------------

Campos do formulário:

Nome do conteúdo
Preço
Objetivo
Público
Detalhes
Imagem (opcional)


Campo principal:

Nome do conteúdo


Esse campo define o contexto da campanha.


--------------------------------------------------
4. INTERPRETAÇÃO DO CONTEÚDO
--------------------------------------------------

Após receber os dados, o sistema executa interpretação automática.

Processos:

detectar tipo de conteúdo

produto
serviço
informativo


detectar marca

exemplo:

coca cola


detectar categoria

exemplo:

bebida


--------------------------------------------------
5. CLASSIFICAÇÃO DA ESTRATÉGIA
--------------------------------------------------

O sistema organiza a estratégia em categorias simplificadas.

OFERTA

COMBO

MOMENTO

DESTAQUE

PRESENTE


Essas categorias ajudam o usuário a compreender rapidamente a estratégia da campanha.


--------------------------------------------------
6. RESOLUÇÃO DE IMAGEM
--------------------------------------------------

O sistema determina qual imagem será utilizada.

Fluxo:

imagem enviada pelo usuário

usar imagem enviada


imagem não enviada

buscar imagem em banco licenciado


imagem não encontrada

gerar imagem com IA


--------------------------------------------------
7. GERAÇÃO DE CONTEÚDO
--------------------------------------------------

Após normalização, o sistema envia os dados para o motor de geração.

Conteúdos gerados:

arte
vídeo
copy
legenda
CTA
hashtags


Campanhas criadas manualmente geram:

arte
vídeo


Campanhas derivadas de plano podem gerar apenas:

arte

ou

vídeo


--------------------------------------------------
8. VISUALIZAÇÃO DA CAMPANHA
--------------------------------------------------

Após geração, o usuário acessa a página da campanha.

Conteúdos são organizados em abas.

Arte

Vídeo


Isso reduz a carga cognitiva.


--------------------------------------------------
9. EDIÇÃO DE CONTEÚDO
--------------------------------------------------

O usuário pode realizar ações em cada aba.

editar texto

regenerar conteúdo

aprovar conteúdo


A edição deve ser simples e rápida.


--------------------------------------------------
10. APROVAÇÃO DE CONTEÚDO
--------------------------------------------------

Cada conteúdo pode ser aprovado separadamente.

Arte ✓

Vídeo ✓


A campanha é considerada completa quando todos os conteúdos necessários forem aprovados.


--------------------------------------------------
11. CAMPANHA FINALIZADA
--------------------------------------------------

Após aprovação, a campanha pode ser:

visualizada

copiada

baixada

duplicada


Essas ações ajudam o usuário a utilizar o conteúdo nas redes sociais.


--------------------------------------------------
12. PRINCÍPIO DO FLUXO
--------------------------------------------------

O fluxo de criação de campanha deve sempre priorizar:

simplicidade

velocidade de criação

facilidade de edição

conteúdo focado em vendas


Toda evolução futura do produto deve respeitar esse fluxo.