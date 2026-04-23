# Visual Reader v2

Visual Reader v2 analyzes a product image and returns a normalized `ImageProfile` used by the visual composition pipeline.

## Files

- `contracts.ts`: input/output schemas and `emptyImageProfile()`
- `prompts.ts`: system prompt and user prompt builder
- `service.ts`: `readVisualTarget()` orchestration
- `cache.ts`: Supabase-backed cache keyed by `imageUrl + productName + content_type`
- `normalizer.ts`: post-model consistency rules
- `alerts.ts`: non-blocking user alerts derived from the profile

## Input

```ts
type VisualReaderInput = {
  imageUrl: string;
  productName: string;
  content_type: "product" | "service" | "message";
};
```

## Output

The service always returns a valid `ImageProfile`. If analysis fails, it returns `emptyImageProfile()` with a diagnostic `reasoningSummary`.

## Behavior

- `content_type === "message"` bypasses the model call
- cache lookup happens before the model call
- model response is validated against `ImageProfileSchema`
- post-model normalization repairs safe inconsistencies and rejects invalid non-null target matches without a box
- user alerts never block the flow

## Route

Production endpoint: `POST /api/visual-reader`

Response shape:

```json
{
  "ok": true,
  "requestId": "uuid",
  "profile": {},
  "alerts": []
}
```

## Cache Storage

Apply migration `database/migrations/030_visual_reader_cache.sql` to create `public.visual_reader_cache`.

## Tests

- `tests/visual-reader/service.test.ts`
- `tests/visual-reader/integration.test.ts`

Fixture metadata lives in `tests/visual-reader/fixtures/manifest.json`.