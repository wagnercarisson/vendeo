# Testing Strategy: Prompt @sm Story 2.3

**Prompt File:** `docs/stories/prompts/sm-story-2.3.prompt.md`  
**Target Agent:** @sm (River)  
**Story:** 2.3 — Contratos de API

---

## 🎯 Success Metrics

### Primary KPIs
| Metric | Target | How to Measure |
|--------|--------|----------------|
| **API discovery execution** | 100% before drafting | Verificar se @sm executou grep_search para API routes antes de escrever User Story |
| **Cross-Story Decisions** | ≥3 entries | Tabela preenchida com decisões rastreáveis |
| **Acceptance Criteria** | ≥3 Gherkin scenarios | Formato `GIVEN/WHEN/THEN` com validações testáveis |
| **File List completeness** | 100% discovered | Endpoints descobertos + contracts.ts/test listados |
| **Zero hallucination** | 0 invented schemas | Nenhum campo de request/response citado sem grep/read |

### Secondary KPIs
| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Token efficiency** | <1.2K prompt | Verificar token count do prompt (deve ser ~1K) |
| **Compliance with template** | 100% | Story usa exatamente o OUTPUT_FORMAT fornecido |
| **Risks identified** | ≥3 | Tabela Risks & Mitigations preenchida com mitigações concretas |

---

## 🧪 Validation Tests

### Test 1: API Discovery Enforcement
**Objetivo:** Confirmar que @sm descobriu estrutura real de API routes ANTES de draftar

**Procedure:**
1. Enviar prompt para @sm
2. Observar histórico de tool calls
3. Verificar se `grep_search` foi executado para localizar `app/api/generate/` ou `pages/api/generate/`
4. Confirmar se `read_file` foi executado para ler routes identificadas

**Expected Result:**
- `grep_search` com pattern `generate` ou `api/generate` aparece nos primeiros 3 tool calls
- `read_file` para route.ts identificado aparece antes de qualquer escrita no story file
- Files descobertos são listados no File List da story

**Pass Criteria:** Grep + read executados antes de qualquer escrita no story file

---

### Test 2: Contract Schema Discovery
**Objetivo:** Validar que contratos refletem estrutura REAL da API (não inventados)

**Procedure:**
1. Ler seção "Dev Notes" da story gerada
2. Verificar se lista campos de request/response descobertos via grep/read
3. Comparar com código real em `app/api/generate/campaign/route.ts`

**Expected Result:**
```markdown
**Dev Notes:**
Estrutura descoberta em app/api/generate/campaign/route.ts:

Request body esperado:
- store_id (string, required)
- product_name (string, required)
- price (number, nullable)
- content_type (enum: product|service|message)
- ...

Response retornado:
- campaign (Campaign object)
- ai_content ({ headline, caption, ... })
- status (success|error)
```

**Pass Criteria:** Dev Notes lista campos EXATOS descobertos no código (não genéricos)

---

### Test 3: Cross-Story Decisions Traceability
**Objetivo:** Validar rastreabilidade de decisões críticas (ContentType, Zod schemas)

**Procedure:**
1. Ler seção "Cross-Story Decisions" da story gerada
2. Verificar se inclui:
   - ContentType fechado (product/service/message)
   - Campaign = CampaignDomain (de Story 2.2)
   - Schemas Zod como fonte de verdade (de Story 2.1)

**Expected Result:**
```markdown
| Decision | Source | Impact on This Story |
|----------|--------|----------------------|
| ContentType fechado: "product" \| "service" \| "message" | Story 2.2 | GenerateCampaignRequestSchema DEVE validar content_type com z.enum([...]) |
| Campaign = CampaignDomain (Zod-inferred) | Story 2.2 | Response schema usa Campaign type de types.ts |
| Schemas Zod como fonte de verdade | Story 2.1 | Todos os contratos DEVEM ser schemas Zod — tipos inferidos via z.infer |
```

**Pass Criteria:** ≥3 decisões com source e impacto explícitos

---

### Test 4: Acceptance Criteria Testability
**Objetivo:** Garantir que AC são executáveis via `.safeParse()`

**Procedure:**
1. Ler seção "Acceptance Criteria"
2. Verificar formato Gherkin (GIVEN/WHEN/THEN)
3. Confirmar que cada critério é testável via `.safeParse()` em contracts.test.ts

**Expected Result:**
```gherkin
GIVEN que /api/generate/campaign recebe payload válido
WHEN GenerateCampaignRequestSchema.safeParse(payload) for executado
THEN retorna success: true
AND parsed data contém campos esperados
AND content_type é validado como enum fechado
```

