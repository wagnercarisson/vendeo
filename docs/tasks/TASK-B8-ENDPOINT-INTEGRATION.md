# TASK B8 — Integração no Endpoint /api/generate/campaign

**Agente Responsável:** @dev (Dex)  
**Data de Criação:** 05 Mai 2026  
**Prioridade:** 🔴 ALTA — Validação fim-a-fim do Context Layering System  
**Estimativa:** 2-3 horas  
**Dependências:** ✅ B1-B5 (todas completas)

---

## 🎯 OBJETIVO

Integrar o novo Prompt Renderer (B4) no endpoint `/app/api/generate/campaign/route.ts`, substituindo o prompt genérico atual pelo sistema de contexto em 3 camadas (L1/L2/L3) com fallback inteligente.

---

## 📋 CONTEXTO RÁPIDO

**Phase 2.3B:** Backend Integration — Context Layering System
- **B1-B5:** Infraestrutura completa ✅ (context-builder, registry loader, prompt-renderer)
- **B8:** Endpoint Integration **← VOCÊ ESTÁ AQUI**

**Fluxo Atual (ANTES):**
```
POST /api/generate/campaign
  ↓
  generateCampaignContent() em lib/domain/campaigns/service.ts
  ↓
  buildCampaignPrompt() em lib/domain/campaigns/prompts.ts (GENÉRICO)
  ↓
  callAIWithRetry() → OpenAI
```

**Fluxo Novo (DEPOIS):**
```
POST /api/generate/campaign
  ↓
  generateCampaignContent() em lib/domain/campaigns/service.ts
  ↓
  buildCampaignPrompt() em lib/ai/prompts/prompt-renderer.ts (L1+L2+L3)
  ↓
  callAIWithRetry() → OpenAI
```

---

## 📐 ESPECIFICAÇÃO TÉCNICA

### Arquivos a Modificar

**1. `lib/domain/campaigns/service.ts`**
- Importar novo `buildCampaignPrompt` do `prompt-renderer.ts`
- Adaptar chamada de prompt para novo contrato
- Manter backward compatibility com feature flag (opcional)

**2. `lib/domain/campaigns/prompts.ts`**
- Deprecar (não deletar): renomear para `buildCampaignPromptLegacy`
- Adicionar comentário: "DEPRECATED: Use prompt-renderer.ts (B4)"

**3. Criar `lib/constants/feature-flags.ts` (se não existir)**
- Flag: `USE_CONTEXT_LAYERING_PROMPT` (default: true)
- Permitir rollback rápido se necessário

---

## 🔧 IMPLEMENTAÇÃO PASSO A PASSO

### Passo 1: Feature Flag (Opcional)

**Arquivo:** `lib/constants/feature-flags.ts`

```typescript
/**
 * Feature Flags — Phase 2.3B Backend Integration
 */

export const FEATURE_FLAGS = {
  /**
   * Habilita Context Layering System (L1/L2/L3) no prompt de campanha.
   * 
   * - true: Usa prompt-renderer.ts (B4) com inteligência contextual
   * - false: Usa prompts.ts legado (genérico)
   * 
   * Default: true (após validação B8)
   */
  USE_CONTEXT_LAYERING_PROMPT: true,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
```

### Passo 2: Deprecar Prompt Legado

**Arquivo:** `lib/domain/campaigns/prompts.ts`

```typescript
import { CampaignContext } from "./types";
import { StoreContext } from "@/lib/domain/stores/types";

/**
 * DEPRECATED: Use buildCampaignPrompt from lib/ai/prompts/prompt-renderer.ts
 * 
 * Este prompt genérico foi substituído pelo Context Layering System (Phase 2.3B).
 * Mantido apenas para rollback emergencial via feature flag.
 * 
 * @deprecated Será removido na Phase 2.4
 */
export function buildCampaignPromptLegacy(
  campaign: CampaignContext,
  store: StoreContext,
  description?: string
): string {
  // ... código atual permanece inalterado ...
}
```

