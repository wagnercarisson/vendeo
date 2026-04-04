# 📍 Fase 1 — Content Engine

## 🎯 Objetivo

Transformar o Vendeo em um motor de conteúdo recorrente para lojas físicas.

O lojista deve usar o sistema diariamente para:

👉 se comunicar
👉 fortalecer sua marca
👉 manter presença
👉 vender

---

## 🧠 Problema identificado

O varejo físico não vive apenas de promoções.

Lojistas também precisam produzir conteúdo:

* educativo
* institucional
* de autoridade
* de relacionamento
* de posicionamento

Sem isso, o uso do Vendeo fica:

* limitado
* esporádico
* focado apenas em preço
* com baixo valor percebido

---

## 💡 Estratégia

Expandir o Vendeo de:

👉 gerador de campanhas

para:

👉 gerador de conteúdo estratégico completo

---

## 📦 Features desta fase

---

### 🔥 1. Variabilidade Visual (CRÍTICO)

Garantir que as artes geradas NÃO sejam iguais entre lojas diferentes.

Problema atual:

* sensação de template genérico
* perda de valor percebido

Solução:

Implementar variabilidade em 3 níveis:

#### 1. Layout

* posição de elementos
* organização da arte

#### 2. Estilo

* moderno
* promocional
* elegante
* popular

#### 3. Identidade

* cores base da loja
* variação visual consistente

📌 Regra obrigatória:

* mesma loja pode repetir padrão
* lojas diferentes NÃO podem gerar artes iguais

---

### 🔥 2. Conteúdo Informativo Estratégico (CORE)

Expandir o tipo `informativo` para suportar marketing real.

Subtipos:

* Educativo (dicas, instruções)
* Autoridade (explicações técnicas)
* Institucional (comunicados)
* Bastidores (processos, equipe)
* Antes/Depois (prova social)

📌 Objetivo:

* aumentar frequência de uso
* gerar valor além da venda
* posicionar o lojista como referência

---

### 🔥 3. IA de Imagem Completa

Permitir geração de arte sem imagem enviada.

Modos:

#### Modo Produto

* usa imagem do usuário

#### Modo Automático

* IA gera:

  * fundo
  * composição
  * elementos visuais

📌 Objetivo:

* eliminar fricção
* atender expectativa de “IA real”

---

### 🟡 4. Copywriting e Inteligência de Nicho (Evolução)

Evoluir a IA para suportar os objetivos de cada nicho (Venda vs. Autoridade).

📌 **A inteligência deve adaptar:**
*   **A abordagem:** Nichos consultivos (ex: Farmácia, Tintas) exigem autoridade e educação.
*   **O vocabulário:** Uso de termos técnicos do setor sem ser cansativo.
*   **O Tom:** Sincronizar o tom de voz da loja com o objetivo da campanha.
*   **Estratégia:** Selecionar gatilhos mensais adequados a cada ramo de atividade.

---

### ✅ 5. Comunicação Multi-Filial (Infraestrutura Relacional)

Permitir comunicação de múltiplas unidades com integridade de dados.

**Status:** Concluído. 
- Migramos do modelo JSONB para a tabela relacional `store_branches` (Migration 018).
- Implementamos RPC atômica com suporte a UPSERT.
- Prepada para Fase 2 (Estratégias por Filial).

📌 Suporte completo a múltiplas unidades agora é nativo.

---

### ✅ 6. Ajustes de Fricção (UX & Security Hardening)

**Status:** Concluído. 
* [x] aceitar WhatsApp com 10 ou 11 dígitos
* [x] **Navigation Guard Global**: Proteção total contra perda de dados em todo o Dashboard.
* [x] **Onboarding Resiliente**: Resolução de conflitos de ID de usuário via RPC Upsert.
* [x] **Segurança RLS**: Blindagem de privacidade entre lojistas em todas as tabelas (Multi-tenancy).
* [x] Ajustes de validação e setters do formulário de loja.

---

## 🚫 Fora do escopo (nesta fase)

* encartes
* multi-produto
* automação de postagem
* integração com redes sociais
* analytics avançado

---

## 📊 Métricas de sucesso

* aumento de sessões por usuário
* aumento de conteúdos criados por semana
* diversidade de tipos de conteúdo gerado
* redução de abandono
* aumento de percepção de valor

---

## 🎯 Resultado esperado

O Vendeo passa de:

👉 gerador de campanhas

para:

👉 motor de conteúdo estratégico para lojas físicas

---

## 🧠 Mudança fundamental

O usuário não usa o Vendeo apenas quando quer vender.

Ele usa:

👉 todos os dias

---

## 🔜 Próxima fase

```bash
docs/roadmap/phases/fase-2-core-power.md
```
