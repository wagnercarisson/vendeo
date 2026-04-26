# Motor 3 Prompt V2 — Performance Benchmarks

**Date:** April 2026  
**Author:** @prompt-eng (Wordsmith)  
**Objective:** Document performance improvements from V1 → V2  

---

## 🎯 Test Methodology

### Test Environment
- **Model:** GPT-5.4
- **Temperature:** 0.4
- **Timeout:** 25000ms (V1), 20000ms (V2 — reduced after validation)
- **Test Cases:** 20 production campaigns (mix of directions, occupancy, price presence)
- **Runs per Test:** 3 (to account for GPT variance)

### Test Matrix

| Test ID | Direction | targetBox | Price | targetOccupancy | Expected Challenge |
|---------|-----------|-----------|-------|-----------------|-------------------|
| T1 | hero | present | yes | high | Complex layout, high overlap risk |
| T2 | hero | null | yes | medium | Conservative centering |
| T3 | split-dynamic | present | no | low | No priceBadge, asymmetric split |
| T4 | split-dynamic | null | yes | high | Centering + split logic |
| T5 | overlay | present | yes | full | Overlap allowed, bounds critical |
| T6 | overlay | null | no | medium | Text overlay + no price |
| T7 | frame | present | yes | medium | Balanced margins |
| T8 | frame | null | yes | low | Conservative framing |
| T9 | stacked | present | no | high | Vertical stacking |
| T10 | stacked | null | yes | medium | Stacked + no targetBox |

### Success Criteria

| Metric | V1 (Baseline) | V2 (Target) | Pass Threshold |
|--------|--------------|-------------|----------------|
| Avg Response Time | 22.8s | <15s | ✅ <15s |
| Max Response Time | 25s+ (timeout) | <20s | ✅ <20s |
| Timeout Rate | 75% | <5% | ✅ <5% |
| Success Rate | 25% | >95% | ✅ >95% |
| Schema Compliance | 100% | 100% | ✅ 100% |
| Distinctness | Unknown | >80% | ✅ >80% |

---

## 📊 V1 (Baseline) Performance

### Production Test Results (4 Tests — April 2026)

| Test | Campaign | targetBox | Price | Response Time | Result |
|------|----------|-----------|-------|---------------|--------|
| 1 | Coca-Cola 600ml PNG | present | 4.99 | 25165ms | ❌ TIMEOUT |
| 2 | Schin 350ml WEBP | present | 2.99 | 16019ms | ❌ VALIDATION_FAIL |
| 3 | Schin 350ml WEBP | present | 2.99 | 25041ms | ❌ TIMEOUT |
| 4 | Coca-Cola 600ml PNG | present | 4.99 | 25031ms | ❌ TIMEOUT |

**Summary:**
- **Avg Response Time:** 22,814ms (22.8s)
- **Timeout Rate:** 75% (3/4)
- **Validation Failure Rate:** 25% (1/4)
- **Success Rate:** 0% (0/4)

### Root Cause
Prompt complexity (1700 tokens) causes GPT to "think" extensively:
- Validating all rules in-prompt
- Parsing abstract few-shot guidance
- Generating 50+ fields per variation × 4

---

## 📈 V2 Performance — RESULTS TO BE FILLED AFTER TESTING

### Test Run 1: Initial Validation (10 Tests)

| Test ID | Direction | Response Time (ms) | Result | Notes |
|---------|-----------|-------------------|--------|-------|
| T1 | hero | ??? | ??? | Complex layout |
| T2 | hero | ??? | ??? | targetBox=null |
| T3 | split-dynamic | ??? | ??? | price=null |
| T4 | split-dynamic | ??? | ??? | Both present |
| T5 | overlay | ??? | ??? | Overlap allowed |
| T6 | overlay | ??? | ??? | targetBox=null, price=null |
| T7 | frame | ??? | ??? | Balanced |
| T8 | frame | ??? | ??? | Conservative |
| T9 | stacked | ??? | ??? | Vertical |
| T10 | stacked | ??? | ??? | Mixed edge cases |

**Summary:**
- **Avg Response Time:** ???ms
- **Max Response Time:** ???ms
- **Timeout Rate:** ??? (???/10)
- **Success Rate:** ??? (???/10)
- **Schema Compliance:** ??? (???/10)

