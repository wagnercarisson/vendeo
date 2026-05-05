# TASK B4 — Prompt Renderer (Template Engine)

**Agente Responsável:** @dev (Dex)  
**Data de Criação:** 05 Mai 2026  
**Prioridade:** 🔴 ALTA — Bloqueante para B6-B10  
**Estimativa:** 2-3 horas  
**Dependências:** ✅ B1, B2, B3, B5 (todas completas)

---

## 🎯 OBJETIVO

Implementar o Template Engine que monta o prompt final da campanha, integrando as 3 camadas de contexto (L1/L2/L3) com lógica de fallback baseada no intelligence score.

---

## 📋 CONTEXTO RÁPIDO

**Phase 2.3B:** Backend Integration — Context Layering System
- **B1-B3:** Context Builder completo ✅ (`lib/domain/campaigns/context-builder.ts`)
- **B5:** Registry Loader completo ✅ (`lib/ai/prompts/registries/loader.ts`)
- **B4:** Prompt Renderer **← VOCÊ ESTÁ AQUI**

**Arquitetura:**
```
buildCampaignPrompt(storeId, campaignType)
  ↓
  fetchStoreMetadata(storeId) → L1
  fetchIntelligenceContext(storeId) → L2 + score
  buildAgenticPersona(segment, location) → L3
  ↓
  Render Template com fallback logic
```

---

## 📐 ESPECIFICAÇÃO TÉCNICA

### Arquivo a Criar
**Path:** `lib/ai/prompts/prompt-renderer.ts`

### Interface Principal

```typescript
/**
 * Monta o prompt final da campanha integrando L1/L2/L3
 * 
 * @param storeId - UUID da loja
 * @param campaignType - Tipo de campanha (e.g., "promocao", "lancamento")
 * @param options - Opções adicionais (feature flags, client injection)
 * @returns Prompt completo renderizado
 */
export async function buildCampaignPrompt(
  storeId: string,
  campaignType: string,
  options?: {
    intelligenceThreshold?: number;  // Default: 30
    useL3Persona?: boolean;          // Default: true
    client?: any;                    // Test injection
  }
): Promise<string>
```

### Lógica de Fallback

**Regra de threshold (ADR):**
- `intelligenceScore < 30` → Usar apenas **L1 + L3** (ignora L2)
- `intelligenceScore >= 30` → Usar **L1 + L2 + L3** (contexto completo)

**Motivo:** Dados de L2 com baixa completude (~30%) podem introduzir ruído. Melhor confiar na expertise agêntica (L3) até que calibração atinja nível mínimo.

---

## 🏗️ ESTRUTURA DO PROMPT (Template)

Use o template existente como referência: `lib/ai/prompts/templates/campaign-prompt-v1.ts`

### Seções do Prompt (ordem)

