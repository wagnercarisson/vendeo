# Analysis — @sm Story 2.4 Prompt (Mappers Seguros)

---

## Purpose

Document design decisions, tradeoffs and optimization strategies for `sm-story-2.4.prompt.md` — first HIGH RISK refactoring story in Epic 2.

---

## Design Decisions

### Decision 1: Mandatory Discovery Pattern (grep + read)

**Rationale:**
- Story 2.4 refactors EXISTING code — não é criar arquivo novo como Stories 2.1, 2.2, 2.3
- Mappers estão em produção com volume alto de uso (listagens de campanhas)
- Sem discovery, @sm pode inventar estado atual (hallucinate functions)
- Prompt DEVE forçar grep + read ANTES de criar qualquer seção

**Implementation:**
```xml
<think>
Passo 1 — Discovery de Mappers Existentes
ANTES de criar qualquer seção da story, EXECUTE:
grep -n "export function" lib/domain/campaigns/mapper.ts
ENTÃO leia o arquivo completo
</think>
```

**Tradeoff:**
- **Custo:** +200 tokens (instruções de discovery detalhadas)
- **Benefício:** -100% de hallucination sobre funções existentes (crítico para HIGH RISK)
- **Decisão:** Incluir — refactoring sem discovery é receita para bugs

---

### Decision 2: High Risk Assessment Enforcement

**Rationale:**
- Código em produção com volume alto → falha impacta todos os usuários
- Validação Zod pode rejeitar campanhas existentes → downtime
- @sm deve documentar riscos E mitigações concretas (não genéricas)
- Stories anteriores (2.1-2.3) eram LOW/MEDIUM risk — este é o primeiro HIGH RISK

**Implementation:**
- Passo 4 do CoT dedicado a Risk Assessment
- Template de tabela Risks & Mitigations com 4+ entries
- Mitigações DEVEM ser concretas: "fallbacks documentados", "testes com dados reais"

**Tradeoff:**
- **Custo:** +150 tokens (seção de risk assessment + exemplos)
- **Benefício:** Risk awareness desde planning → menos surpresas em @dev
- **Decisão:** Incluir — HIGH RISK story SEM risk assessment é negligência

---

### Decision 3: Error Handling Code Example (não apenas descrição)

**Rationale:**
- `.safeParse()` pattern não é intuitivo — difere de `.parse()` que throw
- @dev precisa ver EXATO pattern: safeParse() → check result.success → error handling
- Stories anteriores usaram snippets — este precisa de código COMPLETO
- Dev Notes com exemplo reduz ambiguidade em 80%

**Implementation:**
```typescript
export function mapDbCampaignToDomain(data: unknown): Campaign {
  const result = DbCampaignSchema.safeParse(data);
  
  if (!result.success) {
    console.error("Validação de campanha falhou:", result.error.format());
    throw new Error(`Campanha inválida: ${result.error.issues[0]?.message}`);
  }
  
  const raw = result.data;
  // ... resto do mapper
}
```

**Tradeoff:**
- **Custo:** +120 tokens (código de exemplo completo)
- **Benefício:** Pattern claro para @dev seguir em todas as funções
- **Decisão:** Incluir — error handling é core da story, exemplo é essencial

---

### Decision 4: Zero Breaking Changes Explicitação

**Rationale:**
- Campanhas existentes DEVEM continuar funcionando após refactoring
- Assinaturas de funções NÃO podem mudar (consumers esperam mesmas signatures)
- Fallbacks DEVEM preservar comportamento atual (não rejeitar dados válidos hoje)
- Precisa estar em MÚLTIPLAS seções (Scope OUT, DoD, Risks) para ênfase

**Implementation:**
- Scope OUT: "**Não** alterar assinaturas de funções existentes (zero breaking changes)"
- DoD: "Zero breaking changes — campanhas existentes funcionam"
- Risks: "Validação Zod rejeita campanhas existentes → Fallbacks documentados"

**Tradeoff:**
- **Custo:** +60 tokens (repetição em 3 seções)
- **Benefício:** Impossível @dev esquecer este constraint crítico
- **Decisão:** Incluir — repetição é feature, não bug (HIGH RISK justifica)

