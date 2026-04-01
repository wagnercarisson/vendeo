# Modelo de Dados — Vendeo (public)

## Visão Geral

O Vendeo é um SaaS multi-tenant baseado em **lojas (stores)**.

O isolamento entre usuários é feito via modelo **owner-based**:

- Cada loja possui um `owner_user_id`
- Todas as entidades dependentes (campaigns, weekly_plans, weekly_plan_items)
  validam acesso via `stores.owner_user_id = auth.uid()`

A tabela `store_members` permanece no schema para futura evolução, mas a lógica do Beta é 100% baseada no `owner_user_id` da tabela `stores`.

---

# Convenções Gerais

## IDs
- Todas as PKs são `uuid` (UUID v4)

## Datas e Horários
- Padronizado para `timestamptz` em todos os campos de auditoria e geração.

## Enum Oficiais do Sistema

### 1. Status de Campanha (Global)
Controla o estado macro da campanha.
- `draft`: Inicial, sem conteúdo.
- `ready`: Conteúdo gerado pela IA, aguardando revisão.
- `approved`: Conteúdo aprovado pelo usuário, pronto para postar.

### 2. Status Granulares (Arte/Vídeo)
Permite que o usuário aprove a Arte independentemente do Vídeo.
- `none`: Não previsto/não gerado.
- `draft`: Em edição/rascunho.
- `ready`: Gerado pela IA.
- `approved`: Aprovado pelo usuário.

### 3. Tipos e Origens
- `campaign_type`: `post`, `reels`, `both`.
- `origin`: `manual` (criada direta), `plan` (derivada de planejamento semanal).
- `content_type`: `product`, `service`, `info`.

---

# Tabelas

## stores
Tenant principal do sistema.
- `id` (uuid, PK)
- `owner_user_id` (uuid, Unique, NOT NULL)
- `name` (text, NOT NULL)
- `city`, `state`, `logo_url`, `brand_positioning`, `main_segment`, `tone_of_voice`
- `address`, `neighborhood`, `phone`, `whatsapp`, `instagram`
- `primary_color`, `secondary_color`
- `created_at`, `updated_at` (timestamptz)

## campaigns
Unidade de conteúdo gerado.
- `id` (uuid, PK)
- `store_id` (uuid, FK)
- `weekly_plan_item_id` (uuid, FK, Unique) - Vínculo opcional com o plano semanal.
- `origin` (text, Default: 'manual')
- `content_type` (text, Default: 'product')
- `campaign_type` (text, Default: 'both')
- `status` (text, Default: 'draft')
- `post_status`, `reels_status` (text, Default: 'none')
- `product_name` (text, Opcional)
- `price` (numeric, Opcional)
- `price_label` (text, Default: null)
- `image_url` (Arte final), `product_image_url` (Foto base)
- [Campos de Copy IA...]
- [Campos de Roteiro Reels...]
- `created_at`, `updated_at` (timestamptz)

## weekly_plans
Planejamento estratégico semanal.
- `id` (uuid, PK)
- `store_id` (uuid, FK)
- `week_start` (date, NOT NULL, deve ser Segunda)
- `status` (text, Default: 'draft')
- `strategy` (jsonb)
- `created_at`, `updated_at` (timestamptz)

## weekly_plan_items
Sugestões individuais do plano.
- `id` (uuid, PK)
- `plan_id` (uuid, FK)
- `day_of_week` (int, 1-7)
- `content_type` (text)
- `theme`, `recommended_time`, `brief` (jsonb)
- `status` (text, Default: 'draft')
- `created_at` (timestamptz)

## beta_feedbacks
Coleta de feedback durante a fase beta.
- `id`, `user_id`, `store_id`, `rating`, `comment`, `category`, `metadata`, `created_at`

## campaign_metrics
Telemetria de uso da IA e utilidade do conteúdo.
- `id`, `campaign_id`, `metric_type` (usefulness/regeneration), `value_text`, `value_num`, `metadata`, `created_at`

---

# Segurança (RLS)
Isolamento total multi-tenant via `auth.uid()`.
Todas as tabelas possuem políticas que impedem o acesso a dados de outras lojas através da verificação do `owner_user_id`.

---

# Estado Atual do Modelo (Beta 1.0)
✔ Schema consolidado e normalizado em UTF-8.
✔ Suporte a status granulares Arte vs Vídeo.
✔ Vínculo forte entre Planejamento e Execução.
✔ Captura de métricas e feedback integrada.
✔ Versionado via migrations  

Vendeo está com base estrutural de SaaS madura.