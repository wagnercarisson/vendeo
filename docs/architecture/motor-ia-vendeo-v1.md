# Motor de IA do Vendeo v1

Status: Ativo
Versão: 1.0

Este documento descreve a arquitetura conceitual do motor de geração de conteúdo do Vendeo.

O motor de IA é responsável por transformar os dados de uma campanha em conteúdo de marketing completo.

Conteúdos gerados:

- Arte
- Vídeo (reels)
- Copy
- Legenda
- CTA
- Hashtags
- Estrutura visual da arte
- Roteiro do vídeo


--------------------------------------------------
1. ENTRADA DO SISTEMA
--------------------------------------------------

A geração começa com os dados fornecidos pelo usuário no formulário de campanha.

Campos de entrada:

Nome do conteúdo
Preço
Objetivo
Público
Detalhes
Imagem (opcional)

Exemplo de entrada:

Nome: Coca Cola 2L
Preço: 8,99
Objetivo: promocao
Público: jovens_festa
Detalhes: gelada
Imagem: não fornecida


--------------------------------------------------
2. NORMALIZAÇÃO DE DADOS
--------------------------------------------------

Antes de enviar dados para IA, o sistema executa uma etapa de normalização.

Objetivo:

- reduzir ambiguidade
- padronizar prompts
- garantir consistência

Processos executados:

detectar tipo de conteúdo
produto | serviço | informativo

detectar marca
ex: coca cola

detectar categoria
ex: bebida

normalizar objetivo

exemplo:

promoção → OFERTA
combo → COMBO
novidade → DESTAQUE


--------------------------------------------------
3. RESOLUÇÃO DE IMAGEM
--------------------------------------------------

O sistema resolve qual imagem será utilizada na arte.

Fluxo:

1) usuário enviou imagem

→ usar imagem do usuário

2) usuário não enviou imagem

→ tentar buscar imagem em banco licenciado

3) não encontrou imagem

→ gerar imagem usando IA


Regras adicionais:

0 imagens → IA cria arte completa

1 imagem → produto principal

2 ou mais imagens → composição de combo


--------------------------------------------------
4. CONSTRUÇÃO DO CONTEXTO DA CAMPANHA
--------------------------------------------------

Após normalização, o sistema monta o contexto final enviado ao motor de geração.

Exemplo de objeto estruturado:

product_name: Coca Cola 2L
price: 8.99
objective: promocao
strategy_group: OFERTA
audience: jovens_festa
details: gelada
brand_detected: coca cola
image_source: generated


Esse objeto passa a ser a base de todos os prompts.


--------------------------------------------------
5. PROMPT ENGINE
--------------------------------------------------

O motor de prompts cria instruções específicas para cada tipo de conteúdo.

Tipos de geração:

1) geração da arte
2) geração do roteiro do vídeo
3) geração da copy
4) geração da legenda
5) geração de hashtags


Cada prompt recebe:

produto
preço
estratégia
público
detalhes
contexto da loja


--------------------------------------------------
6. GERAÇÃO DA ARTE
--------------------------------------------------

A IA gera a estrutura visual da arte.

Componentes:

background
produto
headline
preço
CTA
elementos gráficos

O sistema pode gerar múltiplas variações.

Exemplo:

Arte 1
Arte 2
Arte 3
Arte 4

O usuário escolhe a melhor opção.


--------------------------------------------------
7. GERAÇÃO DO VÍDEO
--------------------------------------------------

O motor gera roteiro estruturado para reels.

Estrutura:

hook inicial
cena 1
cena 2
cena 3
call to action
legenda do vídeo
hashtags


--------------------------------------------------
8. RESULTADO FINAL
--------------------------------------------------

Após a geração, o sistema produz:

Arte
Vídeo
Legenda
Copy
CTA
Hashtags


Esses conteúdos são enviados para a etapa de edição da campanha.


--------------------------------------------------
9. EDIÇÃO E REGENERAÇÃO
--------------------------------------------------

Após a geração, o usuário pode:

editar texto
regenerar arte
regenerar vídeo
aprovar conteúdo

Conteúdo visual é separado em abas:

Arte
Vídeo

Isso reduz carga cognitiva para o usuário.


--------------------------------------------------
10. APROVAÇÃO DA CAMPANHA
--------------------------------------------------

A campanha é considerada completa quando todos os conteúdos necessários foram aprovados.

Exemplo:

Arte ✓
Vídeo ✓

ou

1 de 2 conteúdos aprovados


--------------------------------------------------
11. PRINCÍPIOS DO MOTOR DE IA
--------------------------------------------------

O motor de IA do Vendeo deve sempre priorizar:

simplicidade de entrada
consistência de geração
rapidez de resposta
conteúdo focado em vendas

Toda evolução futura do sistema deve respeitar esses princípios.