-- =============================================
-- VENDEO
-- Migration 022
-- Campaign Approved Assets RLS
-- =============================================

ALTER TABLE public.campaign_approved_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaign_approved_assets_select_owner" ON public.campaign_approved_assets;
DROP POLICY IF EXISTS "campaign_approved_assets_insert_owner" ON public.campaign_approved_assets;
DROP POLICY IF EXISTS "campaign_approved_assets_update_owner" ON public.campaign_approved_assets;
DROP POLICY IF EXISTS "campaign_approved_assets_delete_owner" ON public.campaign_approved_assets;

CREATE POLICY "campaign_approved_assets_select_owner"
ON public.campaign_approved_assets
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.stores s
        WHERE s.id = campaign_approved_assets.store_id
          AND s.owner_user_id = auth.uid()
    )
);

CREATE POLICY "campaign_approved_assets_insert_owner"
ON public.campaign_approved_assets
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.stores s
        WHERE s.id = campaign_approved_assets.store_id
          AND s.owner_user_id = auth.uid()
    )
);

CREATE POLICY "campaign_approved_assets_update_owner"
ON public.campaign_approved_assets
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.stores s
        WHERE s.id = campaign_approved_assets.store_id
          AND s.owner_user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.stores s
        WHERE s.id = campaign_approved_assets.store_id
          AND s.owner_user_id = auth.uid()
    )
);

CREATE POLICY "campaign_approved_assets_delete_owner"
ON public.campaign_approved_assets
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.stores s
        WHERE s.id = campaign_approved_assets.store_id
          AND s.owner_user_id = auth.uid()
    )
);