# Integração do Marketing Squad no Vendeo — Arquitetura Técnica
**Data:** 28 de Abril de 2026  
**Status:** 🏗️ Plano de Integração Detalhado  
**Autor:** @analyst (Alex) — Synkra AIOX  

---

## 📍 VISÃO GERAL DA INTEGRAÇÃO

O Marketing Squad (5 agentes) entra no fluxo de geração de campanhas em **5 pontos críticos**:

```
┌─────────────────────────────────────────────────────────────┐
│ LOJISTA ENTRA DADOS: Produto + Preço + Imagem              │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌─────────────────────────────────────┐
        │ PONTO 1: CONTEXTO COMERCIAL           │
        │ @commerce-strategist alimenta        │
        │ "Que dia é hoje? Que clima?         │
        │  Que oportunidade comercial?"       │
        └─────────────────────────────────────┘
                            ↓
        ┌─────────────────────────────────────┐
        │ PONTO 2: PROMPT OTIMIZADO           │
        │ @prompt-eng seleciona                │
        │ "Qual prompt usar pra este caso?" │
        └─────────────────────────────────────┘
                            ↓
        [IA GERA COPY]
                            ↓
        ┌─────────────────────────────────────┐
        │ PONTO 3: VALIDAÇÃO DE COPY           │
        │ @content-copy valida                 │
        │ "Esse CTA converte? Tone certo?"   │
        └─────────────────────────────────────┘
                            ↓
        ┌─────────────────────────────────────┐
        │ PONTO 4: LAYOUT & IDENTIDADE         │
        │ @brand-designer cria DNA visual      │
        │ "Cliente reconhece loja em <1s?"     │
        └─────────────────────────────────────┘
                            ↓
        [MOTOR VISUAL GERA ARTE (3 variações)]
                            ↓
        ┌─────────────────────────────────────┐
        │ PONTO 5: VALIDAÇÃO UX                │
        │ @ux-design verifica                  │
        │ "Está intuitivo e visual OK?"       │
        └─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ LOJISTA VÊ 3 OPÇÕES E ESCOLHE → PUBLICA                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 PONTO 1: CONTEXTO COMERCIAL (@commerce-strategist)

### Função: Enriquecer Request com Contexto

**Arquivo Entrada:**
- `app/api/generate/campaign/route.ts`

**Arquivo de Dados:**
- `lib/data/commercial-opportunities.ts` (novo)
- `lib/domain/campaigns/contracts.ts` (estender)

**O que adicionar:**

```typescript
// lib/data/commercial-opportunities.ts (NEW)
export interface CommercialContext {
  weekday: number;  // 1-7
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  weather: "quente" | "frio" | "normal" | "chuva";
  month: number;  // 1-12
  daysSinceLastAbastecimento?: number;
  opportunity: "happy_hour" | "happy_hour_prep" | "fim_de_semana" | 
               "abastecimento_novo" | "urgent_clearance" | "sazonal" | "normal";
  recommendedTone: "urgencia_alta" | "urgencia_leve" | "confianca" | "premium";
}

