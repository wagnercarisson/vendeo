# Database Schema — Vendeo

Este diretório contém a estrutura versionada do banco de dados do projeto Vendeo.

## 📌 Arquivos

- `schema.sql` → Dump completo do schema do Supabase (apenas estrutura).
  - Inclui:
    - CREATE TABLE
    - INDEXES
    - CONSTRAINTS
    - FOREIGN KEYS
    - RLS (Row Level Security)
    - POLICIES

⚠️ Não contém dados de produção.

---

## 🔄 Como atualizar o schema

1. Acesse o painel do Supabase e copie:
   - Host
   - Database
   - User
   - Password

2. No terminal, dentro da pasta do projeto:

```powershell
$env:PGPASSWORD="SUA_SENHA"
pg_dump -h db.SEUPROJECTREF.supabase.co -p 5432 -U postgres -d postgres --schema=public --no-owner --no-privileges > database/schema.sql
$env:PGPASSWORD=""
```

3. Commitar a alteração no GitHub.

---

## 🎯 Objetivo

Manter a estrutura do banco versionada junto ao código do projeto, garantindo:

- Reprodutibilidade
- Auditoria de mudanças
- Segurança estrutural
- Base sólida para produção# vendeo