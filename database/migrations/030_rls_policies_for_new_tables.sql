-- =============================================
-- Migration 030: rls_policies_for_new_tables
-- Description: RLS enable + owner-based policies for all tables introduced in 017-027
-- Date: 2026-04-29
-- Pattern: owner_user_id on stores table is the anchor for all access checks
-- Note: visual_signatures, visual_signature_profiles, visual_reader_cache have RLS
--       enabled but no row-level policies (server-side / service_role access only)
-- =============================================

BEGIN;

-- =============================================
-- store_branches
-- =============================================

ALTER TABLE public.store_branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_branches_select_owner" ON public.store_branches;
CREATE POLICY "store_branches_select_owner" ON public.store_branches
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_branches.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "store_branches_insert_owner" ON public.store_branches;
CREATE POLICY "store_branches_insert_owner" ON public.store_branches
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_branches.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "store_branches_update_owner" ON public.store_branches;
CREATE POLICY "store_branches_update_owner" ON public.store_branches
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_branches.store_id
              AND s.owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_branches.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "store_branches_delete_owner" ON public.store_branches;
CREATE POLICY "store_branches_delete_owner" ON public.store_branches
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_branches.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

-- =============================================
-- store_members
-- =============================================

ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_members_select_owner" ON public.store_members;
CREATE POLICY "store_members_select_owner" ON public.store_members
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_members.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "store_members_insert_owner" ON public.store_members;
CREATE POLICY "store_members_insert_owner" ON public.store_members
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_members.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "store_members_update_owner" ON public.store_members;
CREATE POLICY "store_members_update_owner" ON public.store_members
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_members.store_id
              AND s.owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_members.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "store_members_delete_owner" ON public.store_members;
CREATE POLICY "store_members_delete_owner" ON public.store_members
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = store_members.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

-- =============================================
-- campaign_branches
-- =============================================

ALTER TABLE public.campaign_branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaign_branches_select_owner" ON public.campaign_branches;
CREATE POLICY "campaign_branches_select_owner" ON public.campaign_branches
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            JOIN public.stores s ON s.id = c.store_id
            WHERE c.id = campaign_branches.campaign_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "campaign_branches_insert_owner" ON public.campaign_branches;
CREATE POLICY "campaign_branches_insert_owner" ON public.campaign_branches
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            JOIN public.stores s ON s.id = c.store_id
            WHERE c.id = campaign_branches.campaign_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "campaign_branches_delete_owner" ON public.campaign_branches;
CREATE POLICY "campaign_branches_delete_owner" ON public.campaign_branches
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            JOIN public.stores s ON s.id = c.store_id
            WHERE c.id = campaign_branches.campaign_id
              AND s.owner_user_id = auth.uid()
        )
    );

-- =============================================
-- campaign_approved_assets
-- =============================================

ALTER TABLE public.campaign_approved_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaign_approved_assets_select_owner" ON public.campaign_approved_assets;
CREATE POLICY "campaign_approved_assets_select_owner" ON public.campaign_approved_assets
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = campaign_approved_assets.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "campaign_approved_assets_insert_owner" ON public.campaign_approved_assets;
CREATE POLICY "campaign_approved_assets_insert_owner" ON public.campaign_approved_assets
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = campaign_approved_assets.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "campaign_approved_assets_update_owner" ON public.campaign_approved_assets;
CREATE POLICY "campaign_approved_assets_update_owner" ON public.campaign_approved_assets
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = campaign_approved_assets.store_id
              AND s.owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = campaign_approved_assets.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "campaign_approved_assets_delete_owner" ON public.campaign_approved_assets;
CREATE POLICY "campaign_approved_assets_delete_owner" ON public.campaign_approved_assets
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = campaign_approved_assets.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

-- =============================================
-- visual_signatures
-- RLS enabled, no row-level policies (service_role / server-side access only)
-- =============================================

ALTER TABLE public.visual_signatures ENABLE ROW LEVEL SECURITY;

-- =============================================
-- visual_signature_profiles
-- RLS enabled, no row-level policies (service_role / server-side access only)
-- =============================================

ALTER TABLE public.visual_signature_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- visual_preference_learned
-- =============================================

ALTER TABLE public.visual_preference_learned ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "visual_preference_learned_select_owner" ON public.visual_preference_learned;
CREATE POLICY "visual_preference_learned_select_owner" ON public.visual_preference_learned
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = visual_preference_learned.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "visual_preference_learned_insert_owner" ON public.visual_preference_learned;
CREATE POLICY "visual_preference_learned_insert_owner" ON public.visual_preference_learned
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = visual_preference_learned.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "visual_preference_learned_update_owner" ON public.visual_preference_learned;
CREATE POLICY "visual_preference_learned_update_owner" ON public.visual_preference_learned
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = visual_preference_learned.store_id
              AND s.owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = visual_preference_learned.store_id
              AND s.owner_user_id = auth.uid()
        )
    );

-- =============================================
-- visual_reader_cache
-- RLS enabled, no row-level policies (service_role / server-side access only)
-- =============================================

ALTER TABLE public.visual_reader_cache ENABLE ROW LEVEL SECURITY;

COMMIT;
