# Vendeo — Roadmap e Decisões Estratégicas

Este documento centraliza as decisões de produto, prioridades estratégicas e evolução planejada do Vendeo.

Ele serve como referência para evitar dispersão de escopo e manter o foco na entrega de valor real para lojistas.

---

# Visão do Produto

O Vendeo é um **motor de vendas social para lojas físicas**.

Seu objetivo é permitir que qualquer lojista transforme rapidamente produtos e ofertas em campanhas prontas para redes sociais.

Fluxo ideal do produto:

escolhi → gerou → postei → vendeu

O Vendeo não é:

• Canva  
• editor de imagem  
• agência de marketing  

O Vendeo é:

**um sistema que transforma produtos em campanhas que vendem.**

---

# Estratégia Atual (Core Value)

Status: foco no Plano Starter

A estratégia atual é resolver **80% do problema de marketing das lojas físicas** com a combinação mais eficaz hoje:

• posts (imagens estáticas) focados em conversão  
• vídeos curtos verticais (reels) focados em alcance

Decisão estratégica:

Em vez de construir muitos formatos complexos na V1, o foco é **aperfeiçoar o núcleo do produto**.

Criar campanhas:

• rápidas  
• reutilizáveis  
• fáceis de entender  
• fáceis de publicar

---

# Prioridade Atual de Produto

Status: Beta / Pré-lançamento controlado

O objetivo atual é garantir que o fluxo principal seja:

localizar rápido → reconhecer rápido → agir rápido

A experiência deve parecer natural para um lojista.

A tela de campanhas deve funcionar como uma **bússola visual de marketing**.

---

# Fase 1 — Beta (Implementar agora)

Status: aprovado para execução

## Página de campanhas — refinamento final

A lista de campanhas deve mostrar apenas o necessário para refrescar a memória do usuário.

### Estrutura do card de campanha

Cada card deve exibir:

• miniatura da arte  
• nome do produto  
• preço + público + objetivo  
• estratégia da campanha  
• data da campanha  
• status do conteúdo gerado  
• botões condicionais conforme conteúdo existente  

### Regras visuais

• não mostrar dados da loja na lista  
• não mostrar textos longos da campanha  
• thumb apresentada como peça pronta  
• separação visual entre thumb e conteúdo  
• hover lift permanece  

### Estratégias padronizadas

OFERTA  
COMBO  
MOMENTO  
DESTAQUE  
PRESENTE  

A UI traduz posicionamentos complexos para categorias simples.

### Botões condicionais

Arte apenas  
Ver arte • Editar  

Vídeo apenas  
Ver vídeo • Editar  

Arte + vídeo  
Ver arte • Ver vídeo • Editar  

Mostrar apenas o que existe.

---

## Edição de campanha

Campos editáveis:

• preço  
• público  
• objetivo  
• textos  
• CTA  

Regra oficial:

Arte não é editável  
Arte pode ser regenerada

---

## Duplicar campanha

Duplicar campanha permitirá:

• reaproveitar campanhas  
• ajustar preço  
• gerar nova arte ou vídeo

---

# Fase 2 — Pós-lançamento

Status: planejado

Melhorias previstas:

• menu de ações no card (⋯)  
• arquivar campanhas  
• filtros por estratégia  
• pequenos refinamentos de UX  

Arquivar campanhas é preferível à exclusão direta para preservar histórico.

---

# Fase 3 — Evolução Inteligente do Produto

Status: futuro

Recursos planejados:

• indicador de desempenho de campanhas  
• variações automáticas de campanha  
• sugestões estratégicas  
• analytics de campanhas  
• calendário estratégico

Esses recursos devem ser avaliados **após validação real de uso**.

---

# Inteligência Comercial da Campanha

Status: planejado

Uma evolução natural do Vendeo é tornar explícita a lógica estratégica por trás das campanhas.

A campanha deve mostrar não apenas **o conteúdo gerado**, mas também **por que aquela campanha tende a vender**.

Isso reforça o posicionamento do Vendeo como:

**motor de vendas social para lojas físicas.**

---

## Camada 1 — Leitura Comercial da Campanha

Adicionar um pequeno card informativo na página da campanha (`campaigns/[id]`).

Exemplo:

🧠 Leitura comercial da campanha

Objetivo da campanha  
aumentar ticket médio com compra em grupo

Gatilho principal  
ocasião + valor percebido

Momento ideal  
noite ou final de semana

Leitura do Vendeo  
boa campanha para encontros familiares.

A primeira versão pode usar **templates simples** baseados nos dados já existentes:

• objective  
• audience  
• price  
• product_positioning  

Sem necessidade de IA adicional.

---

## Camada 2 — Ajustes sugeridos pelo Vendeo

Adicionar recomendações simples para melhorar a campanha.

Exemplo:

💡 Ajuste sugerido pelo Vendeo

• tornar o preço mais visível na headline  
• adicionar urgência (tempo limitado ou estoque)  
• destacar benefício principal do produto

Objetivo:

transformar o Vendeo em um **assistente comercial**, não apenas um gerador de posts.

---

## Camada 3 — Diagnóstico Comercial da Campanha

Transformar o card em um diagnóstico estratégico.

Exemplo:

📈 Diagnóstico comercial

Objetivo real da campanha  
gerar resposta rápida por preço

Tipo de decisão provocada  
compra por oportunidade

Impacto esperado  
aumento de giro de produto

Momento ideal  
início da noite ou sexta-feira

Essa camada pode futuramente usar IA contextual combinando:

• dados da campanha  
• dados da loja  
• comportamento do varejo local  

---

# Estrutura futura de planos

Starter

• gerar campanha  
• editar campanha  
• duplicar campanha  

Pro

• filtros estratégicos  
• sugestões automáticas  
• campanhas sazonais  

Premium

• analytics  
• desempenho de campanhas  
• variações automáticas  

---

# Decisão de UX da tela de campanhas

A tela de campanhas é uma tela de:

• reconhecimento rápido  
• memória rápida  
• navegação rápida  

Detalhes completos ficam nas telas:

• editar campanha  
• ver arte  
• ver vídeo  

---

# Escalabilidade técnica

Direções futuras:

• compressão e redimensionamento automático de imagens  
• limpeza de arquivos órfãos  
• otimização CDN  

Também considerar futuramente preservar **mídia original do produto** para regenerações e variações.

---

# Princípios de Produto

O Vendeo deve sempre parecer:

• simples  
• rápido  
• prático  
• confiável  

Evitar:

• excesso de configuração  
• excesso de opções  
• complexidade desnecessária

---

# Resumo Executivo

O foco atual do Vendeo é:

• refinar UX  
• lançar beta  
• observar usuários  
• evoluir com base em uso real  

A tela de campanhas deve ser:

simples  
rápida  
visual  
estratégica  

sem excesso de informação.