# Modelo de Dados — Vendeo (public)

## Visão geral
O Vendeo é multi-tenant por loja (**stores**). O isolamento atual é **owner-based** via `stores.owner_user_id`.
A tabela `store_members` existe para evolução futura (multiusuário por loja), mas o controle principal hoje é por owner.

---

## Convenções gerais

### Tipos e padrões
- IDs: `uuid` com default `gen_random_uuid()`.
- Timestamps:
  - Algumas tabelas usam `timestamp without time zone` (ex.: `stores.created_at`, `campaigns.created_at`).
  - Outras usam `timestamp with time zone` (ex.: `weekly_plans.created_at`, `weekly_plan_items.created_at`, `ai_generated_at`).
  - **Recomendação (futuro):** padronizar para `timestamptz` em todas.

### Enum/valores esperados (aplicação)
> Alguns campos são `text` no banco e a validação ocorre na aplicação.
- `weekly_plans.status`: default `'generated'`. Sugestão de valores válidos na app:
  - `generated` | `draft` | `approved` | `published` | `archived` (ajuste conforme UI)
- `campaigns.status`: default `'draft'`. Sugestão:
  - `draft` | `generated` | `scheduled` | `published` | `archived`
- `weekly_plan_items.day_of_week`:
  - esperado: **0–6** (0=Domingo … 6=Sábado) **ou** 1–7 (depende do padrão da sua UI).
  - **Defina e documente na app** para evitar inconsistência.
- `weekly_plan_items.content_type`:
  - esperado: tipos de conteúdo do Vendeo (ex.: `feed_post`, `story`, `reels`, `carousel`, `offer`, etc).
- `store_members.role`:
  - default `'owner'`. Sugestão futura:
  - `owner` | `admin` | `editor` | `viewer`

---

## Tabelas

### stores
**Finalidade:** Loja (tenant).

**PK:** `id (uuid)`

**Campos:**
- Identidade: `name` (NOT NULL)
- Localização: `city`, `state`, `address`, `neighborhood`
- Contato: `phone`, `whatsapp`, `instagram`
- Marca/posicionamento: `brand_positioning`, `main_segment`, `tone_of_voice`
- Visual: `logo_url`, `primary_color`, `secondary_color`
- Auditoria: `created_at`
- **Ownership (multi-tenant):** `owner_user_id (uuid NOT NULL)` → `auth.users.id` (FK no Supabase)

**Relacionamentos:**
- `stores (1) -> (N) campaigns` via `campaigns.store_id`
- `stores (1) -> (N) weekly_plans` via `weekly_plans.store_id`
- `stores (1) -> (N) store_members` via `store_members.store_id` (futuro)

**Regras de negócio:**
- Uma loja pertence a um único owner (`owner_user_id`).
- A UI deve impedir criar loja sem owner (RLS já força `owner_user_id = auth.uid()` no insert).

---

### campaigns
**Finalidade:** Campanhas/conteúdos para uma loja (imagem/texto/legenda/hashtags/reels).

**PK:** `id (uuid)`
**FK:** `store_id (uuid NOT NULL)` → `stores.id`

**Campos principais:**
- Produto/oferta: `product_name` (NOT NULL), `price`, `product_positioning`
- Estratégia: `audience`, `objective`
- Criativos: `image_url`, `headline`, `body_text`, `cta`
- Status: `status` (default `'draft'`)
- Auditoria: `created_at`

**IA (texto):**
- `ai_text`, `ai_caption`, `ai_hashtags`, `ai_cta`, `ai_generated_at`

**IA (reels):**
- `reels_hook`, `reels_script`, `reels_shotlist (jsonb)`, `reels_on_screen_text (jsonb)`
- `reels_audio_suggestion`, `reels_duration_seconds`
- `reels_caption`, `reels_cta`, `reels_hashtags`, `reels_generated_at`

**Relacionamentos:**
- `campaigns (N) -> (1) stores`
- `campaigns (1) -> (N) weekly_plan_items` via `weekly_plan_items.campaign_id` (opcional)

