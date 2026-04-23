-- =============================================
-- VENDEO
-- Migration 030
-- Visual Reader Cache
-- =============================================

CREATE TABLE IF NOT EXISTS public.visual_reader_cache (
    cache_key text PRIMARY KEY,
    image_url text NOT NULL,
    product_name text NOT NULL,
    content_type text NOT NULL CHECK (content_type IN ('product', 'service', 'message')),
    profile jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visual_reader_cache_updated_at
ON public.visual_reader_cache (updated_at DESC);

-- Access is exclusively via service role (getSupabaseAdmin).
-- RLS is enabled to block direct authenticated/anon access.
ALTER TABLE public.visual_reader_cache ENABLE ROW LEVEL SECURITY;