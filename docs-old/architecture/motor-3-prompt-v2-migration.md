# Motor 3 Prompt V2 — Migration Guide

**Version:** V2 (April 2026)  
**Author:** @prompt-eng (Wordsmith)  
**Target:** GPT-5.4 performance optimization  
**Goal:** Reduce response time from 25s to <15s while maintaining quality  

---

## 🎯 Executive Summary

Motor 3 (Visual Composer) was experiencing **75% timeout rate** in production due to prompt complexity. This migration introduces **Prompt V2**, a streamlined version that:

- ✅ Reduces prompt size from ~1700 tokens to ~1200 tokens (29% reduction)
- ✅ Adds 2 concrete JSON examples for few-shot learning
- ✅ Removes redundant validation rules (moved to code)
- ✅ Maintains 100% schema compatibility (no Motor 4 changes needed)

**Expected Impact:**
- Response time: 25s → 10-15s (40-60% improvement)
- Timeout rate: 75% → <5%
- Success rate: 25% → >95%

---

## 📋 What Changed

### 1. **Simplified Instructions** (HIGH IMPACT)

**Before (V1):**
```xml
<core_rules>
Use only the provided structured input.
Do not invent missing fields.
Return JSON only.
No markdown. No commentary. No comments.
Return exactly 4 variations.
All coordinates are absolute pixels in a 1080x1350 canvas.
</core_rules>

<safety_rules>
Every area must fit within the 1080x1350 canvas.
If direction.textDistribution is not overlay, productArea, textArea, and priceArea must not overlap.
badgeArea is optional and only allowed when campaign.price exists.
</safety_rules>

<target_box_rules>
If image.targetBox exists, convert normalized coordinates into absolute pixels and use them as the base reference for productArea.
If image.targetBox is null, center productArea conservatively and keep all 4 outputs valid.
</target_box_rules>
```

**After (V2):**
```xml
<objective>
Return one JSON object of type CompositionVariants with exactly 4 variations.
Use only provided inputs. No markdown, no commentary.
</objective>

<layout_strategy>
targetBox handling:
• If present: convert normalized coords to absolute pixels, use as productArea base
• If null: center productArea conservatively
</layout_strategy>
```

**Rationale:**
- Redundant validation rules moved to code (bounds checking, overlap detection)
- Merged repetitive instructions into single concise blocks
- GPT spends less time "validating" and more time generating

---

### 2. **Concrete Few-Shot Examples** (MEDIUM-HIGH IMPACT)

**Before (V1):**
```xml
<few_shot_guidance>
Case 1: hero + targetBox present -> all 4 layouts keep product dominant while changing product offset and text placement.
Case 2: split-dynamic + target on left -> most textArea placements go right, but ratios vary.
Case 3: overlay + complex scene -> text overlap is allowed, but bounds still apply.
Case 4: targetBox null -> keep product centered and stable, do not hallucinate precise placement.
Case 5: price null -> priceBadge must be null.
Case 6: priceEmphasis high -> price typography cannot be smaller than productName typography.
</few_shot_guidance>
```

**After (V2):**
```xml
<examples>
<example_1>
<input>
{
  "image": { "targetBox": { "x": 0.2, "y": 0.1, "width": 0.6, "height": 0.7 }, "targetOccupancy": "high" },
  "direction": { "directionType": "hero", "mood": "aggressive", "priceEmphasis": "high" },
  "campaign": { "product_name": "Coca-Cola 600ml", "price": 4.99, "objective": "conversion" }
}
</input>
<output>
{
  "direction": {...},
  "variations": [
    { "id": "...", "seed": "...", "layout": {...}, "hierarchy": {...}, "spacing": {...}, "typography": {...}, "decorative": {...} },
    { ... } // 4 total
  ],
  "canvas": { "width": 1080, "height": 1350 },
  "generated_at": "2026-04-25T10:00:00.000Z"
}
</output>
</example_1>

<example_2>
<input>
{
  "image": { "targetBox": null, "targetOccupancy": "medium" },
  "direction": { "directionType": "split-dynamic", "mood": "premium", "priceEmphasis": "medium" },
  "campaign": { "product_name": "Whisky Premium 750ml", "price": null, "objective": "awareness" }
}
</input>
<output>
{ ... } // Full valid JSON
</output>
</example_2>
</examples>
```

**Rationale:**
- GPT learns output structure faster from concrete examples vs abstract descriptions
- Examples demonstrate edge cases: targetBox=null, price=null, different directions
- Reduces "guessing" time for GPT

---

### 3. **Optimized Language** (LOW-MEDIUM IMPACT)

**Before (V1):**
```xml
<typography_rules>
If direction.priceEmphasis is high, typography.price.fontSize must be greater than or equal to typography.productName.fontSize.
premium mood favors lighter weights and calmer spacing.
aggressive mood favors heavier weights and tighter spacing.
Always include fontFamily in typography objects when choosing a font.
Always include color in typography objects using #RRGGBB hex format.
Always include lineHeight in typography objects using a value between 1.0 and 1.6 when text spans multiple lines.
fontWeight may be returned as a number or string token, but it must represent one of 400, 600, 700, or 900.
</typography_rules>
```

