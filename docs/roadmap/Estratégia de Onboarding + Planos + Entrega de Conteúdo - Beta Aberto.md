# Vendeo | Produto | Estratégia de Onboarding + Planos + Entrega de Conteúdo | Beta Aberto

> **Versão:** 2.0 — Revisado após sessão de product strategy (Abr/2026)

---

## 🎯 Objetivo

Definir de forma clara e unificada:

* Transição do beta fechado → beta aberto
* Estrutura de planos (Free / Básico / Pro)
* Experiência do usuário (onboarding e geração)
* Regras de entrega das artes (preview, free, pago)
* Posicionamento estratégico de cada plano

Este documento orienta **produto, UX e engenharia**.

---

# 🧪 1. Estratégia de Beta

## 1.1 Situação atual

* Beta fechado validado com feedback de alta qualidade
* Fluxos principais funcionando
* Produto pronto para validação de monetização
* Motor de arte em refatoração — o beta aberto só abre após qualidade visual aprovada

---

## 1.2 Próxima fase: Beta Aberto

Objetivo:

* Validar disposição de pagamento
* Validar percepção de valor
* Validar comportamento real de uso

> ⚠️ **Pré-requisito obrigatório:** a qualidade visual das artes geradas precisa estar resolvida antes da abertura. Abrir o beta com artes inconsistentes valida as limitações técnicas, não o modelo de negócio.

---

## 1.3 Estrutura de acesso

### 👑 Beta fechado (early users)

* Acesso completo (todas funcionalidades liberadas)
* Papel: feedback profundo + validação de produto
* Mantidos com acesso full como reconhecimento pela contribuição

---

### 🌱 Beta aberto (novos usuários)

* Acesso com planos (Free / Básico / Pro)
* Papel: validação de conversão e disposição de pagamento

---

## 1.4 Regra estratégica

> O beta aberto não testa apenas uso — testa **pagamento**

---

## 1.5 Métricas do Beta Aberto

### Ativação:
* % usuários que geram 1ª campanha
* % que geram 2ª campanha
* % que clicam em "Adicionar minha loja"
* % que chegam na tela de planos

### Monetização:
* % de conversão para pago (Free → Básico / Free → Pro)
* % de conversão de upgrade (Básico → Pro)

### Retenção:
* Retention D7 e D30 por plano
* Time to Convert (dias entre cadastro e 1º pagamento)
* Churn no 1º mês por plano

> Sem dados de retenção, saímos do beta sabendo *que* as pessoas pagaram mas não *por que* continuaram ou saíram.

---

# 💰 2. Filosofia de Diferenciação entre Planos

## 2.1 Princípio central

> **Limitar por volume, não por qualidade.**

O erro clássico de freemium é entregar uma versão pior do produto para forçar upgrade. Aqui, a aposta é diferente: **entregamos o produto real** e criamos pressão pela frequência de uso e pela inteligência de planejamento.

Referência: o Spotify Free toca a mesma música. O Premium remove a interrupção e dá controle. A música nunca foi pior.

---

## 2.2 Eixo de diferenciação por plano

| | Free | Básico | Pro |
|---|---|---|---|
| **Verbo** | Cria | Executa | Melhora |
| **Promessa** | Arte pronta | Semana planejada | Você vende mais |
| **Identidade** | Estática (automática) | Operacional (consistente) | Inteligente (adaptativa) |
| **Limite** | 5 artes/mês | Ilimitado | Ilimitado |
| **IA** | Gera copy e arte | Planeja sequência | Adapta por aprendizado |
| **Plano semanal** | ❌ | ✅ | ✅ (com justificativas) |
| **Analytics** | ❌ | ❌ | ✅ (fase 1: heurística / fase 2: Meta) |

---

## 2.3 Frase que define cada plano

> **Free cria.**
> **Básico executa.**
> **Pro melhora.**

---

# 🟢 3. FREE — "Testei"

## 3.1 Proposta

Entregar o produto completo — arte pronta, com identidade, com IA — mas limitado em volume mensal.

> Não é um produto capado. É o produto real com frequência restrita.

---

## 3.2 O que entrega

* ✅ Arte visualmente completa (qualidade igual aos planos pagos)
* ✅ IA para geração de copy — baseada em produto, estratégia e região
* ✅ Identidade da loja aplicada automaticamente (nome, cor, posicionamento)
* ✅ Padronização visual consistente entre as artes geradas
* ✅ Legenda e CTA gerados

