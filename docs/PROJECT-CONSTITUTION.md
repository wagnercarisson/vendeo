# Vendeo — Project Constitution

**Data:** 2026-04-22  
**Propósito:** Regras inegociáveis do projeto Vendeo  
**Autoridade:** Extensão da AIOX Constitution para regras específicas do projeto

---

## Artigo I — Bússola First (NON-NEGOTIABLE)

### Princípio

Nenhum código pode ser implementado sem consultar a documentação bússola do projeto.

### Documentos Bússola (Mandatórios)

1. **CAPABILITIES-INVENTORY.md** — Inventário completo de capacidades técnicas
2. **INTEGRATION-CHECKLIST.md** — Checklist mandatório antes de implementar
3. **CRITICAL-FLOWS.md** — Fluxos que NÃO PODEM REGREDIR
4. **REGRESSION-TESTS.md** — Testes obrigatórios antes de commit

### Regras Mandatórias

**ANTES de criar story:**
- [ ] Consultar CAPABILITIES-INVENTORY.md completo
- [ ] Verificar se funcionalidade já existe
- [ ] Se existe: definir migration plan

**ANTES de implementar:**
- [ ] Preencher INTEGRATION-CHECKLIST.md completo
- [ ] Consultar CRITICAL-FLOWS.md para fluxos afetados
- [ ] Definir testes de regressão necessários

**ANTES de commit:**
- [ ] Executar REGRESSION-TESTS.md (RT-1 mínimo)
- [ ] Atualizar CAPABILITIES-INVENTORY.md se necessário
- [ ] Salvar checklist preenchido

### Gates Automáticos

| Violação | Severidade | Ação |
|----------|-----------|------|
| Story criada sem consultar CAPABILITIES-INVENTORY | 🔴 BLOCKER | REJEITAR story, reescrever |
| Implementação sem INTEGRATION-CHECKLIST completo | 🔴 BLOCKER | REVERTER código, preencher checklist |
| Commit sem testes de regressão | 🔴 BLOCKER | REJEITAR commit |
| Modificação de fluxo crítico sem testes E2E | 🔴 BLOCKER | REJEITAR mudança |

### Severidade

**NON-NEGOTIABLE** — Violar este artigo bloqueia TODO o trabalho.

---

## Artigo II — Visual Reader é Sagrado (CRITICAL)

### Contexto

O Visual Reader atual (`lib/visual-reader/`) possui capacidades CRÍTICAS para validação de produto vs imagem:
- Validação de consistência (matchType: exact | category_only | none)
- Detecção de inconsistências (Ex: usuário digitou "Coca Cola" mas imagem é "Pepsi")
- 18 campos de análise visual
- Usado (ou deveria ser usado) em geração de campanhas

**Problema identificado:** Epic 4.1 propôs substituir Visual Reader por versão simplificada (8 campos) SEM migration plan, perdendo capacidades críticas.

### Regras Inegociáveis

**NENHUMA modificação em Visual Reader sem:**
1. Migration plan completo (ver INTEGRATION-CHECKLIST.md Caso 1)
2. Manutenção de TODAS as 18 capacidades atuais
3. Testes de regressão completos (RT-2, RT-3)
4. Aprovação de @po E @qa

**NENHUMA substituição de Visual Reader sem:**
1. Justificativa documentada
2. Análise de impacto em CRITICAL-FLOWS.md (F1, F2, F4)
3. Rollback plan definido
4. Aprovação EXPLÍCITA do product owner (humano)

### Capacidades Inegociáveis

| Capacidade | Obrigatória | Motivo |
|------------|-------------|--------|
| productName input | ✅ SIM | Validação de consistência |
| matchType output | ✅ SIM | Detectar inconsistências |
| matchedTarget output | ✅ SIM | Informar o que foi detectado |
| detected boolean | ✅ SIM | Saber se produto foi encontrado |
| targetBox (bounding box) | ✅ SIM | Crop inteligente |
| confidence score | ✅ SIM | Validar qualidade da detecção |

**Estas 6 capacidades NÃO PODEM ser removidas sob nenhuma circunstância.**

### Severidade

**CRITICAL** — Violar este artigo compromete funcionalidade core do produto (detecção de inconsistências).

---

