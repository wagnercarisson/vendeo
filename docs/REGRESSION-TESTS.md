# Vendeo — Regression Tests

**Data:** 2026-04-22  
**Objetivo:** Checklist executável de testes de regressão  
**Status:** 🔴 MANDATÓRIO — Execute ANTES de cada commit/PR

---

## 🎯 COMO USAR ESTE DOCUMENTO

**Quando executar:**
- ✅ Antes de CADA commit
- ✅ Antes de CADA PR
- ✅ Após modificar fluxo crítico
- ✅ Após integrar módulo legado
- ✅ Após refatoração

**Como executar:**
1. Copie checklist de um teste
2. Execute passo a passo
3. Marque checkboxes conforme avança
4. Documente resultados
5. Se ALGUM teste falhar: ❌ NÃO FAÇA COMMIT

---

## 🧪 BATERIA DE TESTES MANDATÓRIOS

### NÍVEL 1: Testes Unitários (Automatizados)

```bash
npm run test
npm run lint
npm run typecheck
```

**Esperado:**
- ✅ Todos os testes passam
- ✅ Zero erros de lint
- ✅ Zero erros de tipo

**Se falhar:**
- ❌ BLOCKER — Corrija antes de prosseguir

---

### NÍVEL 2: Testes de Fluxo (Manuais E2E)

Execute TODOS os testes abaixo. Não pule nenhum.

---

## 📋 TESTE RT-1: Criação de Campanha Manual (Fluxo Completo)

**Objetivo:** Garantir que criação de campanha do zero funciona.

**Pré-requisitos:**
- [ ] Sistema rodando localmente (`npm run dev`)
- [ ] Banco de dados ativo
- [ ] Loja configurada (store_id conhecido)
- [ ] Usuário autenticado

### Passos

#### 1. Login
- [ ] Acesse http://localhost:3000/login
- [ ] Faça login com credenciais válidas
- [ ] Verifique redirecionamento para /dashboard

#### 2. Navegação
- [ ] No dashboard, clique em "Campanhas"
- [ ] Verifique URL: /dashboard/campaigns
- [ ] Clique em "Nova Campanha"
- [ ] Verifique URL: /dashboard/campaigns/new

#### 3. Preenchimento de Produto
- [ ] Selecione tipo: "Produto"
- [ ] Preencha nome: "Coca Cola 600ml"
- [ ] Preencha preço: "5.99"
- [ ] Preencha descrição: "Refrigerante gelado de cola"
- [ ] Faça upload de imagem (Coca Cola 600ml)
- [ ] Verifique preview da imagem aparece

#### 4. Preenchimento de Estratégia
- [ ] Preencha público: "Jovens adultos"
- [ ] Preencha objetivo: "Aumentar vendas no verão"
- [ ] Preencha posicionamento: "Bebida refrescante para dias quentes"
- [ ] Marque "Gerar post" (padrão)
- [ ] NÃO marque "Gerar reels"

#### 5. Geração
- [ ] Clique em "Gerar Campanha"
- [ ] Verifique loading aparece
- [ ] Aguarde ~5-10 segundos
- [ ] Verifique loading some

#### 6. Validação do Preview
- [ ] Verifique preview de arte aparece
- [ ] Verifique headline preenchida (≤ 25 chars)
- [ ] Verifique body text preenchido (≤ 60 chars)
- [ ] Verifique preço aparece ("R$ 5,99")
- [ ] Verifique CTA aparece
- [ ] Verifique hashtags aparecem
- [ ] Verifique imagem do produto aparece na arte
- [ ] Verifique logo da loja aparece
- [ ] Verifique cores condizem com brand profile

#### 7. Aprovação
- [ ] Clique em "Aprovar"
- [ ] Verifique loading de render aparece
- [ ] Aguarde ~2-5 segundos
- [ ] Verifique redirecionamento para /dashboard

#### 8. Validação Final
- [ ] Na lista de campanhas, encontre a campanha criada
- [ ] Verifique status: "Aprovada"
- [ ] Clique na campanha para abrir
- [ ] Verifique arte final idêntica ao preview
- [ ] Verifique URL da imagem salva (Supabase Storage)

### Critérios de Sucesso

- ✅ TODOS os passos executados sem erro
- ✅ Preview renderizado corretamente
- ✅ Arte final = Preview (paridade visual)
- ✅ Campanha salva no banco com status "approved"
- ✅ Imagem salva no Supabase Storage

