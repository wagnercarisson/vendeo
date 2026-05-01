# Logo Prompts v2: Quick Reference Card

**For:** Developers & Product Team  
**Purpose:** Understand the prompt engineering patterns that fix logo generation issues

---

## 🎯 The 6 Fixes at a Glance

| Fix | Before (v1) | After (v2) | Impact |
|-----|-------------|------------|--------|
| **1. EITHER/OR** | "bottle, glass, or symbol" | "Choose EITHER bottle OR glass" | Forces single choice ✅ |
| **2. Singular** | "geometric shapes" | "ONE geometric shape" | Prevents grids ✅ |
| **3. Output Clarity** | "suitable for social media" | "logo icon itself, isolated" | Prevents mockups ✅ |
| **4. Negative Prompting** | "no text" only | Full "DO NOT CREATE" section | Blocks bad patterns ✅ |
| **5. Unification** | No unification language | "ONE cohesive shape" 5× | Ensures connection ✅ |
| **6. Composition** | No guidance | "Centered composition" | Visual balance ✅ |

---

## 📐 Prompt Structure Template

```
[CONTEXT] Store name + segment description
    ↓
[DESIGN] Icon selection with EITHER/OR pattern
    ↓
[STYLE] Visual aesthetic + color palette
    ↓
[COMPOSITION] Balance + scalability + unification
    ↓
[CONSTRAINTS] What the logo should evoke (mood)
    ↓
[NEGATIVE PROMPT] DO NOT CREATE (8 items)
    ↓
[TECHNICAL] Output format + background + isolation
```

---

## 🔧 Pattern Reference

### ❌ Anti-Pattern: Multiple Options
```
"Design: a bottle, glass, or refreshment symbol"
```
**Problem:** AI interprets "OR" as "include all" or "combine multiple"  
**Result:** Logo with bottle + glass + symbol (cluttered)

### ✅ Correct Pattern: Forced Choice
```
"DESIGN: Create ONE single geometric icon. Choose EITHER 
a bottle silhouette OR a glass outline (select only one 
element, not both)."
```
**Result:** AI picks ONE element, generates clean single-icon logo

---

### ❌ Anti-Pattern: Plural Forms
```
"Simple geometric shapes"
```
**Problem:** Plural suggests "many shapes arranged together"  
**Result:** Grid of 9+ mini-logos

### ✅ Correct Pattern: Singular Enforcement
```
"The logo must be ONE cohesive geometric shape forming 
a single unified icon mark."
```
**Result:** Single logo, not a grid

---

### ❌ Anti-Pattern: Ambiguous Output
```
"flat design suitable for social media"
```
**Problem:** "Suitable for social media" suggests "post" or "promotional image"  
**Result:** Logo inside business card mockup or Instagram post frame

### ✅ Correct Pattern: Explicit Output Format
```
"OUTPUT FORMAT: The logo icon itself, isolated and 
centered on pure white background (#FFFFFF). 
No shadows, no borders, no decorative frames."
```
**Result:** Clean isolated logo on white background

---

### ❌ Anti-Pattern: Weak Constraints
```
"no text"
```
**Problem:** Only ONE negative constraint, AI fills gaps with bad interpretations  
**Result:** Mockups, grids, complex illustrations (all technically "no text" compliant)

### ✅ Correct Pattern: Comprehensive Negative Prompting
```
CONSTRAINTS - DO NOT CREATE:
- Business cards, mockups, social media posts
- Grids of multiple logo variations
- Text, letters, words, numbers
- Complex illustrations, realistic drawings
- [Segment-specific avoids]
- [Segment-specific avoids]
```
**Result:** AI avoids ALL common failure patterns

---

## 🎨 Segment-Specific Patterns

### Beverage Store (Example)
```typescript
iconSelection: 
  "Choose EITHER a bottle silhouette OR a glass outline"

negativePrompt:
  "- Cartoonish drinks or neon colors
   - Childish elements or busy patterns"
```

### Electronics (Complex Circuits Problem)
```typescript
iconSelection: 
  "Choose EITHER a simple plug icon OR a lightning bolt symbol
   (avoid overly complex circuit patterns)"

negativePrompt:
  "- Dated tech symbols (floppy disk) or overly complex circuits"
```

