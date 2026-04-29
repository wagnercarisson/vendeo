# Fluxo Oficial do Vendeo v1

Status: Ativo  
Versão: 1.0  
Documento base de fluxo do produto Vendeo.

Este documento define o fluxo lógico oficial do Vendeo e serve como referência para desenvolvimento, UX e evolução do produto.

Objetivo central do Vendeo:

Transformar rapidamente um produto ou serviço em conteúdo de marketing pronto para postar e gerar vendas.

Fluxo conceitual do produto:

Escolher conteúdo  
↓  
Gerar campanha  
↓  
Editar / regenerar  
↓  
Aprovar  
↓  
Postar

---

# 1. Tipos de criação de campanha

Existem dois contextos de criação de campanha no sistema.

## 1.1 Criação manual

O usuário cria uma campanha diretamente.

Fluxo:

Dashboard  
↓  
Nova campanha  
↓  
Preencher dados  
↓  
Gerar campanha  
↓  
Arte + Vídeo

Regra do sistema:

generateImage = true  
generateVideo = true

Ou seja, campanhas criadas manualmente sempre geram:

Arte  
+  
Vídeo

Essa regra reduz decisões para o usuário e simplifica o fluxo.

---

## 1.2 Criação a partir de plano semanal

Quando uma campanha nasce a partir de um plano semanal, ela herda definições do plano.

Exemplo:

Plano define:

segunda → post  
quarta → reels

Resultado:

post → gera arte  
reels → gera vídeo

Regra do sistema:

post → generateImage = true  
reels → generateVideo = true

Campos herdados do plano:

tipo de conteúdo  
estratégia  
tema

Campos herdados ficam bloqueados para edição.

Campos editáveis:

nome do conteúdo  
preço  
público  
detalhes  
imagem

---

# 2. Estrutura da tela "Nova campanha"

Campos mínimos do formulário:

Nome do conteúdo *  
Preço  
Objetivo *  
Público  
Detalhes (opcional)  
Imagem (opcional)

---

## 2.1 Nome do conteúdo

Campo principal da campanha.

Exemplos:

Coca Cola 2L  
Heineken 600ml  
Troca de óleo  
Combo churrasco

A partir dele o sistema pode detectar:

tipo de conteúdo  
marca  
categoria

---

## 2.2 Preço

Habilitação automática baseada no tipo detectado.

produto → habilitado  
serviço → habilitado  
informativo → desabilitado

---

## 2.3 Objetivo

Selecionado a partir de constantes do sistema.

Exemplos:

promoção  
novidade  
combo  
sazonal  
engajamento  
visitas

O objetivo influencia diretamente:

copy  
CTA  
roteiro do vídeo

---

## 2.4 Público

Selecionado a partir de constantes.

Exemplos:

geral  
jovens_festa  
família  
fitness  
premium  
b2b

---

## 2.5 Detalhes

Campo opcional usado para enriquecer o conteúdo.

Exemplos:

gelada  
entrega grátis  
leve 3 pague 2  
últimas unidades

---

## 2.6 Imagem

Campo opcional.

Regras do sistema:

imagem enviada → usar imagem do usuário  
sem imagem → sistema resolve automaticamente

---

# 3. Resolução automática de imagens

Quando o usuário não fornece imagem, o sistema tenta resolver automaticamente.

Pipeline de resolução:

1 — imagem enviada pelo usuário  
2 — busca em banco de imagens licenciado  
3 — geração de imagem por IA

Esse processo garante que sempre exista material visual para gerar a arte.

---

# 4. Combos e kits

Conteúdos compostos são tratados como um único produto.

Exemplos:

Coca + Doritos  
Kit festa  
Combo churrasco

O sistema permite múltiplas imagens.

Regras:

0 imagens → IA gera arte completa  
1 imagem → produto principal  
2 ou mais imagens → composição de combo

---

# 5. Detecção de marca

A partir do nome do conteúdo o sistema pode detectar se existe marca específica.

Exemplos:

Coca Cola 2L → marca detectada  
Heineken 600ml → marca detectada

Caso o produto seja genérico:

Refrigerante cola 2L

O sistema pode solicitar validação ao usuário.

Exemplo:

Produto genérico detectado.  
Deseja anunciar uma marca específica?

Caso o usuário confirme produto genérico, a arte será gerada sem marca registrada.

---

# 6. Geração de conteúdo

Após clicar em "Gerar campanha", o sistema cria:

Arte  
Vídeo (reels)  
Copy  
Legenda  
CTA  
Hashtags

Dependendo do contexto da campanha.

---

# 7. Estrutura de edição da campanha

Após geração, a campanha entra em modo de edição.

Fluxo:

Gerar campanha  
↓  
Editar  
↓  
Regenerar  
↓  
Aprovar  
↓  
Salvar

---

# 8. Separação por abas

Conteúdo visual é separado em abas:

Arte  
Vídeo

Motivo:

Usuários normalmente trabalham em um formato por vez.

Isso reduz complexidade cognitiva.

---

# 9. Indicadores de progresso

Para evitar que o usuário esqueça de revisar um formato, o sistema mostra status.

Exemplo:

Arte ✓  
Vídeo •  

Ou:

Arte — aprovado  
Vídeo — pendente

Também pode existir um indicador geral:

1 de 2 conteúdos aprovados

---

# 10. Carrossel de variações de arte

Ao gerar a arte, o sistema pode apresentar múltiplas opções.

Exemplo:

Arte 1  
Arte 2  
Arte 3  
Arte 4

Usuário escolhe a melhor opção.

Isso melhora:

controle  
confiança  
qualidade percebida

---

# 11. Estrutura da arte gerada

A arte possui camadas internas.

background  
produto  
headline  
preço  
CTA  
elementos gráficos

Em versões futuras do produto, o usuário poderá editar essas camadas.

---

# 12. Estratégia da campanha

Internamente a estratégia é derivada do objetivo.

Para simplificação da interface, o sistema agrupa estratégias em cinco categorias.

OFERTA  
COMBO  
MOMENTO  
DESTAQUE  
PRESENTE

Exemplo de agrupamento:

promoção → OFERTA  
queima → OFERTA  

combo → COMBO  

novidade → DESTAQUE  
reposicao → DESTAQUE  

sazonal → MOMENTO  
visitas → MOMENTO

Essas categorias são exibidas na interface para facilitar a leitura do usuário.

---

# 13. Estados da campanha

Uma campanha pode possuir os seguintes estados.

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

---

# 14. Princípios do produto

O Vendeo deve sempre priorizar:

simplicidade  
velocidade  
clareza  
resultado comercial

Qualquer nova feature deve respeitar esses princípios.