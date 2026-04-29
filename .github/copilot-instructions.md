# VENDEO — Copilot Instructions

You are working on **Vendeo**, a sales engine for physical retail stores.

Your primary responsibility is NOT to generate code.

Your responsibility is to ensure that every implementation:
- aligns with the product purpose
- respects system rules
- improves sales outcomes

---

## 1. Product Context (MANDATORY)

Vendeo exists to:

> **Help shop owners sell more through social content**

This is the ONLY success metric.

If a feature does not contribute to selling → DO NOT implement it.

---

## 2. What Vendeo is NOT

Never treat Vendeo as:
- a design tool (like Canva)
- a marketing agency
- a generic content generator

Aesthetic improvements are secondary to conversion.

---

## 3. Core System Flows

### Base Flow (All Users)
Store → Campaign → Generation → Approval

### Weekly Plan (Paid Feature)
Store → Weekly Plan → Campaign → Generation → Approval

Rules:
- Weekly Plan is optional
- Must not break base flow
- Must preserve campaign linkage

---

## 4. Plan-Based Behavior (STRICT)

### Free
- Manual campaign creation only
- No weekly plan
- No intelligence
- Limit: 5 campaigns/month

### Basic
- Weekly plan available (queue-based)
- Semi-automated execution
- No adaptive intelligence

### Pro
- Strategic weekly planning
- Adaptive system behavior
- Must deliver value on Day 1

Rules:
- NEVER mix features between plans
- NEVER leak Pro behavior into Basic or Free
- ALWAYS respect plan boundaries

---

## 5. Non-Negotiable Rules

NEVER break:

- Campaign editing updates (no duplication)
- Regeneration overwrites content
- Image and video flows are isolated
- Fallback logic is deterministic
- Weekly plan linkage integrity

---

## 6. Anti-Failure Rules

You MUST avoid:

- generating repetitive campaigns
- producing irrelevant content
- increasing user complexity
- breaking trust with the shop owner

If a solution:
- improves visuals but harms sales → REJECT
- adds flexibility but increases complexity → REJECT

---

## 7. Development Behavior

Before writing code, ALWAYS:

1. Identify affected flow (campaign / weekly plan / generation)
2. Check plan impact (Free / Basic / Pro)
3. Confirm no rule is being violated
4. Ensure change improves or preserves sales capability

---

## 8. Code Guidelines

- Follow existing project patterns (Next.js + TypeScript)
- Do NOT introduce unnecessary abstractions
- Do NOT refactor unrelated code
- Prefer small, safe, incremental changes

---

## 9. Story-Driven Execution

All changes must:
- be traceable to a clear objective
- have defined acceptance criteria
- preserve system behavior

---

## FINAL RULE

> If it does not help the shop owner sell more, DO NOT build it.