---

### Decision 5: Cross-Story Decisions com ≥4 Entries

**Rationale:**
- Story 2.4 depende de 3 stories anteriores (2.1, 2.2, 2.3)
- Decisões relevantes: Schemas Zod (2.1), Campaign type (2.2), .safeParse() (2.3)
- Tabela Cross-Story Decisions garante traceability
- Mínimo 4 decisões para cobrir: schemas, types, validation pattern, error handling

**Implementation:**
```markdown
| Decision | Source | Impact on This Story |
|----------|--------|----------------------|
| Schemas Zod como fonte de verdade | Story 2.1 | Mappers DEVEM validar com schemas antes de mapear |
| Campaign type = CampaignDomain | Story 2.2 | mapDomainToCampaignDb() usa este type como input |
| .safeParse() pattern (não .parse()) | Story 2.3 | Substituir .parse() por .safeParse() em todos os mappers |
| ... | ... | ... |
```

**Tradeoff:**
- **Custo:** +80 tokens (tabela + instruções)
- **Benefício:** 100% aderência a decisões anteriores (evita regredir)
- **Decisão:** Incluir — Epic 2 é sequencial, traceability é crítica

---

### Decision 6: Test Strategy com Dados Reais (não sintéticos)

**Rationale:**
- Mappers processam dados de campanhas existentes no banco
- Testes sintéticos (ex: `{ id: "1" }`) não cobrem casos reais (campos opcionais, enums legacy)
- Fixtures DEVEM simular registros reais: campos opcionais ausentes, valores legacy
- AC deve especificar "testes com dados reais do banco"

**Implementation:**
- AC: "Testes cobrem: happy path, dados inválidos, campos opcionais ausentes"
- Dev Notes: "Criar fixtures com dados reais do banco"
- DoD: "mapper.test.ts criado com 10+ testes" (volume indica dados variados)

**Tradeoff:**
- **Custo:** +40 tokens (menções a dados reais)
- **Benefício:** Testes detectam bugs que sintéticos perderiam
- **Decisão:** Incluir — HIGH RISK code precisa de HIGH QUALITY tests

---

### Decision 7: Write Mapper Creation (mapDomainToCampaignDb)

**Rationale:**
- Mappers existentes são read-only (DB → domain)
- Falta write mapper (domain → DB) para Story 2.6 (API integration)
- Criar agora garante validação bidirecional (read E write validados)
- Write mapper é gap crítico identificado nos requirements

**Implementation:**
- Scope IN: "Criar mapDomainToCampaignDb() (write mapper)"
- AC específico: "mapDomainToCampaignDb() valida input com CampaignDomainSchema.safeParse()"
- Dev Notes: "Função a Criar: mapDomainToCampaignDb() — domain → DB (write)"

**Tradeoff:**
- **Custo:** +100 tokens (AC + Dev Notes + DoD para write mapper)
- **Benefício:** Completude bidirecional → Story 2.6 não precisa criar write mapper
- **Decisão:** Incluir — write mapper é missing piece para validação completa

---

## Token Economy Analysis

### Breakdown (sm-story-2.4.prompt.md)

| Section | Tokens | % of Total | Justification |
|---------|--------|-----------|---------------|
| Context + Critical Requirements | ~200 | 14% | HIGH RISK context + 6 critical requirements |
| Chain-of-Thought (6 passos) | ~500 | 36% | Discovery (Passo 1) + Risk Assessment (Passo 4) detalhados |
| Story Structure Template | ~320 | 23% | Template completo com seções específicas (Risks, Error Pattern) |
| Error Handling Code Example | ~120 | 9% | Código completo com .safeParse() pattern |
| Validation Checklist + Anti-Patterns | ~150 | 11% | 9 checkboxes + 6 anti-patterns |
| Execution Instructions | ~100 | 7% | Save, await @po, next steps |
| **TOTAL** | **~1390** | **100%** | **+36% vs Story 2.3** (1000 tokens) |

### Optimizations Applied