**After (V2):**
```xml
<typography>
• priceEmphasis=high → price.fontSize >= productName.fontSize
• premium mood → lighter weights (400-600), calm spacing
• aggressive mood → heavier weights (700-900), tight spacing
• Always include: fontFamily, color (#RRGGBB), lineHeight (1.0-1.6)
• fontWeight: 400, 600, 700, or 900
</typography>
```

**Rationale:**
- Bullet format → faster parsing
- Reduced verbosity without losing clarity
- Imperative syntax ("→") is clearer than conditional ("if...then")

---

### 4. **Removed Redundant Sections** (LOW-MEDIUM IMPACT)

**Removed Sections:**
- `<excluded_fields>` — GPT ignores unknown fields by default
- `<input_contract>` — Redundant with `<input>` section
- `<output_format>` — Already covered in `<output>` section

**Rationale:**
- These sections don't change GPT behavior significantly
- Contribute to token bloat
- Modern GPT models are trained to output structured JSON correctly

---

## 🔧 Implementation Changes

### File Changes

| File | Change Type | Details |
|------|------------|---------|
| `lib/ai/visual-composer/prompts-v2.ts` | **NEW** | V2 prompt + user prompt builder |
| `lib/ai/visual-composer/service.ts` | **MODIFY** | Import prompts-v2 instead of prompts |
| `lib/ai/visual-composer/validation.ts` | **NEW** | Add post-GPT validation (bounds, overlaps) |

### Code Changes Required

#### 1. Service Update (service.ts)

**Before:**
```typescript
import {
  buildVisualComposerUserPrompt,
  VISUAL_COMPOSER_SYSTEM_PROMPT,
} from "./prompts";
```

**After:**
```typescript
import {
  buildVisualComposerUserPromptV2,
  VISUAL_COMPOSER_SYSTEM_PROMPT_V2,
} from "./prompts-v2";
```

**Usage:**
```typescript
const raw = await callAI(
  [
    { role: "system", content: VISUAL_COMPOSER_SYSTEM_PROMPT_V2 },
    {
      role: "user",
      content: buildVisualComposerUserPromptV2(
        buildVisualComposerPayload(validatedInput.data)
      ),
    },
  ],
  {
    model: "gpt-5.4",
    temperature: 0.4,
    timeoutMs: 25000, // Can reduce to 20000 after validation
  }
);
```

#### 2. Post-GPT Validation (NEW: validation.ts)

Add validation functions that were previously in the prompt:

```typescript
/**
 * Validate that all areas fit within canvas bounds.
 * Clamps values if they exceed bounds.
 */
export function validateBounds(
  area: PixelArea,
  canvas: { width: number; height: number }
): PixelArea {
  return {
    x: Math.max(0, Math.min(area.x, canvas.width - area.width)),
    y: Math.max(0, Math.min(area.y, canvas.height - area.height)),
    width: Math.min(area.width, canvas.width - area.x),
    height: Math.min(area.height, canvas.height - area.y),
  };
}

/**
 * Validate that areas do not overlap (if textDistribution !== 'overlay').
 * Returns true if no overlap detected.
 */
export function validateNoOverlap(
  productArea: PixelArea,
  textArea: PixelArea,
  priceArea: PixelArea
): boolean {
  const overlaps = (a: PixelArea, b: PixelArea) =>
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;

  return (
    !overlaps(productArea, textArea) &&
    !overlaps(productArea, priceArea) &&
    !overlaps(textArea, priceArea)
  );
}

/**
 * Validate priceBadge presence based on campaign.price.
 */
export function validatePriceBadge(
  spec: CompositionSpec,
  campaign: CampaignComposerData
): boolean {
  if (campaign.price === null && spec.decorative.priceBadge !== null) {
    return false; // Should not have badge when price is null
  }
  return true;
}
```

**Integration in service.ts:**
```typescript
// After parsing, before return
if (safe.success) {
  safe.data.variations = safe.data.variations.map((variation) => ({
    ...variation,
    layout: {
      productArea: validateBounds(variation.layout.productArea, VISUAL_COMPOSER_CANVAS),
      textArea: validateBounds(variation.layout.textArea, VISUAL_COMPOSER_CANVAS),
      priceArea: validateBounds(variation.layout.priceArea, VISUAL_COMPOSER_CANVAS),
      badgeArea: variation.layout.badgeArea
        ? validateBounds(variation.layout.badgeArea, VISUAL_COMPOSER_CANVAS)
        : undefined,
    },
  }));

  // Validate no overlap (if not overlay)
  if (validatedInput.data.direction.textDistribution !== "overlay") {
    const allValid = safe.data.variations.every((v) =>
      validateNoOverlap(v.layout.productArea, v.layout.textArea, v.layout.priceArea)
    );
    if (!allValid) {
      console.warn("[MOTOR-3][OVERLAP] Overlap detected, using fallback");
      return generateFallbackVariations(validatedInput.data);
    }
  }
}
```

