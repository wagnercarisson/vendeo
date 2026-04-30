-- =============================================
-- Migration 032: campaign_events
-- Description: Phase 2.0 — Events table for campaign analytics (3 critical fields)
-- Date: 2026-04-30
-- Phase: 2.0 (MVP Mínimo)
-- Note: 3 critical fields added: prompt_version (A/B testing), approval_rating (quality
--       feedback), approval_duration_seconds + edited_fields (edit tracking base).
--       Expanded in Phase 2.1 with weather_context, commercial_result_feedback,
--       structured edit tracking, and performance metrics (Migration 035).
-- =============================================

BEGIN;

-- =============================================
-- TABLE: campaign_events
-- =============================================

CREATE TABLE IF NOT EXISTS public.campaign_events (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    uuid        NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    campaign_id uuid        REFERENCES public.campaigns(id) ON DELETE CASCADE,

    event_type  text        NOT NULL,
    event_data  jsonb       NOT NULL DEFAULT '{}'::jsonb,

    -- Typed analytics dimensions
    event_objective     text,
    event_audience      text,
    event_price         numeric,
    event_day_of_week   smallint,
    event_hour          smallint,

    -- Phase 2.0 critical field 1: A/B testing base
    prompt_version      text        NOT NULL DEFAULT 'v1.0',

    -- Phase 2.0 critical field 2: quality feedback (1–5 stars, NULL if not applicable)
    approval_rating     smallint,

    -- Phase 2.0 critical field 3: edit tracking base
    approval_duration_seconds   int,
    edited_fields               text[],

    source      text        NOT NULL DEFAULT 'app',
    created_at  timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT campaign_events_type_check CHECK (
        event_type IN ('created', 'approved', 'regenerated', 'published', 'performed')
    ),
    CONSTRAINT campaign_events_day_check CHECK (
        event_day_of_week IS NULL OR (event_day_of_week BETWEEN 1 AND 7)
    ),
    CONSTRAINT campaign_events_hour_check CHECK (
        event_hour IS NULL OR (event_hour BETWEEN 0 AND 23)
    ),
    CONSTRAINT campaign_events_rating_check CHECK (
        approval_rating IS NULL OR (approval_rating BETWEEN 1 AND 5)
    ),
    CONSTRAINT approval_duration_positive CHECK (
        approval_duration_seconds IS NULL OR approval_duration_seconds >= 0
    ),
    CONSTRAINT source_valid CHECK (
        source IN ('app', 'api', 'webhook', 'cron')
    )
);

COMMENT ON TABLE public.campaign_events IS
    'Phase 2.0: Campaign event log with 3 critical fields (prompt_version, '
    'approval_rating, approval_duration_seconds + edited_fields). '
    'Expanded in Phase 2.1 with weather_context, commercial_result_feedback, '
    'structured edit_tracking, and performance metrics (Migration 035).';

-- =============================================
-- INDEXES: campaign_events
-- =============================================

-- Lookup by store (used in almost every query)
CREATE INDEX IF NOT EXISTS idx_campaign_events_store_id
    ON public.campaign_events(store_id);

-- Lookup by campaign
CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign_id
    ON public.campaign_events(campaign_id);

-- Time-range queries scoped by store (replaces a plain created_at index — always filtered by store)
CREATE INDEX IF NOT EXISTS idx_campaign_events_store_created
    ON public.campaign_events(store_id, created_at DESC);

-- Event type queries (low cardinality — composite with store_id makes it selective)
CREATE INDEX IF NOT EXISTS idx_campaign_events_type_store
    ON public.campaign_events(event_type, store_id);

-- A/B prompt testing: only approved/regenerated events carry meaningful rating data
CREATE INDEX IF NOT EXISTS idx_campaign_events_prompt_version
    ON public.campaign_events(prompt_version, approval_rating)
    WHERE event_type IN ('approved', 'regenerated');

-- =============================================
-- RLS: campaign_events
-- Pattern: owner_user_id on stores is the access anchor (same as migrations 030, 002)
-- =============================================

ALTER TABLE public.campaign_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaign_events_select_owner" ON public.campaign_events;
CREATE POLICY "campaign_events_select_owner" ON public.campaign_events
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = campaign_events.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "campaign_events_insert_owner" ON public.campaign_events;
CREATE POLICY "campaign_events_insert_owner" ON public.campaign_events
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = campaign_events.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "campaign_events_update_owner" ON public.campaign_events;
CREATE POLICY "campaign_events_update_owner" ON public.campaign_events
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = campaign_events.store_id
              AND s.owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = campaign_events.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "campaign_events_delete_owner" ON public.campaign_events;
CREATE POLICY "campaign_events_delete_owner" ON public.campaign_events
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = campaign_events.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

COMMIT;
