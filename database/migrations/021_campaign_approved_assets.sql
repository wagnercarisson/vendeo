-- =============================================
-- VENDEO
-- Migration 021
-- Campaign Approved Assets
-- =============================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_id_store_id
ON public.campaigns (id, store_id);

CREATE TABLE IF NOT EXISTS public.campaign_approved_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid NOT NULL,
    store_id uuid NOT NULL,
    asset_kind text NOT NULL CHECK (asset_kind IN ('post_image', 'reels_cover', 'reels_video')),
    approval_status text NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('approved', 'superseded')),
    approved_at timestamptz NOT NULL DEFAULT now(),
    approved_by uuid REFERENCES auth.users(id),
    storage_bucket text NOT NULL,
    storage_path text NOT NULL,
    public_url_legacy text,
    generation_source text NOT NULL,
    campaign_snapshot jsonb NOT NULL,
    visual_snapshot jsonb,
    brand_profile_version integer,
    brand_profile_snapshot jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT campaign_approved_assets_campaign_store_fkey
        FOREIGN KEY (campaign_id, store_id)
        REFERENCES public.campaigns (id, store_id)
        ON DELETE CASCADE,
    CONSTRAINT campaign_approved_assets_store_id_fkey
        FOREIGN KEY (store_id)
        REFERENCES public.stores (id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_campaign_approved_assets_store_id
ON public.campaign_approved_assets (store_id);

CREATE INDEX IF NOT EXISTS idx_campaign_approved_assets_campaign_id
ON public.campaign_approved_assets (campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_approved_assets_campaign_kind_approved_at
ON public.campaign_approved_assets (campaign_id, asset_kind, approved_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_approved_assets_active_lookup
ON public.campaign_approved_assets (store_id, campaign_id, asset_kind)
WHERE approval_status = 'approved';