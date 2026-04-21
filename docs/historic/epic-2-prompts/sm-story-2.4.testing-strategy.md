# Testing Strategy — @sm Story 2.4 (Mappers Seguros)

---

## Purpose

Validar que o prompt `sm-story-2.4.prompt.md` produz story completa com discovery de mappers, AC testáveis com `.safeParse()`, risk assessment HIGH RISK e testes com dados reais.

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Discovery Execution Rate | 100% | Grep + read mapper.ts ANTES de draftar |
| Function Discovery Count | 6-7 funções | Listar todas as funções existentes |
| Cross-Story Decisions | ≥4 entries | Tabela com decisões de Stories 2.1, 2.2, 2.3 |
| AC with .safeParse() Pattern | ≥5 blocos Gherkin | Cada bloco especifica validação Zod |
| Risk Assessment Completeness | ≥4 riscos HIGH/MEDIUM | Impacto + mitigação concretas |
| Error Handling Example | 1 código completo | Exemplo com .safeParse() em Dev Notes |
| File List Completeness | ≥6 arquivos | Action + notes claros |
| DoD Checklist | ≥10 items | Executáveis e verificáveis |

---

## Validation Tests

### Test 1: Mapper Discovery Enforcement

**Objetivo:** Confirmar que @sm executou grep/read ANTES de draftar story.

**Método:**
```powershell
# Verificar Dev Notes contém lista de funções descobertas
Select-String -Path docs/stories/2.4.story.md -Pattern "Funções a Refatorar:" -Context 0,8

# Deve listar:
# - mapDbCampaignToDomain()
# - mapAiCampaignToDomain()
# - mapDbCampaignToAIContext()
# - mapCampaignToListItem()
# E identificar problemas: ".parse() que throw", "sem try/catch"
```

**Expected:**
- Dev Notes seção com 4+ funções listadas
- Identificação de problemas específicos (ex: "usa .parse()")
- Menção explícita de que `mapDomainToCampaignDb()` NÃO existe

**Pass Criteria:** Discovery executado, funções listadas com estado atual.

---

### Test 2: Cross-Story Decisions Traceability

**Objetivo:** Garantir que decisões de Stories anteriores estão documentadas.

**Método:**
```powershell
# Contar linhas na tabela Cross-Story Decisions
$table = Select-String -Path docs/stories/2.4.story.md -Pattern "\| Decision \| Source \| Impact" -Context 0,10
$table.Context.PostContext | Where-Object { $_ -match "Story 2\.[123]" }
```

**Expected:**
- ≥4 decisões na tabela
- Referências a Story 2.1 (schemas), Story 2.2 (types), Story 2.3 (.safeParse())
- Coluna "Impact on This Story" específica (não genérica)

**Pass Criteria:** ≥4 decisões com traceability clara.

---

### Test 3: AC Testability (.safeParse() Pattern)

**Objetivo:** Verificar que AC especificam COMO validar (não apenas O QUE).

**Método:**
```powershell
# Buscar blocos Gherkin com .safeParse()
(Select-String -Path docs/stories/2.4.story.md -Pattern "\.safeParse\(\)").Count

# Buscar mensagens de erro específicas
Select-String -Path docs/stories/2.4.story.md -Pattern "campo .* inválido" -AllMatches
```

**Expected:**
- ≥5 ocorrências de `.safeParse()` em AC
- AC especificam formato de mensagens de erro (ex: "Campo 'audience' inválido: esperado enum, recebido 'xyz'")
- Testes planejados para cenários: happy path, dados inválidos, campos opcionais ausentes

**Pass Criteria:** ≥5 AC com pattern .safeParse() e mensagens de erro específicas.

---

### Test 4: High Risk Assessment

**Objetivo:** Confirmar que story identifica riscos críticos e mitigações.

**Método:**
```powershell
# Contar riscos na tabela Risks & Mitigations
$risks = Select-String -Path docs/stories/2.4.story.md -Pattern "\| .* \| 🔴 ALTO" -AllMatches
$risks.Matches.Count

# Verificar presença de mitigações
Select-String -Path docs/stories/2.4.story.md -Pattern "Mitigation" -Context 0,2
```

**Expected:**
- ≥2 riscos marcados como 🔴 ALTO
- ≥2 riscos marcados como 🟡 MÉDIO
- Cada risco tem mitigação concreta (não genérica)
- Mitigações incluem: fallbacks, testes com dados reais, validação de output

**Pass Criteria:** ≥4 riscos com impact assessment e mitigações específicas.

---

### Test 5: Error Handling Example Presence

**Objetivo:** Verificar que Dev Notes inclui código de exemplo com .safeParse().

