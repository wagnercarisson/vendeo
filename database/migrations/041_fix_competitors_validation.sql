-- =============================================
-- Migration 041: fix_competitors_validation
-- Description: Fix type mismatch in validate_store_intelligence_context
--              competitors field was incorrectly classified as 'object'
--              but the entire codebase (TypeScript, UI, tests) treats it as 'array'
-- Date: 2026-05-04
-- Phase: 2.2 (bugfix — schema validation correction)
-- Depends on: 037_store_intelligence_context_validation.sql
--
-- Root Cause:
--   Migration 037 placed `competitors` in the Object fields block,
--   expecting jsonb_typeof = 'object'. However, the frontend has always
--   stored competitors as a string array (e.g. ["Loja A", "Loja B"]).
--   This caused ALL saves to fail with check constraint "context_structure_valid"
--   whenever the competitors key was present (including empty array []).
--
-- Fix:
--   Replace the function with a corrected version where competitors
--   is validated as ('array', 'null') instead of ('object', 'null').
--   No constraint recreation needed — CREATE OR REPLACE updates the function
--   in-place and the existing CHECK constraint calls it automatically.
--
-- Safe to apply:
--   - REPLACE only, no DROP
--   - No schema changes (no ADD/DROP COLUMN)
--   - Idempotent: can be run multiple times safely
-- =============================================

BEGIN;

-- =============================================
-- FUNCTION: validate_store_intelligence_context (v2 — bugfix)
-- Corrects competitors field type: object → array
-- =============================================

CREATE OR REPLACE FUNCTION public.validate_store_intelligence_context(p_context jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_schema_version text;
BEGIN
    -- ── schema_version: required ──────────────────────────────────────────
    v_schema_version := p_context ->> 'schema_version';
    IF v_schema_version IS NULL OR v_schema_version NOT IN ('2.0', '2.1', '2.2') THEN
        RETURN false;
    END IF;

    -- ── String fields ─────────────────────────────────────────────────────
    IF p_context ? 'brand_voice'
       AND jsonb_typeof(p_context -> 'brand_voice') NOT IN ('string', 'null') THEN
        RETURN false;
    END IF;

    IF p_context ? 'target_audience'
       AND jsonb_typeof(p_context -> 'target_audience') NOT IN ('string', 'null') THEN
        RETURN false;
    END IF;

    IF p_context ? 'main_differentiation'
       AND jsonb_typeof(p_context -> 'main_differentiation') NOT IN ('string', 'null') THEN
        RETURN false;
    END IF;

    IF p_context ? 'price_positioning'
       AND jsonb_typeof(p_context -> 'price_positioning') NOT IN ('string', 'null') THEN
        RETURN false;
    END IF;

    -- ── Array fields ──────────────────────────────────────────────────────
    IF p_context ? 'top_products'
       AND jsonb_typeof(p_context -> 'top_products') NOT IN ('array', 'null') THEN
        RETURN false;
    END IF;

    IF p_context ? 'seasonal_peaks'
       AND jsonb_typeof(p_context -> 'seasonal_peaks') NOT IN ('array', 'null') THEN
        RETURN false;
    END IF;

    IF p_context ? 'customer_pain_points'
       AND jsonb_typeof(p_context -> 'customer_pain_points') NOT IN ('array', 'null') THEN
        RETURN false;
    END IF;

    IF p_context ? 'successful_past_ctas'
       AND jsonb_typeof(p_context -> 'successful_past_ctas') NOT IN ('array', 'null') THEN
        RETURN false;
    END IF;

    IF p_context ? 'local_events_calendar'
       AND jsonb_typeof(p_context -> 'local_events_calendar') NOT IN ('array', 'null') THEN
        RETURN false;
    END IF;

    -- FIX: competitors is an array of strings (e.g. ["Loja A", "Loja B"])
    -- Was incorrectly: NOT IN ('object', 'null')
    IF p_context ? 'competitors'
       AND jsonb_typeof(p_context -> 'competitors') NOT IN ('array', 'null') THEN
        RETURN false;
    END IF;

    -- ── Object fields ─────────────────────────────────────────────────────
    IF p_context ? 'conversion_triggers'
       AND jsonb_typeof(p_context -> 'conversion_triggers') NOT IN ('object', 'null') THEN
        RETURN false;
    END IF;

    IF p_context ? 'unique_selling_proposition'
       AND jsonb_typeof(p_context -> 'unique_selling_proposition') NOT IN ('object', 'null') THEN
        RETURN false;
    END IF;

    IF p_context ? 'segment_specific_context'
       AND jsonb_typeof(p_context -> 'segment_specific_context') NOT IN ('object', 'null') THEN
        RETURN false;
    END IF;

    IF p_context ? 'language_specifics'
       AND jsonb_typeof(p_context -> 'language_specifics') NOT IN ('object', 'null') THEN
        RETURN false;
    END IF;

    IF p_context ? 'copy_length_preferences'
       AND jsonb_typeof(p_context -> 'copy_length_preferences') NOT IN ('object', 'null') THEN
        RETURN false;
    END IF;

    IF p_context ? 'store_location_context'
       AND jsonb_typeof(p_context -> 'store_location_context') NOT IN ('object', 'null') THEN
        RETURN false;
    END IF;

    -- ── Numeric fields ────────────────────────────────────────────────────
    IF p_context ? 'average_ticket_brl'
       AND jsonb_typeof(p_context -> 'average_ticket_brl') NOT IN ('number', 'null') THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;

COMMENT ON FUNCTION public.validate_store_intelligence_context(jsonb) IS
    'Phase 2.2 (v2 — migration 041 bugfix): validates top-level field types in store_intelligence.context JSONB. '
    'Required: schema_version IN (''2.0'', ''2.1'', ''2.2''). '
    'Optional fields validated by jsonb type when present. '
    'FIX (041): competitors validated as array (was incorrectly object in 037). '
    'Returns false on mismatch, true otherwise. '
    'IMMUTABLE — safe for CHECK constraints.';

COMMIT;
