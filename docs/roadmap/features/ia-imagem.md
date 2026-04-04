# 🖼️ Feature — IA de Imagem (Geração Completa)

## 🎯 Objetivo

Permitir que o Vendeo gere artes completas automaticamente, mesmo sem imagem enviada pelo usuário.

O sistema deve ser capaz de:

👉 criar uma arte do zero
👉 compor visualmente o conteúdo
👉 manter qualidade comercial

---

## 🧠 Problema identificado

Hoje o fluxo depende de:

* o usuário ter uma imagem
* a qualidade da imagem enviada

Isso gera:

* bloqueio de uso
* inconsistência visual
* abandono do fluxo

Além disso, existe expectativa clara de que a IA:

👉 resolva tudo sozinha

---

## 💡 Estratégia

Transformar a geração de imagem em um motor completo de criação visual.

O Vendeo deve operar em dois modos:

---

### 1. Modo Produto

* usa imagem enviada pelo usuário
* aplica composição sobre a imagem

---

### 2. Modo Automático (IA completa)

Quando não houver imagem:

A IA deve gerar:

* fundo
* contexto visual
* composição
* base da arte

---

## 🧩 Escopo desta feature

---

### 1. Geração de imagem base

A IA deve gerar imagens:

* coerentes com o produto/serviço
* visualmente limpas
* com foco comercial (não artístico demais)

---

### 2. Composição automática

A arte final deve incluir:

* texto
* preço (quando aplicável)
* CTA
* elementos visuais

Sem necessidade de intervenção manual.

---

### 3. Integração transparente

O usuário NÃO deve:

* escolher modelo
* configurar parâmetros
* tomar decisões técnicas

Tudo deve acontecer automaticamente.

---

### 4. Consistência com variabilidade visual

A geração de imagem deve respeitar:

* estilo da loja
* layout escolhido
* identidade visual

📌 Integração direta com:
👉 variabilidade-visual.md

---

### 5. Controle de custo

Implementar mecanismos de controle:

* limite por plano
* uso consciente por campanha
* evitar regeneração excessiva

---

## ⚙️ Impacto técnico

---

### Backend

Criar fluxo:

```ts id="2l8rfa"
if (product_image_url) {
  useUserImage()
} else {
  generateFullImageWithAI()
}
```

---

### Integração IA

Possíveis opções:

* OpenAI (image generation)
* modelos equivalentes

Critérios:

* custo controlado
* tempo de resposta rápido
* qualidade consistente

---

### Armazenamento

* salvar imagem gerada no storage (Supabase)
* manter padrão de `image_url`

---

### Integração com renderer

Arquivo:

```bash id="e4y0km"
lib/graphics/renderer.ts
```

Ajustes:

* aceitar imagem gerada como base
* aplicar composição automaticamente

---

## 🖥️ Impacto no frontend

Estados necessários:

* “Gerando arte...”
* preview automático após geração

📌 Objetivo:

* manter fluidez
* evitar fricção

---

## 🧪 Regras de validação

A arte gerada deve:

* ser relevante ao contexto
* ser legível
* não parecer genérica
* manter padrão visual consistente

---

## 📊 Métricas de sucesso

* redução de campanhas sem imagem
* aumento de campanhas concluídas
* redução de abandono
* aumento de uso do modo automático

---

## 🚫 Fora do escopo

* editor manual de imagem
* escolha de estilos avançados
* múltiplas variações por padrão
* banco externo de imagens (inicialmente)

---

## 📋 Tasks

### Backend

* [ ] implementar fluxo automático
* [ ] integrar com API de imagem
* [ ] salvar imagem no storage

---

### IA

* [ ] definir prompt visual
* [ ] ajustar estilo comercial
* [ ] garantir consistência

---

### Renderer

* [ ] integrar imagem gerada
* [ ] aplicar composição automaticamente

---

### Controle

* [ ] implementar limites por plano
* [ ] evitar uso excessivo

---

### Testes

* [ ] gerar arte sem imagem
* [ ] validar consistência
* [ ] testar múltiplos cenários

---

## 🎯 Resultado esperado

O usuário consegue:

👉 gerar campanhas completas sem esforço
👉 não depender de imagem
👉 manter fluxo contínuo

---

## 🧠 Impacto no produto

O Vendeo passa a entregar:

👉 experiência de “IA real”
👉 autonomia total
👉 maior valor percebido

---

## 🔜 Próxima etapa

👉 execução das prioridades críticas:

1. Variabilidade visual
2. Informativo estratégico
3. IA de imagem completa
