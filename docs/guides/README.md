# Guides — Vendeo

Documentação prática para processos de desenvolvimento e release.

---

## 📚 Guias Disponíveis

### [Release Workflow](release-workflow.md)
**Processo completo de release** desde documentação de impacto público até deploy.

- Como documentar mudanças em stories
- Workflow de release (preparação → changelog → git → deploy)
- Checklist de release
- Exemplos de descrições públicas

**Use quando:** Preparar nova release ou atualizar changelog público.

---

### [Public Impact Examples](public-impact-examples.md)
**Exemplos práticos** de como documentar impacto público em stories.

- 5 exemplos reais (feat, fix, style, perf, refactor)
- Dicas para descrições de qualidade
- Template mental para escrever descrições
- Como lidar com mudanças técnicas sem impacto público

**Use quando:** Criar/revisar story e decidir se tem impacto público.

---

### [TODO: Changelog Automation](TODO-changelog-automation.md)
**Especificação futura** para automatizar coleta de changelog.

- Escopo do script `changelog-collect.js`
- Output esperado (JSON + preview)
- Critérios de aceitação
- Prioridade: Baixa-Média (processo manual funciona)

**Use quando:** Planejar próximo bloco de desenvolvimento ou quando releases ficarem muito frequentes.

---

## 🔗 Documentos Relacionados

- [Git Standards](../architecture/git-standards.md) - Padrões de commit
- [ROADMAP](../../ROADMAP.md) - Planejamento de features
- `lib/data/changelog.ts` - Changelog público (código)
- `/changelog` - Página pública de changelog

---

**Última atualização:** 2026-04-21
