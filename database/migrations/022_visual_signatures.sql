-- =============================================
-- Migration 022: visual_signatures
-- Description: Create visual_signatures table for store core visual identity
-- Date: 2026-04-29
-- Depends on: stores (already exists)
-- Note: Uses extensions.uuid_generate_v4() to match remote schema exactly
-- =============================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.visual_signatures (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    store_id uuid NOT NULL,
    primary_color text DEFAULT '#6366f1'::text NOT NULL,
    secondary_color text DEFAULT '#8b5cf6'::text NOT NULL,
    logo_url text,
    store_name_typography jsonb DEFAULT '{"font": "Sora", "weight": "700"}'::jsonb,
    signature_seed text DEFAULT (extensions.uuid_generate_v4())::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT visual_signatures_pkey PRIMARY KEY (id),
    CONSTRAINT visual_signatures_store_unique UNIQUE (store_id),
    CONSTRAINT visual_signatures_store_id_fkey FOREIGN KEY (store_id)
        REFERENCES public.stores(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.visual_signatures
    IS 'Core visual identity for each store (fixed attributes, does not vary by campaign context)';

COMMENT ON COLUMN public.visual_signatures.store_name_typography
    IS 'Typography settings for store name: {font, weight, letterSpacing, etc}';

COMMENT ON COLUMN public.visual_signatures.signature_seed
    IS 'UUID-based seed for generating consistent visual variations across campaigns';

-- Índices
CREATE INDEX IF NOT EXISTS idx_visual_signatures_store_id
    ON public.visual_signatures(store_id);

COMMIT;
