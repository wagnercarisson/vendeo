-- Migration: Enforce one store per owner during beta
-- Objetivo:
-- Garantir no banco o modelo owner-based 1 usuário -> 1 loja
-- para evitar duplicidade silenciosa no onboarding.

-- Segurança prévia:
-- esta migration assume que não existem owners duplicados.
-- se houver duplicidade já criada no ambiente, resolva antes
-- de aplicar o índice único.

CREATE UNIQUE INDEX IF NOT EXISTS stores_owner_user_id_unique_idx
ON public.stores (owner_user_id);