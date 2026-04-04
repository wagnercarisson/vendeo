-- Migration 019: Adiciona restrição de nome não vazio em store_branches
-- Garante que nenhuma filial seja criada sem uma identificação mínima.

-- 1. Limpeza preventiva de registros inconsistentes (se houver)
DELETE FROM public.store_branches 
WHERE name IS NULL OR length(trim(name)) = 0;

-- 2. Adiciona a constraint de CHECK
ALTER TABLE public.store_branches
ADD CONSTRAINT store_branches_name_not_empty CHECK (length(trim(name)) > 0);

-- Comentário para documentação do Supabase
COMMENT ON CONSTRAINT store_branches_name_not_empty ON public.store_branches IS 'Impede o salvamento de unidades sem nome ou apenas com espaços.';