**Pass Criteria:** ≥3 cenários, todos no formato Gherkin, todos testáveis via `.safeParse()`

---

### Test 5: Zero Hallucination Validation
**Objetivo:** Confirmar que nenhum campo de request/response foi inventado

**Procedure:**
1. Extrair lista de campos de Dev Notes (request/response)
2. Ler `app/api/generate/campaign/route.ts` (ou endpoint descoberto)
3. Comparar campos listados na story vs. campos no código real

**Expected Result:**
- 100% dos campos listados na story existem no código da rota
- Nenhum campo genérico inventado (ex: "data", "payload", "result")

**Pass Criteria:** Nenhum campo citado sem evidência no código da API route

---

### Test 6: Testing Strategy Presence
**Objetivo:** Verificar que story planeja testes unitários para schemas

**Procedure:**
1. Verificar se File List inclui `contracts.test.ts`
2. Verificar se DoD inclui checkpoint de testes unitários
3. Verificar se AC incluem happy path + error cases

**Expected Result:**
```markdown
## File List
| lib/domain/campaigns/contracts.test.ts | Create | Testes unitários via .safeParse() |

## Definition of Done
- [ ] contracts.test.ts com happy path + error cases
```

**Pass Criteria:** Story planeja testes unitários explicitamente

---

## 🔍 Failure Modes & Diagnostics

### Failure Mode 1: @sm skips API discovery
**Symptom:** Story file criado sem tool calls de grep_search para API routes

**Root Cause:** `<think>` Passo 1 (Discovery de Endpoints) não foi seguido

**Fix:** Reforçar que API discovery é BLOCKING — "STOP: Execute grep_search agora"

**Prevention:** Adicionar no prompt: "Você NÃO PODE draftar sem ler a rota real primeiro"

---

### Failure Mode 2: Contratos inventados (hallucination)
**Symptom:** Story cita campos como `data`, `payload`, `result` que não existem na API route

**Root Cause:** @sm assumiu estrutura genérica sem ler código real

**Fix:** Adicionar em `<anti_patterns>`: "NUNCA cite campos sem grep/read confirmation"

**Prevention:** Já incluído em `<instructions>` item 8

---

### Failure Mode 3: Cross-Story Decisions vazia ou genérica
**Symptom:** Tabela presente mas sem entries específicas ou com placeholders

**Root Cause:** @sm não conectou decisões de Story 2.1/2.2 com contratos

**Fix:** Incluir exemplo completo no `<few_shot_examples>` (já incluído)

**Prevention:** THINK Passo 5 reforça dependency chain

---

### Failure Mode 4: AC sem testabilidade via .safeParse()
**Symptom:** AC descrevem comportamento mas não especificam como testar

**Root Cause:** @sm focou em descrição, não em validação executável

**Fix:** Few-shot example mostra AC com `.safeParse()` explícito

**Prevention:** CRITICAL REQUIREMENT #5 reforça testabilidade

---

## 📊 Metrics Collection

### How to Collect Metrics
1. **Token count:** Contar tokens do prompt via tokenizer (aim: <1.2K)
2. **API discovery rate:** Verificar tool calls history (% de sessões que executaram grep + read)
3. **Template compliance:** Checklist manual das 12 seções (% completo)
4. **Time to draft:** Medir tempo entre prompt enviado e story salva (target: <10min)

### Baseline (Story 2.2 Prompt)
- Tokens: ~1020
- Grep execution: 100% (1/1 session)
- Template compliance: 100%
- Time to draft: ~8 min
- @po score: 10/10

### Target (Story 2.3 Prompt)
- Tokens: <1.2K (similar to 2.1/2.2)
- API discovery: 100% (grep + read)
- Template compliance: 100%
- Time to draft: <10 min (API discovery adds ~2 min)
- @po score: ≥8/10

---

## ✅ Acceptance Criteria for This Testing Strategy

- [ ] 6 validation tests definidos com pass criteria claros
- [ ] 4 failure modes documentados com fixes
- [ ] Metrics collection procedure descrito
- [ ] Baseline e target metrics definidos

---

## 📝 Test Execution Log

| Run | Date | @sm Model | API Discovery? | Contract Fields | AC Count | Zero Hallucination | Template Compliance | Result |
|-----|------|-----------|----------------|-----------------|----------|-------------------|---------------------|--------|
| 1   | TBD  | TBD       | TBD            | TBD             | TBD      | TBD               | TBD                 | TBD    |

---

**Next Steps:**
1. Enviar prompt para @sm
2. Executar Tests 1-6
3. Preencher Test Execution Log
4. Iterar prompt se failure rate >20%
