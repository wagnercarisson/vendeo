# Analysis — Story 2.6 (@dev Package)

## Prompt Design Decisions

### 1. 3 Surgical Changes Only (Zero Scope Creep)

**Why:**
- @po validation confirmed: Story 2.6 closes gap where contracts exist (Story 2.3) but /strategy doesn't use them
- Surgical precision: export schemas → tighten validation → activate endpoint
- ZERO changes to /campaign or /reels (already working)

**3 changes workflow:**
```
schemas.ts → Add export (API expansion only)
contracts.ts → Replace StrategySuggestionSchema with StrategyAIOutputSchema (z.enum direct)
route.ts → Activate safeParse validations (request + AI)
```

**Alternative considered:** Refactor all 3 endpoints for maximum consistency  
**Rejected because:** /campaign and /reels work perfectly — surgical changes reduce risk

---

### 2. z.preprocess Trap (🔴 CRITICAL DISTINCTION)

**Why:**
- CampaignObjectiveSchema uses `z.preprocess()` for **user input normalization** (user types "reconhecimento" → AI receives "awareness")
- StrategyAIOutputSchema must use `z.enum(OBJECTIVE_VALUES)` direct for **AI output validation** (AI must return exact enum)
- Critical test: contracts.test.ts must verify "reconhecimento" is REJECTED (not normalized)

**Critical code distinction:**
```typescript
// ❌ WRONG — Uses preprocessing (for user input, not AI output)
objective: CampaignObjectiveSchema, // Has z.preprocess!

// ✅ CORRECT — Direct enum (for AI output validation)
objective: z.enum(OBJECTIVE_VALUES), // No preprocessing
```

**Alternative considered:** Re-use CampaignObjectiveSchema for consistency  
**Rejected because:** AI output validation must not preprocess (enum validation only)

---

### 3. Production Endpoint Safety (Manual Tests MANDATORY)

**Why:**
- /strategy is used in production dashboard (CampaignCard.tsx, onboarding/)
- Breaking changes can affect live users
- 2 mandatory manual tests BEFORE commit (DoD items 13-14)

**Manual test requirements:**
1. POST /strategy with **actual frontend payload format** (CampaignCard.tsx) → 200
2. POST /strategy with invalid payload → 400 with details

**Alternative considered:** Automated tests only  
**Rejected because:** Production endpoint requires human validation with real payloads before commit

---

### 4. Epic 2 Closure (EXEC-PLAN Update Mandatory)

**Why:**
- Story 2.6 is FINAL story of Epic 2
- DoD item 15: Update EXEC-PLAN-EPIC-2.md to "6/6 stories — 100% complete"
- Closes Epic 2 mission: "Implement contracts & domain architecture to prevent bugs"

**EXEC-PLAN update checklist:**
- Mark Story 2.6 as DONE
- Update Epic 2 Status: "🎉 100% Complete (6/6 stories)"
- Document architecture active in 3 endpoints (/campaign, /reels, /strategy)

**Alternative considered:** Update EXEC-PLAN after QA validation  
**Rejected because:** Epic closure is part of implementation DoD (synchronous with story completion)

---

### 5. Error Response Consistency (400 vs 500)

**Why:**
- Follow /campaign pattern: 400 INVALID_INPUT (user error), 500 AI_INVALID_OUTPUT (AI error)
- requestId in ALL error responses (debugging production issues)
- Consistency across 3 endpoints (/campaign, /reels, /strategy)

**Error pattern:**
```typescript
// 400 — User sent invalid input
{ ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() }

// 500 — AI returned invalid output
{ ok: false, requestId, error: "AI_INVALID_OUTPUT", details: validated.error.flatten() }
```

**Alternative considered:** Generic error messages without details  
**Rejected because:** Frontend needs specific field errors for user feedback

---

### 6. CodeRabbit Self-Healing (Max 2 Iterations)

**Why:**
- CodeRabbit will auto-review for: breaking changes, type safety, enum validation, manual test execution
- Max 2 iterations: Implementation → Review → Fix (if needed)
- If iteration 3 required → escalate to @architect (signals design issue)

**CodeRabbit checks:**
- ✅ Schemas exported without logic changes (no z.preprocess modifications)
- ✅ StrategyAIOutputSchema uses z.enum() direct (NO CampaignObjectiveSchema)
- ✅ route.ts has safeParse() with correct error codes (400, 500)
- ✅ Manual tests documented (POST válido, inválido)
- ✅ EXEC-PLAN updated (Epic 2 100%)

