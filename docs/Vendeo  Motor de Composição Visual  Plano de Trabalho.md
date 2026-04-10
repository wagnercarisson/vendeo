# Vendeo | Motor de Composição Visual | Plano de Trabalho

---

## 🎯 Objetivo Geral

Integrar três motores principais:

1. Motor de leitura de imagem (visual-reader)
2. Motor de composição (visual-intent + layout engine)
3. Motor de geração de campanha

Resultado esperado:

> Artes padronizadas por loja, porém visualmente distintas, adaptadas ao produto e imagem enviada.

---

## 🧠 Visão Geral da Arquitetura

Fluxo:

imagem → visual-reader → visual-intent-resolver → layout-engine → renderCampaignArt

---

# 🧩 MÓDULO 1 — VISUAL READER (já existente)

## 📌 Responsabilidade

Identificar o produto dentro da imagem.

## 📥 Input

* image_url

## 📤 Output

```json
{
  "detected": boolean,
  "targetBox": { "x", "y", "width", "height" },
  "targetOrientation": "vertical | horizontal | mixed",
  "targetPosition": "left | center | right",
  "targetOccupancy": "low | medium | high",
  "relevantCount": number,
  "confidence": "low | medium | high"
}
```

## 🎯 Intenção

* NÃO alterar imagem
* NÃO definir layout
* APENAS indicar onde está o produto

## ⚠️ Regras

* Crop NÃO define tamanho final
* Se não detectar → fallback para imagem inteira
* Se baixa confiança → sinalizar para UI

---

# 🧠 MÓDULO 2 — VISUAL INTENT RESOLVER (novo)

## 📌 Responsabilidade

Traduzir leitura da imagem em intenção visual

## 📥 Input

* VisualReaderResult

## 📤 Output

```ts
VisualIntent = {
  compositionType: "product-dominant | balanced | text-dominant",
  layoutDirection: "horizontal | vertical | stacked",
  productAnchor: "left | right | center",
  productScale: "large | medium | small",
  complexity: "single | combo"
}
```

## 🎯 Intenção

* Decidir COMO a arte deve se comportar
* NÃO posicionar elementos diretamente
* NÃO gerar layout

---

# 🧩 MÓDULO 3 — LAYOUT ENGINE

## 📌 Responsabilidade

Gerar estrutura de layout com base no intent

## 📥 Input

* VisualIntent
* LayoutBase (solid, split, etc.)

## 📤 Output

```ts
Layout = {
  slots: {
    product,
    headline,
    badge,
    cta,
    footer
  }
}
```

## 🎯 Intenção

* Organizar elementos
* Definir hierarquia visual

## ⚠️ Regras

* Produto sempre prioridade
* Layout adaptativo (não fixo)
* Não depende de IA

---

# 🔁 MÓDULO 4 — VARIANTES DE LAYOUT

## 📌 Responsabilidade

Gerar variações de composição

## 📥 Input

* Layout base
* VisualIntent

## 📤 Output

```ts
LayoutVariants = Layout[]
```

## 🎯 Intenção

* Permitir rearranjo sem regeneração
* Explorar possibilidades visuais

## ⚠️ Regras

* Não alterar conteúdo textual
* Apenas posição/escala
* Determinístico (sem IA)

---

# 🎨 MÓDULO 5 — RENDERIZAÇÃO

## 📌 Responsabilidade

Gerar arte final

## 📥 Input

* Layout selecionado
* Campaign (texto)
* BrandDNA

## 📤 Output

* imagem final

## 🎯 Intenção

* Aplicar cores, fontes, estilos
* Respeitar identidade da loja

---

# 🏪 MÓDULO 6 — BRAND DNA

## 📌 Responsabilidade

Definir identidade visual da loja

## 📥 Input

* store.brand_dna

## 📤 Output

* cores
* tipografia
* estilo

## 🎯 Intenção

* Diferenciar lojas automaticamente

---

# ⚠️ MÓDULO 7 — FALLBACKS E VALIDAÇÕES

## 📌 Responsabilidade

Garantir robustez do sistema

## Casos:

### Produto não detectado

* usar imagem inteira
* avisar usuário

### Produto incorreto

* alertar divergência

### Baixa qualidade

* aviso (não bloquear)

---

# 🖥️ MÓDULO 8 — UI DE COMPOSIÇÃO

## 📌 Responsabilidade

Permitir interação com layout

## Funcionalidades:

* navegar entre variantes (← →)
* manter versão selecionada
* exibir alertas:

  * produto não detectado
  * baixa qualidade
  * possível inconsistência

---

# 🧪 ETAPAS DE IMPLEMENTAÇÃO (PASSO A PASSO)

---

## ✅ ETAPA 1 — Isolar Visual Reader

* testar leitura com imagens reais
* validar JSON retornado

✔️ Critério de validação:

* detectar produto corretamente

---

## ✅ ETAPA 2 — Criar Visual Intent Resolver

* transformar JSON em intent

✔️ Teste:

* diferentes imagens → intents coerentes

---

## ✅ ETAPA 3 — Criar Layout Engine básico

* suportar 1 layout (solid)

✔️ Teste:

* produto muda → layout adapta

---

## ✅ ETAPA 4 — Implementar slots dinâmicos

* product, headline, cta, badge

✔️ Teste:

* posições variam conforme intent

---

## ✅ ETAPA 5 — Criar sistema de variantes

* mínimo 3 variações

✔️ Teste:

* alternância sem recarregar IA

---

## ✅ ETAPA 6 — Integrar renderCampaignArt

* aplicar layout dinâmico

✔️ Teste:

* arte final consistente

---

## ✅ ETAPA 7 — Integrar BrandDNA

* cores e tipografia por loja

✔️ Teste:

* mesma campanha → visual diferente por loja

---

## ✅ ETAPA 8 — Criar UI de composição

* preview + navegação de variantes

✔️ Teste:

* usuário alterna layouts facilmente

---

## ✅ ETAPA 9 — Implementar validações

* detecção
* qualidade
* inconsistência

✔️ Teste:

* mensagens corretas na UI

---

## ✅ ETAPA 10 — Integração completa

* ligar todos os motores

✔️ Teste final:

* imagem → arte final coerente, adaptada e personalizada

---

# 🧠 PRINCÍPIOS DO SISTEMA

* NÃO somos Canva
* NÃO dependemos de IA para layout
* Layout é determinístico
* IA gera conteúdo, não composição
* Produto sempre prioridade visual
* Loja define identidade, não template fixo

---

# 📌 RESULTADO ESPERADO

* mesmo produto → artes diferentes por loja
* mesma loja → consistência visual
* usuário escolhe variações, não constrói arte

---
