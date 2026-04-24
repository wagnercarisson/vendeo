# Vendeo — Fluxos Críticos

**Data:** 2026-04-22  
**Objetivo:** Documentar fluxos que NÃO PODEM REGREDIR  
**Status:** 🔴 CRÍTICO — Qualquer quebra nestes fluxos é BLOCKER

---

## 🎯 COMO USAR ESTE DOCUMENTO

**Antes de qualquer mudança no código:**
1. Leia TODOS os fluxos críticos
2. Identifique quais serão afetados pela sua mudança
3. Teste MANUALMENTE cada fluxo afetado
4. Execute testes de regressão automatizados (ver REGRESSION-TESTS.md)

**Se um fluxo crítico quebrar:**
1. PARE imediatamente
2. Reverta mudança
3. Documente o problema
4. Planeje correção adequada

---

## 📊 MATRIZ DE FLUXOS CRÍTICOS

| ID | Fluxo | Severidade | Status |
|----|-------|------------|--------|
| F1 | Criação de Campanha Manual | 🔴 CRÍTICO | ✅ FUNCIONAL |
| F2 | Geração de Conteúdo (Copy) | 🔴 CRÍTICO | ⚠️ INCOMPLETO |
| F3 | Preview e Aprovação de Arte | 🔴 CRÍTICO | ✅ FUNCIONAL |
| F4 | Validação Produto vs Imagem | 🔴 CRÍTICO | ❌ NÃO INTEGRADO |
| F5 | Regeneração de Campanha | 🟡 ALTO | ✅ FUNCIONAL |
| F6 | Criação de Weekly Plan | 🟡 ALTO | ✅ FUNCIONAL |
| F7 | Orquestração de Campanha via Plano | 🟡 ALTO | ✅ FUNCIONAL |
| F8 | Visual Reader (Isolado) | 🟢 MÉDIO | ✅ FUNCIONAL (Sandbox) |

---

## 🔴 FLUXO 1: Criação de Campanha Manual

### Descrição
Lojista cria campanha do zero, preenchendo manualmente dados do produto e estratégia.

### Etapas

```
1. Usuário acessa /dashboard/campaigns/new
   ↓
2. Preenche dados do produto:
   - type: "product" | "service" | "message"
   - product_name: string (obrigatório)
   - price: string (opcional)
   - description: string (opcional)
   - image_url: string (upload de imagem)
   ↓
3. Preenche estratégia:
   - audience: string (obrigatório)
   - objective: string (obrigatório)
   - product_positioning: string (obrigatório)
   - generate_post: boolean (padrão: true)
   - generate_reels: boolean (padrão: false)
   ↓
4. Clica "Gerar Campanha"
   ↓
5. Sistema salva rascunho no banco (status: draft)
   ↓
6. Sistema chama POST /api/generate/campaign
   - campaign_id
   - force: false
   - persist: true
   ↓
7. API executa generateCampaignContent():
   a. Busca campanha no banco
   b. Valida dados mínimos
   c. Busca contexto da loja
   d. ❌ PROBLEMA: NÃO chama Visual Reader
   e. Monta prompt (buildCampaignPrompt)
   f. Chama IA (OpenAI GPT-4)
   g. Normaliza resposta
   h. Persiste: headline, ai_caption, ai_text, ai_cta, ai_hashtags
   i. Atualiza status: ready
   ↓
8. UI recebe resposta e exibe preview
   ↓
9. Usuário vê preview de arte e texto
   ↓
10. Usuário pode:
    - Editar texto
    - Regenerar
    - Aprovar
    - Cancelar
```

### Entry Points

| Componente | Path |
|------------|------|
| UI (Inicial) | app/dashboard/campaigns/new/page.tsx |
| Shell | app/dashboard/campaigns/new/_components/NewCampaignShell.tsx |
| API | app/api/generate/campaign/route.ts |
| Service | lib/domain/campaigns/service.ts (generateCampaignContent) |
| Prompt | lib/domain/campaigns/prompts.ts (buildCampaignPrompt) |

### O QUE NÃO PODE REGREDIR

- ✅ Validação de campos obrigatórios (product_name, audience, objective)
- ✅ Salvamento de rascunho no banco
- ✅ Geração de texto (headline, caption, text, cta, hashtags)
- ✅ Preview de arte funcional
- ✅ Persistência de conteúdo gerado
- ✅ Atualização de status (draft → ready)
- ✅ Resposta de erro clara se algo falhar

