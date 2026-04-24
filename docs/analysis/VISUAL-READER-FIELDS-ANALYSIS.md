# Análise Detalhada: Visual Reader (Motor 1) — Epic 4

**Data:** 23/04/2026  
**Contexto:** Preparação para Story 4.1  
**Status:** ✅ Análise Completa  

---

## 📌 Resumo Executivo

O **Visual Reader** é o Motor 1 da pipeline de composição visual (Epic 4). Ele:

- **Recebe:** Imagem do produto + metadados da campanha
- **Analisa:** Características visuais da imagem via GPT-4o Vision
- **Retorna:** `ImageProfile` estruturado com 24 campos
- **Objetivo:** Guiar o Intent Resolver (Motor 2) na decisão de composição

---

## 🔽 CAMPOS DE ENTRADA (VisualReaderInput)

### 1. `imageUrl` (string, obrigatório)
**Origem:** Imagem do produto fornecida pelo lojista  
**Quem entrega:**  
- Frontend: Upload para Supabase Storage → retorna public URL
- Workflow: `CampaignVisualBrief.image.source_url`

**Formato:** URL pública acessível pela OpenAI Vision API  
**Uso:** Enviada ao GPT-4o para análise visual

**Exemplo:**
```
https://supabase.co/storage/v1/object/public/products/store-123/coca-cola.jpg
```

**Validação:** `.url()` (Zod) — deve ser URL válida

---

### 2. `targetLabel` (string, obrigatório)
**Origem:** Nome genérico do produto  
**Quem entrega:**  
- Frontend: Campo "Categoria" ou derivado do nome do produto
- Workflow: `CampaignVisualBrief.content_type` ou detectado automaticamente

**Uso:** Guia o GPT-4o na busca do item correto na imagem

**Exemplos:**
- "cerveja"
- "refrigerante"
- "hambúrguer"
- "feijão"

**Por que é necessário:** Em imagens com múltiplos produtos, o modelo precisa saber QUAL procurar.

---

### 3. `productName` (string, opcional)
**Origem:** Nome específico do produto com marca/volume  
**Quem entrega:**  
- Frontend: Campo "Nome do Produto" da campanha
- Workflow: `CampaignVisualBrief.product_name`

**Uso:** Refinamento do match visual (exact vs category_only)

**Exemplos:**
- "Coca Cola 600ml"
- "Heineken Lata 350ml"
- "Big Mac"
- "Coca + Pão de Hambúrguer" (múltiplos produtos)

**Por que é necessário:** Permite distinção entre:
- Coca 600ml (exact match) vs Coca 2L (category_only)
- Heineken (exact) vs Budweiser (category_only)

---

### 4. `category` (string, opcional)
**Origem:** Categoria do produto  
**Quem entrega:**  
- Frontend: Campo de categoria da campanha
- Workflow: `CampaignVisualBrief.content_type` (product/service/info/message)

**Uso:** Contexto adicional para classificação de scene type

**Exemplos:**
- "bebidas"
- "alimentos"
- "eletrônicos"

**Por que é necessário:** Ajuda na identificação em cenas complexas (lifestyle/full_scene)

**⚠️ Status na v2:** Campo preservado, mas uso SECUNDÁRIO ao targetLabel/productName

---

### 5. `campaignType` (enum, opcional)
**Origem:** Tipo de campanha  
**Quem entrega:**  
- Frontend: Seleção do lojista
- Workflow: `CampaignVisualBrief.campaign_type`

**Valores possíveis:**
- `"single_product"` — Campanha focada em 1 produto
- `"multiple_products"` — Campanha com vários produtos (ex: combo)
- `"info"` — Campanha informativa sem produto específico

**Uso:** Ajusta expectativas do modelo sobre o que procurar na imagem

**Por que é necessário:** Previne falsos negativos quando imagem tem múltiplos produtos, mas campanha foca em apenas 1.

**⚠️ Status na v2:** Campo PRESERVADO — importante para Weekly Plan (Story 4.6)

---

