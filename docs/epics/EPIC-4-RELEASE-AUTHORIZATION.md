# Epic 4 — Release Authorization

**Epic:** Motor de Composição Visual v2.0  
**Date:** 2026-04-22  
**Authorized By:** @architect (Aria) + @aiox-master (Orion)  
**Status:** 🟢 **APPROVED FOR EXECUTION**

---

## ✅ **Authorization Status**

| Phase | Status | Date | Notes |
|-------|--------|------|-------|
| **Story Creation** | ✅ COMPLETE | 2026-04-21 | 6 stories (4.1-4.6), 34 points |
| **Story Validation** | ✅ COMPLETE | 2026-04-21 | All stories 10/10 (Constitutional compliance) |
| **Technical Analysis** | ✅ COMPLETE | 2026-04-22 | Image engine requirements analyzed |
| **Architecture Decisions** | ✅ COMPLETE | 2026-04-22 | Q1, Q2, Q3 resolved |
| **Stories Updated** | ✅ COMPLETE | 2026-04-22 | Decisions registered in 4.1-4.3 |
| **Final Approval** | ✅ APPROVED | 2026-04-22 | Ready for @dev + @qa |

---

## 🎯 **Execution Parameters**

### **Scope**

| Story | Title | Points | Duration | Priority |
|-------|-------|--------|----------|----------|
| **4.1** | Visual Reader — Análise de Imagem | 5 | 3-5 dias | CRITICAL |
| **4.2** | Intent Resolver — Hierarquia Visual | 8 | 5-7 dias | CRITICAL |
| **4.3** | Visual Composer — Geração de Variações | 8 | 5-7 dias | CRITICAL |
| **4.4** | Renderer — Arte Final Programática | 5 | 3-5 dias | CRITICAL |
| **4.5** | Visual Signature Integration | 3 | 2-3 dias | HIGH |
| **4.6** | Context Profiles — Aplicação | 5 | 3-4 dias | HIGH |

**Total:** 34 points, ~5-6 weeks

---

### **Technical Stack**

| Component | Technology | Hosting | Decision Doc |
|-----------|-----------|---------|--------------|
| Visual Reader | GPT-4o Vision API | External (OpenAI) | Story 4.1:17 |
| Intent Resolver | GPT-4o + Claude fallback | External (OpenAI/Anthropic) | Story 4.2:17 |
| Visual Composer | GPT-4o (1 call → 4-6 vars) | External (OpenAI) | Story 4.3:16 |
| Renderer | Canvas + Sharp | Vercel Functions | Story 4.4 |
| Cache | Supabase (→ Redis se p95>500ms) | Supabase / Upstash | Story 4.1:17 |
| Storage | Supabase Storage | Supabase | Story 4.4 |

---

### **Cost Projections**

| Month | Users | Images/Month | AI Cost | Total Cost | Revenue (Basic) | AI % |
|-------|-------|--------------|---------|------------|-----------------|------|
| M1 | 62 | 3.000 | ~$30 | ~$35 | ~$200 | 15% |
| M3 | 310 | 23.600 | ~$235 | ~$260 | ~$2.000 | 12% |
| M6 | 1.860 | 210.400 | ~$2.000 | ~$2.030 | ~$9.800 | 21% |

**ROI:** Motor V2 reduces regenerations by 50% → saves ~$1.000/month (offset)

---

### **Performance Targets**

| Metric | Target | Current | Measurement |
|--------|--------|---------|-------------|
| **Pipeline Latency (p95)** | <10s | N/A | Total time (4.1→4.4) |
| **Visual Reader (p95)** | <2s | N/A | GPT-4o Vision call |
| **Intent Resolver (p95)** | <1.5s | N/A | GPT-4o/Claude call |
| **Visual Composer (p95)** | <3s | N/A | GPT-4o call (4-6 vars) |
| **Renderer (p95)** | <3s | N/A | Canvas/Sharp compositing |
| **Cache Hit Rate** | >60% | N/A | ImageProfile reuse |
| **Approval Rate** | 75%+ | ~45% | Campaigns approved 1st try |

---

## 📋 **Execution Sequence**

### **Phase 1: Core Engines (Stories 4.1-4.4)**

**Week 1-2: Story 4.1 (Visual Reader)**
- Implement GPT-4o Vision API integration
- Build ImageProfile schema (8 fields)
- Implement Supabase cache layer
- Add `/api/analyze/image` endpoint
- **Gate:** All ACs passing + cache hit rate measured

