-- =============================================
-- Migration 026: visual_reader_cache
-- Description: Create visual_reader_cache table for image analysis result caching
-- Date: 2026-04-29
-- Depends on: none (no FKs to other tables)
-- =============================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.visual_reader_cache (
    cache_key text NOT NULL,
    image_url text NOT NULL,
    product_name text NOT NULL,
    content_type text NOT NULL,
    profile jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT visual_reader_cache_pkey PRIMARY KEY (cache_key),
    CONSTRAINT visual_reader_cache_content_type_check CHECK (
        content_type = ANY (ARRAY['product'::text, 'service'::text, 'message'::text])
    )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_visual_reader_cache_updated_at
    ON public.visual_reader_cache(updated_at DESC);

COMMIT;
