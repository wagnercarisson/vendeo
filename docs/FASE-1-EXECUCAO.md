# ✅ FASE 1: Motor V2 - Schema Clean

**Status:** Migrations criadas, aguardando execução  
**Data:** 2026-04-19  
**Responsável:** @aiox-master → @data-engineer  

---

## 📦 Migrations Criadas

```
database/migrations/
├── 025_visual_signatures_core.sql           ✅ Criada
├── 026_visual_signature_profiles.sql        ✅ Criada
├── 027_populate_visual_signatures.sql       ✅ Criada
├── 028_populate_default_profiles.sql        ✅ Criada
└── 029_campaigns_add_visual_signature_link.sql ✅ Criada
```

---

## 🎯 O Que Cada Migration Faz

### **025: Visual Signatures Core**
**Cria:** Tabela `visual_signatures`  
**Propósito:** Core visual identity (cores, logo, tipografia) — fixo por loja  
**Risco:** ⚪ ZERO (apenas cria tabela nova)

**Campos principais:**
- `store_id` → FK para stores
- `primary_color`, `secondary_color` → Cores da marca
- `logo_url` → Logo da loja
- `signature_seed` → UUID para variações consistentes

---

### **026: Visual Signature Profiles**
**Cria:** Tabela `visual_signature_profiles`  
**Propósito:** Regras visuais por contexto (standard, promotional, seasonal, premium, urgency)  
**Risco:** ⚪ ZERO (apenas cria tabela nova)

**Campos principais:**
- `signature_id` → FK para visual_signatures
- `context_type` → Tipo de campanha ('standard', 'promotional', etc)
- `composition_rules` → Regras de layout (JSON)
- `typography_rules` → Regras de texto (JSON)
- `color_rules` → Regras de cor (JSON)
- `intensity_level` → 'minimal', 'balanced', 'strong'

---

### **027: Populate Visual Signatures**
**Migra:** Dados de `stores` → `visual_signatures`  
**Propósito:** Criar signature para cada loja existente  
**Risco:** 🟡 BAIXO (apenas lê stores e insere, não altera nada)

**O que faz:**
1. Para cada loja existente
2. Copia `primary_color`, `secondary_color`, `logo_url`
3. Gera `signature_seed` único
4. Insere em `visual_signatures`

**Validação:** `SELECT COUNT(*) FROM visual_signatures;` deve igualar `SELECT COUNT(*) FROM stores;`

---

### **028: Populate Default Profiles**
**Cria:** 5 profiles padrão para cada signature  
**Propósito:** Configuração inicial de contextos visuais  
**Risco:** 🟡 BAIXO (inserção bulk, não altera dados existentes)

**O que faz:**
1. Para cada `visual_signature`
2. Cria 5 profiles: `standard`, `promotional`, `seasonal`, `premium`, `urgency`
3. Cada um com regras padrão sensatas

**Regras padrão criadas:**

| Context | Layout Style | Intensity | Typography | Uso |
|---------|-------------|-----------|------------|-----|
| **standard** | balanced | balanced | normal | Campanhas diárias |
| **promotional** | dynamic | strong | bold | Promoções/descontos |
| **seasonal** | thematic | balanced | medium | Datas especiais |
| **premium** | elegant | minimal | light | Produtos premium |
| **urgency** | aggressive | strong | extrabold | Ofertas limitadas |

**Validação:** 
```sql
SELECT COUNT(*) FROM visual_signature_profiles;
-- Deve ser 5 × número de lojas
```

---

### **029: Link Campaigns to Visual Signatures**
**Adiciona:** Colunas `visual_signature_id` e `visual_context` em `campaigns`  
**Propósito:** Permitir campanhas usarem novo sistema (opcional durante migração)  
**Risco:** ⚪ ZERO (colunas opcionais, não quebra queries existentes)

**Campos adicionados:**
- `visual_signature_id` → Opcional, FK para `visual_signatures`
- `visual_context` → Default 'standard', define qual profile usar

**Importante:** Campanhas existentes continuam funcionando normalmente (campos NULL/default)

---

## 🚀 Como Executar

### **Opção 1: Supabase SQL Editor (RECOMENDADO)**

