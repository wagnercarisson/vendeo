# Analysis — Story 2.5 (@sm Package)

## Prompt Design Decisions

### 1. Mandatory Discovery with Conflict Detection

**Why:**
- Story 2.5 é sobre consolidar 2 arquivos existentes — precisa descobrir estado atual ANTES de draftar
- Conflitos não são óbvios (hasAnyVisualAsset existe nos 2 arquivos com lógicas diferentes)
- Discovery force grep + read + conflict table — previne AC incorretos

**Discovery workflow:**
```
Step 1: grep export → lista funções
Step 2: read selectors.ts → entende funções existentes
Step 3: read logic.ts → detecta duplicatas/divergências
Step 4: create conflict table → força decisões explícitas
```

**Alternative considered:** Listar funções no prompt (sem discovery)  
**Rejected because:** Requirements podem estar desatualizados — discovery garante estado real

### 2. Conflict Resolution Table (Before AC)

**Why:**
- 4 conflitos detectados: hasAnyVisualAsset, getCampaignDisplayStatuses, getContentState vs getUIStatus, calculateGlobalStatus vs getGlobalStatus
- Decisões devem vir ANTES de escrever AC — AC reflete decisões
- Tabela força @sm a documentar: Opção A vs Opção B → Decisão → Rationale

**Pattern:**
| Conflito | logic.ts | selectors.ts | Decisão | Rationale |
|----------|----------|--------------|---------|-----------|
| hasAnyVisualAsset | Campos | Status | Manter ambas (rename logic) | Semânticas diferentes |

**Alternative considered:** Resolver conflitos durante implementação (@dev decide)  
**Rejected because:** Decisões devem estar na story (não inventadas por @dev)

### 3. Deprecation Pattern (Re-exports)

**Why:**
- Backward compatibility — código legado importa de logic.ts
- Re-exports mantêm imports funcionando: `export { funcName } from './selectors'`
- JSDoc @deprecated marca funções para futura remoção

**Code example in prompt:**
```typescript
/** @deprecated Use from './selectors' instead */
export { getCampaignDisplayStatuses } from './selectors';
```

**Alternative considered:** Deletar logic.ts (forçar update de imports)  
**Rejected because:** Breaking change para código legado — contra princípio de zero breaking changes

### 4. CAMPAIGN_FIXTURE Requirement

**Why:**
- Testes de selectors precisam de Campaign completo (40+ campos)
- Mocks sintéticos (`{ id: "123" }`) não testam edge cases (campos null, status "none")
- Fixture completa garante testes realistas

**Fixture fields required:**
- Campos obrigatórios: id, store_id, post_status, reels_status, campaign_type
- Campos AI: image_url, ai_caption, ai_text, ai_generated_at
- Campos Reels: reels_script, reels_hook, reels_generated_at

**Alternative considered:** Mocks mínimos por teste  
**Rejected because:** Código duplicado + difícil manter consistência

### 5. 6-Step CoT (Discovery → Conflicts → Cross-Story → AC → Risks → DoD)

**Why:**
- Step 1 (Discovery) deve vir ANTES de AC — precisa saber estado atual
- Step 2 (Conflicts) deve vir ANTES de AC — decisões informam AC
- Step 3 (Cross-Story) contextualiza com Stories 2.1/2.2/2.4
- Steps 4-6 seguem pattern normal (AC → Risks → DoD)

**Alternative considered:** CoT tradicional (começar com User Story)  
**Rejected because:** Discovery e Conflicts são pré-requisitos para AC correto

### 6. Medium Risk Classification

**Why:**
- Refactoring (não criação) = risco maior que LOW
- Backward compatibility via re-exports = risco menor que HIGH
- 2 arquivos afetados + imports em app/components = escopo médio

**Complexity Score:**
- Scope: 2 arquivos principais + imports (6/20)
- Integration: Funções puras, sem APIs (2/20)
- Infrastructure: Nenhuma (0/20)
- Knowledge: Entender duplicatas e divergências (10/20)
- Risk: Re-exports reduzem risco (8/20)
- **Total: 26/100 → MEDIUM (10-15 faixa)**

### 7. File List Restriction (4 arquivos)