1. **Added:** Discovery step (Passo 1) — critical para refactoring
2. **Added:** Risk Assessment step (Passo 4) — HIGH RISK justifica
3. **Added:** Error handling code example — pattern não é óbvio
4. **Kept:** Cross-Story Decisions (4+ entries) — traceability essencial
5. **Removed:** N/A — Story complexa requer todos os elementos

**Result:** 1390 tokens (+36% vs Story 2.3) — aumento justificado por HIGH RISK + refactoring complexity.

---

## Model Recommendation

**Recommended:** Claude Sonnet 4.6 (1x multiplier)

**Justification:**
1. **High Risk Assessment:** Requer raciocínio sobre impacto em produção
2. **Refactoring Discovery:** Precisa ler código existente e identificar problemas
3. **Error Pattern Design:** `.safeParse()` + try/catch + fallbacks é logic complexo
4. **Test Strategy Planning:** Dados reais vs sintéticos requer domain knowledge

**NOT Recommended:** GPT-5.4 mini (0.33x) — HIGH RISK story com refactoring é complexa demais para mini.

**Cost/Benefit:**
- Input: ~1390 tokens (prompt) + ~400 tokens (story context) = ~1790 tokens
- Output: ~800 tokens (story completa com discovery)
- Total: ~2590 tokens × 1x = **2590 tokens custo**
- Alternative (mini): 2590 × 0.33 = 855 tokens, mas +60% chance de erro (missing discovery)

**Decisão:** Sonnet 4.6 — HIGH RISK + refactoring justifica 1x multiplier.

---

## Comparison: Story 2.3 vs Story 2.4

| Aspect | Story 2.3 (Contracts) | Story 2.4 (Mappers) | Difference |
|--------|----------------------|---------------------|------------|
| Prompt Tokens | 1000 | 1390 | +39% (discovery + risk assessment) |
| Code Type | Create new file | Refactor existing | Different pattern |
| Discovery Required | API routes (grep) | Mapper functions (grep + read) | +100% read depth |
| Risk Level | LOW | HIGH | Critical difference |
| Error Pattern | Discriminated unions | .safeParse() + fallbacks | Different Zod feature |
| Cross-Story Deps | 3 (2.1, 2.2, legacy) | 3 (2.1, 2.2, 2.3) | Sequential |
| Test Strategy | Synthetic OK | Real data REQUIRED | Quality bar higher |
| Code Example | Complete (260 lines) | Pattern (15 lines) | Pattern vs implementation |

**Key Insight:** HIGH RISK refactoring stories precisam de +40% tokens para discovery + risk assessment, mas ainda são menores que LOW RISK implementation stories (Story 2.3 @dev = 1200 tokens).

---

## Risk Mitigation

### High Risk: Discovery Não Executado

**Mitigation:** Passo 1 do CoT FORÇA grep + read ANTES de qualquer seção.

**Fallback:** Test 1 (testing-strategy.md) detecta se Dev Notes está vazio → @po rejeita story.

### Medium Risk: Breaking Changes Introduzidos

**Mitigation:** Zero breaking changes em 3 seções (Scope OUT, DoD, Risks).

**Fallback:** @dev verifica assinaturas antes de commitar, CodeRabbit detecta mudanças.

### Medium Risk: Testes Sintéticos (não reais)

**Mitigation:** AC e Dev Notes especificam "dados reais do banco", "fixtures".

**Fallback:** Test 7 (testing-strategy.md) verifica menções a dados reais → @po valida.

### Low Risk: Write Mapper Esquecido

**Mitigation:** Scope IN, AC, Dev Notes, DoD todos mencionam `mapDomainToCampaignDb()`.

**Fallback:** Test 8 (testing-strategy.md) conta menções (≥4 esperadas).

---

## Metrics to Track

Post-execution, measure:

