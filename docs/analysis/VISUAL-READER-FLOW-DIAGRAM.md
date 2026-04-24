# Visual Reader — Diagrama de Fluxo de Dados

**Data:** 23/04/2026  
**Contexto:** Visualização do pipeline completo do Motor 1

---

## 🔄 FLUXO COMPLETO END-TO-END

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Upload)                               │
├─────────────────────────────────────────────────────────────────────────┤
│  1. Lojista faz upload da imagem do produto                            │
│  2. Upload para Supabase Storage                                       │
│  3. Retorna URL pública                                                │
└─────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW (Campaign Creation)                         │
├─────────────────────────────────────────────────────────────────────────┤
│  CampaignVisualBrief {                                                  │
│    image: {                                                             │
│      source_url: "https://supabase.../coca.jpg",                       │
│      asset_role: "product",                                             │
│    },                                                                   │
│    product_name: "Coca Cola 600ml",                                    │
│    content_type: "product",                                             │
│    campaign_type: "post",                                               │
│  }                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                     MOTOR 1: VISUAL READER                              │
│                    readVisualTarget(input)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ ETAPA 1: Preparação da Entrada                               │     │
│  ├───────────────────────────────────────────────────────────────┤     │
│  │  VisualReaderInput {                                          │     │
│  │    imageUrl: "https://supabase.../coca.jpg",                 │     │
│  │    targetLabel: "refrigerante",                               │     │
│  │    productName: "Coca Cola 600ml",                            │     │
│  │    campaignType: "single_product",                            │     │
│  │  }                                                            │     │
│  │                                                               │     │
│  │  ✅ Validação Zod: VisualReaderInputSchema.safeParse()       │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                                  ↓                                       │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ ETAPA 2: Chamada OpenAI GPT-4o Vision                        │     │
│  ├───────────────────────────────────────────────────────────────┤     │
│  │  await callAI([                                               │     │
│  │    {                                                          │     │
│  │      role: "system",                                          │     │
│  │      content: VISUAL_READER_SYSTEM_PROMPT                     │     │
│  │    },                                                         │     │
│  │    {                                                          │     │
│  │      role: "user",                                            │     │
│  │      content: JSON.stringify(payload)                         │     │
│  │    }                                                          │     │
│  │  ], {                                                         │     │
│  │    model: "gpt-4o",                                           │     │
│  │    temperature: 0.2,                                          │     │
│  │    imageUrl: input.imageUrl                                   │     │
│  │  })                                                           │     │
│  │                                                               │     │
│  │  ⏱️ Latency: 1-2s (p95)                                       │     │
│  │  💰 Cost: ~$0.01/imagem                                       │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                                  ↓                                       │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ ETAPA 3: Parse e Validação                                   │     │
│  ├───────────────────────────────────────────────────────────────┤     │
│  │  const parsed = parseJsonFirstObject(raw);                   │     │
│  │  const safe = VisualReaderSchema.safeParse(parsed);          │     │
│  │                                                               │     │
│  │  if (!safe.success) {                                         │     │
│  │    return DEFAULT_VISUAL_READER_OUTPUT;                       │     │
│  │  }                                                            │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                                  ↓                                       │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ ETAPA 4: Normalização Pós-Modelo                             │     │
│  ├───────────────────────────────────────────────────────────────┤     │
│  │  validatePostModelLogic(output) {                             │     │
│  │    1️⃣ normalizeMatchConsistency()                             │     │
│  │       - Garante detected/matchType/targetBox consistentes     │     │
│  │       - none → targetBox=null                                 │     │
│  │       - exact → detected=true, targetBox obrigatória          │     │
│  │       - category_only → detected=false, targetBox obrigatória │     │
│  │                                                               │     │
│  │    2️⃣ normalizeBox()                                           │     │
│  │       - Clamp para 0-1                                        │     │
│  │       - Tamanho mínimo: 18%                                   │     │
│  │       - Expansão: +12% (respiro)                              │     │
│  │       - Reposicionamento se ultrapassar bordas                │     │
│  │                                                               │     │
│  │    3️⃣ validateBoxValidity()                                    │     │
│  │       - Rejeita boxes minúsculas (<1.5% área)                 │     │
│  │       - Rejeita boxes 1:1 em cenas de produto                 │     │
│  │                                                               │     │
│  │    4️⃣ normalizeSceneType()                                     │     │
│  │       - relevantCount > 1 → multiple_products                 │     │
│  │       - ignoredElements.length > 0 → multiple_products        │     │
│  │                                                               │     │
│  │    5️⃣ normalizeOccupancy()                                     │     │
│  │       - Recalcula baseado na área do targetBox                │     │
│  │       - full só em full_scene ou área > 75%                   │     │
│  │                                                               │     │
│  │    6️⃣ normalizePosition()                                      │     │
│  │       - Calcula left/center/right do centerX                  │     │
│  │       - centerX < 0.33 → left                                 │     │
│  │       - centerX > 0.66 → right                                │     │
│  │       - Senão → center                                        │     │
│  │                                                               │     │
│  │    7️⃣ normalizeMatchedTarget()                                │     │
│  │       - matchType=none → matchedTarget=null                   │     │
│  │       - category_only sem target → "item semelhante"          │     │
│  │  }                                                            │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        OUTPUT (ImageProfile)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  {                                                                      │
│    detected: true,                                                      │
│    matchType: "exact",                                                  │
│    matchedTarget: "Coca Cola garrafa 600ml",                           │
│    confidence: "high",                                                  │
│    sceneType: "single_product",                                         │
│    relevantCount: 1,                                                    │
│                                                                          │
│    targetBox: {                                                         │
│      x: 0.25,                                                           │
│      y: 0.15,                                                           │
│      width: 0.5,                                                        │
│      height: 0.7,                                                       │
│    },                                                                   │
│    targetOrientation: "vertical",                                       │
│    targetPosition: "center",                                            │
│    targetOccupancy: "medium",                                           │
│    ignoredElements: [],                                                 │
│                                                                          │
│    imageQuality: "good",                                                │
│    visibility: "clear",                                                 │
│    framing: "good",                                                     │
│    backgroundNoise: "low",                                              │
│                                                                          │
│    backgroundType: "transparent",                                       │
│                                                                          │
│    subjectCutoff: "none",                                               │
│    safeExpansionPotential: "high",                                      │
│    focusClarity: "high",                                                │
│    visualIsolation: "high",                                             │
│                                                                          │
│    reasoningSummary: "Produto exato identificado: Coca Cola 600ml..."  │
│  }                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                  MOTOR 2: INTENT RESOLVER (Story 4.2)                   │
├─────────────────────────────────────────────────────────────────────────┤
│  Decisões baseadas em ImageProfile:                                    │
│                                                                          │
│  if (backgroundType === "transparent") {                                │
│    direction = "use-colored-background";                                │
│  }                                                                      │
│                                                                          │
│  if (detected && targetBox) {                                           │
│    direction = "crop-tight-product";                                    │
│  }                                                                      │
│                                                                          │
│  if (sceneType === "lifestyle_scene") {                                 │
│    direction = "use-full-image";                                        │
│  }                                                                      │
│                                                                          │
│  → Output: CreativeDirection                                            │
└─────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────────┐
│               MOTOR 3: VISUAL COMPOSER (Story 4.3)                      │
├─────────────────────────────────────────────────────────────────────────┤
│  Gera 4-6 variações de composição                                      │
│  → Output: CompositionVariants                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                  MOTOR 4: RENDERER (Story 4.4)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  Compõe arte final programaticamente                                   │
│  → Output: PNG 1080x1080                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔀 CASOS DE USO PRINCIPAIS

