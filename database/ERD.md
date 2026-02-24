# Modelo de Dados — Vendeo (public)

## Visão geral
Modelo multi-tenant baseado em **stores.owner_user_id** (owner-based).  
A tabela **store_members** existe para evolução futura (membros/roles), mas hoje o controle principal é por owner.

---

## Tabelas

### stores
**Finalidade:** Loja (tenant).
- **PK:** `id (uuid)`
- **Campos-chave:** `name`, `city`, `state`, `instagram`, `brand_positioning`, `main_segment`, `tone_of_voice`, `primary_color`, `secondary_color`
- **Ownership:** `owner_user_id (uuid NOT NULL)` → `auth.users.id` (FK no Supabase)

**Relacionamentos:**
- `stores (1) -> (N) campaigns` via `campaigns.store_id`
- `stores (1) -> (N) weekly_plans` via `weekly_plans.store_id`
- `stores (1) -> (N) store_members` via `store_members.store_id` (futuro)

---

### campaigns
**Finalidade:** Campanhas/conteúdos gerados para uma loja.
- **PK:** `id (uuid)`
- **FK:** `store_id (uuid NOT NULL)` → `stores.id`
- **Campos principais:**
  - Produto: `product_name`, `price`, `product_positioning`
  - Marketing: `audience`, `objective`, `headline`, `body_text`, `cta`, `status`
  - IA: `ai_text`, `ai_caption`, `ai_hashtags`, `ai_cta`, `ai_generated_at`
  - Reels: `reels_hook`, `reels_script`, `reels_shotlist (jsonb)`, `reels_on_screen_text (jsonb)`,
    `reels_audio_suggestion`, `reels_duration_seconds`, `reels_caption`, `reels_cta`, `reels_hashtags`, `reels_generated_at`

**Relacionamentos:**
- `campaigns (N) -> (1) stores`
- `campaigns (1) -> (N) weekly_plan_items` via `weekly_plan_items.campaign_id` (opcional)

---

### weekly_plans
**Finalidade:** Plano semanal por loja.
- **PK:** `id (uuid)`
- **FK:** `store_id (uuid NOT NULL)` → `stores.id`
- **Campos principais:** `week_start (date)`, `status`, `strategy (jsonb)`, `created_at`

**Relacionamentos:**
- `weekly_plans (N) -> (1) stores`
- `weekly_plans (1) -> (N) weekly_plan_items` via `weekly_plan_items.plan_id`

---

### weekly_plan_items
**Finalidade:** Itens/entradas do plano semanal (por dia/tipo/tema), opcionalmente ligados a uma campaign.
- **PK:** `id (uuid)`
- **FK:** `plan_id (uuid NOT NULL)` → `weekly_plans.id`
- **FK opcional:** `campaign_id (uuid NULL)` → `campaigns.id`
- **Campos principais:** `day_of_week (int)`, `content_type`, `theme`, `recommended_time`, `brief (jsonb)`, `created_at`

**Relacionamentos:**
- `weekly_plan_items (N) -> (1) weekly_plans`
- `weekly_plan_items (N) -> (0..1) campaigns`

---

### store_members (futuro / evolução)
**Finalidade:** Membros por loja (para multiusuário por loja).
- **PK:** `id (uuid)`
- **FK:** `store_id (uuid NOT NULL)` → `stores.id`
- **FK:** `user_id (uuid NOT NULL)` → `auth.users.id`
- **Campos principais:** `role (text, default 'owner')`, `created_at`

**Relacionamentos:**
- `store_members (N) -> (1) stores`
- `store_members (N) -> (1) auth.users`

---

## Notas de segurança (alto nível)
- Modelo atual: **owner-based** via `stores.owner_user_id`.
- `store_members` está preparada para evoluir para **owner OR member** no futuro.