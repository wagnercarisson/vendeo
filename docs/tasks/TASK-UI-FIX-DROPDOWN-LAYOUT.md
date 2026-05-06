# 🎨 TASK: Fix Dropdown Layout — Subsegmentation UI

**Sprint:** 2 (Deferred from Sprint 1)  
**Priority:** P2 (Enhancement)  
**Effort:** 4h  
**Assignee:** @dev (Dex)  
**Related:** TASK-DEV-SUBSEGMENTATION-IMPLEMENTATION.md  
**QA Report:** qa/subsegmentation-implementation-QA-REPORT.md

---

## 📋 Context

During QA validation of the subsegmentation implementation, the UI was flagged for **cramped dropdown layout**. The category and subcategory `<select>` elements appear stacked with insufficient spacing, creating poor visual hierarchy and making the onboarding form feel cluttered.

**Current State:** Functional ✅ but visually cramped ⚠️  
**Target State:** Clean, spacious layout with clear hierarchy

---

## 🎯 Objective

Refactor the dropdown layout in the store onboarding page to improve visual spacing, hierarchy, and mobile responsiveness without changing the functional behavior.

---

## 📐 Requirements

### Must Have

1. **Horizontal Layout (Desktop):**
   - Category and subcategory selects side-by-side on screens ≥768px
   - 16px gap between dropdowns
   - Each dropdown takes 50% width (minus gap)

2. **Vertical Stack (Mobile):**
   - Stack dropdowns vertically on screens <768px
   - Full width for each dropdown
   - 12px vertical gap

3. **Visual Hierarchy:**
   - Category dropdown: Bold label, 1rem font
   - Subcategory dropdown: Appear below/beside with clear dependency
   - Helper text: Visible only when subcategory='outro' selected

4. **Accessibility:**
   - Maintain existing ARIA labels
   - Preserve tab order: category → subcategory → custom field
   - Keep focus states intact

### Should Have

- Smooth transition when subcategory dropdown appears
- Visual indicator that subcategory depends on category selection
- Consistent spacing with other form sections

### Won't Have (Out of Scope)

- Complete redesign of onboarding form
- Changes to validation logic
- New UI components (use existing selects)

---

## 🛠️ Implementation Plan

### File to Modify

**Path:** `app/dashboard/store/page.tsx`

### CSS Grid Approach

```tsx
{/* Current (cramped): */}
<div className="space-y-4">
  <select id="category" {...}>...</select>
  <select id="subcategory" {...}>...</select>
</div>

{/* Proposed (spacious): */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="flex flex-col gap-2">
    <label className="font-semibold text-sm">Categoria *</label>
    <select id="category" {...}>...</select>
  </div>
  
  {category && (
    <div className="flex flex-col gap-2">
      <label className="font-semibold text-sm">Especifique o tipo *</label>
      <select id="subcategory" {...}>...</select>
    </div>
  )}
</div>

{/* Custom field (full width below): */}
{subcategory === 'outro' && (
  <div className="mt-4">
    <input id="subcategory_custom" {...} />
  </div>
)}
```

---

## ✅ Acceptance Criteria

1. **Desktop Layout:**
   - [ ] Category and subcategory selects side-by-side on ≥768px screens
   - [ ] 16px gap between dropdowns
   - [ ] Equal width distribution (50% each)

2. **Mobile Layout:**
   - [ ] Dropdowns stack vertically on <768px screens
   - [ ] Full width for each dropdown
   - [ ] 12px vertical gap

3. **Visual Quality:**
   - [ ] Labels clearly distinguish category vs subcategory
   - [ ] Helper text maintains amber alert styling
   - [ ] No overlap or clipping at any breakpoint

4. **Functional Behavior:**
   - [ ] No changes to validation logic
   - [ ] State reset on category change still works
   - [ ] Custom field appears/disappears correctly

5. **Testing:**
   - [ ] Visual regression test at 3 breakpoints (mobile/tablet/desktop)
   - [ ] Existing E2E tests still pass
   - [ ] TypeScript compilation clean

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Test on Chrome, Firefox, Safari (desktop)
- [ ] Test on iOS Safari, Chrome Mobile (mobile)
- [ ] Verify spacing at breakpoints: 375px, 768px, 1024px, 1440px
- [ ] Check focus states and tab order
- [ ] Verify helper text positioning for "outro" option

### Automated Testing

- [ ] Run E2E suite: `npm run test:e2e -- onboarding-subsegmentation.spec.ts`
- [ ] TypeScript check: `npx tsc --noEmit`
- [ ] Visual diff (optional): Playwright screenshot comparison

---

## 📸 Visual Reference

**Before:** (Screenshot from QA report shows stacked, cramped layout)

**After:** (Expected)
```
┌─────────────────────────────────────────────────────┐
│ Posicionamento                                      │
├─────────────────────────┬───────────────────────────┤
│ Categoria *             │ Especifique o tipo *      │
│ [🍷 Bebidas Alcoólicas] │ [Escolha a opção que...] │
└─────────────────────────┴───────────────────────────┘
│                                                     │
│ [🔸 Outro selecionado? Campo custom aparece aqui] │
└─────────────────────────────────────────────────────┘
```

---

## 🚫 Anti-Patterns to Avoid

- ❌ Changing validation logic (out of scope)
- ❌ Adding new dependencies (use Tailwind utilities only)
- ❌ Breaking mobile responsiveness
- ❌ Introducing accessibility regressions

---

## 📦 Deliverables

1. **Code:**
   - Refactored CSS grid in `app/dashboard/store/page.tsx`
   - No changes to TypeScript logic

2. **Testing:**
   - All existing E2E tests pass
   - Manual cross-browser validation (screenshots)

3. **Documentation:**
   - Update this task with before/after screenshots
   - Add note to CHANGELOG.md

---

## 🔗 Related Documents

- [TASK-DEV-SUBSEGMENTATION-IMPLEMENTATION.md](./TASK-DEV-SUBSEGMENTATION-IMPLEMENTATION.md) — Original implementation
- [qa/subsegmentation-implementation-QA-REPORT.md](../../qa/subsegmentation-implementation-QA-REPORT.md) — QA validation
- [DEC-2026-05-06-003.md](../integration-checklists/DEC-2026-05-06-003.md) — Schema decision

---

**Status:** 🟡 READY FOR SPRINT 2  
**Blocked By:** None  
**Blocks:** None (enhancement only)