**Why:**
- Scope bem definido: selectors.ts (add), logic.ts (deprecate), selectors.test.ts (create), types.ts (read)
- Atualizar imports em app/components/lib está OUT OF SCOPE (Story 2.5 apenas drafta, @dev implementa)

**Anti-pattern blocked:** File List com 10+ arquivos (app/**/*.tsx) — escopo inflacionado

---

## Token Economy

| Component | Tokens | Justification |
|-----------|--------|---------------|
| **Analysis** (este arquivo) | ~700 | 7 decisões de design |
| **Testing Strategy** | ~950 | 5 test suites × ~190 tokens cada |
| **Main Prompt** | ~1200 | Discovery (400) + Conflicts (250) + CoT (550) |
| **TOTAL @sm Package** | ~2850 | MEDIUM RISK refactoring |

**Comparison:**
- Story 2.2 @sm package: ~2800 tokens (MEDIUM RISK creation)
- Story 2.3 @sm package: ~2700 tokens (MEDIUM RISK creation)
- Story 2.4 @sm package: ~3900 tokens (HIGH RISK refactoring)
- Story 2.5 @sm package: **~2850 tokens** (MEDIUM RISK refactoring)

**Pattern:** MEDIUM RISK ~2700-2850 tokens, HIGH RISK ~3900 tokens (+37%)

---

## Cross-Story Dependencies

| Story | Dependency Type | Impact on 2.5 |
|-------|----------------|---------------|
| 2.1 (Schemas) | Type dependency | CampaignStatusSchema define statuses usados por getGlobalStatus |
| 2.2 (Types) | Type dependency | Campaign type tem 40+ campos acessados por selectors |
| 2.4 (Mappers) | Pattern dependency | Mappers usam `.safeParse()`, selectors são pure functions (sem validação) |

---

## Risk Coverage

| Risk (from Story 2.5) | Mitigation in @sm Prompt |
|----------------------|---------------------------|
| Lógicas divergentes entre duplicatas | Conflict table + 4 decisões explícitas (hasAnyVisualAsset rename, etc.) |
| Quebra de imports legados | Deprecation pattern com re-exports (backward compatibility) |
| Testes insuficientes | Testing strategy com 20+ tests, CAMPAIGN_FIXTURE obrigatória |
| Confusão sobre qual função usar | JSDoc @example em TODAS as funções, Dev Notes com 3 code examples |

---

## Model Recommendation

**Claude Sonnet 4.6 (1x):**
- Complex decision-making: 4 conflitos a resolver (tabela de decisões)
- Refactoring patterns: Deprecation com re-exports
- Discovery workflow: grep → read → analyze → decide

**GPT-4.5 mini (0.33x) NÃO recomendado:**
- Pode confundir conflitos (hasAnyVisualAsset campo vs status)
- Risco de pular discovery (criar AC sem ler arquivos)

---

## Success Metrics

**Quality Gates:**
- ✅ Discovery executado (4 steps completos)
- ✅ Conflict table com 4 conflitos + decisões
- ✅ Cross-Story Decisions (≥3 referências)
- ✅ AC com 5 cenários Gherkin
- ✅ DoD com 10-12 items
- ✅ Dev Notes com 3 code examples + fixture

**Timeline:**
- Estimated: 45-60min (@sm drafting com discovery)
- Discovery: 15min (grep + read 2 arquivos)
- Conflict resolution: 15min (tabela + 4 decisões)
- AC + DoD: 15-30min

---

## Pattern Evolution (Stories 2.2 → 2.3 → 2.4 → 2.5)

| Story | Risk | Token Count | Key Feature |
|-------|------|-------------|-------------|
| 2.2 | MEDIUM | ~2800 | Type creation (LOW complexity) |
| 2.3 | MEDIUM | ~2700 | API contracts (discriminated unions) |
| 2.4 | HIGH | ~3900 | Mappers refactoring (error handling strategies) |
| 2.5 | MEDIUM | **~2850** | **Selector consolidation (conflict resolution)** |

**Story 2.5 distinctive feature:** Mandatory discovery + conflict table (não presente em 2.2/2.3)

---

**END OF ANALYSIS**
