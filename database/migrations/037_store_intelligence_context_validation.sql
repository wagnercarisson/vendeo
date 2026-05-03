-- =============================================
-- Migration 037: store_intelligence_context_validation
-- Description: Phase 2.2 — JSON Schema validation for store_intelligence.context
-- Date: 2026-05-03
-- Phase: 2.2 (Governança — validação estrutural do JSONB)
-- Depends on: 031_store_intelligence.sql, 034_store_intelligence_context_v2_1.sql
-- 
-- Approach:
--   Creates an IMMUTABLE function that validates top-level field types.
--   All non-version fields are OPTIONAL — type is only checked when the key is present.
--   Accepts schema_version: '2.0', '2.1', '2.2'.
--   Constraint added as NOT VALID (does not re-validate existing rows) for safe deploy.
--   To validate existing rows after deploy: ALTER TABLE ... VALIDATE CONSTRAINT ...
-- =============================================

BEGIN;

-- =============================================
-- FUNCTION: validate_store_intelligence_context
-- Validates JSONB structure for store_intelligence.context
-- 
-- Rules:
--   schema_version  → required, must be '2.0' | '2.1' | '2.2'
--   string fields   → jsonb type 'string' or 'null' when key present
--   array fields    → jsonb type 'array'  or 'null' when key present
--   object fields   → jsonb type 'object' or 'null' when key present
--   numeric fields  → jsonb type 'number' or 'null' when key present
--
-- Returns FALSE on any type mismatch, TRUE otherwise.
-- IMMUTABLE: required for use in CHECK constraints.
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

    -- ── Object fields ─────────────────────────────────────────────────────
    IF p_context ? 'competitors'
       AND jsonb_typeof(p_context -> 'competitors') NOT IN ('object', 'null') THEN
        RETURN false;
    END IF;

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
    'Phase 2.2: validates top-level field types in store_intelligence.context JSONB. '
    'Required: schema_version IN (''2.0'', ''2.1'', ''2.2''). '
    'Optional fields validated by jsonb type when present. '
    'Returns false on mismatch, true otherwise. '
    'IMMUTABLE — safe for CHECK constraints.';

-- =============================================
-- CONSTRAINT: context_structure_valid
-- Validates field types beyond the existing context_has_schema_version check.
-- NOT VALID: skips re-validation of existing rows (safe deploy on populated databases).
-- To validate existing rows manually:
--   ALTER TABLE public.store_intelligence VALIDATE CONSTRAINT context_structure_valid;
-- =============================================

ALTER TABLE public.store_intelligence
    ADD CONSTRAINT context_structure_valid
    CHECK (public.validate_store_intelligence_context(context))
    NOT VALID;

-- =============================================
-- Update table comment to reflect v2.2 governance state
-- =============================================

COMMENT ON TABLE public.store_intelligence IS
    'Phase 2.2: governance layer active (context_structure_valid constraint, '
    'audit log via intelligence_audit_log, versioning columns, score snapshots). '
    'Phase 2.1: context expanded with 10 important fields. '
    'Phase 2.0: base table with 5 critical fields. '
    'Context schema_version accepted: ''2.0'' | ''2.1'' | ''2.2''. '
    'See docs/schemas/store-intelligence-context-v2.1.json for field definitions.';

COMMIT;
