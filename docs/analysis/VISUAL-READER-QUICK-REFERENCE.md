# Visual Reader — Referência Rápida

**Para:** Story 4.1 — Desenvolvimento do Motor de Leitura Visual  
**Data:** 23/04/2026

---

## 📥 ENTRADA (6 campos)

| Campo | Tipo | Obrigatório | Origem | Uso |
|-------|------|-------------|---------|-----|
| `imageUrl` | string (URL) | ✅ | Supabase Storage | Imagem enviada ao GPT-4o |
| `targetLabel` | string | ✅ | Frontend (categoria) | Guia busca do produto |
| `productName` | string | ❌ | Frontend (nome) | Refinamento do match (exact vs category) |
| `category` | string | ❌ | Frontend (categoria) | Contexto adicional |
| `campaignType` | enum | ❌ | CampaignVisualBrief | Ajusta expectativas do modelo |
| `content_type` | string | ❌ | CampaignVisualBrief | **⚠️ REDUNDANTE** — avaliar remoção |

---

## 📤 SAÍDA (24 campos em 6 categorias)

### 🎯 Match Detection (6 campos)

| Campo | Tipo | Valores | Crítico? | Uso Principal |
|-------|------|---------|----------|---------------|
| `detected` | boolean | true/false | 🔴 | Motor 2: decisão de crop |
| `matchType` | enum | exact/category_only/none | 🔴 | Motor 2: escolha de layout |
| `matchedTarget` | string/null | — | 🟡 | Motor 2: ajuste de copy |
| `confidence` | enum | low/medium/high | 🟢 | Analytics/QA gates |
| `sceneType` | enum | single/multiple/lifestyle/full/unclear | 🔴 | Motor 2: decisão de composição |
| `relevantCount` | number | 0+ | 🟢 | Validação de consistência |

### 📐 Spatial (5 campos)

| Campo | Tipo | Valores | Crítico? | Uso Principal |
|-------|------|---------|----------|---------------|
| `targetBox` | NormalizedBox/null | {x,y,w,h} | 🔴 | Motor 4: crop da imagem |
| `targetOrientation` | enum | vertical/horizontal/square/mixed/unknown | 🟡 | Motor 4: formato de crop |
| `targetPosition` | enum | left/center/right/top/bottom/mixed/unknown | 🟡 | Motor 2: alinhamento texto |
| `targetOccupancy` | enum | low/medium/high/full | 🔴 | Motor 2: decisão de padding |
| `ignoredElements` | string[] | — | 🟢 | Validação + analytics |

### 🎨 Visual Quality (4 campos)

| Campo | Tipo | Valores | Crítico? | Uso Principal |
|-------|------|---------|----------|---------------|
| `imageQuality` | enum | good/acceptable/poor/unknown | 🟢 | QA gates (alertar poor) |
| `visibility` | enum | clear/partial/obstructed/unknown | 🟡 | Motor 2: decisão de crop |
| `framing` | enum | good/tight/distant/unknown | 🟡 | Motor 2: zoom/crop |
| `backgroundNoise` | enum | low/medium/high/unknown | 🔴 | Motor 2: background decision |

### 🖼️ Background (2 campos)

| Campo | Tipo | Valores | Crítico? | Uso Principal |
|-------|------|---------|----------|---------------|
| `backgroundType` | enum | transparent/solid/simple/complex/unknown | 🔴 | **DECISÃO PRINCIPAL** de composição |
| `hasBackground` | boolean/string | true/false/"unknown" | ❌ | **REDUNDANTE** — remover |

### ✂️ Crop Potential (4 campos)

| Campo | Tipo | Valores | Crítico? | Uso Principal |
|-------|------|---------|----------|---------------|
| `subjectCutoff` | enum | none/light/moderate/severe/unknown | 🟡 | Evitar crop adicional |
| `safeExpansionPotential` | enum | low/medium/high/unknown | 🟡 | `buildVisualCrop()` — margem |
| `focusClarity` | enum | low/medium/high/unknown | 🟢 | **⚠️ OVERLAP** com imageQuality |
| `visualIsolation` | enum | low/medium/high/unknown | 🟡 | Motor 2: tight vs amplo |

