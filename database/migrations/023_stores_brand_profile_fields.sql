-- =============================================
-- VENDEO
-- Migration 023
-- Stores Brand Profile Fields
-- =============================================

ALTER TABLE IF EXISTS public.stores
    ADD COLUMN IF NOT EXISTS brand_profile jsonb;

ALTER TABLE IF EXISTS public.stores
    ADD COLUMN IF NOT EXISTS brand_profile_version integer NOT NULL DEFAULT 1;

ALTER TABLE IF EXISTS public.stores
    ADD COLUMN IF NOT EXISTS brand_profile_updated_at timestamptz;