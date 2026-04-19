# Rollback Plan - Restauracao de Backup

**Backup:** pre-v2-refactor-2026-04-18  
**Data:** 2026-04-18 22:51:55  
**Host:** db.efxiupkxtvhbekyorddn.supabase.co  
**Database:** postgres

## Cenarios de Restauracao

### Cenario 1: Rollback Total (Schema + Dados)

**Quando usar:** Refatoracao falhou completamente, precisamos voltar ao estado anterior.

```powershell
# 1. Conectar ao Supabase
$env:PGHOST = "db.efxiupkxtvhbekyorddn.supabase.co"
$env:PGPORT = "6543"
$env:PGDATABASE = "postgres"
$env:PGUSER = "postgres"
$env:PGPASSWORD = "SUA-SENHA"

# 2. DROP todas as tabelas (CUIDADO!)
psql --host=$env:PGHOST --port=$env:PGPORT --username=$env:PGUSER --dbname=$env:PGDATABASE << EOF
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\i database/backups/pre-v2-refactor-2026-04-18/01-schema-only.sql
\i database/backups/pre-v2-refactor-2026-04-18/02-data-full.sql
EOF
```

**Tempo estimado:** ~5 minutos

---

### Cenario 2: Restauracao Rapida (Dados Core)

```powershell
psql --host=$env:PGHOST --port=$env:PGPORT --username=$env:PGUSER --dbname=$env:PGDATABASE << EOF
TRUNCATE stores, campaigns, weekly_plans, weekly_plan_items CASCADE;
\i database/backups/pre-v2-refactor-2026-04-18/03-data-minimal.sql
EOF
```

**Tempo estimado:** ~2 minutos