### Caso 1: PNG Transparente (Ideal)

```
Input:
  imageUrl: coca-transparent.png
  targetLabel: "refrigerante"
  productName: "Coca Cola 600ml"

↓ GPT-4o Vision ↓

Output:
  detected: true
  matchType: "exact"
  backgroundType: "transparent"  ← CRÍTICO
  targetBox: { x: 0.2, y: 0.1, width: 0.6, height: 0.8 }
  sceneType: "single_product"

↓ Intent Resolver ↓

Decision:
  ✅ Usar background colorido (Visual Signature)
  ✅ Crop tight do produto
  ✅ Alta confiança na composição
```

---

### Caso 2: Fundo Complexo (Lifestyle)

```
Input:
  imageUrl: pessoa-bebendo-coca.jpg
  targetLabel: "refrigerante"
  productName: "Coca Cola 600ml"

↓ GPT-4o Vision ↓

Output:
  detected: false               ← Produto em contexto
  matchType: "category_only"
  backgroundType: "complex"     ← CRÍTICO
  targetBox: { x: 0.4, y: 0.3, width: 0.3, height: 0.5 }
  sceneType: "lifestyle_scene"
  backgroundNoise: "high"

↓ Intent Resolver ↓

Decision:
  ✅ Usar imagem inteira (sem crop)
  ✅ Adicionar overlay de texto
  ⚠️ Validar contraste (Story 4.5)
```

---

### Caso 3: Múltiplos Produtos

