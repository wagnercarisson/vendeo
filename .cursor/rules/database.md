# Padrões de Banco de Dados e Supabase

Regras para manipulação de dados, segurança e infraestrutura.

## 🛡 Segurança e RLS
- **Service Role**: O uso de `supabaseAdmin` é restrito a rotas de backend que exigem bypass de RLS. Deve ser acompanhado de verificações manuais de ownership.
- **Row Level Security (RLS)**: Sempre assuma que o RLS está ativo e deve ser respeitado.

## 📦 Migrations e Estrutura
- **Apenas Leitura**: Pastas `database/` e `database/migrations/` são consideradas read-only. Alterações exigem aprovação explícita e plano detalhado.
- **Integridade**: Verifique dependências de chaves estrangeiras antes de sugerir mudanças no schema.
