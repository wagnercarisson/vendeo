# Pre-Decision Protocol — Freio Mandatório

**Data:** 2026-04-22  
**Última atualização:** April 27, 2026 (renomeado de AIOX-MASTER-PROTOCOL)  
**Propósito:** Protocolo obrigatório para @aiox-master antes de qualquer decisão técnica  
**Status:** 🔴 MANDATÓRIO — Não pular este protocolo

---

## 🎯 QUANDO USAR

Execute este protocolo ANTES de:
- ✅ Criar ou aprovar roadmap
- ✅ Criar ou aprovar epic
- ✅ Criar ou aprovar story
- ✅ Delegar trabalho para qualquer agente (@dev, @sm, @qa, etc)
- ✅ Sugerir implementação técnica
- ✅ Aprovar PR ou merge
- ✅ Responder pergunta técnica que envolve decisão

**Se você não seguir este protocolo:** Decisão errada → retrabalho → frustração do usuário

---

## 📋 PROTOCOLO PRE-FLIGHT (5 FASES)

### FASE 1: CONTEXTO (5 minutos)

**Objetivo:** Entender o pedido REAL, não só o superficial.

**Checklist:**
- [ ] Li user request COMPLETO (não apenas primeira frase)
- [ ] Identifiquei objetivo real (pode ser diferente do pedido)
- [ ] Identifiquei riscos:
  - [ ] Regressão (quebrar algo que funciona)
  - [ ] Duplicação (criar algo que já existe)
  - [ ] Substituição (trocar sem migration plan)
  - [ ] Complexidade desnecessária

**Perguntas a responder:**
1. O que o usuário REALMENTE quer? (objetivo final)
2. Por que ele quer isso? (problema sendo resolvido)
3. Qual o risco se eu errar? (impacto de decisão errada)

**Documentar:**
```yaml
context:
  user_request: "[Texto literal do pedido]"
  real_objective: "[Objetivo inferido]"
  problem_being_solved: "[Problema raiz]"
  risks:
    - "[Risco 1]"
    - "[Risco 2]"
```

---

### FASE 2: INVENTÁRIO (10 minutos)

**Objetivo:** Verificar o que JÁ EXISTE antes de criar/modificar.

**Checklist:**
- [ ] Li `docs/CAPABILITIES-INVENTORY.md` COMPLETO
- [ ] Busquei por funcionalidade relacionada (Ctrl+F)
- [ ] Verifiquei se funcionalidade JÁ EXISTE:
  - [ ] Existe e funciona → Reutilizar
  - [ ] Existe mas incompleta → Estender
  - [ ] Não existe → Criar do zero
- [ ] Se vou SUBSTITUIR algo:
  - [ ] Listei TODAS as funcionalidades da versão antiga
  - [ ] Criei migration plan (ver INTEGRATION-CHECKLIST Caso 1)
  - [ ] Defini rollback plan

**Perguntas a responder:**
1. Esta funcionalidade já existe em algum lugar?
2. Se existe, por que não está sendo usada?
3. Se vou substituir, o que será PERDIDO?
4. Como preservar capacidades críticas?

**Documentar:**
```yaml
inventory_check:
  consulted: true
  existing_capabilities:
    - path: "lib/visual-reader/"
      description: "Visual Reader atual com 18 campos"
      status: "funcional mas não integrado"
  will_replace: true/false
  migration_plan: |
    [Se replace=true, descrever plano completo:
     - O que será substituído
     - O que será perdido
     - Como preservar funcionalidades críticas
     - Rollback plan]
```

---

### FASE 3: FLUXOS CRÍTICOS (10 minutos)

**Objetivo:** Identificar fluxos afetados e o que NÃO PODE REGREDIR.

**Checklist:**
- [ ] Li `docs/CRITICAL-FLOWS.md` — seções relevantes
- [ ] Identifiquei fluxos afetados (lista com IDs: F1, F2, etc)
- [ ] Para cada fluxo afetado:
  - [ ] Li seção "O QUE NÃO PODE REGREDIR"
  - [ ] Verifiquei se minha decisão mantém esses requisitos
  - [ ] Defini testes de regressão necessários (RT-1, RT-2, etc)
- [ ] Se não há fluxos afetados:
  - [ ] Confirmei que é funcionalidade nova (não toca código existente)

**Perguntas a responder:**
1. Quais fluxos críticos serão afetados?
2. O que NÃO PODE REGREDIR em cada fluxo?
3. Como vou testar que não regrediu?
4. Se quebrar, qual o impacto no usuário?

**Documentar:**
```yaml
critical_flows_check:
  consulted: true
  affected_flows:
    - id: "F1"
      name: "Criação de Campanha Manual"
      cannot_regress:
        - "Validação de campos obrigatórios"
        - "Geração de texto funcional"
      regression_tests: ["RT-1"]
    - id: "F4"
      name: "Validação Produto vs Imagem"
      cannot_regress:
        - "Detecção de inconsistências (Coca vs Pepsi)"
      regression_tests: ["RT-2", "RT-3"]
```

