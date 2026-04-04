-- =============================================
-- VENDEO — MIGRATION 017
-- Descrição: Adiciona suporte a múltiplas filiais via coluna JSONB
-- Data: 2026-04-02
-- Autor: Antigravity
-- =============================================

-- 1. ADICIONA COLUNA BRANCHES
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS branches jsonb DEFAULT '[]'::jsonb;

-- 2. COMENTÁRIO EXPLICATIVO
COMMENT ON COLUMN public.stores.branches IS 'Lista de filiais/unidades da loja. Cada item possuí id, name, address, neighborhood, city, state, whatsapp.';

-- 3. GARANTE QUE O OWNER_USER_ID CONTINUA SENDO O FILTRO DE ISOLAMENTO
-- Nenhuma política extras de RLS necessária, pois as filiais pertencem à loja que já está isolada.