### 6. `content_type` (string, opcional)
**Origem:** Tipo de conteúdo da campanha  
**Quem entrega:**  
- Workflow: `CampaignVisualBrief.content_type`

**Valores esperados:**
- `"product"` (padrão)
- `"service"`
- `"info"`
- `"message"`

**Uso:** Contexto adicional para classificação

**⚠️ Status na v2:** Campo REDUNDANTE com `category` e `campaignType`  
**💡 Decisão pendente:** Consolidar com `campaignType` ou remover?

---

## 🔼 CAMPOS DE SAÍDA (VisualReaderOutput)

O output retorna **24 campos** estruturados em 5 categorias:

---

### 📍 **Categoria 1: Match Detection (6 campos)**

#### 1. `detected` (boolean)
**Para que serve:** Indica se o produto EXATO foi encontrado na imagem  
**Usado por:** Intent Resolver (Motor 2) — decisão de composição

**Regra:**
- `true` → matchType = "exact" (produto exato encontrado)
- `false` → matchType = "category_only" ou "none"

**Exemplo de uso:**
```typescript
if (output.detected) {
  // Compor arte com crop do produto
} else {
  // Usar imagem inteira (sem crop)
}
```

**✅ Status na v2:** CRÍTICO — mantido

---

#### 2. `matchType` (enum)
**Para que serve:** Classifica o nível de correspondência do produto

**Valores:**
- `"exact"` — Produto exato (marca + formato + volume)
- `"category_only"` — Produto similar (mesma categoria, marca diferente)
- `"none"` — Nenhum produto relevante

**Usado por:** Intent Resolver — escolha de layout

**Exemplos:**
| Input | Imagem | matchType |
|-------|--------|-----------|
| "Coca 600ml" | Coca 600ml | exact |
| "Coca 600ml" | Coca 2L | category_only |
| "Coca" | Pepsi | category_only |
| "Coca" | Hambúrguer | none |

**✅ Status na v2:** CRÍTICO — mantido

---

#### 3. `matchedTarget` (string, nullable)
**Para que serve:** Descreve o produto encontrado na imagem

**Regra:**
- `null` → matchType = "none"
- Descrição exata → matchType = "exact"
- Descrição genérica → matchType = "category_only"

**Usado por:** Intent Resolver — ajuste de copy/CTA

**Exemplos:**
- Input: "Coca 600ml" → Output: "Coca Cola garrafa 600ml" (exact)
- Input: "Coca 600ml" → Output: "Refrigerante de cola em garrafa" (category_only)
- Input: "Coca" → Output: null (none)

**✅ Status na v2:** CRÍTICO — mantido

---

#### 4. `confidence` (enum)
**Para que serve:** Indica confiança do modelo na análise

**Valores:** `"low"` | `"medium"` | `"high"`

**Usado por:**
- QA gates (rejeitar artes com low confidence)
- Analytics (tracking de qualidade)

**⚠️ Status na v2:** SECUNDÁRIO — mantido, mas não bloqueia geração

---

#### 5. `sceneType` (enum)
**Para que serve:** Classifica o tipo de cena da imagem

**Valores:**
- `"single_product"` — Produto isolado (fundo limpo/transparente)
- `"multiple_products"` — Vários produtos na mesma imagem
- `"lifestyle_scene"` — Produto em contexto de uso (ex: pessoa segurando)
- `"full_scene"` — Cena completa (ambiente, loja, etc.)
- `"unclear"` — Não foi possível classificar

**Usado por:** Intent Resolver — decisão de crop/composição

**Exemplos:**
| Imagem | sceneType | Impacto na Composição |
|--------|-----------|----------------------|
| Coca em fundo branco | single_product | Crop tight + background colorido |
| 3 cervejas lado a lado | multiple_products | Crop mais amplo |
| Pessoa bebendo Coca | lifestyle_scene | Usa imagem inteira (sem crop) |
| Interior de loja | full_scene | Usa imagem inteira |

**✅ Status na v2:** CRÍTICO — mantido

---