### Passo 3: Integrar Novo Renderer

**Arquivo:** `lib/domain/campaigns/service.ts`

**Imports a adicionar:**
```typescript
import { buildCampaignPrompt as buildContextLayeredPrompt } from '@/lib/ai/prompts/prompt-renderer.ts';
import { buildCampaignPromptLegacy } from './prompts.ts';
import { FEATURE_FLAGS } from '@/lib/constants/feature-flags.ts';
```

**Substituir chamada de prompt (linha ~85):**

```typescript
// ANTES:
const prompt = buildCampaignPrompt(campaignCtx, store, description);

// DEPOIS:
let prompt: string;

if (FEATURE_FLAGS.USE_CONTEXT_LAYERING_PROMPT) {
  // Novo sistema (B4) — L1+L2+L3 com threshold logic
  try {
    prompt = await buildContextLayeredPrompt(storeId, 'promocao', {
      intelligenceThreshold: 30, // Default ADR
    });
    
    // Adiciona contexto específico da campanha ao final do prompt
    const campaignSpecificContext = `

CONTEXTO ESPECÍFICO DA CAMPANHA:
- PRODUTO: ${campaign.product_name} (Preço: ${campaign.price ?? "não informado"})
- ESTRATÉGIA: ${campaign.objective} para ${campaign.audience}
- RACIOCÍNIO VAREJISTA: ${campaign.theme || description || "Focar no desejo imediato e benefícios do produto"}
- DATA ATUAL: ${new Date().toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })}

FORMATO OBRIGATÓRIO (JSON PURO):
{
  "headline": "TÍTULO CURTO (MÁX 25 CARAC)",
  "text": "FRASE DE APOIO PARA A ARTE (MÁX 60 CARAC)",
  "caption": "Legenda persuasiva com emojis e sotaque local",
  "cta": "Ação direta no gênero correto",
  "hashtags": "#tag1 #tag2 #tag3"
}
`;
    
    prompt = prompt + campaignSpecificContext;
  } catch (err) {
    // Fallback para prompt legado em caso de erro no novo sistema
    console.warn('[generateCampaignContent] Context layering failed, using legacy prompt:', err);
    prompt = buildCampaignPromptLegacy(campaignCtx, store, description);
  }
} else {
  // Sistema legado (rollback manual via feature flag)
  prompt = buildCampaignPromptLegacy(campaignCtx, store, description);
}

const { data: aiData } = await callAIWithRetry(prompt, CampaignAISchema, { temperature: 0.7 });
```

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

### Funcionais
- [ ] Novo `buildCampaignPrompt` do `prompt-renderer.ts` integrado
- [ ] Feature flag `USE_CONTEXT_LAYERING_PROMPT` implementada
- [ ] Prompt legado renomeado para `buildCampaignPromptLegacy`
- [ ] Fallback automático para prompt legado em caso de erro
- [ ] Contexto específico da campanha (produto, preço, estratégia) adicionado ao prompt L1+L2+L3
- [ ] JSON output format preservado (headline, text, caption, cta, hashtags)
- [ ] Endpoint responde com mesma estrutura (backward compatible)

### Não-Funcionais
- [ ] TypeScript compilation sem erros
- [ ] Imports relativos com `.ts` extensions
- [ ] Error handling robusto (try/catch com fallback)
- [ ] Logging de qual sistema foi usado (legacy vs. layered)
- [ ] Performance: latência não aumenta > 200ms

### Testes de Validação
- [ ] Test 1: POST com store intelligence score < 30 (usa L1+L3)
- [ ] Test 2: POST com store intelligence score >= 30 (usa L1+L2+L3)
- [ ] Test 3: Feature flag desligada (usa prompt legado)
- [ ] Test 4: Erro no novo sistema (fallback funciona)
- [ ] Test 5: Output JSON válido em todos os cenários
- [ ] Test 6: Campos específicos da campanha aparecem no prompt

**Meta:** 6/6 cenários validados ✅

