# Prompt Refinement Brief - Logo IA Vendeo

**Para:** @prompt-eng (Wordsmith)  
**De:** @ux-design-expert (Uma)  
**Data:** 01 Mai 2026  
**Sprint:** 1 (Semana 1)  
**Duração estimada:** 2-3 horas  
**Prioridade:** 🔴 CRÍTICA

---

## 🎯 OBJETIVO

Refinar prompts de geração de logo para aumentar **approval rate de 20% para 70%+** (target intermediário antes da implementação Hybrid).

**Problema atual:** 3/3 logos gerados são inutilizáveis:
1. Grid com 9+ mini-logos (não é um logo único)
2. Abstrações geométricas desconexas (não funciona como marca)
3. Mock-ups de cartões de visita (não é logo isolado)

**Root cause:** Prompts ambíguos permitem múltiplas interpretações ruins pelo DALL-E 3.

---

## 📋 CONTEXTO DO PROJETO

### Perfil do Usuário (Lojista)
- **Idade:** 35-65 anos (maioria 45-55)
- **Tech literacy:** Baixo a médio (nível WhatsApp/Instagram)
- **Expectativa:** Logo profissional que "represente minha loja"
- **Segmentos:** 12 tipos (adegas, farmácias, mercearias, açougue, salões, eletrônicos, etc.)

### Constraints Técnicas
- **Modelo atual:** DALL-E 3 (OpenAI API)
- **Custo:** $0.04/imagem (3 logos = $0.12/geração)
- **Formato:** 1024×1024px, PNG, qualidade standard
- **Geração:** Sequencial (3× chamadas `n=1` devido constraint DALL-E 3)

### Caso de Uso
1. Lojista preenche Intelligence (nome, segmento, tom)
2. Clica "Gerar logo com IA (gratuito)"
3. Modal abre → Gera 3 logos em 15-30s
4. Lojista escolhe 1 logo OU clica "Gerar novos logos"
5. Logo salvo no perfil da loja (usado em campanhas)

---

## 🔍 ANÁLISE DAS 6 VULNERABILIDADES IDENTIFICADAS

### 1. MÚLTIPLAS OPÇÕES NO PROMPT (CRÍTICA)

**Atual:**
```
"Design: Simple geometric shapes representing a bottle, glass, 
or refreshment symbol"
```

**Problema:** DALL-E interpreta "OR" como "gere todos" ou "combine múltiplos"

**Resultado:** Logo com garrafa + copo + símbolo ao mesmo tempo (confuso)

**Fix sugerido:**
```
"Design: ONE single geometric icon. Choose EITHER a bottle silhouette 
OR a glass outline (select only one element). The icon must be simple, 
unified, and instantly recognizable."
```

**Princípio:** Forçar escolha única, não combinação.

---

### 2. PLURAL "SHAPES" → INTERPRETAÇÃO MÚLTIPLA (CRÍTICA)

**Atual:**
```
"Simple geometric shapes"
```

**Problema:** "Shapes" (plural) sugere "many shapes arranged together"

**Resultado:** Grids de 9+ mini-logos ou formas desconexas

**Fix sugerido:**
```
"Design: ONE cohesive geometric shape forming a single unified logo mark"
```

**Princípio:** Singular reforça unidade, não multiplicidade.

---

### 3. "SUITABLE FOR SOCIAL MEDIA" → GERA MOCKUPS (ALTA)

**Atual:**
```
"flat design suitable for social media, white background"
```

**Problema:** "Suitable for social media" pode sugerir "post de Instagram" ou "imagem promocional"

**Resultado:** Logo dentro de cartão de visita, post mockup, não isolado

**Fix sugerido:**
```
"The output MUST be the logo icon itself, isolated and centered on 
pure white background (#FFFFFF). Do NOT create business cards, 
social media posts, or application mockups."
```

**Princípio:** Especificar EXATAMENTE o que NÃO queremos.

---

### 4. FALTA "NO MOCKUPS" EXPLICIT (ALTA)

**Atual:**
```
"no text" (único constraint negativo)
```

