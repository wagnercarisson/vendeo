# Motor 3 (Visual Composer) - Schema Reference

**Version:** 2.1 (Story 4.5.2)  
**Updated:** 2026-04-25

## Overview

Motor 3 validates GPT-5.4 output with Zod before handing layout variations to downstream validation and rendering. Version 2.1 updates the schema to accept useful typography enrichments, coerce `fontWeight` safely, and ignore noisy extra fields at the composition root.

## Principles

- Validate the fields Motor 4 and downstream logic actually care about.
- Accept useful GPT enrichments without breaking backward compatibility.
- Ignore noisy fields instead of failing the entire variation set.
- Keep type safety by coercing `fontWeight` into the canonical enum.

## Typography Schema

```typescript
export const TypographySpecSchema = z.object({
  fontSize: z.number().int().positive(),
  fontWeight: z.coerce.string().pipe(z.enum(["400", "600", "700", "900"])),
  fontFamily: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  lineHeight: z.number().positive().optional(),
});
```

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `fontSize` | number | Yes | Base font size in pixels |
| `fontWeight` | string | Yes | Canonical font weight token after coercion |
| `fontFamily` | string | No | Typography family returned by GPT |
| `color` | string | No | Hex color for richer styling |
| `lineHeight` | number | No | Vertical rhythm for multiline text |

## Composition Schema

`CompositionSpecSchema` now also accepts:

- `productName` at the variation root
- extra unknown fields at the root level without failing validation

This is intentional. GPT often returns useful top-level context plus occasional noise fields. Root-level strict mode caused widespread validation failures without improving safety.

## Noise Fields

The prompt explicitly discourages these fields, and the schema ignores them if they still appear:

- `promotion`
- `renderingHints`
- `debugMetadata`
- `targetConstraints`

## Migration Notes

There are no breaking changes from the previous schema version.

- Existing valid outputs remain valid.
- Numeric `fontWeight` values now parse successfully.
- Extra root fields no longer trigger fallback by themselves.

## Expected Logs

Success path:

```text
[MOTOR-3][VALIDATION] All outputs valid (4 variations)
```

Unexpected validation failure:

```text
[MOTOR-3][VALIDATION-FAIL] Unexpected validation failure
```

The failure log should now be rare and indicate a real contract problem rather than schema drift.