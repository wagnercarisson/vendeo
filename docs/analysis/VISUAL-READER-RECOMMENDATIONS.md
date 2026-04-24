# Visual Reader — Recomendações para Story 4.1

**Data:** 23/04/2026  
**Contexto:** Refinamento do contrato antes de iniciar implementação  
**Decisões:** @aiox-master + Product Owner

---

## 🎯 Objetivo

Simplificar e fortalecer o contrato do Visual Reader antes de iniciar Story 4.1, removendo redundâncias e esclarecendo responsabilidades.

---

## ❌ REMOÇÕES RECOMENDADAS

### 1. Remover `hasBackground` da saída

**Razão:** Totalmente redundante com `backgroundType`

**Impacto:** ZERO — nenhum consumidor usa este campo

**Substituição:**
```typescript
// ANTES
const hasBackground = output.hasBackground === true || output.hasBackground === "true";

// DEPOIS
const hasBackground = output.backgroundType !== "transparent";
```

**Decisão:** ✅ REMOVER na Story 4.1

---

### 2. Avaliar remoção de `content_type` da entrada

**Razão:** Overlap com `campaignType` e `category`

**Impacto:** BAIXO — usado apenas como contexto adicional no prompt

**Opções:**
1. **Remover** e usar apenas `campaignType`
2. **Consolidar** com `category`
3. **Manter** mas documentar como opcional/legado

**Decisão:** ⏭️ MANTER por enquanto, reavaliar na Story 4.2 (Intent Resolver)

**Razão:** Pode ser útil para Weekly Plan (Story 4.6) — evitar breaking changes prematuras

---

## ⚠️ CONSOLIDAÇÕES FUTURAS (não para Story 4.1)

### 3. Consolidar `focusClarity` com `imageQuality`?

**Overlap:**
- `imageQuality=poor` ≈ `focusClarity=low`
- `imageQuality=good` ≈ `focusClarity=high`

**Argumentos para manter separado:**
- `imageQuality` → qualidade técnica (resolução, iluminação)
- `focusClarity` → clareza do foco no produto (pode ter imagem boa, mas produto desfocado)

**Decisão:** ⏭️ MANTER separado na Story 4.1, reavaliar após testes reais

---

## ✅ MELHORIAS RECOMENDADAS

### 4. Simplificar type de `hasBackground` antes de remover

**Problema atual:**
```typescript
hasBackground: z.union([
  z.boolean(),
  z.literal("true"),
  z.literal("false"),
  z.literal("unknown"),
])
```

**Antes de remover completamente, normalizar no código:**
```typescript
// No parser, converter strings para boolean
if (typeof output.hasBackground === "string") {
  output.hasBackground = output.hasBackground === "true" ? true : false;
}
```

**Decisão:** ✅ Implementar na Story 4.1 antes de remover campo

---

### 5. Adicionar validação cruzada `backgroundType` ↔ `backgroundNoise`

**Regra proposta:**
```typescript
if (output.backgroundType === "transparent") {
  output.backgroundNoise = "low";
}

if (output.backgroundType === "complex") {
  if (output.backgroundNoise === "low") {
    output.backgroundNoise = "medium"; // inconsistência corrigida
  }
}
```

**Decisão:** ✅ Adicionar na normalização pós-modelo (Story 4.1)

---

### 6. Adicionar validação `relevantCount` ↔ `ignoredElements`

**Regra proposta:**
```typescript
if (output.ignoredElements.length > 0 && output.relevantCount === 0) {
  output.relevantCount = output.ignoredElements.length;
}

if (output.relevantCount > 1 && output.ignoredElements.length === 0) {
  // Log warning (provável inconsistência do modelo)
  console.warn("[VisualReader] relevantCount > 1 mas ignoredElements vazio");
}
```

**Decisão:** ✅ Adicionar na normalização pós-modelo (Story 4.1)

---

### 7. Fortalecer validação de `targetBox` em matchType="category_only"