---

## 3.3 O que não entrega

* ❌ Plano semanal de conteúdo
* ❌ Direção estratégica de campanhas
* ❌ Sequência lógica entre posts
* ❌ Analytics de performance
* ❌ Personalização manual pelo usuário

---

## 3.4 Limite de geração

**5 artes por mês.**

> **Regra data-driven:** esse número é um ponto de partida, não uma verdade absoluta.
> * Se a média de uso do beta fechado for < 5 → limite tem pouca pressão → reduzir
> * Se a média for 5–8 → limite ideal → manter
> * Se a média for > 10 → limite forte → avaliar reduzir para 3
>
> Medir no 1º mês do beta aberto e ajustar sem medo.

---

## 3.5 Por que entregar padronização no Free?

A padronização **não é um benefício a esconder** — é o gatilho de conversão mais poderoso do produto.

Sem padronização no Free: o usuário gera 5 artes que parecem de marcas diferentes → sensação de que "não funciona" → abandona.

Com padronização no Free: o usuário gera 5 artes consistentes e profissionais → percebe que está funcionando → na 5ª bate o limite → **quer mais**.

> A padronização prova o valor. O limite cria a pressão. Juntos, eles convertem.

---

## 3.6 Sensação esperada

> *"Isso ficou muito bom e já tem minha cara… só preciso de mais."*

---

# 🟡 4. BÁSICO — "Uso"

## 4.1 Proposta

Eliminar completamente o esforço de planejamento. O sistema pensa, organiza e direciona. O lojista só executa.

> A virada do Básico não é "mais artes" — é **"o sistema pensa por mim"**.

---

## 4.2 O que entrega

* ✅ Tudo do Free (sem limite de volume)
* ✅ **Plano semanal de conteúdo** (CORE do plano)
* ✅ Direção de conteúdo: o que postar, quando postar e por que postar
* ✅ Sequência lógica de campanhas (sem repetição aleatória)
* ✅ Narrativa mínima entre posts da semana

---

## 4.3 O que não entrega

* ❌ Analytics de performance
* ❌ Adaptação baseada em resultado
* ❌ Diagnóstico de mercado por segmento
* ❌ Personalização manual pelo usuário (mantém o posicionamento "não é editor")

---

## 4.4 Formato do plano semanal

O plano semanal não é uma lista de tarefas. É uma **fila automática** de campanhas já geradas, com sequência intencional:

Exemplo:
* Segunda → post institucional (baixo movimento comercial)
* Quarta → destaque de produto (meio de semana)
* Sexta → promoção ou urgência (pico de engajamento)

> O lojista não edita o plano. Ele aprova ou regenera. Isso mantém o posicionamento de automação.

---

## 4.5 Diferença central Free → Básico

| Free | Básico |
|---|---|
| "aqui está sua arte" | "aqui está sua semana" |
| O usuário decide quando postar | O sistema organiza quando postar |
| Posts isolados | Sequência com intenção |

---

## 4.6 Sensação esperada

> *"Não preciso pensar. Só postar."*

---

# 🔵 5. PRO — "Cresço"

## 5.1 Proposta

Inteligência de marketing + aprendizado contínuo. O Pro não só executa — ele entende o negócio do lojista e melhora os resultados ao longo do tempo.

> **O Pro não espera dados para ser inteligente. Ele começa inteligente e fica mais inteligente.**

---

## 5.2 Entrega imediata — Pro Day 1

O Pro precisa entregar valor **no primeiro dia**, antes de acumular qualquer dado do usuário.

### 🧬 Setup guiado de marca (obrigatório)

O usuário responde um questionário curto e guiado:
* Posicionamento da loja
* Público principal
* Estilo visual desejado (moderno / sofisticado / popular / etc.)
* Objetivo de marketing (vender mais / fidelizar / aumentar presença)

**Resultado imediato:**
* Campanhas mais coerentes com a identidade da marca
* Copy mais alinhada ao tom e público
* Estética mais consistente — a "personalidade visual" fica mais definida

> Sensação: *"isso já está muito mais profissional do que antes"*

---

### 📊 Diagnóstico inicial por segmento

Baseado em **dados curados de mercado** (não do usuário), o sistema entrega um diagnóstico inicial:

