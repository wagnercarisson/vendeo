# Testing Strategy — @dev Story 2.3 (Contratos de API)

---

## Purpose

Validar que o prompt `dev-story-2.3.prompt.md` produz implementação correta de contratos de API com Zod, schemas re-exportados sem duplicação e discriminated unions precisas.

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Typecheck Pass Rate | 100% após CADA checkpoint | `npm run typecheck` exit code 0 |
| Test Pass Rate | 100% (15/15 testes) | `npx vitest run contracts.test.ts` |
| Re-Export Correctness | 100% | Grep em contracts.ts NÃO encontra `CampaignRequestSchema = z.object` (deve ser `= CampaignRequestSchema`) |
| Discriminated Union Usage | 100% (2 schemas) | Grep encontra `z.discriminatedUnion("ok"` exatamente 2x |
| ContentType Enum Correctness | 100% | `type: "info"` REJEITADO em testes |
| JSDoc Coverage | 100% (4 schemas) | Todos os 4 exports têm `@example` |
| Zero Breaking Changes | 100% | Nenhum arquivo além de contracts.ts e contracts.test.ts modificado |

---

## Validation Tests

### Test 1: Re-Export Pattern Enforcement

**Objetivo:** Confirmar que `GenerateCampaignRequestSchema` é alias (não duplicação).

**Método:**
```powershell
# Buscar duplicação de schema (MUST NOT find)
Select-String -Path lib/domain/campaigns/contracts.ts -Pattern "GenerateCampaignRequestSchema\s*=\s*z\.object"

# Buscar re-export correto (MUST find)
Select-String -Path lib/domain/campaigns/contracts.ts -Pattern "GenerateCampaignRequestSchema\s*=\s*CampaignRequestSchema"
```

**Expected:**
- Primeiro grep: 0 resultados (sem duplicação)
- Segundo grep: 1 resultado (re-export encontrado)

**Pass Criteria:** Re-export detectado, zero duplicação.

---

### Test 2: Discriminated Union Syntax

**Objetivo:** Verificar uso correto de `z.discriminatedUnion()` em responses.

**Método:**
```powershell
# Contar ocorrências de discriminatedUnion
(Select-String -Path lib/domain/campaigns/contracts.ts -Pattern 'z\.discriminatedUnion\("ok"').Count

# Confirmar uso de z.literal (não z.boolean)
Select-String -Path lib/domain/campaigns/contracts.ts -Pattern 'ok:\s*z\.literal\(true\)'
```

**Expected:**
- `discriminatedUnion("ok"` aparece exatamente 2x
- `z.literal(true)` aparece 2x (1 por response schema)

**Pass Criteria:** 2 discriminated unions, literals corretos.

---

### Test 3: ContentType Enum Closed

**Objetivo:** Garantir que `StrategyRequestSchema.product.type` rejeita "info".

**Método:**
```powershell
# Rodar teste específico
npx vitest run lib/domain/campaigns/contracts.test.ts -t "rejeita type=info"
```

**Expected:**
```
✓ StrategyRequestSchema > rejeita type=info (não é valor canônico)
```

**Pass Criteria:** Teste passa, mensagem confirma enum inválido.

---

### Test 4: Type Inference (Zero Manual Types)

**Objetivo:** Confirmar que TODOS os tipos são inferidos de Zod.

**Método:**
```powershell
# Buscar tipos manuais (MUST NOT find)
Select-String -Path lib/domain/campaigns/contracts.ts -Pattern "export\s+type\s+\w+\s*=\s*{" -Context 0,2

# Buscar z.infer (MUST find 4x)
(Select-String -Path lib/domain/campaigns/contracts.ts -Pattern "z\.infer<typeof").Count
```

**Expected:**
- Primeiro grep: 0 resultados (nenhum tipo manual)
- Segundo grep: 4 resultados (4 tipos inferidos)

**Pass Criteria:** 4 inferências detectadas, zero tipos manuais.

---

### Test 5: Checkpoint Compliance

**Objetivo:** Verificar que typecheck passa após CADA etapa.

**Método:**
```powershell
# Após Etapa 1 (contracts.ts criado)
npm run typecheck

# Após Etapa 2 (contracts.test.ts criado)
npm run typecheck
npx vitest run lib/domain/campaigns/contracts.test.ts
```

**Expected:**
- Checkpoint 1: exit code 0
- Checkpoint 2: exit code 0 + 15 testes passando

**Pass Criteria:** Ambos checkpoints passam sem erros.

---

### Test 6: JSDoc Coverage

**Objetivo:** Confirmar que todos os schemas têm `@example`.

**Método:**
```powershell
# Contar schemas exportados
$schemas = Select-String -Path lib/domain/campaigns/contracts.ts -Pattern "export const \w+Schema"
$schemas.Count

# Contar @example antes de exports
$examples = Select-String -Path lib/domain/campaigns/contracts.ts -Pattern "@example"
$examples.Count
```

**Expected:**
- 4 schemas exportados
- 4+ `@example` (alguns schemas têm múltiplos exemplos)

**Pass Criteria:** >= 4 `@example` presentes.

---

### Test 7: Test Coverage Completeness

**Objetivo:** Garantir que testes cobrem happy path + edge cases.

**Método:**
```powershell
# Rodar testes com coverage
npx vitest run lib/domain/campaigns/contracts.test.ts --coverage
```

**Expected:**
- `contracts.ts`: 100% coverage (todos os schemas testados)
- Testes incluem:
  - Happy path (dados válidos)
  - Campo obrigatório ausente
  - Enum inválido
  - Discriminated union branches (ok=true e ok=false)

**Pass Criteria:** 100% coverage, >= 15 testes passing.

---

## Failure Modes & Detection

