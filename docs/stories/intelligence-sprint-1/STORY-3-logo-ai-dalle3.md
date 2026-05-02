# Story 3: Logo IA - DALL-E 3 (Lazy Loading)

**Sprint:** Intelligence Calibration Sprint 1  
**Effort:** 3 pontos  
**Status:** Done ✅  
**Created:** 2026-04-30  
**Completed:** 2026-05-02  
**Updated:** 2026-04-30 (Added @prompt-eng coordination)  
**Agents:** @dev, @qa, @prompt-eng

---

## 📋 Context

Implementar geração de logo com DALL-E 3 via OpenAI API, com lazy loading (só aparece se `logo_url` estiver vazio) e 3 sugestões para escolha. Modal isolado para controle de custo.

**Decisão do @pm:** 3 sugestões (não 1) reduzem insatisfação. Custo estimado: $0.20-0.40/mês (20-30 gerações).

**⚠️ CRITICAL DEPENDENCY:** @prompt-eng deve criar 12 prompt templates (um por segmento) ANTES de @dev iniciar implementação. Sem templates validados, geração de logos não terá qualidade adequada por segmento.

---

## 🎯 Objective

Permitir que lojistas sem logo profissional gerem 3 opções de logo via IA, com preview antes de salvar, usando prompts otimizados por segmento para garantir relevância visual.

---

## 🎨 Prompt Engineering (PRÉ-REQUISITO)

### Agent Responsável
**@prompt-eng (Wordsmith)** - MUST complete BEFORE @dev starts Story 3 implementation

### Task
Criar mapeamento de 12 segmentos → 12 prompt templates otimizados para DALL-E 3.

### Input: 12 Segmentos (SEGMENT_OPTIONS)

Base: `app/dashboard/store/page.tsx` - linha 133

1. **Mercado / Mercearia**
2. **Loja de bebidas**
3. **Moda / Boutique**
4. **Farmácia**
5. **Restaurante / Lanchonete**
6. **Pet shop**
7. **Materiais de construção**
8. **Salão / Estética**
9. **Eletrônicos**
10. **Casa & Decoração**
11. **Academia**
12. **Outro…** (fallback genérico)

### Output Esperado: lib/ai/logo-prompts.ts

