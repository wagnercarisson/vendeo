# Testing Strategy: Prompt @sm Story 2.2

**Prompt File:** `docs/stories/prompts/sm-story-2.2.prompt.md`  
**Target Agent:** @sm (River)  
**Story:** 2.2 — Tipos de Domínio Centralizados

---

## 🎯 Success Metrics

### Primary KPIs
| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Grep execution** | 100% before drafting | Verificar se @sm executou grep_search antes de escrever User Story |
| **Cross-Story Decisions** | ≥3 entries | Tabela preenchida com decisões rastreáveis |
| **Acceptance Criteria** | ≥3 Gherkin scenarios | Formato `GIVEN/WHEN/THEN` com validações testáveis |
| **File List completeness** | 100% discovered | Todos os arquivos com tipos Campaign/ContentType listados |
| **Zero hallucination** | 0 invented files | Nenhum arquivo ou tipo citado sem grep/read_file |

### Secondary KPIs
| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Token efficiency** | <1.5K prompt | Verificar token count do prompt (deve ser ~800-1K) |
| **Compliance with template** | 100% | Story usa exatamente o OUTPUT_FORMAT fornecido |
| **Risks identified** | ≥3 | Tabela Risks & Mitigations preenchida com mitigações concretas |

---

## 🧪 Validation Tests

### Test 1: Grep Search Enforcement
**Objetivo:** Confirmar que @sm executou grep antes de draftar

**Procedure:**
1. Enviar prompt para @sm
2. Observar histórico de tool calls
3. Verificar se `grep_search` foi executado ANTES de qualquer escrita em `.story.md`

**Expected Result:**
- `grep_search` aparece nos primeiros 3 tool calls
- Queries incluem: `Campaign`, `ContentType`, `Objective`, `Strategy`
- Files descobertos são listados no File List da story

**Pass Criteria:** Grep executado antes de qualquer escrita no story file

---

### Test 2: Cross-Story Decisions Traceability
**Objetivo:** Validar rastreabilidade de decisões críticas

**Procedure:**
1. Ler seção "Cross-Story Decisions" da story gerada
2. Verificar se inclui:
   - ContentType fechado (product/service/message)
   - Inferência de Zod schemas
   - Deprecation strategy

**Expected Result:**
```markdown
| Decision | Source | Impact on This Story |
|----------|--------|----------------------|
| ContentType canônico fechado: "product" \| "service" \| "message" | EXEC-PLAN-EPIC-2.md (2026-04-20) | Enum ContentType DEVE usar esses 3 valores |
| Todos os tipos de domínio inferidos de Zod schemas | Story 2.1 entregou CampaignDomainSchema | Campaign = z.infer<typeof CampaignDomainSchema> |
```

**Pass Criteria:** ≥3 decisões com source e impacto explícitos

---

### Test 3: Acceptance Criteria Testability
**Objetivo:** Garantir que AC são executáveis e verificáveis

**Procedure:**
1. Ler seção "Acceptance Criteria"
2. Verificar formato Gherkin (GIVEN/WHEN/THEN)
3. Confirmar que cada critério é testável via typecheck ou grep

**Expected Result:**
```gherkin
GIVEN schemas.ts com CampaignDomainSchema definido (Story 2.1)
WHEN types.ts for criado com tipos inferidos via z.infer
THEN Campaign é inferido de CampaignDomainSchema
AND ContentType é enum fechado com valores ["product", "service", "message"]
AND nenhum tipo é escrito manualmente
```

**Pass Criteria:** ≥3 cenários, todos no formato Gherkin, todos testáveis

---

### Test 4: Zero Hallucination Validation
**Objetivo:** Confirmar que nenhum arquivo ou tipo foi inventado

**Procedure:**
1. Extrair lista de arquivos do File List
2. Executar `Test-Path` para cada arquivo citado
3. Executar grep para cada tipo citado (Campaign, ContentType, etc.)

**Expected Result:**
- 100% dos arquivos listados existem no workspace
- 100% dos tipos citados aparecem em grep results

