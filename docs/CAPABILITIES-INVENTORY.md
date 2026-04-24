# Vendeo — Inventário de Capacidades Técnicas

**Data:** 2026-04-22  
**Objetivo:** Inventário COMPLETO de todas as capacidades técnicas do sistema  
**Uso:** BÚSSOLA obrigatória antes de implementar/modificar qualquer feature  
**Status:** 🟢 ATIVO — Manter atualizado a cada mudança

---

## 🧭 Como Usar Este Documento

**ANTES de implementar qualquer feature:**
1. Consulte este inventário
2. Identifique quais capacidades serão afetadas
3. Marque no checklist de integração
4. Atualize este documento após implementação

**NUNCA:**
- Substituir uma capacidade sem documentar o impacto
- Criar feature duplicada de algo que já existe
- Ignorar dependências listadas aqui

---

## 📦 CAPACIDADE 1: Visual Reader (ATUAL)

### Status
- ✅ **Implementado:** lib/visual-reader/
- ❌ **NÃO integrado:** Geração de campanhas
- ✅ **Funcional:** Sandbox (/sandbox)
- 🔴 **CRÍTICO:** Esta capacidade NÃO PODE ser perdida

### Localização
```
lib/visual-reader/
├── contracts.ts   — Schemas Zod completos
├── prompts.ts     — Prompt GPT-4o com regras de matching
└── service.ts     — Função readVisualTarget()
```

### O Que Faz

**INPUT:**
```typescript
{
  imageUrl: string,           // Imagem do produto
  targetLabel: string,         // "refrigerante", "cerveja", etc
  productName?: string,        // "Coca Cola 600ml" ⚠️ CRÍTICO
  category?: string,           // "bebidas"
  campaignType?: string,       // "single_product"
  content_type?: string        // "product"
}
```

**OUTPUT:**
```typescript
{
  // 🔴 VALIDAÇÃO DE PRODUTO (CAPACIDADE CRÍTICA)
  detected: boolean,           // true = produto exato encontrado
  matchType: "exact" | "category_only" | "none",
  matchedTarget: string | null, // "Pepsi 2L" (o que está na imagem)
  
  // LOCALIZAÇÃO ESPACIAL
  targetBox: { x, y, width, height } | null,
  targetOrientation: "vertical" | "horizontal" | "square" | ...,
  targetPosition: "left" | "center" | "right" | ...,
  targetOccupancy: "low" | "medium" | "high" | "full",
  
  // ESTRUTURA DA CENA
  sceneType: "single_product" | "multiple_products" | ...,
  relevantCount: number,
  ignoredElements: string[],
  
  // QUALIDADE DA IMAGEM
  imageQuality: "good" | "acceptable" | "poor" | "unknown",
  visibility: "clear" | "partial" | "obstructed" | "unknown",
  framing: "good" | "tight" | "distant" | "unknown",
  backgroundNoise: "low" | "medium" | "high" | "unknown",
  backgroundType: "transparent" | "solid" | "simple" | "complex",
  
  // COMPOSIÇÃO
  hasBackground: boolean | "unknown",
  subjectCutoff: "none" | "light" | "moderate" | "severe",
  safeExpansionPotential: "low" | "medium" | "high",
  focusClarity: "low" | "medium" | "high" | "unknown",
  visualIsolation: "low" | "medium" | "high" | "unknown",
  
  // META
  confidence: "low" | "medium" | "high",
  reasoningSummary: string
}
```

### Capacidades Específicas

#### 1. Validação de Produto vs Imagem ⚠️ CRÍTICA

**O que faz:**
- Compara `productName` (escrito pelo usuário) com o que está na imagem
- Detecta inconsistências: Coca Cola vs Pepsi
- Detecta diferenças de volume: 600ml vs 2L
- Detecta diferenças de formato: garrafa vs lata

**Exemplos:**

| productName | Imagem | matchType | matchedTarget | detected |
|-------------|--------|-----------|---------------|----------|
| "Coca Cola 600ml" | Coca 600ml | `exact` | "Coca Cola 600ml" | true |
| "Coca Cola 600ml" | Coca 2L | `category_only` | "Coca Cola 2L" | false |
| "Coca Cola 600ml" | Pepsi 2L | `category_only` | "Pepsi 2L" | false |
| "Coca Cola 600ml" | Hambúrguer | `none` | null | false |

**USO CRÍTICO:**
- Alertar usuário quando há inconsistência
- Usar `matchedTarget` no prompt de geração (não `productName`)
- Evitar copy de Coca com imagem de Pepsi