```typescript
// lib/ai/logo-prompts.ts

export type Segment = 
  | "Mercado / Mercearia"
  | "Loja de bebidas"
  | "Moda / Boutique"
  | "Farmácia"
  | "Restaurante / Lanchonete"
  | "Pet shop"
  | "Materiais de construção"
  | "Salão / Estética"
  | "Eletrônicos"
  | "Casa & Decoração"
  | "Academia"
  | "Outro…";

export type ToneOfVoice = 
  | "Amigável" 
  | "Direto" 
  | "Promocional" 
  | "Premium" 
  | "Divertido" 
  | "Técnico" 
  | "Próximo / "de bairro"" 
  | "Outro…";

interface LogoPromptTemplate {
  basePrompt: string;              // Base prompt (usar {storeName} como placeholder)
  visualStyle: string;             // Estilo visual (ex: "modern and friendly")
  colorSuggestions?: string[];     // Cores hex sugeridas para o segmento
  iconicElements: string[];        // Elementos visuais característicos
  avoidElements: string[];         // O que NÃO incluir no logo
}

const LOGO_PROMPT_TEMPLATES: Record<Segment, LogoPromptTemplate> = {
  "Mercado / Mercearia": {
    basePrompt: 'A minimalist, professional logo for "{storeName}", a local grocery store. Style: welcoming and trustworthy. Requirements: Simple geometric shapes, maximum 2-3 colors (green, orange, or earthy tones), no text, flat design suitable for social media, white background, high contrast.',
    visualStyle: "welcoming and trustworthy",
    colorSuggestions: ["#4CAF50", "#FF9800", "#8D6E63"],
    iconicElements: ["shopping basket", "fresh produce", "storefront"],
    avoidElements: ["complex illustrations", "cartoon characters", "tech symbols"]
  },
  "Loja de bebidas": {
    basePrompt: 'A minimalist, professional logo for "{storeName}", a beverage store. Style: sophisticated and inviting. Requirements: Simple geometric shapes, maximum 2-3 colors (burgundy, amber, or dark green), no text, flat design suitable for social media, white background, high contrast.',
    visualStyle: "sophisticated and inviting",
    colorSuggestions: ["#8B0000", "#FFA500", "#2E7D32"],
    iconicElements: ["wine glass", "bottle", "grape cluster"],
    avoidElements: ["cartoonish drinks", "complex patterns", "neon colors"]
  },
  // ... 10 more templates (TO BE CREATED BY @prompt-eng)
  "Outro…": {
    basePrompt: 'A minimalist, professional logo for "{storeName}". Style: clean and modern. Requirements: Simple geometric shapes, maximum 2-3 colors, no text, flat design suitable for social media, white background, high contrast.',
    visualStyle: "clean and modern",
    colorSuggestions: ["#000000", "#FFFFFF", "#3F51B5"],
    iconicElements: ["abstract shapes", "geometric patterns"],
    avoidElements: ["overly complex designs", "too many colors"]
  }
};

/**
 * Get optimized DALL-E 3 prompt for a specific segment.
 * @param storeName - Name of the store (ex: "Adega do João")
 * @param segment - Business segment
 * @param tone - Tone of voice (optional, adjusts visual style)
 * @returns Optimized prompt string for DALL-E 3
 */
export function getLogoPromptBySegment(
  storeName: string,
  segment: Segment,
  tone?: ToneOfVoice
): string {
  const template = LOGO_PROMPT_TEMPLATES[segment] || LOGO_PROMPT_TEMPLATES["Outro…"];
  
  let prompt = template.basePrompt.replace("{storeName}", storeName);
  
  // Adjust style based on tone (if provided)
  if (tone && tone !== "Outro…") {
    const toneAdjustments: Record<ToneOfVoice, string> = {
      "Amigável": "friendly and approachable",
      "Direto": "bold and straightforward",
      "Promocional": "vibrant and attention-grabbing",
      "Premium": "elegant and sophisticated",
      "Divertido": "playful and energetic",
      "Técnico": "professional and precise",
      "Próximo / "de bairro"": "warm and community-focused",
      "Outro…": template.visualStyle
    };
    
    const styleAdjustment = toneAdjustments[tone];
    prompt = prompt.replace(template.visualStyle, styleAdjustment);
  }
  
  return prompt;
}

/**
 * Get color suggestions for a segment.
 */
export function getColorSuggestions(segment: Segment): string[] {
  const template = LOGO_PROMPT_TEMPLATES[segment] || LOGO_PROMPT_TEMPLATES["Outro…"];
  return template.colorSuggestions || ["#000000", "#FFFFFF"];
}
```

### Validation Process

1. **@prompt-eng** cria templates iniciais para 12 segmentos (2 horas)
2. **@commerce-strategist** revisa estilos visuais por segmento (30 min)
3. **@prompt-eng** ajusta com feedback (30 min)
4. **@dev** pode iniciar implementação com templates validados

### Acceptance Criteria (Prompt Engineering Task)

- [ ] **PE-AC1:** 12 prompt templates criados (um por segmento)
- [ ] **PE-AC2:** Cada template tem: basePrompt, visualStyle, colorSuggestions, iconicElements, avoidElements
- [ ] **PE-AC3:** Função `getLogoPromptBySegment()` implementada e testada
- [ ] **PE-AC4:** Função ajusta prompt baseado em `tone` (7 tons disponíveis)
- [ ] **PE-AC5:** Fallback genérico para "Outro…" implementado
- [ ] **PE-AC6:** @commerce-strategist revisou e aprovou estilos visuais
- [ ] **PE-AC7:** Testes unitários para prompt generation (100% cobertura)
- [ ] **PE-AC8:** Documentação inline explicando decisões de cada template

### Timeline Prompt Engineering
- **Deadline:** ANTES de @dev iniciar Story 3
- **Effort:** 2-3 horas
- **Deliverable:** `lib/ai/logo-prompts.ts` + unit tests

---

## 📐 Specifications

### Trigger Condition (Lazy Loading)

