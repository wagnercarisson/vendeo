# Motor 3 GPT-4.1 Constraint Enhancement — HANDOFF to @prompt-eng

**From:** @aiox-master (Orion)  
**To:** @prompt-eng (Wordsmith)  
**Date:** 2026-04-25  
**Priority:** HIGH  
**Estimated effort:** 30-45 min  

---

## Context

### The Journey So Far

**Story 4.5.2:** Schema sync completed ✅  
**Prompt V2:** Optimization delivered by @prompt-eng (1700→1200 tokens) ✅  
**GPT-5.4 Problem:** 100% timeout rate in production (25s limit) ❌  
**Solution attempted:** Model swap GPT-5.4 → GPT-4.1  

**Result:** GPT-4.1 is FAST (10-15s) but TOO CREATIVE 🎨

---

## Problem Statement

**GPT-4.1 ignores schema constraints** even with explicit examples and warnings.

### Observed Failures (3 tests, 66% success rate)

**Test 1:** ✅ Valid (11.6s)  
**Test 2:** ❌ `promotionalTitle` sent as string instead of object (14.6s)  
**Test 3:** ✅ Valid (10.1s)  

### Previous Failures (Pre-V3)

**Test A:** ❌ `priceBadge.shape = 'starburst'` (not in enum)  
**Test B:** ❌ `priceBadge.shape = 'circle'` (added to enum, now valid)  
**Test C:** ❌ `storeIdentity` with extra fields: `fontFamily`, `fontWeight`, `color`  
**Test D:** ❌ `generated_at` missing (fixed by making optional)  

---

## Current Prompt V3 Issues

**File:** `lib/ai/visual-composer/prompts-v3.ts`

### What V3 tried:

✅ Explicit enum values for `priceBadge.shape` (9 valid options)  
✅ Forbidden values listed (`❌ 'starburst', 'hexagon'`)  
✅ Exact `storeIdentity` structure documented  
✅ "CRITICAL" warnings added  
✅ "DO NOT add" lists for forbidden fields  

### Why it's failing:

❌ GPT-4.1 still invents structures (string instead of object)  
❌ Warnings are not strong enough  
❌ Examples might not be explicit enough about EXACT structure  

---

## What We Need

### Goal
**95%+ success rate** with GPT-4.1 (currently 66%)

### Requirements

1. **Rigid structure enforcement** — GPT must follow schema EXACTLY
2. **No creativity** — Use ONLY fields in examples
3. **Type strictness** — Objects must be objects, not strings
4. **Field completeness** — All required fields present, no extras

### Critical Fields to Constrain

#### `priceBadge.shape`
```typescript
// VALID (9 only):
"rounded-rect" | "cloud" | "star" | "splash" | 
"diamond" | "oval" | "tag" | "burst" | "circle"

// FORBIDDEN (examples):
"starburst", "star-burst", "hexagon", "pentagon", 
"rectangle", "round-rect"
```

#### `promotionalTitle` (MOST CRITICAL)
```typescript
// VALID:
{
  text: string,
  position: "top" | "bottom",
  fontSize: number,
  fontWeight: "600" | "700" | "900"
}

// FORBIDDEN:
"OFERTA!" // ❌ String is NOT valid
null // ✅ null is OK (when not promotional)
undefined // ✅ optional field
```

#### `storeIdentity`
```typescript
// VALID (3 fields only):
{
  type: "logo" | "text",
  position: "top-left" | "top-center" | ... (6 options),
  size: { width: number, height: number }
}

// FORBIDDEN fields:
fontFamily, fontWeight, color, lineHeight, fontSize, rotation
```

---

## Technical Constraints

### Schema has defensive measures:

```typescript
// Already implemented:
priceBadge.shape.catch("rounded-rect") // ✅
generated_at.optional() // ✅
storeIdentity with optional typography fields // ✅ (ignored by renderer)
```

**But we need prompt-level prevention**, not just schema fallbacks.

---

## Prompt Engineering Challenge

### Your Task

**Rewrite Prompt V3 system prompt** to:

1. **Make GPT-4.1 paranoid** about following structure
2. **Triple-emphasize type strictness** (object vs string vs null)
3. **Provide MORE concrete examples** (if needed)
4. **Use stronger language** than "CRITICAL" (if possible)
5. **Repeat constraints** in multiple sections (redundancy helps)

### Constraints for your prompt:

- Target: ~1200-1400 tokens (don't balloon back to V1's 1700)
- Keep performance focus (GPT-4.1 is fast, don't slow it down)
- Keep V2's few-shot learning (2 examples work well)
- Add validation checklist if needed

### Known effective patterns:

✅ "DO NOT use X" works better than "Avoid X"  
✅ Concrete examples with ❌ markers  
✅ Repeating rules in <validation> section  
✅ JSON structure shown EXACTLY as expected  

---

## Files to Modify

**Primary:**  
`lib/ai/visual-composer/prompts-v3.ts` → Create `prompts-v4.ts`

**Secondary (I'll handle):**  
- `lib/ai/visual-composer/service.ts` → Update import to V4
- `tests/visual-composer/service.test.ts` → Update assertions

---

## Success Criteria

### Definition of Done

1. **New file:** `lib/ai/visual-composer/prompts-v4.ts` created
2. **Export:** `VISUAL_COMPOSER_SYSTEM_PROMPT_V4` and `buildVisualComposerUserPromptV4`
3. **Validation:** Prompt reviewed by you for GPT-4.1 compliance patterns
4. **Documentation:** Brief explanation of what changed from V3→V4

### Testing Plan (after delivery)

- Run 10 production campaigns (various products/contexts)
- Target: ≥9/10 success (90%+)
- If <80% → escalate to architectural solution (Hybrid approach)

---

## Reference Materials

### V3 Prompt Structure (current)

```
<role> ... </role>
<objective> ... </objective>
<input> ... </input>
<layout_strategy> ... </layout_strategy>
<typography> ... </typography>
<decorative> (CRITICAL constraints here) </decorative>
<distinctness> ... </distinctness>
<validation> (CRITICAL warnings here) </validation>
<output> (structure definition) </output>
<examples> (2 concrete examples) </examples>
```

### Example Failure Log

```json
// Test 2 output (INVALID):
{
  "variations": [
    {
      "decorative": {
        "promotionalTitle": "OFERTA!" // ❌ Should be object
      }
    }
  ]
}

// Expected:
{
  "variations": [
    {
      "decorative": {
        "promotionalTitle": {
          "text": "OFERTA!",
          "position": "top",
          "fontSize": 32,
          "fontWeight": "700"
        }
      }
    }
  ]
}
```

---

## Questions for You

1. Should we add a **3rd example** specifically showing `promotionalTitle`?
2. Should we use **JSON Schema format** in the prompt (more formal)?
3. Should we add a **pre-output checklist** for GPT to self-validate?
4. Any GPT-4.1-specific patterns you know that work better than GPT-5.4?

---

## Handoff Status

- [x] Context provided
- [x] Problem statement clear
- [x] Requirements specified
- [x] Files identified
- [x] Success criteria defined
- [ ] Prompt V4 delivered by @prompt-eng
- [ ] Integration and testing by @aiox-master

**Ready for your magic!** ✨

---

**Next steps after your delivery:**

1. I integrate V4 into service.ts
2. I update tests
3. User tests 10 campaigns in production
4. We analyze success rate and decide: commit or pivot to Hybrid

**Time estimate:** Your work (30-45min) + Integration (10min) + Testing (20min) = ~1.5h total

Let me know if you need any clarification! 🚀
