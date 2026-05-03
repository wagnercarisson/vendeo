-- =============================================
-- Migration 038: intelligence_score_aggregations
-- Description: Phase 2.2 — Intelligence completeness score calculation and history tracking
-- Date: 2026-05-03
-- Phase: 2.2 (Governança — Agregações de score)
-- Depends on: 031_store_intelligence.sql, 037_store_intelligence_context_validation.sql
--
-- Delivers:
--   1. calculate_context_score(jsonb)     — pure function, used by triggers
--   2. calculate_intelligence_score(uuid) — convenience wrapper (reads from DB)
--   3. intelligence_score_snapshots       — history table (one row per context update)
--   4. RLS + indexes on snapshots
-- =============================================

BEGIN;

-- =============================================
-- FUNCTION: calculate_context_score
-- Computes completeness score directly from a JSONB context blob.
-- Used by triggers (BEFORE UPDATE) where the new context is not yet in the DB.
--
-- Scoring model (20 scoreable optional fields in v2.1 schema):
--   Tier A – String fields (4 pts each × 4 = max 4):
--     brand_voice, target_audience, main_differentiation, price_positioning
--   Tier B – Array fields (4 pts each × 5 = max 5):
--     top_products, seasonal_peaks, customer_pain_points,
--     successful_past_ctas, local_events_calendar
--   Tier C – Object fields (4 pts each × 4 = max 4):
--     competitors, conversion_triggers, segment_specific_context,
--     store_location_context
--   Tier D – Rich object fields (3 pts each × 3 = max 3):
--     unique_selling_proposition (+ primary_usp present = +1 bonus)
--     language_specifics (+ formality_level present = +1 bonus)
--     copy_length_preferences
--   Tier E – Numeric field (1 pt):
--     average_ticket_brl > 0
--   Total checkpoints: 20, score = LEAST(100, filled * 100 / 20)
--
-- Returns: TABLE(completeness_score INT, filled_fields_count INT, total_fields_count INT)
-- IMMUTABLE: same context always yields same score.
-- =============================================

CREATE OR REPLACE FUNCTION public.calculate_context_score(p_context jsonb)
RETURNS TABLE (
    completeness_score  int,
    filled_fields_count int,
    total_fields_count  int
)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_filled int := 0;
    v_total  int := 20;