### Se Falhar

| Sintoma | Possível Causa | Ação |
|---------|----------------|------|
| Preview não aparece | Erro na geração de conteúdo | Verificar logs do backend, API OpenAI |
| Imagem não aparece na arte | Erro no render | Verificar renderGraphicToBlob() |
| Aprovação falha | Erro no upload Storage | Verificar Supabase connection |
| Headline vazia | Erro no prompt ou normalização | Verificar buildCampaignPrompt() e parser |
| Arte final ≠ Preview | Inconsistência no renderer | Verificar paridade entre preview e render final |

---

## 📋 TESTE RT-2: Validação de Produto (Coca vs Pepsi)

**Objetivo:** Garantir que Visual Reader detecta inconsistência de produto.

**⚠️ STATUS ATUAL:** Este teste FALHARÁ até Visual Reader ser integrado (Fluxo 4).

**Pré-requisitos:**
- [ ] Sistema rodando localmente
- [ ] Visual Reader integrado em generateCampaignContent (ver CRITICAL-FLOWS.md F4)

### Passos

#### Cenário 1: Produto Exato (Happy Path)

1. **Preenchimento:**
   - [ ] product_name: "Coca Cola 600ml"
   - [ ] image: Foto de Coca Cola 600ml (real)

2. **Geração:**
   - [ ] Clique "Gerar Campanha"
   - [ ] Aguarde geração

3. **Validação:**
   - [ ] Nenhum alerta aparece
   - [ ] Copy menciona "Coca Cola"
   - [ ] Copy pode mencionar "garrafa", "600ml", "cor vermelha"

4. **Logs (Backend):**
   - [ ] Verificar console: `[Visual Reader] matchType: exact`
   - [ ] Verificar: `matchedTarget: "Coca Cola 600ml"`

#### Cenário 2: Produto Semelhante (Categoria)

1. **Preenchimento:**
   - [ ] product_name: "Coca Cola 600ml"
   - [ ] image: Foto de Pepsi 2L (real)

2. **Geração:**
   - [ ] Clique "Gerar Campanha"
   - [ ] Aguarde análise visual

3. **Validação:**
   - [ ] Alerta aparece: "⚠️ Detectamos Pepsi 2L na imagem, mas você informou Coca Cola 600ml. Deseja continuar?"
   - [ ] Botões: "Sim" | "Não"

4. **Se clicar "Não":**
   - [ ] Geração cancelada
   - [ ] Volta para edição
   - [ ] Usuário pode trocar imagem

5. **Se clicar "Sim":**
   - [ ] Geração continua
   - [ ] Copy usa termos GENÉRICOS: "refrigerante", "bebida gelada"
   - [ ] Copy NÃO menciona "Coca" ou "Pepsi"

6. **Logs (Backend):**
   - [ ] Verificar console: `[Visual Reader] matchType: category_only`
   - [ ] Verificar console: `[MISMATCH] Expected: Coca Cola 600ml, Found: Pepsi 2L`

#### Cenário 3: Imagem Não Relacionada

1. **Preenchimento:**
   - [ ] product_name: "Coca Cola 600ml"
   - [ ] image: Foto de hambúrguer

2. **Geração:**
   - [ ] Clique "Gerar Campanha"
   - [ ] Aguarde análise visual

3. **Validação:**
   - [ ] Alerta aparece: "❌ A imagem não contém Coca Cola 600ml. Por favor, envie uma imagem adequada."
   - [ ] Geração BLOQUEADA
   - [ ] Usuário DEVE trocar imagem

4. **Logs (Backend):**
   - [ ] Verificar console: `[Visual Reader] matchType: none`

### Critérios de Sucesso

- ✅ Cenário 1: Nenhum alerta, copy correta
- ✅ Cenário 2: Alerta aparece, copy genérica ou bloqueada
- ✅ Cenário 3: Geração bloqueada

### Se Falhar

| Sintoma | Possível Causa | Ação |
|---------|----------------|------|
| Nenhum alerta em Cenário 2 | Visual Reader não integrado | Verificar CRITICAL-FLOWS.md F4, integrar |
| Alerta não bloqueia em Cenário 3 | Lógica de bloqueio ausente | Adicionar verificação antes de gerar |
| Copy menciona Coca em Cenário 2 | Prompt não usa visualReaderResult | Verificar buildCampaignPrompt() |

---

## 📋 TESTE RT-3: Visual Reader Sandbox