```xml
<system>
VOCÊ É: {L3.segmentExpert.segment_name} especializado em {L3.regionalExpert.region_name}

EXPERTISE:
{L3.segmentExpert.expertise[]} (lista bullets)

CONTEXTO REGIONAL:
{L3.regionalExpert.cultural_context}
- Eventos locais: {L3.regionalExpert.local_business_insights.local_events[]}
- Vocabulário: {L3.regionalExpert.cultural_context.vocabulary[]}
- Concorrência: {L3.regionalExpert.competitive_landscape[]}
</system>

<store_context>
INFORMAÇÕES DA LOJA:
- Nome: {L1.name}
- Segmento: {L1.mainSegment}
- Localização: {L1.location.city}/{L1.location.state} - {L1.location.neighborhood}
- Posicionamento: {L1.brandPositioning}
- Tom de voz: {L1.toneOfVoice}
- Contato: {L1.contact.whatsapp || L1.contact.phone}
</store_context>

{IF intelligenceScore >= 30}
<intelligence_calibration>
PREFERÊNCIAS CALIBRADAS DO LOJISTA (Intelligence Score: {intelligenceScore}%):

{IF L2.context.brand_voice}
- Tom de marca: {L2.context.brand_voice}
{/IF}

{IF L2.context.target_audience}
- Público-alvo: {L2.context.target_audience}
{/IF}

{IF L2.context.unique_selling_proposition}
- Diferencial: {L2.context.unique_selling_proposition}
{/IF}

{IF L2.context.seasonal_peaks?.length > 0}
- Sazonalidade: {L2.context.seasonal_peaks.join(', ')}
{/IF}

{IF L2.context.successful_past_ctas?.length > 0}
- CTAs testados: {L2.context.successful_past_ctas.join(', ')}
{/IF}

{IF L2.context.conversion_triggers?.length > 0}
- Gatilhos: {L2.context.conversion_triggers.join(', ')}
{/IF}

{IF L2.context.price_positioning}
- Preço: {L2.context.price_positioning}
{/IF}

{IF L2.context.competitors?.length > 0}
- Concorrentes: {L2.context.competitors.join(', ')}
{/IF}

{IF L2.context.customer_pain_points?.length > 0}
- Dores: {L2.context.customer_pain_points.join(', ')}
{/IF}

⚠️ IMPORTANTE: Use PRIORITARIAMENTE essas preferências calibradas pelo lojista.
</intelligence_calibration>
{ELSE}
<intelligence_calibration>
⚠️ Loja sem calibração (Intelligence Score: {intelligenceScore}%)
→ Use sua expertise de mercado ({L3.segmentExpert.segment_name} + {L3.regionalExpert.region_name})
</intelligence_calibration>
{/IF}

<task>
TAREFA:
Crie uma campanha de {campaignType} para {L1.name}.

FORMATO ESPERADO:
- Título: [título impactante]
- Corpo: [texto persuasivo com 2-3 parágrafos]
- CTA: [call-to-action claro e direto]
- Hashtags: [3-5 hashtags relevantes]

RESTRIÇÕES:
- Tom de voz: {IF intelligenceScore >= 30}{L2.context.brand_voice || L1.toneOfVoice}{ELSE}{L1.toneOfVoice || "profissional mas acessível"}{/IF}
- Referências locais: Use {L3.regionalExpert.cultural_context.vocabulary[]} quando apropriado
- Sazonalidade: Considere {L3.segmentExpert.seasonal_patterns[currentSeason] || L2.context.seasonal_peaks[]}
- Concorrência: Diferencie de {L3.regionalExpert.competitive_landscape[] || L2.context.competitors[]}
</task>
```

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

### Funcionais
- [ ] Função `buildCampaignPrompt()` exportada e documentada
- [ ] Integra L1 via `fetchStoreMetadata(storeId)`
- [ ] Integra L2 via `fetchIntelligenceContext(storeId)`
- [ ] Integra L3 via `buildAgenticPersona(segment, location)`
- [ ] Implementa threshold logic (score < 30 vs >= 30)
- [ ] Renderiza todas as seções XML do template
- [ ] Formata arrays como bullet lists
- [ ] Trata valores nulos/undefined gracefully

### Não-Funcionais
- [ ] TypeScript compilation sem erros
- [ ] ESLint sem warnings
- [ ] Imports relativos com `.ts` extensions
- [ ] Lazy loading de Supabase client (test compatibility)
- [ ] Documentação JSDoc completa

### Testes
- [ ] Test 1: Prompt com score < 30 (apenas L1+L3)
- [ ] Test 2: Prompt com score >= 30 (L1+L2+L3)
- [ ] Test 3: Persona agêntica injetada corretamente
- [ ] Test 4: Arrays formatados como bullets
- [ ] Test 5: Campos nulos não quebram template
- [ ] Test 6: Threshold customizado via options
- [ ] Test 7: Mock client injection funciona
- [ ] Test 8: Campaign type dinâmico renderizado

**Meta:** 8/8 tests passing

---

## 🧪 TESTES ESPERADOS

### Arquivo: `lib/ai/prompts/prompt-renderer.test.ts`

