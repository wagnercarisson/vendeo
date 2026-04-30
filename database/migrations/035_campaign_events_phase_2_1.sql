-- =============================================
-- Migration 035: campaign_events_phase_2_1
-- Description: Phase 2.1 — Expand campaign_events with weather context, commercial
--              result feedback, structured edit tracking, and performance metrics
-- Date: 2026-04-30
-- Phase: 2.1 (Expansão)
-- Note: ADD COLUMN uses IF NOT EXISTS (idempotent).
--       ADD CONSTRAINT has no IF NOT EXISTS in PostgreSQL — migration system prevents re-runs.
--       Multiple ADD COLUMN clauses in a single ALTER TABLE is atomic (all or nothing).
-- =============================================

BEGIN;

-- =============================================
-- COLUMNS: campaign_events (Phase 2.1 additions)
-- Single atomic statement — all columns added together or none.
-- =============================================

ALTER TABLE public.campaign_events
    -- Weather Context (@commerce-strategist: heat 30°C+ = +40% cold beer campaigns)
    ADD COLUMN IF NOT EXISTS weather_temperature_celsius  smallint,
    ADD COLUMN IF NOT EXISTS weather_condition            text,

    -- Commercial Result Feedback (closes the loop: approved → did it sell?)
    -- Structure: {"sales_impact": "alto|medio|baixo", "reported_at": "2026-05-01T10:00:00Z"}
    ADD COLUMN IF NOT EXISTS commercial_result_feedback   jsonb,

    -- Edit Tracking — structured diff analysis for learning from edits
    ADD COLUMN IF NOT EXISTS edit_magnitude               text,
    ADD COLUMN IF NOT EXISTS original_content             jsonb,
    ADD COLUMN IF NOT EXISTS edited_content               jsonb,

    -- Performance Metrics (@prompt-eng: latency + cost optimization)
    ADD COLUMN IF NOT EXISTS generation_latency_ms        int,
    ADD COLUMN IF NOT EXISTS token_count_input            int,
    ADD COLUMN IF NOT EXISTS token_count_output           int;

-- =============================================
-- CONSTRAINTS: campaign_events (Phase 2.1)
-- Direct ALTER TABLE per project pattern (migrations 003–005).
-- Migration system (Supabase) guarantees single execution.
-- =============================================

ALTER TABLE public.campaign_events
    ADD CONSTRAINT events_magnitude_check CHECK (
        edit_magnitude IS NULL OR
        edit_magnitude IN ('none', 'minor', 'major', 'rewrite')
    ),
    ADD CONSTRAINT events_weather_condition_check CHECK (
        weather_condition IS NULL OR
        weather_condition IN ('sunny', 'cloudy', 'rainy', 'cold', 'hot', 'stormy')
    ),
    ADD CONSTRAINT events_weather_temp_check CHECK (
        weather_temperature_celsius IS NULL OR
        weather_temperature_celsius BETWEEN -20 AND 50
    ),
    ADD CONSTRAINT events_latency_check CHECK (
        generation_latency_ms IS NULL OR generation_latency_ms >= 0
    ),
    ADD CONSTRAINT events_token_input_check CHECK (
        token_count_input IS NULL OR token_count_input >= 0
    ),
    ADD CONSTRAINT events_token_output_check CHECK (
        token_count_output IS NULL OR token_count_output >= 0
    );

-- =============================================
-- INDEXES: campaign_events (Phase 2.1)
-- Partial indexes — only index rows where the field is populated.
-- =============================================

-- Weather-based analysis (seasonal/climate impact on campaign performance)
CREATE INDEX IF NOT EXISTS idx_campaign_events_weather
    ON public.campaign_events(weather_condition, weather_temperature_celsius)
    WHERE weather_condition IS NOT NULL;

-- Edit quality analysis (low rating + heavy edit = prompt needs improvement)
CREATE INDEX IF NOT EXISTS idx_campaign_events_edit_quality
    ON public.campaign_events(approval_rating, edit_magnitude)
    WHERE approval_rating IS NOT NULL;

-- Performance monitoring (latency outliers and cost analysis)
CREATE INDEX IF NOT EXISTS idx_campaign_events_performance
    ON public.campaign_events(generation_latency_ms)
    WHERE generation_latency_ms IS NOT NULL;

-- =============================================
-- COMMENT: campaign_events (updated for Phase 2.1)
-- =============================================

COMMENT ON TABLE public.campaign_events IS
    'Phase 2.1: Expanded with weather_context (temperature + condition), '
    'commercial_result_feedback ({"sales_impact": "alto|medio|baixo", "reported_at": "..."}), '
    'structured edit_tracking (edit_magnitude: none|minor|major|rewrite, original_content, edited_content), '
    'performance metrics (generation_latency_ms, token_count_input, token_count_output). '
    'Weather: heat 30C+ correlates with +40% cold beer campaign demand. '
    'Commercial feedback: closes the loop — approved campaign → did it actually sell? '
    'Edit tracking: diff analysis for prompt quality learning. '
    'Performance: latency + token tracking for cost and SLA optimization. '
    'Phase 2.2 adds ML indexes, monthly aggregation, and 90-day TTL cleanup (Migrations 037–039).';

COMMENT ON COLUMN public.campaign_events.edit_magnitude IS
    'Structured edit classification: none (approved as-is), minor (small tweaks), '
    'major (significant rewrite of parts), rewrite (full replacement). '
    'Combined with approval_rating to identify prompt quality issues. '
    'NULL means edit status not yet recorded (pre-Phase 2.1 events).';

COMMENT ON COLUMN public.campaign_events.commercial_result_feedback IS
    'Owner-reported sales impact after campaign publication. '
    'Structure: {"sales_impact": "alto|medio|baixo", "reported_at": "<iso8601>"}. '
    'Populated asynchronously by owner feedback flow (not at event creation time). '
    'NULL = feedback not yet collected.';

COMMIT;