#### 2. Localização Espacial

**O que faz:**
- Detecta onde o produto está na imagem (targetBox)
- Classifica posição: left, center, right
- Calcula ocupação: low, medium, high, full
- Identifica orientação: vertical, horizontal, square

**USO:**
- Decisões de crop
- Posicionamento de texto na arte
- Hierarquia visual

#### 3. Análise de Qualidade

**O que faz:**
- Avalia qualidade da imagem
- Detecta problemas: blur, low resolution, poor framing
- Identifica ruído de fundo
- Classifica tipo de fundo: transparent, solid, complex

**USO:**
- Escolher layout apropriado
- Alertar quando imagem é inadequada
- Ajustar tratamento de fundo

#### 4. Estrutura da Cena

**O que faz:**
- Classifica tipo de cena: single_product, multiple_products
- Conta produtos relevantes
- Lista elementos ignorados na cena

**USO:**
- Decidir se é combo/kit
- Filtrar elementos não desejados
- Ajustar composição

### Onde É Usado

- ✅ **Sandbox:** /sandbox (testes)
- ❌ **Geração de campanhas:** NÃO (mas deveria)
- ❌ **Motor Visual v2.0:** NÃO planejado na Epic 4.1

### Onde DEVERIA Ser Usado

1. **Geração de campanhas manuais:** 
   - NewCampaignShell → antes de chamar /api/generate/campaign
   - Validar produto vs imagem
   - Alertar usuário se inconsistência

2. **Prompt de geração:**
   - buildCampaignPrompt() deve receber Visual Reader result
   - Usar `matchedTarget` real, não `productName` cego

3. **Motor Visual v2.0:**
   - Story 4.1 deve ESTENDER o reader atual, não substituir

### Dependências

**LLM:**
- OpenAI GPT-4o (vision capabilities)
- Model: "gpt-4.1-mini" (definido em service.ts)
- Temperature: 0.2

**Bibliotecas:**
- Zod (validação de schemas)
- callAI() (lib/ai/parse.ts)

**Custo:**
- ~$0.01-0.03 por análise
- Sem cache: $300-900/mês (10k campanhas)
- Com cache: $50-150/mês

### Testes

**Localização:** app/sandbox/page.tsx

**Como testar:**
1. Acessar /sandbox
2. Upload imagem
3. Preencher productName: "Coca Cola 600ml"
4. Ver resultado completo do reader

**Fixtures necessárias:**
- ✅ Existe: Sandbox permite upload manual
- ❌ Falta: Fixtures automatizadas para testes unitários

### Riscos se Perder Esta Capacidade

| Risco | Impacto | Severidade |
|-------|---------|------------|
| Copy de Coca com imagem de Pepsi | ❌ Usuário recebe conteúdo ERRADO | 🔴 CRÍTICO |
| Não detectar volume errado (600ml vs 2L) | ❌ Preço/oferta inconsistente | 🔴 CRÍTICO |
| Não alertar usuário de inconsistência | ❌ Usuário culpa o sistema | 🟡 ALTO |
| Prompt cego (sem saber o que está na imagem) | ❌ IA gera copy genérica | 🟡 ALTO |

### Histórico de Mudanças

| Data | Mudança | Autor |
|------|---------|-------|
| 2026-04-19 | Adição de campos de qualidade (imageQuality, visibility, etc) | @dev |
| 2026-04-18 | Suporte a productName composto (combos) | @dev |
| 2026-04-17 | Correção semântica category_only | @dev |
| 2026-04-22 | Documentação completa no inventário | @aiox-master |

---

## 📦 CAPACIDADE 2: Campaign Generation (ATUAL)

### Status
- ✅ **Implementado:** lib/domain/campaigns/service.ts
- ✅ **Integrado:** /api/generate/campaign
- ⚠️ **INCOMPLETO:** Não usa Visual Reader

### Localização
```
lib/domain/campaigns/
├── service.ts      — generateCampaignContent()
├── prompts.ts      — buildCampaignPrompt()
├── contracts.ts    — Schemas de request/response
├── schemas.ts      — CampaignAISchema
├── types.ts        — Tipos de domínio
└── mapper.ts       — DB ↔ Domínio
```

### O Que Faz

**Pipeline:**
```
1. Busca campanha no banco
2. Normaliza para domínio (mapDbCampaignToDomain)
3. Busca tema estratégico (se vem de plano)
4. Valida dados mínimos (product_name, audience, objective)
5. Busca contexto da loja (fetchStoreContext)
6. ❌ PULA: Visual Reader (linha 104-106)
7. Monta prompt (buildCampaignPrompt)
8. Chama IA (callAIWithRetry)
9. Normaliza resposta (mapAiCampaignToDomain)
10. Persiste no banco (headline, ai_caption, ai_text, ai_cta, ai_hashtags)
```

