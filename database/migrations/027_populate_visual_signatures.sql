-- =============================================
-- VENDEO
-- Migration 027
-- Populate Visual Signatures from Existing Stores
-- Data: 2026-04-19
-- Fase: Motor V2 - Schema Clean (Passo 3)
-- =============================================

-- Migrar dados existentes de stores para visual_signatures
INSERT INTO public.visual_signatures (
    store_id,
    primary_color,
    secondary_color,
    logo_url,
    signature_seed
)
SELECT 
    id,
    COALESCE(primary_color, '#6366f1') AS primary_color,
    COALESCE(secondary_color, '#8b5cf6') AS secondary_color,
    logo_url,
    uuid_generate_v4()::text AS signature_seed
FROM public.stores
ON CONFLICT (store_id) DO NOTHING;

-- Verificação (log)
DO $$
BEGIN
    RAISE NOTICE 'Migration 027 completed: % stores, % signatures created', 
        (SELECT COUNT(*) FROM public.stores),
        (SELECT COUNT(*) FROM public.visual_signatures);
END $$;