---

### FASE 4: INTEGRATION (5 minutos)

**Objetivo:** Entender dependências e entry points.

**Checklist:**
- [ ] Li `docs/INTEGRATION-CHECKLIST.md` — seções relevantes
- [ ] Identifiquei dependencies:
  - [ ] O que esta funcionalidade CONSOME (inputs)
  - [ ] Formato esperado (types, schemas)
- [ ] Identifiquei entry points:
  - [ ] Onde esta funcionalidade será CHAMADA
  - [ ] Contexto de uso
- [ ] Verifiquei backward compatibility:
  - [ ] Mudança quebra código existente? (breaking change)
  - [ ] Se sim: migration necessária

**Perguntas a responder:**
1. O que esta funcionalidade consome? (dependencies)
2. Onde será chamada? (entry points)
3. Quebra algo existente? (breaking changes)
4. Como integrar sem quebrar?

**Documentar:**
```yaml
integration_check:
  consulted: true
  dependencies:
    - module: "lib/visual-reader/service.ts"
      consumes: "readVisualTarget()"
      format: "VisualReaderResult"
  entry_points:
    - path: "lib/domain/campaigns/service.ts"
      line: 104
      context: "Geração de conteúdo"
  breaking_changes: true/false
  backward_compatible: true/false
```

---

### FASE 5: DECISÃO (5 minutos)

**Objetivo:** Documentar decisão final e validar gates.

**Checklist:**
- [ ] Decidi ação (create_story | modify_code | delegate_to_agent | reject)
- [ ] Justifiquei decisão (POR QUÊ esta é a escolha correta)
- [ ] Validei gates automáticos (ver abaixo)
- [ ] Salvei decisão em `docs/integration-checklists/DEC-{timestamp}.md`

**Perguntas a responder:**
1. Qual ação vou tomar?
2. Por que esta é a decisão correta?
3. Quem vai executar? (agente ou implementação direta)
4. Quando executar? (agora ou depois de dependências)

**Documentar:**
```yaml
decision:
  id: "DEC-2026-04-22-001"
  timestamp: "2026-04-22T15:30:00Z"
  action: "create_story | modify_story | delegate_to_agent | reject"
  target: "@dev | @sm | @qa | direct_implementation"
  rationale: |
    [Explicar POR QUÊ esta é a decisão correta.
     Referenciar CAPABILITIES-INVENTORY, CRITICAL-FLOWS, etc]
  
  validation:
    pre_flight_complete: true
    all_phases_executed: true
    gates_validated: true
    ready_to_proceed: true
```

---

## 🚨 GATES AUTOMÁTICOS

Antes de prosseguir, validar TODOS os gates:

### GATE 1: Inventory Check

```yaml
IF inventory_check.consulted == false:
  ❌ BLOCK
  ACTION: Voltar para FASE 2, ler CAPABILITIES-INVENTORY.md
```

### GATE 2: Migration Plan

```yaml
IF inventory_check.will_replace == true AND migration_plan == null:
  ❌ BLOCK
  ACTION: Criar migration plan (ver INTEGRATION-CHECKLIST Caso 1)
```

### GATE 3: Critical Flows

```yaml
IF critical_flows_check.affected_flows.length > 0 AND regression_tests == []:
  ❌ BLOCK
  ACTION: Definir testes de regressão obrigatórios
```

### GATE 4: Pre-Flight Complete

```yaml
IF decision.validation.pre_flight_complete == false:
  ❌ BLOCK
  ACTION: Completar TODAS as 5 fases do protocolo
```

### GATE 5: Visual Reader Protection (Especial)

```yaml
IF decision.target contains "lib/visual-reader/":
  IF migration_plan == null OR product_validation_preserved == false:
    ❌ BLOCK
    ACTION: Seguir Artigo II da PROJECT-CONSTITUTION.md
```

**Todos os gates passaram?**
- ✅ SIM → Prosseguir com decisão
- ❌ NÃO → PARAR, corrigir gates primeiro

---

## 📝 TEMPLATE DE DECISÃO (Salvar em docs/integration-checklists/)

