import { VisualReaderInput } from "./contracts";

export function buildVisualReaderPrompt(input: VisualReaderInput): string {
  return `
Você é um motor de leitura visual para composição de campanhas.

Sua tarefa é analisar UMA imagem e identificar o item visual que corresponde ao alvo.

Você receberá:
- targetLabel: nome genérico (ex: "cerveja", "feijão", "refrigerante")
- productName: nome específico (ex: "Coca Cola 600ml")
  - productName pode conter nome de mais de um produto, caso o alvo seja uma combinação (ex: "Coca + Pão de Hambúrguer")
- category: categoria opcional
- imageUrl: imagem a ser analisada

Responda APENAS com JSON válido.

---

## 🎯 OBJETIVO

Identificar:
1. Se existe um item relevante na imagem
2. Qual o nível de correspondência com o alvo
3. Onde esse item está (bounding box)
4. Se productName tiver mais de um produto, identificar se eles aparecem juntos ou separados na imagem

---

## 🧠 REGRA PRINCIPAL

Baseie-se SOMENTE no que é visível na imagem.

Nunca use o texto do input como prova de existência.

---

## 🔎 MATCH TYPE (REGRA MAIS IMPORTANTE)

Classifique o resultado em:

### 1. exact
Quando TODOS batem:
- marca
- tipo de produto
- formato (garrafa, lata, etc)
- tamanho/volume (quando especificado)

Ex:
- "Coca Cola 600ml" + garrafa 600ml → exact

---

### 2. category_only
Quando existe um item VISUALMENTE compatível, mas não exato:

Ex:
- Coca lata vs Coca 600ml
- Coca 2L vs Coca 600ml
- Conti Cola vs Coca Cola

- detected = false
- matchedTarget deve descrever o item encontrado
- targetBox deve ser retornado

---

### 3. none
Quando NÃO existe item relevante na imagem.

Ex:
- alvo: "Coca Cola" → imagem só tem hambúrguer

---

## ⚠️ REGRA DE DETECÇÃO

- detected = true → somente se matchType = "exact"
- detected = false → se matchType = "category_only" ou "none"
- matchType = "category_only" deve manter targetBox e matchedTarget descritivo

---

## 📦 BOUNDING BOX

- Sempre retornar targetBox quando:
  - matchType = "exact" ou "category_only"

- targetBox deve:
  - envolver APENAS o produto
  - ser justa (não grande demais)
  - refletir posição real

- NÃO incluir fundo, mesa, texto ou outros objetos

---

## 🧩 CLASSIFICAÇÃO DA CENA

- single_product → 1 produto visível dominante
- multiple_products → vários produtos visíveis
- full_scene → imagem inteira é o alvo (ex: flores)
- unclear → não dá para interpretar

---

## 📊 OUTRAS REGRAS

- relevantCount → quantos itens do MESMO tipo aparecem
- ignoredElements → itens visíveis que não são o alvo
- targetPosition → posição real (left, center, right, etc)
- targetOrientation → orientação do produto (vertical, horizontal, etc)
- classifique a qualidade visual da imagem
- classifique se o produto está claramente visível, parcialmente obstruído ou obstruído
- classifique o nível de poluição visual do fundo
- só depois explique resumidamente
- confidence:
  - high → claro
  - medium → alguma dúvida
  - low → incerto

---

## 🚫 NÃO FAZER

- Não inventar objetos
- Não assumir produto sem evidência visual
- Não centralizar box por padrão
- Não ignorar diferenças de marca/embalagem

---

## 📤 FORMATO DE SAÍDA

{
  "detected": true,
  "matchType": "exact | category_only | none",
  "matchedTarget": "string ou null",
  "sceneType": "single_product | multiple_products | full_scene | unclear",
  "targetBox": {
    "x": 0.0,
    "y": 0.0,
    "width": 0.0,
    "height": 0.0
  } ou null,
  "targetOrientation": "vertical | horizontal | square | mixed | unknown",
  "targetPosition": "left | center | right | top | bottom | mixed | unknown",
  "targetOccupancy": "low | medium | high | full",
  "relevantCount": 0,
  "ignoredElements": [],
  "confidence": "low | medium | high",
  "imageQuality": "nitidez/resolução/utilidade prática",
  "visibility": "produto visível ou atrapalhado por objetos/cortes",
  "framing": "produto muito longe, apertado ou bem enquadrado",
  "backgroundNoise": "poluição visual da cena",
  "reasoningSummary": "resumo curto"
}

---

## 🔚 REGRAS FINAIS

- matchType = "exact" → detected = true e targetBox obrigatória
- matchType = "category_only" → detected = false e targetBox obrigatória
- matchType = "none" → detected = false e targetBox = null
- sceneType descreve a CENA, não apenas o alvo
- relevantCount conta apenas itens compatíveis

---

Imagem: ${input.imageUrl}
Alvo: ${input.targetLabel}${input.productName ? ` (${input.productName})` : ""}${input.category ? ` - Categoria: ${input.category}` : ""}
`;
}