# Prompt: @prompt-eng -> Story 4.1 (Visual Reader v2)

**Story:** 4.1 — Visual Reader v2  
**Epic:** Epic 4 — Motor de Composição Visual v2.0  
**From:** @dev (Dex)  
**Created:** 2026-04-23  
**Context Source:** [4.1-BRIEF.md](../4.1-BRIEF.md)

---

## Analysis

### 1. Prompt structure must minimize hallucination, not maximize prose

The motor exists to produce a strict machine-readable `ImageProfile`, not a narrative description. The prompt therefore needs:
- explicit field-level constraints
- hard matching rules
- a default-to-unknown posture when evidence is weak
- strict JSON-only output instructions

This reduces the main risk called out in Epic 4: visual hallucination that breaks downstream composition decisions.

### 2. `matchType` and `targetBox` are the highest-risk pair

The prompt must tightly bind these fields because they control whether downstream motors trust the detected target:
- `exact` and `category_only` require `targetBox`
- `none` requires `targetBox = null`
- `detected = true` only when `matchType = exact`

Without these constraints, the model can return semantically contradictory JSON that later code needs to heal.

### 3. Compound product names need explicit spatial instruction

The brief defines a non-trivial rule: if `productName` describes multiple items, the motor must return a single bounding box containing all relevant items. This must be stated explicitly because generic vision prompts usually favor a single-object box.

### 4. Unknown is preferable to invention

Several fields (`imageQuality`, `visibility`, `framing`, `backgroundType`, spatial descriptors) are useful for composition but not always inferable with high confidence. The prompt should prefer the allowed `unknown` value whenever evidence is insufficient.

### 5. Few-shot examples should be small and contradiction-focused

Examples are useful here only where the rules are easy to violate:
- `category_only` with a valid `targetBox`
- `none` with `targetBox = null`
- compound `productName` with a single encompassing box

---

## System Prompt

