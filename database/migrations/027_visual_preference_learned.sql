-- =============================================
-- Migration 027: visual_preference_learned
-- Description: Create visual_preference_learned table for AI-consolidated visual preferences
-- Date: 2026-04-29
-- Depends on: stores (already exists)
-- =============================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.visual_preference_learned (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    revision integer DEFAULT 1 NOT NULL,
    consolidated_at timestamp with time zone DEFAULT now() NOT NULL,
    signal_origin jsonb NOT NULL,
    preference jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT visual_preference_learned_pkey PRIMARY KEY (id),
    CONSTRAINT visual_preference_learned_store_id_fkey FOREIGN KEY (store_id)
        REFERENCES public.stores(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_visual_preference_learned_store_id
    ON public.visual_preference_learned(store_id);

CREATE INDEX IF NOT EXISTS idx_visual_preference_learned_store_consolidated_at
    ON public.visual_preference_learned(store_id, consolidated_at DESC);

COMMIT;