**Regras de negócio:**
- Campanha sempre pertence a uma loja (`store_id`).
- O app pode “gerar apenas o que falta” (modo automático) preenchendo campos IA nulos.

---

### weekly_plans
**Finalidade:** Plano semanal por loja (1 por semana por loja).

**PK:** `id (uuid)`
**FK:** `store_id (uuid NOT NULL)` → `stores.id`

**Campos:**
- `week_start (date NOT NULL)` → início da semana (padronizar se é sempre segunda-feira, por exemplo)
- `status (text NOT NULL default 'generated')`
- `strategy (jsonb NULL)` → estratégia/resumo do plano
- `created_at (timestamptz NOT NULL)`

**Índices/restrições:**
- **Unique:** `(store_id, week_start)` → impede duplicar plano para mesma loja e semana.

**Relacionamentos:**
- `weekly_plans (N) -> (1) stores`
- `weekly_plans (1) -> (N) weekly_plan_items` via `weekly_plan_items.plan_id`

**Regras de negócio:**
- Criar plano semanal deve respeitar a unicidade (store + week_start).
- Regeração deve atualizar itens/estratégia sem criar duplicata.

---

### weekly_plan_items
**Finalidade:** Itens do plano semanal (dia, tipo, tema, horário recomendado), opcionalmente vinculados a uma campanha.

**PK:** `id (uuid)`
**FK:** `plan_id (uuid NOT NULL)` → `weekly_plans.id`
**FK opcional:** `campaign_id (uuid NULL)` → `campaigns.id` (ON DELETE SET NULL)

**Campos:**
- `day_of_week (int NOT NULL)` → esperado 0–6 ou 1–7 (definir padrão)
- `content_type (text NOT NULL)` → tipo do conteúdo
- `theme (text NOT NULL)` → tema/gancho
- `recommended_time (text NULL)` → horário sugerido (ex.: "09:00", "18:30")
- `brief (jsonb NULL)` → briefing estruturado (insumos para IA)
- `created_at (timestamptz NOT NULL)`

**Relacionamentos:**
- `weekly_plan_items (N) -> (1) weekly_plans`
- `weekly_plan_items (N) -> (0..1) campaigns`

**Regras de negócio:**
- Um item deve sempre pertencer a um plano (`plan_id`).
- `campaign_id` é opcional e pode ser nulo.
- Se a campanha for apagada, o item mantém-se e `campaign_id` vira null.

---

### store_members (futuro / evolução)
**Finalidade:** Permitir multiusuário por loja com papéis.

**PK:** `id (uuid)`
**FK:** `store_id (uuid NOT NULL)` → `stores.id`
**FK:** `user_id (uuid NOT NULL)` → `auth.users.id`
**Campos:** `role (text NOT NULL default 'owner')`, `created_at (timestamptz NOT NULL)`

**Relacionamentos:**
- `store_members (N) -> (1) stores`
- `store_members (N) -> (1) auth.users`

**Regras de negócio (futuro):**
- O owner poderá convidar membros.
- RLS evolui de “owner-only” para “owner OR member”, com regras por role.

---

## Segurança (RLS) — resumo
- `stores`: owner-only (`owner_user_id = auth.uid()`)
- `campaigns`: owner-only via `stores(owner_user_id)`
- `weekly_plans`: owner-only via `stores(owner_user_id)`
- `weekly_plan_items`: owner-only via `weekly_plans -> stores(owner_user_id)` e validação extra de `campaign_id` (quando não nulo)
- `store_members`: owner-only (por enquanto)

---

## Checklist de integridade (aplicação)
- Definir padrão único para `day_of_week` (0–6 ou 1–7) e validar na API/UI.
- Validar `recommended_time` (formato HH:mm) na API/UI.
- Definir enum de `content_type` e `status` na aplicação (Zod).
- Garantir `owner_user_id` sempre preenchido no create store (RLS + backend).