**Problema:** Não proíbe mockups, grids, variações, painéis

**Resultado:** DALL-E gera "apresentação de logo" ao invés do logo

**Fix sugerido:**
```
"IMPORTANT CONSTRAINTS:
- Do NOT create: business cards, mockups, social media posts, 
  grids of variations, or multiple logo options.
- Do NOT include: text, letters, words, numbers, or store name inside the logo.
- Generate ONLY: One single logo icon, isolated on white background."
```

**Princípio:** Negative prompting é crucial para DALL-E 3.

---

### 5. FALTA "SINGLE UNIFIED ICON" (CRÍTICA)

**Atual:** Não menciona explicitamente "unified" ou "cohesive"

**Problema:** DALL-E pode gerar elementos separados sem conexão visual

**Resultado:** Formas geométricas espalhadas, não um logo coeso

**Fix sugerido:**
```
"The logo must be ONE unified icon mark, with all elements 
visually connected and balanced. Centered composition, 
symmetrical or intentionally asymmetrical for modern appeal."
```

**Princípio:** Reforçar coesão + composição centralizada.

---

### 6. FALTA "CENTERED COMPOSITION" (MÉDIA)

**Atual:** Não especifica alinhamento ou balanceamento

**Problema:** Logos desbalanceados, peso visual irregular

**Resultado:** Logo "caindo para um lado", não profissional

**Fix sugerido:**
```
"Centered composition with balanced visual weight. 
The icon should work equally well at small sizes (32px) 
and large sizes (512px)."
```

**Princípio:** Escalabilidade + balanço visual.

---

## 📐 TEMPLATE REFINADO (MODELO)

### Estrutura Proposta

```typescript
/**
 * DALL-E 3 Logo Prompt Template v2 - Refined by @prompt-eng
 * 
 * Changes from v1:
 * - Singular "shape" vs plural "shapes"
 * - "ONE single icon" enforced
 * - Explicit "no mockups" constraint
 * - "Centered composition" added
 * - Negative prompting expanded
 */

interface LogoPromptV2 {
  basePrompt: string;      // Intro + store context
  iconSelection: string;   // Forçar escolha única
  visualStyle: string;     // Minimalist, professional
  constraints: string;     // Positive constraints
  negativePrompt: string;  // Explicit "do NOT create"
  composition: string;     // Centered, balanced
  technical: string;       // Background, format
}
```

### Exemplo Completo (Loja de bebidas)

**ANTES (v1 - 20% approval):**
```
A minimalist, professional logo for "Comercial Teste Beta", 
a beverage store. Style: sophisticated and inviting. 
Design: Simple geometric shapes representing a bottle, glass, 
or refreshment symbol, maximum 2-3 colors (burgundy, amber, 
or dark green), no text, flat design suitable for social media, 
white background, high contrast. The logo should evoke quality, 
refreshment, and social enjoyment.
```

**DEPOIS (v2 - target 70%+ approval):**
```
A minimalist, professional logo for "Comercial Teste Beta", 
a beverage store specializing in quality drinks.

DESIGN: Create ONE single geometric icon. Choose EITHER a bottle 
silhouette OR a glass outline (select only one element, not both). 
The icon must be simple, unified, and instantly recognizable.

STYLE: Sophisticated and inviting. Use maximum 2-3 colors 
(burgundy, amber, or dark green). Flat design aesthetic with 
clean lines and modern appeal.

COMPOSITION: The logo must be ONE cohesive shape forming a single 
unified icon mark. Centered composition with balanced visual weight. 
All elements visually connected. The icon should work equally well 
at small sizes (32px) and large sizes (512px).

CONSTRAINTS - DO NOT CREATE:
- Business cards, mockups, social media posts, or application examples
- Grids of multiple logo variations or options
- Text, letters, words, numbers, or store name inside the logo
- Complex illustrations, realistic drawings, or photographic elements

OUTPUT FORMAT: The logo icon itself, isolated and centered on 
pure white background (#FFFFFF). High contrast for visibility. 
No shadows, no borders, no decorative frames.

The logo should evoke: quality, refreshment, and social enjoyment 
through its shape and color palette alone.
```

