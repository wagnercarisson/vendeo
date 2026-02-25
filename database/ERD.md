# Modelo de Dados — Vendeo (public)

## Visão Geral

O Vendeo é um SaaS multi-tenant baseado em **lojas (stores)**.

O isolamento entre usuários é feito via modelo **owner-based**:

- Cada loja possui um `owner_user_id`
- Todas as entidades dependentes (campaigns, weekly_plans, weekly_plan_items)
  validam acesso via `stores.owner_user_id = auth.uid()`

A tabela `store_members` está preparada para futura evolução multiusuário,
mas o controle atual é exclusivamente por owner.

---

# Convenções Gerais

## IDs
- Todas as PKs são `uuid`
- Default: `gen_random_uuid()`

## Datas e Horários
- Uso misto de `timestamp` e `timestamptz`
- Recomendação futura: padronizar para `timestamptz`

## Enum Oficiais do Sistema

### weekly_plan_items.day_of_week
Padrão ISO (segunda-feira como início):

| Valor | Dia       |
|--------|-----------|
| 1 | Segunda |
| 2 | Terça |
| 3 | Quarta |
| 4 | Quinta |
| 5 | Sexta |
| 6 | Sábado |
| 7 | Domingo |

Constraint no banco:

day_of_week between 1 and 7


---

### weekly_plan_items.content_type

Valores oficiais:


post
reels


Constraint no banco:

content_type in ('post','reels')


---

### weekly_plans.week_start

Regra oficial:
- Sempre deve ser **segunda-feira**

Constraint no banco:

extract(isodow from week_start) = 1


---

# Tabelas

---

## stores

### Finalidade
Representa uma loja (tenant do sistema).

### PK
`id (uuid)`

### Campos

- `name` (text, NOT NULL)
- `city` (text)
- `state` (text)
- `logo_url` (text)
- `brand_positioning` (text)
- `main_segment` (text)
- `tone_of_voice` (text)
- `address` (text)
- `neighborhood` (text)
- `phone` (text)
- `whatsapp` (text)
- `instagram` (text)
- `primary_color` (text)
- `secondary_color` (text)
- `created_at` (timestamp)
- `owner_user_id` (uuid, NOT NULL)

### Regras

- Cada loja pertence a um único usuário.
- `owner_user_id` referencia `auth.users.id`
- RLS garante que somente o owner pode acessar sua loja.

### Relacionamentos

- `stores (1) → (N) campaigns`
- `stores (1) → (N) weekly_plans`
- `stores (1) → (N) store_members`

---

## campaigns

### Finalidade
Campanhas e conteúdos gerados para uma loja.

### PK
`id (uuid)`

### FK
`store_id → stores.id`

### Campos Principais

Produto:
- `product_name` (NOT NULL)
- `price`
- `product_positioning`

Marketing:
- `audience`
- `objective`
- `headline`
- `body_text`
- `cta`
- `status` (default 'draft')

IA:
- `ai_text`
- `ai_caption`
- `ai_hashtags`
- `ai_cta`
- `ai_generated_at`

Reels:
- `reels_hook`
- `reels_script`
- `reels_shotlist (jsonb)`
- `reels_on_screen_text (jsonb)`
- `reels_audio_suggestion`
- `reels_duration_seconds`
- `reels_caption`
- `reels_cta`
- `reels_hashtags`
- `reels_generated_at`

Auditoria:
- `created_at`

### Regras

- Sempre pertence a uma loja.
- Pode ou não estar associada a um item de plano semanal.
- RLS valida via `stores.owner_user_id`.

---

## weekly_plans

### Finalidade
Plano semanal de conteúdos por loja.

### PK
`id (uuid)`

### FK
`store_id → stores.id`

### Campos

- `week_start (date, NOT NULL)`
- `status (text, default 'generated')`
- `strategy (jsonb)`
- `created_at (timestamptz)`

### Constraints

- Unique: `(store_id, week_start)`
- `week_start` deve ser segunda-feira

### Regras

- Uma loja não pode ter dois planos na mesma semana.
- O plano pode ser regenerado, mas não duplicado.

### Relacionamentos

- `weekly_plans (1) → (N) weekly_plan_items`
- `weekly_plans (N) → (1) stores`

---

## weekly_plan_items

### Finalidade
Itens individuais do plano semanal.

### PK
`id (uuid)`

### FK
- `plan_id → weekly_plans.id`
- `campaign_id → campaigns.id` (opcional)

### Campos

- `day_of_week (int, NOT NULL)`
- `content_type (text, NOT NULL)`
- `theme (text, NOT NULL)`
- `recommended_time (text)`
- `brief (jsonb)`
- `created_at (timestamptz)`

### Constraints

- `day_of_week between 1 and 7`
- `content_type in ('post','reels')`

### Regras

- Sempre pertence a um plano semanal.
- `campaign_id` pode ser null.
- Se a campanha for deletada, o vínculo é removido.

---

## store_members (futuro)

### Finalidade
Permitir múltiplos usuários por loja.

### PK
`id (uuid)`

### FK
- `store_id → stores.id`
- `user_id → auth.users.id`

### Campos
- `role (text, default 'owner')`
- `created_at`

### Status Atual
- Ainda não utilizado ativamente.
- Preparado para evolução futura de permissões.

---

# Segurança (RLS)

Modelo atual: **Owner-Based**

- stores → owner only
- campaigns → owner via store
- weekly_plans → owner via store
- weekly_plan_items → owner via weekly_plans → store
- store_members → owner only (por enquanto)

---

# Estado Atual do Modelo

✔ Multi-tenant seguro  
✔ Constraints críticas aplicadas  
✔ Enum travados no banco  
✔ Modelo documentado  
✔ Versionado via migrations  

Vendeo está com base estrutural de SaaS madura.