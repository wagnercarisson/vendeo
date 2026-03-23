-- Migration: Fix Security Definer Views
-- Description: Recreate views to respect RLS (SECURITY INVOKER)
-- Date: 2026-03-23

BEGIN;

-- Drop dependent view first
DROP VIEW IF EXISTS public.v_store_campaign_usefulness_summary;
DROP VIEW IF EXISTS public.v_campaign_time_to_first_useful;

-- Recreate with security_invoker = true (PostgreSQL 15+)
-- This ensures the view respects RLS of the user querying it.

CREATE VIEW public.v_campaign_time_to_first_useful 
WITH (security_invoker = true) AS
WITH first_useful AS (
    SELECT 
        campaign_id,
        MIN(created_at) as first_useful_at
    FROM public.generation_feedback
    WHERE content_type = 'campaign' 
      AND vote = 'yes'
      AND campaign_id IS NOT NULL
    GROUP BY campaign_id
)
SELECT 
    c.id as campaign_id,
    c.store_id,
    c.created_at as campaign_created_at,
    fu.first_useful_at as first_useful_feedback_at,
    EXTRACT(EPOCH FROM (fu.first_useful_at - c.created_at))::bigint as seconds_to_first_useful,
    ROUND((EXTRACT(EPOCH FROM (fu.first_useful_at - c.created_at)) / 60.0)::numeric, 2) as minutes_to_first_useful,
    ROUND((EXTRACT(EPOCH FROM (fu.first_useful_at - c.created_at)) / 3600.0)::numeric, 2) as hours_to_first_useful
FROM public.campaigns c
JOIN first_useful fu ON c.id = fu.campaign_id;

CREATE VIEW public.v_store_campaign_usefulness_summary 
WITH (security_invoker = true) AS
SELECT 
    store_id,
    COUNT(*) as useful_campaigns,
    ROUND(AVG(minutes_to_first_useful), 2) as avg_minutes_to_first_useful,
    ROUND(MIN(minutes_to_first_useful), 2) as best_minutes_to_first_useful,
    ROUND(MAX(minutes_to_first_useful), 2) as worst_minutes_to_first_useful
FROM public.v_campaign_time_to_first_useful
GROUP BY store_id;

COMMIT;
