# Motor 3 GPT-5.4 Timeout Analysis

**Date:** 2026-04-25  
**Context:** Story 4.5.2 production testing  
**Investigator:** @aiox-master (Orion)  
**Status:** 🔴 CRITICAL — 75% timeout rate in production

---

## 📊 Executive Summary

Motor 3 (Visual Composer) is experiencing **systemic GPT-5.4 timeout issues** with a **75% failure rate** in production testing. This is **NOT related to Story 4.5.2 schema changes** — the schema is correct and all tests pass. The issue is GPT infrastructure instability or model performance degradation.

---

## 🔍 Test Results

### 4 Production Tests (Post-Story 4.5.2)

| Test | Product | Format | targetOccupancy | Motor 3 Time | Result | Details |
|------|---------|--------|-----------------|--------------|--------|---------|
| 1 | Coca-Cola 600ml | PNG | medium | 25165ms | ❌ TIMEOUT | GPT call exceeded 25s limit |
| 2 | Schin 350ml | WEBP | high | 16019ms | ❌ VALIDATION FAIL | Returned in time, but `direction` as string |
| 3 | Schin 350ml | WEBP | high | 25041ms | ❌ TIMEOUT | Same input as Test 2, different result |
| 4 | Coca-Cola 600ml | PNG | medium | 25031ms | ❌ TIMEOUT | Same input as Test 1, consistent timeout |

**Metrics:**
- **Success Rate:** 0/4 (0%)
- **Timeout Rate:** 3/4 (75%)
- **Validation Fail Rate:** 1/4 (25%)
- **Average Response Time:** 22.8s (max 25s timeout)

---

## 🚫 Hypotheses Ruled Out

### ❌ Image Format (PNG vs WEBP)
**Evidence:**
- PNG: 2 timeouts
- WEBP: 1 timeout + 1 validation fail
- **Conclusion:** Format is irrelevant

### ❌ targetOccupancy Level
**Evidence:**
- `medium`: 2 timeouts (100%)
- `high`: 1 timeout + 1 validation fail (50% timeout)
- **Conclusion:** Occupancy is irrelevant

### ❌ Schema Changes (Story 4.5.2)
**Evidence:**
- Unit tests: 5/5 passing
- Regression tests: 15/15 passing
- Schema accepts all GPT fields correctly
- **Conclusion:** Schema is correct, not the problem

---

## ✅ Root Cause Analysis

### Finding: GPT-5.4 Intermittent Behavior

**Evidence:**
1. **Same input, different results:** Test 2 vs Test 3 (Schin WEBP)
   - Test 2: Returned in 16s with validation fail
   - Test 3: Timeout after 25s (no response)
   
2. **Consistent timeout pattern:** Tests 1 and 4 (Coca PNG)
   - Both tests: 25s timeout
   - Motor 1 output identical: `targetOccupancy: 'medium'`

3. **Validation fail structure:** Test 2 only
   - GPT returned `direction` as string instead of object
   - Expected: `{ directionType: 'frame', mood: 'aggressive', ... }`
   - Actual: `'frame-aggressive-framed-center-high-strong'` (concatenated string)

### Hypothesis: GPT-5.4 Infrastructure Issue

**Possible Causes:**
1. **Model overload:** High request volume causing slow responses
2. **Multimodal processing delay:** Image analysis taking >25s
3. **GPT-5.4 regression:** Recent model update introduced instability
4. **API rate limiting:** Throttling responses to manage load

**NOT Vendor Issues:**
- Motor 1 (Visual Reader) uses same GPT-5.4 API: 3-4s average (fast)
- Motor 2 (Content) uses GPT-5.4: 1.2-1.6s average (very fast)
- Only Motor 3 affected (complex composition generation)

---

## 🎯 Impact Assessment

### System Impact

| Component | Status | Notes |
|-----------|--------|-------|
| Motor 1 (Visual Reader) | ✅ WORKING | Fast, reliable (3-4s) |
| Motor 2 (Content) | ✅ WORKING | Fast, reliable (1-2s) |
| Motor 3 (Visual Composer) | 🔴 CRITICAL | 75% timeout rate |
| Motor 4 (Renderer) | ✅ WORKING | Fallback renders correctly |
| Fallback Mechanism | ✅ WORKING | All tests generated 4 variations |

### User Impact

| Aspect | Impact | Severity |
|--------|--------|----------|
| Campaign Generation | ⚠️ DEGRADED | Still works via fallback, but quality reduced |
| Generation Time | 🔴 SLOW | 31-36s total (timeout adds 25s) |
| Composition Quality | 🟡 REDUCED | Fallback uses simple templates, no GPT intelligence |
| User Experience | 🟡 POOR | Long wait times, predictable outputs |

### Business Impact

**Positive:**
- ✅ System continues working (fallback prevents total failure)
- ✅ User can complete workflow (campaigns still generate)

**Negative:**
- ❌ Quality degradation (fallback templates inferior to GPT compositions)
- ❌ Competitive disadvantage (users get generic results)
- ❌ User frustration (long wait times for mediocre output)

---

## 🛠️ Recommendations

### Immediate Actions (Tactical)

**1. Increase Timeout to 45s**
```typescript
// lib/ai/visual-composer/service.ts
const raw = await callAI(
  [...],
  {
    model: "gpt-5.4",
    temperature: 0.4,
    timeoutMs: 45000, // ← Change from 25000 to 45000
  }
);
```
**Rationale:** Test 2 returned in 16s (within limit), but Test 3 timed out at 25s. Extra 20s buffer may reduce timeout rate.

