-- =============================================
-- VENDEO
-- Migration 029
-- Link Campaigns to Visual Signatures
-- Data: 2026-04-19
-- Fase: Motor V2 - Schema Clean (Passo 5)
-- =============================================

-- Adicionar referência opcional de campaigns para visual_signatures
ALTER TABLE IF EXISTS public.campaigns
    ADD COLUMN IF NOT EXISTS visual_signature_id uuid 
    REFERENCES public.visual_signatures(id) ON DELETE SET NULL;

-- Adicionar contexto da campanha (qual profile usar)
ALTER TABLE IF EXISTS public.campaigns
    ADD COLUMN IF NOT EXISTS visual_context text 
    DEFAULT 'standard';

-- Constraint para validar contexto
ALTER TABLE IF EXISTS public.campaigns
    DROP CONSTRAINT IF EXISTS campaigns_visual_context_check;

ALTER TABLE IF EXISTS public.campaigns
    ADD CONSTRAINT campaigns_visual_context_check 
    CHECK (visual_context IN ('standard', 'promotional', 'seasonal', 'premium', 'urgency'));

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_campaigns_visual_signature_id 
    ON public.campaigns(visual_signature_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_visual_context 
    ON public.campaigns(visual_context);

-- Comentários
COMMENT ON COLUMN public.campaigns.visual_signature_id IS 
    'Reference to the visual signature used for this campaign (optional during migration)';
COMMENT ON COLUMN public.campaigns.visual_context IS 
    'Visual context type for this campaign (determines which profile to use)';

-- Verificação (log)
DO $$
BEGIN
    RAISE NOTICE 'Migration 029 completed: visual_signature_id and visual_context columns added to campaigns';
END $$;