**Objetivo:** Garantir que Visual Reader funciona isoladamente.

**Pré-requisitos:**
- [ ] Sistema rodando localmente
- [ ] API de Visual Reader funcional (/api/sandbox/visual-reader/crop)

### Passos

1. **Acesso:**
   - [ ] Acesse http://localhost:3000/sandbox
   - [ ] Verifique página carrega

2. **Upload de Imagem:**
   - [ ] Faça upload de imagem de produto (Coca Cola 600ml)
   - [ ] Verifique preview aparece

3. **Preenchimento:**
   - [ ] Preencha productName: "Coca Cola 600ml"
   - [ ] Deixe outros campos padrão

4. **Análise:**
   - [ ] Clique "Analisar"
   - [ ] Aguarde ~3-5 segundos

5. **Validação do Resultado:**
   - [ ] Verifique bounding box aparece na imagem
   - [ ] Verifique resultado JSON exibido:
     - [ ] `detected: true`
     - [ ] `matchType: "exact"`
     - [ ] `matchedTarget: "Coca Cola 600ml"`
     - [ ] `confidence: "high"`
     - [ ] `targetBox: { x, y, w, h }`
     - [ ] `imageQuality: "good" | "excellent"`
     - [ ] `visibility: "high"`
     - [ ] `framing: string`
     - [ ] `backgroundNoise: "low" | "medium"`
     - [ ] `backgroundType: string`
     - [ ] `hasBackground: boolean`
     - [ ] `subjectCutoff: boolean`
     - [ ] `safeExpansionPotential: number (0-100)`
     - [ ] `focusClarity: "low" | "medium" | "high"`
     - [ ] `visualIsolation: "low" | "medium" | "high"`

6. **Crop Sugerido:**
   - [ ] Verifique preview do crop aparece
   - [ ] Verifique crop centraliza o produto

### Critérios de Sucesso

- ✅ Visual Reader retorna resultado válido
- ✅ Todos os 18 campos preenchidos
- ✅ Bounding box visível
- ✅ Crop sugerido correto

### Se Falhar

| Sintoma | Possível Causa | Ação |
|---------|----------------|------|
| Erro 500 na análise | API OpenAI falhou | Verificar logs, chave API |
| targetBox ausente | Produto não detectado | Verificar prompt de detecção |
| matchType incorreto | Lógica de matching falha | Verificar regras em prompts.ts |

---

## 📋 TESTE RT-4: Regeneração de Campanha

**Objetivo:** Garantir que regeneração sobrescreve conteúdo anterior.

**Pré-requisitos:**
- [ ] Campanha existente com conteúdo gerado

### Passos

1. **Acesso:**
   - [ ] Abra campanha existente
   - [ ] Verifique conteúdo atual (anote headline)

2. **Regeneração:**
   - [ ] Clique "Regenerar"
   - [ ] Aguarde geração (~5-10s)

3. **Validação:**
   - [ ] Verifique novo headline DIFERENTE do anterior
   - [ ] Verifique novo body text
   - [ ] Verifique preview atualizado

4. **Persistência:**
   - [ ] Recarregue página
   - [ ] Verifique novo conteúdo foi salvo

### Critérios de Sucesso

- ✅ Novo conteúdo gerado
- ✅ Conteúdo DIFERENTE do anterior
- ✅ Preview atualizado
- ✅ Persistência funcional

---

## 📋 TESTE RT-5: Weekly Plan (Criação + Orquestração)

**Objetivo:** Garantir fluxo completo de plano semanal.

**Pré-requisitos:**
- [ ] Sistema rodando localmente
- [ ] Loja configurada

### Passos

#### Parte 1: Criação de Plano

1. **Acesso:**
   - [ ] Acesse /dashboard/plans
   - [ ] Clique "Novo Plano"

2. **Wizard Passo 1:**
   - [ ] Selecione 3 dias da semana (ex: Seg, Qua, Sex)
   - [ ] Clique "Avançar"

3. **Wizard Passo 2:**
   - [ ] Aguarde geração de estratégias (~10-15s)
   - [ ] Verifique 3 estratégias geradas (uma por dia)
   - [ ] Revise estratégias
   - [ ] Clique "Aprovar"

4. **Validação:**
   - [ ] Plano salvo com status "approved"
   - [ ] Redirecionamento para /dashboard/plans

#### Parte 2: Orquestração de Campanha

1. **Acesso ao Plano:**
   - [ ] Abra plano criado
   - [ ] Verifique 3 dias com estratégias

