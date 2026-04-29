# Mapa de Decisões do Produto Vendeo v1

Status: Ativo
Versão: 1.0

Este documento registra decisões estruturais do produto Vendeo.

Seu objetivo é evitar mudanças acidentais na lógica do sistema e preservar a visão original do produto.


--------------------------------------------------
1. PRINCÍPIO CENTRAL DO PRODUTO
--------------------------------------------------

O Vendeo é um motor de geração de campanhas para lojas físicas.

O sistema não é:

um editor gráfico
uma rede social
uma ferramenta de design

O Vendeo existe para gerar campanhas de marketing que ajudam lojas físicas a vender.


--------------------------------------------------
2. CAMPANHA COMO NÚCLEO DO PRODUTO
--------------------------------------------------

A entidade central do Vendeo é a campanha.

Toda funcionalidade gira em torno dela.

Campanhas podem gerar:

arte
vídeo
copy
legenda
CTA
hashtags

Planos semanais apenas organizam campanhas.


--------------------------------------------------
3. MODELO FREEMIUM
--------------------------------------------------

O plano gratuito permite:

criar campanhas
gerar conteúdos

O plano gratuito NÃO permite:

acesso aos planos semanais


Motivo:

os planos semanais fazem parte da estratégia premium do produto.


--------------------------------------------------
4. PLANOS SEMANAIS
--------------------------------------------------

Planos semanais são ferramentas de planejamento.

Eles organizam conteúdos em uma agenda de postagens.

Exemplo:

segunda → post
quarta → reels
sexta → post


Cada item do plano pode gerar uma campanha.


--------------------------------------------------
5. CAMPANHAS DERIVADAS DE PLANO
--------------------------------------------------

Quando uma campanha é criada a partir de um plano:

tipo de conteúdo é herdado
estratégia é herdada

Exemplo:

plano pede post → gerar arte

plano pede reels → gerar vídeo


Esses campos podem ser bloqueados no formulário.


--------------------------------------------------
6. ESTRATÉGIAS DE CAMPANHA
--------------------------------------------------

O Vendeo utiliza cinco estratégias principais.

OFERTA
COMBO
MOMENTO
DESTAQUE
PRESENTE

Essas categorias simplificam a leitura estratégica para o usuário.

Elas agrupam variações como:

promoção
kit
novidade
oportunidade


--------------------------------------------------
7. FORMULÁRIO DE CRIAÇÃO DE CAMPANHA
--------------------------------------------------

Campos principais:

Nome do conteúdo
Preço
Objetivo
Público
Detalhes
Imagem (opcional)


O campo mais importante é:

Nome do conteúdo


Ele define o contexto da campanha.


--------------------------------------------------
8. CLASSIFICAÇÃO AUTOMÁTICA
--------------------------------------------------

O sistema deve interpretar automaticamente o conteúdo digitado.

Exemplo:

"Coca Cola 2L"

tipo → produto

"Troca de óleo"

tipo → serviço

"Horário especial de domingo"

tipo → informativo


Essa classificação ajuda a IA.


--------------------------------------------------
9. IMAGEM DO PRODUTO
--------------------------------------------------

Imagem é opcional.

Fluxo:

Usuário envia imagem → usar imagem enviada.

Usuário não envia imagem → sistema resolve automaticamente.


Possibilidades:

buscar imagem em banco licenciado
gerar imagem com IA


--------------------------------------------------
10. COMBOS DE PRODUTOS
--------------------------------------------------

Quando múltiplos produtos são mencionados, o sistema trata como um único conteúdo.

Exemplo:

Coca Cola + Doritos


Isso é tratado como:

COMBO


A arte deve representar os dois produtos.


--------------------------------------------------
11. GERAÇÃO DE CONTEÚDO
--------------------------------------------------

Campanhas criadas manualmente geram:

arte
vídeo


Campanhas derivadas de plano podem gerar apenas:

arte

ou

vídeo


Isso evita gasto desnecessário de geração.


--------------------------------------------------
12. EDIÇÃO DA CAMPANHA
--------------------------------------------------

Conteúdos visuais são separados em abas.

Arte
Vídeo


Motivo:

o usuário raramente edita ambos ao mesmo tempo.


--------------------------------------------------
13. APROVAÇÃO DE CONTEÚDO
--------------------------------------------------

Cada conteúdo pode ser aprovado individualmente.

Arte ✓
Vídeo ✓


A campanha é considerada completa quando todos os conteúdos necessários foram aprovados.


--------------------------------------------------
14. EVOLUÇÃO FUTURA DA ARTE
--------------------------------------------------

No futuro, a arte poderá permitir:

variações de imagem
carrossel de opções
edição por camadas
movimentação de elementos


Essas funcionalidades devem respeitar a simplicidade do sistema.


--------------------------------------------------
15. PRINCÍPIO DE SIMPLICIDADE
--------------------------------------------------

O Vendeo deve sempre priorizar:

simplicidade
velocidade de criação
facilidade de uso


Toda nova funcionalidade deve respeitar esse princípio.