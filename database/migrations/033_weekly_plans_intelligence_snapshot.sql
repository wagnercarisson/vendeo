-- =============================================
-- Migration 033: weekly_plans_intelligence_snapshot
-- Description: Phase 2.0 — Add intelligence_snapshot column to weekly_plans
-- Date: 2026-04-30
-- Phase: 2.0 (MVP Mínimo)
-- Note: Column is nullable by design — existing weekly_plans rows receive the DEFAULT.
--       Snapshot structure will be expanded in Phase 2.1 (no ALTER TABLE needed; JSONB).
--       No RLS changes needed — weekly_plans already has owner-based policies (Migration 002).
-- =============================================

BEGIN;

ALTER TABLE public.weekly_plans
    ADD COLUMN IF NOT EXISTS intelligence_snapshot jsonb
        DEFAULT '{"schema_version": "2.0"}'::jsonb;

COMMENT ON COLUMN public.weekly_plans.intelligence_snapshot IS
    'Phase 2.0: Point-in-time snapshot of store intelligence captured at plan creation. '
    'Allows auditing which intelligence version drove a given weekly plan. '
    'Structure v2.0: { '
    '  "schema_version": "2.0", '
    '  "store_id": "<uuid>", '
    '  "intelligence_score": 75, '
    '  "campaigns_analyzed": 23, '
    '  "snapshot_at": "2026-04-30T10:00:00Z" '
    '}. '
    'Expanded in Phase 2.1 to include brand_voice summary and seasonal context.';

COMMIT;
