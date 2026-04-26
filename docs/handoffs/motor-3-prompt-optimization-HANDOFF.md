# Motor 3 Prompt Optimization — Handoff to @prompt-eng

**From:** @aiox-master (Orion)  
**To:** @prompt-eng (Wordsmith)  
**Date:** 2026-04-25  
**Priority:** 🔴 HIGH  
**Type:** Prompt Optimization (Performance + Quality)  

---

## 📋 Context

**Current Situation:**
- Motor 3 (Visual Composer) has **75% timeout rate** in production (3/4 tests)
- Timeout limit: 25 seconds
- Average response time: 22.8s (borderline failure)
- GPT-5.4 model is correct, but prompt complexity is the bottleneck

**Root Cause Analysis:**
Investigation revealed that:
- ✅ Schema changes (Story 4.5.2) are correct — NOT the issue
- ✅ Image format (PNG vs WEBP) is irrelevant
- ✅ Input data (targetOccupancy, etc.) is irrelevant
- ❌ **Prompt is too complex** — causing GPT to "think" 25+ seconds

**Comparison with Motor 1:**
| Metric | Motor 1 (Visual Reader) | Motor 3 (Visual Composer) |
|--------|-------------------------|---------------------------|
| Model | GPT-5.4 | GPT-5.4 (same) |
| Task | Analyze image (native) | Generate structured JSON (complex reasoning) |
| Response Time | 3-4s ✅ | 25s+ ❌ |
| Success Rate | 100% | 0% (75% timeout) |

---

## 🎯 Objective

**Refactor Motor 3 prompt to achieve:**
1. **Performance:** Reduce response time from 25s → **10-15s** (target: <15s)
2. **Quality:** Maintain or improve composition quality (4 distinct, valid variations)
3. **Reliability:** Achieve 95%+ success rate (no timeouts)

**Success Criteria:**
- ✅ 5+ production tests with **0 timeouts**
- ✅ Response time consistently **<15s**
- ✅ Output quality validated by @qa (distinctness, correctness, aesthetics)
- ✅ Schema compliance maintained (CompositionVariantsSchema)

---

## 🔍 Current Prompt Analysis

### File Location
- **System Prompt:** `lib/ai/visual-composer/prompts.ts` → `VISUAL_COMPOSER_SYSTEM_PROMPT`
- **User Prompt:** `lib/ai/visual-composer/prompts.ts` → `buildVisualComposerUserPrompt()`

### Current Structure
```
System Prompt (~1400 tokens):
├── role
├── objective
├── core_rules (6 rules)
├── input_contract
├── layout_priority (6-step decision tree)
├── direction_rules (5 direction types)
├── safety_rules (3 constraints)
├── target_box_rules
├── typography_rules (8 rules)
├── decorative_rules (3 rules)
├── excluded_fields (4 exclusions)
├── distinctness_rules
├── output_contract (complex nested structure)
├── few_shot_guidance (6 abstract cases — NO concrete JSON examples)
└── output_format

User Prompt (~300 tokens):
├── instruction: "Generate exactly 4 valid layout variations..."
├── instruction: "Return only one valid CompositionVariants JSON object."
├── instruction: "Include useful typography fields..."
├── instruction: "Do not include noise fields..."
└── payload: JSON.stringify(payload, null, 2)
```

**Total Prompt Size:** ~1700 tokens

### Identified Bottlenecks

#### 1. **Overconstrained Output Contract** (HIGHEST IMPACT)
**Problem:** GPT must generate ~200+ fields (50+ per variation × 4)

Current output per variation:
```typescript
{
  id: string (UUID)
  seed: string
  layout: {
    productArea: { x, y, width, height }
    textArea: { x, y, width, height }
    priceArea: { x, y, width, height }
    badgeArea: { x, y, width, height } | null
  }
  hierarchy: {
    productEmphasis: number (0-100)
    textEmphasis: number (0-100)
    priceEmphasis: number (0-100)
  }
  spacing: {
    margins: { top, right, bottom, left }
    productPadding: number
    textPadding: number
  }
  typography: {
    productName: { fontSize, fontWeight, fontFamily, color, lineHeight }
    tagline: { fontSize, fontWeight, fontFamily, color, lineHeight }
    price: { fontSize, fontWeight, fontFamily, color, lineHeight }
    callToAction: { fontSize, fontWeight, fontFamily, color, lineHeight }
  }
  decorative: {
    storeIdentity: { position, size }
    priceBadge: { style, emphasis } | null
    promotionalTitle: { text, emphasis } | null
  }
}
```

**Recommendation:** Simplify to **essential structural fields only**, move calculations to code.

---

#### 2. **Abstract Few-Shot Guidance** (MEDIUM IMPACT)
**Problem:** 6 abstract text cases instead of concrete JSON examples

Current:
```xml
Case 1: hero + targetBox present -> all 4 layouts keep product dominant while changing product offset and text placement.
Case 2: split-dynamic + target on left -> most textArea placements go right, but ratios vary.
```

