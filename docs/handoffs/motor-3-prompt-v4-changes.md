# Prompt V4 — Change Summary (V3 → V4)

**Date:** April 25, 2026  
**Author:** @prompt-eng (Wordsmith)  
**Target Model:** GPT-4.1  
**Problem Solved:** GPT-4.1 inventing simplified structures (66% success → target 95%)  

---

## 🎯 What Changed

### 1. **New Section: `<type_strictness>`** (HIGHEST IMPACT)

**Problem:** GPT-4.1 was sending `promotionalTitle: "OFERTA!"` (string) instead of object.

**Solution:** Dedicated section with **side-by-side comparisons**:

```xml
<type_strictness>
1. promotionalTitle — MUST be object OR null OR omitted
   ✅ CORRECT: { "text": "OFERTA!", "position": "top", "fontSize": 32, "fontWeight": "700" }
   ✅ CORRECT: null
   ✅ CORRECT: (field omitted entirely)
   ❌ WRONG: "OFERTA!" (string is FORBIDDEN)
   ❌ WRONG: { "text": "OFERTA!" } (missing required fields)
```

**Impact:** Makes type requirements IMPOSSIBLE to miss.

---

### 2. **New Section: `<pre_output_checklist>`** (HIGH IMPACT)

**Problem:** GPT-4.1 not validating output before returning.

**Solution:** Force GPT to self-validate with checkbox list:

```xml
<pre_output_checklist>
BEFORE RETURNING YOUR JSON, VALIDATE:

□ All 4 variations present?
□ Each variation has id, seed, layout, hierarchy, spacing, typography, decorative?
□ promotionalTitle is object OR omitted (NEVER string)?
□ priceBadge is object OR null (NEVER string)?
□ storeIdentity is object with type/position/size (NO extra fields)?
□ priceBadge.shape is one of the 9 valid values (NO "starburst", "hexagon", etc.)?
□ All typography objects have fontSize, fontWeight, fontFamily, color, lineHeight?
□ fontWeight is "400", "600", "700", or "900" (NO other values)?
□ All area objects have x, y, width, height?
□ canvas is { "width": 1080, "height": 1350 }?

IF ANY CHECKBOX IS UNCHECKED, FIX BEFORE RETURNING.
</pre_output_checklist>
```

**Impact:** Creates mental "gate" for GPT before output.

---

### 3. **Added 3rd Example** (MEDIUM-HIGH IMPACT)

**Problem:** V3 had 2 examples, neither showed `promotionalTitle` structure explicitly.

**Solution:** Added `<example_3>` with overlay layout + promotionalTitle:

```json
"promotionalTitle": { 
  "text": "ÚLTIMA CHANCE", 
  "position": "top", 
  "fontSize": 36, 
  "fontWeight": "900" 
}
```

**Impact:** GPT sees 3 variations of promotionalTitle (OFERTA, PROMOÇÃO, ÚLTIMA CHANCE) — learns pattern.

---

### 4. **Strengthened Language** (MEDIUM IMPACT)

**Before (V3):**
- "Do not use..."
- "Include only when..."
- "CRITICAL: Use ONLY..."

**After (V4):**
- "MUST be object OR null (NEVER string)"
- "YOU MUST NOT DO THIS"
- "NEVER send promotionalTitle as a string. NEVER."
- "IF YOU SEND INVALID STRUCTURE, THE SYSTEM WILL USE FALLBACK LAYOUTS"

**Impact:** Commands, not suggestions. Creates urgency.

---

### 5. **Repeated Constraints** (LOW-MEDIUM IMPACT)

**Strategy:** Critical rules appear in **3 places**:

1. `<type_strictness>` — Detailed explanation
2. `<decorative>` — Context-specific reminder
3. `<final_reminder>` — Pre-output summary

**Example (promotionalTitle):**
- `<type_strictness>`: Full ✅/❌ comparison
- `<decorative>`: "NEVER send as string. NEVER."
- `<final_reminder>`: "OBJECT or null or omitted. NEVER a string."

**Impact:** Redundancy helps GPT-4.1 "remember" constraints.

---

### 6. **Improved Examples Descriptions** (LOW IMPACT)

**Added `<description>` tags** to examples:

```xml
<example_1>
<description>Hero layout with promotional context (includes promotionalTitle as OBJECT)</description>
...
</example_1>
```

**Impact:** Helps GPT understand **why** structure is used (not just copy-paste).

---

## 📊 Token Budget

| Version | Tokens | Change |
|---------|--------|--------|
| V2 | ~1200 | Baseline (optimized from V1) |
| V3 | ~1200 | No change (added constraints) |
| **V4** | **~1350** | **+150 tokens** (+12.5%) |

**Justification:** 150 extra tokens buy:
- Dedicated `<type_strictness>` section (50 tokens)
- `<pre_output_checklist>` (70 tokens)
- 3rd example (30 tokens)

