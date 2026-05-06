# TASK: Subsegmentation Backend + Frontend Implementation

> **Decisão:** [DEC-2026-05-06-003.md](../integration-checklists/DEC-2026-05-06-003.md)  
> **Responsável:** @dev (Dex)  
> **Prazo:** 4 horas  
> **Dependência:** Migration 042 deployed ✅

---

## 🎯 OBJETIVO

Implementar subsegmentação hierárquica no backend (Registry Loader) e frontend (UI Onboarding):
- **Backend:** Fallback logic no registry loader (variant → base)
- **Frontend:** Dropdown hierárquico (categoria → subcategoria → custom)
- **Types:** Atualizar TypeScript types para category/subcategory/custom

---

## 📋 ESCOPO DE TRABALHO

### 1. Backend: Registry Loader com Fallback

**Arquivo:** `lib/ai/prompts/registries/loader.ts`

**Modificações:**

```typescript
// Adicionar ao arquivo existente

export async function loadSegmentExpert(
  category: string, 
  subcategory?: string | null
): Promise<SegmentExpert> {
  
  // Estratégia 1: Tenta variant específico (se não for "outro")
  if (subcategory && subcategory !== 'outro') {
    const variantPath = path.join(
      process.cwd(),
      'lib/ai/prompts/registries',
      category,
      'variants',
      `${subcategory}.yaml`
    );
    
    if (await fs.pathExists(variantPath)) {
      console.log(`[Registry] Loading variant: ${category}/variants/${subcategory}.yaml`);
      return loadYaml(variantPath);
    }
    
    console.warn(`[Registry] Variant not found: ${subcategory}, falling back to base`);
  }
  
  // Estratégia 2: Fallback para expert genérico (base)
  const basePath = path.join(
    process.cwd(),
    'lib/ai/prompts/registries',
    category,
    'segment-expert.yaml'
  );
  
  if (await fs.pathExists(basePath)) {
    console.log(`[Registry] Loading base: ${category}/segment-expert.yaml`);
    return loadYaml(basePath);
  }
  
  // Estratégia 3: Se nem base existe, erro
  throw new Error(`[Registry] Segment expert not found for category: ${category}`);
}
```

**Atualizar chamadas existentes:**

```typescript
// Em lib/domain/campaigns/context-builder.ts
// ANTES:
const segmentExpert = await loadSegmentExpert(store.main_segment);

// DEPOIS:
const segmentExpert = await loadSegmentExpert(
  store.category, 
  store.subcategory
);
```

---

### 2. TypeScript Types

**Arquivo:** `lib/domain/stores/types.ts`

**Adicionar:**

```typescript
export type StoreCategory = 
  | 'bebidas_alcoolicas'
  | 'mercearia'
  | 'farmacias'
  | 'moda'
  | 'pet_shop'
  | 'restaurante';

export type BebidaSubcategory = 
  | 'adega'
  | 'loja-bebidas'
  | 'distribuidor'
  | 'emporio-cervejas'
  | 'outro';

export type MerceariaSubcategory = 
  | 'mercadinho-bairro'
  | 'minimercado'
  | 'hortifruti'
  | 'emporio-gourmet'
  | 'sacolao'
  | 'outro';

export interface Store {
  id: string;
  name: string;
  main_segment: string; // Legacy (manter por enquanto)
  category: StoreCategory;
  subcategory?: string | null;
  subcategory_custom?: string | null;
  // ... outros campos
}
```

---

### 3. Frontend: UI Onboarding Hierárquico

**Arquivo:** `app/dashboard/store/page.tsx`

**Estrutura de dados:**

```typescript
const SEGMENT_HIERARCHY = {
  bebidas_alcoolicas: {
    label: 'Bebidas Alcoólicas',
    icon: '🍷',
    subcategories: [
      { value: 'adega', label: 'Adega / Wine Bar', description: 'Curadoria de vinhos e rótulos premium' },
      { value: 'loja-bebidas', label: 'Loja de Bebidas', description: 'Variedade ampla para o dia a dia' },
      { value: 'distribuidor', label: 'Distribuidora / Atacado', description: 'Vendas B2B em volume' },
      { value: 'emporio-cervejas', label: 'Empório de Cervejas / Craft', description: 'Especialização em cervejas artesanais' },
      { value: 'outro', label: '🔸 Outro (especifique)', description: 'Não se encaixa nas opções acima' },
    ]
  },
  mercearia: {
    label: 'Mercado / Mercearia',
    icon: '🛒',
    subcategories: [
      { value: 'mercadinho-bairro', label: 'Mercadinho de Bairro', description: 'Proximidade e atendimento familiar' },
      { value: 'minimercado', label: 'Minimercado', description: 'Conveniência e produtos básicos' },
      { value: 'hortifruti', label: 'Hortifrúti / Frutaria', description: 'Foco em produtos frescos' },
      { value: 'emporio-gourmet', label: 'Empório Gourmet', description: 'Produtos premium e especiais' },
      { value: 'sacolao', label: 'Sacolão', description: 'Preço e volume em hortifruti' },
      { value: 'outro', label: '🔸 Outro (especifique)', description: 'Não se encaixa nas opções acima' },
    ]
  },
  // Adicionar outros segmentos conforme necessário
} as const;
```

