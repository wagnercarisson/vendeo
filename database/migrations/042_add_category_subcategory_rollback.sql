-- =============================================
-- Rollback 042: add_category_subcategory
-- Description: Reverses migration 042 — removes category, subcategory,
--              subcategory_custom columns, all 4 check constraints, and the index.
-- Date: 2026-05-06
-- Decision: DEC-2026-05-06-004
-- EMERGENCY USE ONLY — apply if migration 042 causes production issues.
--
-- Usage:
--   psql -h DB_HOST -U postgres -d vendeo \
--        -f database/migrations/042_add_category_subcategory_rollback.sql
--
-- WARNING: Destroys all data in category, subcategory, subcategory_custom columns.
--          Irreversible once committed. Confirm with @aiox-master before applying.
-- =============================================

BEGIN;

-- Step 1: Remove all 4 CHECK constraints (must come before column removal)
ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS check_subcategory_custom;
ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS check_subcategory_mercearia;
ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS check_subcategory_bebidas;
ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS check_category_values;

-- Step 2: Remove NOT NULL if it was applied
ALTER TABLE public.stores ALTER COLUMN category DROP NOT NULL;

-- Step 3: Remove performance index
DROP INDEX IF EXISTS public.idx_stores_category_subcategory;

-- Step 4: Remove columns
ALTER TABLE public.stores
    DROP COLUMN IF EXISTS subcategory_custom,
    DROP COLUMN IF EXISTS subcategory,
    DROP COLUMN IF EXISTS category;

DO $$ BEGIN
    RAISE NOTICE '[Rollback 042] Complete. Columns category, subcategory, subcategory_custom and all 4 constraints removed from stores.';
END; $$;

COMMIT;