### Beauty Salon (Feminine Problem)
```typescript
iconSelection: 
  "Choose EITHER scissors symbol OR a lotus flower outline
   Note: Design should be elegant and modern, suitable for 
   diverse clientele (not overly feminine)"

negativePrompt:
  "- Exclusively feminine elements (ensure broad appeal)"
```

---

## 📊 Token Efficiency vs Quality Trade-off

| Version | Tokens | Cost/Gen | Regen Rate | Final Cost |
|---------|--------|----------|------------|------------|
| v1 | 250 | $0.000625 | 3.5× | **$0.0021875** |
| v2 | 450 | $0.001125 | 1.3× | **$0.0014625** |

**Conclusion:** +80% prompt tokens = -33% final cost (fewer regenerations)

---

## 🧪 How to Test a Prompt Change

### 1. Generate Baseline (v1)
```bash
# Generate 3 logos with current prompt
# Store: "Test Store"
# Segment: "Loja de bebidas"
```

### 2. Generate Refined (v2)
```bash
# Generate 3 logos with refined prompt
# Same store name, same segment
```

### 3. Compare Results
```
Criteria:
- Is it a single logo (not a grid)?
- Is it isolated (not a mockup)?
- Is it professional (not abstract nonsense)?
- Does it fit the segment?
- Score: 1-10
```

### 4. Calculate Approval Rate
```
Approval threshold: ≥7/10

v1: 2/9 logos ≥7 = 22% approval
v2: 6/9 logos ≥7 = 67% approval ✅ (Target met)
```

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T: Mix constraints
```
"Create a bottle AND glass design, OR just a bottle"
```
**Problem:** "AND" + "OR" = confusion

### ✅ DO: Clear binary choice
```
"Choose EITHER a bottle OR a glass (not both)"
```

---

### ❌ DON'T: Vague mood language
```
"Make it feel premium and sophisticated"
```
**Problem:** AI has no visual anchor for "feel"

### ✅ DO: Visual + mood
```
"STYLE: Elegant and sophisticated. Use gold and black colors.
Clean lines and modern appeal."
```

---

### ❌ DON'T: Assume AI knows context
```
"Generate appropriate logo for the business"
```
**Problem:** "Appropriate" has infinite interpretations

### ✅ DO: Explicit style + constraints
```
"STYLE: [specific visual style]
COMPOSITION: [specific layout rules]
CONSTRAINTS - DO NOT: [specific anti-patterns]"
```

---

## 📚 Further Reading

### Prompt Engineering Principles (Applied)
1. **Specificity > Brevity** - Longer, clear prompts beat short, ambiguous ones
2. **Negative Prompting** - Explicitly state what NOT to create
3. **Structural Hierarchy** - Separate sections with clear headers
4. **Forced Choices** - Use EITHER/OR to prevent combination interpretation
5. **Repetition for Emphasis** - Repeat critical constraints (e.g., "ONE" appears 5×)

### DALL-E 3 Specific
- Prefers structured prompts with clear sections
- Responds well to negative prompting (DO NOT)
- Benefits from technical specifications (size, format)
- Handles "choose one" instructions better than "or" lists

---

## 🔗 Related Files

### Implementation
- `lib/ai/logo-prompts-v2.ts` - Complete v2 implementation
- `lib/ai/logo-prompts.ts` - Original v1 (for comparison)

### Documentation
- `docs/ux/logo-ia-optimization/prompt-refinement-brief.md` - Original brief
- `docs/ux/logo-ia-optimization/sprint1-comparison.md` - Detailed comparison

### Integration
- `app/api/ai/generate-logo/route.ts` - API endpoint (to be updated)

---

**Quick Start:**
```typescript
import { getLogoPromptBySegment } from '@/lib/ai/logo-prompts-v2';

const prompt = getLogoPromptBySegment(
  "Adega do João",
  "Loja de bebidas",
  "Premium"  // optional tone
);

// Send to DALL-E 3 API
const response = await openai.images.generate({
  model: "dall-e-3",
  prompt: prompt,
  n: 1,
  size: "1024x1024",
  quality: "standard"
});
```

---

**Last Updated:** 2026-05-01  
**Maintained by:** @prompt-eng (Wordsmith)
