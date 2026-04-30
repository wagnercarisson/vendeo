-- =============================================
-- Migration 034: store_intelligence_context_v2_1
-- Description: Phase 2.1 — Document expanded context structure (JSONB v2.0 → v2.1)
-- Date: 2026-04-30
-- Phase: 2.1 (Expansão — +10 campos importantes)
-- Note: NO ALTER TABLE needed — JSONB is schemaless. The backend populates v2.1 fields
--       via UPDATE after onboarding progressive modals (implemented by @ux-design-expert).
--       This migration solely updates the table/column documentation to reflect v2.1 structure.
-- =============================================

BEGIN;

-- =============================================
-- COMMENT: store_intelligence (v2.1 structure)
-- =============================================

COMMENT ON TABLE public.store_intelligence IS
    'Phase 2.1: context expanded with 10 important fields (customer_pain_points, '
    'conversion_triggers, successful_past_ctas, unique_selling_proposition, '
    'average_ticket_brl, local_events_calendar, segment_specific_context, '
    'language_specifics, copy_length_preferences, store_location_context). '
    'Context v2.0 keys: schema_version, brand_voice, seasonal_peaks, target_audience, '
    'main_differentiation, top_products, price_positioning, competitors, '
    '_deprecated_best_days (→ learned_patterns in Phase 2.2), '
    '_deprecated_best_hours (→ learned_patterns in Phase 2.2). '
    'See docs/schemas/store-intelligence-context-v2.1.json for full JSON Schema. '
    'Governance triggers added in Phase 2.2 (Migration 036).';

COMMENT ON COLUMN public.store_intelligence.context IS
    'Tier 2: manual context from store owner via progressive onboarding. '
    'Schema enforced by constraint context_has_schema_version. '
    'v2.0 structure: brand_voice, seasonal_peaks + original fields. '
    'v2.1 additions: customer_pain_points (array<string>), '
    'conversion_triggers (object: urgency_preference, scarcity_comfortable, social_proof_available, guarantee_offered), '
    'successful_past_ctas (array<object: cta, approval_speed_seconds, context>), '
    'unique_selling_proposition (object: primary_usp, supporting_points, proof_elements), '
    'average_ticket_brl (numeric), '
    'local_events_calendar (array<string>), '
    'segment_specific_context (object — keyed by main_segment, e.g. "adega"), '
    'language_specifics (object: uses_regional_slang, formality_level, emoji_comfort, max_exclamations_per_copy), '
    'copy_length_preferences (object: headline_max_words, body_max_words, prefers_brevity), '
    'store_location_context (object: neighborhood_type, foot_traffic, near_competitors, parking_available). '
    'Fields prefixed _deprecated_* will move to learned_patterns in Phase 2.2.';

COMMIT;