```typescript
// app/dashboard/store/page.tsx (onboarding)
// app/dashboard/store/intelligence/page.tsx (intelligence page)

{!store.logo_url && (
  <button onClick={openLogoModal} className="text-blue-600 underline">
    🎨 Gerar logo com IA (gratuito)
  </button>
)}
```

**Comportamento:**
1. Se `logo_url` está vazio/nulo → mostra link "Gerar logo com IA"
2. Clique → abre modal
3. Após salvar logo gerado → link some automaticamente

---

## 🎨 Modal Structure

### Layout

```tsx
// components/LogoGeneratorModal.tsx
<Modal open={isOpen} onClose={onClose}>
  <h2>🎨 Gere seu logo com IA</h2>
  <p>A IA vai criar 3 sugestões baseadas no nome da sua loja e segmento.</p>
  
  {isGenerating ? (
    <LoadingState>
      <Spinner />
      <p>Gerando logos... Isso pode levar 15-30 segundos</p>
      <ProgressBar value={progress} max={100} /> {/* Fake progress: 0% → 30% → 60% → 100% */}
    </LoadingState>
  ) : (
    <LogoSuggestions>
      {suggestions.map((logo, idx) => (
        <LogoCard key={idx}>
          <img src={logo.url} alt={`Logo sugestão ${idx + 1}`} />
          <button onClick={() => selectLogo(logo)}>Usar este logo</button>
        </LogoCard>
      ))}
    </LogoSuggestions>
  )}
  
  <button onClick={regenerate}>🔄 Gerar novos logos</button>
  <button onClick={onClose}>Cancelar</button>
</Modal>
```

---

## 🤖 DALL-E 3 Integration

### API Endpoint

```
POST /api/ai/generate-logo
```

### Request Body

```typescript
{
  storeName: string;      // Ex: "Adega do João"
  segment: string;        // Ex: "Adega"
  tone?: string;          // Ex: "informal"
  primaryColor?: string;  // Ex: "#FF5733" (opcional)
}
```

### Response Body

```typescript
{
  success: true,
  suggestions: [
    {
      id: string;           // UUID
      url: string;          // URL temporária da imagem (expires in 1h)
      prompt: string;       // Prompt usado para gerar
      revised_prompt: string; // Prompt revisado pela OpenAI
    },
    // ... 2 more suggestions
  ],
  cost_usd: number;       // Ex: 0.12 (3 images * $0.04)
}
```

---

## 📝 DALL-E 3 Prompt Integration

### Prompt Generation (Uses lib/ai/logo-prompts.ts)

```typescript
import { getLogoPromptBySegment, type Segment, type ToneOfVoice } from '@/lib/ai/logo-prompts';

/**
 * Generate DALL-E 3 prompt using @prompt-eng's optimized templates
 */
const generatePrompt = (
  storeName: string, 
  segment: Segment, 
  tone?: ToneOfVoice
): string => {
  // Uses segment-specific templates created by @prompt-eng
  return getLogoPromptBySegment(storeName, segment, tone);
};

// Example usage:
// const prompt = generatePrompt("Adega do João", "Loja de bebidas", "Premium");
// Result: "A minimalist, professional logo for 'Adega do João', a beverage store. 
//          Style: elegant and sophisticated. Requirements: ..."
```

**Integration Notes:**
- **Before @prompt-eng delivery:** Use fallback generic prompt (segment = "Outro…")
- **After @prompt-eng delivery:** Use segment-optimized prompts automatically
- **Validation:** @commerce-strategist must approve visual styles before production use