2. **Orquestração:**
   - [ ] Clique "Orquestrar" em Segunda-feira
   - [ ] Verifique redirecionamento para /dashboard/campaigns/new?plan_item_id=XXX

3. **Validação de Hidratação:**
   - [ ] Verifique campos PRE-PREENCHIDOS e BLOQUEADOS:
     - [ ] audience (readonly)
     - [ ] objective (readonly)
     - [ ] product_positioning (readonly)
     - [ ] theme (readonly)

4. **Preenchimento:**
   - [ ] Preencha apenas:
     - [ ] product_name
     - [ ] price
     - [ ] image_url

5. **Geração:**
   - [ ] Clique "Gerar Campanha"
   - [ ] Aguarde geração
   - [ ] Verifique preview

6. **Aprovação:**
   - [ ] Aprove campanha
   - [ ] Verifique campanha vinculada ao plano

7. **Validação de Vinculação:**
   - [ ] Volte para /dashboard/plans
   - [ ] Abra plano
   - [ ] Verifique campanha aparece vinculada à Segunda-feira

### Critérios de Sucesso

- ✅ Plano criado com 3 dias
- ✅ Estratégias geradas
- ✅ Campanha vinculada ao plano
- ✅ Campos estratégicos bloqueados
- ✅ Vinculação visível no dashboard do plano

---

## 📋 TESTE RT-6: Edição de Campanha

**Objetivo:** Garantir que edição de texto funciona.

**Pré-requisitos:**
- [ ] Campanha com conteúdo gerado

### Passos

1. **Acesso:**
   - [ ] Abra campanha existente
   - [ ] Clique "Editar"

2. **Edição:**
   - [ ] Modifique headline
   - [ ] Modifique body text
   - [ ] Modifique CTA

3. **Salvar:**
   - [ ] Clique "Salvar"
   - [ ] Verifique preview atualizado

4. **Persistência:**
   - [ ] Recarregue página
   - [ ] Verifique edições foram salvas

### Critérios de Sucesso

- ✅ Edição de texto funcional
- ✅ Preview atualiza em tempo real
- ✅ Salvar persiste mudanças

---

## 📋 TESTE RT-7: Upload de Imagem

**Objetivo:** Garantir upload de imagem para Storage.

**Pré-requisitos:**
- [ ] Supabase configurado
- [ ] Bucket `campaign-images` existe

### Passos

1. **Upload:**
   - [ ] Em criação de campanha, clique "Upload de Imagem"
   - [ ] Selecione imagem (< 5MB, JPG/PNG)
   - [ ] Aguarde upload (~2-5s)

2. **Validação:**
   - [ ] Verifique preview aparece
   - [ ] Verifique URL gerada (supabase.co/storage/...)

3. **Uso na Arte:**
   - [ ] Gere campanha
   - [ ] Verifique imagem aparece na arte

### Critérios de Sucesso

- ✅ Upload funcional
- ✅ URL gerada e válida
- ✅ Imagem aparece na arte

---

## 📊 CHECKLIST RÁPIDO (Pre-Commit)

Use este checklist ANTES de cada commit:

```markdown
## Pre-Commit Checklist

- [ ] `npm run test` — Passou
- [ ] `npm run lint` — Passou
- [ ] `npm run typecheck` — Passou
- [ ] RT-1: Criação de campanha manual — Passou
- [ ] RT-3: Visual Reader sandbox — Passou (se modificou Visual Reader)
- [ ] RT-4: Regeneração — Passou (se modificou geração)
- [ ] RT-5: Weekly Plan — Passou (se modificou planos)
- [ ] Documentação atualizada (CAPABILITIES-INVENTORY.md, CRITICAL-FLOWS.md)
- [ ] Commit message segue conventional commits (feat/fix/docs/chore)
```

**Se ALGUM teste falhou:**
- ❌ NÃO FAÇA COMMIT
- ❌ Reverta mudanças
- ❌ Investigue e corrija

---

## 📊 TEMPLATE DE RELATÓRIO DE TESTE

Ao executar testes manualmente, documente resultados:

