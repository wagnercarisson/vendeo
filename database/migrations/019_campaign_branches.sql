-- =============================================
-- Migration 019: campaign_branches
-- Description: Create campaign_branches junction table for campaign-to-branch targeting
-- Date: 2026-04-29
-- Depends on: 017_store_branches, campaigns (already exists)
-- =============================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.campaign_branches (
    campaign_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT campaign_branches_pkey PRIMARY KEY (campaign_id, branch_id),
    CONSTRAINT campaign_branches_campaign_id_fkey FOREIGN KEY (campaign_id)
        REFERENCES public.campaigns(id) ON DELETE CASCADE,
    CONSTRAINT campaign_branches_branch_id_fkey FOREIGN KEY (branch_id)
        REFERENCES public.store_branches(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_campaign_branches_branch_id
    ON public.campaign_branches(branch_id);

COMMIT;