---

## 🧪 TESTES MANUAIS RECOMENDADOS

### Setup de Teste

**1. Store com Intelligence Baixa (score < 30):**
```sql
-- No Supabase SQL Editor
UPDATE store_intelligence
SET context = '{"schema_version": "2.1", "brand_voice": "informal"}'::jsonb
WHERE store_id = 'sua-store-id-aqui';
```

**2. Store com Intelligence Alta (score >= 30):**
```sql
UPDATE store_intelligence
SET context = '{
  "schema_version": "2.1",
  "brand_voice": "informal e acolhedor",
  "target_audience": "adultos urbanos",
  "seasonal_peaks": ["Verão", "Natal"],
  "successful_past_ctas": ["Garanta já", "Aproveite"],
  "price_positioning": "premium de bairro",
  "competitors": ["Carrefour", "Pão de Açúcar"]
}'::jsonb
WHERE store_id = 'sua-store-id-aqui';
```

### Cenários de Teste

**Teste 1: Intelligence Score < 30**
- Criar campanha com produto "Cerveja Artesanal"
- Gerar conteúdo via endpoint
- **Expectativa:** Prompt usa L1+L3 (sem calibração), persona regional aparece
- **Validar:** Resposta JSON com headline, caption, cta válidos

**Teste 2: Intelligence Score >= 30**
- Criar campanha com produto "Vinho Tinto Premium"
- Gerar conteúdo via endpoint
- **Expectativa:** Prompt usa L1+L2+L3, preferências calibradas aparecem
- **Validar:** Resposta reflete brand_voice="informal e acolhedor"

**Teste 3: Feature Flag Desligada**
- Mudar `USE_CONTEXT_LAYERING_PROMPT: false` em feature-flags.ts
- Gerar conteúdo
- **Expectativa:** Usa prompt legado (sem L1/L2/L3)
- **Validar:** Funciona normalmente (rollback funcional)

**Teste 4: Região Não Suportada**
- Store com city="Curitiba", state="PR"
- Gerar conteúdo
- **Expectativa:** Fallback para prompt legado (erro capturado)
- **Validar:** Resposta JSON válida, sem crash

**Teste 5: Campo Nulo na Campaign**
- Campanha com price=null, theme=null
- Gerar conteúdo
- **Expectativa:** Valores nulos tratados gracefully
- **Validar:** Prompt renderizado sem quebras

**Teste 6: Validação de Output**
- Gerar conteúdo com qualquer store
- **Validar estrutura JSON:**
  - `headline` presente e <= 25 caracteres?
  - `text` presente e <= 60 caracteres?
  - `caption` presente com emojis?
  - `cta` presente e contextual?
  - `hashtags` presente com formato correto?

---

## 📚 REFERÊNCIAS

### Arquivos Existentes (para consulta)
1. **Prompt Renderer:** `lib/ai/prompts/prompt-renderer.ts`
   - Função: `buildCampaignPrompt(storeId, campaignType, options)`
   - Retorna: Prompt completo com L1/L2/L3 em XML

2. **Service Atual:** `lib/domain/campaigns/service.ts`
   - Função: `generateCampaignContent(input)` (linha ~27)
   - Local da integração: linha ~85 (chamada de buildCampaignPrompt)

3. **Prompt Legado:** `lib/domain/campaigns/prompts.ts`
   - Função: `buildCampaignPrompt(campaign, store, description)`
   - Para deprecar: renomear para `buildCampaignPromptLegacy`

4. **Context Builder:** `lib/domain/campaigns/context-builder.ts`
   - Funções: `buildPromptContext(storeId, options)`
   - Usado internamente pelo renderer (não chamar diretamente)

### Documentação
- **Tracker:** `docs/phase-2.3-backend-integration-tracker.md` (seção Phase 2.3B)
- **Task B4:** `docs/tasks/TASK-B4-PROMPT-RENDERER.md` (spec do renderer)
- **ADR Context Layering:** (referência para threshold de 30%)

