# Contrato de Dados entre Backend e IA - Vendeo v1

Status: Ativo
Versão: 1.0

Este documento define o formato de dados utilizado na comunicação entre o backend do Vendeo e os modelos de IA responsáveis pela geração de conteúdo.

Esse contrato existe para garantir previsibilidade, estabilidade e consistência nas respostas da IA.


--------------------------------------------------
1. OBJETIVO DO CONTRATO
--------------------------------------------------

O contrato de dados define:

- quais dados são enviados para IA
- como esses dados são estruturados
- qual formato a resposta da IA deve seguir
- como o backend valida e processa a resposta

Esse documento evita problemas comuns em sistemas com IA, como:

respostas imprevisíveis
mudança de formato
JSON inválido
dados faltantes


--------------------------------------------------
2. OBJETO DE CONTEXTO DA CAMPANHA
--------------------------------------------------

Antes de chamar a IA, o backend constrói um objeto estruturado com os dados da campanha.

Exemplo:

product_name: Coca Cola 2L
price: 8.99
objective: promocao
strategy_group: OFERTA
audience: jovens_festa
product_positioning: popular
details: gelada
brand_detected: coca cola
image_source: generated


Esse objeto é utilizado para montar os prompts enviados à IA.


--------------------------------------------------
3. DADOS ENVIADOS PARA IA
--------------------------------------------------

Os dados enviados à IA podem incluir:

product_name
price
objective
strategy_group
audience
product_positioning
details
store_context

store_context pode incluir:

store_name
city
state
main_segment
tone_of_voice


Essas informações ajudam a IA a gerar conteúdo mais relevante.


--------------------------------------------------
4. RESPOSTA ESPERADA PARA CAMPANHA
--------------------------------------------------

A IA deve retornar um JSON estruturado com os seguintes campos.

ai_caption

ai_text

ai_cta

ai_hashtags


Exemplo:

ai_caption: Promoção imperdível de Coca Cola 2L gelada para animar sua festa!

ai_text: Aproveite agora Coca Cola 2L gelada por apenas R$ 8,99. Ideal para festas, churrascos e encontros com amigos.

ai_cta: Garanta já a sua!

ai_hashtags:
- #promocao
- #cocacola
- #oferta
- #bebidas
- #churrasco


--------------------------------------------------
5. RESPOSTA ESPERADA PARA REELS
--------------------------------------------------

A geração de vídeo retorna dados adicionais.

Campos:

reels_hook
reels_script
reels_caption
reels_cta
reels_hashtags
reels_shotlist
reels_on_screen_text
reels_audio_suggestion
reels_duration_seconds


Exemplo de resposta simplificada:

reels_hook: Já pensou em deixar seu churrasco ainda melhor?

reels_script:
Cena 1: mostrar Coca Cola gelada
Cena 2: abrir a garrafa
Cena 3: servir no copo

reels_cta: Passe aqui e aproveite a promoção.

reels_duration_seconds: 15


--------------------------------------------------
6. VALIDAÇÃO DA RESPOSTA
--------------------------------------------------

Após receber a resposta da IA, o backend executa validações.

Validações necessárias:

estrutura JSON válida
campos obrigatórios presentes
tamanho mínimo de conteúdo


Se a resposta não atender aos critérios:

executar retry automático
ou aplicar fallback


--------------------------------------------------
7. TRATAMENTO DE RETRY
--------------------------------------------------

Caso a IA retorne resposta inválida, o backend pode executar nova tentativa.

Fluxo:

IA retorna erro
 ↓
backend detecta resposta inválida
 ↓
executar nova chamada
 ↓
processar nova resposta


Número recomendado de tentativas:

até 2 retries


--------------------------------------------------
8. FALLBACK DE CONTEÚDO
--------------------------------------------------

Se a geração falhar após retries, o sistema pode gerar conteúdo básico.

Exemplo:

copy simples baseada no produto
CTA padrão
hashtags genéricas


Isso evita que o sistema fique sem resposta.


--------------------------------------------------
9. PRINCÍPIOS DO CONTRATO
--------------------------------------------------

O contrato entre backend e IA deve respeitar:

estrutura consistente
respostas previsíveis
JSON válido
campos obrigatórios definidos


Toda alteração nesse contrato deve ser versionada.


--------------------------------------------------
10. EVOLUÇÃO DO CONTRATO
--------------------------------------------------

Quando novos campos forem adicionados:

atualizar este documento
versionar mudança
garantir compatibilidade com código existente


Esse processo garante estabilidade do sistema ao longo do tempo.