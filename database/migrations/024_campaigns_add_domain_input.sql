-- =============================================
-- Migration 024: campaigns_add_domain_input
-- Description: Add domain_input, domain_input_version, legacy_content_type to campaigns
-- Date: 2026-04-29
-- Depends on: campaigns (already exists)
-- =============================================

BEGIN;

ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS domain_input jsonb NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS domain_input_version integer NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS legacy_content_type text;

COMMIT;