**Week 2-3: Story 4.2 (Intent Resolver)**
- Implement CreativeDirection engine
- Add constraint validation layer
- Integrate Context Profiles (standard, promotional, etc.)
- Test GPT-4o + Claude fallback
- **Gate:** All ACs passing + constraint rules enforced

**Week 3-4: Story 4.3 (Visual Composer)**
- Implement 1-call variation generation (4-6 vars)
- Validate variation distinctness (>30% layout difference)
- Add seed-based reproducibility
- **Gate:** All ACs passing + @prompt-eng validation

**Week 4-5: Story 4.4 (Renderer)**
- Implement Canvas/Sharp compositor
- Add background, text, logo, decorative elements
- Optimize performance (<3s per arte)
- Upload to Supabase Storage
- **Gate:** All ACs passing + performance target met

---

### **Phase 2: Integration (Stories 4.5-4.6)**

**Week 5-6: Story 4.5 (Visual Signature)**
- Integrate Visual Signature (colors, logo, typography)
- Implement WCAG contrast validation
- **Gate:** All ACs passing + brand consistency validated

**Week 6: Story 4.6 (Context Profiles)**
- Apply Context Profiles to compositions
- Test all 5 profiles (standard, promotional, seasonal, premium, urgency)
- **Gate:** All ACs passing + profile behavior validated

---

## ⚠️ **Risk Management**

| Risk | Mitigation | Owner |
|------|-----------|-------|
| Regeneration cost explosion | Rate limiting by plan + cache + improved prompts | @architect |
| Latency > 10s (bad UX) | Pre-generation in Weekly Plan (async) | @dev |
| Single provider dependency | GPT-4o ↔ Claude fallback operational | @architect |
| Cache misses too high | Monitor hit rate; migrate to Redis if needed | @dev |
| Variation distinctness low | @prompt-eng validates prompt quality | @prompt-eng |

---

## 🚦 **Quality Gates**

### **Story Level**

- [ ] All Acceptance Criteria passing
- [ ] Unit tests coverage >80%
- [ ] Integration tests passing
- [ ] Performance targets met
- [ ] CodeRabbit review approved
- [ ] Manual QA approval (@qa)

### **Epic Level**

- [ ] All 6 stories Done
- [ ] E2E pipeline tested (4.1→4.6)
- [ ] Cost tracking within budget
- [ ] Latency p95 <10s
- [ ] Approval rate >70% (A/B test)
- [ ] Production deploy approved

---

## 👥 **Team Assignment**

| Role | Agent | Responsibilities |
|------|-------|-----------------|
| **Product Owner** | Wagner | Epic alignment, acceptance |
| **Architect** | @architect (Aria) | Technical decisions, reviews |
| **Development** | @dev (Dex) | Implementation (all stories) |
| **Prompt Engineering** | @prompt-eng (Wordsmith) | Prompt optimization (4.1-4.3) |
| **QA** | @qa (Quinn) | Testing, quality gates |
| **DevOps** | @devops (Gage) | Deploy, monitoring, feature flags |
| **Orchestration** | @aiox-master (Orion) | Workflow coordination, blockers |

---

## 📄 **Reference Documents**

- Epic Definition: [`docs/epics/EPIC-4-MOTOR-VISUAL.md`](../epics/EPIC-4-MOTOR-VISUAL.md)
- Validation Report: [`docs/validation/EPIC-4-VALIDATION.md`](../validation/EPIC-4-VALIDATION.md)
- Technical Requirements: [`docs/epics/EPIC-4-IMAGE-ENGINE-REQUIREMENTS.md`](../epics/EPIC-4-IMAGE-ENGINE-REQUIREMENTS.md)
- Lessons Learned: [`docs/validation/EPIC-4-LESSONS-LEARNED.md`](../validation/EPIC-4-LESSONS-LEARNED.md)

---

## ✅ **Authorization Signatures**

| Role | Name | Date | Status |
|------|------|------|--------|
| **Product Owner** | Wagner | 2026-04-21 | ✅ APPROVED |
| **Architect** | @architect (Aria) | 2026-04-22 | ✅ APPROVED |
| **Master Orchestrator** | @aiox-master (Orion) | 2026-04-22 | ✅ APPROVED |

---

## 🚀 **EPIC 4 IS GO FOR EXECUTION**

**Next Step:** Activate @dev (Dex) for Story 4.1  
**Timeline:** Start immediately (2026-04-22)  
**Expected Completion:** ~6 weeks (end of May 2026)

---

*Document created by @aiox-master (Orion) on 2026-04-22*  
*Epic 4: Motor de Composição Visual v2.0 — Ready for Implementation*