**Problema atual:** Schema valida, mas modelo às vezes retorna box null

**Solução:**
```typescript
function normalizeMatchConsistency(output: VisualReaderResult): VisualReaderResult {
  // ... código existente ...

  // NOVO: category_only sem box = downgrade para none
  if (output.matchType === "category_only" && output.targetBox === null) {
    console.warn("[VisualReader] category_only sem targetBox → forçar matchType=none");
    output.matchType = "none";
    output.detected = false;
    output.matchedTarget = null;
  }

  return output;
}
```

**Decisão:** ✅ Adicionar na Story 4.1

---

## 🧪 TESTES PRIORITÁRIOS

### Fixtures obrigatórias (Story 4.1):

1. **PNG transparente (produto isolado)**
   - Coca Cola 600ml PNG sem fundo
   - Esperado: `backgroundType=transparent`, `detected=true`, `matchType=exact`

2. **Produto único em fundo sólido**
   - Heineken em fundo branco
   - Esperado: `sceneType=single_product`, `backgroundType=solid`, `backgroundNoise=low`

3. **Múltiplos produtos**
   - 3 cervejas lado a lado
   - Esperado: `sceneType=multiple_products`, `relevantCount>=2`, `ignoredElements` não vazio

4. **Lifestyle (contexto de uso)**
   - Pessoa segurando cerveja
   - Esperado: `sceneType=lifestyle_scene`, `backgroundType=complex`

5. **Match por categoria (marca diferente)**
   - Input: "Coca Cola 600ml" → Imagem: Pepsi 600ml
   - Esperado: `matchType=category_only`, `detected=false`, `matchedTarget="Pepsi 600ml"`

6. **Sem match**
   - Input: "cerveja" → Imagem: hambúrguer
   - Esperado: `matchType=none`, `targetBox=null`

7. **Produto cortado nas bordas**
   - Imagem com produto parcialmente visível
   - Esperado: `subjectCutoff=moderate/severe`, `visibility=partial`

8. **Imagem de baixa qualidade**
   - Foto desfocada/escura
   - Esperado: `imageQuality=poor`, `focusClarity=low`

9. **Full scene (loja/ambiente)**
   - Interior de loja com produtos na prateleira
   - Esperado: `sceneType=full_scene`, `targetBox` null ou 1:1

10. **Produto + combo (múltiplos no productName)**
    - Input: `productName="Coca + Pão de Hambúrguer"`
    - Imagem: Coca e pão juntos
    - Esperado: `sceneType=multiple_products`, `relevantCount=2`

---

## 📏 MÉTRICAS DE SUCESSO (Story 4.1)

| Métrica | Target | Como Medir |
|---------|--------|------------|
| **Acurácia de detecção** | >90% | `detected=true` quando produto exato presente |
| **Acurácia de backgroundType** | >95% | Classificação correta de transparent/solid/complex |
| **Acurácia de targetBox** | >85% | Box contém produto com margem adequada |
| **Latência (sem cache)** | <2s p95 | Tempo de resposta da API OpenAI |
| **Latência (com cache)** | <500ms p95 | Lookup no Supabase/Redis |
| **Taxa de cache hit** | >60% | % de análises servidas do cache |
| **Taxa de fallback** | <5% | % de retornos com DEFAULT_VISUAL_READER_OUTPUT |

---

## 🔒 VALIDAÇÕES OBRIGATÓRIAS PRÉ-RELEASE

### Checklist de qualidade:

- [ ] ✅ Todos os 10 fixtures testados e aprovados
- [ ] ✅ Schema Zod validando 100% dos outputs do modelo
- [ ] ✅ Normalização pós-modelo corrigindo inconsistências
- [ ] ✅ Cache implementado (Supabase ou Redis)
- [ ] ✅ Latência p95 < 2s (sem cache)
- [ ] ✅ Latência p95 < 500ms (com cache)
- [ ] ✅ Logs estruturados para debug
- [ ] ✅ Error handling robusto (fallback graceful)
- [ ] ✅ Endpoint `/api/analyze/image` funcional
- [ ] ✅ Documentação atualizada

