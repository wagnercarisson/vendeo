# Intent Resolver

Intent Resolver is Motor 2 of the visual pipeline. It receives a constrained subset of `ImageProfile`, campaign strategy fields, and the store visual signature, then returns one validated `CreativeDirection`.

## Files

- `contracts.ts`: input/output schemas and `emptyCreativeDirection()`
- `context-profiles.ts`: `deriveContextProfile()` plus profile characteristics
- `prompts.ts`: prompt-engineering deliverable from `@prompt-eng`
- `validation.ts`: hard-coded feasibility rules after the LLM
- `service.ts`: `resolveIntent()` and `getVisualSignatureProfile()`

## Model

- `gpt-5.4`
- temperature `0.3`
- timeout `20000ms`

The brief and source-of-truth for Story 4.2 require the full model for more stable creative reasoning.

## Main Rules

- image limitations override campaign ambition
- campaign objective overrides store identity refinement
- `content_type === "message"` returns `emptyCreativeDirection()`
- final output always passes through hard-coded validation

## Database Integration

`getVisualSignatureProfile(storeId, objective)`:

1. fetches `visual_signatures` by `store_id`
2. derives `context_type` from objective
3. fetches matching `visual_signature_profiles`
4. falls back to `standard` when context profile is missing

## Tests

- `tests/intent-resolver/validation.test.ts`
- `tests/intent-resolver/service.test.ts`
- `tests/intent-resolver/consistency.test.ts`
- `tests/intent-resolver/integration.test.ts`

Fixtures live in `tests/intent-resolver/fixtures/manifest.json`.