**UI Component (shadcn/ui):**

```tsx
'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function StoreSegmentationForm() {
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [subcategoryCustom, setSubcategoryCustom] = useState<string>('');

  const selectedCategory = category ? SEGMENT_HIERARCHY[category as keyof typeof SEGMENT_HIERARCHY] : null;
  const showCustomField = subcategory === 'outro';

  return (
    <div className="space-y-4">
      {/* Categoria */}
      <div>
        <Label htmlFor="category">Qual o segmento da sua loja?</Label>
        <Select value={category} onValueChange={(val) => {
          setCategory(val);
          setSubcategory(''); // Reset subcategory
          setSubcategoryCustom('');
        }}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Selecione a categoria principal" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SEGMENT_HIERARCHY).map(([key, seg]) => (
              <SelectItem key={key} value={key}>
                {seg.icon} {seg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategoria (só aparece após escolher categoria) */}
      {selectedCategory && (
        <div>
          <Label htmlFor="subcategory">Especifique o tipo</Label>
          <Select value={subcategory} onValueChange={(val) => {
            setSubcategory(val);
            if (val !== 'outro') {
              setSubcategoryCustom(''); // Limpa custom se não for "outro"
            }
          }}>
            <SelectTrigger id="subcategory">
              <SelectValue placeholder="Escolha a opção que melhor descreve" />
            </SelectTrigger>
            <SelectContent>
              {selectedCategory.subcategories.map((sub) => (
                <SelectItem key={sub.value} value={sub.value}>
                  <div>
                    <div className="font-medium">{sub.label}</div>
                    <div className="text-xs text-muted-foreground">{sub.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Campo custom (só aparece se subcategory = "outro") */}
      {showCustomField && (
        <div>
          <Label htmlFor="subcategory_custom">Especifique o tipo da sua loja</Label>
          <Input
            id="subcategory_custom"
            placeholder="Ex: Conveniência, Posto de gasolina, Bar..."
            value={subcategoryCustom}
            onChange={(e) => setSubcategoryCustom(e.target.value)}
            required
          />
          <Alert className="mt-2 border-amber-500/50 bg-amber-50">
            <AlertDescription className="text-xs text-amber-800">
              ⚠️ <strong>Atenção:</strong> Escolha "Outro" apenas se nenhuma das opções acima 
              descreve seu negócio. Se existe uma opção similar, escolha ela — 
              as campanhas serão muito mais efetivas!
            </AlertDescription>
          </Alert>
          <Alert className="mt-2">
            <AlertDescription className="text-xs text-muted-foreground">
              💡 Seus dados nos ajudam a criar conteúdo mais relevante. 
              Se muitos lojistas como você aparecerem, criaremos uma categoria específica no futuro!
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
```

---

### 4. API Route (Salvar Dados)

**Arquivo:** `app/api/stores/route.ts` (ou onde está o POST/PUT)

**Validação com keyword detection:**