```markdown
# Decision DEC-2026-04-22-001

**Data:** 2026-04-22T15:30:00Z  
**Decisor:** @aiox-master  
**Contexto:** [User request literal]

---

## FASE 1: CONTEXTO

**User Request:**
```
[Texto literal do pedido do usuário]
```

**Objetivo Real:**
[O que o usuário REALMENTE quer]

**Problema Sendo Resolvido:**
[Problema raiz]

**Riscos Identificados:**
- [Risco 1: Ex: Regressão em Fluxo F1]
- [Risco 2: Ex: Perda de capacidade de validação]

---

## FASE 2: INVENTÁRIO

**CAPABILITIES-INVENTORY.md consultado:** ✅ SIM

**Funcionalidades Existentes:**
| Path | Descrição | Status |
|------|-----------|--------|
| lib/visual-reader/ | Visual Reader com 18 campos | Funcional, não integrado |

**Vai Substituir?** ✅ SIM / ❌ NÃO

**Migration Plan:**
```
[Se SIM, descrever plano completo]
```

---

## FASE 3: FLUXOS CRÍTICOS

**CRITICAL-FLOWS.md consultado:** ✅ SIM

**Fluxos Afetados:**
| ID | Nome | Não Pode Regredir | Testes |
|----|------|-------------------|--------|
| F1 | Criação de Campanha | Validação de campos | RT-1 |
| F4 | Validação Produto vs Imagem | Detecção de inconsistências | RT-2, RT-3 |

---

## FASE 4: INTEGRATION

**INTEGRATION-CHECKLIST.md consultado:** ✅ SIM

**Dependencies:**
- lib/visual-reader/service.ts → readVisualTarget()

**Entry Points:**
- lib/domain/campaigns/service.ts (linha 104)

**Breaking Changes:** ❌ NÃO

---

## FASE 5: DECISÃO

**Ação:** [create_story | modify_story | delegate_to_agent | reject]

**Target:** [@dev | @sm | @qa | direct_implementation]

**Rationale:**
```
[Explicação detalhada do POR QUÊ desta decisão.
 Referenciar documentação consultada.]
```

**Gates Validados:**
- [✅] GATE 1: Inventory Check
- [✅] GATE 2: Migration Plan (se aplicável)
- [✅] GATE 3: Critical Flows
- [✅] GATE 4: Pre-Flight Complete
- [✅] GATE 5: Visual Reader Protection (se aplicável)

**Pronto para Proceder:** ✅ SIM

---

## NEXT STEPS

1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

---

**Decisão aprovada e documentada.**
```

---

## 🎯 EXEMPLO REAL: Epic 4.1 (O QUE DEU ERRADO)

### Situação

Usuário pediu: "Melhorar Visual Reader para composição de layout"

### O QUE EU FIZ (ERRADO) — SEM PROTOCOLO

```yaml
decision:
  context:
    user_request: "Melhorar Visual Reader"
  action: "Aprovar Story 4.1 - Criar novo Visual Reader"
  
  # ❌ FASES NÃO EXECUTADAS
  inventory_check:
    consulted: FALSE  # ❌ NÃO VERIFIQUEI que já existe Visual Reader
  
  critical_flows_check:
    consulted: FALSE  # ❌ NÃO VERIFIQUEI fluxos afetados
  
  # RESULTADO
  outcome: |
    Story 4.1 propôs criar novo reader em lib/ai/visual-reader/
    com apenas 8 campos, SUBSTITUINDO o atual que tem 18 campos.
    PERDEU capacidades críticas: productName, matchType, matchedTarget.
    Fluxo F4 (Validação de Produto) seria QUEBRADO.
```

**Consequência:** Retrabalho, criação de 4 documentos bússola, revisão completa.

---

### O QUE EU DEVERIA TER FEITO (CERTO) — COM PROTOCOLO