```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildCampaignPrompt } from './prompt-renderer.ts';

describe('Prompt Renderer', () => {
  it('should render prompt with L1+L3 when score < 30', async () => {
    const mockClient = createMockClient({
      intelligenceScore: 20,
      storeMetadata: { name: 'Adega do João', segment: 'bebidas_alcoolicas' }
    });
    
    const prompt = await buildCampaignPrompt('store-123', 'promocao', { client: mockClient });
    
    assert.ok(prompt.includes('⚠️ Loja sem calibração'));
    assert.ok(prompt.includes('Adega do João'));
    assert.ok(prompt.includes('Especialista em Marketing'));
  });

  it('should render prompt with L1+L2+L3 when score >= 30', async () => {
    const mockClient = createMockClient({
      intelligenceScore: 75,
      intelligenceContext: { brand_voice: 'informal e acolhedor' }
    });
    
    const prompt = await buildCampaignPrompt('store-123', 'promocao', { client: mockClient });
    
    assert.ok(prompt.includes('PREFERÊNCIAS CALIBRADAS'));
    assert.ok(prompt.includes('informal e acolhedor'));
    assert.ok(prompt.includes('Intelligence Score: 75%'));
  });

  it('should inject segment + regional persona correctly', async () => {
    const mockClient = createMockClient({
      storeMetadata: { segment: 'bebidas_alcoolicas', city: 'São Paulo', state: 'SP' }
    });
    
    const prompt = await buildCampaignPrompt('store-123', 'promocao', { client: mockClient });
    
    assert.ok(prompt.includes('Especialista em Marketing para Adegas'));
    assert.ok(prompt.includes('SP-capital') || prompt.includes('São Paulo'));
  });

  it('should format arrays as bullet lists', async () => {
    const mockClient = createMockClient({
      intelligenceScore: 60,
      intelligenceContext: {
        seasonal_peaks: ['Verão', 'Natal'],
        successful_past_ctas: ['Compre já', 'Aproveite']
      }
    });
    
    const prompt = await buildCampaignPrompt('store-123', 'promocao', { client: mockClient });
    
    assert.ok(prompt.includes('- Verão') || prompt.includes('Verão, Natal'));
    assert.ok(prompt.includes('Compre já'));
  });

  it('should handle null values gracefully', async () => {
    const mockClient = createMockClient({
      storeMetadata: { name: 'Test', segment: 'mercearia', city: null }
    });
    
    const prompt = await buildCampaignPrompt('store-123', 'promocao', { client: mockClient });
    
    assert.ok(prompt); // Não deve lançar erro
    assert.ok(prompt.includes('Test'));
  });

  it('should allow custom threshold via options', async () => {
    const mockClient = createMockClient({ intelligenceScore: 40 });
    
    const prompt = await buildCampaignPrompt('store-123', 'promocao', { 
      client: mockClient,
      intelligenceThreshold: 50 
    });
    
    assert.ok(prompt.includes('⚠️ Loja sem calibração')); // 40 < 50
  });

  it('should render campaign type dynamically', async () => {
    const mockClient = createMockClient({});
    
    const prompt = await buildCampaignPrompt('store-123', 'lancamento', { client: mockClient });
    
    assert.ok(prompt.includes('lancamento'));
  });

  it('should work with mocked client injection', async () => {
    const mockClient = createMockClient({});
    
    const prompt = await buildCampaignPrompt('store-123', 'promocao', { client: mockClient });
    
    assert.ok(prompt.length > 0);
  });
});

// Helper para criar mock client
function createMockClient(overrides: any) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: overrides.storeMetadata || {},
            error: null
          })
        })
      })
    }),
    rpc: () => Promise.resolve({
      data: [{ completeness: overrides.intelligenceScore || 0 }],
      error: null
    })
  };
}
```

---

## 📚 REFERÊNCIAS

### Arquivos Existentes (para consulta)
1. **Context Builder:** `lib/domain/campaigns/context-builder.ts`
   - Funções: `fetchStoreMetadata()`, `fetchIntelligenceContext()`, `buildAgenticPersona()`, `buildPromptContext()`
   - Interfaces: `StoreMetadata`, `IntelligenceContext`, `PromptAssemblyContext`

