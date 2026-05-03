-- =============================================
-- Migration 040: store_onboarding_state
-- Description: Phase 2.2 — Onboarding progress tracking for Intelligence Page
-- Date: 2026-05-03
-- Phase: 2.2 (Governança — Estado de onboarding progressivo)
-- Depends on: 031_store_intelligence.sql
--
-- Delivers:
--   1. store_onboarding_state table — tracks tab completion progress
--   2. RLS (owner-based, same pattern as migration 031/030)
--   3. Indexes for state queries
--   4. completed_tabs JSONB schema documented in column comments
--
-- completed_tabs JSONB structure:
--   {
--     "tab_1_publico_tom":       { "completed": bool, "completed_at": ISO8601 | null },
--     "tab_2_posicionamento":    { "completed": bool, "completed_at": ISO8601 | null },
--     "tab_3_conversao":         { "completed": bool, "completed_at": ISO8601 | null },
--     "tab_4_avancado":          { "completed": bool, "completed_at": ISO8601 | null }
--   }
-- =============================================

BEGIN;

-- =============================================
-- TABLE: store_onboarding_state
-- One row per store — tracks Intelligence Page onboarding progress.
-- =============================================

CREATE TABLE IF NOT EXISTS public.store_onboarding_state (
    id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id              uuid        NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,

    -- JSONB tracking per-tab completion (structure documented in column comment)
    completed_tabs        jsonb       NOT NULL DEFAULT '{
        "tab_1_publico_tom":    {"completed": false, "completed_at": null},
        "tab_2_posicionamento": {"completed": false, "completed_at": null},
        "tab_3_conversao":      {"completed": false, "completed_at": null},
        "tab_4_avancado":       {"completed": false, "completed_at": null}
    }'::jsonb,

    -- Derived convenience flag (set by application on last tab completion)
    is_complete           boolean     NOT NULL DEFAULT false,

    -- Onboarding entry point (helps track how user arrived)
    started_from          text        DEFAULT 'direct',
    -- 'direct' | 'campaign_creation' | 'dashboard_prompt' | 'email_cta'

    last_interaction_at   timestamptz NOT NULL DEFAULT now(),
    created_at            timestamptz NOT NULL DEFAULT now(),
    updated_at            timestamptz NOT NULL DEFAULT now(),

    -- One onboarding state record per store
    CONSTRAINT store_onboarding_state_store_unique UNIQUE (store_id),

    CONSTRAINT chk_onboarding_started_from
        CHECK (started_from IN ('direct', 'campaign_creation', 'dashboard_prompt', 'email_cta'))
);

COMMENT ON TABLE public.store_onboarding_state IS
    'Phase 2.2: tracks Intelligence Page onboarding progress per store. '
    'One row per store (UNIQUE store_id). '
    'Upserted by the frontend as the user completes each of the 4 Intelligence tabs. '
    'Used for: progressive modal triggers, completion funnel, onboarding drop-off analytics.';

COMMENT ON COLUMN public.store_onboarding_state.completed_tabs IS
    'JSONB map of tab completion state. Structure: '
    '{ '
    '  "tab_1_publico_tom":    { "completed": bool, "completed_at": ISO8601 | null }, '
    '  "tab_2_posicionamento": { "completed": bool, "completed_at": ISO8601 | null }, '
    '  "tab_3_conversao":      { "completed": bool, "completed_at": ISO8601 | null }, '
    '  "tab_4_avancado":       { "completed": bool, "completed_at": ISO8601 | null } '
    '}. '
    'completed_at is a UTC ISO8601 timestamp set when the tab is first marked complete.';

COMMENT ON COLUMN public.store_onboarding_state.is_complete IS
    'True when all 4 tabs have completed = true. '
    'Set by the application after the final tab is saved — not computed by DB trigger '
    'to avoid JSONB introspection overhead on every update.';

COMMENT ON COLUMN public.store_onboarding_state.started_from IS
    'Entry point that led the user to start onboarding. '
    'Values: direct | campaign_creation | dashboard_prompt | email_cta.';

COMMENT ON COLUMN public.store_onboarding_state.last_interaction_at IS
    'Timestamp of last any update to this record. '
    'Updated by application on every tab save.';

-- =============================================
-- TRIGGER: keep updated_at current
-- Reuses existing public.handle_updated_at() (created in migration 031 or earlier)
-- =============================================

DROP TRIGGER IF EXISTS set_store_onboarding_state_updated_at ON public.store_onboarding_state;
CREATE TRIGGER set_store_onboarding_state_updated_at
    BEFORE UPDATE ON public.store_onboarding_state
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- Indexes
-- =============================================

-- Fast lookup by store_id (most common query: "get onboarding state for this store")
-- Note: UNIQUE constraint on store_id already creates a B-tree index — no separate idx needed.

-- Analytics: find incomplete onboarding stores (funnel analysis)
CREATE INDEX IF NOT EXISTS idx_onboarding_state_incomplete
    ON public.store_onboarding_state(last_interaction_at DESC)
    WHERE is_complete = false;

-- Analytics: completed stores (to measure full-funnel conversion)
CREATE INDEX IF NOT EXISTS idx_onboarding_state_complete
    ON public.store_onboarding_state(store_id)
    WHERE is_complete = true;

-- =============================================
-- RLS: owner-based (same pattern as migration 031)
-- =============================================

ALTER TABLE public.store_onboarding_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_onboarding_state_select_owner" ON public.store_onboarding_state;
CREATE POLICY "store_onboarding_state_select_owner"
    ON public.store_onboarding_state
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_onboarding_state.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "store_onboarding_state_insert_owner" ON public.store_onboarding_state;
CREATE POLICY "store_onboarding_state_insert_owner"
    ON public.store_onboarding_state
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_onboarding_state.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "store_onboarding_state_update_owner" ON public.store_onboarding_state;
CREATE POLICY "store_onboarding_state_update_owner"
    ON public.store_onboarding_state
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_onboarding_state.store_id
              AND s.owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_onboarding_state.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

-- No DELETE policy: onboarding state is preserved even if store is modified
-- Cascade DELETE handled by FK ON DELETE CASCADE if store is deleted

COMMIT;
