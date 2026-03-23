-- Migration: Consolidate Campaign and Weekly Plan Status
-- Objetivo: unificar contrato de status para campaigns, weekly_plans e weekly_plan_items
-- Contexto: ambiente beta pode ser resetado sem necessidade de compatibilidade
-- Data: 2026-03-16

BEGIN;

------------------------------------------------------------
-- 1) RESET BASE
------------------------------------------------------------

TRUNCATE TABLE public.weekly_plan_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.weekly_plans RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.campaigns RESTART IDENTITY CASCADE;

------------------------------------------------------------
-- 2) CAMPAIGNS
------------------------------------------------------------

-- normalizar valores antigos, caso existam
UPDATE public.campaigns
SET status = CASE
  WHEN status IN ('active', 'draft') THEN 'draft'
  WHEN status IN ('ready') THEN 'ready'
  WHEN status IN ('approved') THEN 'approved'
  ELSE 'draft'
END;

ALTER TABLE public.campaigns
  ALTER COLUMN status SET DEFAULT 'draft';

ALTER TABLE public.campaigns
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_status_check;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_status_check
  CHECK (status IN ('draft', 'ready', 'approved'));

------------------------------------------------------------
-- 3) WEEKLY PLANS
------------------------------------------------------------

-- normalizar valores antigos
UPDATE public.weekly_plans
SET status = CASE
  WHEN status IN ('generated', 'draft') THEN 'draft'
  WHEN status IN ('approved') THEN 'approved'
  ELSE 'draft'
END;

ALTER TABLE public.weekly_plans
  ALTER COLUMN status SET DEFAULT 'draft';

ALTER TABLE public.weekly_plans
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.weekly_plans
  DROP CONSTRAINT IF EXISTS weekly_plans_status_check;

ALTER TABLE public.weekly_plans
  ADD CONSTRAINT weekly_plans_status_check
  CHECK (status IN ('draft', 'approved'));

------------------------------------------------------------
-- 4) WEEKLY PLAN ITEMS
------------------------------------------------------------

-- a tabela ainda não possui status no schema atual
ALTER TABLE public.weekly_plan_items
  ADD COLUMN IF NOT EXISTS status text;

UPDATE public.weekly_plan_items
SET status = CASE
  WHEN campaign_id IS NOT NULL THEN 'ready'
  ELSE 'draft'
END
WHERE status IS NULL;

ALTER TABLE public.weekly_plan_items
  ALTER COLUMN status SET DEFAULT 'draft';

ALTER TABLE public.weekly_plan_items
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.weekly_plan_items
  DROP CONSTRAINT IF EXISTS weekly_plan_items_status_check;

ALTER TABLE public.weekly_plan_items
  ADD CONSTRAINT weekly_plan_items_status_check
  CHECK (status IN ('draft', 'ready', 'approved'));

COMMIT;