// Mapear contexto baseado em regras de adegas
export function resolveCommercialContext(date: Date, store: Store): CommercialContext {
  const weekday = date.getDay();
  const hour = date.getHours();
  const weather = await getWeatherForStore(store.city);  // Integrar weather API
  const month = date.getMonth() + 1;

  // Regra: Sexta 17h-22h = pico de happy hour
  if (weekday === 5 && hour >= 17 && hour <= 22) {
    return {
      weekday: 5,
      timeOfDay: "evening",
      weather,
      month,
      opportunity: "happy_hour",
      recommendedTone: "urgencia_alta"
    };
  }

  // Regra: Segunda 09h-12h = chegada de fornecedor
  if (weekday === 1 && hour >= 9 && hour <= 12) {
    return {
      weekday: 1,
      timeOfDay: "morning",
      weather,
      month,
      opportunity: "abastecimento_novo",
      recommendedTone: "confianca"
    };
  }

  // ... mais regras

  return {
    weekday,
    timeOfDay: getTOD(hour),
    weather,
    month,
    opportunity: "normal",
    recommendedTone: "confianca"
  };
}
```

**Integração no Endpoint:**

```typescript
// app/api/generate/campaign/route.ts (MODIFICADO)
export async function POST(req: Request) {
  const { storeId, product } = await validateRequest(req);

  // NEW: Resolver contexto comercial
  const store = await fetchStore(storeId);
  const commercialContext = await resolveCommercialContext(new Date(), store);

  // Passar para IA
  const campaignData = {
    ...product,
    commercialContext,  // ← NOVO
    storeVisualSignature: store.visual_signature
  };

  // Gerar campanha com contexto
  const result = await generateCampaign(campaignData);

  return NextResponse.json(result);
}
```

**Responsabilidade @commerce-strategist:**
- [ ] Definir as 15-20 regras de contexto comercial (oportunidades)
- [ ] Validar regras com 10+ adegas beta
- [ ] Documentar "playbook de adegas" (quando fazer qual promoção)
- [ ] Mapear sazonalidade brasil (Natal, Black Friday, etc)

---

## 🎯 PONTO 2: PROMPT OTIMIZADO (@prompt-eng)

### Função: Selecionar Prompt Correto e Otimizá-lo

**Arquivo:**
- `lib/ai/prompts/` (estrutura existente, expandir)
- `lib/ai/prompts/vendors/` (novo diretório)

**Estrutura de Prompts:**

```typescript
// lib/ai/prompts/vendors/adega/base.ts (NEW)
export const PromptLibrary = {
  // Template base para todas as adegas
  system: `
    Você é estrategista de marketing para adegas brasileiras.
    Seu objetivo: Gerar campanhas que aumentam visitas.
    Tone: Confiável, descontraído, "do bairro".
    Evite: Jargão de agência, termos genéricos.
  `,

  // Variações por contexto comercial
  contexts: {
    happy_hour: {
      system_addition: `
        CONTEXTO: Happy Hour (pico de vendas)
        TONE: Urgência leve + diversão
        FOCUS: Combos, bebida fria, socialização
      `,
      temperature: 0.8,  // Mais criativo
      examples: [
        {
          input: "Cerveja Brahma 350ml",
          output: "Tá quente! Brahma gelada já tá esperando. Chama a turma!"
        }
      ]
    },
    abastecimento_novo: {
      system_addition: `
        CONTEXTO: Chegou fornecimento novo (Segunda)
        TONE: Confiança + novidade
        FOCUS: "Novidade que chegou", "Voltou!"
      `,
      temperature: 0.5,  // Mais preciso
      examples: [
        {
          input: "Refrigerante Guaraná X marca importada",
          output: "Chegou novo! Guaraná X importado que você pediu. Vem conferir!"
        }
      ]
    },
    urgent_clearance: {
      system_addition: `
        CONTEXTO: Promoção urgente (último estoque)
        TONE: Urgência alta, sem desespero
        FOCUS: Escassez, tempo limitado
      `,
      temperature: 0.9,  // Criativo e urgente
      examples: [
        {
          input: "Vinho D'Avila reserva com validade próxima",
          output: "ÚLTIMA CHANCE! Vinho D'Avila reserva por R$89. Quando acabar..."
        }
      ]
    }
  },

  // Variações por tipo de produto
  product_types: {
    cerveja: {
      cta_pool: ["Chama a turma", "Vem gelada", "Sai pro chopp"],
      tone_tips: "Informal, social, celebratório"
    },
    refrigerante: {
      cta_pool: ["Tá na geladeira", "Vem provar", "Leva pra casa"],
      tone_tips: "Familiar, confortável, prático"
    },
    vinho: {
      cta_pool: ["Descobre essa jóia", "Tá de bom vinho?", "Prova essa"],
      tone_tips: "Premium mas acessível, exclusividade sem elitismo"
    }
  }
}