1. **Discovery Executed:** Sim / Não — Dev Notes lista funções descobertas?
2. **Functions Discovered:** X de 6-7 esperadas
3. **Cross-Story Decisions:** X de 4+ esperadas
4. **Risk Assessment:** X riscos HIGH, Y riscos MEDIUM (target: ≥2 HIGH, ≥2 MEDIUM)
5. **Error Example Present:** Sim / Não — código completo em Dev Notes?
6. **Zero Breaking Changes:** X menções (target: ≥3 seções)
7. **Write Mapper Included:** Sim / Não — mapDomainToCampaignDb em Scope IN?
8. **@po Score:** X/10 (target: ≥8 dado complexity)

**Feedback Loop:** Se score <8, identificar qual gate falhou (discovery? risk assessment?) e ajustar prompt para próximas HIGH RISK stories.

---

## Lessons Learned (Template para preencher pós-execução)

```
=== STORY 2.4 @sm PROMPT — LEARNINGS ===
Data: YYYY-MM-DD
Executor: @sm / Human

1. Discovery Effectiveness:
   - grep + read foi executado ANTES de draftar? SIM / NÃO
   - Se NÃO: Por que foi pulado?
   - Funções descobertas: X de 6-7 esperadas
   - Problemas identificados: (ex: "usa .parse()", "sem try/catch")

2. Risk Assessment Quality:
   - Riscos HIGH identificados: X
   - Riscos MEDIUM identificados: Y
   - Mitigações foram concretas (não genéricas)? SIM / NÃO
   - Se NÃO: Qual mitigação foi vaga?

3. Error Pattern Clarity:
   - Código de exemplo foi seguido? SIM / NÃO
   - @dev teve dúvidas sobre .safeParse() pattern? SIM / NÃO
   - Se SIM: Qual parte não ficou clara?

4. Zero Breaking Changes Enforcement:
   - @dev tentou mudar assinaturas? SIM / NÃO
   - Fallbacks preservaram comportamento? SIM / NÃO
   - Campanhas existentes continuaram funcionando? SIM / NÃO

5. Test Strategy Execution:
   - Testes usaram dados reais? SIM / NÃO
   - Se NÃO: Por que dados sintéticos foram usados?
   - Testes cobriram campos opcionais ausentes? SIM / NÃO

6. Write Mapper Creation:
   - mapDomainToCampaignDb() foi criado? SIM / NÃO
   - Se NÃO: Por que foi esquecido?

7. Time to Complete:
   - Tempo real (@sm story creation): X minutos
   - Tempo real (@dev implementation): Y horas
   - Comparado com estimativa (3-4h para @dev): DENTRO / ACIMA / ABAIXO

8. @po Score:
   - Score final: X/10
   - Se <8: Quais itens da checklist falharam?

9. Improvements for Next HIGH RISK Story:
   - O que funcionou bem e deve ser mantido?
   - O que deve ser melhorado no próximo HIGH RISK refactoring story?
```

---

## Next Stories Reusability

Este prompt pattern (discovery + risk assessment + error example + zero breaking changes) é reutilizável em:

- **Stories futuras de refactoring** em código de produção
- **Stories HIGH RISK** com volume alto de uso
- **Stories com error handling** complexo (validação Zod, try/catch, fallbacks)

**Recommendation:** Manter este prompt como template base em `.aiox-core/development/templates/high-risk-refactoring-story-tmpl.md` após validação.

---

## Comparison: LOW/MEDIUM vs HIGH RISK Stories

| Aspect | LOW/MEDIUM (Stories 2.1-2.3) | HIGH RISK (Story 2.4) |
|--------|------------------------------|----------------------|
| Discovery | Optional (API routes) | MANDATORY (mapper functions) |
| Risk Assessment | 2-3 riscos genéricos | 4+ riscos com HIGH/MEDIUM tags |
| Code Example | Implementation (260 lines) | Pattern (15 lines) |
| Breaking Changes | Not critical | ZERO tolerance |
| Test Strategy | Synthetic OK | Real data REQUIRED |
| Prompt Tokens | 1000-1200 | 1390 (+16-39%) |
| @po Target Score | ≥7/10 | ≥8/10 (higher bar) |

**Key Insight:** HIGH RISK stories precisam de prompts +16-39% maiores, mas investimento é justificado por criticidade do código.

---

**END OF ANALYSIS**