```typescript
// Palavras-chave que indicam escolha errada (evitar subsegmentação perdida)
const KEYWORD_MAPPING: Record<string, Array<{ keywords: string[]; suggest: string }>> = {
  bebidas_alcoolicas: [
    { keywords: ['adega', 'vinho', 'wine', 'vinhos'], suggest: 'adega' },
    { keywords: ['empório', 'emporio', 'cerveja', 'craft', 'artesanal', 'cervejas'], suggest: 'emporio-cervejas' },
    { keywords: ['distribuidora', 'atacado', 'distribuidor'], suggest: 'distribuidor' },
    { keywords: ['loja de bebida', 'bebida'], suggest: 'loja-bebidas' },
  ],
  mercearia: [
    { keywords: ['mercadinho', 'bairro'], suggest: 'mercadinho-bairro' },
    { keywords: ['hortifruti', 'hortifrúti', 'fruta', 'verdura', 'frutaria'], suggest: 'hortifruti' },
    { keywords: ['gourmet', 'especial', 'premium'], suggest: 'emporio-gourmet' },
    { keywords: ['sacolão', 'sacolao'], suggest: 'sacolao' },
    { keywords: ['minimercado', 'mini mercado'], suggest: 'minimercado' },
  ]
};

function detectSubcategoryKeywords(
  category: string,
  customValue: string
): { detected: boolean; suggestion?: string; message?: string } {
  
  const normalizedInput = customValue.toLowerCase().trim();
  const mappings = KEYWORD_MAPPING[category] || [];
  
  for (const { keywords, suggest } of mappings) {
    if (keywords.some(keyword => normalizedInput.includes(keyword))) {
      return {
        detected: true,
        suggestion: suggest,
        message: `Detectamos que seu negócio pode ser classificado como "${suggest}". Por favor, volte e escolha a opção correta para campanhas mais efetivas.`
      };
    }
  }
  
  return { detected: false };
}

// Na validação da API:
// Validar constraint: se subcategory = 'outro', subcategory_custom é obrigatório
if (subcategory === 'outro' && !subcategory_custom?.trim()) {
  return NextResponse.json(
    { error: 'Campo "especifique o tipo" é obrigatório quando seleciona "Outro"' },
    { status: 400 }
  );
}

// Validar keywords (evitar subsegmentação perdida)
if (subcategory === 'outro' && subcategory_custom) {
  const keywordCheck = detectSubcategoryKeywords(category, subcategory_custom);
  if (keywordCheck.detected) {
    return NextResponse.json(
      { 
        error: 'Opção existente detectada',
        message: keywordCheck.message,
        suggestion: keywordCheck.suggestion
      },
      { status: 400 }
    );
  }
}

// Inserir/atualizar no DB
const { data, error } = await supabase
  .from('stores')
  .upsert({
    id,
    name,
    category,
    subcategory,
    subcategory_custom: subcategory === 'outro' ? subcategory_custom : null,
    // ... outros campos
  });
```

---

## 🧪 TESTES OBRIGATÓRIOS

### Unit Tests: Registry Loader

**Arquivo:** `lib/ai/prompts/registries/__tests__/loader.test.ts`

```typescript
describe('loadSegmentExpert with subcategory', () => {
  it('should load variant when subcategory exists', async () => {
    const expert = await loadSegmentExpert('bebidas_alcoolicas', 'adega');
    expect(expert.segment_name).toContain('Adega');
  });

  it('should fallback to base when subcategory is "outro"', async () => {
    const expert = await loadSegmentExpert('bebidas_alcoolicas', 'outro');
    expect(expert.segment_name).toContain('Bebidas'); // Base genérico
  });

  it('should fallback to base when variant does not exist', async () => {
    const expert = await loadSegmentExpert('bebidas_alcoolicas', 'nao-existe');
    expect(expert.segment_name).toContain('Bebidas'); // Base genérico
  });

  it('should throw error when base does not exist', async () => {
    await expect(
      loadSegmentExpert('segmento-invalido', 'adega')
    ).rejects.toThrow('Segment expert not found');
  });
});
```

### E2E Tests: Onboarding Flow

