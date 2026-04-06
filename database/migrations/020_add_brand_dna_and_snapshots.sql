-- =============================================
-- MIGRATION: 020_add_brand_dna_and_snapshots
-- Objetivo: Persistência do Brand Engine
-- =============================================

-- 1. ADICIONA BRAND DNA NA TABELA STORES
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS brand_dna jsonb DEFAULT NULL;

COMMENT ON COLUMN public.stores.brand_dna IS 'Identidade visual e verbal oficial da marca (Genes).';

-- 2. ADICIONA SNAPSHOTS NA TABELA CAMPAIGNS
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS brand_dna_snapshot jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS layout_snapshot jsonb DEFAULT NULL;

COMMENT ON COLUMN public.campaigns.brand_dna_snapshot IS 'Cópia imutável do DNA da loja no momento da geração do conteúdo.';
COMMENT ON COLUMN public.campaigns.layout_snapshot IS 'Configuração técnica do layout utilizado (Geometria e Versão) no momento da geração.';
