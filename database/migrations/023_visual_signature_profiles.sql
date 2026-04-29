-- =============================================
-- Migration 023: visual_signature_profiles
-- Description: Create visual_signature_profiles table for context-specific visual rules
-- Date: 2026-04-29
-- Depends on: 022_visual_signatures
-- =============================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.visual_signature_profiles (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    signature_id uuid NOT NULL,
    context_type text NOT NULL,
    composition_rules jsonb DEFAULT '{}'::jsonb,
    typography_rules jsonb DEFAULT '{}'::jsonb,
    color_rules jsonb DEFAULT '{}'::jsonb,
    intensity_level text DEFAULT 'balanced'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT visual_signature_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT visual_signature_profiles_unique UNIQUE (signature_id, context_type),
    CONSTRAINT visual_signature_profiles_context_check CHECK (
        context_type = ANY (ARRAY['standard'::text, 'promotional'::text, 'seasonal'::text, 'premium'::text, 'urgency'::text])
    ),
    CONSTRAINT visual_signature_profiles_intensity_check CHECK (
        intensity_level = ANY (ARRAY['minimal'::text, 'balanced'::text, 'strong'::text])
    ),
    CONSTRAINT visual_signature_profiles_signature_id_fkey FOREIGN KEY (signature_id)
        REFERENCES public.visual_signatures(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.visual_signature_profiles
    IS 'Context-specific visual rules that adapt core signature to different campaign types';

COMMENT ON COLUMN public.visual_signature_profiles.context_type
    IS 'Campaign context: standard (daily), promotional (sales), seasonal (dates), premium (high-end), urgency (limited time)';

COMMENT ON COLUMN public.visual_signature_profiles.composition_rules
    IS 'Layout and composition preferences: {layoutStyle, spacing, hierarchy, etc}';

COMMENT ON COLUMN public.visual_signature_profiles.typography_rules
    IS 'Text styling rules: {titleSize, bodySize, weights, alignment, etc}';

COMMENT ON COLUMN public.visual_signature_profiles.color_rules
    IS 'Color adaptation rules: {accentColors, backgrounds, overlays, gradients, etc}';

COMMENT ON COLUMN public.visual_signature_profiles.intensity_level
    IS 'Visual intensity: minimal (clean), balanced (standard), strong (aggressive)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_visual_signature_profiles_signature_id
    ON public.visual_signature_profiles(signature_id);

CREATE INDEX IF NOT EXISTS idx_visual_signature_profiles_context_type
    ON public.visual_signature_profiles(context_type);

COMMIT;
