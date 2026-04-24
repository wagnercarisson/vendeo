# Campaigns Domain

## Visual Pipeline v2

Story 4.5 introduces a structured visual generation path in addition to the legacy text flow.

Current integration points:

- [service.ts](service.ts): keeps the v1 text generation flow and conditionally invokes the visual pipeline when `MOTOR_V2_ENABLED` is on and the campaign has a product image.
- [visual-pipeline.ts](visual-pipeline.ts): orchestrates Motors 1 to 4 in sequence with `trace_id`, idempotency reuse, per-motor timing, and fail-fast pipeline errors.
- [debug-pipeline.ts](debug-pipeline.ts): local helper to inspect a campaign end-to-end during development.

Persistence strategy in this branch:

- Visual outputs are stored under `domain_input.visual_v2`.
- `image_url` is updated with the first rendered variation to preserve preview compatibility.
- No dedicated `visual_outputs` column exists in the current schema, so this branch keeps backward compatibility without introducing a migration.

Feature flag:

- `MOTOR_V2_ENABLED` lives in [../../constants/features.ts](../../constants/features.ts)
- Default behavior: enabled unless `NEXT_PUBLIC_MOTOR_V2_ENABLED=false`

Validation added in Story 4.5:

- [../../../tests/campaigns/visual-pipeline.test.ts](../../../tests/campaigns/visual-pipeline.test.ts)
- [../../../tests/campaigns/service-integration.test.ts](../../../tests/campaigns/service-integration.test.ts)
- [../../../tests/campaigns/backward-compat.test.ts](../../../tests/campaigns/backward-compat.test.ts)
- [../../../tests/campaigns/performance.test.ts](../../../tests/campaigns/performance.test.ts)