### PROBLEMA ATUAL

❌ **Visual Reader NÃO é chamado** (Etapa 7d)

**Consequência:**
- Sistema não valida se imagem corresponde ao produto
- Pode gerar copy de "Coca Cola 600ml" para imagem de "Pepsi 2L"
- Usuário recebe conteúdo inconsistente

**Onde deveria ser integrado:**
```typescript
// lib/domain/campaigns/service.ts - ANTES da linha 104

// 4.5) Análise visual (SE houver imagem)
let visualReaderResult = null;
if (campaign.product_image_url) {
  visualReaderResult = await readVisualTarget({
    imageUrl: campaign.product_image_url,
    targetLabel: campaign.content_type === "product" ? "produto" : "serviço",
    productName: campaign.product_name,  // ⚠️ CRÍTICO
    category: store.main_segment || undefined
  });
  
  // 4.6) Validar inconsistência
  if (visualReaderResult.matchType !== "exact") {
    console.warn(`[INCONSISTENCY] Product mismatch detected:
      Expected: ${campaign.product_name}
      Found: ${visualReaderResult.matchedTarget || "unknown"}
      matchType: ${visualReaderResult.matchType}
    `);
    // TODO: Alertar usuário ou usar matchedTarget no prompt
  }
}

// 5) Monta prompt COM visual reader result
const prompt = buildCampaignPrompt(
  campaignCtx, 
  store, 
  visualReaderResult,  // ⚠️ Atualmente é null
  description
);
```

### COMO TESTAR

**Manual (E2E):**
1. Login no sistema
2. Acessar /dashboard/campaigns/new
3. Preencher:
   - Nome: "Coca Cola 600ml"
   - Preço: "5.99"
   - Upload imagem de Coca Cola
   - Público: "Geral"
   - Objetivo: "Promoção"
   - Posicionamento: "Popular"
4. Clicar "Gerar Campanha"
5. Aguardar geração (~5-10s)
6. Verificar:
   - ✅ Preview aparece
   - ✅ Headline, caption, text, cta preenchidos
   - ✅ Arte renderizada
   - ✅ Botões "Editar", "Regenerar", "Aprovar" visíveis

**Automatizado:**
```bash
npm run test -- --grep "Criação de campanha manual"
```

### Dependências

**Banco de Dados:**
- Tabela: `campaigns`
- Campos críticos: product_name, audience, objective, status, ai_caption, headline

**APIs Externas:**
- OpenAI GPT-4 (geração de texto)

**Módulos:**
- lib/domain/campaigns/
- lib/domain/stores/
- lib/ai/

---

## 🔴 FLUXO 2: Geração de Conteúdo (Copy)

### Descrição
Sistema gera headline, caption, text, CTA e hashtags baseados em produto, loja e estratégia.

### Etapas

```
1. Recebe request com campaign_id
   ↓
2. Busca campanha no banco
   ↓
3. Normaliza para domínio (snake_case → camelCase)
   ↓
4. Valida dados mínimos:
   - product_name preenchido
   - audience preenchida
   - objective preenchido
   ↓
5. Busca contexto da loja:
   - name, city, state
   - main_segment
   - tone_of_voice
   - brand_positioning
   - brand_profile (cores, logo, contato)
   ↓
6. ❌ PROBLEMA: Pula Visual Reader
   ↓
7. Monta prompt com:
   - Contexto da loja
   - Contexto da campanha
   - Data atual (sazonalidade)
   - Diretrizes de escrita:
     * Concordância de gênero
     * Respeito ao nicho (pet shop, varejo, etc)
     * Foco no "UAU" (sem clichês)
     * Headline ≤ 25 caracteres
     * Body ≤ 60 caracteres
     * CTA contextual
   ↓
8. Chama OpenAI GPT-4:
   - model: "gpt-4"
   - temperature: 0.7
   - response_format: JSON
   ↓
9. Recebe resposta:
   {
     headline: string,
     text: string,
     caption: string,
     cta: string,
     hashtags: string
   }
   ↓
10. Normaliza/valida resposta (Zod schema)
    ↓
11. Persiste no banco:
    - headline
    - ai_caption
    - ai_text
    - ai_cta
    - ai_hashtags
    - ai_generated_at
    - status: "ready"
    ↓
12. Retorna para UI
```

