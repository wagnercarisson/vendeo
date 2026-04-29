-- =============================================
-- Migration 017: store_branches
-- Description: Create store_branches table for multi-unit store support
-- Date: 2026-04-29
-- Depends on: stores (already exists)
-- =============================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.store_branches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    name text NOT NULL,
    address text,
    neighborhood text,
    city text,
    state text,
    whatsapp text,
    is_main boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT store_branches_pkey PRIMARY KEY (id),
    CONSTRAINT store_branches_name_not_empty CHECK (length(trim(both from name)) > 0),
    CONSTRAINT store_branches_store_id_fkey FOREIGN KEY (store_id)
        REFERENCES public.stores(id) ON DELETE CASCADE
);

COMMENT ON CONSTRAINT "store_branches_name_not_empty" ON "public"."store_branches"
    IS 'Impede o salvamento de unidades sem nome ou apenas com espaços.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_store_branches_store_id
    ON public.store_branches(store_id);

COMMIT;
