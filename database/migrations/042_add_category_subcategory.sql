-- =============================================
-- Migration 042: add_category_subcategory
-- Description: Add hierarchical sub-segmentation support to stores table.
--              Implements CONTROLLED VOCABULARY at the DB layer (Layer 3 defense).
--
--   category        -- primary classification (controlled: bebidas_alcoolicas | mercearia)
--   subcategory     -- secondary classification (controlled per category + ''outro'')
--   subcategory_custom -- free-text ONLY when subcategory = ''outro''
--
-- Date: 2026-05-06
-- Decision: DEC-2026-05-06-004 (revised from DEC-2026-05-06-003)
-- Phase: Sprint 1 -- P0 CRITICO (blocks 10 registry variants + UI)
-- Task ref: docs/tasks/TASK-DATA-ENGINEER-MIGRATION-042.md
-- Depends on: 001 (stores table baseline)
--
-- Execution plan (6 steps, single transaction):
--   1. ADD COLUMNS   -- nullable initially (safe concurrent deploy)
--   2. BACKFILL      -- main_segment -> category (Sprint 1 scope: 2 categories)
--   3. NOT NULL      -- conditional: applied only if backfill is 100%
--   4. CONSTRAINTS   -- 4 CHECK constraints for controlled vocabulary
--   5. INDEX         -- idx_stores_category_subcategory for performance
--   6. AUDIT NOTICE  -- unmapped stores count reported via RAISE NOTICE
--
-- Defense layers this migration implements:
--   DB rejects invalid category values (check_category_values)
--   DB rejects invalid subcategory values per category (check_subcategory_bebidas,
--     check_subcategory_mercearia)
--   DB rejects ''outro'' without custom description (check_subcategory_custom)
--
-- Sprint 1 category scope (expandable in future migrations):
--   bebidas_alcoolicas -> subcategories: adega | loja-bebidas | distribuidor |
--                                         emporio-cervejas | outro
--   mercearia          -> subcategories: mercadinho-bairro | minimercado | hortifruti |
--                                         emporio-gourmet | sacolao | outro
--
-- RLS impact: NONE -- policies filter on owner_user_id; new columns are transparent.
-- main_segment: PRESERVED for backward compatibility (not removed).
-- Rollback: database/migrations/042_add_category_subcategory_rollback.sql
-- =============================================

BEGIN;

-- =============================================
-- STEP 1: Add columns (nullable -- safe hot-deploy)
-- IF NOT EXISTS makes this idempotent on retry.
-- =============================================

ALTER TABLE public.stores
    ADD COLUMN IF NOT EXISTS category           TEXT,
    ADD COLUMN IF NOT EXISTS subcategory        TEXT,
    ADD COLUMN IF NOT EXISTS subcategory_custom TEXT;

COMMENT ON COLUMN public.stores.category IS
    'Sprint 1 controlled vocabulary: bebidas_alcoolicas | mercearia. '
    'Extends to additional categories in future migrations. '
    'Source: DEC-2026-05-06-004. Backfilled from main_segment in migration 042.';

COMMENT ON COLUMN public.stores.subcategory IS
    'Secondary classification within category. Controlled per-category vocabulary. '
    'bebidas_alcoolicas: adega | loja-bebidas | distribuidor | emporio-cervejas | outro. '
    'mercearia: mercadinho-bairro | minimercado | hortifruti | emporio-gourmet | sacolao | outro. '
    'NULL allowed -- filled on next onboarding edit. '
    'Special value: ''outro'' requires subcategory_custom (constraint: check_subcategory_custom).';

COMMENT ON COLUMN public.stores.subcategory_custom IS
    'Free-text label ONLY when subcategory = ''outro''. '
    'Enforced by constraint check_subcategory_custom. NULL otherwise.';

-- =============================================
-- STEP 2: Backfill category from main_segment
-- Sprint 1 scope: only bebidas_alcoolicas + mercearia.
-- Unmapped main_segment values -> category remains NULL (intentional).
-- NULL is valid here; check_category_values allows NULL (PostgreSQL CHECK semantics).
-- NOT NULL applied conditionally in Step 3.
-- =============================================

UPDATE public.stores
SET category = CASE

    -- bebidas_alcoolicas: all known legacy free-text values
    WHEN main_segment IN (
        'Adega',
        'adega',
        'Loja de bebidas',
        'Loja de Bebidas',
        'Distribuidora',
        'distribuidora',
        'Adegas e Distribuidoras',
        'Emporio de Cervejas',
        'Beer Store',
        'Cervejaria'
    ) THEN 'bebidas_alcoolicas'

    -- mercearia: all known legacy free-text values
    WHEN main_segment IN (
        'Mercado',
        'mercado',
        'Mercearia',
        'mercearia',
        'Mercado / Mercearia',
        'Mercadinho',
        'mercadinho',
        'Minimercado',
        'minimercado',
        'Hortifruti',
        'hortifruti',
        'Sacolao',
        'Emporio Gourmet',
        'Armazem'
    ) THEN 'mercearia'

    -- Unmapped: category stays NULL (reviewed post-deploy)
    ELSE NULL

END
WHERE category IS NULL;

