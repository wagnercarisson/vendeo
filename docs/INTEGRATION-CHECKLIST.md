# Vendeo — Integration Checklist

**Data:** 2026-04-22  
**Objetivo:** Checklist MANDATÓRIO antes de implementar/modificar qualquer feature  
**Status:** 🔴 BLOQUEADOR — Não avançar sem completar este checklist

---

## 🛑 REGRA DE OURO

> **NENHUM código pode ser implementado sem completar este checklist.**

Se você não sabe a resposta de alguma pergunta:
1. PARE
2. Investigue
3. Documente
4. Só então implemente

---

## ✅ CHECKLIST OBRIGATÓRIO

### SEÇÃO 1: INVENTÁRIO

**Antes de começar a codificar:**

- [ ] Li [CAPABILITIES-INVENTORY.md](./CAPABILITIES-INVENTORY.md) COMPLETO
- [ ] Identifiquei TODAS as capacidades que esta feature afeta
- [ ] Verifiquei se não estou duplicando algo que já existe
- [ ] Verifiquei se não estou substituindo sem documentar

**Se você marcou "Sim" para substituir uma capacidade:**

- [ ] Documentei exatamente O QUE está sendo substituído
- [ ] Listei TODAS as funcionalidades da capacidade antiga
- [ ] Confirmei que a nova implementação mantém 100% das funcionalidades
- [ ] Criei migration path se necessário
- [ ] Criei testes de regressão (ver REGRESSION-TESTS.md)

---

### SEÇÃO 2: DEPENDÊNCIAS

**Esta feature CONSOME dados de outras partes do sistema?**

- [ ] Não → Pular para Seção 3
- [ ] Sim → Responder abaixo:

**Liste TODAS as dependências:**

| Capacidade/Módulo | Path | O Que Consome | Formato Esperado |
|-------------------|------|---------------|------------------|
| Exemplo: Visual Reader | lib/visual-reader/ | matchType, matchedTarget | VisualReaderResult |
| | | | |
| | | | |

**Para cada dependência:**

- [ ] Verifiquei que o módulo existe e está funcional
- [ ] Verifiquei o formato de saída (types, schemas)
- [ ] Testei a integração com mock data
- [ ] Documentei a dependência no código (comentários)

---

### SEÇÃO 3: ENTRY POINTS

**ONDE esta feature será CHAMADA?**

Liste TODOS os entry points:

| Entry Point | Path | Contexto |
|-------------|------|----------|
| Exemplo: API Route | app/api/generate/campaign/route.ts | Geração de campanha manual |
| | | |
| | | |

**Para cada entry point:**

- [ ] Verifiquei que não quebra fluxos existentes
- [ ] Adicionei validação de input (Zod schemas)
- [ ] Adicionei error handling
- [ ] Adicionei logs para debug
- [ ] Testei manualmente o fluxo completo

---

### SEÇÃO 4: IMPACTO EM FLUXOS CRÍTICOS

**Consulte [CRITICAL-FLOWS.md](./CRITICAL-FLOWS.md) e responda:**

Esta feature afeta algum dos fluxos críticos?

- [ ] Não → Pular para Seção 5
- [ ] Sim → Responder abaixo:

**Fluxos críticos afetados:**

| Fluxo | Como Afeta | Risco |
|-------|------------|-------|
| | | |
| | | |

**Para cada fluxo afetado:**

- [ ] Li a descrição completa em CRITICAL-FLOWS.md
- [ ] Entendi O QUE NÃO PODE REGREDIR
- [ ] Criei testes de regressão específicos
- [ ] Testei o fluxo END-TO-END manualmente
- [ ] Documentei mudanças de comportamento (se houver)

---

### SEÇÃO 5: VALIDAÇÃO E TESTES

**Tipos de teste necessários:**

- [ ] **Unit Tests:** Funções isoladas testadas
  - [ ] Coverage >= 80%
  - [ ] Edge cases cobertos
  - [ ] Mocks para dependências externas

- [ ] **Integration Tests:** Módulos integrados testados
  - [ ] Happy path funciona
  - [ ] Error cases tratados
  - [ ] Timeouts configurados

