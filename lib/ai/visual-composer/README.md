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
