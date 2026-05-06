# @aiox-master Protocol — Session Workflow

> **Links relacionados:**  
> **Roadmap:** [ROADMAP.md](../ROADMAP.md)  
> **Session History:** [SESSION-HISTORY.md](SESSION-HISTORY.md)  
> **Project Context:** [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md)  
> **Governança:** [doc-governance.md](doc-governance.md)

**Data:** 06 Mai 2026  
**Propósito:** Fluxo simplificado para início e fechamento de sessões  
**Status:** 🔴 OBRIGATÓRIO — Sempre seguir este fluxo

---

## 🎯 QUANDO USAR

Execute este protocolo:
- ✅ No **início** de cada sessão com @aiox-master
- ✅ Ao **encerrar** cada sessão
- ✅ Antes de **decisões estratégicas** (criar epic, aprovar arquitetura, etc)

---

## 📋 FASE 0: BOOTSTRAP (2-3 min) — INÍCIO DE SESSÃO

**Objetivo:** Carregar contexto completo do projeto antes de agir.

### Checklist Obrigatório
1. [ ] Ler [ROADMAP.md](../ROADMAP.md) (1-2 min)
   - Status Dashboard → Onde estamos?
   - Tasks em execução → O que está sendo feito?
   - Blocker crítico → Tem algo travando?
   - Próximo passo → O que vem depois?

2. [ ] Ler [SESSION-HISTORY.md](SESSION-HISTORY.md) última entrada (30s)
   - O que fizemos na sessão anterior?
   - Quais artefatos foram gerados?

3. [ ] Se precisar detalhes técnicos:
   - Ler [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md) (3-5 min)
   - Ler decisões específicas (DEC-*.md)
   - Ler closure anterior (docs/closures/closure-*.md)

### Retorno ao Usuário

Confirmar verbalmente:
```
✅ **Protocolo Lido e Compreendido**

📍 **Fase Atual:** [Nome da fase do projeto]

🔙 **Sessão Anterior:** [Conquistas resumidas em 1 linha]

⏸️ **Blocker:** [Nome do blocker ou "Nenhum"]

➡️ **Próximo Passo:** [Ação específica com contexto]
   - Detalhamento: [O que envolve]
   - Responsável: [Qual agente]
   - Bloqueando: [O que está bloqueado por isso]

**Confirma que seguimos?**
```

**Tempo total:** 2-3 minutos

---

## 🤔 DECISÃO ESTRATÉGICA (15-30 min) — QUANDO NECESSÁRIO

**Quando usar:** Criar epic, aprovar arquitetura, substituir código existente, mudança breaking

### Checklist de Decisão

1. [ ] Li [CAPABILITIES-INVENTORY.md](CAPABILITIES-INVENTORY.md)
   - Funcionalidade já existe? → Reutilizar
   - Vai substituir algo? → Migration plan obrigatório

2. [ ] Li [CRITICAL-FLOWS.md](CRITICAL-FLOWS.md) (seções relevantes)
   - Quais fluxos são afetados?
   - O que NÃO pode regredir?
   - Testes de regressão definidos?

3. [ ] Li [INTEGRATION-CHECKLIST.md](INTEGRATION-CHECKLIST.md) (seções relevantes)
   - Dependências identificadas?
   - Entry points mapeados?
   - Breaking changes detectados?

4. [ ] Documentei decisão
   - Criar `docs/integration-checklists/DEC-YYYY-MM-DD-NNN.md`
   - Incluir rationale completo (POR QUÊ desta decisão)
   - Listar alternativas rejeitadas
   - Referenciar research/validações

### Gates Automáticos

❌ **BLOQUEAR se:**
- Substituir código SEM migration plan
- Afetar fluxo crítico SEM testes de regressão
- Não consultou CAPABILITIES-INVENTORY
- Decisão estratégica SEM documentação (DEC-*.md)

✅ **PROSSEGUIR se:**
- Todos os checklists completos
- Gates validados
- Decisão documentada

**Detalhes completos:** Ver [AIOX-MASTER-PROTOCOL-old.md](../docs-old/AIOX-MASTER-PROTOCOL-old.md) Fases 1-5

---