- [ ] **Regression Tests:** Funcionalidades antigas não quebraram
  - [ ] Consultei [REGRESSION-TESTS.md](./REGRESSION-TESTS.md)
  - [ ] Executei TODOS os testes mandatórios
  - [ ] Documentei resultados

- [ ] **Manual Tests:** Fluxo completo na UI
  - [ ] Testei em ambiente local
  - [ ] Testei em ambiente de staging (se houver)
  - [ ] Testei com dados reais de produção (cópia)

---

### SEÇÃO 6: DOCUMENTAÇÃO

**Documentação atualizada:**

- [ ] [CAPABILITIES-INVENTORY.md](./CAPABILITIES-INVENTORY.md) — Adicionei/atualizei a capacidade
- [ ] [CRITICAL-FLOWS.md](./CRITICAL-FLOWS.md) — Atualizei fluxos afetados (se houver)
- [ ] [REGRESSION-TESTS.md](./REGRESSION-TESTS.md) — Adicionei novos testes
- [ ] README.md do módulo — Criei/atualizei
- [ ] Comentários no código — Adicionei onde necessário
- [ ] Story/Epic — Atualizei status e notas

---

### SEÇÃO 7: CODE REVIEW

**Antes de abrir PR/commit:**

- [ ] `npm run lint` — Passou sem erros
- [ ] `npm run typecheck` — Passou sem erros
- [ ] `npm run test` — Passou sem erros
- [ ] CodeRabbit review — Solicitado e aprovado
- [ ] Self-review — Li meu próprio código linha por linha
- [ ] Commit message — Segue conventional commits (feat/fix/docs/chore)

---

### SEÇÃO 8: DEPLOYMENT

**Antes de fazer merge:**

- [ ] Feature flag criada (se necessário)
- [ ] Rollback plan definido
- [ ] Monitoring/alerts configurados (se necessário)
- [ ] Documentação de deployment atualizada

---

## 📋 TEMPLATE DE USO

Copie e cole este template no início da implementação:

```markdown
# Integration Checklist — [Nome da Feature]

**Data:** YYYY-MM-DD
**Implementador:** @agente
**Story/Epic:** Story X.Y

## 1. INVENTÁRIO
- [ ] Li CAPABILITIES-INVENTORY.md completo
- [ ] Não estou duplicando funcionalidade existente
- [ ] Não estou substituindo sem migration plan

## 2. DEPENDÊNCIAS
Lista de dependências:
- [Módulo X] → consome [campo Y] no formato [Z]

## 3. ENTRY POINTS
Lista de entry points:
- [Path A] → contexto [B]

## 4. IMPACTO EM FLUXOS CRÍTICOS
Fluxos afetados:
- [Fluxo X] → impacto [Y]

## 5. VALIDAÇÃO E TESTES
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests (happy + error paths)
- [ ] Regression tests (TODOS os mandatórios)
- [ ] Manual tests (E2E completo)

## 6. DOCUMENTAÇÃO
- [ ] CAPABILITIES-INVENTORY.md atualizado
- [ ] CRITICAL-FLOWS.md atualizado (se aplicável)
- [ ] REGRESSION-TESTS.md atualizado
- [ ] README.md do módulo criado/atualizado

## 7. CODE REVIEW
- [ ] lint, typecheck, test — passing
- [ ] CodeRabbit review — aprovado
- [ ] Self-review completo

## 8. DEPLOYMENT
- [ ] Feature flag criada (se necessário)
- [ ] Rollback plan definido
- [ ] Monitoring configurado
```

---

## 🚨 CASOS ESPECIAIS

### Caso 1: Substituindo uma Capacidade Existente

**Exemplo:** Epic 4.1 Visual Reader substitui o reader atual

**MANDATÓRIO:**

1. **Inventário de Perda:**
   - Liste TUDO que a versão antiga faz
   - Liste TUDO que a versão nova faz
   - Identifique o que será PERDIDO

2. **Migration Plan:**
   - Decida: substituir, estender ou manter ambas
   - Se substituir: como preservar funcionalidades críticas?
   - Se estender: como integrar com código existente?
   - Se manter ambas: como evitar confusão?