#### 6. `relevantCount` (number)
**Para que serve:** Conta quantos itens relevantes existem na imagem

**Usado por:**
- Validação de consistência (relevantCount > 1 → forçar sceneType = "multiple_products")
- Analytics

**Exemplos:**
- Input: "cerveja" → Imagem com 3 cervejas → relevantCount = 3
- Input: "Coca" → Imagem com Coca + Pepsi → relevantCount = 2

**✅ Status na v2:** MANTIDO — usado para validação

---

### 📐 **Categoria 2: Spatial Information (5 campos)**

#### 7. `targetBox` (NormalizedBox, nullable)
**Para que serve:** Coordenadas do produto na imagem (bounding box)

**Formato:**
```typescript
{
  x: number,      // 0-1 (% da largura)
  y: number,      // 0-1 (% da altura)
  width: number,  // 0-1 (% da largura)
  height: number  // 0-1 (% da altura)
}
```

**Usado por:**
- Renderer (Motor 4) — crop da imagem
- `buildVisualCrop()` — cálculo de região de interesse

**Regra:**
- `null` → matchType = "none" (não há produto para recortar)
- Presente → matchType = "exact" ou "category_only"

**Exemplo:**
```json
{
  "x": 0.25,     // Produto começa em 25% da largura
  "y": 0.15,     // Produto começa em 15% da altura
  "width": 0.5,  // Produto ocupa 50% da largura
  "height": 0.7  // Produto ocupa 70% da altura
}
```

**Validação pós-modelo:**
- Normalização: clamp para 0-1
- Expansão: +12% para respiro (só em single_product/multiple_products)
- Tamanho mínimo: 0.18 (18% da imagem)
- Rejeita boxes 1:1 (ocupando imagem inteira) em cenas de produto

**✅ Status na v2:** CRÍTICO — mantido

---

#### 8. `targetOrientation` (enum)
**Para que serve:** Orientação do produto na imagem

**Valores:** `"vertical"` | `"horizontal"` | `"square"` | `"mixed"` | `"unknown"`

**Usado por:** Renderer — escolha de formato de crop

**Exemplos:**
| Produto | targetOrientation |
|---------|------------------|
| Garrafa Coca 2L | vertical |
| Pizza | horizontal |
| Hambúrguer (vista de cima) | square |
| 3 produtos diferentes | mixed |

**✅ Status na v2:** MANTIDO — usado para decisões de layout

---

#### 9. `targetPosition` (enum)
**Para que serve:** Posição do produto na imagem

**Valores:** `"left"` | `"center"` | `"right"` | `"top"` | `"bottom"` | `"mixed"` | `"unknown"`

**Usado por:** Intent Resolver — decisão de alinhamento de texto

**Normalização pós-modelo:**
```typescript
const centerX = targetBox.x + targetBox.width / 2;
if (centerX < 0.33) targetPosition = "left";
else if (centerX > 0.66) targetPosition = "right";
else targetPosition = "center";
```

**⚠️ Status na v2:** CALCULADO automaticamente — não depende do modelo

---

#### 10. `targetOccupancy` (enum)
**Para que serve:** Quanto da imagem o produto ocupa

**Valores:** `"low"` | `"medium"` | `"high"` | `"full"`

**Usado por:** Intent Resolver — decisão de background/padding

**Regra de cálculo:**
```typescript
const area = targetBox.width * targetBox.height;
// low: < 30%
// medium: 30-55%
// high: 55-75%
// full: > 75%
```

**Normalização pós-modelo:**
- `full` só permitido em sceneType = "full_scene"
- `medium` com área > 55% → ajustado para `high`

**✅ Status na v2:** MANTIDO

---

#### 11. `ignoredElements` (string[])
**Para que serve:** Lista elementos presentes na imagem, mas NÃO são o target

**Usado por:**
- Validação de consistência (se há ignoredElements → forçar sceneType = "multiple_products")
- Analytics (tracking de qualidade de imagens)