### O QUE NÃO PODE REGREDIR

- ✅ Geração de texto funcional
- ✅ Concordância de gênero correta
- ✅ Respeito ao tom de voz da loja
- ✅ Sazonalidade adequada (datas comemorativas)
- ✅ CTA contextual (não genérico "Compre agora")
- ✅ Hashtags relevantes
- ✅ Formato JSON válido
- ✅ Persistência no banco

### PROBLEMA ATUAL

❌ **Prompt é "cego"** em relação à imagem

**Cenário problemático:**
```
Usuário:
- product_name: "Coca Cola 600ml"
- image_url: [foto de Pepsi 2L]

Prompt enviado à IA:
- "PRODUTO: Coca Cola 600ml"
- (sem mencionar que a imagem é de Pepsi)

IA gera:
- headline: "Coca gelada!"
- caption: "Desfrute de uma Coca Cola bem gelada..."
- (copy correta para Coca, mas imagem é Pepsi)

Resultado:
❌ Copy inconsistente com imagem
❌ Usuário recebe conteúdo errado
```

### SOLUÇÃO NECESSÁRIA

**Modificação no prompt (buildCampaignPrompt):**

```typescript
// ADICIONAR seção ao prompt se visualReaderResult disponível
function buildVisualPromptSection(result: VisualReaderResult | null): string {
  if (!result) return "";
  
  if (result.matchType === "none") {
    return `
⚠️ ATENÇÃO: A imagem fornecida NÃO corresponde ao produto esperado.
- Esperado: [nome do produto]
- Imagem: não contém produto relevante
- Recomendação: Focar no texto, não mencionar características visuais específicas.
`;
  }
  
  if (result.matchType === "category_only") {
    return `
⚠️ ATENÇÃO: A imagem fornecida é semelhante mas NÃO é exata.
- Esperado: [product_name]
- Imagem contém: ${result.matchedTarget}
- Recomendação: Usar características GENÉRICAS da categoria, não mencionar marca/volume específico.
`;
  }
  
  if (result.matchType === "exact") {
    return `
✅ IMAGEM VALIDADA: A imagem corresponde ao produto.
- Produto detectado: ${result.matchedTarget}
- Confiança: ${result.confidence}
- Você pode mencionar características visuais específicas da imagem.
`;
  }
}
```

### COMO TESTAR

**Teste 1: Produto exato**
```
Input:
- product_name: "Coca Cola 600ml"
- image: Coca Cola 600ml

Esperado:
- Copy menciona Coca Cola
- Copy pode mencionar garr

afa, volume, cor vermelha
```

**Teste 2: Categoria semelhante**
```
Input:
- product_name: "Coca Cola 600ml"
- image: Pepsi 2L

Esperado:
- Copy NÃO menciona marca específica
- Copy usa termos genéricos: "refrigerante", "bebida gelada"
- OU alerta usuário da inconsistência
```

**Teste 3: Produto diferente**
```
Input:
- product_name: "Coca Cola 600ml"
- image: Hambúrguer

Esperado:
- Sistema detecta inconsistência total
- Alerta usuário: "Imagem não corresponde ao produto"
```

### Dependências

**Visual Reader:**
- lib/visual-reader/service.ts (readVisualTarget)

**LLM:**
- OpenAI GPT-4

---

## 🔴 FLUXO 3: Preview e Aprovação de Arte

### Descrição
Usuário visualiza arte gerada e pode aprovar, editar ou regenerar.

### Etapas

```
1. Após geração de conteúdo, UI exibe CampaignPreviewPanel
   ↓
2. Preview renderiza arte:
   - Fundo (cores do brand profile)
   - Imagem do produto (posicionada)
   - Headline (typography da marca)
   - Body text
   - Preço (se houver)
   - CTA
   - Logo e assinatura da loja
   ↓
3. Usuário vê preview e pode:
   a. Editar texto (abre modo de edição)
   b. Regenerar (chama API novamente)
   c. Aprovar (confirma arte final)
   d. Cancelar (volta ao dashboard)
   ↓
4. Se clicar "Aprovar":
   a. renderGraphicToBlob() → gera PNG 1080x1080
   b. Upload para Supabase Storage (campaigns/store-x/)
   c. registerApprovedAssetAction() → persiste URL
   d. Atualiza campanha: status = "approved"
   e. Redireciona para /dashboard
```