3. **Rollback:**
   - Como voltar para versão antiga se der problema?
   - Código antigo será mantido comentado?
   - Testes da versão antiga serão mantidos?

4. **Comunicação:**
   - Atualizar CAPABILITIES-INVENTORY.md com status "DEPRECATED"
   - Criar issue de migration
   - Avisar time

**Template:**

```markdown
## Migration Plan — [Capacidade Antiga → Nova]

### Inventário de Perda
| Funcionalidade | Antiga | Nova | Status |
|----------------|--------|------|--------|
| Validação de produto | ✅ Sim | ❌ Não | 🔴 PERDIDA |
| matchType | ✅ Sim | ❌ Não | 🔴 PERDIDA |
| ... | ... | ... | ... |

### Decisão
- [ ] Substituir (justificar perda de funcionalidades)
- [ ] Estender (adicionar campos à versão existente)
- [ ] Manter ambas (justificar manutenção duplicada)

### Rollback Plan
1. [Passo 1]
2. [Passo 2]
...

### Comunicação
- [ ] CAPABILITIES-INVENTORY.md atualizado
- [ ] Issue de migration criada: #XXX
- [ ] Time avisado no Slack/email
```

---

### Caso 2: Integrando com Código Legado

**Exemplo:** Integrar Visual Reader com generateCampaignContent()

**MANDATÓRIO:**

1. **Análise de Impacto:**
   - Quantos lugares chamam o código legado?
   - O que quebra se mudar a assinatura?
   - Backward compatibility é necessária?

2. **Estratégia:**
   - Adicionar parâmetro opcional (não quebra nada)
   - Criar nova função (mantém antiga intacta)
   - Refatorar completamente (migração necessária)

3. **Testes de Regressão:**
   - TODOS os fluxos existentes devem continuar funcionando
   - Executar REGRESSION-TESTS.md completo

**Template:**

```markdown
## Integration Plan — [Novo Módulo → Código Legado]

### Análise de Impacto
| Módulo Afetado | Usos | Quebra? | Solução |
|----------------|------|---------|---------|
| generateCampaignContent | 3 | Sim, se mudar assinatura | Adicionar param opcional |
| ... | ... | ... | ... |

### Estratégia
- [X] Adicionar parâmetro opcional: `visualReaderResult?: VisualReaderResult | null`
- [ ] Criar nova função
- [ ] Refatorar completamente

### Backward Compatibility
- [X] Código antigo continua funcionando (param opcional = null)
- [ ] Feature flag para habilitar novo comportamento
- [ ] Migration guide para usuários

### Testes de Regressão
- [ ] TESTE 1: Criação de campanha SEM Visual Reader (fluxo antigo)
- [ ] TESTE 2: Criação de campanha COM Visual Reader (fluxo novo)
- [ ] TESTE 3: Regeneração de campanha existente
...
```

---

### Caso 3: Feature Completamente Nova

**Exemplo:** Intent Resolver (Story 4.2)

**MANDATÓRIO:**

1. **Definir Contrato:**
   - Input: tipos claros
   - Output: tipos claros
   - Errors: mapeados

2. **Definir Testes:**
   - Happy path
   - Edge cases
   - Error cases

3. **Documentar:**
   - README do módulo
   - Exemplos de uso
   - Entry em CAPABILITIES-INVENTORY.md

**Template:**

```markdown
## New Feature — [Nome da Feature]

### Contrato
**Input:**
```typescript
{
  campo1: tipo,
  campo2: tipo
}
```

**Output:**
```typescript
{
  resultado: tipo
}
```

**Errors:**
- ERROR_CODE_1: quando X acontece
- ERROR_CODE_2: quando Y acontece

### Testes
- [ ] Happy path: input válido → output correto
- [ ] Edge case 1: input vazio → error X
- [ ] Edge case 2: input inválido → error Y
...

### Documentação
- [ ] README criado em [path]
- [ ] Exemplos de uso adicionados
- [ ] CAPABILITIES-INVENTORY.md atualizado
```

---

## 🎯 EXEMPLOS REAIS