**Recommendation:** Replace with 2-3 **real JSON examples** (input → output).

---

#### 3. **Redundant Validation Rules** (LOW-MEDIUM IMPACT)
**Problem:** Constraints that should be code-validated are in prompt

Examples:
- "Every area must fit within the 1080x1350 canvas" → Move to code validation
- "Areas must not overlap" → Move to code validation
- "fontWeight must be 400/600/700/900" → Move to schema coercion

**Recommendation:** Remove validation instructions, handle in post-processing.

---

## 💡 Proposed Optimization Strategy

### Approach 1: Minimal Output Contract (RECOMMENDED)
**Idea:** GPT generates only **layout geometry** (~15 fields per variation)

**Before (50+ fields per variation):**
```json
{ "layout": {...}, "hierarchy": {...}, "spacing": {...}, "typography": {...}, "decorative": {...} }
```

**After (15 fields per variation):**
```json
{
  "layout": {
    "productArea": { "x": 0, "y": 0, "width": 540, "height": 800 },
    "textArea": { "x": 540, "y": 100, "width": 540, "height": 600 },
    "priceArea": { "x": 540, "y": 800, "width": 540, "height": 200 }
  },
  "hierarchy": {
    "productEmphasis": 70,
    "textEmphasis": 50,
    "priceEmphasis": 80
  }
}
```

**Motor 4 calculates:** spacing, typography (from hierarchy + direction), decorative (from campaign context)

**Estimated gain:** 40-60% time reduction (25s → 10-15s)

---

### Approach 2: Concrete Few-Shot Examples
**Add 2-3 real examples:**

```xml
<example_1>
<input>
{
  "image": { "targetBox": { "x": 0.3, "y": 0.1, "width": 0.4, "height": 0.8 }, "targetOccupancy": "medium" },
  "direction": { "directionType": "hero", "mood": "aggressive", "priceEmphasis": "high" }
}
</input>
<output>
{
  "variations": [
    { "layout": { "productArea": {...}, "textArea": {...}, "priceArea": {...} }, "hierarchy": {...} },
    { "layout": { "productArea": {...}, "textArea": {...}, "priceArea": {...} }, "hierarchy": {...} },
    { "layout": { "productArea": {...}, "textArea": {...}, "priceArea": {...} }, "hierarchy": {...} },
    { "layout": { "productArea": {...}, "textArea": {...}, "priceArea": {...} }, "hierarchy": {...} }
  ]
}
</output>
</example_1>
```

**Estimated gain:** 20-30% time reduction (25s → 17-20s)

---

### Approach 3: Remove Redundant Constraints
Move validation from prompt to code:

**Remove from prompt:**
- Canvas bounds checking
- Overlap validation
- fontWeight enum validation
- Optional field presence rules

**Add to code (post-GPT):**
```typescript
// Validate bounds
if (area.x + area.width > 1080) { /* clamp or reject */ }

// Validate overlap (if not overlay)
if (direction.textDistribution !== 'overlay') {
  validateNoOverlap(productArea, textArea, priceArea);
}
```

**Estimated gain:** 10-15% time reduction (25s → 21-23s)

---

## 📋 Deliverables

**What @prompt-eng should provide:**

### 1. **Optimized System Prompt**
- File: `lib/ai/visual-composer/prompts.ts` (updated `VISUAL_COMPOSER_SYSTEM_PROMPT`)
- Target size: 800-1000 tokens (down from 1400)
- Simplified output contract (Approach 1)
- 2-3 concrete JSON examples (Approach 2)
- Removed redundant validation (Approach 3)

### 2. **Optimized User Prompt**
- File: `lib/ai/visual-composer/prompts.ts` (updated `buildVisualComposerUserPrompt()`)
- Cleaner instructions
- Maintained payload structure

### 3. **Migration Guide**
- Document: `docs/architecture/motor-3-prompt-v2-migration.md`
- What changed and why
- Impact on Motor 4 (if Approach 1 → Motor 4 must calculate spacing/typography/decorative)
- Backward compatibility notes

### 4. **Test Cases**
- File: `tests/visual-composer/prompt-v2.test.ts`
- T1: Verify output schema compliance
- T2: Verify 4 variations generated
- T3: Verify distinctness maintained
- T4: Verify response time <15s (5 runs)
- T5: Verify quality (human validation by @qa)

### 5. **Performance Benchmarks**
- Document: `docs/analysis/motor-3-prompt-v2-benchmarks.md`
- Before vs After response times (10+ tests)
- Success rate improvement
- Quality assessment

---

## 🔗 Dependencies

**Blocked By:**
- None (can start immediately)

**Blocks:**
- Story 4.5.4 (GPT Reliability) — will incorporate prompt optimization
- Story 4.5.3 (Motor 4 Rendering) — may need updates if Approach 1 chosen

**Parallel Work:**
- @dev can prepare Motor 4 updates (if Approach 1) while prompt is being optimized

---

