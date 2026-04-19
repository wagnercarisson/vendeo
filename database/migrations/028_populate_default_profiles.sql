-- =============================================
-- VENDEO
-- Migration 028
-- Populate Default Visual Signature Profiles
-- Data: 2026-04-19
-- Fase: Motor V2 - Schema Clean (Passo 4)
-- =============================================

-- Criar 5 context profiles padrão para cada signature existente
INSERT INTO public.visual_signature_profiles (
    signature_id,
    context_type,
    composition_rules,
    typography_rules,
    color_rules,
    intensity_level
)
SELECT 
    vs.id,
    context.type,
    context.composition_rules,
    context.typography_rules,
    context.color_rules,
    context.intensity_level
FROM public.visual_signatures vs
CROSS JOIN (
    VALUES 
        (
            'standard',
            '{"layoutStyle": "balanced", "spacing": "comfortable", "hierarchy": "moderate"}'::jsonb,
            '{"titleSize": "large", "bodySize": "medium", "weight": "normal"}'::jsonb,
            '{"accentUsage": "subtle", "backgroundStyle": "clean"}'::jsonb,
            'balanced'
        ),
        (
            'promotional',
            '{"layoutStyle": "dynamic", "spacing": "compact", "hierarchy": "strong"}'::jsonb,
            '{"titleSize": "xlarge", "bodySize": "large", "weight": "bold"}'::jsonb,
            '{"accentUsage": "prominent", "backgroundStyle": "vibrant"}'::jsonb,
            'strong'
        ),
        (
            'seasonal',
            '{"layoutStyle": "thematic", "spacing": "comfortable", "hierarchy": "moderate"}'::jsonb,
            '{"titleSize": "large", "bodySize": "medium", "weight": "medium"}'::jsonb,
            '{"accentUsage": "moderate", "backgroundStyle": "contextual"}'::jsonb,
            'balanced'
        ),
        (
            'premium',
            '{"layoutStyle": "elegant", "spacing": "generous", "hierarchy": "subtle"}'::jsonb,
            '{"titleSize": "medium", "bodySize": "small", "weight": "light"}'::jsonb,
            '{"accentUsage": "minimal", "backgroundStyle": "sophisticated"}'::jsonb,
            'minimal'
        ),
        (
            'urgency',
            '{"layoutStyle": "aggressive", "spacing": "tight", "hierarchy": "extreme"}'::jsonb,
            '{"titleSize": "xxlarge", "bodySize": "large", "weight": "extrabold"}'::jsonb,
            '{"accentUsage": "intense", "backgroundStyle": "high-contrast"}'::jsonb,
            'strong'
        )
) AS context(type, composition_rules, typography_rules, color_rules, intensity_level)
ON CONFLICT (signature_id, context_type) DO NOTHING;

-- Verificação (log)
DO $$
BEGIN
    RAISE NOTICE 'Migration 028 completed: % profiles created (expected: %)', 
        (SELECT COUNT(*) FROM public.visual_signature_profiles),
        (SELECT COUNT(*) * 5 FROM public.visual_signatures);
    
    IF (SELECT COUNT(*) FROM public.visual_signature_profiles) < (SELECT COUNT(*) * 5 FROM public.visual_signatures) THEN
        RAISE WARNING 'Some profiles were not created. Check for conflicts.';
    END IF;
END $$;