1. Acessar [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecionar projeto Vendeo
3. Ir em **SQL Editor**
4. Para cada migration (025 → 026 → 027 → 028 → 029):
   - Abrir arquivo local
   - Copiar conteúdo completo
   - Colar no editor
   - Executar (Run)
   - Verificar output (deve mostrar "NOTICE: Migration XXX completed")

---

### **Opção 2: psql Command Line**

```powershell
# Configurar credenciais (se ainda não estão configuradas)
$env:PGHOST = "db.efxiupkxtvhbekyorddn.supabase.co"
$env:PGPORT = "6543"  # Pooler port
$env:PGDATABASE = "postgres"
$env:PGUSER = "postgres"
$env:PGPASSWORD = "SUA-SENHA"

# Executar cada migration
psql -h $env:PGHOST -p $env:PGPORT -U $env:PGUSER -d $env:PGDATABASE `
  -f database/migrations/025_visual_signatures_core.sql

psql -h $env:PGHOST -p $env:PGPORT -U $env:PGUSER -d $env:PGDATABASE `
  -f database/migrations/026_visual_signature_profiles.sql

psql -h $env:PGHOST -p $env:PGPORT -U $env:PGUSER -d $env:PGDATABASE `
  -f database/migrations/027_populate_visual_signatures.sql

psql -h $env:PGHOST -p $env:PGPORT -U $env:PGUSER -d $env:PGDATABASE `
  -f database/migrations/028_populate_default_profiles.sql

psql -h $env:PGHOST -p $env:PGPORT -U $env:PGUSER -d $env:PGDATABASE `
  -f database/migrations/029_campaigns_add_visual_signature_link.sql
```

---

## ✅ Validação Pós-Execução

Executar no SQL Editor ou psql:

```sql
-- 1. Verificar tabelas criadas
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('visual_signatures', 'visual_signature_profiles')
ORDER BY table_name;

-- Esperado: 2 tabelas listadas

-- 2. Verificar dados migrados
SELECT 
    (SELECT COUNT(*) FROM stores) AS total_stores,
    (SELECT COUNT(*) FROM visual_signatures) AS total_signatures,
    (SELECT COUNT(*) FROM visual_signature_profiles) AS total_profiles,
    (SELECT COUNT(*) FROM visual_signature_profiles) / 5 AS profiles_per_signature;

-- Esperado: total_stores = total_signatures, total_profiles = 5 × total_signatures

-- 3. Verificar campaigns tem novas colunas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'campaigns' 
  AND column_name IN ('visual_signature_id', 'visual_context')
ORDER BY column_name;

-- Esperado: 2 colunas listadas

-- 4. Inspecionar exemplo de profile
SELECT 
    context_type,
    composition_rules,
    typography_rules,
    color_rules,
    intensity_level
FROM visual_signature_profiles
LIMIT 1;

-- Esperado: JSON estruturado em cada campo
```

---

## 🔄 Rollback (Se Necessário)

```sql
-- Reverter na ordem inversa
DROP TABLE IF EXISTS public.visual_signature_profiles CASCADE;
DROP TABLE IF EXISTS public.visual_signatures CASCADE;

ALTER TABLE public.campaigns 
  DROP COLUMN IF EXISTS visual_signature_id,
  DROP COLUMN IF EXISTS visual_context;
```

---

## 🎯 Próximos Passos (Após Validação)

1. ✅ Commitar migrations:
   ```bash
   git add database/migrations/025_*.sql database/migrations/026_*.sql database/migrations/027_*.sql database/migrations/028_*.sql database/migrations/029_*.sql
   git commit -m "feat(db): Visual Signature System - schema clean (FASE 1)"
   ```

2. ✅ Atualizar `database/schema.sql` com novas tabelas

3. 🎨 **PASSO 7:** @ux-design-expert define regras visuais detalhadas para cada profile

4. 🚀 **FASE 2:** Implementar UI e lógica do Visual Signature Manager

---

## ⚠️ Importante

- ✅ **Sistema antigo continua funcionando normalmente**
- ✅ Campanhas existentes não são afetadas
- ✅ Novas colunas são opcionais durante transição
- ✅ Rollback é simples e seguro
- ✅ Zero downtime necessário

---

**— @aiox-master (Orion), orquestrando FASE 1 🎯**