**Exemplos:**
- Input: "Coca Cola" → Imagem com Coca + Pepsi + Guaraná
  → `ignoredElements: ["Pepsi 2L", "Guaraná Antarctica lata"]`

**✅ Status na v2:** MANTIDO — usado para validação

---

### 🎨 **Categoria 3: Visual Quality (4 campos)**

#### 12. `imageQuality` (enum)
**Para que serve:** Avalia qualidade técnica da imagem

**Valores:** `"good"` | `"acceptable"` | `"poor"` | `"unknown"`

**Usado por:**
- QA gates (bloquear imagens "poor")
- Analytics

**Critérios:**
- `good` → Alta resolução, foco nítido, boa iluminação
- `acceptable` → Resolução ok, pequenos problemas
- `poor` → Baixa resolução, desfocada, escura

**⚠️ Status na v2:** SECUNDÁRIO — não bloqueia geração, mas pode alertar usuário

---

#### 13. `visibility` (enum)
**Para que serve:** Avalia visibilidade do produto

**Valores:** `"clear"` | `"partial"` | `"obstructed"` | `"unknown"`

**Usado por:** QA gates + Intent Resolver

**Exemplos:**
- `clear` → Produto totalmente visível
- `partial` → Parte do produto está cortada
- `obstructed` → Produto parcialmente coberto por outro objeto

**✅ Status na v2:** MANTIDO — influencia decisão de crop

---

#### 14. `framing` (enum)
**Para que serve:** Avalia enquadramento do produto

**Valores:** `"good"` | `"tight"` | `"distant"` | `"unknown"`

**Usado por:** Intent Resolver — decisão de zoom/crop

**Exemplos:**
- `good` → Produto bem enquadrado, com respiro
- `tight` → Produto muito próximo das bordas
- `distant` → Produto muito pequeno na imagem

**✅ Status na v2:** MANTIDO

---

#### 15. `backgroundNoise` (enum)
**Para que serve:** Avalia complexidade do background

**Valores:** `"low"` | `"medium"` | `"high"` | `"unknown"`

**Usado por:** Intent Resolver — decisão de usar imagem original vs substituir background

**Exemplos:**
- `low` → Fundo limpo (branco, transparente)
- `medium` → Fundo com poucos elementos
- `high` → Fundo complexo (padrões, múltiplos objetos)

**Correlação com `backgroundType`:**
```typescript
if (backgroundType === "transparent") backgroundNoise = "low";
if (backgroundType === "complex") backgroundNoise = "high";
```

**✅ Status na v2:** CRÍTICO — mantido

---

### 🖼️ **Categoria 4: Background Analysis (2 campos)**

#### 16. `backgroundType` (enum)
**Para que serve:** Classifica tipo de fundo da imagem

**Valores:**
- `"transparent"` — PNG com alpha channel
- `"solid"` — Fundo de cor única
- `"simple"` — Fundo com poucos elementos
- `"complex"` — Fundo com múltiplos elementos/padrões
- `"unknown"` — Não foi possível determinar

**Usado por:** Intent Resolver — DECISÃO PRINCIPAL de composição

**Fluxo de decisão:**
```typescript
if (backgroundType === "transparent") {
  // Usar imagem com background colorido (Visual Signature)
} else if (backgroundType === "complex") {
  // Usar imagem inteira (sem crop) — estilo lifestyle
} else {
  // Tentar crop + background customizado
}
```

**✅ Status na v2:** CRÍTICO — mantido

---

#### 17. `hasBackground` (boolean | "unknown")
**Para que serve:** Indica se há background na imagem

**Valores:** `true` | `false` | `"unknown"` | `"true"` (string) | `"false"` (string)

**Usado por:** Intent Resolver — validação cruzada com backgroundType

**⚠️ Problema de design:**
```typescript
z.union([
  z.boolean(),
  z.literal("true"),
  z.literal("false"),
  z.literal("unknown"),
])
```
→ Mistura boolean + string (inconsistência do modelo)

**❌ Status na v2:** REDUNDANTE com `backgroundType`  
**💡 Decisão:** REMOVER ou normalizar para boolean puro

