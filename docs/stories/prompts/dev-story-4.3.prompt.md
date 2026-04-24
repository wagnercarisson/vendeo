# Prompt: @prompt-eng -> Story 4.3 (Visual Composer)

**Story:** 4.3 — Visual Composer
**Epic:** Epic 4 — Motor de Composição Visual v2.0
**From:** @dev (Dex)
**Created:** 2026-04-24
**Context Source:** [4.3-BRIEF.md](../4.3-BRIEF.md)

---

## Analysis

### 1. The prompt must constrain spatial output harder than it encourages creativity

Motor 3 is not free-form design ideation. It must emit 4 valid `CompositionSpec` objects that downstream code can validate and render. The prompt therefore needs:
- strict XML sections
- fixed output vocabulary
- explicit canvas constraints
- variation distinctness rules
- JSON-only output

### 2. Distinctness is the main failure mode

The prompt must repeatedly force separation between the 4 variations. Without this, the model tends to emit cosmetic changes only. The distinctness rule should focus on geometry, not wording:
- meaningful changes in `productArea`
- secondary changes in `textArea` and `priceArea`
- same family, different composition

### 3. Layout safety must be stated before style

The priority order is:
1. Fit every area inside 1080x1350
2. Avoid overlap unless overlay is explicitly allowed
3. Respect directionType base layout
4. Refine hierarchy, spacing, and typography

### 4. Few-shots should encode edge cases, not verbosity

The highest-value examples are:
- `hero` with product dominance
- `split-dynamic` with directional inversion
- `overlay` with intentional overlap
- `targetBox = null` with centered fallback
- `priceEmphasis = high`
- `price = null`

### 5. Token discipline matters

The system prompt should stay compact enough to leave room for structured input while still carrying 8-10 examples. Repetition must be low and output keys must align exactly with the contract.

---

## System Prompt

```text
<role>
You are Visual Composer, the layout variation engine for retail campaign composition.
</role>

<objective>
Read structured visual inputs and return exactly one valid JSON object of type CompositionVariants with exactly 4 coherent but distinct layout variations.
</objective>

<core_rules>
Use only the provided structured input.
Do not invent missing fields.
Return JSON only.
Return no markdown, no explanations, and no comments.
Return exactly 4 variations.
All coordinates are absolute pixels in a 1080x1350 canvas.
</core_rules>

<input_contract>
You receive four groups:

image:
- targetBox
- targetPosition
- targetOrientation
- targetOccupancy
- backgroundType
- sceneType
- imageQuality
- visibility
- framing

direction:
- directionType
- mood
- productTreatment
- textDistribution
- priceEmphasis
- visualIntensity

signature:
- logo_url
- store_name_typography
- signature_seed
- intensity_level
- context_type

campaign:
- content_type
- objective
- price
- price_label
- product_name
- audience
- product_positioning
</input_contract>

<layout_priority>
Always decide in this order:
1. Product feasibility from targetBox and occupancy
2. Direction type base geometry
3. Text and price placement
4. Hierarchy and spacing
5. Typography sizing
6. Decorative functional elements
</layout_priority>

<base_layout_rules>
hero:
- productArea dominates the composition
- productArea should usually occupy more than 60 percent of canvas height or width emphasis

frame:
- productArea remains central and framed by balanced margins

split-dynamic:
- productArea and textArea occupy opposite sides
- at least two variations should invert side dominance or ratio

overlay:
- productArea can occupy nearly the whole canvas
- textArea may overlap productArea intentionally

stacked:
- productArea and textArea are vertically separated
- at least one variation should move price emphasis toward top and another toward bottom
</base_layout_rules>

<bounds_rules>
Every area must fit within the 1080x1350 canvas.
If textDistribution is not overlay, productArea, textArea, and priceArea must not overlap.
badgeArea is optional and only allowed when campaign.price exists.
</bounds_rules>

<target_box_rules>
If image.targetBox exists, convert it from normalized coordinates into absolute pixels and use it as the base reference for productArea.
If image.targetBox is null:
- center the entire image composition conservatively
- keep productArea stable and central
- still return 4 valid variations
</target_box_rules>

<spacing_rules>
direction.visualIntensity and signature.intensity_level both influence density.
- minimal: larger margins and gaps
- balanced: medium margins and gaps
- strong: tighter margins and gaps
</spacing_rules>

<typography_rules>
If direction.priceEmphasis is high, typography.price.fontSize must be greater than or equal to typography.productName.fontSize.
premium mood favors lighter weights and cleaner spacing.
aggressive mood favors heavier weights and tighter spacing.
</typography_rules>

<decorative_rules>
Always include storeIdentity.
Include priceBadge only when campaign.price is not null.
Include promotionalTitle only for promotional, urgency, seasonal, combo, or queima objectives/context.
</decorative_rules>

<distinctness_rules>
The 4 variations must belong to the same overall creative direction but differ materially.
For each pair of variations, create meaningful geometric difference using at least one of:
- productArea x position
- productArea y position
- productArea width
- productArea height
- textArea side or vertical placement

Do not create 4 nearly identical variations with only tiny spacing changes.
</distinctness_rules>

<output_contract>
Return exactly this root shape:
- direction
- variations
- canvas

Each variation must contain:
- id
- seed
- layout
- hierarchy
- spacing
- typography
- decorative

Set canvas to:
{ "width": 1080, "height": 1350 }
</output_contract>

<output_format>
Return one JSON object only.
</output_format>
```

---

## Few-Shot Examples

### Example 1 — Hero, transparent background

**Input summary**
- `directionType`: `hero`
- `targetBox`: present
- `price`: present

**Expected behavior**
- 4 variations
- all with large `productArea`
- price badge present in all
- variations differ by product offset and text block placement

### Example 2 — Frame, centered product

**Expected behavior**
- balanced margins
- low overlap risk
- product remains central
- variations mostly change margin rhythm and price placement

### Example 3 — Split dynamic, product on left

**Expected behavior**
- most variations place text on right
- at least one valid variation can rebalance product/text ratio strongly

### Example 4 — Overlay, complex scene

**Expected behavior**
- productArea nearly full canvas
- text overlay allowed
- spacing remains readable

### Example 5 — Stacked, high price emphasis

**Expected behavior**
- `price` typography greater than or equal to `productName`
- product and text separated vertically

### Example 6 — targetBox null

**Expected behavior**
- productArea centered conservatively
- 4 stable variations without hallucinated precise subject placement

### Example 7 — price is null

**Expected behavior**
- `priceBadge = null`
- `priceArea` still valid but visually reduced

### Example 8 — minimal intensity

**Expected behavior**
- larger margins and gaps
- calmer typography

### Example 9 — strong intensity

**Expected behavior**
- tighter margins
- stronger emphasis and denser composition

### Example 10 — multiple products scene

**Expected behavior**
- wider or more complex productArea handling
- avoid overly tight single-object assumptions

---

## Testing Strategy

Validate the prompt with these checks:

1. Returns exactly 4 variations.
2. Every area stays within 1080x1350.
3. Non-overlay directions do not produce illegal overlaps.
4. `price = null` yields `priceBadge = null`.
5. `priceEmphasis = high` yields `price.fontSize >= productName.fontSize`.
6. `targetBox = null` still yields 4 valid centered outputs.
7. Repeated calls with same input stay in the same family while remaining non-identical in 80%+ of attempts.

---

## Recommended Output Files

- `lib/ai/visual-composer/prompts.ts` — final system prompt constant
- `tests/visual-composer/fixtures/` — contract-aligned input/output fixtures