### O QUE NÃO PODE REGREDIR

- ✅ Preview renderizado corretamente
- ✅ Cores do brand profile aplicadas
- ✅ Imagem do produto visível e bem posicionada
- ✅ Textos legíveis (contraste adequado)
- ✅ Logo da loja presente
- ✅ Render final = Preview (paridade visual)
- ✅ Upload para Storage funcional
- ✅ Atualização de status no banco
- ✅ Redirecionamento após aprovação

### RISCO: Epic 4 pode quebrar este fluxo

**Story 4.4 propõe:**
- Novo renderer dinâmico
- Baseado em CompositionSpec (não mais layout fixo)

**CUIDADOS:**
- ⚠️ Paridade visual DEVE ser mantida
- ⚠️ Preview DEVE usar mesmo código do render final
- ⚠️ Não pode haver "surpresas" após aprovação

### COMO TESTAR

**Manual (E2E):**
1. Gerar campanha completa
2. Verificar preview:
   - ✅ Imagem aparece
   - ✅ Headline aparece
   - ✅ Texto aparece
   - ✅ Preço aparece (se preenchido)
   - ✅ CTA aparece
   - ✅ Logo aparece
   - ✅ Cores corretas
3. Clicar "Aprovar"
4. Verificar:
   - ✅ Loading aparece
   - ✅ Redirecionamento para /dashboard
   - ✅ Campanha aparece na lista com status "approved"
5. Acessar campanha novamente
6. Verificar:
   - ✅ Arte final idêntica ao preview

**Automatizado:**
```bash
npm run test -- --grep "Preview e aprovação"
```

### Dependências

**Renderer:**
- app/dashboard/campaigns/_components/rendercampaignart.ts

**Storage:**
- lib/supabase/storage-actions.ts

**Canvas:**
- Browser Canvas API

---

## 🔴 FLUXO 4: Validação Produto vs Imagem

### Descrição
Sistema valida se imagem corresponde ao produto informado pelo usuário.

### Status Atual
❌ **NÃO INTEGRADO**

### Etapas (Como DEVERIA Funcionar)

```
1. Usuário preenche campanha:
   - product_name: "Coca Cola 600ml"
   - image_url: [upload de imagem]
   ↓
2. Sistema chama readVisualTarget():
   INPUT: {
     imageUrl: "...",
     productName: "Coca Cola 600ml",
     targetLabel: "refrigerante",
     category: "bebidas"
   }
   ↓
3. Visual Reader analisa imagem (GPT-4o vision):
   - Detecta produto na imagem
   - Compara com productName
   - Classifica matchType
   ↓
4. Sistema recebe resultado:
   {
     detected: boolean,
     matchType: "exact" | "category_only" | "none",
     matchedTarget: string | null,
     confidence: "low" | "medium" | "high",
     ...
   }
   ↓
5. Sistema decide ação:
   
   SE matchType === "exact":
     ✅ Produto correto
     → Continua geração normalmente
   
   SE matchType === "category_only":
     ⚠️ Produto semelhante, mas não exato
     → Alerta usuário:
        "Detectamos [matchedTarget] na imagem,
         mas você informou [productName].
         Deseja continuar?"
     → SE usuário confirma:
        → Usa matchedTarget no prompt (não productName)
     → SE usuário cancela:
        → Volta para edição
   
   SE matchType === "none":
     ❌ Imagem não corresponde
     → Alerta usuário:
        "A imagem não contém [productName].
         Por favor, envie uma imagem adequada."
     → Bloqueia geração
```

### O QUE NÃO PODE REGREDIR

Este fluxo AINDA NÃO EXISTE, mas é CRÍTICO implementar antes de Epic 4.

**Capacidades necessárias:**
- ✅ Visual Reader detecta produto (JÁ EXISTE em lib/visual-reader/)
- ✅ Visual Reader compara com productName (JÁ EXISTE)
- ✅ Visual Reader retorna matchType (JÁ EXISTE)
- ❌ Integração com geração de campanhas (NÃO EXISTE)
- ❌ Alerta ao usuário (NÃO EXISTE)
- ❌ Uso de matchedTarget no prompt (NÃO EXISTE)

