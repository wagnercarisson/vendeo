# Visual Composer

Visual Composer is Motor 3 of the visual composition pipeline. It receives normalized image signals, a creative direction, store signature context, and campaign metadata, then returns exactly 4 layout variations for the fixed 1080x1350 canvas.

## Files

- `contracts.ts`: input/output schemas and helpers
- `prompts.ts`: system prompt and user prompt builder
- `layout-rules.ts`: deterministic geometry rules for all directions
- `validation.ts`: bounds, overlap, and distinctness validation
- `fallback.ts`: deterministic fallback generator
- `service.ts`: `composeVariations()` orchestration

## Behavior

- `content_type === "message"` bypasses AI and returns empty variations
- AI output is validated against the contract and geometric rules
- invalid or low-distinctness output falls back to deterministic variations
- fallback uses the same 4-variation contract as the main path

## Tests

- `tests/visual-composer/service.test.ts`
- `tests/visual-composer/validation.test.ts`
- `tests/visual-composer/integration.test.ts`
- `tests/visual-composer/consistency.test.ts`
- `tests/visual-composer/contracts.test.ts`

## Schema Changes (Story 4.5.2)

### Typography Fields (new in v2.1)

Motor 3 now accepts optional typography enhancements from GPT-5.4:

| Field | Type | Required | Purpose | Example |
|-------|------|----------|---------|---------|
| `fontFamily` | string | No | Font family name for typography rendering | `"Montserrat"`, `"Sora"`, `"Inter"` |
| `color` | string | No | Hex color for text elements | `"#FF0000"`, `"#2D3142"` |
| `lineHeight` | number | No | Line height multiplier for spacing | `1.2`, `1.4`, `1.6` |

These fields are accepted to eliminate validation failures and preserve richer GPT output. They remain optional and backward compatible.

### Type Coercion

`fontWeight` now accepts both number (`700`) and string (`"700"`), coercing to the canonical string enum automatically.

Before:

```typescript
fontWeight: "700" // pass
fontWeight: 700 // fail
```

After:

```typescript
fontWeight: "700" // pass
fontWeight: 700 // pass, coerced to "700"
```

### Schema Mode

`CompositionSpecSchema` no longer uses strict mode at the variation root. Known useful fields are validated, and unsupported noise fields such as `promotion` or `renderingHints` are ignored instead of failing the entire output.

Impact:

- validation noise is reduced dramatically
- fallback activation is reserved for real contract violations
- richer GPT output can flow downstream safely
