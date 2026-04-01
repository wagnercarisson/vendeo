-- =============================================
-- Migration 016: Adicionar price_label ao badge
-- Data: 2026-03-31
-- Descrição: Permite rótulos dinâmicos (ex: NOVIDADE) e preços opcionais.
-- =============================================

ALTER TABLE public.campaigns 
ADD COLUMN price_label TEXT DEFAULT NULL;

COMMENT ON COLUMN public.campaigns.price_label IS 'Rótulo personalizado para o badge de preço (Ex: NOVIDADE, LANÇAMENTO)';