**INPUT (via API):**
```typescript
{
  campaign_id: string,
  force?: boolean,        // Regenerar mesmo se já tem conteúdo
  description?: string,   // Instruções adicionais do usuário
  persist?: boolean       // Salvar no banco (default: true)
}
```

**OUTPUT:**
```typescript
{
  ok: true,
  reused: false,
  campaign_id: string,
  output: {
    headline: string,      // Título curto (≤25 carac)
    caption: string,       // Legenda do Instagram
    text: string,          // Frase de apoio (≤60 carac)
    cta: string,           // Call-to-action
    hashtags: string,      // Tags separadas por espaço
    price_label: string | null
  }
}
```

### Capacidades Específicas

#### 1. Geração de Copy Comercial

**O que faz:**
- Gera headline, caption, text, cta, hashtags
- Respeita tom de voz da loja
- Adapta para objetivo e público
- Considera segmento e localização

**Prompt atual (resumo):**
- Contexto da loja: nome, segmento, localização, tom, posicionamento
- Contexto da campanha: produto, preço, objetivo, público, posicionamento
- Data atual (para sazonalidade)
- Diretrizes: concordância de gênero, nicho, foco no "UAU", CTA contextual

#### 2. Idempotência

**O que faz:**
- Se campanha já tem conteúdo E force=false → retorna cached
- Economiza chamadas de IA

#### 3. Validação de Dados

**O que faz:**
- Valida product_name, audience, objective preenchidos
- Retorna erro 400 se faltam dados

#### 4. Contexto Estratégico

**O que faz:**
- Se campanha vem de plano semanal → busca theme
- Inclui theme no prompt

#### 5. Rastreabilidade

**O que faz:**
- Persiste generationContext com snapshot do estado
- Inclui brand_profile usado, timestamp, versão

### Problema Atual: Visual Reader NÃO Integrado

**Linha 104-106 de service.ts:**
```typescript
// 5) Monta prompt e chama IA
const prompt = buildCampaignPrompt(campaignCtx, store, null, description); 
//                                                      ^^^^ deveria ser visualReaderResult
```

**Consequência:**
- Prompt é "cego" em relação à imagem
- Não sabe se imagem é Coca ou Pepsi
- Não detecta inconsistências
- IA gera copy baseada APENAS no texto escrito

### Onde É Usado

- ✅ **API:** /api/generate/campaign
- ✅ **UI:** NewCampaignShell.tsx (botão "Gerar Campanha")
- ✅ **UI:** CampaignPreviewClient.tsx (regeneração)

### Onde DEVERIA Integrar Visual Reader

**ANTES da linha 104:**
```typescript
// 4.5) Análise visual (se houver imagem)
let visualReaderResult = null;
if (campaign.product_image_url) {
  visualReaderResult = await readVisualTarget({
    imageUrl: campaign.product_image_url,
    targetLabel: campaign.content_type === "product" ? "produto" : "serviço",
    productName: campaign.product_name,
    category: store.main_segment || undefined,
    campaignType: "single_product",
    content_type: campaign.content_type
  });
  
  // 4.6) Validar inconsistência produto vs imagem
  if (visualReaderResult.matchType === "category_only") {
    console.warn(`[INCONSISTENCY] User said "${campaign.product_name}" but image shows "${visualReaderResult.matchedTarget}"`);
    // TODO: Alertar usuário ou usar matchedTarget no prompt
  }
}

// 5) Monta prompt e chama IA
const prompt = buildCampaignPrompt(campaignCtx, store, visualReaderResult, description);
```

### Dependências

**LLM:**
- OpenAI GPT-4 (text generation)
- callAIWithRetry() (lib/ai/parse.ts)

**Database:**
- Supabase Admin (service role)
- Tabelas: campaigns, stores, weekly_plan_items

**Domínios:**
- lib/domain/stores (fetchStoreContext)
- lib/domain/campaigns (mappers, selectors, schemas)

### Testes

**Localização:** Nenhum teste automatizado encontrado

**Como testar:**
1. Criar campanha em /dashboard/campaigns/new
2. Preencher dados
3. Clicar "Gerar Campanha"
4. Verificar texto gerado

### Riscos Atuais