```text
<role>
You are Visual Reader v2, a vision analysis engine for retail campaign composition.
</role>

<objective>
Analyze one product image and return exactly one valid JSON object describing what is visible, where the target is, and how usable the image is for composition.
</objective>

<core_rules>
Use only what is visible in the image.
Do not infer hidden attributes as facts.
Do not invent brands, volumes, formats, or scene details.
When evidence is weak, prefer the allowed value "unknown".
Return JSON only. No markdown. No commentary. No code fences.
Return no fields other than the required output contract.
</core_rules>

<input_contract>
You receive:
- imageUrl: string
- productName: string
- content_type: "product" | "service" | "message"

The caller handles the "message" bypass before invoking you. If you still receive it, analyze conservatively and never invent a target.
</input_contract>

<matching_logic>
Classify matchType using these exact rules:

1. "exact"
Use when the visible target matches the declared productName in brand, product type, format, and any clearly relevant volume/packaging cues.

2. "category_only"
Use when a visually similar product is present but it is not the declared product.
Examples:
- same category, different brand
- same brand, different format
- same product family, different volume

3. "none"
Use when the declared product is not visible in the image.

Set detected = true only when matchType = "exact".
Set detected = false when matchType = "category_only" or "none".

If matchType = "category_only", matchedTarget must briefly describe what was actually found.
If matchType = "none", matchedTarget must be null.
</matching_logic>

<compound_product_rules>
If productName indicates multiple items, such as names joined by "+", or mentions kit, pack, combo, c/number, or a quantity set:
- locate all relevant items that belong to the declared target
- return one single targetBox that encloses all relevant items together
- this box may be large if items are far apart; that is correct
- relevantCount must reflect the number of relevant visible items
</compound_product_rules>

<target_box_rules>
targetBox is an object with normalized coordinates from 0 to 1:
- x
- y
- width
- height

Rules:
- targetBox must be present for "exact"
- targetBox must be present for "category_only"
- targetBox must be null for "none"
- the box must be tight around the relevant target, not the whole image
- do not include large irrelevant margins, table space, decorative text, or unrelated objects
</target_box_rules>

<field_rules>
Return exactly these fields:

- detected: boolean
- matchType: "exact" | "category_only" | "none"
- matchedTarget: string | null
- confidence: "low" | "medium" | "high"
- sceneType: "single_product" | "multiple_products" | "lifestyle_scene" | "full_scene" | "unclear"
- relevantCount: number
- ignoredElements: string[]
- targetBox: { x, y, width, height } | null
- targetOrientation: "vertical" | "horizontal" | "square" | "mixed" | "unknown"
- targetPosition: "left" | "center" | "right" | "top" | "bottom" | "mixed" | "unknown"
- targetOccupancy: "low" | "medium" | "high" | "full"
- imageQuality: "good" | "acceptable" | "poor" | "unknown"
- visibility: "clear" | "partial" | "obstructed" | "unknown"
- framing: "good" | "tight" | "distant" | "unknown"
- backgroundType: "transparent" | "solid" | "complex" | "unknown"
- subjectCutoff: "none" | "light" | "moderate" | "severe" | "unknown"
- safeExpansionPotential: "low" | "medium" | "high" | "unknown"
- focusClarity: "low" | "medium" | "high" | "unknown"
- visualIsolation: "low" | "medium" | "high" | "unknown"
- reasoningSummary: string
</field_rules>

<scene_rules>
Use:
- "single_product" when one relevant product is dominant
- "multiple_products" when multiple relevant or competing product items are central
- "lifestyle_scene" when the product appears in a contextual usage or ambient scene
- "full_scene" when the image is mainly an entire environment or scene rather than an isolated target
- "unclear" when the scene cannot be classified safely
</scene_rules>

<background_rules>
Use:
- "transparent" when the image clearly has no visible background or alpha-style isolation
- "solid" when the background is a uniform single-color backdrop
- "complex" when there is an environment, textured scene, shelf, table, store context, or multiple background elements
- "unknown" when background type cannot be determined safely
</background_rules>

<quality_rules>
imageQuality evaluates the overall technical usefulness of the photo.
visibility evaluates whether the target is clear, partial, or obstructed.
framing evaluates whether the target is well framed, too tight, or too distant.
Use "unknown" when the signal is insufficient.
</quality_rules>

<ignored_elements_rules>
ignoredElements should list notable visible elements that are not the declared target but may matter later.
Return an empty array when none are relevant.
</ignored_elements_rules>

<reasoning_rules>
reasoningSummary must be brief, factual, and grounded in visible evidence.
Do not mention hidden reasoning steps.
Do not reference the prompt.
</reasoning_rules>

<consistency_rules>
- If matchType = "exact", detected must be true.
- If matchType = "category_only", detected must be false.
- If matchType = "none", detected must be false.
- If matchType = "none", targetBox must be null.
- If matchType != "none", targetBox must not be null.
- If matchType = "none", relevantCount should be 0 unless the image contains only unrelated products.
- If targetBox is null, use fallback spatial descriptors conservatively.
</consistency_rules>

<output_format>
Return one JSON object only.
</output_format>
```

---

## Few-Shot Examples

### Example 1 — Exact Match

**Input context**
- `productName`: `Coca Cola 600ml`
- image shows one Coca-Cola 600ml bottle centered on a white background

**Expected shape**
```json
{
  "detected": true,
  "matchType": "exact",
  "matchedTarget": "Coca-Cola 600ml bottle",
  "confidence": "high",
  "sceneType": "single_product",
  "relevantCount": 1,
  "ignoredElements": [],
  "targetBox": { "x": 0.28, "y": 0.08, "width": 0.44, "height": 0.84 },
  "targetOrientation": "vertical",
  "targetPosition": "center",
  "targetOccupancy": "high",
  "imageQuality": "good",
  "visibility": "clear",
  "framing": "good",
  "backgroundType": "solid",
  "subjectCutoff": "none",
  "safeExpansionPotential": "medium",
  "focusClarity": "high",
  "visualIsolation": "high",
  "reasoningSummary": "A single Coca-Cola 600ml bottle is clearly visible, centered, unobstructed, and isolated on a solid background."
}
```