**Método:**
```powershell
# Buscar exemplo de código em Dev Notes
Select-String -Path docs/stories/2.4.story.md -Pattern "export function mapDbCampaignToDomain" -Context 0,15

# Deve conter:
# - const result = DbCampaignSchema.safeParse(data);
# - if (!result.success)
# - console.error ou throw com mensagem útil
```

**Expected:**
- Código completo (10+ linhas)
- Pattern: safeParse() → check result.success → error handling → return
- Mensagem de erro inclui result.error.format() ou result.error.issues

**Pass Criteria:** Exemplo de código completo presente em Dev Notes.

---

### Test 6: Zero Breaking Changes Enforcement

**Objetivo:** Garantir que story explicitamente proíbe mudanças de assinaturas.

**Método:**
```powershell
# Buscar "zero breaking changes" no Scope OUT
Select-String -Path docs/stories/2.4.story.md -Pattern "zero breaking changes|assinaturas.*não.*mudar" -AllMatches

# Buscar menção em DoD
Select-String -Path docs/stories/2.4.story.md -Pattern "campanhas existentes.*funcionam" -AllMatches
```

**Expected:**
- Scope OUT inclui "**Não** alterar assinaturas de funções existentes"
- DoD inclui checkbox "Zero breaking changes — campanhas existentes funcionam"
- Risk assessment menciona risco de quebrar campanhas existentes

**Pass Criteria:** ≥3 menções a zero breaking changes em seções diferentes.

---

### Test 7: Test Strategy Planning (mapper.test.ts)

**Objetivo:** Confirmar que story planeja testes com dados reais (não sintéticos).

**Método:**
```powershell
# Buscar menção a mapper.test.ts
Select-String -Path docs/stories/2.4.story.md -Pattern "mapper\.test\.ts" -AllMatches

# Buscar "dados reais" ou "fixtures"
Select-String -Path docs/stories/2.4.story.md -Pattern "dados reais|fixtures|registros do banco" -AllMatches
```

**Expected:**
- mapper.test.ts listado em File List como "Create"
- AC ou Dev Notes mencionam "testes com dados reais do banco"
- DoD inclui "Testes cobrem: happy path, dados inválidos, campos opcionais ausentes"

**Pass Criteria:** Testes planejados com dados reais (não apenas mocks).

---

### Test 8: Write Mapper Creation (mapDomainToCampaignDb)

**Objetivo:** Verificar que story inclui criação de write mapper.

**Método:**
```powershell
# Buscar mapDomainToCampaignDb
Select-String -Path docs/stories/2.4.story.md -Pattern "mapDomainToCampaignDb" -AllMatches

# Deve aparecer em:
# - Scope IN
# - Acceptance Criteria
# - Dev Notes (Função a Criar)
# - DoD
```

**Expected:**
- ≥4 menções a `mapDomainToCampaignDb()`
- AC específico para write mapper (valida input, retorna objeto DB-ready)
- DoD checkbox específico: "mapDomainToCampaignDb() criado e validado"

**Pass Criteria:** Write mapper presente em ≥4 seções da story.

---

## Failure Modes & Detection

| Failure Mode | Detection | Remediation |
|--------------|-----------|-------------|
| Discovery não executado | Test 1 falha — Dev Notes vazio ou genérico | Executar grep + read mapper.ts, listar funções descobertas |
| Cross-Story Decisions ausentes | Test 2 falha — <4 decisões | Consultar Stories 2.1, 2.2, 2.3 e criar tabela |
| AC sem .safeParse() pattern | Test 3 falha — <5 ocorrências | Reescrever AC com validação Zod explícita |
| Risk assessment genérico | Test 4 falha — <4 riscos ou mitigações vagas | Identificar riscos específicos (quebrar campanhas, corromper dados) |
| Exemplo de código ausente | Test 5 falha — Dev Notes sem código | Adicionar exemplo completo com .safeParse() pattern |
| Breaking changes permitidos | Test 6 falha — <3 menções | Adicionar explicitamente no Scope OUT e DoD |
| Testes sintéticos planejados | Test 7 falha — sem menção a dados reais | Adicionar requisito de fixtures com dados reais em AC/DoD |
| Write mapper esquecido | Test 8 falha — <4 menções | Adicionar mapDomainToCampaignDb() em Scope IN, AC, DoD |

---

## Metrics Collection

### Prompt Effectiveness

Após execução do prompt, registrar:

1. **Discovery Executed:** ✅ / ❌ (grep + read antes de draftar)
2. **Functions Discovered:** X de 6-7 esperadas
3. **Cross-Story Decisions:** X de 4+ esperadas
4. **AC with .safeParse():** X de 5+ esperadas
5. **Risks Identified:** X de 4+ esperadas (incluir HIGH/MEDIUM count)
6. **Error Example Present:** ✅ / ❌ (código completo em Dev Notes)
7. **Write Mapper Included:** ✅ / ❌ (mapDomainToCampaignDb)
8. **DoD Completeness:** X de 10+ items