| Risco | Impacto | Severidade |
|-------|---------|------------|
| Não valida produto vs imagem | Copy errada (Coca com foto de Pepsi) | 🔴 CRÍTICO |
| Prompt cego | Copy genérica, não adaptada à imagem | 🟡 ALTO |
| Sem testes automatizados | Regressões não detectadas | 🟡 ALTO |

### Histórico de Mudanças

| Data | Mudança | Autor |
|------|---------|-------|
| 2026-04-22 | Documentação completa no inventário | @aiox-master |

---

## 📦 CAPACIDADE 3: Visual Reader (EPIC 4.1 - PLANEJADO)

### Status
- ❌ **NÃO implementado:** Planejado na Story 4.1
- 🔴 **RISCO:** Substitui o reader atual SEM manter validação de produto

### Localização Planejada
```
lib/ai/visual-reader/    ⚠️ CONFLITO com lib/visual-reader/
├── types.ts
├── index.ts
└── (outros arquivos)
```

### O Que Está Planejado

**OUTPUT planejado (ImageProfile):**
```typescript
{
  backgroundType: "transparent" | "solid" | "complex" | "unknown",
  subjectCount: "single" | "multiple",
  occupancy: "low" | "medium" | "high" | "full",
  orientation: "vertical" | "horizontal" | "square",
  position: "left" | "center" | "right" | "mixed",
  hasClearCutout: boolean,
  edgeQuality: "clean" | "soft" | "busy",
  backgroundNoise: "low" | "medium" | "high"
}
```

### Problema: Capacidades PERDIDAS

**Story 4.1 NÃO inclui:**
- ❌ `productName` no input
- ❌ `detected` (validação de produto)
- ❌ `matchType` (exact/category_only/none)
- ❌ `matchedTarget` (o que realmente está na imagem)
- ❌ `imageQuality`, `visibility`, `framing`
- ❌ `sceneType`, `relevantCount`, `ignoredElements`
- ❌ `subjectCutoff`, `safeExpansionPotential`, `focusClarity`, `visualIsolation`

**Ou seja:**
- 🔴 PERDE validação produto vs imagem (Coca vs Pepsi)
- 🔴 PERDE capacidade de alertar inconsistência
- 🔴 PERDE análise completa de qualidade
- 🔴 SIMPLIFICA demais: 8 campos vs 18 campos

### Objetivo Declarado da Epic 4.1

**Do documento Story 4.1:**
> "Implementar o Motor 1 (Visual Reader) que analisa a imagem do produto e retorna um ImageProfile estruturado, classificando background, ocupação, qualidade de recorte e posicionamento para guiar o Intent Resolver."

**Foco:**
- Características visuais para decisões de LAYOUT
- Não valida produto

**Problema:**
- Epic 4 está criando motor de COMPOSIÇÃO VISUAL
- Mas está PERDENDO validação de PRODUTO
- São capacidades COMPLEMENTARES, não excludentes

### Solução Necessária

**Epic 4.1 deve:**
1. ESTENDER o reader atual (não substituir)
2. MANTER `productName`, `matchType`, `matchedTarget`, `detected`
3. ADICIONAR novos campos para composição (hasClearCutout, edgeQuality)
4. Resultado: Visual Reader COMPLETO (validação + composição)

**Ou:**

1. Manter 2 readers separados:
   - `lib/visual-reader/` → Validação de produto (ATUAL)
   - `lib/ai/visual-composition-reader/` → Características visuais (NOVO)
2. Chamar ambos na geração de campanhas

### Risco se Implementar Como Planejado

| Risco | Impacto | Severidade |
|-------|---------|------------|
| Substituir reader atual por simplificado | PERDE validação produto vs imagem | 🔴 CRÍTICO |
| Epic 4 não integrar reader atual | Motor V2 gera artes sem validar produto | 🔴 CRÍTICO |
| 2 implementações conflitantes (lib/visual-reader vs lib/ai/visual-reader) | Confusão, manutenção duplicada | 🟡 ALTO |

---

## 📦 CAPACIDADE 4: Renderer (ATUAL)

### Status
- ✅ **Implementado:** app/dashboard/campaigns/_components/rendercampaignart.ts
- ✅ **Usado:** Preview e aprovação de artes

### Localização
```
app/dashboard/campaigns/_components/
└── rendercampaignart.ts
```

### O Que Faz

**Pipeline:**
1. Recebe dados da campanha + store
2. Prepara canvas (1080x1080)
3. Desenha fundo (cores do brand profile)
4. Posiciona imagem do produto
5. Adiciona textos (headline, body, price, CTA)
6. Aplica logo e assinatura da loja
7. Gera PNG final

