-- =============================================
-- Migration 021: campaign_approved_assets
-- Description: Create campaign_approved_assets table for approved media asset tracking
-- Date: 2026-04-29
-- Depends on: campaigns (already exists), stores (already exists), auth.users
-- Note: Creates composite unique index on campaigns(id, store_id) required for FK
-- =============================================

BEGIN;

-- Required prerequisite: composite unique index on campaigns(id, store_id)
-- so that campaign_approved_assets can FK reference (campaign_id, store_id) -> campaigns(id, store_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_id_store_id
    ON public.campaigns(id, store_id);

CREATE TABLE IF NOT EXISTS public.campaign_approved_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    store_id uuid NOT NULL,
    asset_kind text NOT NULL,
    approval_status text DEFAULT 'approved'::text NOT NULL,
    approved_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_by uuid,
    storage_bucket text NOT NULL,
    storage_path text NOT NULL,
    public_url_legacy text,
    generation_source text NOT NULL,
    campaign_snapshot jsonb NOT NULL,
    visual_snapshot jsonb,
    brand_profile_version integer,
    brand_profile_snapshot jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT campaign_approved_assets_pkey PRIMARY KEY (id),
    CONSTRAINT campaign_approved_assets_asset_kind_check CHECK (
        asset_kind = ANY (ARRAY['post_image'::text, 'reels_cover'::text, 'reels_video'::text])
    ),
    CONSTRAINT campaign_approved_assets_approval_status_check CHECK (
        approval_status = ANY (ARRAY['approved'::text, 'superseded'::text])
    ),
    CONSTRAINT campaign_approved_assets_approved_by_fkey FOREIGN KEY (approved_by)
        REFERENCES auth.users(id),
    CONSTRAINT campaign_approved_assets_campaign_store_fkey FOREIGN KEY (campaign_id, store_id)
        REFERENCES public.campaigns(id, store_id) ON DELETE CASCADE,
    CONSTRAINT campaign_approved_assets_store_id_fkey FOREIGN KEY (store_id)
        REFERENCES public.stores(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_campaign_approved_assets_campaign_id
    ON public.campaign_approved_assets(campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_approved_assets_store_id
    ON public.campaign_approved_assets(store_id);

CREATE INDEX IF NOT EXISTS idx_campaign_approved_assets_campaign_kind_approved_at
    ON public.campaign_approved_assets(campaign_id, asset_kind, approved_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_approved_assets_active_lookup
    ON public.campaign_approved_assets(store_id, campaign_id, asset_kind)
    WHERE (approval_status = 'approved'::text);

COMMIT;