---

## 🚀 ROADMAP DE MELHORIAS FUTURAS (pós-Story 4.1)

### Story 4.1.1 (opcional): Cache Optimization
- Implementar cache distribuído (Redis/Upstash) se Supabase não atingir <500ms p95
- TTL: 30 dias (análises raramente mudam)

### Story 4.1.2 (opcional): Multi-Model Fallback
- Se GPT-4o falhar, tentar Claude 3 Opus (vision)
- Redundância para alta disponibilidade

### Story 4.1.3 (opcional): Progressive Enhancement
- Retornar análise básica rapidamente (1s)
- Enriquecer com análise detalhada em background (async)

### Epic 5 (futuro): Visual Intelligence v2
- Detecção automática de defeitos (produtos amassados, vencidos)
- Sugestões de melhoria da foto (ângulo, iluminação)
- Análise de sentimento visual (warmth, energy, trust)

---

## 📋 CONTRATO FINAL SIMPLIFICADO

### Entrada (5 campos — removido `content_type` como deprecado)

```typescript
{
  imageUrl: string,        // URL pública da imagem
  targetLabel: string,     // Categoria genérica (ex: "cerveja")
  productName?: string,    // Nome específico (ex: "Coca 600ml")
  category?: string,       // Categoria (opcional, legado)
  campaignType?: enum,     // single_product | multiple_products | info
}
```

### Saída (23 campos — removido `hasBackground`)

```typescript
{
  // Match (6)
  detected: boolean,
  matchType: "exact" | "category_only" | "none",
  matchedTarget: string | null,
  confidence: "low" | "medium" | "high",
  sceneType: "single_product" | "multiple_products" | "lifestyle_scene" | "full_scene" | "unclear",
  relevantCount: number,

  // Spatial (5)
  targetBox: { x, y, width, height } | null,
  targetOrientation: "vertical" | "horizontal" | "square" | "mixed" | "unknown",
  targetPosition: "left" | "center" | "right" | "top" | "bottom" | "mixed" | "unknown",
  targetOccupancy: "low" | "medium" | "high" | "full",
  ignoredElements: string[],

  // Quality (4)
  imageQuality: "good" | "acceptable" | "poor" | "unknown",
  visibility: "clear" | "partial" | "obstructed" | "unknown",
  framing: "good" | "tight" | "distant" | "unknown",
  backgroundNoise: "low" | "medium" | "high" | "unknown",

  // Background (1)
  backgroundType: "transparent" | "solid" | "simple" | "complex" | "unknown",

  // Crop Potential (4)
  subjectCutoff: "none" | "light" | "moderate" | "severe" | "unknown",
  safeExpansionPotential: "low" | "medium" | "high" | "unknown",
  focusClarity: "low" | "medium" | "high" | "unknown",
  visualIsolation: "low" | "medium" | "high" | "unknown",

  // Metadata (1)
  reasoningSummary: string,
}
```

---

## ✅ DECISÃO FINAL

**Para Story 4.1:**

1. ✅ **REMOVER** `hasBackground` (saída)
2. ⏭️ **MANTER** `content_type` (entrada) — reavaliar na Story 4.2
3. ✅ **ADICIONAR** validação cruzada `backgroundType` ↔ `backgroundNoise`
4. ✅ **ADICIONAR** validação `relevantCount` ↔ `ignoredElements`
5. ✅ **FORTALECER** validação `matchType=category_only` → `targetBox` obrigatória
6. ✅ **IMPLEMENTAR** 10 fixtures de teste obrigatórias
7. ✅ **GARANTIR** latência <2s p95 (sem cache), <500ms p95 (com cache)

**Aprovação para iniciar Story 4.1:** ✅ GO

---

*Documento de decisões técnicas — @aiox-master + Product Owner*