Exemplos:
* *"Lojas do seu segmento têm melhor engajamento às sextas-feiras"*
* *"Posts com combo de produtos performam melhor que produto único nesse setor"*
* *"Urgência e escassez funcionam bem no seu tipo de negócio"*

> Isso dá autoridade ao sistema, percepção de inteligência real e valor imediato.

**⚠️ Importante:** essas heurísticas precisam ser **curadas por segmento** com base em fontes reais (ver seção 7). Não podem ser genéricas ou inventadas — o lojista vai levar a sério e se a realidade não confirmar, a confiança no sistema se rompe.

---

### 📅 Plano semanal "inteligente" (com justificativa)

Diferente do Básico, o plano semanal do Pro vem com a **razão de cada post**:

| Dia | Post | Por quê |
|---|---|---|
| Segunda | Institucional | Baixo movimento — conteúdo de presença |
| Sexta | Promoção | Pico de engajamento no seu segmento |
| Domingo | Produto hero | Planejamento de compra para a semana |

> Isso transforma **execução em estratégia**. O lojista não só posta — ele entende o que está fazendo.

---

## 5.3 Evolução contínua

À medida que o sistema acumula sinais de uso (quais posts foram aprovados, quais foram regenerados, quais tipos de campanha o usuário mais usa), ele começa a:

* Repetir padrões que o usuário aprova
* Reduzir formatos que ele rejeita
* Ajustar linguagem e tipo de campanha gradualmente

> Sensação: *"o Vendeo está aprendendo o meu negócio"*

---

## 5.4 Analytics — Faseamento

### 🟡 Fase 1 (agora — sem integração Meta)

O sistema usa **sinais indiretos** para gerar inteligência:
* Tipos de campanha gerados pelo usuário
* Frequência de geração
* Posts aprovados vs regenerados
* Padrões de uso ao longo do tempo

Comunicação honesta com o usuário:
> *"Com base em padrões de mercado e no seu histórico de uso"*

---

### 🔵 Fase 2 (futuro — com integração Meta)

Conexão via OAuth com Instagram/Facebook Business:
* Alcance, engajamento e cliques por post
* Identificação de formatos que convertem para aquela loja específica
* Otimização baseada em dados reais próprios

Comunicação:
> *"Seus posts com preço em destaque performaram 3x mais essa semana"*

**⚠️ Regra:** não vender analytics como entrega central do Pro agora. Vender como **aprendizado, inteligência e evolução**. A integração Meta é um upgrade natural do Pro, não a razão de existir dele.

---

## 5.5 Posicionamento correto

| Hoje | Futuro |
|---|---|
| Pro = inteligência simulada + heurística de mercado | Pro = inteligência real + dados do próprio lojista |

---

## 5.6 O que o Pro vende

❌ **Não:** "mais IA"

✅ **Sim:** "você vai vender mais"

---

## 5.7 Sensação esperada

> *"Isso parece minha marca, entende meu negócio e está me ajudando a crescer."*

---

# 🚪 6. Onboarding (Beta Aberto)

## 6.1 Princípio

> Gerar valor antes de pedir qualquer configuração.

---

## 6.2 Fluxo

### 1. Login
Usuário acessa a plataforma.

### 2. Entrada direta
Vai direto para geração de campanha.
Sem cadastro de loja obrigatório na entrada.

### 3. Geração de campanha
Usuário informa:
* Produto / serviço / informativo
* (opcional) preço / detalhes

→ IA gera conteúdo completo

### 4. Preview — o momento WOW
Usuário vê:
* Arte completa com identidade da loja aplicada (nome, cor, posicionamento)
* Legenda e CTA prontos

> **Regra:** o Preview sempre mostra o potencial máximo do produto.

### 5. Entrega Free
Usuário recebe a arte completa — com identidade aplicada, pronta para postar.

> O que limita o Free é o **volume** (5 artes/mês), não a qualidade ou a identidade da entrega.

### 6. Gatilho de conversão (após limite atingido)
> *"Você atingiu seu limite mensal. Quer planejar sua semana inteira automaticamente?"*
> *"Com o Básico, o Vendeo pensa por você — sem limite de criações."*

### 7. Upgrade
Após decisão, usuário:
* Revisa identidade da loja (já cadastrada)
* Ativa plano escolhido
* Recebe plano semanal imediatamente (Básico) ou setup guiado de marca (Pro)