## Artigo III — @aiox-master Protocol (MANDATÓRIO)

### Princípio

@aiox-master é o agente orquestrador e responsável por decisões técnicas. Decisões erradas dele causam retrabalho em cascata.

**Problema identificado:** @aiox-master aprovou Epic 4.1 sem consultar documentação bússola, resultando em stories que propunham perda de capacidades críticas.

### Protocolo Obrigatório

@aiox-master DEVE seguir `docs/AIOX-MASTER-PROTOCOL.md` ANTES de:
- Criar ou aprovar roadmap
- Criar ou aprovar epic
- Criar ou aprovar story
- Delegar trabalho para qualquer agente
- Sugerir implementação técnica

### Checklist Mandatório (Pre-Flight)

**FASE 1: CONTEXTO**
- [ ] Li user request completo
- [ ] Identifiquei objetivo real
- [ ] Identifiquei riscos de regressão

**FASE 2: INVENTÁRIO**
- [ ] Li CAPABILITIES-INVENTORY.md completo
- [ ] Verifiquei se funcionalidade já existe
- [ ] Se substituir: criei migration plan

**FASE 3: FLUXOS CRÍTICOS**
- [ ] Li CRITICAL-FLOWS.md (seções relevantes)
- [ ] Identifiquei fluxos afetados
- [ ] Verifiquei o que NÃO PODE REGREDIR

**FASE 4: INTEGRATION**
- [ ] Li INTEGRATION-CHECKLIST.md (seções relevantes)
- [ ] Identifiquei dependencies
- [ ] Identifiquei entry points

**FASE 5: DECISÃO**
- [ ] Documentei decisão em YAML
- [ ] Salvei em `docs/integration-checklists/DEC-{timestamp}.md`
- [ ] Validei gates automáticos

### Documentação de Decisões

TODAS as decisões técnicas devem ser documentadas em:
```
docs/integration-checklists/
├── README.md (índice)
├── DEC-2026-04-22-001.md (decisão 1)
├── DEC-2026-04-22-002.md (decisão 2)
└── ...
```

**Formato:** Ver `docs/AIOX-MASTER-PROTOCOL.md` — Template de Decisão

### Gates Automáticos

| Condição | Ação |
|----------|------|
| `capabilities_check.consulted == false` | ❌ BLOCK — Consultar CAPABILITIES-INVENTORY.md primeiro |
| `will_replace == true` AND `migration_plan == null` | ❌ BLOCK — Criar migration plan primeiro |
| `affected_flows.length > 0` AND `regression_tests == []` | ❌ BLOCK — Definir testes de regressão |
| `pre_flight_complete == false` | ❌ BLOCK — Completar protocolo |

### Transparência e Auditoria

Todas as decisões são auditáveis:
- Product owner (humano) pode revisar `docs/integration-checklists/`
- Decisões erradas podem ser identificadas e corrigidas
- Histórico de decisões preservado

### Severidade

**MANDATÓRIO** — @aiox-master não pode tomar decisões sem seguir protocolo.

---

## Artigo IV — Fluxos Críticos são Intocáveis (CRITICAL)

### Princípio

Os 8 fluxos documentados em `docs/CRITICAL-FLOWS.md` são a espinha dorsal do produto. Regredir qualquer fluxo crítico compromete funcionalidade essencial.

### Fluxos Críticos

| ID | Fluxo | Severidade |
|----|-------|------------|
| F1 | Criação de Campanha Manual | 🔴 CRÍTICO |
| F2 | Geração de Conteúdo (Copy) | 🔴 CRÍTICO |
| F3 | Preview e Aprovação de Arte | 🔴 CRÍTICO |
| F4 | Validação Produto vs Imagem | 🔴 CRÍTICO (não implementado) |
| F5 | Regeneração de Campanha | 🟡 ALTO |
| F6 | Criação de Weekly Plan | 🟡 ALTO |
| F7 | Orquestração de Campanha via Plano | 🟡 ALTO |
| F8 | Visual Reader (Isolado) | 🟢 MÉDIO |

### Regras Mandatórias

**QUALQUER modificação em fluxo crítico requer:**
1. Testes de regressão COMPLETOS (manual E2E + automatizados)
2. Documentação de impacto em CRITICAL-FLOWS.md
3. Aprovação de @qa
4. Validação manual pelo product owner (humano)