### Cost/Benefit

| Metric | Value |
|--------|-------|
| Prompt Token Count | ~1400 (incluindo code example + CoT detalhado) |
| Stories com este pattern | 2.4 (reutilizável em Stories futuras com refactoring + high risk) |
| Estimated Time Saved | 60-90min (discovery + risk assessment estruturados) |
| Quality Improvement | 100% coverage de error handling patterns |

---

## Test Execution Log (Template)

Copiar e preencher após execução:

```
=== STORY 2.4 @sm PROMPT TEST ===
Data: YYYY-MM-DD
Executor: @sm / Human

[ ] Test 1: Mapper Discovery Enforcement
    - Comando: Select-String ... "Funções a Refatorar:" -Context 0,8
    - Resultado: X funções listadas
    - Status: PASS / FAIL

[ ] Test 2: Cross-Story Decisions Traceability
    - Comando: Select-String ... "Story 2\.[123]"
    - Resultado: X decisões (esperado: ≥4)
    - Status: PASS / FAIL

[ ] Test 3: AC Testability
    - Comando: (Select-String ... "\.safeParse\(\)").Count
    - Resultado: X ocorrências (esperado: ≥5)
    - Status: PASS / FAIL

[ ] Test 4: High Risk Assessment
    - Comando: Select-String ... "🔴 ALTO" -AllMatches
    - Resultado: X riscos ALTO, Y riscos MÉDIO (esperado: ≥2 ALTO, ≥2 MÉDIO)
    - Status: PASS / FAIL

[ ] Test 5: Error Handling Example
    - Comando: Select-String ... "export function mapDbCampaignToDomain" -Context 0,15
    - Resultado: ENCONTRADO / NÃO ENCONTRADO
    - Status: PASS / FAIL

[ ] Test 6: Zero Breaking Changes
    - Comando: Select-String ... "zero breaking changes" -AllMatches
    - Resultado: X menções (esperado: ≥3)
    - Status: PASS / FAIL

[ ] Test 7: Test Strategy Planning
    - Comando: Select-String ... "dados reais|fixtures" -AllMatches
    - Resultado: X menções
    - Status: PASS / FAIL

[ ] Test 8: Write Mapper Creation
    - Comando: Select-String ... "mapDomainToCampaignDb" -AllMatches
    - Resultado: X menções (esperado: ≥4)
    - Status: PASS / FAIL

=== SUMMARY ===
Tests Passed: X/8
Overall Status: PASS / FAIL
Notes: (observações, erros encontrados, tempo gasto)
```

---

## Quality Gates

### Gate 1: Discovery Completeness (BLOCK)
- Mapper discovery executado (Test 1) ✅
- Cross-Story Decisions documentadas (Test 2) ✅
- Write mapper planejado (Test 8) ✅

**If FAIL:** STOP — discovery é foundational para story accuracy.

### Gate 2: Risk & Error Handling (BLOCK)
- High Risk assessment (Test 4) ✅
- Error handling example presente (Test 5) ✅
- Zero breaking changes enforcement (Test 6) ✅

**If FAIL:** STOP — HIGH RISK story sem error patterns é inaceitável.

### Gate 3: Quality Assurance (WARN)
- AC testability (Test 3) ✅
- Test strategy (Test 7) ✅

**If FAIL:** WARN — continuar mas reportar gap de testability.

---

## Integration with @po Validation

Quando @po avaliar Story 2.4, checklist incluirá:
- Discovery executado? (verifica Dev Notes)
- Risk assessment HIGH RISK presente? (verifica tabela Risks)
- Error handling pattern incluído? (verifica código de exemplo)
- Zero breaking changes explícito? (verifica Scope OUT)

**Target Score:** ≥8/10 (Story 2.4 é complexa mas bem estruturada se seguir prompt)

---

## Learnings & Improvements

Após execução, documentar:

1. **Discovery foi suficiente?** Sim / Não — se não, o que faltou?
2. **Risk assessment capturou todos os riscos?** Sim / Não — quais riscos surpreenderam?
3. **AC especificaram error patterns claramente?** Sim / Não — @dev precisou de clarificações?
4. **Código de exemplo foi útil?** Sim / Não — @dev seguiu o pattern?
5. **Tempo total de execução:** X minutos (comparar com estimativa de 3-4h para @dev)

**Feedback loop:** Melhorias neste testing strategy alimentam próximas stories HIGH RISK (refactoring, error handling).

---

**END OF TESTING STRATEGY**
