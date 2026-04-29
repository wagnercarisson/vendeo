-- =============================================
-- Migration 029: indexes_for_new_tables
-- Description: Consolidated safety-net for all indexes introduced by migrations 017-028
-- Date: 2026-04-29
-- Note: All CREATE INDEX use IF NOT EXISTS — safe to run even if indexes were
--       already created inline in earlier migrations.
-- =============================================

BEGIN;

-- store_branches (017)
CREATE INDEX IF NOT EXISTS idx_store_branches_store_id
    ON public.store_branches(store_id);

-- store_members (018)
CREATE INDEX IF NOT EXISTS store_members_store_id_idx
    ON public.store_members(store_id);

CREATE INDEX IF NOT EXISTS store_members_user_id_idx
    ON public.store_members(user_id);

-- campaign_branches (019)
CREATE INDEX IF NOT EXISTS idx_campaign_branches_branch_id
    ON public.campaign_branches(branch_id);

-- campaign_approved_assets (021)
-- Composite unique index on campaigns required for FK (campaign_id, store_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_id_store_id
    ON public.campaigns(id, store_id);

CREATE INDEX IF NOT EXISTS idx_campaign_approved_assets_campaign_id
    ON public.campaign_approved_assets(campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_approved_assets_store_id
    ON public.campaign_approved_assets(store_id);

CREATE INDEX IF NOT EXISTS idx_campaign_approved_assets_campaign_kind_approved_at
    ON public.campaign_approved_assets(campaign_id, asset_kind, approved_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_approved_assets_active_lookup
    ON public.campaign_approved_assets(store_id, campaign_id, asset_kind)
    WHERE (approval_status = 'approved'::text);

-- visual_signatures (022)
CREATE INDEX IF NOT EXISTS idx_visual_signatures_store_id
    ON public.visual_signatures(store_id);

-- visual_signature_profiles (023)
CREATE INDEX IF NOT EXISTS idx_visual_signature_profiles_signature_id
    ON public.visual_signature_profiles(signature_id);

CREATE INDEX IF NOT EXISTS idx_visual_signature_profiles_context_type
    ON public.visual_signature_profiles(context_type);

-- campaigns visual signature fields (025)
CREATE INDEX IF NOT EXISTS idx_campaigns_visual_signature_id
    ON public.campaigns(visual_signature_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_visual_context
    ON public.campaigns(visual_context);

-- visual_reader_cache (026)
CREATE INDEX IF NOT EXISTS idx_visual_reader_cache_updated_at
    ON public.visual_reader_cache(updated_at DESC);

-- visual_preference_learned (027)
CREATE INDEX IF NOT EXISTS idx_visual_preference_learned_store_id
    ON public.visual_preference_learned(store_id);

CREATE INDEX IF NOT EXISTS idx_visual_preference_learned_store_consolidated_at
    ON public.visual_preference_learned(store_id, consolidated_at DESC);

COMMIT;