```yaml
decision:
  id: "DEC-2026-04-15-001"
  context:
    user_request: "Melhorar Visual Reader"
    real_objective: "Adicionar análise de composição visual para layout"
    problem_being_solved: "Renderer precisa saber características visuais da imagem"
    risks:
      - "Substituir reader atual pode perder validação de produto"
      - "Duplicar reader aumenta custo de API"
  
  # ✅ FASE 2: INVENTÁRIO
  inventory_check:
    consulted: TRUE ✅
    existing_capabilities:
      - path: "lib/visual-reader/"
        description: "Visual Reader com 18 campos, inclui validação de produto"
        status: "Funcional mas não integrado em geração de campanha"
    will_replace: TRUE
    migration_plan: |
      OPÇÃO A (RECOMENDADA): Estender reader atual
      - Adicionar 8 campos de composição aos 18 existentes
      - Total: 26 campos (validação + composição)
      - Um reader completo
      - Custo: 1 API call por campanha
      
      OPÇÃO B: Manter dois readers separados
      - lib/visual-reader/ → Validação (18 campos)
      - lib/visual-composition-reader/ → Composição (8 campos)
      - Custo: 2 API calls por campanha
      
      DECISÃO: Opção A (estender)
  
  # ✅ FASE 3: FLUXOS CRÍTICOS
  critical_flows_check:
    consulted: TRUE ✅
    affected_flows:
      - id: "F1"
        name: "Criação de Campanha Manual"
        cannot_regress:
          - "Geração de conteúdo funcional"
        regression_tests: ["RT-1"]
      - id: "F2"
        name: "Geração de Conteúdo"
        cannot_regress:
          - "Prompt não pode ser cego em relação à imagem"
        regression_tests: ["RT-1"]
      - id: "F4"
        name: "Validação Produto vs Imagem"
        cannot_regress:
          - "Detecção de Coca vs Pepsi"
          - "matchType, matchedTarget"
        regression_tests: ["RT-2", "RT-3"]
  
  # ✅ FASE 4: INTEGRATION
  integration_check:
    consulted: TRUE ✅
    dependencies:
      - module: "lib/visual-reader/service.ts"
        consumes: "Nenhum (é provider)"
    entry_points:
      - path: "lib/domain/campaigns/service.ts"
        line: 104
        context: "Geração de campanha (atualmente não usa, deveria usar)"
    breaking_changes: FALSE
    backward_compatible: TRUE (se estender campos)
  
  # ✅ FASE 5: DECISÃO
  action: "modify_story"
  target: "@sm"
  rationale: |
    Story 4.1 deve ESTENDER Visual Reader atual, não substituir.
    
    Motivo:
    1. Reader atual tem capacidades CRÍTICAS (validação de produto)
    2. Substituir sem migration plan = perda de capacidades
    3. Fluxo F4 (Validação) seria quebrado
    4. Estender é mais simples e mantém tudo
    
    Ação:
    - Modificar Story 4.1 para adicionar 8 campos aos 18 existentes
    - Manter lib/visual-reader/ (não criar lib/ai/visual-reader/)
    - Atualizar contracts.ts com novos campos
    - Atualizar prompts.ts com instruções de composição
    - Manter retrocompatibilidade total
  
  validation:
    pre_flight_complete: TRUE ✅
    all_phases_executed: TRUE ✅
    gates_validated: TRUE ✅
    ready_to_proceed: TRUE ✅
```

**Resultado:** Story 4.1 corrigida, zero regressão, zero retrabalho.

---

## 📊 CHECKLIST RÁPIDO (Use Antes de Cada Decisão)

```markdown
## Pre-Flight Checklist

- [ ] FASE 1: Entendi objetivo REAL do usuário
- [ ] FASE 2: Li CAPABILITIES-INVENTORY.md completo
- [ ] FASE 2: Verifiquei se funcionalidade já existe
- [ ] FASE 2: Se substituir: criei migration plan
- [ ] FASE 3: Li CRITICAL-FLOWS.md (seções relevantes)
- [ ] FASE 3: Identifiquei fluxos afetados
- [ ] FASE 3: Defini testes de regressão
- [ ] FASE 4: Li INTEGRATION-CHECKLIST.md (seções relevantes)
- [ ] FASE 4: Identifiquei dependencies e entry points
- [ ] FASE 5: Documentei decisão em YAML
- [ ] FASE 5: Validei TODOS os gates automáticos
- [ ] FASE 5: Salvei decisão em docs/integration-checklists/

**Todos marcados?** → Pronto para proceder ✅
```

---

## 🔄 CONTINUOUS IMPROVEMENT

### Aprendizado com Erros

Quando uma decisão resulta em retrabalho:
1. Auditar decisão em `docs/integration-checklists/DEC-{id}.md`
2. Identificar qual fase foi mal executada
3. Atualizar este protocolo se necessário
4. Adicionar exemplo ao final deste documento

### Métricas de Sucesso

| Métrica | Target |
|---------|--------|
| Decisões sem retrabalho | >= 95% |
| Pre-flight completo | 100% |
| Gates validados | 100% |
| Tempo médio de protocolo | <= 30 min |

### Revisão Periódica

- Após cada Epic: Revisar decisões tomadas
- Mensal: Auditar `docs/integration-checklists/`
- Identificar padrões de erro
- Atualizar protocolo conforme necessário

---

## 📁 ONDE SALVAR DECISÕES

```
docs/integration-checklists/
├── README.md (índice de todas as decisões)
├── DEC-2026-04-22-001.md (decisão 1)
├── DEC-2026-04-22-002.md (decisão 2)
└── ...
```

**Formato do nome:** `DEC-YYYY-MM-DD-NNN.md`
- YYYY-MM-DD: Data da decisão
- NNN: Número sequencial do dia (001, 002, etc)

**README.md deve listar:**
| ID | Data | Contexto | Ação | Status |
|----|------|----------|------|--------|
| DEC-2026-04-22-001 | 2026-04-22 | Revisão Story 4.1 | Modificar story | ✅ Executado |

---

**Última atualização:** April 27, 2026  
**Responsável:** @aiox-master  
**Auditável por:** Product Owner (humano)

---

*Este protocolo é meu FREIO. Sem ele, eu causo retrabalho.*
