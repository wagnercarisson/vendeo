# 📄 DOCUMENTO — Composition Engine v1 (Vendeo)

---

## 🎯 Objetivo

Evoluir o Vendeo de um sistema baseado em layouts fixos para um **motor de composição visual dinâmica**, capaz de gerar artes personalizadas, consistentes e adaptáveis à imagem e ao DNA da loja.

---

## 🧠 Princípio central

> O sistema NÃO escolhe layouts
> O sistema gera DIREÇÕES VISUAIS e as transforma em composições

---

## 🧩 Arquitetura do fluxo

```txt
Imagem + Campanha + Store DNA
        ↓
Visual Reader (leitura da imagem)
        ↓
Image Profile (restrições)
        ↓
Creative Direction (decisão criativa)
        ↓
Composition Engine (execução)
        ↓
Arte final (variações)
```

---

# 🔍 1. VISUAL READER — NOVOS REQUISITOS

## 🎯 Objetivo

Classificar a imagem para definir **o que é possível ou não fazer na composição**

---

## 📦 Saída esperada (ImageProfile)

```ts
type ImageProfile = {
  backgroundType: "transparent" | "solid" | "complex" | "unknown"
  subjectCount: "single" | "multiple"
  occupancy: "low" | "medium" | "high" | "full"
  orientation: "vertical" | "horizontal" | "square"
  position: "left" | "center" | "right" | "mixed"

  // novos campos críticos
  hasClearCutout: boolean
  edgeQuality: "clean" | "soft" | "busy"
  backgroundNoise: "low" | "medium" | "high"
}
```

---

## 🧠 Regras importantes

### 1. backgroundType

* `transparent` → produto sem fundo
* `solid` → fundo simples (cor única)
* `complex` → cenário, ambiente

---

### 2. hasClearCutout (CRÍTICO)

Define se o produto pode ser usado como:

* elemento solto (true)
* ou apenas enquadrado (false)

---

### 3. occupancy

* `full` → NÃO pode usar fundo atrás
* `low` → permite composição livre

---

# 🎨 2. CREATIVE DIRECTION

## 🎯 Objetivo

Gerar uma **direção visual coerente**, baseada em:

* imagem
* campanha
* DNA da loja
* seed (variação)

---

## 📦 Estrutura

```ts
type CreativeDirection = {
  directionType: 
    | "hero"
    | "frame"
    | "split-dynamic"
    | "overlay"
    | "stacked"

  mood: 
    | "clean"
    | "aggressive"
    | "playful"
    | "premium"

  productTreatment:
    | "cutout"
    | "framed"
    | "background"

  textDistribution:
    | "left"
    | "right"
    | "center"
    | "overlay"

  priceEmphasis:
    | "low"
    | "medium"
    | "high"

  visualIntensity:
    | "minimal"
    | "balanced"
    | "strong"

  // 🔴 NOVO — constraints obrigatórias
  constraints: {
    allowBackgroundBehind: boolean
    requireFrame: boolean
    allowOverlayText: boolean
  }
}
```

---

## 🧠 Prioridade de decisão (CRÍTICO)

```txt
1. Limitações da imagem (sempre vence)
2. Tipo de conteúdo
3. Objetivo da campanha
4. Seed (variação)
```

---

## 🎯 Regras baseadas na imagem

```ts
allowedDirections = {
  transparent: ["hero", "split-dynamic", "stacked", "frame"],
  solid: ["frame", "hero"],
  complex: ["overlay", "frame", "hero"],
  full: ["overlay", "frame"]
}
```

👉 Direções fora dessa lista são proibidas

---

## 🎯 Regras baseadas na campanha

| Tipo      | Direção preferida      |
| --------- | ---------------------- |
| promoção  | hero / split / stacked |
| combo     | stacked                |
| destaque  | hero                   |
| reposição | clean / frame          |

---

# 🧱 3. COMPOSITION ENGINE

## 🎯 Objetivo

Transformar a direção em uma composição executável

---

## ⚠️ Regras CRÍTICAS

* NÃO usar templates fixos
* NÃO usar posições rígidas
* USAR variação controlada

---

## 📦 Estrutura

```ts
type Composition = {
  product: {
    placement: "center" | "left" | "right"
    scale: number
    layer: "front" | "background"
  }

  background: {
    type: "solid" | "gradient" | "shape" | "none"
    intensity: number
  }

  text: {
    blockStyle: "floating" | "boxed" | "overlay"
    alignment: "left" | "right" | "center"
  }

  price: {
    style: "badge" | "text" | "stamp"
    emphasis: number
  }
}
```

---

## 🎲 Uso da seed

A seed controla:

* variação de posição
* intensidade
* escolha de shapes
* proporções

---

## ⚠️ Regra da seed (CRÍTICA)

```txt
A seed NÃO pode gerar composições fora:
- das limitações da imagem
- da direção escolhida
```

---

# 🎯 4. DIREÇÕES BASE

## 1. HERO

Produto dominante

## 2. FRAME

Produto enquadrado

## 3. SPLIT-DYNAMIC

Divisão fluida (não 50/50)

## 4. OVERLAY

Imagem como fundo

## 5. STACKED

Múltiplos elementos

---

# 🧠 5. REGRAS DE COMPATIBILIDADE

## ❌ NÃO permitir:

* fundo atrás de imagem `full`
* uso de cutout falso
* texto em área ilegível

---

## ✅ PERMITIR:

* composição livre com cutout
* enquadramento com imagem complexa
* overlay com imagem full

---

# 🎯 6. UX (IMPORTANTE)

Fluxo final:

1. Gerar 3–5 variações
2. Usuário navega (← →)
3. Escolhe uma
4. Sistema registra padrão da loja

---

# 🚨 7. NÃO FAZER

* não voltar para templates
* não usar regras fixas tipo “produto → layout”
* não gerar composição aleatória sem restrição

---

# 🧭 PRÓXIMOS PASSOS

## 1️⃣ Ajustar Visual Reader (CRÍTICO)

Adicionar novos campos do ImageProfile

## 2️⃣ Criar CreativeDirection (função pura)

## 3️⃣ Criar Composition Engine (v1 simples)

## 4️⃣ Gerar 3 variações por campanha

---

# 💬 CONCLUSÃO

Você não está construindo um gerador de arte.

👉 Você está construindo:

# **um motor de direção + execução criativa**

---
