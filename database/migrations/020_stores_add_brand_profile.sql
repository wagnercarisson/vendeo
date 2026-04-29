-- =============================================
-- Migration 020: stores_add_brand_profile
-- Description: Add brand_profile JSONB fields to stores for AI brand DNA storage
-- Date: 2026-04-29
-- Depends on: stores (already exists)
-- =============================================

BEGIN;

ALTER TABLE public.stores
    ADD COLUMN IF NOT EXISTS brand_profile jsonb,
    ADD COLUMN IF NOT EXISTS brand_profile_version integer NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS brand_profile_updated_at timestamp with time zone;

COMMIT;
