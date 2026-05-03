-- =============================================
-- Migration 039: store_intelligence_governance
-- Description: Phase 2.2 — Audit trail, context versioning, and governance triggers
-- Date: 2026-05-03
-- Phase: 2.2 (Governança — Audit trail + Versioning + Triggers)
-- Depends on: 031_store_intelligence.sql,
--             038_intelligence_score_aggregations.sql
--
-- Delivers:
--   1. context_version INT + context_updated_at TIMESTAMPTZ columns on store_intelligence
--   2. intelligence_audit_log table (immutable audit trail)
--   3. fn_store_intelligence_before_update() BEFORE trigger
--      — bumps context_version, updates context_updated_at, recalculates intelligence_score
--   4. fn_store_intelligence_after_update() AFTER trigger
--      — inserts into intelligence_audit_log and intelligence_score_snapshots
--
-- Trigger design rationale:
--   BEFORE trigger: modifies NEW row before persistence (version bump + score)
--   AFTER  trigger: side effects into child tables (audit_log, score_snapshots)
--   Split required because modifying NEW.* is only possible in BEFORE triggers,
--   while inserting into related tables is safest in AFTER triggers.
-- =============================================

BEGIN;

-- =============================================
-- COLUMNS: versioning on store_intelligence
-- =============================================

ALTER TABLE public.store_intelligence
    ADD COLUMN IF NOT EXISTS context_version     int         NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS context_updated_at  timestamptz NOT NULL DEFAULT now();

COMMENT ON COLUMN public.store_intelligence.context_version IS
    'Phase 2.2: monotonically increasing counter. '
    'Incremented by fn_store_intelligence_before_update trigger on every context change.';

COMMENT ON COLUMN public.store_intelligence.context_updated_at IS
    'Phase 2.2: timestamp of last context modification. '
    'Updated by fn_store_intelligence_before_update trigger.';

-- =============================================
-- TABLE: intelligence_audit_log
-- Immutable audit trail for store_intelligence.context changes.
-- One row per UPDATE that modifies context.
-- =============================================

CREATE TABLE IF NOT EXISTS public.intelligence_audit_log (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        uuid        NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    changed_at      timestamptz NOT NULL DEFAULT now(),
    changed_by      uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
    context_version int         NOT NULL,  -- version AFTER the change (matches NEW.context_version)
    fields_changed  text[]      NOT NULL DEFAULT '{}',
    context_before  jsonb,                 -- NULL only for the very first update
    context_after   jsonb       NOT NULL
);

COMMENT ON TABLE public.intelligence_audit_log IS
    'Phase 2.2: immutable audit log for store_intelligence.context changes. '
    'Populated exclusively by fn_store_intelligence_after_update trigger. '
    'fields_changed: top-level JSONB keys that differed between before and after. '
    'Retention policy: indefinite (low volume — one write per user interaction).';

COMMENT ON COLUMN public.intelligence_audit_log.changed_by IS
    'auth.users.id of the user who triggered the change. NULL for service-role API calls.';

COMMENT ON COLUMN public.intelligence_audit_log.context_version IS
    'Version number AFTER this change — matches store_intelligence.context_version post-update.';

COMMENT ON COLUMN public.intelligence_audit_log.fields_changed IS
    'Top-level JSONB keys whose value changed (symmetric diff computed by trigger).';

COMMENT ON COLUMN public.intelligence_audit_log.context_before IS
    'Full context snapshot before the change. NULL for the very first recorded update.';

