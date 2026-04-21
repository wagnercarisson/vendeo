# Weekly Plan × Motor Visual v2.0 — Sumário de Decisão

**Data:** 2026-04-18 | **Status:** ✅ Aprovado, ⏸️ Implementação Adiada

---

## 🎯 Decisão em 1 Frase

Weekly Plan terá integração completa com Motor Visual v2.0 (4 variações de plano, modo auto-preferida, herança theme/brief), mas implementação foi **adiada** até Motor v2.0 estar 100% estável — evitando refatoração dupla.

---

## ✅ O Que Foi Aprovado

| Item | Decisão |
|------|---------|
| **Variações de plano** | ✅ 4 planos completos gerados em 1 chamada IA |
| **Regeneração** | ❌ Removida (4 variações são suficientes) |
| **Modo de geração** | ✅ Auto-preferida (1 variação) + fallback (se rejeitar) |
| **Herança** | ✅ theme + brief → enriquecem Motor Visual |
| **Content type** | ✅ Definido no plano (post/reels/both) |

---

## 🚦 Sequência de Desenvolvimento

```
1. CAMPANHAS (Motor Visual v2.0) — Stories 4.1-4.8     [AGORA]
2. PRICING (Monetização)                               [DEPOIS]
3. WEEKLY PLAN (Integração) — Story 4.9 BACKLOG       [FUTURO]
4. INFORMATIVO (Terceiro tipo)                         [DISTANTE]
```

---

## ⚠️ Por Que Adiado?

> "Campanhas = fundação. Qualquer mudança no Motor v2.0 implicará em ajustes no Weekly Plan. Implementar agora = risco de refatoração dupla."

**Implementar DEPOIS de:**
- Motor Visual v2.0 100% estável
- 2 semanas validação produção (dados reais)
- Pricing implementado (feature paga)

---

## 📄 Documento Completo

[docs/analysis/WEEKLY-PLAN-MOTOR-VISUAL-INTEGRACAO.md](./WEEKLY-PLAN-MOTOR-VISUAL-INTEGRACAO.md)

**NÃO IMPLEMENTE STORY 4.9 SEM CONSULTAR DOCUMENTO COMPLETO.**

---

**Aprovado por:** Wagner (Proprietário do Produto)  
**Análise:** @pm (Morgan), @architect (Aria), @aiox-master (Orion)
