-- =============================================
-- VENDEO
-- Migration 025
-- Visual Signatures — Core Identity Table
-- Data: 2026-04-19
-- Fase: Motor V2 - Schema Clean (Passo 1)
-- =============================================

-- Tabela central: identidade visual fixa de cada loja
CREATE TABLE IF NOT EXISTS public.visual_signatures (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    
    -- Core Identity (fixo, não varia por contexto)
    primary_color text NOT NULL DEFAULT '#6366f1',
    secondary_color text NOT NULL DEFAULT '#8b5cf6',
    logo_url text,
    store_name_typography jsonb DEFAULT '{"font": "Sora", "weight": "700"}'::jsonb,
    signature_seed text NOT NULL DEFAULT uuid_generate_v4()::text,
    
    -- Metadados
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Constraints
    CONSTRAINT visual_signatures_store_unique UNIQUE(store_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_visual_signatures_store_id 
    ON public.visual_signatures(store_id);

-- Comentários para documentação
COMMENT ON TABLE public.visual_signatures IS 
    'Core visual identity for each store (fixed attributes, does not vary by campaign context)';
COMMENT ON COLUMN public.visual_signatures.signature_seed IS 
    'UUID-based seed for generating consistent visual variations across campaigns';
COMMENT ON COLUMN public.visual_signatures.store_name_typography IS 
    'Typography settings for store name: {font, weight, letterSpacing, etc}';
