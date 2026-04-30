# Integration Checklists — Decision Registry

**Propósito:** Índice de todas as decisões técnicas/arquiteturais tomadas no projeto, seguindo o protocolo pre-flight do @aiox-master.

---

## Decisões Registradas

| ID | Data | Contexto | Ação | Status |
|----|------|----------|------|--------|
| DEC-2026-04-30-004 | 2026-04-30 | Expansão Marketing Intelligence Layer | Deploy Phase 2.1 (migrations 034-035) | ✅ EXECUTED |
| DEC-2026-04-30-003 | 2026-04-30 | Deployment Marketing Intelligence MVP | Deploy Phase 2.0 (migrations 031-033) | ✅ EXECUTED |
| DEC-2026-04-30-002 | 2026-04-30 | Validação campos Marketing Intelligence | Phase 2 Híbrida (Opção C) | ✅ EXECUTED |
| DEC-2026-04-30-001 | 2026-04-30 | Documentação Phase 1 | Marcar Phase 1 como concluída | ✅ Executado |
| DEC-2026-04-29-003 | 2026-04-29 | Migrations perdidas 017-030 | Reconstituir via schema remoto | ✅ Executado |
| DEC-2026-04-29-002 | 2026-04-29 | Sistema de navegação | Criar documentos bússola | ✅ Executado |
| DEC-2026-04-29-001 | 2026-04-29 | Squad Marketing | Definir 5 agentes especializados | ✅ Executado |

---

## Como Usar

1. **Antes de qualquer decisão técnica:** Execute protocolo pre-flight (5 fases) conforme `docs/AIOX-MASTER-PROTOCOL.md`
2. **Após decisão aprovada:** Crie arquivo `DEC-YYYY-MM-DD-NNN.md` neste diretório
3. **Atualize este README:** Adicione linha na tabela acima
4. **Referencie em commits:** Use ID da decisão em mensagens de commit

---

## Template de Decisão

Ver: `docs/AIOX-MASTER-PROTOCOL.md` — Seção "TEMPLATE DE DECISÃO"

Estrutura obrigatória:
- FASE 1: CONTEXTO
- FASE 2: INVENTÁRIO
- FASE 3: FLUXOS CRÍTICOS
- FASE 4: INTEGRATION
- FASE 5: DECISÃO
- Validação de Gates (5 gates)
- Next Steps
- Impacto Esperado (quantitativo se possível)

---

**Última atualização:** 2026-04-30