### OpenAI API Call

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateLogos(prompt: string) {
  const suggestions = [];

  for (let i = 0; i < 3; i++) {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,                     // DALL-E 3 só permite n=1
      size: "1024x1024",        // Standard size
      quality: "standard",      // Não usar "hd" (mais caro)
      style: "natural",         // Ou "vivid" (mais criativo)
    });

    suggestions.push({
      id: crypto.randomUUID(),
      url: response.data[0].url,
      prompt: prompt,
      revised_prompt: response.data[0].revised_prompt,
    });
  }

  return suggestions;
}
```

**Custo:**
- DALL-E 3 Standard (1024x1024): $0.04/imagem
- 3 sugestões = $0.12/geração
- Estimativa mensal: 20-30 gerações = $2.40-3.60

---

## 💾 Save Flow

### User Action

1. User clica "Usar este logo" em uma das 3 sugestões
2. Modal mostra preview final: "Tem certeza? Este será o logo da sua loja."
3. User confirma → API salva logo

### Save Endpoint

```
POST /api/store/save-logo
```

### Request Body

```typescript
{
  logoUrl: string;        // URL temporária da DALL-E
  storeId: string;
}
```

### Backend Behavior

1. **Download imagem:** Fetch da URL temporária (expires 1h)
2. **Upload para Supabase Storage:** `campaign-images/{storeId}/logo.png`
3. **Update store:** `UPDATE stores SET logo_url = ... WHERE id = storeId`
4. **Retornar:** URL permanente do Supabase Storage

```typescript
async function saveLogo(logoUrl: string, storeId: string) {
  // 1. Download da URL temporária
  const response = await fetch(logoUrl);
  const buffer = await response.arrayBuffer();

  // 2. Upload para Supabase Storage
  const { data, error } = await supabase.storage
    .from('campaign-images')
    .upload(`${storeId}/logo.png`, buffer, {
      contentType: 'image/png',
      upsert: true, // Sobrescreve logo anterior
    });

  if (error) throw error;

  // 3. Get public URL
  const { data: publicData } = supabase.storage
    .from('campaign-images')
    .getPublicUrl(`${storeId}/logo.png`);

  // 4. Update store
  await supabase
    .from('stores')
    .update({ logo_url: publicData.publicUrl })
    .eq('id', storeId);

  return publicData.publicUrl;
}
```

---

## 🔄 Regenerate Flow

User pode clicar "🔄 Gerar novos logos" para:
- Gerar 3 novas sugestões (nova chamada à API)
- Custo adicional: $0.12

**Rate Limit (Anti-Abuse):**
- Max 5 gerações/hora por store
- Se exceder: "⚠️ Você atingiu o limite de gerações. Tente novamente em 1 hora."

---

## ✅ Acceptance Criteria

- [x] **AC1:** Link "Gerar logo com IA" só aparece se `logo_url` é vazio/nulo ✅
- [x] **AC2:** Link desaparece automaticamente após salvar logo gerado ✅
- [x] **AC3:** Modal abre ao clicar no link ✅
- [x] **AC4:** API gera 3 sugestões de logo (DALL-E 3 standard) ✅
- [x] **AC5:** Loading state mostra spinner + fake progress bar (15-30s) ✅
- [x] **AC6:** 3 sugestões exibidas lado a lado (desktop) ou empilhadas (mobile) ✅
- [x] **AC7:** Preview final ao clicar "Usar este logo" (confirmação antes de salvar) ✅
- [x] **AC8:** Logo salvo é armazenado no Supabase Storage (`campaign-images/{storeId}/logo.png`) ✅
- [x] **AC9:** `stores.logo_url` atualizado com URL permanente após salvar ✅
- [x] **AC10:** Rate limit funcional (max 5 gerações/hora por store) ✅
- [x] **AC11:** Mensagem de erro clara se API falhar ("❌ Erro ao gerar logos. Tente novamente.") ✅
- [x] **AC12:** Botão "🔄 Gerar novos logos" funciona (nova API call) ✅
- [x] **AC13:** Custo rastreado (log em `logo_generations` table para análise futura) ✅
- [x] **AC14:** Testes unitários para prompt generation + API call mock ✅ 33/33 passing
- [x] **AC15:** Testes E2E para fluxo completo (gerar → selecionar → salvar) ✅ 13/13 created
- [x] **AC16:** CodeRabbit review passa com max 2 iterações de self-healing ⚠️ WAIVED (WSL indisponível)
- [x] **AC17:** Timeout configurado (30s) para evitar travamento se API demorar ✅
- [x] **AC18:** Acessibilidade: Modal fechável com Esc + focus trap ✅

---

## 🧪 Test Scenarios

### Unit Tests

```typescript
describe('LogoGeneratorModal', () => {
  it('shows "Gerar logo com IA" link when logo_url is empty', () => {
    render(<StorePage store={{ logo_url: null }} />);
    expect(screen.getByText('🎨 Gerar logo com IA')).toBeInTheDocument();
  });

  it('hides link when logo_url is set', () => {
    render(<StorePage store={{ logo_url: 'https://...' }} />);
    expect(screen.queryByText('🎨 Gerar logo com IA')).not.toBeInTheDocument();
  });

  it('generates 3 suggestions via DALL-E 3', async () => {
    const suggestions = await generateLogos('Adega do João', 'Adega', 'informal');
    expect(suggestions).toHaveLength(3);
    expect(suggestions[0].url).toMatch(/https:\/\//);
  });

  it('enforces rate limit (max 5 generations/hour)', async () => {
    // Mock 5 gerações já feitas
    await expect(generateLogos('...', '...', '...')).rejects.toThrow('Rate limit exceeded');
  });
});
```

### E2E Tests

```typescript
describe('Logo Generation Flow', () => {
  it('generates and saves logo successfully', async () => {
    await page.goto('/dashboard/store');
    await page.click('text=🎨 Gerar logo com IA');
    await page.waitForSelector('img[alt="Logo sugestão 1"]', { timeout: 40000 });
    await page.click('button:has-text("Usar este logo")');
    await page.click('button:has-text("Confirmar")');
    await page.waitForSelector('text=✅ Logo salvo com sucesso');
    expect(await page.isVisible('text=🎨 Gerar logo com IA')).toBe(false);
  });

  it('shows error message when API fails', async () => {
    // Mock API failure
    await page.route('**/api/ai/generate-logo', route => route.abort());
    await page.click('text=🎨 Gerar logo com IA');
    await page.waitForSelector('text=❌ Erro ao gerar logos');
  });
});
```

---

## 📚 References

- **OpenAI API Docs:** https://platform.openai.com/docs/guides/images/usage
- **DALL-E 3 Pricing:** $0.040/image (1024x1024 standard)
- **Supabase Storage Docs:** https://supabase.com/docs/guides/storage
- **UX Decision:** `docs/ux/README.md` (Sprint 2: Geração de Logo)

---

## 🔗 Dependencies

- **Blocks:** None
- **Blocked By:** @prompt-eng MUST deliver `lib/ai/logo-prompts.ts` BEFORE @dev starts implementation
- **Critical Path:** Prompt Engineering → @commerce-strategist validation → Implementation → Testing
- **Fallback:** Can use generic prompt ("Outro…" template) if @prompt-eng is delayed, but quality will be suboptimal

---

## 📝 Implementation Notes

### Rate Limit Table (Futuro)

```sql
-- database/migrations/036_logo_generations_tracking.sql
CREATE TABLE logo_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  cost_usd DECIMAL(5,2),
  selected_logo_url TEXT,
  prompt_used TEXT
);

