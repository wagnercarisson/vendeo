-- Migration: 012_campaigns_origin_and_weekly_plan_item_link.sql
-- Objetivo:
-- 1. dar identidade estrutural à origem da campanha
-- 2. vincular campanha diretamente ao weekly_plan_item
-- 3. preparar o beta para lock de estratégia em campanhas derivadas de plano

-- Como a base é de teste, esta migration pode ser mais assertiva e previsível.

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS origin text;

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS weekly_plan_item_id uuid;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_weekly_plan_item_id_fkey
  FOREIGN KEY (weekly_plan_item_id)
  REFERENCES public.weekly_plan_items(id)
  ON DELETE SET NULL;

-- Backfill seguro para campanhas já existentes vinculadas por weekly_plan_items.campaign_id
UPDATE public.campaigns c
SET
  origin = 'plan',
  weekly_plan_item_id = wpi.id
FROM public.weekly_plan_items wpi
WHERE wpi.campaign_id = c.id
  AND (c.origin IS NULL OR c.weekly_plan_item_id IS NULL);

-- Demais campanhas passam a ser manuais
UPDATE public.campaigns
SET origin = 'manual'
WHERE origin IS NULL;

ALTER TABLE public.campaigns
  ALTER COLUMN origin SET NOT NULL;

ALTER TABLE public.campaigns
  ALTER COLUMN origin SET DEFAULT 'manual';

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_origin_check;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_origin_check
  CHECK (origin IN ('manual', 'plan'));

-- Uma campanha de plano deve apontar para um item
ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_plan_origin_requires_item_check;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_plan_origin_requires_item_check
  CHECK (
    (origin = 'manual' AND weekly_plan_item_id IS NULL)
    OR
    (origin = 'plan' AND weekly_plan_item_id IS NOT NULL)
  );

-- Um item do plano só pode estar ligado a uma campanha
CREATE UNIQUE INDEX IF NOT EXISTS campaigns_weekly_plan_item_id_unique
  ON public.campaigns (weekly_plan_item_id)
  WHERE weekly_plan_item_id IS NOT NULL;

-- Índice auxiliar
CREATE INDEX IF NOT EXISTS campaigns_origin_idx
  ON public.campaigns (origin);