BEGIN
    -- ── Tier A: String fields (non-null, non-empty) ───────────────────────
    IF (p_context ->> 'brand_voice') IS NOT NULL
       AND (p_context ->> 'brand_voice') <> '' THEN
        v_filled := v_filled + 1;
    END IF;

    IF (p_context ->> 'target_audience') IS NOT NULL
       AND (p_context ->> 'target_audience') <> '' THEN
        v_filled := v_filled + 1;
    END IF;

    IF (p_context ->> 'main_differentiation') IS NOT NULL
       AND (p_context ->> 'main_differentiation') <> '' THEN
        v_filled := v_filled + 1;
    END IF;

    IF (p_context ->> 'price_positioning') IS NOT NULL
       AND (p_context ->> 'price_positioning') <> '' THEN
        v_filled := v_filled + 1;
    END IF;

    -- ── Tier B: Array fields (non-null, non-empty array) ──────────────────
    IF (p_context -> 'top_products') IS NOT NULL
       AND jsonb_typeof(p_context -> 'top_products') = 'array'
       AND jsonb_array_length(p_context -> 'top_products') > 0 THEN
        v_filled := v_filled + 1;
    END IF;

    IF (p_context -> 'seasonal_peaks') IS NOT NULL
       AND jsonb_typeof(p_context -> 'seasonal_peaks') = 'array'
       AND jsonb_array_length(p_context -> 'seasonal_peaks') > 0 THEN
        v_filled := v_filled + 1;
    END IF;

    IF (p_context -> 'customer_pain_points') IS NOT NULL
       AND jsonb_typeof(p_context -> 'customer_pain_points') = 'array'
       AND jsonb_array_length(p_context -> 'customer_pain_points') > 0 THEN
        v_filled := v_filled + 1;
    END IF;

    IF (p_context -> 'successful_past_ctas') IS NOT NULL
       AND jsonb_typeof(p_context -> 'successful_past_ctas') = 'array'
       AND jsonb_array_length(p_context -> 'successful_past_ctas') > 0 THEN
        v_filled := v_filled + 1;
    END IF;

    IF (p_context -> 'local_events_calendar') IS NOT NULL
       AND jsonb_typeof(p_context -> 'local_events_calendar') = 'array'
       AND jsonb_array_length(p_context -> 'local_events_calendar') > 0 THEN
        v_filled := v_filled + 1;
    END IF;

    -- ── Tier C: Object fields (present and not null) ──────────────────────
    IF (p_context -> 'competitors') IS NOT NULL
       AND jsonb_typeof(p_context -> 'competitors') = 'object' THEN
        v_filled := v_filled + 1;
    END IF;

    IF (p_context -> 'conversion_triggers') IS NOT NULL
       AND jsonb_typeof(p_context -> 'conversion_triggers') = 'object' THEN
        v_filled := v_filled + 1;
    END IF;

    IF (p_context -> 'segment_specific_context') IS NOT NULL
       AND jsonb_typeof(p_context -> 'segment_specific_context') = 'object' THEN
        v_filled := v_filled + 1;
    END IF;

    IF (p_context -> 'store_location_context') IS NOT NULL
       AND jsonb_typeof(p_context -> 'store_location_context') = 'object' THEN
        v_filled := v_filled + 1;
    END IF;

    -- ── Tier D: Rich objects — base presence + bonus for key sub-fields ───
    -- unique_selling_proposition: base count
    IF (p_context -> 'unique_selling_proposition') IS NOT NULL
       AND jsonb_typeof(p_context -> 'unique_selling_proposition') = 'object' THEN
        v_filled := v_filled + 1;
    END IF;

    -- language_specifics: base count
    IF (p_context -> 'language_specifics') IS NOT NULL
       AND jsonb_typeof(p_context -> 'language_specifics') = 'object' THEN
        v_filled := v_filled + 1;
    END IF;

    -- copy_length_preferences: base count
    IF (p_context -> 'copy_length_preferences') IS NOT NULL
       AND jsonb_typeof(p_context -> 'copy_length_preferences') = 'object' THEN
        v_filled := v_filled + 1;
    END IF;

    -- Bonus: unique_selling_proposition.primary_usp filled
    IF (p_context -> 'unique_selling_proposition' ->> 'primary_usp') IS NOT NULL
       AND (p_context -> 'unique_selling_proposition' ->> 'primary_usp') <> '' THEN
        v_filled := v_filled + 1;
    END IF;

    -- Bonus: language_specifics.formality_level filled
    IF (p_context -> 'language_specifics' ->> 'formality_level') IS NOT NULL
       AND (p_context -> 'language_specifics' ->> 'formality_level') <> '' THEN
        v_filled := v_filled + 1;
    END IF;

    -- ── Tier E: Numeric field ─────────────────────────────────────────────
    IF (p_context -> 'average_ticket_brl') IS NOT NULL
       AND jsonb_typeof(p_context -> 'average_ticket_brl') = 'number'
       AND (p_context ->> 'average_ticket_brl')::numeric > 0 THEN
        v_filled := v_filled + 1;
    END IF;

    RETURN QUERY SELECT
        LEAST(100, (v_filled * 100 / v_total))::int,
        v_filled,
        v_total;
END;
$$;

COMMENT ON FUNCTION public.calculate_context_score(jsonb) IS
    'Phase 2.2: computes intelligence completeness score (0-100) from a raw JSONB context blob. '
    'Scores 20 optional fields across 5 tiers (strings, arrays, objects, rich objects, numerics). '
    'Returns TABLE(completeness_score, filled_fields_count, total_fields_count). '
    'IMMUTABLE — safe to call in triggers with NEW.context before row is committed.';