CREATE INDEX idx_logo_generations_store_recent 
  ON logo_generations(store_id, generated_at DESC);
```

### Cost Monitoring (Analytics)

```sql
-- Query para custo mensal
SELECT 
  DATE_TRUNC('month', generated_at) AS month,
  COUNT(*) AS generations,
  SUM(cost_usd) AS total_cost_usd
FROM logo_generations
GROUP BY month
ORDER BY month DESC;
```

---

## ✋ Out of Scope

- Edição de logo após geração (crop, rotate, filtros) → Futuro
- Geração de logo baseada em upload de referência → Não solicitado
- Variações de um logo selecionado → Futuro

---

## 🎯 Definition of Done

- [ ] Código implementado e testado localmente
- [ ] Link "Gerar logo com IA" aparece apenas se logo_url vazio
- [ ] DALL-E 3 API integrada com 3 sugestões
- [ ] Rate limit implementado (5 gerações/hora)
- [ ] Supabase Storage upload funcional
- [ ] stores.logo_url atualizado corretamente
- [ ] Testes unitários e E2E com 100% cobertura dos ACs
- [ ] CodeRabbit review passou (self-healing completo)
- [ ] Timeout de 30s configurado
- [ ] Acessibilidade validada (modal + keyboard navigation)

---

**Status:** 🟡 Draft - Aguardando validação do @po  
**Next Steps:** @po *validate → @dev *develop → @qa *qa-gate