---

## 🧪 Testing Strategy

### Phase 1: Local Validation (REQUIRED before production)

1. **Schema Compliance Test**
   ```bash
   npm run test tests/visual-composer/prompt-v2.test.ts
   ```
   
   Validates:
   - Output matches CompositionVariantsSchema
   - All 4 variations generated
   - All required fields present

2. **Response Time Benchmark**
   ```bash
   npm run benchmark:motor3-v2
   ```
   
   Run 10 tests, measure:
   - Average response time
   - Min/max response time
   - Timeout rate

3. **Distinctness Validation**
   ```bash
   npm run test:distinctness
   ```
   
   Validates:
   - 4 variations differ materially (>20% geometric difference)
   - Not just minor spacing tweaks

### Phase 2: Production Validation (REQUIRED for approval)

1. **Run 20+ Real Campaign Tests**
   - Use existing campaign data from database
   - Mix of: hero, split-dynamic, overlay, stacked, frame
   - Mix of: targetBox present/null, price present/null
   - Track: response time, success rate, timeout rate

2. **Quality Validation by @qa**
   - Visual inspection of generated layouts
   - Verify aesthetic quality maintained
   - Verify distinctness between variations
   - Verify no regressions from V1

3. **Metrics Comparison**
   
   | Metric | V1 (Current) | V2 (Target) | V2 (Actual) |
   |--------|-------------|-------------|-------------|
   | Avg Response Time | 22.8s | <15s | ??? |
   | Timeout Rate | 75% | <5% | ??? |
   | Success Rate | 25% | >95% | ??? |
   | Distinctness | Unknown | >80% | ??? |

---

## 🚨 Rollback Plan

If V2 underperforms or causes issues:

1. **Immediate Rollback (1 minute)**
   ```typescript
   // In service.ts
   import {
     buildVisualComposerUserPrompt,      // Restore V1
     VISUAL_COMPOSER_SYSTEM_PROMPT,       // Restore V1
   } from "./prompts";
   ```

2. **Git Revert (if deployed)**
   ```bash
   git revert <commit-hash>
   git push origin feat/motor-3-prompt-v2
   ```

3. **Fallback Mechanism**
   - Existing fallback logic remains unchanged
   - If V2 fails consistently, fallback will trigger automatically

---

## 📊 Success Criteria

**GO Decision (approve V2):**
- ✅ Response time <15s avg (10+ tests)
- ✅ Timeout rate <5% (20+ tests)
- ✅ Schema compliance 100% (automated tests)
- ✅ Distinctness validation passes (@qa approval)
- ✅ No quality regression (@qa approval)

**NO-GO Decision (rollback to V1):**
- ❌ Response time still >20s
- ❌ Timeout rate >10%
- ❌ Schema compliance issues
- ❌ Quality regression detected
- ❌ Distinctness <60%

---

## 🔮 Future Optimizations (Phase 2 - Optional)

If V2 achieves targets but further optimization is desired:

### Approach 1A: Ultra-Minimal Output Contract

**Idea:** GPT generates only **layout + hierarchy** (~15 fields per variation), Motor 4 calculates spacing/typography/decorative.

**Impact:** 40-60% time reduction (potential 10s response time)

**Risk:** Requires Motor 4 refactoring, higher complexity

**Timeline:** 2-3 days implementation + testing

### Approach 1B: Single-Variation + Transform

**Idea:** GPT generates 1 base variation, code applies geometric transforms for 4 variations.

**Impact:** 70-80% time reduction (potential 5-7s response time)

**Risk:** Loss of creative distinctness, may feel "robotic"

**Timeline:** 1-2 days implementation + testing

---

## 📎 References

- **Timeout Analysis:** `docs/analysis/motor-3-gpt-timeout-analysis.md`
- **Story 4.5.2:** `docs/stories/4.5.2.story.md` (schema validation — complete)
- **Story 4.5.4:** `docs/stories/4.5.4.story.md` (GPT reliability — in progress)
- **Handoff Document:** `docs/handoffs/motor-3-prompt-optimization-HANDOFF.md`
- **Current Prompt:** `lib/ai/visual-composer/prompts.ts`
- **V2 Prompt:** `lib/ai/visual-composer/prompts-v2.ts`

---

## ✅ Approval Checklist

- [ ] @prompt-eng completes V2 prompt
- [ ] @dev implements service.ts changes
- [ ] @dev implements validation.ts (post-GPT validation)
- [ ] Local tests pass (schema, response time, distinctness)
- [ ] Production tests complete (20+ campaigns)
- [ ] @qa approves quality (no regression)
- [ ] @aiox-master approves metrics (GO decision)
- [ ] @devops merges to remote