**Pass Criteria:** Nenhum arquivo ou tipo citado sem evidência no codebase

---

### Test 5: Template Compliance
**Objetivo:** Verificar adesão ao OUTPUT_FORMAT

**Procedure:**
1. Comparar structure da story gerada com template fornecido
2. Verificar presença de seções obrigatórias:
   - Cross-Story Decisions
   - User Story
   - Objective
   - Scope IN/OUT
   - Acceptance Criteria (Gherkin)
   - Dependencies
   - Risks & Mitigations
   - Definition of Done
   - Dev Notes
   - File List
   - CodeRabbit Integration

**Expected Result:** Story contém todas as 12 seções do template

**Pass Criteria:** 100% das seções presentes e preenchidas

---

## 🔍 Failure Modes & Diagnostics

### Failure Mode 1: @sm skips grep search
**Symptom:** Story file criado sem tool calls de grep_search

**Root Cause:** `<think>` directive não foi seguida

**Fix:** Reforçar que Passo 1 (Discovery via Grep) é BLOCKING

**Prevention:** Adicionar no prompt: "STOP: Execute grep_search agora. Não prossiga até ter resultados."

---

### Failure Mode 2: Cross-Story Decisions vazia
**Symptom:** Tabela presente mas sem entries ou com placeholders

**Root Cause:** @sm não leu EXEC-PLAN-EPIC-2.md ou não entendeu importância

**Fix:** Incluir exemplo completo no `<few_shot_examples>` (já incluído)

**Prevention:** Adicionar link direto para EXEC-PLAN-EPIC-2.md lines 1-50 no `<context>`

---

### Failure Mode 3: Tipos inventados (hallucination)
**Symptom:** Story cita `CampaignViewModel` ou `CampaignDTO` que não existem

**Root Cause:** @sm assumiu tipos comuns sem verificar codebase

**Fix:** Adicionar em `<anti_patterns>`: "NUNCA cite tipos sem grep confirmation"

**Prevention:** Já incluído em `<instructions>` item 8

---

### Failure Mode 4: ContentType aceita valores além de product/service/message
**Symptom:** Story permite ContentType = string ou inclui "info"

**Root Cause:** Não leu critical requirement #3

**Fix:** Destacar em `<critical_requirements>` com emoji ⚠️

**Prevention:** Já destacado — monitorar compliance

---

## 📊 Metrics Collection

### How to Collect Metrics
1. **Token count:** Contar tokens do prompt via tokenizer (aim: <1K)
2. **Grep execution rate:** Verificar tool calls history (% de sessões que executaram grep)
3. **Template compliance:** Checklist manual das 12 seções (% completo)
4. **Time to draft:** Medir tempo entre prompt enviado e story salva (target: <10min)

### Baseline (Story 2.1 Prompt)
- Tokens: ~850
- Grep execution: 100% (1/1 session)
- Template compliance: 100%
- Time to draft: ~8 min

### Target (Story 2.2 Prompt)
- Tokens: <1K (similar to 2.1)
- Grep execution: 100%
- Template compliance: 100%
- Time to draft: <12 min (mais complexo devido a grep multi-file)

---

## ✅ Acceptance Criteria for This Testing Strategy

- [ ] 5 validation tests definidos com pass criteria claros
- [ ] 4 failure modes documentados com fixes
- [ ] Metrics collection procedure descrito
- [ ] Baseline e target metrics definidos

---

## 📝 Test Execution Log

| Run | Date | @sm Model | Grep Executed? | Cross-Story Decisions | AC Count | Zero Hallucination | Template Compliance | Result |
|-----|------|-----------|----------------|----------------------|----------|-------------------|---------------------|--------|
| 1   | TBD  | TBD       | TBD            | TBD                  | TBD      | TBD               | TBD                 | TBD    |

---

**Next Steps:**
1. Enviar prompt para @sm
2. Executar Tests 1-5
3. Preencher Test Execution Log
4. Iterar prompt se failure rate >20%