### COMO IMPLEMENTAR

**Etapa 1: Integrar Visual Reader no service**

```typescript
// lib/domain/campaigns/service.ts

import { readVisualTarget } from "@/lib/visual-reader/service";

export async function generateCampaignContent(input) {
  // ... código existente ...
  
  // ADICIONAR ANTES da linha 104:
  
  // 4.5) Análise visual
  let visualReaderResult = null;
  if (campaign.product_image_url) {
    try {
      visualReaderResult = await readVisualTarget({
        imageUrl: campaign.product_image_url,
        targetLabel: campaign.content_type === "product" ? "produto" : "serviço",
        productName: campaign.product_name,
        category: store.main_segment || undefined,
        campaignType: "single_product",
        content_type: campaign.content_type
      });
      
      // Log para debug
      console.log(`[Visual Reader] matchType: ${visualReaderResult.matchType}`);
      if (visualReaderResult.matchType !== "exact") {
        console.warn(`[MISMATCH] Expected: ${campaign.product_name}, Found: ${visualReaderResult.matchedTarget}`);
      }
    } catch (error) {
      console.error("[Visual Reader] Failed:", error);
      // Não bloqueia geração se Visual Reader falhar
    }
  }
  
  // 5) Monta prompt COM visual reader result
  const prompt = buildCampaignPrompt(
    campaignCtx, 
    store, 
    visualReaderResult,  // ⚠️ Passando resultado
    description
  );
  
  // ... resto do código ...
}
```

**Etapa 2: Atualizar buildCampaignPrompt**

```typescript
// lib/domain/campaigns/prompts.ts

export function buildCampaignPrompt(
  campaign: CampaignContext,
  store: StoreContext,
  visualReader: VisualReaderResult | null,  // ⚠️ Novo parâmetro
  description?: string
): string {
  
  // Adicionar seção visual ao prompt
  const visualSection = buildVisualPromptSection(visualReader, campaign.product_name);
  
  return `
Você é um REDATOR SÊNIOR DE VAREJO...

CONTEXTO DA LOJA:
...

CONTEXTO DA CAMPANHA:
...

${visualSection}  <!-- ⚠️ Nova seção -->

DIRETRIZES DE ESCREVENTE:
...
`;
}

function buildVisualPromptSection(
  result: VisualReaderResult | null, 
  productName: string
): string {
  if (!result) return "";
  
  if (result.matchType === "exact") {
    return `
VALIDAÇÃO VISUAL:
✅ A imagem corresponde ao produto "${productName}".
- Produto detectado: ${result.matchedTarget}
- Confiança: ${result.confidence}
Você pode mencionar características visuais específicas.
`;
  }
  
  if (result.matchType === "category_only") {
    return `
⚠️ ATENÇÃO - INCONSISTÊNCIA DETECTADA:
- Produto esperado: "${productName}"
- Imagem contém: "${result.matchedTarget}"
IMPORTANTE: Use o produto DETECTADO na imagem como referência, não o nome fornecido.
Seja genérico nas descrições ou use "${result.matchedTarget}" como base.
`;
  }
  
  if (result.matchType === "none") {
    return `
⚠️ ATENÇÃO: A imagem NÃO contém "${productName}".
IMPORTANTE: Foque no texto. Não mencione características visuais específicas.
`;
  }
  
  return "";
}
```

**Etapa 3: Adicionar alerta ao usuário (UI)**

```typescript
// app/dashboard/campaigns/new/_components/NewCampaignShell.tsx

async function handleGenerate() {
  setGenerationState("generating");
  
  const response = await fetch("/api/generate/campaign", {
    method: "POST",
    body: JSON.stringify({ campaign_id: campaignId })
  });
  
  const data = await response.json();
  
  // ⚠️ ADICIONAR: Verificar inconsistência visual
  if (data.visualReaderResult) {
    const { matchType, matchedTarget } = data.visualReaderResult;
    
    if (matchType === "category_only") {
      const confirmed = confirm(
        `⚠️ Detectamos "${matchedTarget}" na imagem, ` +
        `mas você informou "${product.product_name}". ` +
        `Deseja continuar mesmo assim?`
      );
      
      if (!confirmed) {
        setGenerationState("idle");
        return;
      }
    }
    
    if (matchType === "none") {
      alert(
        `❌ A imagem não contém "${product.product_name}". ` +
        `Por favor, envie uma imagem adequada do produto.`
      );
      setGenerationState("idle");
      return;
    }
  }
  
  // ... resto do código ...
}
```