// Função para selecionar prompt otimizado
export function selectOptimalPrompt(
  product: Product,
  context: CommercialContext,
  store: Store
): string {
  let prompt = PromptLibrary.system;

  // 1. Adicionar contexto comercial
  const contextPrompt = PromptLibrary.contexts[context.opportunity];
  if (contextPrompt) {
    prompt += "\n" + contextPrompt.system_addition;
  }

  // 2. Adicionar dicas de tipo de produto
  const productPrompt = PromptLibrary.product_types[product.category];
  if (productPrompt) {
    prompt += "\n" + `CTA POOL: ${productPrompt.cta_pool.join(", ")}`;
    prompt += "\n" + `TONE: ${productPrompt.tone_tips}`;
  }

  // 3. Adicionar exemplos similares
  const examples = findSimilarCampaignsInHistory(product, store);
  if (examples.length > 0) {
    prompt += "\n\nEXEMPLOS DE SUCESSO ANTERIOR (mesma loja):";
    examples.forEach(ex => {
      prompt += `\n- "${ex.copy}" (CTA: ${ex.cta})`;
    });
  }

  return prompt;
}
```

**Responsabilidade @prompt-eng:**
- [ ] Criar 10+ variações de prompt (por contexto x tipo de produto)
- [ ] Testar cada variação com 50+ campanhas
- [ ] Calibrar temperature (criatividade vs precisão)
- [ ] Manter histórico de "prompts que funcionam"
- [ ] Melhorar prompts baseado em feedback @content-copy

---

## ✍️ PONTO 3: VALIDAÇÃO DE COPY (@content-copy)

### Função: Validar e Melhorar Copy Gerado

**Arquivo:**
- `lib/domain/campaigns/copy-validator.ts` (novo)
- `lib/domain/campaigns/schemas.ts` (estender)

**Implementação:**

```typescript
// lib/domain/campaigns/copy-validator.ts (NEW)
import { z } from "zod";

export const CopyValidationSchema = z.object({
  headline: z.string()
    .min(8, "Headline muito curta")
    .max(60, "Headline muito longa")
    .refine(
      (h) => !GENERIC_TERMS.some(t => h.toLowerCase().includes(t)),
      { message: "Headline tem jargão genérico de agência" }
    ),

  body: z.string()
    .min(20, "Body muito curta")
    .max(150, "Body muito longa")
    .refine(
      (b) => hasActionVerb(b),
      { message: "Body precisa de verbo de ação" }
    ),

  cta: z.enum([
    "Chama a turma",
    "Vem conferir",
    "Sai já",
    "Tá esperando aí?",
    "Vem gelada",
    "Aproveita agora",
    "Leva pra casa",
    "Não perde",
    "Manda bala",
    // ... mais options
  ])
});

const GENERIC_TERMS = [
  "brand awareness",
  "maximize your reach",
  "engage your audience",
  "synergy",
  "leverage"
];

function hasActionVerb(text: string): boolean {
  const ACTION_VERBS = ["vem", "aproveita", "leva", "chama", "pede", "testa"];
  return ACTION_VERBS.some(v => text.toLowerCase().includes(v));
}

// Função para validar e sugerir melhoria
export async function validateAndOptimizeCopy(
  copy: any,
  context: CommercialContext,
  productName: string
): Promise<{
  valid: boolean;
  validationErrors?: string[];
  suggestions?: string[];
  optimized?: typeof copy;
}> {
  // 1. Validação estrutural
  const validation = CopyValidationSchema.safeParse(copy);
  if (!validation.success) {
    // Validação falhou
    const errors = validation.error.flatten().fieldErrors;
    const suggestions = generateSuggestions(errors, context, productName);

    return {
      valid: false,
      validationErrors: Object.values(errors).flat(),
      suggestions
    };
  }

  // 2. Validação semântica (IA)
  const semanticValidation = await validateCopySemantics(
    copy,
    context,
    productName
  );

  if (!semanticValidation.isValid) {
    const optimized = await optimizeCopyWithAI(
      copy,
      context,
      productName
    );

    return {
      valid: false,
      suggestions: semanticValidation.suggestions,
      optimized
    };
  }

  return { valid: true };
}