| Failure Mode | Detection | Remediation |
|--------------|-----------|-------------|
| Schema duplicado (não re-export) | Test 1 falha — grep encontra `z.object` | Substituir por `= CampaignRequestSchema` |
| Union simples (não discriminated) | Test 2 falha — `discriminatedUnion` não encontrado | Refatorar para `z.discriminatedUnion("ok", [...])` |
| Enum permite "info" | Test 3 falha — teste "rejeita type=info" passa indevidamente | Corrigir enum para `["product", "service", "message"]` |
| Tipos manuais escritos | Test 4 falha — grep encontra `type X = {` | Substituir por `z.infer<typeof XSchema>` |
| Typecheck falha | Test 5 exit code ≠ 0 | Revisar erros no terminal, corrigir imports/types |
| JSDoc ausente | Test 6 falha — contagem < 4 | Adicionar `@example` em todos os schemas |
| Testes incompletos | Test 7 coverage < 100% | Adicionar testes para branches não cobertos |

---

## Metrics Collection

### Prompt Effectiveness

Após execução do prompt, registrar:

1. **Checkpoint 1 Pass:** ✅ / ❌ (typecheck após contracts.ts)
2. **Checkpoint 2 Pass:** ✅ / ❌ (typecheck + testes após contracts.test.ts)
3. **Re-Export Detected:** ✅ / ❌ (Test 1)
4. **Discriminated Unions Count:** X de 2 (Test 2)
5. **Enum Closed:** ✅ / ❌ (Test 3)
6. **Zero Manual Types:** ✅ / ❌ (Test 4)
7. **JSDoc Coverage:** X de 4 (Test 6)
8. **Test Pass Rate:** X de 15 (Test 7)

### Cost/Benefit

| Metric | Value |
|--------|-------|
| Prompt Token Count | ~1200 (incluindo code examples completos) |
| Stories com este pattern | 2.3 (pode ser reusado em Stories 2.6, 2.7 para outros endpoints) |
| Estimated Time Saved | 45min (evita pesquisa de discriminated union syntax + re-export pattern) |
| Quality Improvement | 100% aderência a Zod best practices (re-export, discriminated unions) |

---

## Test Execution Log (Template)

Copiar e preencher após execução:

```
=== STORY 2.3 @dev PROMPT TEST ===
Data: YYYY-MM-DD
Executor: @dev / Human

[ ] Test 1: Re-Export Pattern
    - Comando: Select-String ... "GenerateCampaignRequestSchema\s*=\s*CampaignRequestSchema"
    - Resultado: ENCONTRADO / NÃO ENCONTRADO
    - Status: PASS / FAIL

[ ] Test 2: Discriminated Union Syntax
    - Comando: (Select-String ... 'z\.discriminatedUnion\("ok"').Count
    - Resultado: X ocorrências (esperado: 2)
    - Status: PASS / FAIL

[ ] Test 3: ContentType Enum Closed
    - Comando: npx vitest run ... -t "rejeita type=info"
    - Resultado: PASSOU / FALHOU
    - Status: PASS / FAIL

[ ] Test 4: Type Inference
    - Comando: (Select-String ... "z\.infer<typeof").Count
    - Resultado: X tipos (esperado: 4)
    - Status: PASS / FAIL

[ ] Test 5: Checkpoint Compliance
    - Checkpoint 1: EXIT CODE X
    - Checkpoint 2: EXIT CODE X, TESTES X/15
    - Status: PASS / FAIL

[ ] Test 6: JSDoc Coverage
    - Comando: (Select-String ... "@example").Count
    - Resultado: X exemplos (esperado: >= 4)
    - Status: PASS / FAIL

[ ] Test 7: Test Coverage
    - Comando: npx vitest run ... --coverage
    - Resultado: X% coverage, X/15 testes
    - Status: PASS / FAIL

=== SUMMARY ===
Tests Passed: X/7
Overall Status: PASS / FAIL
Notes: (observações, erros encontrados, tempo gasto)
```

---

## Quality Gates

### Gate 1: Syntax Correctness (BLOCK)
- Typecheck passa após Etapa 1 ✅
- Re-export pattern detectado (Test 1) ✅
- Discriminated unions corretos (Test 2) ✅

**If FAIL:** STOP — revisar code examples no prompt.

### Gate 2: Semantic Correctness (BLOCK)
- Enum fechado rejeita "info" (Test 3) ✅
- Todos os tipos inferidos (Test 4) ✅
- JSDoc presente em todos os schemas (Test 6) ✅

**If FAIL:** STOP — revisar requirements no prompt.

### Gate 3: Quality Assurance (WARN)
- Testes >= 15 passing (Test 7) ✅
- Coverage >= 100% (Test 7) ✅

**If FAIL:** WARN — continuar mas reportar gap de testes.

---

## Integration with CodeRabbit

Quando @dev commitar, CodeRabbit verificará:
- `GenerateCampaignRequestSchema` é re-export (Path Instructions em Story 2.3)
- Response schemas usam discriminated union
- StrategyRequestSchema.product.type é enum fechado
- Todos os tipos são `z.infer`

**Auto-healing trigger:** Se CodeRabbit encontrar violação, max 1 iteração de fix.

---

## Learnings & Improvements

Após execução, documentar:

1. **Prompts funcionou first-try?** Sim / Não — se não, qual erro?
2. **Code examples foram copiados corretamente?** Sim / Não
3. **Checkpoints foram respeitados?** Sim / Não — se não, onde pularam?
4. **Testes precisaram de ajustes?** Sim / Não — quais?
5. **Tempo total de execução:** X minutos (comparar com estimativa de 1-2h)

**Feedback loop:** Melhorias neste testing strategy alimentam próximas stories (2.6, 2.7).

---

**END OF TESTING STRATEGY**
