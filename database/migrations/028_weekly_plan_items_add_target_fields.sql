-- =============================================
-- Migration 028: weekly_plan_items_add_target_fields
-- Description: Add target_content_type and target_domain_input to weekly_plan_items
-- Date: 2026-04-29
-- Depends on: weekly_plan_items (already exists)
-- =============================================

BEGIN;

ALTER TABLE public.weekly_plan_items
    ADD COLUMN IF NOT EXISTS target_content_type text,
    ADD COLUMN IF NOT EXISTS target_domain_input jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMIT;