**Correlação:**
```typescript
if (backgroundType === "transparent") hasBackground = false;
else hasBackground = true;
```

---

### ✂️ **Categoria 5: Crop Potential (4 campos)**

#### 18. `subjectCutoff` (enum)
**Para que serve:** Avalia se o produto está cortado nas bordas

**Valores:** `"none"` | `"light"` | `"moderate"` | `"severe"` | `"unknown"`

**Usado por:** Intent Resolver — decisão de evitar crop adicional

**Exemplos:**
- `none` → Produto inteiro na imagem
- `light` → 5-10% cortado (aceitável)
- `moderate` → 10-30% cortado
- `severe` → >30% cortado (não usar crop)

**✅ Status na v2:** MANTIDO — crítico para evitar cortar ainda mais

---

#### 19. `safeExpansionPotential` (enum)
**Para que serve:** Avalia se é seguro expandir o crop (adicionar margem)

**Valores:** `"low"` | `"medium"` | `"high"` | `"unknown"`

**Usado por:** `buildVisualCrop()` — cálculo de margem

**Regra:**
- `high` → Pode expandir 15-20% sem perder contexto
- `medium` → Pode expandir 10-12%
- `low` → Evitar expansão (produto já ocupa toda imagem)

**✅ Status na v2:** MANTIDO — usado pela função `buildVisualCrop()`

---

#### 20. `focusClarity` (enum)
**Para que serve:** Avalia clareza do foco no produto

**Valores:** `"low"` | `"medium"` | `"high"` | `"unknown"`

**Usado por:** QA gates + Analytics

**⚠️ Status na v2:** OVERLAP com `imageQuality`  
**💡 Decisão:** Manter por enquanto, consolidar no futuro?

---

#### 21. `visualIsolation` (enum)
**Para que serve:** Avalia o quão isolado/destacado está o produto

**Valores:** `"low"` | `"medium"` | `"high"` | `"unknown"`

**Usado por:** Intent Resolver — decisão de usar crop tight vs amplo

**Exemplos:**
- `high` → Produto em fundo branco, isolado
- `medium` → Produto destacado, mas com outros elementos
- `low` → Produto em meio a muitos outros objetos

**✅ Status na v2:** MANTIDO

---

### 📝 **Categoria 6: Metadata (1 campo)**

#### 22. `reasoningSummary` (string)
**Para que serve:** Explicação em linguagem natural da análise

**Usado por:**
- Debugging (logs)
- Analytics (tracking de qualidade)
- Futuro: Exibir ao usuário para transparência

**Exemplo:**
```
"Produto exato identificado: Coca Cola garrafa 600ml.
Fundo complexo com outras bebidas visíveis.
Qualidade da imagem é boa, mas produto ocupa apenas 35% do frame.
Recomendado: crop tight com background customizado."
```

**✅ Status na v2:** MANTIDO — útil para debug e futuras melhorias

---

## 🗑️ CAMPOS OBSOLETOS/REDUNDANTES NA V2

### ❌ 1. `hasBackground` (boolean | string)
**Razão:** REDUNDANTE com `backgroundType`  
**Substituição:**
```typescript
const hasBackground = backgroundType !== "transparent";
```

**Decisão:** REMOVER no refactor da Story 4.1

---

### ⚠️ 2. `content_type` (entrada)
**Razão:** OVERLAP com `campaignType` e `category`  
**Status:** Manter por enquanto, mas avaliar consolidação

---

### ⚠️ 3. `focusClarity` (saída)
**Razão:** OVERLAP com `imageQuality`  
**Status:** Manter por enquanto (pode ser útil para distinção futura)

---

## 🔄 FLUXO COMPLETO: Entrada → Saída → Consumo