## 🎬 FASE FINAL: CLOSURE (5-10 min) — FECHAMENTO DE SESSÃO

**Objetivo:** Preservar contexto completo para próxima sessão.

### Checklist Obrigatório

1. [ ] Atualizar [ROADMAP.md](../ROADMAP.md) (se status/decisão mudou)
   - Status Dashboard
   - Tasks (checkboxes)
   - Timeline de decisões

2. [ ] Atualizar [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md)
   - Status atual
   - Blockers ativos
   - Próximos passos (máximo 3 ações)

3. [ ] Atualizar [SESSION-HISTORY.md](SESSION-HISTORY.md)
   - Adicionar nova entrada no topo
   - Resumo: máximo 4 linhas por conquista
   - Link para closure

4. [ ] Criar `docs/closures/closure-YYYY-MM-DD.md`
   - Detalhes técnicos completos (7 fases)
   - Validações executadas
   - Decisões tomadas
   - Contexto de continuidade

5. [ ] Gerar comandos de commit estruturados
   - Seguir `docs/architecture/git-standards.md`
   - Commits atômicos (1 funcionalidade = 1 commit)
   - Separar docs de código
   - Entregar comandos ao usuário (não executar)

### Template de Retorno

```
## ✅ SESSION CLOSURE COMPLETO

### Trabalho Realizado
- [Item 1]
- [Item 2]
- [Item 3]

### Validações
- Build: ✅ PASS / 🟡 PENDENTE / ❌ FAIL
- TypeScript: ✅ PASS / ❌ FAIL (N errors)
- Tests: ✅ PASS (N/N)

### Próximos Passos (Próxima Sessão)
1. [Passo 1 crítico]
2. [Passo 2]
3. [Passo 3]

### Comandos de Commit
[Comandos estruturados para o usuário executar]

---

**Sessão encerrada.** Documentação completa e contexto preservado para retomada.
```

**Tempo total:** 5-10 minutos

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Target |
|---------|--------|
| Tempo de bootstrap | <= 3 min |
| Decisões sem retrabalho | >= 95% |
| Documentação atualizada | 100% |
| Links bidirecionais válidos | 100% |
| Working tree limpo ao encerrar | 100% |

---

## 🔄 CONTINUOUS IMPROVEMENT

### Quando Falhar

1. Identificar qual fase foi mal executada
2. Atualizar checklist com item faltante
3. Adicionar exemplo ao [doc-governance.md](doc-governance.md)
4. Revisar métricas mensalmente

### Revisão Periódica

- **Semanal:** Validar que documentação está atualizada
- **Mensal:** Auditar decisões (DEC-*.md) e closure (closure-*.md)
- **Trimestral:** Revisar protocolo e simplificar se necessário

---

## 📁 ESTRUTURA DE DOCUMENTAÇÃO

```
docs/
├── AIOX-MASTER-PROTOCOL.md        (este arquivo - workflow simplificado)
├── PROJECT-CONTEXT.md              (detalhes técnicos do projeto)
├── SESSION-HISTORY.md              (índice de sessões)
├── doc-governance.md               (hierarquia e linkagem formal)
├── CAPABILITIES-INVENTORY.md       (funcionalidades existentes)
├── CRITICAL-FLOWS.md               (fluxos que não podem regredir)
├── INTEGRATION-CHECKLIST.md        (dependências e entry points)
├── integration-checklists/
│   ├── DEC-2026-05-06-002.md      (decisão formal)
│   └── ...
└── closures/
    ├── closure-2026-05-06.md      (detalhes técnicos da sessão)
    └── ...

ROADMAP.md                          (raiz - mapa visual do projeto)
```

---

## ⚠️ IMPORTANTE

**Este protocolo é ENXUTO propositalmente** (150 linhas vs 1200+ linhas do antigo).

**Regra de ouro:** Se você não consegue ler e seguir o protocolo completo em 3 minutos no início de cada sessão, ele está grande demais.

**Protocolo antigo:** Arquivado em [docs-old/AIOX-MASTER-PROTOCOL-old.md](../docs-old/AIOX-MASTER-PROTOCOL-old.md) para referência histórica.

---

*Última atualização: 06 Mai 2026 por @aiox-master*  
*Versão: 2.0 (simplificada)*