### COMO TESTAR

**Teste 1: Produto exato**
```
Input:
- product_name: "Coca Cola 600ml"
- image: Foto de Coca Cola 600ml

Esperado:
- ✅ matchType: "exact"
- ✅ Nenhum alerta
- ✅ Geração continua normalmente
- ✅ Copy menciona Coca Cola
```

**Teste 2: Produto semelhante**
```
Input:
- product_name: "Coca Cola 600ml"
- image: Foto de Pepsi 2L

Esperado:
- ⚠️ matchType: "category_only"
- ⚠️ matchedTarget: "Pepsi 2L"
- ⚠️ Alerta aparece: "Detectamos Pepsi 2L..."
- SE usuário confirma:
  - ✅ Copy usa termos genéricos ou Pepsi
- SE usuário cancela:
  - ✅ Volta para edição
```

**Teste 3: Imagem não relacionada**
```
Input:
- product_name: "Coca Cola 600ml"
- image: Foto de hambúrguer

Esperado:
- ❌ matchType: "none"
- ❌ Alerta aparece: "A imagem não contém Coca Cola 600ml"
- ❌ Geração bloqueada
- ❌ Usuário DEVE trocar imagem
```

### Dependências

**Visual Reader:**
- lib/visual-reader/service.ts (readVisualTarget)
- lib/visual-reader/contracts.ts (VisualReaderResult)

**LLM:**
- OpenAI GPT-4o (vision)

---

## 🟡 FLUXO 5: Regeneração de Campanha

### Descrição
Usuário pode regenerar conteúdo de campanha existente (força nova geração).

### Etapas

```
1. Usuário acessa campanha existente
   ↓
2. Campanha já tem conteúdo gerado
   ↓
3. Usuário clica "Regenerar"
   ↓
4. Sistema chama POST /api/generate/campaign:
   - campaign_id
   - force: true  ⚠️ FORÇA regeneração
   - persist: true
   ↓
5. API ignora idempotência (force=true)
   ↓
6. Executa pipeline completo novamente
   ↓
7. Sobrescreve conteúdo anterior:
   - headline
   - ai_caption
   - ai_text
   - ai_cta
   - ai_hashtags
   ↓
8. Retorna novo conteúdo
   ↓
9. UI atualiza preview
```

### O QUE NÃO PODE REGREDIR

- ✅ Botão "Regenerar" visível em campanhas com conteúdo
- ✅ force=true sobrescreve conteúdo anterior
- ✅ Novo conteúdo é diferente do anterior (variação)
- ✅ Preview atualiza com novo conteúdo
- ✅ Persistência funciona

### COMO TESTAR

**Manual:**
1. Criar campanha e gerar conteúdo
2. Anotar headline gerado
3. Clicar "Regenerar"
4. Verificar:
   - ✅ Novo headline é diferente
   - ✅ Preview atualizou
   - ✅ Banco foi atualizado

---

## 🟡 FLUXO 6: Criação de Weekly Plan

### Descrição
Lojista cria plano semanal com estratégias por dia.

### Etapas

```
1. Usuário acessa /dashboard/plans
   ↓
2. Clica "Novo Plano"
   ↓
3. Wizard Passo 1: Seleciona dias da semana
   ↓
4. Wizard Passo 2: Sistema gera estratégias (IA)
   ↓
5. Usuário revisa e aprova estratégias
   ↓
6. Sistema salva plano com status: "approved"
   ↓
7. Wizard Passo 3: Orquestração de campanhas
   ↓
8. Para cada dia aprovado:
   - Cria campanha vinculada (weekly_plan_item_id)
   - Herda estratégia do plano
   - Bloqueia campos estratégicos
```

### O QUE NÃO PODE REGREDIR