## 📊 Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Response Time | 22.8s avg | <15s avg | 10+ production tests |
| Timeout Rate | 75% | <5% | 20+ production tests |
| Success Rate | 25% | >95% | 20+ production tests |
| Distinctness | Unknown | >80% | @qa validation (4 variations distinct) |
| Schema Compliance | 100% | 100% | Automated tests |
| Prompt Size | ~1700 tokens | <1200 tokens | Token counter |

---

## 🚀 Execution Plan

### Phase 1: Analysis (Wordsmith — 1h)
1. Read current prompt (`lib/ai/visual-composer/prompts.ts`)
2. Review Motor 3 service (`lib/ai/visual-composer/service.ts`)
3. Review output schema (`lib/ai/visual-composer/contracts.ts`)
4. Review Motor 4 dependencies (`lib/ai/renderer/canvas.ts`, `text.ts`)
5. Decide which approaches to combine (1, 2, 3, or all)

### Phase 2: Draft Optimization (Wordsmith — 2h)
1. Write optimized system prompt (v2)
2. Write 2-3 concrete JSON examples
3. Update user prompt builder
4. Document changes in migration guide

### Phase 3: Review & Adjust (Wordsmith + @aiox-master — 1h)
1. Share draft with @aiox-master
2. Discuss trade-offs (simplicity vs control)
3. Finalize approach
4. Get @architect approval if Motor 4 changes needed

### Phase 4: Implementation (@dev — 2h)
1. Update prompts.ts
2. Update Motor 4 if needed (Approach 1)
3. Add test cases
4. Run local validation

### Phase 5: Production Validation (@qa + @aiox-master — 1h)
1. Deploy to production
2. Run 10+ campaign tests
3. Measure response times
4. Validate quality (distinctness, aesthetics)
5. Compare before/after metrics

### Phase 6: Approval & Merge (@devops — 15min)
1. @qa approves quality
2. @aiox-master approves metrics
3. @devops pushes to remote

**Total Estimated Time:** 7-8 hours  
**Critical Path:** Wordsmith analysis → draft → @dev implementation → @qa validation

---

## 📎 Attachments

**Referenced Files:**
1. Current prompt: `lib/ai/visual-composer/prompts.ts`
2. Service implementation: `lib/ai/visual-composer/service.ts`
3. Schema: `lib/ai/visual-composer/contracts.ts`
4. Motor 4 renderer: `lib/ai/renderer/canvas.ts`, `lib/ai/renderer/text.ts`
5. Timeout analysis: `docs/analysis/motor-3-gpt-timeout-analysis.md`
6. Story 4.5.2: `docs/stories/4.5.2.story.md`

**Test Results (4 Production Tests):**
- Test 1: Coca-Cola 600ml PNG → 25165ms timeout
- Test 2: Schin 350ml WEBP → 16019ms validation fail
- Test 3: Schin 350ml WEBP → 25041ms timeout
- Test 4: Coca-Cola 600ml PNG → 25031ms timeout

**Key Insight:** Same inputs produce different results (timeout vs validation fail), indicating GPT is struggling with task complexity, not input quality.

---

## 💬 Notes

**Why Not Just Increase Timeout?**
- Timeout increase (25s → 45s) would mask the problem, not solve it
- User experience still poor (30+ second wait times)
- Root cause (prompt complexity) remains

**Why Not Switch Models?**
- GPT-5.4 is faster and more capable than GPT-4.1
- Motor 1 uses GPT-5.4 successfully (3-4s)
- Problem is task complexity, not model capability

**Why Delegate to @prompt-eng?**
- Prompt engineering requires specialized expertise
- Balancing instructions vs model freedom is non-trivial
- Wordsmith has experience optimizing prompts for performance

**Risk Mitigation:**
- Keep fallback mechanism (already works)
- Test thoroughly before production deployment
- Maintain backward compatibility with schema
- Document all changes for rollback if needed

---

## ✅ Approval Required

**Before starting implementation:**
- [ ] @prompt-eng (Wordsmith) confirms handoff received
- [ ] @prompt-eng agrees with proposed approaches (1, 2, 3)
- [ ] @architect confirms Motor 4 impact acceptable (if Approach 1)
- [ ] @aiox-master confirms success metrics realistic

**After draft ready:**
- [ ] @aiox-master reviews optimized prompt
- [ ] @architect reviews if Motor 4 changes needed
- [ ] @dev confirms implementation feasible

**After implementation:**
- [ ] @qa validates quality maintained
- [ ] @aiox-master validates metrics achieved
- [ ] @devops pushes to remote

---

**Status:** 🟡 PENDING — Awaiting @prompt-eng response  
**Next Action:** @prompt-eng (Wordsmith) begins Phase 1 (Analysis)  
**Estimated Completion:** 2026-04-25 EOD or 2026-04-26

---

**Prepared by:** @aiox-master (Orion)  
**Date:** 2026-04-25  
**Related:** Story 4.5.2 (DONE), Story 4.5.4 (DRAFT — will incorporate this work)