---

# 🎯 7. Heurísticas por Segmento

## 7.1 Por que isso é crítico

O Pro Day 1 depende de diagnósticos iniciais baseados em inteligência de mercado, não dados do usuário. Para que esses diagnósticos tenham valor real — e não quebrem a confiança do lojista — as heurísticas precisam ser:

* Baseadas em fontes reais e defensáveis (Meta Business Insights, pesquisas setoriais, benchmarks públicos)
* Curadas por segmento, não genéricas
* Revisadas periodicamente conforme o mercado muda

---

## 7.2 Segmentos prioritários para curadoria (fase inicial)

Com base no foco atual do beta fechado:

| Segmento | Heurísticas a levantar |
|---|---|
| Adega / Bebidas | Melhores dias/horários, formatos que convertem (kit, unidade, promoção) |
| Pet Shop | Sazonalidade (datas especiais), apelo emocional vs funcional |
| Farmácia / Drogaria | Urgência vs saúde preventiva, combos, fidelização |
| Boutique / Vestuário | Lançamento vs promoção, influência de tendência, visual-driven |
| Mercado Local | Rotina de compras, promoção semanal, apelo de proximidade |

---

## 7.3 Fontes recomendadas

* Meta Business Insights (relatórios públicos por setor)
* Relatórios de Social Media do Sprout Social e Hootsuite (benchmarks anuais)
* Pesquisas do Sebrae sobre comportamento do pequeno varejista
* Dados acumulados do próprio beta fechado (comportamento dos lojistas reais)

---

## 7.4 Governança

* As heurísticas devem ser versionadas (saber quando foram atualizadas)
* Revisão semestral ou após acúmulo de dados suficientes do próprio Vendeo
* Na Fase 2 (integração Meta), as heurísticas genéricas são substituídas progressivamente por dados reais de cada lojista

---

# 🧠 8. Princípios de Produto

## 8.1 Vendeo não é editor
* Não incentivar edição manual
* Não virar Canva

## 8.2 Free precisa encantar
* Sempre bonito
* Sempre utilizável
* Arte com identidade da loja, mesmo no free

## 8.3 Pago remove esforço (Básico)
* Valor principal = automação do planejamento, não da geração

## 8.4 Pro entrega inteligência e resultado
* Não é só visual
* É estratégico
* A promessa é "vender mais", não "postar mais"

## 8.5 Ausência intencional (no Free)
* O que falta no Free é o planejamento e a direção — não a qualidade
* A limitação é percebida como "quero mais disso", não como "isso está quebrado"

## 8.6 Confiança como ativo
* Cada heurística entregue no Pro precisa ser verdadeira e defensável
* Promessas de resultado precisam de prazo e contexto honesto

---

# 📊 9. Métricas do Beta Aberto

### Ativação:
* % usuários que geram 1ª campanha
* % que geram 2ª campanha
* % que clicam em "Adicionar minha loja"
* % que chegam na tela de planos

### Conversão:
* % Free → Básico
* % Free → Pro (direto)
* % Básico → Pro (upgrade)

### Retenção:
* Retention D7 e D30 por plano
* Time to Convert (dias entre cadastro e 1º pagamento)
* Churn no 1º mês por plano

### Comportamento do Free:
* Média de artes geradas/mês por usuário Free
* → Usar para calibrar o limite de 5 artes: manter, subir ou reduzir

---

# 🚀 10. Posicionamento Final

| Plano | Identidade | Verbo | Promessa |
|---|---|---|---|
| Free | Automática e consistente | Cria | "Arte pronta pra usar" |
| Básico | Operacional | Executa | "Sua semana planejada" |
| Pro | Inteligente e adaptativa | Melhora | "Você vai vender mais" |

---

## 💥 Frase-chave do produto

> Free cria.
> Básico executa.
> Pro melhora.

---

## Próximos passos

1. **Validar o limite de 5 artes/mês** com dados do beta fechado
2. **Definir pricing real** (valores + copy + posicionamento comercial)
3. **Curatorial de heurísticas** por segmento (ver seção 7)
4. **Refatoração do motor de arte** — com a entrega por plano já definida neste documento
5. **Definir o formato exato do plano semanal** (fila automática vs lista aprovável)
6. **Roadmap de integração Meta** para a Fase 2 do Pro

---