**Alternative considered:** Manual code review only  
**Rejected because:** CodeRabbit catches breaking changes faster (e.g., type mismatches, missing exports)

---

## Token Economy

| Component | Tokens | Justification |
|-----------|--------|---------------|
| **Main Prompt** | ~4800 | 3 surgical changes (export, validation, activation), z.preprocess trap explanation, 6-step implementation guide, 2 manual tests, Epic closure |
| **Testing Strategy** | ~1400 | 7 test suites (32 test cases: 30 automated + 2 manual), regression prevention |
| **Analysis** (este arquivo) | ~900 | 6 design decisions, token economy, cross-story dependencies, risk coverage |
| **Package Summary** | ~1200 | Quick reference, 3 surgical changes table, manual test commands, Epic 2 progress |
| **TOTAL @dev Package** | ~8300 | HIGH RISK implementation + Epic closure |

**Comparison:**
- Story 2.1 @dev package: ~4500 tokens (LOW RISK creation)
- Story 2.2 @dev package: ~5200 tokens (MEDIUM RISK consolidation)
- Story 2.3 @dev package: ~5800 tokens (MEDIUM RISK contracts)
- Story 2.4 @dev package: ~7800 tokens (HIGH RISK refactoring)
- Story 2.5 @dev package: ~6900 tokens (HIGH RISK conflict resolution)
- Story 2.6 @dev package: **~8300 tokens** (HIGH RISK integration + Epic closure, +6% vs 2.4)

**Why ~8300 tokens (highest in Epic 2)?**
- HIGH RISK production endpoint (manual tests mandatory)
- z.preprocess trap (critical distinction requires extensive explanation)
- Epic 2 closure (EXEC-PLAN update + architecture documentation)
- 3 surgical changes (export + validation + activation) with precision requirements
- 32 test cases (30 automated + 2 manual) for production safety

**Efficiency vs Story 2.4:**
- +6% token count (~500 tokens more)
- Higher complexity (production endpoint + Epic closure vs mapper refactoring)
- More manual tests (2 mandatory vs implicit in 2.4)

---

## Cross-Story Dependencies

| Story | Dependency Type | Impact on 2.6 |
|-------|----------------|---------------|
| 2.1 (Schemas) | Schema export dependency | Story 2.6 exports 3 schemas (API expansion) |
| 2.2 (Types) | Type re-use | Story 2.6 uses ContentTypeSchema in CampaignStrategyRequestSchema |
| 2.3 (Contracts) | Contract activation | Story 2.6 activates CampaignStrategyRequestSchema in endpoint |
| 2.4 (Mappers) | Error pattern dependency | Story 2.6 follows 400/500 error codes |
| 2.5 (Selectors) | Validation chain | Story 2.6 ensures selectors receive validated data (end-to-end architecture) |

---

## Risk Coverage

| Risk (from @po validation) | Mitigation in @dev Prompt |
|---------------------------|---------------------------|
| 🔴 ALTO #1: Production endpoint quebrar | 2 mandatory manual tests (DoD items 13-14) with frontend payload format |
| 🔴 ALTO #2: z.preprocess trap | Extensive explanation + critical test (contracts.test.ts verifies "reconhecimento" REJECTS) |
| 🟡 MÉDIO #3: Tipos não matcharem constantes | Import OBJECTIVE_VALUES direct from schemas.ts, TypeScript typecheck validation |
| 🟢 BAIXO #4: Regressão em outros endpoints | OUT OF SCOPE explicit (Story 2.6 doesn't touch /campaign or /reels), Test Suite 7 for regression |

---

## Model Recommendation

**Claude Sonnet 4.6 (1x):**
- HIGH RISK production endpoint
- Complex z.preprocess vs z.enum direct distinction (critical for AI output validation)
- Manual tests require understanding of frontend payload format
- Epic closure requires comprehensive EXEC-PLAN update

**GPT-4.5 mini (0.33x) NÃO recomendado:**
- May confuse z.preprocess (user input) with z.enum direct (AI output)
- Risk of skipping manual tests (production endpoint safety)
- Risk of incomplete EXEC-PLAN update (Epic closure incomplete)

---

## Success Metrics