---

## 🚨 ATENÇÕES ESPECIAIS

### 1. Campaign Type Mapping

O novo renderer espera `campaignType` (string). Mapear do contexto da campanha:
- Default: `'promocao'` (maioria dos casos)
- Se `campaign.objective` contém "lançamento": `'lancamento'`
- Se `campaign.weekly_plan_item_id`: usar `strategicTheme` como tipo

### 2. Preservar Output Format

O endpoint atual retorna:
```typescript
{
  headline: string,
  caption: string,
  text: string,
  cta: string,
  hashtags: string
}
```

**Garantir que o novo prompt mantém esse formato no JSON output.**

### 3. Error Handling Robusto

```typescript
try {
  prompt = await buildContextLayeredPrompt(...);
} catch (err) {
  console.warn('[generateCampaignContent] Context layering failed:', err);
  prompt = buildCampaignPromptLegacy(...);
  // Sistema degrada gracefully, usuário não percebe
}
```

### 4. Logging para Observabilidade

```typescript
console.log('[generateCampaignContent] Using context-layered prompt', {
  storeId,
  campaign_id,
  intelligenceScore: '(será extraído do context)',
  useL2: '(threshold check)',
});
```

### 5. Performance Budget

- Novo prompt pode adicionar ~100-200ms devido a:
  - Query adicional para `store_intelligence` (já feita no context-builder)
  - Carregamento de registries YAML (cached após primeira chamada)
- **Aceitável:** < 200ms overhead
- **Se > 200ms:** Investigar caching de registries

---

## 📝 CHECKLIST PRÉ-IMPLEMENTAÇÃO

Antes de começar, valide:
- [x] B4 completo (`prompt-renderer.ts` existe e funciona)
- [x] Context-builder expõe `buildPromptContext(storeId, options)`
- [x] Registries YAML existem (2 segmentos × 3 regiões)
- [x] Service atual em `lib/domain/campaigns/service.ts` identificado
- [x] Prompt legado em `lib/domain/campaigns/prompts.ts` identificado
- [ ] Feature flags file criado (ou adaptar existente)

**5/6 checkboxes ✅** — Apenas feature-flags.ts falta criar

---

## 🎯 ENTREGA ESPERADA

### Arquivos a Criar
1. `lib/constants/feature-flags.ts` (~15 linhas)

### Arquivos a Modificar
1. `lib/domain/campaigns/service.ts` (~30 linhas modificadas)
2. `lib/domain/campaigns/prompts.ts` (~5 linhas: renomear + comentário)

### Critérios de DONE
- [ ] 6/6 testes manuais validados
- [ ] TypeScript compilation OK (`tsc --noEmit`)
- [ ] Endpoint responde normalmente em todos os cenários
- [ ] Feature flag funciona (liga/desliga novo sistema)
- [ ] Fallback funciona (erro → prompt legado)
- [ ] Commit message: `feat(B8): integrate context layering prompt in campaign endpoint`

---

## ⏱️ ESTIMATIVA DE ESFORÇO

| Fase | Tempo Estimado |
|------|----------------|
| Setup feature flags | 10 min |
| Deprecar prompt legado | 5 min |
| Integrar novo renderer | 30 min |
| Adaptar contexto específico | 20 min |
| Testes manuais (6 cenários) | 45 min |
| Refinamento + docs | 15 min |
| **TOTAL** | **~2h05min** |

---

## 🚀 PRÓXIMOS PASSOS (após B8)

Após completar B8, validar:
1. **A/B Testing (opcional):** Comparar outputs do prompt legado vs. layered
2. **B10 - Logging & Observability:** Adicionar métricas de qual layer foi usado
3. **Phase 2.3C - Validation:** Testes automatizados E2E

**Próxima task prioritária:** B10 (Observability) ou C1 (Test Suite)

---

**Boa implementação, @dev!** 🎯

*Se tiver dúvidas, consulte os arquivos de referência listados acima ou peça suporte ao @aiox-master.*