---

### Test Run 2: Production Validation (20 Campaigns)

| Campaign | Direction | targetBox | Price | Run 1 (ms) | Run 2 (ms) | Run 3 (ms) | Avg (ms) | Result |
|----------|-----------|-----------|-------|-----------|-----------|-----------|----------|--------|
| Coca-Cola 600ml | hero | present | 4.99 | ??? | ??? | ??? | ??? | ??? |
| Schin 350ml | hero | present | 2.99 | ??? | ??? | ??? | ??? | ??? |
| Whisky Premium 750ml | split-dynamic | null | null | ??? | ??? | ??? | ??? | ??? |
| Refrigerante 2L | overlay | present | 12.50 | ??? | ??? | ??? | ??? | ??? |
| Água 500ml | frame | present | 1.50 | ??? | ??? | ??? | ??? | ??? |
| Cerveja Lata 350ml | stacked | null | 3.20 | ??? | ??? | ??? | ??? | ??? |
| ... (14 more) | ... | ... | ... | ... | ... | ... | ... | ... |

**Summary:**
- **Avg Response Time:** ???ms
- **Max Response Time:** ???ms
- **Min Response Time:** ???ms
- **Timeout Rate:** ??? (???/20)
- **Success Rate:** ??? (???/20)
- **Schema Compliance:** ??? (???/20)

---

## 🎨 Distinctness Validation — RESULTS TO BE FILLED

### Methodology
For each test, calculate geometric difference between all variation pairs:
- Position difference: |v1.productArea.x - v2.productArea.x| + |v1.productArea.y - v2.productArea.y| + ... (all areas)
- Normalize to canvas size (1080×1350)
- Express as percentage (0-100%)

**Threshold:**
- ✅ >20% difference (material variation)
- ⚠️ 10-20% difference (minor variation)
- ❌ <10% difference (near-identical — FAIL)

### Results

| Test ID | Min Diff (%) | Avg Diff (%) | Max Diff (%) | Verdict |
|---------|-------------|-------------|-------------|---------|
| T1 | ??? | ??? | ??? | ??? |
| T2 | ??? | ??? | ??? | ??? |
| T3 | ??? | ??? | ??? | ??? |
| ... | ... | ... | ... | ... |

**Overall:**
- **Avg Min Diff:** ???% (across all tests)
- **Avg Avg Diff:** ???% (across all tests)
- **Pass Rate:** ??? (???/20 tests with >20% min diff)

---

## 🧪 Quality Validation (@qa) — TO BE FILLED

### Visual Inspection Checklist

For each test campaign, validate:
- [ ] **Aesthetic Quality:** Layouts look professional, not "robotic"
- [ ] **Distinctness:** 4 variations feel different, not just tiny tweaks
- [ ] **Brand Consistency:** Typography/decorative elements align with brand
- [ ] **Readability:** Text areas are legible, not cramped
- [ ] **Price Emphasis:** priceEmphasis=high → price is visually prominent
- [ ] **Direction Adherence:** hero feels hero, split feels split, etc.

### QA Results

| Test ID | Campaign | Aesthetic | Distinctness | Brand | Readability | Price | Direction | Overall |
|---------|----------|-----------|--------------|-------|-------------|-------|-----------|---------|
| T1 | Coca-Cola 600ml | ??? | ??? | ??? | ??? | ??? | ??? | ??? |
| T2 | Schin 350ml | ??? | ??? | ??? | ??? | ??? | ??? | ??? |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

**Summary:**
- **Pass Rate:** ??? (???/20)
- **Critical Issues:** ???
- **Minor Issues:** ???
- **Recommendation:** ✅ APPROVE / ⚠️ REVISE / ❌ REJECT

---

## 📉 V1 vs V2 Comparison — TO BE FILLED

### Performance Metrics

| Metric | V1 (Baseline) | V2 (Actual) | Improvement | Target Met? |
|--------|--------------|-------------|-------------|-------------|
| **Avg Response Time** | 22.8s | ???s | ???% | ??? |
| **Max Response Time** | 25s+ | ???s | ???% | ??? |
| **Min Response Time** | 16s | ???s | ???% | ??? |
| **Timeout Rate** | 75% | ???% | ??? pp | ??? |
| **Success Rate** | 25% | ???% | ??? pp | ??? |
| **Schema Compliance** | 100% | ???% | ??? pp | ??? |