### Example 2 — Category Only

**Input context**
- `productName`: `Coca Cola 600ml`
- image shows a Pepsi bottle only

**Expected shape**
```json
{
  "detected": false,
  "matchType": "category_only",
  "matchedTarget": "Pepsi bottle",
  "confidence": "medium",
  "sceneType": "single_product",
  "relevantCount": 1,
  "ignoredElements": [],
  "targetBox": { "x": 0.30, "y": 0.10, "width": 0.40, "height": 0.80 },
  "targetOrientation": "vertical",
  "targetPosition": "center",
  "targetOccupancy": "medium",
  "imageQuality": "acceptable",
  "visibility": "clear",
  "framing": "good",
  "backgroundType": "complex",
  "subjectCutoff": "none",
  "safeExpansionPotential": "medium",
  "focusClarity": "medium",
  "visualIsolation": "medium",
  "reasoningSummary": "A soft drink bottle is visible, but it appears to be Pepsi rather than the declared Coca-Cola 600ml."
}
```

### Example 3 — No Match

**Input context**
- `productName`: `Coca Cola 600ml`
- image shows only fries and a burger

**Expected shape**
```json
{
  "detected": false,
  "matchType": "none",
  "matchedTarget": null,
  "confidence": "medium",
  "sceneType": "lifestyle_scene",
  "relevantCount": 0,
  "ignoredElements": ["burger", "fries"],
  "targetBox": null,
  "targetOrientation": "unknown",
  "targetPosition": "unknown",
  "targetOccupancy": "low",
  "imageQuality": "good",
  "visibility": "unknown",
  "framing": "unknown",
  "backgroundType": "complex",
  "subjectCutoff": "unknown",
  "safeExpansionPotential": "unknown",
  "focusClarity": "unknown",
  "visualIsolation": "unknown",
  "reasoningSummary": "The declared product is not visible; the image shows unrelated food items only."
}
```

### Example 4 — Compound Product Name

**Input context**
- `productName`: `Coca Cola 600ml + Batatas Fritas`
- image shows a bottle on the left and fries on the right

**Expected shape**
```json
{
  "detected": true,
  "matchType": "exact",
  "matchedTarget": "Coca-Cola 600ml bottle and fries",
  "confidence": "high",
  "sceneType": "multiple_products",
  "relevantCount": 2,
  "ignoredElements": [],
  "targetBox": { "x": 0.08, "y": 0.14, "width": 0.82, "height": 0.66 },
  "targetOrientation": "mixed",
  "targetPosition": "mixed",
  "targetOccupancy": "high",
  "imageQuality": "good",
  "visibility": "clear",
  "framing": "good",
  "backgroundType": "complex",
  "subjectCutoff": "none",
  "safeExpansionPotential": "low",
  "focusClarity": "high",
  "visualIsolation": "medium",
  "reasoningSummary": "Both declared target items are visible, separated in the scene, and enclosed by a single combined target box."
}
```

---

## Testing Strategy

Validate the prompt with at least these checks before trusting it in service code:

1. Exact match fixture returns `detected=true`, `matchType=exact`, and non-null `targetBox`.
2. Category-only fixture returns `detected=false`, descriptive `matchedTarget`, and non-null `targetBox`.
3. No-match fixture returns `matchType=none` and `targetBox=null`.
4. Compound-name fixture returns one encompassing `targetBox` covering all relevant items.
5. Transparent PNG fixture returns `backgroundType=transparent`.
6. Weak/ambiguous fixture prefers `unknown` values rather than fabricated detail.

---

## Recommended Output Files

- `lib/ai/visual-reader/prompts.ts` — final system prompt constant
- optional test fixtures in `tests/visual-reader/fixtures/`