```
Input:
  imageUrl: 3-cervejas.jpg
  targetLabel: "cerveja"
  productName: "Heineken 350ml"

↓ GPT-4o Vision ↓

Output:
  detected: true
  matchType: "exact"
  backgroundType: "solid"
  targetBox: { x: 0.35, y: 0.2, width: 0.3, height: 0.6 }  ← Centro
  sceneType: "multiple_products"  ← CRÍTICO
  relevantCount: 3
  ignoredElements: ["Budweiser 350ml", "Stella Artois 330ml"]

↓ Intent Resolver ↓

Decision:
  ✅ Crop amplo (incluir contexto)
  ⚠️ Destacar Heineken com overlay
  ⚠️ Considerar blur nos produtos ignorados
```

---

### Caso 4: Sem Match (Fallback)

```
Input:
  imageUrl: hamburguer.jpg
  targetLabel: "cerveja"
  productName: "Heineken 350ml"

↓ GPT-4o Vision ↓

Output:
  detected: false
  matchType: "none"            ← CRÍTICO
  targetBox: null
  sceneType: "unclear"
  matchedTarget: null

↓ Intent Resolver ↓

Decision:
  ❌ Rejeitar geração (produto não encontrado)
  💡 Sugerir ao usuário: "Imagem não corresponde ao produto"
```

---

## ⚡ OTIMIZAÇÕES DE PERFORMANCE

### Cache de Análises (Story 4.1)

```
┌────────────────────────────────────────┐
│ readVisualTarget(input)                │
├────────────────────────────────────────┤
│                                        │
│  1️⃣ Hash imageUrl (SHA-256)            │
│     const key = sha256(imageUrl);      │
│                                        │
│  2️⃣ Buscar no cache (Supabase/Redis)   │
│     const cached = await cache.get(key)│
│                                        │
│  3️⃣ Se encontrado → retornar           │
│     if (cached) return cached;         │
│     ⏱️ Latency: <500ms                 │
│                                        │
│  4️⃣ Se não → chamar GPT-4o Vision      │
│     const result = await callAI(...);  │
│     ⏱️ Latency: 1-2s                   │
│                                        │
│  5️⃣ Salvar no cache                    │
│     await cache.set(key, result, 30d); │
│                                        │
└────────────────────────────────────────┘
```

**Taxa de cache hit estimada:** 60-70%  
**Economia de custo:** ~$0.006/imagem repetida  
**Melhoria de latência:** 75% (2s → 500ms)

---

## 🛡️ ERROR HANDLING

```
try {
  const raw = await callAI(...);
  const parsed = parseJsonFirstObject(raw);
  const safe = VisualReaderSchema.safeParse(parsed);

  if (!safe.success) {
    console.error("[VisualReader] Schema validation failed", {
      issues: safe.error.issues,
      parsed,
    });
    return DEFAULT_VISUAL_READER_OUTPUT;  ← Fallback graceful
  }

  return validatePostModelLogic(safe.data);

} catch (error) {
  console.error("[VisualReader] AI call failed", error);
  return DEFAULT_VISUAL_READER_OUTPUT;  ← Fallback graceful
}
```

**Princípio:** NUNCA bloquear pipeline. Sempre retornar output válido (mesmo que default).

---

## 📊 MÉTRICAS E OBSERVABILIDADE

### Eventos Logados

```typescript
// Início da análise
log.info("visual-reader.start", {
  imageUrl: input.imageUrl,
  targetLabel: input.targetLabel,
  productName: input.productName,
});

// Cache hit
log.info("visual-reader.cache.hit", {
  key: cacheKey,
  latency_ms: 245,
});

// Cache miss
log.info("visual-reader.cache.miss", {
  key: cacheKey,
  reason: "not-found",
});

// API call
log.info("visual-reader.api.call", {
  model: "gpt-4o",
  latency_ms: 1852,
  cost_usd: 0.012,
});

// Normalização
log.warn("visual-reader.normalize.inconsistency", {
  field: "targetBox",
  before: null,
  after: { x: 0.2, y: 0.1, width: 0.6, height: 0.8 },
  reason: "category_only must have targetBox",
});

// Resultado
log.info("visual-reader.complete", {
  detected: true,
  matchType: "exact",
  sceneType: "single_product",
  backgroundType: "transparent",
  latency_ms: 1895,
});
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Story 4.1:** Implementar `readVisualTarget()` com todas as validações
2. ⏭️ **Story 4.2:** Intent Resolver consome `ImageProfile`
3. ⏭️ **Story 4.3:** Visual Composer gera variações
4. ⏭️ **Story 4.4:** Renderer compõe arte final

---

*Diagrama de fluxo completo — @aiox-master, 23/04/2026*
