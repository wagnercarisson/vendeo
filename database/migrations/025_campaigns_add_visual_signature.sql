-- =============================================
-- Migration 025: campaigns_add_visual_signature
-- Description: Add visual_signature_id and visual_context to campaigns
-- Date: 2026-04-29
-- Depends on: 022_visual_signatures, campaigns (already exists)
-- =============================================

BEGIN;

ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS visual_signature_id uuid,
    ADD COLUMN IF NOT EXISTS visual_context text DEFAULT 'standard'::text;

-- FK constraint: nullable (optional during migration period)
ALTER TABLE public.campaigns
    DROP CONSTRAINT IF EXISTS campaigns_visual_signature_id_fkey;

ALTER TABLE public.campaigns
    ADD CONSTRAINT campaigns_visual_signature_id_fkey
        FOREIGN KEY (visual_signature_id)
        REFERENCES public.visual_signatures(id) ON DELETE SET NULL;

-- CHECK constraint
ALTER TABLE public.campaigns
    DROP CONSTRAINT IF EXISTS campaigns_visual_context_check;

ALTER TABLE public.campaigns
    ADD CONSTRAINT campaigns_visual_context_check CHECK (
        visual_context = ANY (ARRAY['standard'::text, 'promotional'::text, 'seasonal'::text, 'premium'::text, 'urgency'::text])
    );

COMMENT ON COLUMN public.campaigns.visual_signature_id
    IS 'Reference to the visual signature used for this campaign (optional during migration)';

COMMENT ON COLUMN public.campaigns.visual_context
    IS 'Visual context type for this campaign (determines which profile to use)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_campaigns_visual_signature_id
    ON public.campaigns(visual_signature_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_visual_context
    ON public.campaigns(visual_context);

COMMIT;
