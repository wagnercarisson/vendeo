# VENDEO — PRODUCT CONSTITUTION

## 1. Product Identity

Vendeo is a **sales engine for physical retail stores**.

It exists to help local shop owners **sell more through social content**, quickly and consistently.

---

## 2. What Vendeo is NOT

Vendeo is NOT:
- a design tool (like Canva)
- a marketing agency
- a generic content generator
- a tool for “beautiful posts”

Aesthetic quality is secondary.  
**Sales performance is the priority.**

---

## 3. Core Objective

The single most important goal of Vendeo is:

> **Help the shop owner sell more.**

All decisions must prioritize:
- conversion potential
- relevance to the local audience
- clarity of the message
- speed of execution

---

## 4. Non-Negotiable System Integrity

The following systems must NEVER break:

### 4.1 Campaign Flow Model

Vendeo operates on a **base campaign flow**, with an optional orchestration layer.

#### Base Flow (All Users)
- Store → Campaign → Generation → Approval

#### Weekly Plan (Paid Feature)
- Store → Weekly Plan → Campaign → Generation → Approval

The Weekly Plan is:
- Not mandatory
- An orchestration layer that improves consistency and planning
- The recommended workflow for paid users

All systems must support both flows without conflict.

---

### 4.2 Campaign Rules
- Editing always updates (never duplicates)
- Regeneration overwrites content
- Strict separation between image and video flows
- Fallback logic must remain consistent and deterministic

---

### 4.3 Weekly Plan System
- Weekly Plan orchestrates campaign creation
- Campaigns generated from plans must preserve linkage
- Plan integrity must be preserved across updates
- No silent data loss or orphan records
---

## 5. Critical Failure Conditions (Must Be Avoided)

The system MUST NOT:

- Generate irrelevant content
- Produce repetitive or “same-looking” campaigns
- Break trust with the shop owner
- Overcomplicate the campaign creation process
- Drift away from the objective of selling

If a decision improves visuals but harms conversion → REJECT  
If a decision increases flexibility but adds complexity → REJECT  

---

## 6. Decision Principles

When in doubt, prioritize:

1. **Sales over aesthetics**
2. **Clarity over creativity**
3. **Simplicity over flexibility**
4. **Consistency over novelty**
5. **Speed over perfection**

---

## 7. System Behavior Expectations

Every feature, refactor, or change must:

- Preserve existing flows unless explicitly changed
- Be explainable in terms of "how this helps sell more"
- Avoid introducing ambiguity into the system
- Maintain predictable and deterministic outputs

---

## 8. Engineering Alignment

All technical decisions must align with:

- Product purpose (sell more)
- System integrity (no breaking flows)
- User simplicity (low cognitive load)
- Output quality (relevant, actionable, usable)

---

## 9. Plan-Based System Behavior

Vendeo operates with three distinct product tiers, each representing a different level of system capability.

### Free Plan — "Creates"
- Focus: Individual campaign generation
- Workflow: Manual
- Weekly Plan: Not available
- Intelligence: None
- Output: Ready-to-post content

### Basic Plan — "Executes"
- Focus: Operational consistency
- Workflow: Semi-automated
- Weekly Plan: Available (queue-based, predefined structure)
- Intelligence: None
- Output: Consistent weekly presence

### Pro Plan — "Improves"
- Focus: Performance optimization
- Workflow: Assisted and adaptive
- Weekly Plan: Strategic and dynamic
- Intelligence: Active (learning and adapting)
- Output: Increased sales performance

---

## 10. Plan Integrity Rules

The system MUST enforce strict separation between plans:

- Free must NOT access planning or automation features
- Basic must NOT include adaptive intelligence or optimization logic
- Pro must provide immediate value, even without historical data

Feature leakage between plans is NOT allowed.

---

## 11. Pro Day 1 Requirement

The Pro plan must deliver value from the first use, even without historical data.

This may include:
- Pre-trained heuristics
- Market-based assumptions
- Strategy templates
- Smart defaults

The system must NOT depend solely on accumulated data to justify Pro value.

---

## FINAL RULE

> If it does not help the shop owner sell more, it should not exist in Vendeo.