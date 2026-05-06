# TASK: Migration 042 — Category + Subcategory Schema

> **Decisão:** [DEC-2026-05-06-003.md](../integration-checklists/DEC-2026-05-06-003.md)  
> **Responsável:** @data-engineer (Dara)  
> **Prazo:** 2 horas  
> **Bloqueio:** 🔴 CRÍTICO — Bloqueia Sprint 1 completo (10 registries + UI)

---

## 🎯 OBJETIVO

Criar Migration 042 que adiciona suporte a **subsegmentação hierárquica** no schema de `stores`:
- `category` (ex: bebidas_alcoolicas, mercearia)
- `subcategory` (ex: adega, loja-bebidas, outro)
- `subcategory_custom` (campo livre quando subcategory = 'outro')

---

## 📋 REQUISITOS TÉCNICOS

### 1. Schema Changes

```sql
-- Migration: 042_add_category_subcategory.sql

-- Step 1: Add columns (nullable inicialmente)
ALTER TABLE stores 
ADD COLUMN category TEXT,
ADD COLUMN subcategory TEXT,
ADD COLUMN subcategory_custom TEXT;

-- Step 2: Backfill automático
UPDATE stores 
SET category = CASE
  WHEN main_segment IN ('Loja de bebidas', 'Adega', 'Adegas e Distribuidoras', 'Distribuidora') 
    THEN 'bebidas_alcoolicas'
  WHEN main_segment IN ('Mercado', 'Mercearia', 'Mercado / Mercearia', 'Mercadinho')
    THEN 'mercearia'
  -- Adicionar outros segmentos conforme necessário
  ELSE NULL
END
WHERE category IS NULL;

-- Step 3: Set category as NOT NULL após backfill
ALTER TABLE stores 
ALTER COLUMN category SET NOT NULL;

-- Step 4: CHECK constraints para valores controlados (REVISÃO: baseado em @commerce-strategist)
ALTER TABLE stores 
ADD CONSTRAINT check_category_values 
CHECK (category IN (
  'bebidas_alcoolicas',
  'mercearia'
  -- Adicionar outros segmentos conforme expandir
));

ALTER TABLE stores 
ADD CONSTRAINT check_subcategory_bebidas 
CHECK (
  category != 'bebidas_alcoolicas' OR 
  subcategory IN ('adega', 'loja-bebidas', 'distribuidor', 'emporio-cervejas', 'outro', NULL)
);

ALTER TABLE stores 
ADD CONSTRAINT check_subcategory_mercearia 
CHECK (s
ALTER TABLE stores DROP CONSTRAINT IF EXISTS check_subcategory_custom;
ALTER TABLE stores DROP CONSTRAINT IF EXISTS check_subcategory_mercearia;
ALTER TABLE stores DROP CONSTRAINT IF EXISTS check_subcategory_bebidas;
ALTER TABLE stores DROP CONSTRAINT IF EXISTS check_category_values
  subcategory IN ('mercadinho-bairro', 'minimercado', 'hortifruti', 'emporio-gourmet', 'sacolao', 'outro', NULL)
);

-- Step 5: Constraint de validação "outro"
ALTER TABLE stores 
ADD CONSTRAINT check_subcategory_custom 
CHECK (
  (subcategory IS NULL OR subcategory != 'outro') OR 
  (subcategory = 'outro' AND subcategory_custom IS NOT NULL)
);

-- Step 6: Index para performance
CREATE INDEX idx_stores_category_subcategory 
ON stores(category, subcategory);
```

### 2. Rollback Strategy

```sql
-- Rollback: 042_add_category_subcategory_rollback.sql

-- Remove constraint
ALTER TABLE stores DROP CONSTRAINT IF EXISTS check_subcategory_custom;

-- Remove index
DROP INDEX IF EXISTS idx_stores_category_subcategory;

-- Remove columns
ALTER TABLE stores DROP COLUMN IF EXISTS category;
ALTER TABLE stores DROP COLUMN IF EXISTS subcategory;
ALTER TABLE stores DROP COLUMN IF EXISTS subcategory_custom;
```

---

## 🧪 VALIDAÇÃO OBRIGATÓRIA

### Testes a Executar Após Migration

```sql
-- Teste 1: Verificar backfill completo
SELECT COUNT(*) FROM stores WHERE category IS NULL;
-- Esperado: 0 (todas as lojas devem ter category)

-- Teste 2: Verificar constraint "outro" funciona
INSERT INTO stores (name, category, subcategory, subcategory_custom)
VALUES ('Teste', 'bebidas_alcoolicas', 'outro', NULL);
-- Esperado: ERROR (constraint check_subcategory_custom violated)

INSERT INTO stores (name, category, subcategory, subcategory_custom)
VALUES ('Teste', 'bebidas_alcoolicas', 'outro', 'Conveniência');
-- Esperado: SUCCESS

-- Teste 3: Verificar constraint de valores controlados (bebidas)
INSERT INTO stores (name, category, subcategory)
VALUES ('Teste', 'bebidas_alcoolicas', 'valor-invalido');
-- Esperado: ERROR (constraint check_subcategory_bebidas violated)

INSERT INTO stores (name, category, subcategory)
VALUES ('Teste', 'bebidas_alcoolicas', 'adega');
-- Esperado: SUCCESS

-- Teste 4: Verificar constraint de valores controlados (mercearia)
INSERT INTO stores (name, category, subcategory)
VALUES ('Teste', 'mercearia', 'valor-invalido');
-- Esperado: ERROR (constraint check_subcategory_mercearia violated)

INSERT INTO stores (name, category, subcategory)
VALUES ('Teste', 'mercearia', 'hortifruti');
-- Esperado: SUCCESS

-- Teste 5: Verificar index criado
SELECT indexname FROM pg_indexes 
WHERE tablename = 'stores' AND indexname = 'idx_stores_category_subcategory';
-- Esperado: 1 row

-- Teste 6: Verificar distribuição de categorias
SELECT category, COUNT(*) as total
FROM stores
GROUP BY category
ORDER BY total DESC;
-- Esperado: Mostrar distribuição (bebidas_alcoolicas, mercearia, etc)
```

