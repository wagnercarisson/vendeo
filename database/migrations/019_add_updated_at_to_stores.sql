-- =============================================
-- VENDEO — MIGRATION 019
-- Descrição: Adicionar updated_at na tabela stores
-- Data: 2026-04-03
-- Autor: Antigravity
-- =============================================

-- 1. ADICIONAR COLUNA updated_at (caso não exista)
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. CRIAR TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA
-- Nota: Supomos que a função public.update_updated_at_column() já existe de migrations anteriores.
-- Se não existir, a criaremos aqui por segurança.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_stores_updated_at ON public.stores;
CREATE TRIGGER set_stores_updated_at
BEFORE UPDATE ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