**Arquivo:** `tests/e2e/onboarding-subsegmentation.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Onboarding Subsegmentation', () => {
  test('should allow selecting category and subcategory', async ({ page }) => {
    await page.goto('/dashboard/store');
    
    // Escolher categoria
    await page.selectOption('#category', 'bebidas_alcoolicas');
    
    // Escolher subcategoria
    await page.selectOption('#subcategory', 'adega');
    
    // Salvar
    await page.click('button[type="submit"]');
    
    // Verificar salvou corretamente
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should require custom field when selecting "outro"', async ({ page }) => {
    await page.goto('/dashboard/store');
    
    await page.selectOption('#category', 'bebidas_alcoolicas');
    await page.selectOption('#subcategory', 'outro');
    
    // NÃO preencher campo custom
    await page.click('button[type="submit"]');
    
    // Deve mostrar erro
    await expect(page.locator('.error-message')).toContainText('obrigatório');
  });

  test('should accept custom value when "outro" selected', async ({ page }) => {
    await page.goto('/dashboard/store');
    
    await page.selectOption('#category', 'bebidas_alcoolicas');
    await page.selectOption('#subcategory', 'outro');
    await page.fill('#subcategory_custom', 'Conveniência');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should reject custom value with existing keyword (empório)', async ({ page }) => {
    await page.goto('/dashboard/store');
    
    await page.selectOption('#category', 'bebidas_alcoolicas');
    await page.selectOption('#subcategory', 'outro');
    await page.fill('#subcategory_custom', 'empório'); // Keyword detectada
    
    await page.click('button[type="submit"]');
    
    // Deve mostrar erro sugerindo "Empório de Cervejas"
    await expect(page.locator('.error-message')).toContainText('Opção existente detectada');
    await expect(page.locator('.error-message')).toContainText('emporio-cervejas');
  });

  test('should reject custom value with existing keyword (adega)', async ({ page }) => {
    await page.goto('/dashboard/store');
    
    await page.selectOption('#category', 'bebidas_alcoolicas');
    await page.selectOption('#subcategory', 'outro');
    await page.fill('#subcategory_custom', 'Adega de vinhos'); // Keyword "adega"
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message')).toContainText('Opção existente detectada');
  });

  test('should accept legitimate edge case (Empório de Cachaças)', async ({ page }) => {
    await page.goto('/dashboard/store');
    
    await page.selectOption('#category', 'bebidas_alcoolicas');
    await page.selectOption('#subcategory', 'outro');
    await page.fill('#subcategory_custom', 'Empório de Cachaças'); // "empório" + "cachaça" ≠ cervejas
    
    await page.click('button[type="submit"]');
    
    // DEVE aceitar (edge case legítimo, não é exatamente "Empório de Cervejas")
    // Nota: Implementação precisa ser smart (não só regex simples)
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

---

## 📦 ENTREGÁVEIS

### Arquivos a Modificar/Criar

1. **`lib/ai/prompts/registries/loader.ts`** [MODIFICAR]
   - Adicionar `loadSegmentExpert(category, subcategory)` com fallback logic

2. **`lib/domain/stores/types.ts`** [MODIFICAR]
   - Adicionar `StoreCategory`, subcategory types, atualizar `Store` interface

3. **`lib/domain/campaigns/context-builder.ts`** [MODIFICAR]
   - Atualizar chamada para usar `store.category` e `store.subcategory`

4. **`app/dashboard/store/page.tsx`** [MODIFICAR]
   - Implementar dropdown hierárquico + campo custom

5. **`app/api/stores/route.ts`** [MODIFICAR]
   - Validação constraint + keyword detection + salvar category/subcategory/custom

6. **`lib/ai/prompts/registries/__tests__/loader.test.ts`** [CRIAR]
   - 4 unit tests (variant, outro, fallback, error)

7. **`tests/e2e/onboarding-subsegmentation.spec.ts`** [CRIAR]
   - 6 E2E tests (normal, outro sem custom, outro com custom, keywords: empório, adega, edge case legítimo)

---

## ✅ CHECKLIST DE CONCLUSÃO

- [ ] Registry loader implementado com fallback logic
- [ ] TypeScript types atualizados (category, subcategory, custom)
- [ ] Context builder atualizado para usar category/subcategory
- [ ] UI onboarding implementado (dropdown hierárquico)
- [ ] Campo custom condicional (só aparece se "outro")
- [ ] Helper text educativo (guia escolha correta)
- [ ] API route com validação de constraint
- [ ] API route com keyword detection (evita subsegmentação perdida)
- [ ] 4 unit tests passing (loader)
- [ ] 6 E2E tests passing (onboarding flow + keyword validation)
- [ ] Lint passing (`npm run lint`)
- [ ] TypeScript passing (`npm run typecheck`)
- [ ] @qa notificado: "Subsegmentation UI READY ✅"

---

## 🔄 PRÓXIMOS PASSOS (APÓS DEPLOYMENT)

Assim que implementação estiver completa:
1. ✅ @qa valida fluxos manualmente (1h)
2. ✅ Deploy staging + testes reais
3. ✅ Criar 10 registry variants (continua Sprint 1)
4. ✅ Sprint 2: Visual Composer System (40h)

---

## 📞 SUPORTE

**Dúvidas técnicas:** @aiox-master  
**Contexto de negócio:** [DEC-2026-05-06-003.md](../integration-checklists/DEC-2026-05-06-003.md)  
**Migration status:** Verificar com @data-engineer

---

**Status:** 🟡 WAITING (Migration 042 deployment)  
**Effort:** 4 horas  
**Prioridade:** 🔴 P0 (CRÍTICO — bloqueia Sprint 1)
