# Documentation Governance — Vendeo

**Data:** 06 Mai 2026  
**Propósito:** Hierarquia formal de documentação e fluxo de consulta

---

## 🎯 Hierarquia de Documentação

```
PROTOCOLO (diretrizes - raramente muda)
  ↓
ROADMAP (fonte da verdade - SEMPRE atualizado = bússola)
  ├─→ PROJECT-CONTEXT (detalhes técnicos do projeto)
  ├─→ DEC-*.md (decisões formais com rationale)
  └─→ SESSION-HISTORY (resumo incremental de sessões)
        └─→ docs/closures/closure-*.md (detalhes técnicos da sessão)
```

---

## 📊 Pesos de Consulta

| Documento | Quando Consultar | Atualizar Sempre? | Tempo Leitura |
|-----------|------------------|-------------------|---------------|
| **AIOX-MASTER-PROTOCOL.md** | Início sessão (diretrizes) | Raramente | 30s |
| **ROADMAP.md** 🔴 | Início sessão (OBRIGATÓRIO) | Sempre | 1-2min |
| **SESSION-HISTORY.md** | Início sessão (última entrada) | Sempre | 30s |
| **PROJECT-CONTEXT.md** | Quando precisar detalhes técnicos | Sempre | 3-5min |
| **DEC-*.md** | Quando decisão for mencionada | Nunca (imutável) | 5-10min |
| **closures/closure-*.md** | Troubleshooting / onboarding | Sempre | 10-15min |

---

## 🔄 Fluxo de Início de Sessão

```
1. Ler PROTOCOLO (30s)
   └─ "Como trabalhar? Quais as diretrizes?"

2. Ler ROADMAP (1-2min) 🔴 OBRIGATÓRIO
   ├─ Status Dashboard → Onde estamos?
   ├─ Tasks em execução → O que está sendo feito?
   ├─ Blocker crítico → Tem algo travando?
   └─ Próximo passo → O que vem depois?

3. Ler SESSION-HISTORY última entrada (30s)
   └─ O que fizemos na sessão anterior?

4. Retornar ao usuário (verbal, 30s):
   "📍 Fase: [X]
    🔙 Sessão anterior: [conquistas resumidas]
    ⏸️ Blocker: [Z ou Nenhum]
    ➡️ Próximo: [W com contexto]
    
    Confirma que seguimos?"

5. Usuário confirma → Seguir

6. SE precisar de detalhes técnicos:
   ├─ Ler PROJECT-CONTEXT (contexto do projeto)
   ├─ Ler DEC-*.md (decisão específica)
   └─ Ler closure-*.md (detalhes de sessão anterior)
```

**Tempo total:** 2-3 minutos (vs 30+ minutos do protocolo antigo)

---

## 📝 Fluxo de Fechamento de Sessão

```
1. Atualizar ROADMAP (se status/decisão mudou)
2. Atualizar PROJECT-CONTEXT (sempre)
3. Atualizar SESSION-HISTORY (resumo, máximo 4 linhas)
4. Criar docs/closures/closure-YYYY-MM-DD.md (detalhes completos)
5. Commits estruturados
```

---

## 🔗 Linkagem Formal Obrigatória

**TODO documento DEVE ter seção de links no topo:**

```markdown
> **Links relacionados:**  
> **[Nome do doc]:** [path/to/doc.md]  
> **[Nome do doc]:** [path/to/doc.md]
```

### PROTOCOLO.md
```markdown
> **Links relacionados:**  
> **Roadmap:** [ROADMAP.md](../ROADMAP.md)  
> **Session History:** [SESSION-HISTORY.md](SESSION-HISTORY.md)  
> **Project Context:** [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md)
```

### ROADMAP.md
```markdown
> **Links relacionados:**  
> **Detalhes técnicos:** [PROJECT-CONTEXT.md](docs/PROJECT-CONTEXT.md)  
> **Histórico de sessões:** [SESSION-HISTORY.md](docs/SESSION-HISTORY.md)
```

