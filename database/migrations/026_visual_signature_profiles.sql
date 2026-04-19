-- =============================================
-- VENDEO
-- Migration 026
-- Visual Signature Profiles — Context-based Rules
-- Data: 2026-04-19
-- Fase: Motor V2 - Schema Clean (Passo 2)
-- =============================================

-- Tabela de variações contextuais da identidade visual
CREATE TABLE IF NOT EXISTS public.visual_signature_profiles (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    signature_id uuid NOT NULL REFERENCES public.visual_signatures(id) ON DELETE CASCADE,
    
    -- Context Type
    context_type text NOT NULL,
    
    -- Visual Rules (JSON flexível para evolução)
    composition_rules jsonb DEFAULT '{}'::jsonb,
    typography_rules jsonb DEFAULT '{}'::jsonb,
    color_rules jsonb DEFAULT '{}'::jsonb,
    intensity_level text DEFAULT 'balanced' NOT NULL,
    
    -- Metadados
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Constraints
    CONSTRAINT visual_signature_profiles_context_check 
        CHECK (context_type IN ('standard', 'promotional', 'seasonal', 'premium', 'urgency')),
    CONSTRAINT visual_signature_profiles_intensity_check 
        CHECK (intensity_level IN ('minimal', 'balanced', 'strong')),
    CONSTRAINT visual_signature_profiles_unique 
        UNIQUE(signature_id, context_type)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_visual_signature_profiles_signature_id 
    ON public.visual_signature_profiles(signature_id);
CREATE INDEX IF NOT EXISTS idx_visual_signature_profiles_context_type 
    ON public.visual_signature_profiles(context_type);

-- Comentários para documentação
COMMENT ON TABLE public.visual_signature_profiles IS 
    'Context-specific visual rules that adapt core signature to different campaign types';
COMMENT ON COLUMN public.visual_signature_profiles.context_type IS 
    'Campaign context: standard (daily), promotional (sales), seasonal (dates), premium (high-end), urgency (limited time)';
COMMENT ON COLUMN public.visual_signature_profiles.composition_rules IS 
    'Layout and composition preferences: {layoutStyle, spacing, hierarchy, etc}';
COMMENT ON COLUMN public.visual_signature_profiles.typography_rules IS 
    'Text styling rules: {titleSize, bodySize, weights, alignment, etc}';
COMMENT ON COLUMN public.visual_signature_profiles.color_rules IS 
    'Color adaptation rules: {accentColors, backgrounds, overlays, gradients, etc}';
COMMENT ON COLUMN public.visual_signature_profiles.intensity_level IS 
    'Visual intensity: minimal (clean), balanced (standard), strong (aggressive)';