- ✅ Wizard de 3 passos funcional
- ✅ Geração de estratégia por IA
- ✅ Vínculo campanha ↔ plano
- ✅ Bloqueio de campos estratégicos em campanhas vinculadas
- ✅ Status de plano (draft, approved)

### COMO TESTAR

**Manual:**
1. Criar plano semanal
2. Selecionar 3 dias
3. Aprovar estratégias
4. Verificar:
   - ✅ Plano salvo com status "approved"
   - ✅ Campanhas criadas para cada dia
   - ✅ Campos bloqueados nas campanhas

---

## 🟡 FLUXO 7: Orquestração de Campanha via Plano

### Descrição
Sistema cria campanhas automaticamente a partir de plano semanal aprovado.

### Etapas

```
1. Plano semanal aprovado existe
   ↓
2. Usuário clica "Orquestrar" em um dia
   ↓
3. Sistema redireciona para /dashboard/campaigns/new?plan_item_id=XXX
   ↓
4. NewCampaignShell hidrata dados:
   - audience (do plano)
   - objective (do plano)
   - product_positioning (do plano)
   - theme (do plano)
   - generate_post / generate_reels (do plano)
   ↓
5. Campos estratégicos ficam bloqueados (readonly)
   ↓
6. Usuário preenche apenas:
   - product_name
   - price
   - image_url
   ↓
7. Gera campanha normalmente
   ↓
8. Sistema salva vinculação: campaigns.weekly_plan_item_id
```

### O QUE NÃO PODE REGREDIR

- ✅ Hidratação de dados do plano
- ✅ Bloqueio de campos estratégicos
- ✅ Vinculação persistida no banco
- ✅ Campanhas vinculadas aparecem no dashboard do plano

### COMO TESTAR

**Manual:**
1. Criar plano semanal aprovado
2. Clicar "Orquestrar" em um dia
3. Verificar:
   - ✅ Campos estratégicos preenchidos e bloqueados
   - ✅ Só pode editar produto
4. Gerar campanha
5. Verificar:
   - ✅ Campo weekly_plan_item_id preenchido no banco

---

## 🟢 FLUXO 8: Visual Reader (Isolado)

### Descrição
Visual Reader funciona standalone no sandbox.

### Etapas

```
1. Usuário acessa /sandbox
   ↓
2. Upload de imagem
   ↓
3. Preenche productName (opcional)
   ↓
4. Clica "Analisar"
   ↓
5. Sistema chama POST /api/sandbox/visual-reader/crop
   ↓
6. API chama readVisualTarget()
   ↓
7. Visual Reader analisa com GPT-4o
   ↓
8. Retorna resultado completo (18 campos)
   ↓
9. UI exibe:
   - Bounding box no preview
   - Todos os campos do resultado
   - Crop sugerido
```

### O QUE NÃO PODE REGREDIR

- ✅ Sandbox funcional
- ✅ Upload de imagem
- ✅ Visual Reader retorna resultado válido
- ✅ Preview com bounding box
- ✅ Todos os 18 campos visíveis

### COMO TESTAR

**Manual:**
1. Acessar /sandbox
2. Upload imagem de produto
3. Preencher productName: "Coca Cola 600ml"
4. Verificar resultado completo

---

## 📊 RESUMO DE RISCOS

| Fluxo | Risco Atual | Severidade |
|-------|-------------|------------|
| F1 - Criação de Campanha | ⚠️ Visual Reader não integrado | 🟡 ALTO |
| F2 - Geração de Conteúdo | ⚠️ Prompt cego | 🟡 ALTO |
| F3 - Preview e Aprovação | ⚠️ Epic 4 pode quebrar paridade visual | 🔴 CRÍTICO |
| F4 - Validação Produto vs Imagem | ❌ Não implementado | 🔴 CRÍTICO |
| F5 - Regeneração | ✅ Funcional | 🟢 BAIXO |
| F6 - Weekly Plan | ✅ Funcional | 🟢 BAIXO |
| F7 - Orquestração | ✅ Funcional | 🟢 BAIXO |
| F8 - Visual Reader Isolado | ✅ Funcional | 🟢 BAIXO |

---

**Última atualização:** 2026-04-22  
**Próxima revisão:** Após Story 4.1  
**Responsável:** @aiox-master

---

*Estes fluxos são a ESPINHA DORSAL do produto. Proteja-os.*
