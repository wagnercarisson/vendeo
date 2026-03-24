-- Migration: 013_campaigns_add_campaign_type.sql
-- Objetivo:
-- Persistir o formato da campanha (post, reels ou both) na campanha
-- para consistência entre wizard, planos e rascunhos.

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS campaign_type text;

-- Constraint para limitar os tipos permitidos
ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_campaign_type_check
  CHECK (campaign_type IN ('post', 'reels', 'both'));

-- Marcar como 'both' por padrão para compatibilidade com legadas
-- mas rascunhos novos preencherão o valor correto via aplicação.
ALTER TABLE public.campaigns
  ALTER COLUMN campaign_type SET DEFAULT 'both';

-- Backfill para campanhas existentes baseando-se no que já foi gerado
UPDATE public.campaigns
SET campaign_type = 
  CASE 
    WHEN (ai_generated_at IS NOT NULL AND reels_generated_at IS NOT NULL) THEN 'both'
    WHEN (ai_generated_at IS NOT NULL) THEN 'post'
    WHEN (reels_generated_at IS NOT NULL) THEN 'reels'
    ELSE 'both' -- Fallback seguro
  END
WHERE campaign_type IS NULL;

ALTER TABLE public.campaigns
  ALTER COLUMN campaign_type SET NOT NULL;