**Quality Gates:**
- ✅ schemas.ts: 3 schemas exportados (+ AUDIENCE_VALUES, POSITIONING_VALUES) — zero logic changes
- ✅ contracts.ts: StrategyAIOutputSchema com z.enum() direct (NO preprocess)
- ✅ route.ts: Request validation (400) + AI response validation (500) + requestId
- ✅ contracts.test.ts: 4-6 tests including "reconhecimento" reject (CRITICAL)
- ✅ Typecheck passa: `npx tsc --noEmit`
- ✅ Manual test 1: POST válido → 200 (frontend payload)
- ✅ Manual test 2: POST inválido → 400 with details
- ✅ EXEC-PLAN-EPIC-2.md: Epic 2 100% complete, architecture active in 3 endpoints

**Timeline:**
- Estimated: 3-4h (HIGH RISK implementation + manual tests)
- Change #1 (Export schemas): 15min
- Change #2 (Tighten validation): 30min
- Change #3 (Activate endpoint): 45min
- Create tests: 30-45min
- Execute manual tests: 30min
- Update EXEC-PLAN: 15min
- Commit + report to @qa: 15min

**Next Steps:**
1. @dev executes `dev-story-2.6.prompt.md` (Interactive mode recommended)
2. Implements 3 surgical changes with precision
3. Executes 2 mandatory manual tests BEFORE commit
4. Updates EXEC-PLAN-EPIC-2.md (Epic 2 100%)
5. Commits with message: `feat: activate validation in strategy endpoint [Story 2.6]`
6. Reports to @qa for QA Gate validation

---

## Pattern Evolution (Stories 2.1 → 2.6)

| Story | Risk | Token Count | Key Feature |
|-------|------|-------------|-------------|
| 2.1 @dev | LOW | ~4500 | Schema creation (foundation) |
| 2.2 @dev | MEDIUM | ~5200 | Type consolidation |
| 2.3 @dev | MEDIUM | ~5800 | API contracts |
| 2.4 @dev | HIGH | ~7800 | Mapper refactoring (6 etapas) |
| 2.5 @dev | HIGH | ~6900 | Selector consolidation (conflict resolution) |
| 2.6 @dev | HIGH | **~8300** | **Integration (3 surgical changes + Epic closure)** |

**Story 2.6 distinctive features:**
- 3 surgical changes (export → validation → activation)
- z.preprocess trap (critical distinction: user input vs AI output)
- 2 mandatory manual tests (production endpoint safety)
- Epic 2 closure (EXEC-PLAN update mandatory)
- 32 test cases (30 automated + 2 manual)

---

## CodeRabbit Self-Healing Expectations

**Auto-review will check:**
1. schemas.ts: 3 schemas exported, ZERO logic changes (z.preprocess preserved)
2. contracts.ts: StrategyAIOutputSchema uses z.enum(OBJECTIVE_VALUES) direct (NO CampaignObjectiveSchema)
3. route.ts: safeParse() for request (400 INVALID_INPUT) + AI response (500 AI_INVALID_OUTPUT)
4. route.ts: requestId present in ALL error responses (400, 500)
5. contracts.test.ts: Test includes "reconhecimento" reject (CRITICAL — no preprocessing)
6. EXEC-PLAN-EPIC-2.md: Epic 2 marked 100% complete

**Max 2 iterations:**
- Iteration 1: @dev implements 3 surgical changes
- CodeRabbit review: Type mismatches, missing exports, preprocessing errors detected
- Iteration 2: @dev fixes issues (if any)
- If iteration 3 necessary → escalate to @architect (signals design problem)

---

## Epic 2 Completion Impact

**Before Story 2.6:**
- Epic 2 progress: 83% (5/6 stories)
- Architecture active in 2 endpoints: /campaign, /reels
- /strategy uses raw input/output (no validation)

**After Story 2.6:**
- Epic 2 progress: **100% (6/6 stories)** 🎉
- Architecture active in **3 endpoints**: /campaign, /reels, /strategy
- End-to-end validation chain: Request → AI → Response (all 3 endpoints)
- Epic 2 mission accomplished: "Implement contracts & domain architecture to prevent bugs"

**Next Epic:**
- Epic 3 (TBD): Visual Composition Engine or Weekly Plan intelligence
- Foundation ready: Domain architecture validated in production

---

**END OF ANALYSIS**