### Quality Metrics

| Metric | V1 (Baseline) | V2 (Actual) | Comparison | Target Met? |
|--------|--------------|-------------|------------|-------------|
| **Distinctness (Avg)** | Unknown | ???% | N/A | ??? |
| **QA Pass Rate** | Unknown | ???% | N/A | ??? |
| **Aesthetic Quality** | Baseline | ??? | ??? | ??? |

---

## 🎯 Decision Matrix

### GO Decision Criteria
✅ **APPROVED FOR PRODUCTION** if ALL of:
- [ ] Avg response time <15s
- [ ] Timeout rate <5%
- [ ] Success rate >95%
- [ ] Schema compliance 100%
- [ ] Distinctness avg >80%
- [ ] QA pass rate >90%
- [ ] No critical quality regressions

### NO-GO Decision Criteria
❌ **ROLLBACK TO V1** if ANY of:
- [ ] Avg response time >20s
- [ ] Timeout rate >10%
- [ ] Success rate <80%
- [ ] Schema compliance <95%
- [ ] Distinctness avg <60%
- [ ] QA pass rate <70%
- [ ] Critical quality regressions detected

### REVISE Decision Criteria
⚠️ **REVISE V2 BEFORE PRODUCTION** if:
- [ ] Performance improved but not meeting targets
- [ ] Minor quality issues detected
- [ ] Specific edge cases failing consistently

---

## 🔮 Phase 2 Optimization Opportunities

If V2 achieves targets but further optimization is desired:

### Option 1: Ultra-Minimal Output
- GPT generates layout + hierarchy only (~15 fields)
- Motor 4 calculates spacing/typography/decorative
- **Estimated gain:** 40-60% additional reduction (10s → 6-8s)
- **Risk:** Requires Motor 4 refactoring

### Option 2: Single-Variation + Transform
- GPT generates 1 base variation
- Code applies geometric transforms for 4 variations
- **Estimated gain:** 70-80% additional reduction (10s → 3-5s)
- **Risk:** Loss of creative distinctness

### Option 3: Hybrid Model
- GPT-5.4 for complex layouts (hero, overlay)
- Rule-based for simple layouts (frame, stacked)
- **Estimated gain:** 30-50% cost reduction
- **Risk:** Inconsistent output quality

---

## 📝 Notes

### Test Execution Instructions

1. **Run Automated Tests:**
   ```bash
   npm run test tests/visual-composer/prompt-v2.test.ts
   ```

2. **Run Performance Benchmarks:**
   ```bash
   npm run benchmark:motor3-v2
   ```
   
   This script should:
   - Load 20 production campaigns from database
   - Run each test 3 times
   - Measure response time, timeout rate, success rate
   - Calculate distinctness metrics
   - Output CSV/JSON for analysis

3. **QA Visual Validation:**
   - @qa reviews generated layouts manually
   - Uses checklist above for each test
   - Documents findings in "QA Results" section

4. **Update This Document:**
   - Fill "???" placeholders with actual results
   - Add observations/notes in "Notes" column
   - Update decision matrix checkboxes

5. **Make GO/NO-GO Decision:**
   - Review decision criteria
   - Consult @architect and @aiox-master
   - Document decision in PR description

---

## 🏁 Final Verdict — TO BE FILLED

**Date:** ???  
**Decision:** ✅ APPROVED / ⚠️ REVISE / ❌ REJECTED  
**Approved By:** @qa, @architect, @aiox-master  

**Justification:**
???

**Next Steps:**
???

---

## 📎 References

- **Migration Guide:** `docs/architecture/motor-3-prompt-v2-migration.md`
- **Test Suite:** `tests/visual-composer/prompt-v2.test.ts`
- **Handoff Document:** `docs/handoffs/motor-3-prompt-optimization-HANDOFF.md`
- **Timeout Analysis:** `docs/analysis/motor-3-gpt-timeout-analysis.md`
- **V1 Prompt:** `lib/ai/visual-composer/prompts.ts`
- **V2 Prompt:** `lib/ai/visual-composer/prompts-v2.ts`