### SESSION-HISTORY.md
```markdown
> **Links relacionados:**  
> **Protocolo:** [AIOX-MASTER-PROTOCOL.md](AIOX-MASTER-PROTOCOL.md)  
> **Roadmap:** [ROADMAP.md](../ROADMAP.md)  
> **Contexto do projeto:** [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md)
```

### PROJECT-CONTEXT.md
```markdown
> **Links relacionados:**  
> **Roadmap completo:** [ROADMAP.md](../ROADMAP.md)  
> **Histórico de sessões:** [SESSION-HISTORY.md](SESSION-HISTORY.md)  
> **Última decisão:** [DEC-*.md](integration-checklists/DEC-*.md)
```

### DEC-*.md
```markdown
> **Links relacionados:**  
> **Roadmap:** [ROADMAP.md](../../ROADMAP.md)  
> **Contexto do projeto:** [PROJECT-CONTEXT.md](../PROJECT-CONTEXT.md)  
> **Sessão que criou:** [closure-*.md](../closures/closure-*.md)
```

### closure-*.md
```markdown
> **Links relacionados:**  
> **Protocolo:** [AIOX-MASTER-PROTOCOL.md](../AIOX-MASTER-PROTOCOL.md)  
> **Roadmap:** [ROADMAP.md](../../ROADMAP.md)  
> **Contexto do projeto:** [PROJECT-CONTEXT.md](../PROJECT-CONTEXT.md)  
> **Resumo navegável:** [SESSION-HISTORY.md](../SESSION-HISTORY.md)  
> **Decisões tomadas:** [DEC-*.md](../integration-checklists/DEC-*.md)
```

---

## 🎯 Fluxo de Atualização (quando muda algo)

**Cenário: Decisão estratégica aprovada**

```
1. Criar DEC-*.md (decisão formal)
   ├─ Rationale completo
   ├─ Research que fundamenta
   └─ Alternativas rejeitadas

2. Atualizar ROADMAP.md
   ├─ Adicionar na timeline de decisões
   ├─ Criar/atualizar tasks
   └─ Linkar DEC-*.md

3. Atualizar PROJECT-CONTEXT.md
   ├─ Status atual
   ├─ Blockers ativos
   └─ Próximos passos

4. Atualizar SESSION-HISTORY.md
   ├─ Resumo da sessão (4 linhas máximo)
   └─ Link para closure

5. Criar docs/closures/closure-*.md
   ├─ Detalhes técnicos completos (7 fases)
   ├─ Validações executadas
   ├─ Decisões tomadas
   └─ Contexto de continuidade
```

**Todos os 5 documentos linkam uns aos outros.**

---

## ✅ Checklist de Governança

**Ao criar/modificar documento:**
- [ ] Seção de links no topo completa?
- [ ] Links bidirecionais (A→B e B→A)?
- [ ] Paths relativos corretos?
- [ ] Documentos linkados existem?
- [ ] Formato markdown válido?

**Ao fazer decisão estratégica:**
- [ ] DEC-*.md criado e completo?
- [ ] ROADMAP.md atualizado?
- [ ] PROJECT-CONTEXT.md atualizado?
- [ ] SESSION-HISTORY.md atualizado?
- [ ] closure-*.md criado?

**Ao encerrar sessão:**
- [ ] Todos os 5 documentos atualizados?
- [ ] Links bidirecionais validados?
- [ ] Working tree limpo?
- [ ] Commits estruturados?

---

## 🚨 Violações Comuns

❌ **Documento sem links no topo**  
❌ **Link unidirecional** (A→B mas B não aponta para A)  
❌ **Path absoluto** (usar relativo sempre)  
❌ **Link quebrado** (documento não existe)  
❌ **Decisão não documentada** (sem DEC-*.md)  
❌ **Session-history desatualizado** (última sessão não registrada)  
❌ **Closure faltando** (session-history aponta para arquivo inexistente)

---

*Última atualização: 06 Mai 2026 por @aiox-master*