2. **Registry Loader:** `lib/ai/prompts/registries/loader.ts`
   - Funções: `loadSegmentExpert()`, `loadRegionalExpert()`, `buildL3Context()`
   - Interfaces: `SegmentExpert`, `RegionalExpert`

3. **Template v1:** `lib/ai/prompts/templates/campaign-prompt-v1.ts`
   - Template completo com XML sections (referência de estrutura)

4. **Types:** `lib/ai/prompts/registries/types.ts`
   - Interfaces: `SegmentExpert`, `RegionalExpert`

### Registries YAML (contexto L3)
- `lib/ai/prompts/registries/bebidas-alcoolicas/segment-expert.yaml`
- `lib/ai/prompts/registries/bebidas-alcoolicas/regional/SP-capital.yaml`
- `lib/ai/prompts/registries/mercearia/segment-expert.yaml`
- `lib/ai/prompts/registries/mercearia/regional/SP-capital.yaml`

### Documentação
- **Tracker:** `docs/phase-2.3-backend-integration-tracker.md` (seção Phase 2.3B)
- **Token Budget:** `docs/phase-2.3-token-budget-analysis.md`
- **Session Closure:** `docs/sessions/session-2026-05-05-closure.md`

---

## 🚨 ATENÇÕES ESPECIAIS

### 1. Test Compatibility
- Use **relative imports** com `.ts` extensions
- **Lazy load** Supabase client dentro de funções async
- Não importe `next/headers` no top-level

### 2. Template Rendering
- Use **template literals** (backticks) para montar o prompt
- Trate **arrays** com `.join(', ')` ou `.map()` para bullets
- Valide **null/undefined** antes de renderizar: `field || 'fallback'`

### 3. Performance
- Faça **parallel fetching** de L1, L2, L3 quando possível
- Reutilize função `buildPromptContext()` do context-builder (já faz isso)
- Cache de registries já implementado no loader (não precisa se preocupar)

### 4. Extensibilidade
- Função deve ser **facilmente extensível** para novos campaign types
- Considere criar helpers internos: `formatStoreContext()`, `formatIntelligenceSection()`, `formatPersona()`
- Use **options object** para feature flags futuras

---

## 📝 CHECKLIST PRÉ-IMPLEMENTAÇÃO

Antes de começar, valide:
- [x] B1-B3 completos (`context-builder.ts` existe e funciona)
- [x] B5 completo (`loader.ts` existe e funciona)
- [x] Registries YAML existem (2 segmentos × 3 regiões)
- [x] Template v1 existe como referência
- [x] TypeScript config permite `.ts` imports
- [x] Supabase client disponível (via import ou injection)

**Todos os checkboxes acima estão ✅**

---

## 🎯 ENTREGA ESPERADA

### Arquivos a Criar
1. `lib/ai/prompts/prompt-renderer.ts` (~200-250 linhas)
2. `lib/ai/prompts/prompt-renderer.test.ts` (~150-200 linhas)

### Critérios de DONE
- [ ] 8/8 unit tests passing
- [ ] TypeScript compilation OK (`tsc --noEmit`)
- [ ] ESLint OK (`npm run lint`)
- [ ] Documentação JSDoc completa
- [ ] Commit message: `feat(B4): implement prompt renderer with L1/L2/L3 integration`

---

## ⏱️ ESTIMATIVA DE ESFORÇO

| Fase | Tempo Estimado |
|------|----------------|
| Setup inicial + interfaces | 15 min |
| Implementação core logic | 45 min |
| Template rendering | 30 min |
| Testes unitários | 30 min |
| Refinamento + docs | 20 min |
| **TOTAL** | **~2h20min** |

---

## 🚀 PRÓXIMOS PASSOS (após B4)

Após completar B4, o @dev deve atualizar o tracker:
- Marcar B4 como ✅ COMPLETED
- Atualizar progress: Phase 2.3B → 50% (5/10)
- Próxima task: **B6 - Token Optimizer**

---

**Boa implementação, @dev!** 🎯

*Se tiver dúvidas, consulte os arquivos de referência listados acima ou peça suporte ao @aiox-master.*