**NENHUMA mudança em fluxo crítico pode:**
- Remover funcionalidade existente (sem migration plan)
- Quebrar comportamento esperado
- Reduzir qualidade de output
- Introduzir inconsistências

### Paridade Visual (F3)

**Regra especial para Preview e Aprovação:**
- Preview DEVE ser idêntico à arte final
- Mesmo código DEVE gerar ambos
- Usuário NÃO pode ter surpresas após aprovação

**Epic 4.4 (novo renderer) DEVE:**
- Manter paridade visual 100%
- Testar preview vs render final (comparação pixel-perfect)
- Documentar qualquer diferença (se houver motivo justificado)

### Severidade

**CRITICAL** — Regredir fluxo crítico = bug P0 (prioridade máxima).

---

## Artigo V — Code Quality Gates (MUST)

### Princípio

Todo código deve passar por quality gates antes de merge.

### Quality Gates Obrigatórios

**Automatizados:**
```bash
npm run lint      # Zero erros
npm run typecheck # Zero erros de tipo
npm run test      # 100% dos testes passando
```

**Manuais:**
- RT-1 (Criação de Campanha) — Sempre executar
- RT-2 (Validação de Produto) — Se modificou Visual Reader
- RT-3 (Visual Reader Sandbox) — Se modificou Visual Reader
- RT-4 (Regeneração) — Se modificou geração de conteúdo
- RT-5 (Weekly Plan) — Se modificou planos

### Coverage Targets

| Tipo | Target |
|------|--------|
| Unit tests | >= 80% |
| Integration tests | >= 60% |
| E2E tests (critical flows) | 100% |

### Severidade

**MUST** — Não passar em quality gates = não fazer merge.

---

## Artigo VI — Documentation is Code (MUST)

### Princípio

Documentação desatualizada é tão ruim quanto código quebrado.

### Documentação Mandatória

**Ao criar nova capacidade:**
- [ ] Adicionar entrada em CAPABILITIES-INVENTORY.md
- [ ] Se afeta fluxo existente: atualizar CRITICAL-FLOWS.md
- [ ] Se adiciona teste: atualizar REGRESSION-TESTS.md
- [ ] README do módulo criado/atualizado

**Ao modificar capacidade existente:**
- [ ] Atualizar CAPABILITIES-INVENTORY.md
- [ ] Se muda comportamento: atualizar CRITICAL-FLOWS.md
- [ ] Se muda contrato: atualizar README do módulo
- [ ] Documentar breaking changes

**Ao deprecar capacidade:**
- [ ] Marcar como DEPRECATED em CAPABILITIES-INVENTORY.md
- [ ] Adicionar migration guide
- [ ] Atualizar CRITICAL-FLOWS.md se necessário
- [ ] Manter documentação até remoção completa

### Severidade

**MUST** — Documentação é parte do trabalho, não opcional.

---

## Enforcement

### Responsabilidades

| Agente | Responsabilidade |
|--------|------------------|
| @aiox-master | Seguir Artigo III (protocolo), validar decisões |
| @sm | Seguir Artigo I antes de criar stories |
| @dev | Seguir Artigo I e V antes de implementar |
| @qa | Validar Artigo IV e V (fluxos críticos e quality gates) |
| @po | Aprovar mudanças em Artigo II (Visual Reader) |

### Auditoria

Product owner (humano) pode auditar:
- `docs/integration-checklists/` — Decisões de @aiox-master
- `docs/CAPABILITIES-INVENTORY.md` — Estado atual de capacidades
- `docs/CRITICAL-FLOWS.md` — Fluxos críticos e riscos
- Git history — Commits seguiram protocolo?

---

## Histórico de Revisões

| Data | Versão | Mudanças |
|------|--------|----------|
| 2026-04-22 | 1.0 | Criação inicial — Artigos I-VI |

---

**Última atualização:** 2026-04-22  
**Próxima revisão:** Após conclusão de Epic 4  
**Responsável:** @aiox-master + Product Owner (humano)

---

*Esta Constitution BLOQUEIA trabalho que não segue os princípios. Violar = retrabalho garantido.*
