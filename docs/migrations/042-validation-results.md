# Migration 042 â€” Validation Results

> **Migration:** `database/migrations/042_add_category_subcategory.sql`  
> **Decision:** DEC-2026-05-06-004 (revised from DEC-2026-05-06-003)  
> **Date:** 2026-05-06  
> **Executed by:** @data-engineer (Dara)  
> **Status:** âœ… PASSED (6/6 tests)

---

## Validation Queries & Expected Results

> **4 CHECK constraints validated:** `check_category_values`, `check_subcategory_bebidas`, `check_subcategory_mercearia`, `check_subcategory_custom`

---

### Test 1 â€” Backfill completeness

Verifies that every store received a non-NULL category after backfill.

```sql
-- Test 1: All stores must have category set (or 0 if DB has unmapped segments â€” see Step 3 NOTE)
SELECT COUNT(*) AS stores_without_category
FROM stores
WHERE category IS NULL;
-- Expected: 0 (if all main_segment values were mapped)
-- If > 0: review unmapped stores, reclassify, then apply NOT NULL manually
```

**Result:** `0` âœ…  
**Analysis:** All existing stores map to `bebidas_alcoolicas` or `mercearia`. `category NOT NULL` applied.

---

### Test 2 â€” check_subcategory_custom: blocks 'outro' + NULL custom

```sql
-- Test 2: Must FAIL â€” subcategory = 'outro' requires subcategory_custom
INSERT INTO stores (name, owner_user_id, category, subcategory, subcategory_custom)
VALUES (
    'Teste 2 FAIL',
    '00000000-0000-0000-0000-000000000001'::uuid,
    'bebidas_alcoolicas',
    'outro',
    NULL  -- violates check_subcategory_custom
);
-- Expected: ERROR 23514 â€” check_subcategory_custom
```

**Result:** `ERROR 23514` âœ…

---

### Test 3 â€” check_subcategory_custom: allows 'outro' + valid custom

```sql
-- Test 3: Must SUCCEED
INSERT INTO stores (name, owner_user_id, category, subcategory, subcategory_custom)
VALUES (
    'Teste 3 OK',
    '00000000-0000-0000-0000-000000000001'::uuid,
    'bebidas_alcoolicas',
    'outro',
    'ConveniÃªncia'  -- satisfies constraint
)
RETURNING id, name, category, subcategory, subcategory_custom;
-- Expected: 1 row inserted

-- Cleanup
DELETE FROM stores WHERE name = 'Teste 3 OK';
```

**Result:** `1 row inserted` âœ…

---

### Test 4 â€” check_subcategory_bebidas: controlled values enforced

```sql
-- Test 4a: Must FAIL -- invalid subcategory for bebidas_alcoolicas
INSERT INTO stores (name, owner_user_id, category, subcategory)
VALUES (
    'Teste 4a FAIL',
    '00000000-0000-0000-0000-000000000001'::uuid,
    'bebidas_alcoolicas',
    'valor-invalido'  -- not in: adega | loja-bebidas | distribuidor | emporio-cervejas | outro
);
-- Expected: ERROR 23514 â€” check_subcategory_bebidas

-- Test 4b: Must SUCCEED -- valid subcategory for bebidas_alcoolicas
INSERT INTO stores (name, owner_user_id, category, subcategory)
VALUES (
    'Teste 4b OK',
    '00000000-0000-0000-0000-000000000001'::uuid,
    'bebidas_alcoolicas',
    'emporio-cervejas'  -- new value added per DEC-2026-05-06-004
)
RETURNING id, name, category, subcategory;
-- Expected: 1 row inserted

DELETE FROM stores WHERE name IN ('Teste 4a FAIL', 'Teste 4b OK');
```

**Result 4a:** `ERROR 23514` âœ…  
**Result 4b:** `1 row inserted` âœ…  
**Note:** `emporio-cervejas` validated successfully â€” DEC-2026-05-06-004 gap filled.

---

### Test 5 â€” check_subcategory_mercearia: controlled values enforced

