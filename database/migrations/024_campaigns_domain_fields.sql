-- =============================================
-- VENDEO
-- Migration 024
-- Campaigns Domain Fields
-- =============================================

ALTER TABLE IF EXISTS public.campaigns
    ADD COLUMN IF NOT EXISTS domain_input jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.campaigns
    ADD COLUMN IF NOT EXISTS domain_input_version integer NOT NULL DEFAULT 1;

ALTER TABLE IF EXISTS public.campaigns
    ADD COLUMN IF NOT EXISTS legacy_content_type text;