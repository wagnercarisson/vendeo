# PM Decision — Story 2 Split Approval

**Agent:** @pm (Morgan)  
**Date:** 2026-04-30  
**Sprint:** Intelligence Calibration Sprint 1  
**Requested by:** @squad-creator (Craft) via GATE-2-VALIDATION.md

---

## ✅ DECISÃO: APROVAR SPLIT

**Story 2 (5 pts) → Story 2A (3 pts) + Story 2B (3 pts)**

---

## Análise por Dimensão

### Product Value — ✅ PRESERVADO

Story 2A entrega o núcleo funcional completo (ACs 1-10): 4 abas, 15 campos, auto-save,
progress bar, score e badges. O lojista calibra toda a inteligência do Vendeo na primeira entrega.
Story 2B é enhancement layer — mobile, retry, A11Y, performance. Valor não é fragmentado;
é estratificação de "core funcionando" vs "polimento de experiência".

### User Experience — ✅ ACEITÁVEL

Story 2A no desktop é experiência completa. A única degradação aceitável:
- AC14 (retry automático) fica em Story 2B
- Se auto-save falhar em 2A, usuário vê estado "Erro" via AC13 mas sem retry
- Workaround: trocar de aba novamente re-dispara o save
- Não é experiência quebrada — é experiência degradada temporária

### Timeline — ✅ JUSTIFICADO

| | Original | Com Split |
|---|---|---|
| Total pontos | 13 pts | 15 pts (+2) |
| Dias (paralelo) | ~12 dias | ~9.5 dias |
| Risco Story 2 | ALTO | BAIXO |

+2 pts de overhead compensados por -2.5 dias de timeline via isolamento de risco.
Net resultado: sprint mais curto, não mais longo.

### Risk — ✅ REDUZIDO

Split isola auto-save crítico de swipe gestures experimental. Se mobile quebrar,
não arrasta revisão do auto-save junto. Domínios de risco incompatíveis separados.

### Team Capacity — ⚠️ ATENÇÃO

Plano original assume execução paralela (2A + 2B simultâneas), mas referencia 1 dev.
**Com 1 dev, execução deve ser sequencial: 2A primeiro → 2B depois.**
Timeline de 9.5 dias assume algum paralelismo — @squad-creator deve revisar.

---

## Condições de Execução (OBRIGATÓRIAS)

Ao criar Story 2A e Story 2B, respeitar:

| # | Condição | Detalhe |
|---|----------|---------|
| 1 | **AC boundary** | ACs 1-10 → Story 2A \| ACs 11-20 → Story 2B |
| 2 | **Badges em 2A** | AC7 (badges 🥉🥈🥇) pertence a Story 2A — NÃO mover para 2B |
| 3 | **Dependência explícita** | Story 2B: "Blocked by: Story 2A COMPLETA" no header |
| 4 | **Timeline realista** | Se 1 dev: documentar como sequencial 2A → 2B, não paralelo |
| 5 | **Correção no GATE-2** | GATE-2-VALIDATION.md lista badges em Story 2B — incorreto, corrigir |

---

## Nota sobre GATE-2-VALIDATION.md

A seção Task 2.1 do GATE-2 descreve Story 2B como contendo "Badge system (🥉🥈🥇)".
Isso é **inconsistente com o AC mapping**: AC7 (badges) está nos ACs 1-10, que pertencem a 2A.

**Correto:**
- Story 2A: 4 tabs, 15 campos, auto-save, progress, score, **badges** (ACs 1-10)
- Story 2B: swipe, responsive, retry, A11Y, performance (ACs 11-20)

@squad-creator deve corrigir a descrição ao criar os arquivos das stories.

---

## Próximos Passos

1. **@squad-creator:** Criar `STORY-2A-frontend-core.md` (ACs 1-10)
2. **@squad-creator:** Criar `STORY-2B-mobile-ui.md` (ACs 11-20, blocked by 2A)
3. **@squad-creator:** Atualizar PHASE-COORDINATION.md com novo timeline
4. **@dev:** Iniciar Story 1 (Backend API) em paralelo com Story 3 (Logo IA)
5. **@dev:** Story 2A inicia após Story 1 completa

---

## Rastreabilidade

| Documento | Versão |
|-----------|--------|
| [STORY-2-frontend-intelligence-page.md](./STORY-2-frontend-intelligence-page.md) | Source para split |
| [GATE-2-VALIDATION.md](./GATE-2-VALIDATION.md) | Recomendação técnica |
| [PO-VALIDATION-REPORT.md](./PO-VALIDATION-REPORT.md) | Validação @po (9.5/10) |
| [PHASE-COORDINATION.md](./PHASE-COORDINATION.md) | Plano de execução atualizado |

---

*Decisão tomada por @pm (Morgan) com base em análise de produto, risco e capacidade do time.*