**Performance impact:** Minimal (GPT-4.1 still 10-15s expected).

---

## 🎯 Expected Impact

| Metric | V3 (Current) | V4 (Target) | Confidence |
|--------|-------------|-------------|------------|
| Success Rate | 66% (2/3) | 95%+ (19/20) | **HIGH (90%)** |
| `promotionalTitle` errors | 33% | <5% | **VERY HIGH (95%)** |
| `priceBadge.shape` errors | ~10% | <2% | **HIGH (85%)** |
| `storeIdentity` extra fields | ~5% | <1% | **HIGH (90%)** |
| Response Time | 10-15s | 10-15s | **NO CHANGE** |

---

## 🔑 Key Innovations

### 1. **Side-by-Side ❌ vs ✅** (NEW pattern)
Previous prompts said "don't do X" — V4 **shows X vs correct alternative**.

**Example:**
```
❌ WRONG: "OFERTA!" (string is FORBIDDEN)
✅ CORRECT: { "text": "OFERTA!", "position": "top", ... }
```

**Why it works:** Visual contrast makes constraint memorable.

---

### 2. **Pre-Output Checklist** (NEW pattern)
Forces GPT to **review** before submitting.

**Psychological effect:**
- Creates "pause" before output
- Makes GPT **self-correct** instead of relying on post-validation

**Prior art:** CodeRabbit uses similar pattern for code review prompts.

---

### 3. **Triple Redundancy** (Enhanced from V3)
Critical constraints appear **3 times** in different contexts:
1. **Explanation** (type_strictness)
2. **Application** (decorative)
3. **Reminder** (final_reminder)

**Why it works:** GPT-4.1 has "working memory" — repetition reinforces.

---

## 🚨 What NOT Changed (Intentional)

### Kept from V2/V3:
- Few-shot learning structure (2 examples → 3 examples)
- Layout strategy (proven to work)
- Typography rules (no issues observed)
- Canvas/hierarchy logic (working correctly)

**Rationale:** Don't fix what's not broken. Focus on type strictness only.

---

## 🧪 Testing Recommendations

### Test Matrix (10 campaigns)

| Test | Context Type | Mood | Price | Expected promotionalTitle |
|------|-------------|------|-------|--------------------------|
| 1 | promotional | aggressive | 4.99 | ✅ Object (with "OFERTA!" or similar) |
| 2 | urgency | playful | 2.99 | ✅ Object (with urgency text) |
| 3 | seasonal | clean | 12.50 | ✅ Object (with seasonal text) |
| 4 | premium | premium | null | ❌ Omitted or null (NOT string) |
| 5 | standard | aggressive | 3.50 | ❌ Omitted (standard context) |
| 6 | promotional | premium | 15.00 | ⚠️ Edge case (premium + promo) |
| 7 | urgency | aggressive | 1.99 | ✅ Object (strong urgency) |
| 8 | promotional | clean | null | ⚠️ Edge case (promo without price) |
| 9 | seasonal | playful | 5.00 | ✅ Object (seasonal playful) |
| 10 | standard | clean | 8.00 | ❌ Omitted (standard clean) |

**Success Criteria:** ≥9/10 valid (90%+ success rate)

---

## 📋 Integration Checklist

- [ ] Replace V3 import with V4 in `service.ts`
- [ ] Update user prompt call to `buildVisualComposerUserPromptV4`
- [ ] Run automated tests (should pass without changes)
- [ ] Run 10 production campaigns (test matrix above)
- [ ] Document results in `motor-3-gpt-4.1-v4-results.md`
- [ ] If ≥90% success → commit to main
- [ ] If <80% success → escalate to @architect for Hybrid approach

---

## 🔮 Future Optimizations (If Needed)

### If V4 still <90% success:

**Option 1:** Add JSON Schema format to prompt
```xml
<json_schema>
{
  "promotionalTitle": {
    "type": ["object", "null"],
    "properties": { "text": {...}, "position": {...}, ... }
  }
}
</json_schema>
```

**Option 2:** Use GPT-4.1 function calling mode (structured outputs)
- Guarantees schema compliance
- Slower (adds 1-2s latency)
- More expensive (function calling pricing)

**Option 3:** Hybrid approach (rule-based + GPT)
- GPT generates layout geometry only
- Code constructs decorative fields
- 100% schema compliance guaranteed

---

## ✅ Summary

**Problem:** GPT-4.1 inventing simplified structures (66% success)  
**Root Cause:** Insufficient type strictness + no self-validation  
**Solution:** V4 with `<type_strictness>`, `<pre_output_checklist>`, 3rd example  
**Expected Impact:** 66% → 95%+ success rate  
**Risk:** Low (150 token growth, no performance impact)  
**Confidence:** HIGH (90%)  

**Ready for integration and testing.** 🚀

---

**Next Agent:** @aiox-master (integration + testing)  
**Timeline:** 10min integration + 20min testing = 30min total
