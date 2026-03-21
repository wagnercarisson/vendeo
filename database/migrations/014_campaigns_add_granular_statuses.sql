-- Migration: 014_campaigns_add_granular_statuses.sql
-- Objetivo: adicionar controle individual de status para Arte e Vídeo (post_status, reels_status)
-- Data: 2026-03-20

BEGIN;

------------------------------------------------------------
-- 1) CAMPAIGNS - NOVAS COLUNAS
------------------------------------------------------------

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS post_status text DEFAULT 'none' NOT NULL;

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS reels_status text DEFAULT 'none' NOT NULL;

------------------------------------------------------------
-- 2) CONSTRAINTS
------------------------------------------------------------

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_post_status_check;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_post_status_check
  CHECK (post_status IN ('none', 'draft', 'ready', 'approved'));

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_reels_status_check;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_reels_status_check
  CHECK (reels_status IN ('none', 'draft', 'ready', 'approved'));

------------------------------------------------------------
-- 3) INITIAL DATA MIGRATION (Opcional, mas recomendado para consistência)
------------------------------------------------------------
-- Atualiza os novos campos baseando-se no formato (campaign_type) e no status global legado.
-- Se intent era post, o post ganha o status global, o reels ganha 'none'.
-- Se intent era reels, o reels ganha o status global, o post ganha 'none'.
-- Se intent era both, ambos ganham o status global.

UPDATE public.campaigns
SET 
  post_status = CASE 
    WHEN campaign_type IN ('post', 'both') THEN status 
    ELSE 'none' 
  END,
  reels_status = CASE 
    WHEN campaign_type IN ('reels', 'both') THEN status 
    ELSE 'none' 
  END;

COMMIT;