```markdown
# Relatório de Testes — [Data]

**Implementador:** @agente  
**Branch:** feature/xyz  
**Story:** Story X.Y

## Testes Executados

### RT-1: Criação de Campanha Manual
- Status: ✅ PASSOU | ⚠️ PASSOU COM RESSALVAS | ❌ FALHOU
- Observações:
  - [Passo X] falhou porque...
  - [Passo Y] teve comportamento inesperado...

### RT-2: Validação de Produto
- Status: ⚠️ NÃO EXECUTADO (Visual Reader não integrado)

### RT-3: Visual Reader Sandbox
- Status: ✅ PASSOU
- Observações:
  - Todos os 18 campos retornados corretamente
  - Bounding box preciso

...

## Resumo
- Total de testes: 7
- Passou: 5
- Falhou: 1
- Não executado: 1

## Ação Necessária
- [ ] Corrigir RT-1 (passo 6)
- [ ] Integrar Visual Reader (RT-2)
```

---

## 🚨 CASOS ESPECIAIS

### Caso 1: Teste Falhou em Produção

Se um teste que passou localmente FALHOU em produção:

1. **Documente:**
   - [ ] Qual teste falhou
   - [ ] Qual era o comportamento esperado
   - [ ] Qual foi o comportamento real
   - [ ] Logs de erro (se houver)

2. **Reproduza Localmente:**
   - [ ] Tente reproduzir localmente
   - [ ] Use dados de produção (cópia)

3. **Investigue:**
   - [ ] Verificar diferenças de ambiente (variáveis, versões)
   - [ ] Verificar logs de produção
   - [ ] Verificar Sentry (se configurado)

4. **Corrija:**
   - [ ] Implementar fix
   - [ ] Testar localmente (TODOS os testes)
   - [ ] Testar em staging (se houver)
   - [ ] Deploy em produção

5. **Previna:**
   - [ ] Adicionar teste de regressão específico
   - [ ] Atualizar REGRESSION-TESTS.md
   - [ ] Atualizar CRITICAL-FLOWS.md se necessário

---

### Caso 2: Teste Intermitente

Se um teste falha OCASIONALMENTE:

1. **Identifique Padrão:**
   - [ ] Falha sempre no mesmo passo?
   - [ ] Falha em horários específicos?
   - [ ] Falha com dados específicos?

2. **Possíveis Causas:**
   - Race condition
   - Timeout curto
   - Dependência externa instável (API OpenAI)
   - Cache inconsistente

3. **Resolução:**
   - [ ] Adicionar retry logic (se dependência externa)
   - [ ] Aumentar timeouts (se necessário)
   - [ ] Adicionar logs para debug
   - [ ] Isolar teste (rodar isoladamente)

---

### Caso 3: Teste Não Aplicável

Se um teste NÃO SE APLICA mais (feature removida):

1. **Documentar:**
   - [ ] Qual teste
   - [ ] Por que não se aplica mais
   - [ ] Quando foi removido

2. **Atualizar:**
   - [ ] Marcar teste como DEPRECATED neste documento
   - [ ] Atualizar CRITICAL-FLOWS.md
   - [ ] Atualizar CAPABILITIES-INVENTORY.md

3. **Não Deletar:**
   - ⚠️ NUNCA delete um teste deste documento
   - ⚠️ Apenas marque como DEPRECATED com data e motivo

**Template:**

```markdown
## ~~TESTE RT-X: [Nome do Teste]~~ (DEPRECATED)

**Status:** ❌ DEPRECATED  
**Data:** 2026-XX-XX  
**Motivo:** Feature removida em Story Y.Z  
**Substituto:** RT-Y: [Novo Teste]
```

---

## 📊 MÉTRICAS DE QUALIDADE

**Target de Cobertura:**
- Testes unitários: >= 80%
- Testes de integração: >= 60%
- Testes E2E: 100% dos fluxos críticos

**Target de Estabilidade:**
- Taxa de sucesso em CI: >= 95%
- Falhas intermitentes: <= 5%

**Target de Velocidade:**
- Testes unitários: < 10s
- Testes de integração: < 30s
- Testes E2E (manuais): < 5min por teste

---

## 📅 CRONOGRAMA DE REVISÃO

**Frequência:**
- Após cada Epic: Revisar TODOS os testes
- Após regressão detectada: Adicionar teste específico
- Mensal: Executar bateria completa manualmente

**Responsável:**
- @qa — Execução e documentação
- @dev — Implementação de testes automatizados
- @aiox-master — Manutenção deste documento

---

**Última atualização:** 2026-04-22  
**Próxima revisão:** Após Story 4.1  
**Responsável:** @aiox-master

---

*Estes testes são a ÚLTIMA LINHA DE DEFESA contra regressões.*
