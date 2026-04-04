# 📢 Feature — Conteúdo Informativo Estratégico

## 🎯 Objetivo

Transformar o Vendeo em uma ferramenta de geração de conteúdo estratégico para lojas físicas.

O sistema deve permitir que o lojista produza conteúdo que:

👉 informa
👉 educa
👉 posiciona
👉 gera confiança
👉 e também vende

---

## 🧠 Problema identificado

Hoje o foco do Vendeo está majoritariamente em:

* preço
* oferta
* promoção

Mas o lojista precisa produzir outros tipos de conteúdo, como:

* explicações técnicas
* dicas de uso
* orientações ao cliente
* comunicação institucional
* prova de qualidade

Sem isso:

* o uso do sistema fica limitado
* a comunicação fica pobre
* o posicionamento da loja não evolui

---

## 💡 Estratégia

Expandir o tipo de conteúdo `informativo` para se tornar um dos pilares do produto.

O Vendeo deve gerar não apenas campanhas de venda, mas também:

👉 conteúdo de valor e relacionamento

---

## 🧩 Escopo desta feature

---

### 1. Subtipos de conteúdo informativo

Adicionar suporte a múltiplos formatos estratégicos:

#### Educativo

* dicas
* instruções
* uso de produtos

#### Autoridade

* explicações técnicas
* diferenciais
* conhecimento do setor

#### Institucional

* comunicados
* posicionamento
* valores

#### Bastidores

* processos
* equipe
* dia a dia da loja

#### Antes/Depois

* demonstração de resultado
* prova social

---

### 2. Adaptação da IA por tipo de conteúdo

A IA deve gerar texto com base no subtipo selecionado:

* Educativo → didático e claro
* Autoridade → técnico e confiável
* Institucional → direto e formal leve
* Bastidores → humanizado
* Antes/Depois → foco em resultado

---

### 3. Ajuste de linguagem (não promocional)

Conteúdos informativos devem:

* reduzir urgência
* evitar pressão de venda
* priorizar clareza

📌 Ainda podem conter CTA leve quando fizer sentido

---

### 3.5 Integração com Inteligência de Nicho

O conteúdo de valor deve ser gerado com base no conhecimento profundo do setor da loja:

*   **Segmento:** Uso de conselhos reais do setor (ex: Farmácia deve dar dicas de saúde preventivas, Tintas deve dar dicas de preparação de superfície).
*   **Autoridade:** A IA assume o papel de "Consultor do Nicho" em vez de apenas um assistente de escrita.
*   **Personalização:** Cruzar o informativo com o `brand_positioning` da loja (ex: "Como a maior variedade de Brusque, selecionamos 3 dicas para você...").

---

### 4. Simplificação do fluxo

Conteúdos informativos devem:

* exigir menos campos
* ser mais rápidos de criar
* reduzir complexidade de input

---

### 5. Integração com o fluxo atual

📌 Importante:

* NÃO criar nova aba
* manter dentro de campanhas
* utilizar `content_type = "informativo"`

---

## ⚙️ Impacto técnico

### Backend

Garantir suporte completo a:

```ts
content_type = "informativo"
subtype = "educativo" | "autoridade" | "institucional" | "bastidores" | "antes_depois"
```

---

### IA / Prompt

Arquivo:

```bash
lib/domain/campaigns/prompts.ts
```

Ajustes:

* diferenciar comportamento por subtipo
* ajustar tom automaticamente
* variar estrutura de texto

---

### Frontend

Ajustes necessários:

* seletor de subtipo
* labels adaptadas
* simplificação de campos
* preview contextual

---

## 🧪 Regras de validação

Conteúdo informativo deve:

* ser claro e direto
* não parecer propaganda agressiva
* ser útil para o cliente
* ter leitura rápida

---

## 📊 Métricas de sucesso

* aumento de uso de conteúdo informativo
* aumento de frequência de uso
* diversidade de conteúdos gerados
* maior retenção de usuários

---

## 🚫 Fora do escopo

* automação de conteúdo recorrente
* integração com calendário externo
* análise de performance por tipo de conteúdo

---

## 📋 Tasks

### Backend

* [ ] suportar subtipos de informativo
* [ ] ajustar validações

---

### IA

* [ ] adaptar prompt por subtipo
* [ ] ajustar tom e estrutura

---

### Frontend

* [ ] adicionar seletor de subtipo
* [ ] simplificar formulário
* [ ] ajustar preview

---

### Testes

* [ ] gerar conteúdo educativo
* [ ] gerar conteúdo institucional
* [ ] validar clareza e utilidade

---

## 🎯 Resultado esperado

O lojista passa a usar o Vendeo para:

👉 vender
👉 ensinar
👉 se posicionar
👉 se comunicar

---

## 🧠 Impacto no produto

O Vendeo deixa de ser:

👉 gerador de promoções

e passa a ser:

👉 motor de conteúdo estratégico para lojas físicas

---