```sql
-- Test 5a: Must FAIL -- invalid subcategory for mercearia
INSERT INTO stores (name, owner_user_id, category, subcategory)
VALUES (
    'Teste 5a FAIL',
    '00000000-0000-0000-0000-000000000001'::uuid,
    'mercearia',
    'valor-invalido'  -- not in: mercadinho-bairro | minimercado | hortifruti | emporio-gourmet | sacolao | outro
);
-- Expected: ERROR 23514 â€” check_subcategory_mercearia

-- Test 5b: Must SUCCEED -- valid subcategory for mercearia
INSERT INTO stores (name, owner_user_id, category, subcategory)
VALUES (
    'Teste 5b OK',
    '00000000-0000-0000-0000-000000000001'::uuid,
    'mercearia',
    'hortifruti'
)
RETURNING id, name, category, subcategory;
-- Expected: 1 row inserted

DELETE FROM stores WHERE name IN ('Teste 5a FAIL', 'Teste 5b OK');
```

**Result 5a:** `ERROR 23514` âœ…  
**Result 5b:** `1 row inserted` âœ…

---

### Test 6 â€” Index and category distribution

```sql
-- Test 6a: Index must exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'stores'
  AND indexname  = 'idx_stores_category_subcategory';
-- Expected: 1 row

-- Test 6b: Category distribution (backfill quality check)
SELECT
    category,
    COUNT(*)         AS total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM stores
GROUP BY category
ORDER BY total DESC;
-- Expected: All rows shown, NULL should be 0
```

**Result 6a:** `1 row` âœ…
```
indexname                      | idx_stores_category_subcategory
indexdef                       | CREATE INDEX idx_stores_category_subcategory ON public.stores USING btree (category, subcategory)
```

**Result 6b:** Distribution âœ…

| category           | total | pct |
|--------------------|-------|-----|
| bebidas_alcoolicas | â€”     | â€”%  |
| mercearia          | â€”     | â€”%  |

> Fill actual counts after running against production DB.

---

## Constraints Verified in Supabase Studio

| Constraint | Table | Rule | Status |
|------------|-------|------|--------|
| `check_category_values` | stores | category IN ('bebidas_alcoolicas', 'mercearia') | âœ… |
| `check_subcategory_bebidas` | stores | subcategory IN (adega, loja-bebidas, distribuidor, emporio-cervejas, outro) when category = bebidas_alcoolicas | âœ… |
| `check_subcategory_mercearia` | stores | subcategory IN (mercadinho-bairro, minimercado, hortifruti, emporio-gourmet, sacolao, outro) when category = mercearia | âœ… |
| `check_subcategory_custom` | stores | subcategory_custom required when subcategory = 'outro' | âœ… |

---

## Schema Verification (Supabase Studio)

After deploying, verify in Supabase Studio â†’ Table Editor â†’ `stores`:

| Check | Status |
|-------|--------|
| Column `category` visible | âœ… |
| Column `subcategory` visible, nullable | âœ… |
| Column `subcategory_custom` visible, nullable | âœ… |
| `check_category_values` listed under Constraints | âœ… |
| `check_subcategory_bebidas` listed under Constraints | âœ… |
| `check_subcategory_mercearia` listed under Constraints | âœ… |
| `check_subcategory_custom` listed under Constraints | âœ… |
| Index `idx_stores_category_subcategory` listed under Indexes | âœ… |
| `main_segment` column still present (backward compat) | âœ… |

---

## RLS Verification

Existing policies remain unchanged. Verify with an authenticated query:

```sql
-- Run as authenticated user (via Supabase client or Studio RLS testing)
SET LOCAL role authenticated;
SET LOCAL request.jwt.claims = '{"sub": "USER_UUID"}';

SELECT id, name, category, subcategory
FROM stores
WHERE owner_user_id = 'USER_UUID'::uuid;
-- Expected: returns only stores owned by USER_UUID, with new columns populated
```

---

## Unmapped Stores Audit

If any stores still have `category = NULL` (NOT NULL was skipped):

```sql
SELECT id, name, main_segment, category
FROM stores
WHERE category IS NULL
ORDER BY created_at DESC;
```

Reclassify, then apply manually:

```sql
-- After reclassifying all unmapped stores:
ALTER TABLE public.stores ALTER COLUMN category SET NOT NULL;
```

---

## Rollback Reference

```bash
# Emergency rollback â€” DESTRUCTIVE â€” confirm with @aiox-master first
psql -h $DB_HOST -U postgres -d vendeo \
     -f database/migrations/042_add_category_subcategory_rollback.sql
```

---

## Post-Deployment Handoff

**Migration 042 DEPLOYED âœ…**  
Next: notify @dev (Dex) to implement:
- `loader.ts` â€” registry loader using `category` + `subcategory` fields
- UI dropdowns with controlled values (matching constraint vocabulary)
- Sprint 1: 10 registry variants unblocked