### 📝 Metadata (1 campo)

| Campo | Tipo | Valores | Crítico? | Uso Principal |
|-------|------|---------|----------|---------------|
| `reasoningSummary` | string | — | 🟢 | Debug/analytics/transparência |

---

## 🚦 Legenda de Criticidade

| Símbolo | Criticidade | Descrição |
|---------|------------|-----------|
| 🔴 | CRÍTICO | Bloqueia Story 4.2 se ausente |
| 🟡 | IMPORTANTE | Melhora qualidade, mas não bloqueia |
| 🟢 | SECUNDÁRIO | Analytics/debug — não impacta geração |
| ❌ | OBSOLETO | Redundante — candidato a remoção |

---

## 🔄 Fluxo de Dados Simplificado

```
Frontend
  ↓
CampaignVisualBrief
  ↓
Visual Reader Input (6 campos)
  ↓
GPT-4o Vision API
  ↓
Visual Reader Output (24 campos)
  ↓
Normalização pós-modelo (7 funções)
  ↓
Intent Resolver (Motor 2)
  ↓
Visual Composer (Motor 3)
  ↓
Renderer (Motor 4)
```

---

## 🎯 Campos Mais Importantes (Top 7)

1. **`backgroundType`** — DECISÃO PRINCIPAL de composição
2. **`detected`** — Se produto exato foi encontrado
3. **`matchType`** — Nível de correspondência
4. **`targetBox`** — Coordenadas para crop
5. **`sceneType`** — Tipo de cena (single/multiple/lifestyle)
6. **`targetOccupancy`** — Quanto da imagem o produto ocupa
7. **`backgroundNoise`** — Complexidade do fundo

---

## ⚠️ Ações Pendentes

1. ❌ **Remover** `hasBackground` (redundante com `backgroundType`)
2. ⚠️ **Avaliar** remoção de `content_type` na entrada (overlap com `campaignType`)
3. ⚠️ **Avaliar** consolidação de `focusClarity` com `imageQuality`

---

## 📏 Regras de Normalização Pós-Modelo

| Função | O que faz |
|--------|-----------|
| `normalizeMatchConsistency()` | Garante detected/matchType/targetBox consistentes |
| `normalizeBox()` | Clamp, tamanho mínimo, expansão, reposicionamento |
| `validateBoxValidity()` | Rejeita boxes inválidas/minúsculas/1:1 |
| `normalizeSceneType()` | Força multiple_products se relevantCount > 1 |
| `normalizeOccupancy()` | Ajusta occupancy baseado na área do box |
| `normalizePosition()` | Calcula left/center/right do centerX |
| `normalizeMatchedTarget()` | Define matchedTarget como null se matchType=none |

---

## 🧪 Testes Necessários (Story 4.1)

| Tipo de Imagem | Campos Esperados |
|----------------|------------------|
| PNG transparente | `backgroundType=transparent`, `detected=true`, `targetBox` presente |
| Produto isolado (fundo branco) | `sceneType=single_product`, `backgroundType=solid`, `backgroundNoise=low` |
| Múltiplos produtos | `sceneType=multiple_products`, `relevantCount>1`, `ignoredElements` não vazio |
| Lifestyle (pessoa + produto) | `sceneType=lifestyle_scene`, `detected=false` ou `targetBox` amplo |
| Cena completa (loja) | `sceneType=full_scene`, `targetBox` null ou 1:1 |
| Match exato | `matchType=exact`, `detected=true` |
| Match por categoria | `matchType=category_only`, `detected=false`, `targetBox` presente |
| Sem match | `matchType=none`, `targetBox=null` |
| Produto cortado nas bordas | `subjectCutoff=moderate/severe` |
| Imagem de baixa qualidade | `imageQuality=poor`, `focusClarity=low` |

---

*Referência rápida para desenvolvimento da Story 4.1*