```
┌─────────────────────────────────────────────────┐
│ 1. ENTRADA (Frontend → Workflow)               │
├─────────────────────────────────────────────────┤
│ CampaignVisualBrief                            │
│   ├─ image.source_url → imageUrl               │
│   ├─ content_type → targetLabel                │
│   ├─ product_name → productName                │
│   ├─ campaign_type → campaignType              │
│   └─ content_type → content_type               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. PROCESSAMENTO (Visual Reader)               │
├─────────────────────────────────────────────────┤
│ readVisualTarget(input)                        │
│   ├─ Chamada OpenAI GPT-4o Vision             │
│   ├─ Parse JSON response                       │
│   ├─ Validação Zod Schema                      │
│   └─ Normalização pós-modelo                   │
│       ├─ normalizeMatchConsistency()           │
│       ├─ normalizeBox()                         │
│       ├─ validateBoxValidity()                  │
│       ├─ normalizeSceneType()                   │
│       ├─ normalizeOccupancy()                   │
│       ├─ normalizePosition()                    │
│       └─ normalizeMatchedTarget()               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. SAÍDA (VisualReaderOutput)                  │
├─────────────────────────────────────────────────┤
│ ImageProfile (24 campos)                       │
│   ├─ Match: detected, matchType, confidence    │
│   ├─ Spatial: targetBox, position, occupancy   │
│   ├─ Quality: imageQuality, visibility         │
│   ├─ Background: backgroundType, noise          │
│   └─ Crop: subjectCutoff, expansionPotential   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. CONSUMO (Intent Resolver — Story 4.2)       │
├─────────────────────────────────────────────────┤
│ Decisões baseadas em ImageProfile:             │
│                                                 │
│ if (backgroundType === "transparent")          │
│   → Usar background colorido (Visual Sig)      │
│                                                 │
│ if (detected && targetBox)                     │
│   → Crop tight do produto                      │
│                                                 │
│ if (sceneType === "lifestyle_scene")           │
│   → Usar imagem inteira (sem crop)             │
│                                                 │
│ if (matchType === "category_only")             │
│   → Ajustar copy (usar matchedTarget)          │
│                                                 │
│ if (imageQuality === "poor")                   │
│   → Alertar usuário ou rejeitar                │
└─────────────────────────────────────────────────┘
```

---

## 📊 RESUMO: Criticidade dos Campos

### 🔴 CRÍTICOS (bloqueiam Story 4.2 se ausentes)
1. `detected`
2. `matchType`
3. `targetBox`
4. `sceneType`
5. `backgroundType`
6. `targetOccupancy`
7. `backgroundNoise`

### 🟡 IMPORTANTES (melhoram qualidade, mas não bloqueiam)
8. `matchedTarget`
9. `visibility`
10. `framing`
11. `subjectCutoff`
12. `safeExpansionPotential`
13. `visualIsolation`
14. `targetOrientation`

### 🟢 SECUNDÁRIOS (analytics/debug)
15. `confidence`
16. `imageQuality`
17. `focusClarity`
18. `relevantCount`
19. `ignoredElements`
20. `reasoningSummary`

### ❌ OBSOLETOS/REDUNDANTES
21. `hasBackground` (redundante com backgroundType)
22. `content_type` (entrada — overlap com campaignType)

---

## ✅ PRÓXIMOS PASSOS (Story 4.1)

1. ✅ Campos de entrada/saída mapeados
2. ⏭️ Implementar `readVisualTarget()` em `lib/visual-reader/service.ts`
3. ⏭️ Criar prompt refinado para GPT-4o Vision (VISUAL_READER_SYSTEM_PROMPT)
4. ⏭️ Implementar validação pós-modelo (normalização)
5. ⏭️ Adicionar cache (Supabase) para imagens repetidas
6. ⏭️ Criar endpoint `/api/analyze/image` para testes
7. ⏭️ Testes com 10+ fixtures de tipos variados

---

**Decisão:** Remover `hasBackground` no refactor, mas MANTER todos os outros campos (incluindo secundários) para garantir flexibilidade no Intent Resolver (Story 4.2).

**Próximo passo:** Iniciar Story 4.1 com spec completa baseada nesta análise.

---
*Análise gerada por @aiox-master — 23/04/2026*