### EXEMPLO 1: Epic 4.1 Visual Reader (PROBLEMA REAL)

**Situação:**
- Story 4.1 propõe criar novo Visual Reader
- Path planejado: `lib/ai/visual-reader/`
- Path atual existente: `lib/visual-reader/`
- ⚠️ CONFLITO

**Checklist aplicado:**

#### 1. INVENTÁRIO
- [X] Li CAPABILITIES-INVENTORY.md completo
- [X] Identifiquei: Visual Reader ATUAL existe e é funcional
- [❌] PROBLEMA: Estou criando um reader DIFERENTE, não estendendo

#### 2. DEPENDÊNCIAS
- Visual Reader atual tem 18 campos
- Visual Reader novo (planejado) tem 8 campos
- ❌ PERDENDO: productName, matchType, matchedTarget, detected

#### 4. IMPACTO EM FLUXOS CRÍTICOS
- ❌ Fluxo: "Validação de produto vs imagem" será QUEBRADO
- ❌ Risco: Usuário cria campanha "Coca Cola 600ml" com imagem de Pepsi
- ❌ Sistema não detecta inconsistência

#### **DECISÃO NECESSÁRIA:**

**Opção A: Estender o reader atual**
```
lib/visual-reader/
├── contracts.ts — ADICIONAR campos de composição
├── prompts.ts   — ESTENDER prompt
└── service.ts   — MANTER validação + ADICIONAR análise visual
```

**Resultado:**
- ✅ Mantém validação de produto
- ✅ Adiciona análise visual para layout
- ✅ Um reader completo (validação + composição)

**Opção B: Criar reader separado**
```
lib/visual-reader/              — Validação de produto
lib/visual-composition-reader/  — Características visuais
```

**Resultado:**
- ✅ Separação de responsabilidades
- ⚠️ 2 calls de IA por campanha (mais caro)
- ⚠️ Manutenção duplicada

**Opção C: Substituir (PROBLEMÁTICA)**
```
lib/visual-reader/ → DELETAR
lib/ai/visual-reader/ → CRIAR
```

**Resultado:**
- ❌ PERDE validação de produto
- ❌ PERDE capacidades críticas
- 🔴 NÃO RECOMENDADO

---

### EXEMPLO 2: Integração Visual Reader + Campaign Generation (SOLUÇÃO)

**Situação:**
- Visual Reader existe mas não é usado
- generateCampaignContent() não valida imagem

**Checklist aplicado:**

#### 3. ENTRY POINTS
- [X] Entry point: `lib/domain/campaigns/service.ts` linha 104
- [X] Contexto: Geração de copy

#### 4. IMPACTO EM FLUXOS CRÍTICOS
- [X] Fluxo afetado: "Criação de Campanha Manual"
- [X] Impacto: ADICIONA validação (não quebra)
- [X] Risco: Baixo (parâmetro opcional)

#### Migration Plan
```typescript
// ANTES (linha 104-106)
const prompt = buildCampaignPrompt(campaignCtx, store, null, description);

// DEPOIS
let visualReaderResult = null;
if (campaign.product_image_url) {
  visualReaderResult = await readVisualTarget({
    imageUrl: campaign.product_image_url,
    targetLabel: campaign.content_type === "product" ? "produto" : "serviço",
    productName: campaign.product_name,
    category: store.main_segment || undefined
  });
}
const prompt = buildCampaignPrompt(campaignCtx, store, visualReaderResult, description);
```

**Resultado:**
- ✅ Backward compatible (param opcional)
- ✅ Adiciona validação sem quebrar nada
- ✅ Código antigo continua funcionando

---

## 📊 MÉTRICAS DE SUCESSO

**Este checklist é eficaz se:**

- Zero regressões não detectadas
- Zero features duplicadas criadas
- 100% de cobertura de testes antes de merge
- Documentação sempre atualizada

**Review este checklist:**
- Após cada Epic
- Se houver regressões não detectadas
- Se houver duplicação de código

---

**Última atualização:** 2026-04-22  
**Próxima revisão:** Após Story 4.1  
**Responsável:** @aiox-master

---

*Este checklist BLOQUEIA implementações sem validação adequada.*