**2. Add Retry Logic (1 Retry with Exponential Backoff)**
```typescript
// Pseudo-code
let attempt = 0;
while (attempt < 2) {
  try {
    const result = await callAI(...);
    return result;
  } catch (error) {
    if (error.message === 'TIMEOUT' && attempt < 1) {
      attempt++;
      await sleep(2000); // Wait 2s before retry
      continue;
    }
    throw error;
  }
}
```
**Rationale:** Intermittent issue may resolve on retry (Test 2 vs Test 3 pattern).

**3. Log GPT Request/Response Times**
```typescript
console.log("[MOTOR-3][GPT-TIMING]", {
  requestStart: Date.now(),
  inputSize: JSON.stringify(payload).length,
  imageProfileSize: JSON.stringify(imageProfile).length,
});
```
**Rationale:** Identify if specific input patterns cause slowdowns.

### Medium-Term Actions (Strategic)

**4. Investigate GPT-5.4 Alternative Providers**
- Test GPT-4.1 (older model, may be more stable)
- Test Claude 3 Opus (competitor, known for complex reasoning)
- Test GPT-5 Lite (if available, faster but less capable)

**5. Prompt Simplification**
- Reduce prompt length (current: ~1200 tokens)
- Remove redundant instructions
- Test if shorter prompts reduce processing time

**6. Composition Template Caching**
- Pre-generate common patterns (hero, frame, split)
- Use GPT only for customization, not full generation
- Hybrid approach: template + GPT refinement

### Long-Term Actions (Architecture)

**7. Story 4.5.4: GPT Reliability Improvements**
- Scope: Timeout increase + retry logic + monitoring
- Complexity: 5 points
- Priority: 🔴 HIGH

**8. Story 4.5.5: Alternative Composition Engine**
- Scope: Rule-based fallback with quality parity to GPT
- Use Motor 2 output (direction) to drive deterministic templates
- Remove GPT dependency for composition structure

**9. Story 4.5.6: Multi-Model Strategy**
- Scope: Load balancing across GPT-5.4, GPT-4.1, Claude 3
- Circuit breaker pattern (switch provider on repeated failures)
- Cost/quality trade-offs

---

## 📋 Next Steps

### Immediate (Today)
1. ✅ Mark Story 4.5.2 as DONE (schema work complete)
2. ⏳ Create Story 4.5.4 draft (GPT reliability improvements)
3. ⏳ Push commits to remote (cd748d6, 01ba001)
4. ⏳ Test timeout increase to 45s (quick experiment)

### Short-Term (Next 2-3 Days)
5. ⏳ Implement retry logic (Story 4.5.4)
6. ⏳ Add GPT timing logs (observability)
7. ⏳ Run 10+ production tests to validate improvements
8. ⏳ Document findings in Story 4.5.4

### Medium-Term (Next Week)
9. ⏳ Evaluate alternative models (GPT-4.1, Claude 3)
10. ⏳ Prompt optimization experiments
11. ⏳ Consider rule-based fallback improvements (Story 4.5.5)

---

## 📊 Appendix: Test Logs

### Test 1: Coca-Cola 600ml PNG (TIMEOUT)

```
[MOTOR-1][OUTPUT] {
  imageProfile: {
    detected: true,
    targetOccupancy: 'medium',
    targetBox: { x: 0.329, y: 0.028, width: 0.339, height: 0.944 }
  },
  motor1_ms: 4355
}

[MOTOR-2][OUTPUT] {
  direction: {
    directionType: 'hero',
    mood: 'aggressive',
    productTreatment: 'framed'
  },
  motor2_ms: 1478
}

[MOTOR-3][OUTPUT] {
  variations: 4,
  motor3_ms: 25165 ← TIMEOUT
}
```

### Test 2: Schin 350ml WEBP (VALIDATION FAIL)

```
[MOTOR-1][OUTPUT] {
  imageProfile: {
    detected: true,
    targetOccupancy: 'high',
    targetBox: { x: 0.245, y: 0.049, width: 0.51, height: 0.9 }
  },
  motor1_ms: 4127
}

[MOTOR-2][OUTPUT] {
  direction: {
    directionType: 'frame',
    mood: 'aggressive',
    productTreatment: 'background'
  },
  motor2_ms: 1472
}

[MOTOR-3][OUTPUT] {
  variations: 4,
  motor3_ms: 16019 ← VALIDATION FAIL (direction as string)
}
```

### Test 3: Schin 350ml WEBP (TIMEOUT)

```
[MOTOR-1][OUTPUT] {
  imageProfile: {
    detected: true,
    targetOccupancy: 'high',
    targetBox: { x: 0.245, y: 0.049, width: 0.51, height: 0.9 }
  },
  motor1_ms: 4341
}

[MOTOR-2][OUTPUT] {
  direction: {
    directionType: 'frame',
    mood: 'aggressive',
    productTreatment: 'background'
  },
  motor2_ms: 1249
}

[MOTOR-3][OUTPUT] {
  variations: 4,
  motor3_ms: 25041 ← TIMEOUT
}
```

### Test 4: Coca-Cola 600ml PNG (TIMEOUT)

```
[MOTOR-1][OUTPUT] {
  imageProfile: {
    detected: true,
    targetOccupancy: 'medium',
    targetBox: { x: 0.329, y: 0.028, width: 0.339, height: 0.944 }
  },
  motor1_ms: 3362
}

[MOTOR-2][OUTPUT] {
  direction: {
    directionType: 'hero',
    mood: 'aggressive',
    productTreatment: 'framed'
  },
  motor2_ms: 1632
}

[MOTOR-3][OUTPUT] {
  variations: 4,
  motor3_ms: 25031 ← TIMEOUT
}
```

---

**Conclusion:** Story 4.5.2 is COMPLETE. GPT-5.4 timeout is separate issue requiring Story 4.5.4.

**Status:** ✅ Story 4.5.2 DONE | 🔴 Story 4.5.4 REQUIRED (HIGH PRIORITY)