**INPUT:**
```typescript
{
  campaign: {
    product_name: string,
    price: number,
    headline: string,
    ai_text: string,
    ai_cta: string,
    product_image_url: string,
    ...
  },
  store: {
    name: string,
    primary_color: string,
    secondary_color: string,
    logo_url: string,
    whatsapp: string,
    ...
  },
  measured_*: {
    // Medições de DOM para paridade visual
  }
}
```

**OUTPUT:**
- Blob (PNG 1080x1080)
- Upload para Supabase Storage
- URL pública da arte final

### Capacidades Específicas

#### 1. Composição Visual

**O que faz:**
- Layout fixo (não dinâmico)
- Posicionamento determinístico
- Aplica cores do brand profile
- Renderiza textos com fontes da marca

#### 2. Paridade Visual com Preview

**O que faz:**
- Usa `measured_*` do DOM para preservar layout
- Garante que arte final = preview

**Problema:**
- Alto acoplamento entre preview e renderer
- Qualquer mudança no preview quebra renderer

#### 3. Render Client-Side

**O que faz:**
- Roda no navegador do usuário
- Canvas API
- Zero custo de servidor

### Onde É Usado

- ✅ **Preview:** CampaignPreviewClient.tsx
- ✅ **Aprovação:** Botão "Aprovar arte"

### Problema Atual: Layout Fixo

**Limitações:**
- Não adapta layout à qualidade da imagem
- Não usa sinais do Visual Reader
- Sempre mesmo tipo de composição

**Epic 4 propõe:**
- Story 4.3: Geração de variações de layout
- Story 4.4: Renderer dinâmico (não mais fixo)

### Riscos ao Substituir

| Risco | Impacto | Severidade |
|-------|---------|------------|
| Novo renderer quebra paridade com preview | Usuário aprova X, recebe Y | 🔴 CRÍTICO |
| Novo renderer mais lento | Timeout, frustração | 🟡 ALTO |
| Novo renderer com bugs visuais | Artes com falhas | 🔴 CRÍTICO |

---

## 📦 CAPACIDADE 5: Weekly Plan Strategy

### Status
- ✅ **Implementado:** lib/domain/weekly-plans/
- ✅ **Integrado:** /dashboard/plans

### Localização
```
lib/domain/weekly-plans/
├── service.ts
├── strategy.ts
├── prompts.ts
└── mapper.ts
```

### O Que Faz

**Pipeline:**
1. Usuário seleciona dias da semana
2. IA sugere estratégia por dia
3. Usuário revisa e aprova
4. Orquestra criação de campanhas

**Capacidades:**
- Geração de estratégia semanal
- Normalização de campos estratégicos
- Vínculo campanha ↔ plano semanal
- Status de plano (draft, approved)

### Onde É Usado

- ✅ **Wizard:** /dashboard/plans (fluxo de 3 passos)
- ✅ **Orquestração:** Cria campanhas vinculadas

### Não Afetado pela Epic 4

Epic 4 não modifica Weekly Plan diretamente.

---

## 🎯 PRÓXIMAS CAPACIDADES (PLANEJADAS)

### CAPACIDADE 6: Intent Resolver (Epic 4.2)

**Status:** ❌ Não implementado  
**Objetivo:** Decidir hierarquia visual baseada em ImageProfile  
**Depende de:** Visual Reader (Story 4.1)

### CAPACIDADE 7: Visual Composer (Epic 4.3)

**Status:** ❌ Não implementado  
**Objetivo:** Gerar 3-6 variações de composição  
**Depende de:** Intent Resolver (Story 4.2)

### CAPACIDADE 8: Renderer Dinâmico (Epic 4.4)

**Status:** ❌ Não implementado  
**Objetivo:** Renderizar arte a partir de CompositionSpec  
**Depende de:** Visual Composer (Story 4.3)

---

## 📋 CHECKLIST DE USO

Antes de implementar qualquer feature:

- [ ] Li o inventário completo de capacidades
- [ ] Identifiquei quais capacidades serão afetadas
- [ ] Verifiquei se não estou duplicando algo existente
- [ ] Verifiquei se não estou substituindo sem documentar
- [ ] Consultei CRITICAL-FLOWS.md para entender impacto
- [ ] Consultei INTEGRATION-CHECKLIST.md
- [ ] Atualizarei este inventário após implementação

---

**Última atualização:** 2026-04-22  
**Próxima revisão:** Após Story 4.1  
**Responsável:** @aiox-master

---

*Este documento é a BÚSSOLA TÉCNICA do projeto. Mantenha-o atualizado.*
