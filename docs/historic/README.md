# Documentos Históricos — Vendeo

Artefatos de desenvolvimento preservados para memória institucional.

---

## 📂 Estrutura

### `epic-2-prompts/`
**Prompts estruturados do Epic 2** (Arquitetura de Campanhas)

Contém prompts gerados por @prompt-eng para @sm e @dev durante execução das Stories 2.1-2.6:
- Analysis prompts (descoberta de requisitos)
- Implementation prompts (execução técnica)
- Testing strategies (estratégias de testes)
- Package summaries (resumos de pacotes)

**Por que preservar:**
- Referência de qualidade para futuros prompts
- Memória do processo story-driven
- Análise de efetividade do @prompt-eng agent

**Período:** 20-21 Abril 2026  
**Stories:** 2.1 (Schemas) → 2.6 (Integration API Routes)

---

### `backlog/`
**Especificações e TODOs de baixa prioridade**

Tasks documentadas mas não priorizadas para desenvolvimento imediato:
- Automações futuras
- Melhorias de processo
- Experimentos arquiteturais

**Critério de entrada:** Task especificada mas sem timeline definida.

**Exemplos:**
- `TODO-changelog-automation.md` - Script para automatizar coleta de changelog (baixa urgência - processo manual funciona)

---

## 🔍 Como Usar

**Para consultar prompts históricos:**
```bash
# Ver todos os prompts de uma story
ls docs/historic/epic-2-prompts/*story-2.3*

# Buscar análises de @sm
grep -r "analysis" docs/historic/epic-2-prompts/sm-*

# Buscar estratégias de teste
ls docs/historic/epic-2-prompts/*testing-strategy*
```

**Para reativar item do backlog:**
- Mover de `backlog/` para localização ativa relevante
- Atualizar priority e timeline
- Criar story ou adicionar em epic

---

## 📊 Estatísticas

| Categoria | Itens | Período |
|-----------|-------|---------|
| Epic 2 Prompts | 41 arquivos | 20-21 Abr 2026 |
| Backlog Tasks | 1 especificação | 21 Abr 2026 |

---

*Última atualização: 21 Abril 2026 — @aiox-master (Orion)*