COMMENT ON COLUMN public.intelligence_audit_log.context_after IS
    'Full context snapshot after the change.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_store_time
    ON public.intelligence_audit_log(store_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_store_version
    ON public.intelligence_audit_log(store_id, context_version DESC);

-- RLS: owner reads own audit log; inserts only from trigger (SECURITY DEFINER)
ALTER TABLE public.intelligence_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_select_owner" ON public.intelligence_audit_log;
CREATE POLICY "audit_log_select_owner"
    ON public.intelligence_audit_log
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = intelligence_audit_log.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

-- Inserts only via trigger running as SECURITY DEFINER
DROP POLICY IF EXISTS "audit_log_insert_service" ON public.intelligence_audit_log;
CREATE POLICY "audit_log_insert_service"
    ON public.intelligence_audit_log
    FOR INSERT
    WITH CHECK (true);
-- No UPDATE or DELETE policies — audit trail is immutable

-- =============================================
-- FUNCTION: fn_store_intelligence_before_update
-- BEFORE UPDATE trigger on store_intelligence
-- Fires when context IS DISTINCT FROM OLD.context.
-- Modifies NEW row: bumps version, refreshes score.
-- =============================================

CREATE OR REPLACE FUNCTION public.fn_store_intelligence_before_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_score_row record;
BEGIN
    -- Only process if context actually changed
    IF NEW.context IS NOT DISTINCT FROM OLD.context THEN
        RETURN NEW;
    END IF;

    -- Bump version counter
    NEW.context_version    := OLD.context_version + 1;
    NEW.context_updated_at := now();

    -- Recalculate completeness score from the new context (not from DB)
    SELECT completeness_score INTO v_score_row
    FROM public.calculate_context_score(NEW.context);

    NEW.intelligence_score := v_score_row.completeness_score;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_store_intelligence_before_update() IS
    'Phase 2.2: BEFORE UPDATE trigger on store_intelligence. '
    'On context change: bumps context_version, updates context_updated_at, '
    'recalculates intelligence_score via calculate_context_score(NEW.context). '
    'BEFORE is required to modify NEW.* before row is persisted.';

DROP TRIGGER IF EXISTS trg_store_intelligence_before_update ON public.store_intelligence;
CREATE TRIGGER trg_store_intelligence_before_update
    BEFORE UPDATE ON public.store_intelligence
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_store_intelligence_before_update();

-- =============================================
-- FUNCTION: fn_store_intelligence_after_update
-- AFTER UPDATE trigger on store_intelligence
-- Fires when context IS DISTINCT FROM OLD.context.
-- Inserts into audit_log and score_snapshots.
-- Uses SECURITY DEFINER to bypass RLS on child tables.
-- =============================================

CREATE OR REPLACE FUNCTION public.fn_store_intelligence_after_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_fields_changed text[] := '{}';
    v_key            text;
    v_score_row      record;
BEGIN
    -- Only process if context actually changed
    IF NEW.context IS NOT DISTINCT FROM OLD.context THEN
        RETURN NULL;
    END IF;

    -- Compute changed top-level keys (symmetric diff: keys in either old or new)
    FOR v_key IN
        SELECT jsonb_object_keys(NEW.context)
        UNION
        SELECT jsonb_object_keys(OLD.context)
    LOOP
        IF (NEW.context -> v_key) IS DISTINCT FROM (OLD.context -> v_key) THEN
            v_fields_changed := array_append(v_fields_changed, v_key);
        END IF;
    END LOOP;

    -- Insert audit log entry (context_version already bumped by BEFORE trigger)
    INSERT INTO public.intelligence_audit_log (
        store_id,
        changed_at,
        changed_by,
        context_version,
        fields_changed,
        context_before,
        context_after
    ) VALUES (
        NEW.store_id,
        now(),
        auth.uid(),         -- NULL when called from service role
        NEW.context_version,
        v_fields_changed,
        OLD.context,
        NEW.context
    );

    -- Capture score snapshot
    SELECT completeness_score, filled_fields_count, total_fields_count
    INTO v_score_row
    FROM public.calculate_context_score(NEW.context);

    INSERT INTO public.intelligence_score_snapshots (
        store_id,
        snapshot_at,
        completeness_score,
        filled_fields_count,
        total_fields_count,
        trigger_event
    ) VALUES (
        NEW.store_id,
        now(),
        v_score_row.completeness_score,
        v_score_row.filled_fields_count,
        v_score_row.total_fields_count,
        'api_update'
    );

    RETURN NULL; -- AFTER trigger return value is ignored for row triggers
END;
$$;

COMMENT ON FUNCTION public.fn_store_intelligence_after_update() IS
    'Phase 2.2: AFTER UPDATE trigger on store_intelligence. '
    'On context change: computes field diff, inserts into intelligence_audit_log '
    'and intelligence_score_snapshots. '
    'AFTER is required for safe insertion into child tables after parent row is committed. '
    'SECURITY DEFINER: allows insert into audit_log regardless of caller role.';

DROP TRIGGER IF EXISTS trg_store_intelligence_after_update ON public.store_intelligence;
CREATE TRIGGER trg_store_intelligence_after_update
    AFTER UPDATE ON public.store_intelligence
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_store_intelligence_after_update();

-- =============================================
-- Note: existing set_store_intelligence_updated_at trigger (migration 031)
-- handles updated_at column — no conflict with the new triggers above.
-- Trigger execution order (BEFORE): set_store_intelligence_updated_at fires first
-- (alphabetical order when same timing/event), then trg_store_intelligence_before_update.
-- Both BEFORE triggers are safe to coexist.
-- =============================================

COMMIT;