**Diferenças-chave:**
1. ✅ "ONE single icon" (5× repetido em variações)
2. ✅ "Choose EITHER... OR" (forçar escolha)
3. ✅ "ONE cohesive shape" (singular)
4. ✅ "DO NOT CREATE" seção explícita (8 itens proibidos)
5. ✅ "Centered composition" + escalabilidade
6. ✅ "OUTPUT FORMAT" técnico claro

---

## 🎨 APLICAÇÃO POR SEGMENTO

### Segmentos que precisam mais atenção:

#### 1. **Açougue** (Histórico de problemas)
- **Desafio:** Logos genéricos, não evocam carne/qualidade
- **Fix:** Adicionar "convey freshness and artisanal quality" + "warm color palette (reds, browns)"

#### 2. **Eletrônicos** (Abstrações excessivas)
- **Desafio:** Circuitos complexos, não minimalistas
- **Fix:** Reforçar "simple geometric tech icon (plug, lightning, circuit symbol)" + "avoid overly complex patterns"

#### 3. **Salão Beleza** (Feminino excessivo)
- **Desafio:** Muito rosa/floral, limita apelo
- **Fix:** "Elegant and modern (not overly feminine)" + "suitable for diverse clientele"

#### 4. **Outro…** (Segmento genérico)
- **Desafio:** Muito abstrato, não específico
- **Fix:** Adicionar "reflect the specific business nature through abstract symbolism"

---

## 📊 TESTE & VALIDAÇÃO

### Protocolo de Teste (Sprint 1)

#### Fase 1: Baseline (DALL-E v1)
1. Gerar 3 logos por segmento (3 segmentos testados)
2. Total: 9 logos (3 segmentos × 3 logos)
3. Avaliação @ux-design-expert: Score 1-10 por logo
4. Critérios: Usabilidade, profissionalismo, adequação ao segmento

#### Fase 2: Refinado (DALL-E v2)
1. Aplicar prompts refinados (MESMOS segmentos)
2. Gerar 3 logos por segmento
3. Total: 9 logos (comparação direta)
4. Avaliação: Score 1-10 por logo

#### Fase 3: Comparação
| Métrica | v1 (Baseline) | v2 (Refinado) | Target |
|---------|---------------|---------------|--------|
| Score médio | ~3/10 | ? | ≥7/10 |
| Logos utilizáveis | 1-2/9 | ? | ≥6/9 (67%) |
| Grids/Mockups | 4-5/9 | ? | 0/9 |
| Abstrações nonsense | 2-3/9 | ? | 0/9 |

**Critério de aprovação:** Score médio ≥7/10 E zero grids/mockups

---

## 🚀 DELIVERABLES ESPERADOS

### 1. `lib/ai/logo-prompts-v2.ts` (Código)
```typescript
/**
 * DALL-E 3 Logo Prompt Templates v2 - Refined
 * 
 * @see docs/ux/logo-ia-optimization/prompt-refinement-brief.md
 * @refined-by @prompt-eng (Wordsmith)
 * @date 2026-05-01
 */

export function getLogoPromptBySegment(
  storeName: string,
  segment: Segment,
  tone?: ToneOfVoice
): string {
  const template = LOGO_PROMPT_TEMPLATES_V2[segment];
  
  // Aplicar template refinado com estrutura v2
  let prompt = buildPromptV2(template, storeName, tone);
  
  return prompt;
}

// Template structure seguindo modelo acima
const LOGO_PROMPT_TEMPLATES_V2: Record<Segment, LogoPromptV2> = {
  "Loja de bebidas": {
    basePrompt: "...",
    iconSelection: "Choose EITHER a bottle silhouette OR a glass outline...",
    visualStyle: "Sophisticated and inviting...",
    constraints: "The logo must be ONE cohesive shape...",
    negativePrompt: "DO NOT CREATE: business cards, mockups...",
    composition: "Centered composition with balanced visual weight...",
    technical: "Isolated on pure white background (#FFFFFF)..."
  },
  // ... outros 11 segmentos
};
```

