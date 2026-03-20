-- Migration: 013_campaigns_add_content_type.sql
-- Objetivo:
-- Persistir o intento de geração (post, reels ou both) na campanha
-- para consistência entre wizard, planos e rascunhos.

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS content_type text;

-- Constraint para limitar os tipos permitidos
ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_content_type_check
  CHECK (content_type IN ('post', 'reels', 'both'));

-- Marcar como 'both' por padrão para compatibilidade com legadas
-- mas rascunhos novos preencherão o valor correto via aplicação.
ALTER TABLE public.campaigns
  ALTER COLUMN content_type SET DEFAULT 'both';

-- Backfill para campanhas existentes baseando-se no que já foi gerado
UPDATE public.campaigns
SET content_type = 
  CASE 
    WHEN (ai_generated_at IS NOT NULL AND reels_generated_at IS NOT NULL) THEN 'both'
    WHEN (ai_generated_at IS NOT NULL) THEN 'post'
    WHEN (reels_generated_at IS NOT NULL) THEN 'reels'
    ELSE 'both' -- Fallback seguro
  END
WHERE content_type IS NULL;

ALTER TABLE public.campaigns
  ALTER COLUMN content_type SET NOT NULL;