---

## 📊 MAPEAMENTO DE VALORES (Backfill)

### Tabela de Conversão: main_segment → category

| main_segment (UI Legado) | category (Novo) |
|--------------------------|-----------------|
| "Loja de bebidas" | `bebidas_alcoolicas` |
| "Adega" | `bebidas_alcoolicas` |
| "Adegas e Distribuidoras" | `bebidas_alcoolicas` |
| "Distribuidora" | `bebidas_alcoolicas` |
| "Mercado" | `mercearia` |
| "Mercearia" | `mercearia` |
| "Mercado / Mercearia" | `mercearia` |
| "Mercadinho" | `mercearia` |

**Nota:** Se existirem valores não mapeados, deixar category = NULL temporariamente e alertar @aiox-master.

---

## ⚠️ CONSIDERAÇÕES IMPORTANTES

### 1. Dados Existentes
- **Não deletar `main_segment`** — manter por enquanto para backward compatibility
- Lojas existentes terão `category` preenchido, mas `subcategory` = NULL (ok)
- Subcategory será preenchida no próximo onboarding/edição da loja

### 2. RLS (Row Level Security)
- Verificar se políticas RLS existentes em `stores` continuam funcionando
- Testar queries com RLS ativo após migration

### 3. Performance
- Index criado em (category, subcategory) otimiza queries do registry loader
- Monitorar impacto em queries existentes (esperado: nenhum)

### 4. Supabase Studio
- Após deploy, verificar no Supabase Studio:
  - Colunas visíveis
  - Constraint ativa
  - Index criado

---

## 📦 ENTREGÁVEIS

### Arquivos a Criar

1. **`supabase/migrations/042_add_category_subcategory.sql`**
   - Migration principal com 5 steps (ADD, BACKFILL, NOT NULL, CONSTRAINT, INDEX)

2. **`supabase/migrations/042_add_category_subcategory_rollback.sql`** (OPCIONAL mas recomendado)
   - Rollback completo para emergências

3. **`docs/migrations/042-validation-results.md`** (OPCIONAL)
   - Resultados dos 4 testes de validação
   - Screenshot do Supabase Studio mostrando colunas

---

## 🚀 FLUXO DE EXECUÇÃO

### Passo a Passo

```bash
# 1. Criar migration file
cd supabase/migrations
# Criar 042_add_category_subcategory.sql

# 2. Validar sintaxe SQL (local)
psql -h localhost -U postgres -d vendeo -f 042_add_category_subcategory.sql --dry-run

# 3. Aplicar migration (staging primeiro)
supabase db push --project-ref STAGING_REF

# 4. Executar testes de validação (ver seção acima)

# 5. Se tudo OK, aplicar em produção
supabase db push --project-ref PROD_REF

# 6. Monitorar logs por 10 minutos
supabase logs --project-ref PROD_REF --limit 100
```

### Rollback de Emergência

```bash
# Se algo der errado, aplicar rollback
psql -h DB_HOST -U postgres -d vendeo -f 042_add_category_subcategory_rollback.sql
```

---

## ✅ CHECKLIST DE CONCLUSÃO

- [ ] Migration 042 criada em `supabase/migrations/`
- [ ] Rollback script criado (opcional mas recomendado)
- [ ] Sintaxe SQL validada (psql --dry-run)
- [ ] Applied em staging
- [ ] 4 testes de validação executados (0 errors)
- [ ] Screenshot do Supabase Studio (colunas + constraint + index)
- [ ] Applied em produção
- [ ] Logs monitorados (sem erros)
- [ ] @dev notificado: "Migration 042 DEPLOYED ✅"

---

## 🔄 PRÓXIMOS PASSOS (APÓS DEPLOYMENT)

Assim que Migration 042 estiver deployed:
1. ✅ Notificar @dev (Dex) via handoff
2. ✅ @dev implementa loader.ts + UI (4h)
3. ✅ Sprint 1 desbloqueado (10 registry variants)

---

## 📞 SUPORTE

**Dúvidas técnicas:** @aiox-master  
**Contexto de negócio:** [DEC-2026-05-06-003.md](../integration-checklists/DEC-2026-05-06-003.md)  
**Schema atual:** `database/schema.sql`

---

**Status:** 🟢 READY TO START  
**Effort:** 2 horas  
**Prioridade:** 🔴 P0 (CRÍTICO — bloqueia Sprint 1)