### 2. `docs/ux/logo-ia-optimization/sprint1-comparison.md` (Relatório)
Comparativo lado a lado:
- 9 logos v1 (baseline)
- 9 logos v2 (refinado)
- Scores, análise qualitativa, aprovação GO/NO-GO

### 3. Comentários no código explicando cada mudança
```typescript
// v1: "Simple geometric shapes" (plural - gerava grids)
// v2: "ONE cohesive geometric shape" (singular - força unidade)
```

---

## 🎯 CRITÉRIOS DE SUCESSO

### Quantitativos
- [ ] Score médio ≥7/10 em logos refinados (vs ~3/10 atual)
- [ ] Zero grids/mockups em 9 logos testados
- [ ] Zero abstrações nonsense (formas desconexas)
- [ ] ≥6/9 logos utilizáveis (67%)

### Qualitativos
- [ ] Logos representam visualmente o segmento
- [ ] Escaláveis (funcionam em 32px e 512px)
- [ ] Profissionais (não "feitos por IA genérica")
- [ ] Aprovação @ux-design-expert: "Posso mostrar para lojista"

### Técnicos
- [ ] Código limpo, documentado, type-safe
- [ ] Template reutilizável para futuros ajustes
- [ ] Testes unitários (opcional mas recomendado)

---

## 📚 REFERÊNCIAS

### Documentação consultada
1. **DALL-E 3 System Card** (OpenAI) - Prompt engineering best practices
2. **Logo Design Principles** - Escalabilidade, simplicidade, memorabilidade
3. **Vendeo Project Constitution** - Alinhamento com produto

### Exemplos de bons prompts (externos)
- "Create a single unified logo mark" → Reforça unidade
- "Isolated on white background, no mockups" → Negative prompting claro
- "Choose one element only" → Forçar decisão única

### Benchmarks (pesquisa @analyst)
- Flux Schnell: Melhor em "minimalist geometric logos"
- Recraft V3: Melhor em "professional brand marks"
- DALL-E 3: Bom com prompts MUITO específicos

---

## ⏱ TIMELINE

| Atividade | Duração | Responsável |
|-----------|---------|-------------|
| Ler brief + analisar exemplos | 30 min | @prompt-eng |
| Refinar 12 templates (um por segmento) | 1.5h | @prompt-eng |
| Testar 3 segmentos (9 logos) | 30 min | @prompt-eng |
| Code review + ajustes | 30 min | @prompt-eng + @dev |
| **TOTAL** | **~3h** | |

---

## 🔗 CONTEXTO ADICIONAL

### Arquivos para consultar
- `lib/ai/logo-prompts.ts` (versão atual v1)
- `app/api/ai/generate-logo/route.ts` (implementação API)
- `docs/ux/logo-ia-optimization/ROADMAP.md` (visão geral do projeto)
- `.github/attachments/logo-ia-modal.png` (exemplo de logos ruins)

### Comunicação
- **Dúvidas técnicas:** @dev (Dex)
- **Dúvidas UX:** @ux-design-expert (Uma)
- **Aprovação final:** @ux-design-expert (avaliação qualitativa)

---

## ✅ CHECKLIST PRÉ-ENTREGA

Antes de marcar como concluído:

- [ ] 12 templates refinados (1 por segmento)
- [ ] Testado em 3 segmentos (9 logos gerados)
- [ ] Score médio ≥7/10 nos testes
- [ ] Código commitado + reviewed
- [ ] Documentação inline atualizada
- [ ] Relatório `sprint1-comparison.md` criado
- [ ] Aprovação @ux-design-expert

---

**Próximo passo:** Após aprovação, @dev integra Flux Schnell em paralelo para comparação A/B.

**Boa sorte, Wordsmith! 🎨 Conte com nosso suporte se precisar de ajustes ou esclarecimentos.**

---

**Criado por:** @ux-design-expert (Uma)  
**Data:** 01 Mai 2026  
**Versão:** 1.0  
**Status:** 🟢 PRONTO PARA EXECUÇÃO
