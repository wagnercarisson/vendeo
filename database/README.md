## Schema Source

Migrations sao a canonical source. `schema.sql` e um snapshot derivado do database atual.

Para regenerar:

```powershell
supabase db dump --schema public > ../database/schema.sql
```

Quando o ambiente local nao tiver Docker disponivel, use o fluxo equivalente via `supabase db dump --dry-run` para obter as credenciais temporarias e execute `pg_dump` diretamente.

Ultima sincronizacao: 2026-04-29 15:54:50