-- =============================================
-- FUNCTION: calculate_intelligence_score
-- Convenience wrapper: reads context from DB by store_id.
-- Used for on-demand score queries (not by triggers).
-- =============================================

CREATE OR REPLACE FUNCTION public.calculate_intelligence_score(p_store_id uuid)
RETURNS TABLE (
    completeness_score  int,
    filled_fields_count int,
    total_fields_count  int
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_context jsonb;
BEGIN
    SELECT context INTO v_context
    FROM public.store_intelligence
    WHERE store_id = p_store_id;

    IF v_context IS NULL THEN
        RETURN QUERY SELECT 0::int, 0::int, 20::int;
        RETURN;
    END IF;

    RETURN QUERY SELECT * FROM public.calculate_context_score(v_context);
END;
$$;

COMMENT ON FUNCTION public.calculate_intelligence_score(uuid) IS
    'Phase 2.2: convenience wrapper that reads context from store_intelligence by store_id '
    'and delegates to calculate_context_score(jsonb). '
    'Use for on-demand scoring. Do NOT use inside triggers — use calculate_context_score(NEW.context) instead. '
    'STABLE — reads DB, same store_id may give different results across transactions.';

-- =============================================
-- TABLE: intelligence_score_snapshots
-- Point-in-time score history per store.
-- One row inserted per context update (by trigger in migration 039).
-- =============================================

CREATE TABLE IF NOT EXISTS public.intelligence_score_snapshots (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            uuid        NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    snapshot_at         timestamptz NOT NULL DEFAULT now(),
    completeness_score  int         NOT NULL CHECK (completeness_score BETWEEN 0 AND 100),
    filled_fields_count int         NOT NULL CHECK (filled_fields_count >= 0),
    total_fields_count  int         NOT NULL CHECK (total_fields_count > 0),
    trigger_event       text        NOT NULL DEFAULT 'api_update',
    -- 'api_update' | 'manual_save' | 'onboarding_complete' | 'recalculation'

    CONSTRAINT chk_snapshot_filled_not_exceed_total
        CHECK (filled_fields_count <= total_fields_count)
);

COMMENT ON TABLE public.intelligence_score_snapshots IS
    'Phase 2.2: point-in-time intelligence completeness score snapshots per store. '
    'One row inserted per store_intelligence.context update via fn_store_intelligence_after_update trigger. '
    'Used for: completion funnel analytics, engagement drop-off, LTV correlation. '
    'Immutable — rows are never updated, only inserted.';

COMMENT ON COLUMN public.intelligence_score_snapshots.completeness_score IS
    'Completeness percentage (0-100). Computed by calculate_context_score(NEW.context) in trigger.';

COMMENT ON COLUMN public.intelligence_score_snapshots.trigger_event IS
    'Source of this snapshot: api_update | manual_save | onboarding_complete | recalculation.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_score_snapshots_store_time
    ON public.intelligence_score_snapshots(store_id, snapshot_at DESC);

CREATE INDEX IF NOT EXISTS idx_score_snapshots_score_analytics
    ON public.intelligence_score_snapshots(completeness_score, snapshot_at DESC);

-- RLS
ALTER TABLE public.intelligence_score_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "score_snapshots_select_owner" ON public.intelligence_score_snapshots;
CREATE POLICY "score_snapshots_select_owner"
    ON public.intelligence_score_snapshots
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = intelligence_score_snapshots.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

-- Inserts only via service role / trigger (SECURITY DEFINER)
DROP POLICY IF EXISTS "score_snapshots_insert_service" ON public.intelligence_score_snapshots;
CREATE POLICY "score_snapshots_insert_service"
    ON public.intelligence_score_snapshots
    FOR INSERT
    WITH CHECK (true);
-- Note: no UPDATE or DELETE — snapshots are immutable history

COMMIT;