function generateSuggestions(
  errors: Record<string, string[]>,
  context: CommercialContext,
  productName: string
): string[] {
  const suggestions = [];

  if (errors.headline) {
    suggestions.push(
      `Headline: Tente "Tá aqui! ${productName}" ou "Chegou ${productName}!"`
    );
  }

  if (errors.body) {
    suggestions.push(
      `Body: Adicione urgência/ação. Ex: "Só temos ${productName} em promoção hoje"`
    );
  }

  if (errors.cta) {
    const context_cta = {
      happy_hour: ["Chama a turma", "Vem gelada"],
      abastecimento_novo: ["Vem conferir", "Tá esperando aí?"],
      urgent_clearance: ["Sai já", "Não perde"]
    };
    const suggested = context_cta[context.opportunity] || [];
    suggestions.push(`CTA: Tente "${suggested[0] || "Chama"}" ou "${suggested[1] || "Vem"}"`);
  }

  return suggestions;
}

async function validateCopySemantics(
  copy: any,
  context: CommercialContext,
  productName: string
): Promise<{
  isValid: boolean;
  suggestions: string[];
}> {
  // Usar IA para validação semântica
  // (Exemplo: "Esse CTA faz sentido pro contexto?")
  const prompt = `
    Valide este copy pra adegas:
    Headline: "${copy.headline}"
    Body: "${copy.body}"
    CTA: "${copy.cta}"
    Contexto: ${context.opportunity}
    Produto: ${productName}

    Responda apenas JSON:
    {
      "is_valid": true/false,
      "issues": ["..."],
      "suggestions": ["..."]
    }
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  const result = JSON.parse(response.choices[0].message.content);
  return {
    isValid: result.is_valid,
    suggestions: result.suggestions || []
  };
}
```

**Responsabilidade @content-copy:**
- [ ] Definir GENERIC_TERMS que nunca podem aparecer
- [ ] Definir ACTION_VERBS que são obrigatórios
- [ ] Criar pool de 30+ CTAs testados
- [ ] Validar copy com 100+ exemplos reais
- [ ] Feedbackear sugestões @prompt-eng

---

## 🎨 PONTO 4: IDENTIDADE VISUAL (@brand-designer)

### Função: Criar DNA Visual Único e Gerar Variações com Reconhecimento Instantâneo

**Arquivo:**
- `lib/domain/stores/visual-signature.ts` (novo)
- `lib/graphics/composer/brand-designer.ts` (novo — renomeado)

**Implementação:**

```typescript
// lib/domain/stores/visual-signature.ts (NEW)
export interface VisualSignature {
  storeId: string;
  // Cores
  colors: {
    primary: string;      // Hex cor principal
    secondary: string;    // Hex cor secundária
    accent: string;       // Hex cor de destaque
  };
  // Tipografia
  typography: {
    headline: "Poppins" | "Inter" | "Montserrat" | string;
    body: "Inter" | "Roboto" | "Open Sans" | string;
    weight_emphasis: "600" | "700" | "900";
  };
  // Logo
  logo: {
    url: string;
    placement: "top_left" | "top_right" | "bottom_right" | "bottom_left";
    opacity: number;  // 0-1
    scale: "small" | "medium" | "large";
  };
  // Estilo visual
  visual_style: "modern" | "classic" | "playful" | "premium";
  // Preferências de composição
  preferences: {
    badge_style: "rectangular" | "circular" | "cloud" | "star";
    layout_preference: "centered" | "left" | "right";
    spacing: "tight" | "normal" | "spacious";
  };
}

// Função para aplicar Visual Signature
export function applyVisualSignatureToLayout(
  baseLayout: DesignLayout,
  signature: VisualSignature
): DesignLayout {
  // 1. Aplicar cores
  baseLayout.primary_color = signature.colors.primary;
  baseLayout.secondary_color = signature.colors.secondary;
  baseLayout.accent_color = signature.colors.accent;

  // 2. Aplicar tipografia
  baseLayout.typography = signature.typography;

  // 3. Posicionar logo
  const logoPosition = calculateLogoPosition(
    baseLayout.canvas_width,
    baseLayout.canvas_height,
    signature.logo.placement,
    signature.logo.scale
  );
  baseLayout.logo = {
    url: signature.logo.url,
    x: logoPosition.x,
    y: logoPosition.y,
    opacity: signature.logo.opacity
  };

  // 4. Aplicar estilo visual
  baseLayout.visual_style = signature.visual_style;

  // 5. Aplicar preferências
  baseLayout.badge_style = signature.preferences.badge_style;

  return baseLayout;
}

// Função para gerar 3 variações com mesma identidade
export function generateVariationsWithSignature(
  product: Product,
  signature: VisualSignature,
  context: CommercialContext
): DesignLayout[] {
  const variations = [];

  // VARIAÇÃO 1: Layout Clássico (produto centrado)
  variations.push(
    applyVisualSignatureToLayout(
      {
        layout_type: "centered",
        product_position: "center",
        price_position: "bottom",
        badge_position: "bottom_right",
        spacing: "normal"
      },
      signature
    )
  );

  // VARIAÇÃO 2: Layout Urgência (produto menor, preço grande)
  variations.push(
    applyVisualSignatureToLayout(
      {
        layout_type: "urgency",
        product_position: "top_center",
        price_position: "large_center",
        badge_position: "center",
        spacing: "tight"
      },
      signature
    )
  );

  // VARIAÇÃO 3: Layout Premium (espaço negativo)
  variations.push(
    applyVisualSignatureToLayout(
      {
        layout_type: "premium",
        product_position: "right",
        price_position: "subtle_bottom",
        badge_position: "discreto",
        spacing: "spacious"
      },
      signature
    )
  );

  return variations;
}
```

**Responsabilidade @brand-designer:**
- [ ] Criar DNA visual único que garante reconhecimento instantâneo (<1s)
- [ ] Distinguir visualmente cada loja de seus competidores
- [ ] Gerar sensação de pertencimento ("cara da minha loja")
- [ ] Definir Visual Signature template para onboarding
- [ ] Testar 5+ variações de layouts com 50+ lojistas
- [ ] Validar que logo não ofusca produto
- [ ] Documentar guia de cores/fonts
- [ ] Criar "brand book" automático para cada loja
- [ ] Atingir métricas: 85% brand recognition + 90% pertencimento

---

## ✅ PONTO 5: VALIDAÇÃO UX (@ux-design)

### Função: Validar Experiência Antes de Mostrar ao Lojista

**Arquivo:**
- `lib/domain/campaigns/ux-validation.ts` (novo)

**Implementação:**

```typescript
// lib/domain/campaigns/ux-validation.ts (NEW)
export interface UXValidationResult {
  overall_valid: boolean;
  checks: {
    visual_clarity: boolean;
    visual_clarity_reason: string;
    cta_prominence: boolean;
    cta_prominence_reason: string;
    text_readability: boolean;
    text_readability_reason: string;
    logo_integration: boolean;
    logo_integration_reason: string;
    color_contrast: boolean;
    color_contrast_reason: string;
    mobile_friendly: boolean;
    mobile_friendly_reason: string;
  };
  suggestions: string[];
}

export async function validateUX(
  design: DesignLayout,
  storeSignature: VisualSignature
): Promise<UXValidationResult> {
  const result: UXValidationResult = {
    overall_valid: true,
    checks: {} as any,
    suggestions: []
  };

  // CHECK 1: Clareza Visual (produto visível?)
  result.checks.visual_clarity = design.product_size >= 300; // pixels
  result.checks.visual_clarity_reason = design.product_size >= 300
    ? "✅ Produto bem visível"
    : "❌ Produto muito pequeno, aumenta";
  if (!result.checks.visual_clarity) {
    result.suggestions.push("Aumentar tamanho do produto +20%");
  }

  // CHECK 2: Prominência do CTA
  result.checks.cta_prominence = design.cta_size >= 40; // pixels altura
  result.checks.cta_prominence_reason = design.cta_size >= 40
    ? "✅ CTA bem visível"
    : "❌ CTA muito pequena";
  if (!result.checks.cta_prominence) {
    result.suggestions.push("Aumentar CTA +15px");
  }

  // CHECK 3: Legibilidade de Texto
  const textContrast = calculateContrast(design.text_color, design.background_color);
  result.checks.text_readability = textContrast >= 4.5; // WCAG AA
  result.checks.text_readability_reason = textContrast >= 4.5
    ? "✅ Contraste bom"
    : "❌ Texto difícil de ler";
  if (!result.checks.text_readability) {
    result.suggestions.push("Aumentar contraste de cores");
  }

  // CHECK 4: Integração do Logo
  const logoSpace = calculateLogoOcclusion(design.logo, design.product);
  result.checks.logo_integration = logoSpace < 0.05; // < 5% sobreposição
  result.checks.logo_integration_reason = logoSpace < 0.05
    ? "✅ Logo não ofusca"
    : "❌ Logo ofuscando produto";
  if (!result.checks.logo_integration) {
    result.suggestions.push("Reposicionar logo para canto");
  }

  // CHECK 5: Contraste de Cores
  const colorHarmony = validateColorHarmony(storeSignature.colors);
  result.checks.color_contrast = colorHarmony.is_valid;
  result.checks.color_contrast_reason = colorHarmony.is_valid
    ? "✅ Cores combinam bem"
    : "❌ Cores em conflito";

  // CHECK 6: Mobile Friendly
  const mobileFriendly = validateMobileLayout(design);
  result.checks.mobile_friendly = mobileFriendly.is_valid;
  result.checks.mobile_friendly_reason = mobileFriendly.is_valid
    ? "✅ Ótimo em celular"
    : "❌ Difícil ler em celular";
  if (!result.checks.mobile_friendly) {
    result.suggestions.push(...mobileFriendly.suggestions);
  }

  // Determinar overall valid
  result.overall_valid = Object.values(result.checks)
    .filter(v => v === false || typeof v === "boolean")
    .every(v => v !== false);

  return result;
}

function calculateContrast(color1: string, color2: string): number {
  // WCAG contrast calculation
  // Retorna valor de 1-21 (21 = máximo contraste)
  // ≥4.5 = AA (acceptable)
  // ≥7 = AAA (excellent)
}

function validateMobileLayout(design: DesignLayout): {
  is_valid: boolean;
  suggestions: string[];
} {
  const suggestions = [];

  // Em celular (vertical 600px altura)
  if (design.headline_font_size < 18) {
    suggestions.push("Aumentar headline pra melhor leitura em celular");
  }

  if (design.product_size < 250) {
    suggestions.push("Produto muito pequeno em portrait mode");
  }

  return {
    is_valid: suggestions.length === 0,
    suggestions
  };
}
```

**Responsabilidade @ux-design:**
- [ ] Testar com 10+ lojistas (não tech-savvy)
- [ ] Medir tempo até primeira campanha (target ≤5min)
- [ ] Criar tutoriais vídeo (2min cada)
- [ ] Validar que botões/labels são claros
- [ ] Testar mobile vs desktop

---

## 🔄 INTEGRAÇÃO COMPLETA NO ENDPOINT

```typescript
// app/api/generate/campaign/route.ts (INTEGRAÇÃO COMPLETA)
import { resolveCommercialContext } from "@/lib/data/commercial-opportunities";
import { selectOptimalPrompt } from "@/lib/ai/prompts/vendors/adega/base";
import { validateAndOptimizeCopy } from "@/lib/domain/campaigns/copy-validator";
import { applyVisualSignatureToLayout, generateVariationsWithSignature } 
  from "@/lib/domain/stores/visual-signature";
import { validateUX } from "@/lib/domain/campaigns/ux-validation";

export async function POST(req: Request) {
  const { storeId, product } = await req.json();

  try {
    // 1. PONTO 1: Resolver contexto comercial (@commerce-strategist)
    const store = await fetchStore(storeId);
    const commercialContext = await resolveCommercialContext(new Date(), store);

    // 2. PONTO 2: Selecionar prompt otimizado (@prompt-eng)
    const optimalPrompt = selectOptimalPrompt(product, commercialContext, store);

    // 3. Gerar copy com IA
    const generatedCopy = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: getTemperature(commercialContext),
      system: optimalPrompt,
      messages: [{ role: "user", content: `Gere campanha para: ${product.name}` }]
    });

    const copy = JSON.parse(generatedCopy.choices[0].message.content);

    // 4. PONTO 3: Validar copy (@content-copy)
    const copyValidation = await validateAndOptimizeCopy(
      copy,
      commercialContext,
      product.name
    );

    if (!copyValidation.valid && copyValidation.optimized) {
      // Copy foi otimizado automaticamente
      Object.assign(copy, copyValidation.optimized);
    }

    // 5. PONTO 4: Aplicar Visual Signature (@brand-designer)
    const visualSignature = await fetchVisualSignature(storeId);
    const baseLayouts = [
      { layout_type: "centered", ... },
      { layout_type: "urgency", ... },
      { layout_type: "premium", ... }
    ];

    const variationsWithSignature = baseLayouts.map(layout =>
      applyVisualSignatureToLayout(layout, visualSignature)
    );

    // 6. PONTO 5: Validar UX (@ux-design)
    const uxValidations = await Promise.all(
      variationsWithSignature.map(v => validateUX(v, visualSignature))
    );

    // 7. Gerar artes
    const designs = await Promise.all(
      variationsWithSignature.map(v => renderDesign(v))
    );

    // 8. Retornar ao lojista
    return NextResponse.json({
      ok: true,
      variations: designs.map((design, idx) => ({
        design: design,
        copy: copy,
        ux_feedback: uxValidations[idx],
        commercialContext: commercialContext
      }))
    });

  } catch (error) {
    return handleError(error);
  }
}
```

---

## 📊 FLUXO DE FEEDBACK

Após lojista publicar, coletar feedback para melhorar squad:

```typescript
// app/api/campaigns/feedback/route.ts (NEW)
export async function POST(req: Request) {
  const { campaignId, feedback } = await req.json();

  const survey = {
    converted: feedback.converted,  // "Resultou em vendas?"
    preferred_cta: feedback.preferred_cta,  // Qual CTA?
    design_rating: feedback.design_rating,  // 1-5 stars
    would_recommend: feedback.would_recommend  // Sim/Não
  };

  // Salvar feedback
  await saveCampaignFeedback(campaignId, survey);

  // Alimentar squad com dados
  await updateSquadLearnings({
    commercialContext: campaign.commercial_context,
    cta: campaign.copy.cta,
    product_type: campaign.product.category,
    converted: survey.converted,
    rating: survey.design_rating
  });

  return NextResponse.json({ ok: true });
}
```

---

## 🎯 PRÓXIMAS AÇÕES TÉCNICAS

1. **Semana 1-2:**
   - [ ] Criar `lib/data/commercial-opportunities.ts`
   - [ ] Estender `lib/ai/prompts/vendors/` com 10 prompts
   - [ ] Criar `lib/domain/campaigns/copy-validator.ts`

2. **Semana 3:**
   - [ ] Criar `lib/domain/stores/visual-signature.ts`
   - [ ] Criar `lib/graphics/composer/visual-signature-applier.ts`
   - [ ] Integrar no Motor 3 (Composer)

3. **Semana 4:**
   - [ ] Criar `lib/domain/campaigns/ux-validation.ts`
   - [ ] Criar endpoint feedback

4. **Semana 5:**
   - [ ] Integração completa em `app/api/generate/campaign/route.ts`
   - [ ] Testes e1e com 5 campanhas
   - [ ] Deploy para beta

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Toda data/hora é buscada dinamicamente (não hardcoded)
- [ ] Contexto comercial é testado com 50+ adegas
- [ ] Prompts têm temperature diferentes por contexto
- [ ] Copy validator rejeita <80% das campanhas ruins
- [ ] Visual Signature não ofusca produto
- [ ] UX validation faz sentido em mobile
- [ ] Feedback loop alimenta squad com dados reais
- [ ] Documentação técnica está atualizada

---

**Integração Técnica Pronta para Desenvolvimento**
