-- =============================================
-- Migration 031: store_intelligence
-- Description: Phase 2.0 — Base table for store intelligence context (5 critical fields)
-- Date: 2026-04-30
-- Phase: 2.0 (MVP Mínimo)
-- Note: UNIQUE(store_id) creates a B-tree index automatically — no separate index added.
--       Table expanded in Phase 2.1 with 10 additional fields (Migration 034).
-- =============================================

BEGIN;

-- =============================================
-- TABLE: store_intelligence
-- =============================================

CREATE TABLE IF NOT EXISTS public.store_intelligence (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        uuid        NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,

    -- Tier 2: manual store context, collected via progressive onboarding
    context         jsonb       NOT NULL DEFAULT '{"schema_version": "2.0"}'::jsonb,

    -- Tier 3: patterns passively learned by the system over time
    learned_patterns jsonb      NOT NULL DEFAULT '{"schema_version": "2.0"}'::jsonb,

    intelligence_score  int     NOT NULL DEFAULT 0,
    last_learned        timestamptz,
    campaigns_analyzed  int     NOT NULL DEFAULT 0,

    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    -- One intelligence record per store
    CONSTRAINT store_intelligence_store_unique UNIQUE (store_id),

    -- schema_version must be present and non-empty (? operator accepts null values — use ->>)
    CONSTRAINT context_has_schema_version CHECK (
        (context ->> 'schema_version') IS NOT NULL AND
        (context ->> 'schema_version') <> ''
    ),
    CONSTRAINT learned_patterns_has_schema_version CHECK (
        (learned_patterns ->> 'schema_version') IS NOT NULL AND
        (learned_patterns ->> 'schema_version') <> ''
    ),

    -- Bounded score (0–100) and non-negative counter
    CONSTRAINT intelligence_score_range CHECK (intelligence_score BETWEEN 0 AND 100),
    CONSTRAINT campaigns_analyzed_positive CHECK (campaigns_analyzed >= 0)
);

COMMENT ON TABLE public.store_intelligence IS
    'Phase 2.0: Base intelligence table (5 critical fields: brand_voice, seasonal_peaks + original fields). '
    'context v2.0 keys: schema_version, brand_voice, seasonal_peaks, target_audience, '
    'main_differentiation, top_products, price_positioning, competitors, '
    '_deprecated_best_days (→ learned_patterns in Phase 2.2), '
    '_deprecated_best_hours (→ learned_patterns in Phase 2.2). '
    'Expanded in Phase 2.1 via Migration 034 (JSONB — no ALTER TABLE needed).';

COMMENT ON COLUMN public.store_intelligence.context IS
    'Tier 2: manual context from store owner. '
    'Schema enforced by constraint context_has_schema_version. '
    'Fields prefixed _deprecated_* will move to learned_patterns in Phase 2.2.';

COMMENT ON COLUMN public.store_intelligence.learned_patterns IS
    'Tier 3: patterns passively learned from campaign performance. '
    'Populated by background jobs — not editable by store owner.';

-- =============================================
-- TRIGGER: keep updated_at current on every UPDATE
-- Uses existing public.handle_updated_at() function
-- =============================================

DROP TRIGGER IF EXISTS set_store_intelligence_updated_at ON public.store_intelligence;
CREATE TRIGGER set_store_intelligence_updated_at
    BEFORE UPDATE ON public.store_intelligence
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- RLS: store_intelligence
-- Pattern: owner_user_id on stores is the access anchor (same as migrations 030, 002)
-- =============================================

ALTER TABLE public.store_intelligence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_intelligence_select_owner" ON public.store_intelligence;
CREATE POLICY "store_intelligence_select_owner" ON public.store_intelligence
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_intelligence.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "store_intelligence_insert_owner" ON public.store_intelligence;
CREATE POLICY "store_intelligence_insert_owner" ON public.store_intelligence
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_intelligence.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "store_intelligence_update_owner" ON public.store_intelligence;
CREATE POLICY "store_intelligence_update_owner" ON public.store_intelligence
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_intelligence.store_id
              AND s.owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_intelligence.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "store_intelligence_delete_owner" ON public.store_intelligence;
CREATE POLICY "store_intelligence_delete_owner" ON public.store_intelligence
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_intelligence.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

COMMIT;
