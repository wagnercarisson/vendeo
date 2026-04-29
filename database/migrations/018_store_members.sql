-- =============================================
-- Migration 018: store_members
-- Description: Create store_members table for store team/membership management
-- Date: 2026-04-29
-- Depends on: stores (already exists), auth.users
-- =============================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.store_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'owner'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT store_members_pkey PRIMARY KEY (id),
    CONSTRAINT store_members_store_id_user_id_key UNIQUE (store_id, user_id),
    CONSTRAINT store_members_store_id_fkey FOREIGN KEY (store_id)
        REFERENCES public.stores(id) ON DELETE CASCADE,
    CONSTRAINT store_members_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS store_members_store_id_idx
    ON public.store_members(store_id);

CREATE INDEX IF NOT EXISTS store_members_user_id_idx
    ON public.store_members(user_id);

COMMIT;
