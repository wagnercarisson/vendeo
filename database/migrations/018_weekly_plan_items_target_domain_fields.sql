ALTER TABLE IF EXISTS public.weekly_plan_items
    ADD COLUMN IF NOT EXISTS target_content_type text;

ALTER TABLE IF EXISTS public.weekly_plan_items
    ADD COLUMN IF NOT EXISTS target_domain_input jsonb NOT NULL DEFAULT '{}'::jsonb;