-- =============================================
-- STEP 3: SET category NOT NULL (conditional)
-- Applied only if backfill achieved 100% coverage.
-- If unmapped stores exist, NOT NULL is skipped and a WARNING is raised.
-- =============================================

DO $$
DECLARE
    v_null_count integer;
    v_total      integer;
BEGIN
    SELECT COUNT(*) INTO v_null_count FROM public.stores WHERE category IS NULL;
    SELECT COUNT(*) INTO v_total      FROM public.stores;

    IF v_null_count = 0 THEN
        ALTER TABLE public.stores ALTER COLUMN category SET NOT NULL;
        RAISE NOTICE '[Migration 042] category SET NOT NULL -- all % stores mapped.', v_total;
    ELSE
        RAISE WARNING
            '[Migration 042] category NOT NULL skipped -- % of % stores have category = NULL. '
            'Review: SELECT id, name, main_segment FROM stores WHERE category IS NULL; '
            'Apply manually after reclassifying unmapped stores: '
            'ALTER TABLE public.stores ALTER COLUMN category SET NOT NULL;',
            v_null_count, v_total;
    END IF;
END;
$$;

-- =============================================
-- STEP 4: CHECK constraints -- controlled vocabulary (4 constraints)
-- DROP IF EXISTS before ADD makes this safely re-runnable.
-- =============================================

-- 4a: category controlled values (Sprint 1 scope)
ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS check_category_values;
ALTER TABLE public.stores
    ADD CONSTRAINT check_category_values
    CHECK (
        category IS NULL
        OR category IN (
            'bebidas_alcoolicas',
            'mercearia'
        )
    );

COMMENT ON CONSTRAINT check_category_values ON public.stores IS
    'Sprint 1 controlled vocabulary. Extend by adding values in a future migration. '
    'Source: DEC-2026-05-06-004.';

-- 4b: subcategory values for bebidas_alcoolicas
ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS check_subcategory_bebidas;
ALTER TABLE public.stores
    ADD CONSTRAINT check_subcategory_bebidas
    CHECK (
        category IS DISTINCT FROM 'bebidas_alcoolicas'
        OR subcategory IS NULL
        OR subcategory IN (
            'adega',
            'loja-bebidas',
            'distribuidor',
            'emporio-cervejas',
            'outro'
        )
    );

COMMENT ON CONSTRAINT check_subcategory_bebidas ON public.stores IS
    '4 controlled subcategory values for bebidas_alcoolicas (+ outro + NULL). '
    'emporio-cervejas added per @commerce-strategist recommendation (DEC-2026-05-06-004).';

-- 4c: subcategory values for mercearia
ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS check_subcategory_mercearia;
ALTER TABLE public.stores
    ADD CONSTRAINT check_subcategory_mercearia
    CHECK (
        category IS DISTINCT FROM 'mercearia'
        OR subcategory IS NULL
        OR subcategory IN (
            'mercadinho-bairro',
            'minimercado',
            'hortifruti',
            'emporio-gourmet',
            'sacolao',
            'outro'
        )
    );

COMMENT ON CONSTRAINT check_subcategory_mercearia ON public.stores IS
    '5 controlled subcategory values for mercearia (+ outro + NULL). '
    'Source: DEC-2026-05-06-004 / @commerce-strategist.';

-- 4d: subcategory_custom required when subcategory = ''outro''
ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS check_subcategory_custom;
ALTER TABLE public.stores
    ADD CONSTRAINT check_subcategory_custom
    CHECK (
        (subcategory IS NULL OR subcategory <> 'outro')
        OR (
            subcategory = 'outro'
            AND subcategory_custom IS NOT NULL
            AND length(trim(subcategory_custom)) > 0
        )
    );

COMMENT ON CONSTRAINT check_subcategory_custom ON public.stores IS
    'Prevents orphaned ''outro'' values: requires subcategory_custom when subcategory = ''outro''.';

-- =============================================
-- STEP 5: Index for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_stores_category_subcategory
    ON public.stores (category, subcategory);

COMMENT ON INDEX public.idx_stores_category_subcategory IS
    'Composite index for category + subcategory queries (registry loader, analytics). '
    'Created in migration 042.';

-- =============================================
-- STEP 6: Post-migration audit NOTICE
-- =============================================

DO $$
DECLARE
    v_total     integer;
    v_bebidas   integer;
    v_mercearia integer;
    v_unmapped  integer;
BEGIN
    SELECT COUNT(*)                                              INTO v_total     FROM public.stores;
    SELECT COUNT(*) FILTER (WHERE category = 'bebidas_alcoolicas') INTO v_bebidas   FROM public.stores;
    SELECT COUNT(*) FILTER (WHERE category = 'mercearia')          INTO v_mercearia FROM public.stores;
    SELECT COUNT(*) FILTER (WHERE category IS NULL)                INTO v_unmapped  FROM public.stores;

    RAISE NOTICE
        '[Migration 042] COMPLETE | total=% | bebidas_alcoolicas=% | mercearia=% | unmapped=%',
        v_total, v_bebidas, v_mercearia, v_unmapped;
END;
$$;

COMMIT;
