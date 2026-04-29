# Proposed Schema Changes (Marketing Intelligence)

**Status:** ✅ APROVADO — 29 Abril 2026  
**Goal:** Add Tier 2 context and Tier 3 passive learning support while keeping core tables lean

**Decisões Finais:**
- ✅ Migrations são canonical (schema.sql será regenerado)
- ✅ intelligence_snapshot PARCIAL em weekly_plans (não completo)
- ✅ approval_duration_seconds + edited_fields incluídos no MVP
- ✅ Sem JSONB indexes inicialmente (adicionar sob demanda)
- ✅ TTL 90 dias para campaign_events (cleanup semanal)

---

## 1) New table: store_intelligence
Rationale: keep stores table small and isolate experimental / evolving structures.

```sql
CREATE TABLE IF NOT EXISTS public.store_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,

  -- Tier 2 (optional manual context)
  context jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Tier 3 (learned patterns)
  learned_patterns jsonb NOT NULL DEFAULT '{}'::jsonb,

  intelligence_score int NOT NULL DEFAULT 0,
  last_learned timestamptz,
  campaigns_analyzed int NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT store_intelligence_store_unique UNIQUE (store_id)
);

CREATE INDEX IF NOT EXISTS idx_store_intelligence_store_id
  ON public.store_intelligence(store_id);
```

Suggested JSON shapes (examples, not enforced by DB):
- context: { best_days: ["sexta"], best_hours: ["18-22"], target_audience: "adultos_25_45", main_differentiation: "qualidade" }
- learned_patterns: { most_created_campaigns: {...}, posting_patterns: {...}, product_patterns: {...} }

## 2) New table: campaign_events
Rationale: track lifecycle events required for passive learning.

```sql
CREATE TABLE IF NOT EXISTS public.campaign_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,

  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Typed columns for analytics (fast queries)
  event_objective text,
  event_audience text,
  event_price numeric,
  event_day_of_week smallint,
  event_hour smallint,

  -- ✅ MVP Learning Fields (DECISÃO 3)
  approval_duration_seconds int,  -- NULL se não aplicável
  edited_fields text[],           -- ["headline", "text"]

  source text NOT NULL DEFAULT 'app',
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT campaign_events_type_check CHECK (
    event_type IN ('created','approved','regenerated','published','performed')
  ),
  CONSTRAINT campaign_events_day_check CHECK (
    event_day_of_week IS NULL OR (event_day_of_week BETWEEN 1 AND 7)
  ),
  CONSTRAINT campaign_events_hour_check CHECK (
    event_hour IS NULL OR (event_hour BETWEEN 0 AND 23)
  )
);

CREATE INDEX IF NOT EXISTS idx_campaign_events_store_id
  ON public.campaign_events(store_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign_id
  ON public.campaign_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_type
  ON public.campaign_events(event_type);
CREATE INDEX IF NOT EXISTS idx_campaign_events_created_at
  ON public.campaign_events(created_at);
CREATE✅ weekly_plans intelligence snapshot (DECISÃO 2: Parcial)
Rationale: freeze key intelligence metrics for audit and explainability (não payload completo).

```sql
ALTER TABLE public.weekly_plans
  ADD COLUMN IF NOT EXISTS intelligence_snapshot jsonb DEFAULT '{}'::jsonb;

-- Estrutura recomendada (snapshot PARCIAL):
-- {
--   "intelligence_score": 75,
--   "campaigns_analyzed": 23,
--   "detected_events": ["natal", "black_friday"],
--   "top_objectives": ["promocao", "combo"],
--   "snapshot_at": "2026-04-29T10:00:00Z"
-- }
--
-- Storage: ~800 bytes/plano (400MB para 500K planos/ano)
-- Não incluir: learned_patterns completo (muito pesado)
-- Monitorar com pg_stat_statements

-- ✅ Nota sobre retenção (DECISÃO 5)
-- TTL: 90 dias
-- Cleanup: Cron job semanal (sábado 3AM)
-- DELETE FROM campaign_events WHERE created_at < now() - interval '90 days';
```

## 3) Optional: weekly_plans intelligence snapshot
Rationale: freeze the intelligence used when the plan was generated, for audit and explainability.

```sql
ALTER TABLE public.weekly_plans
  ADD COLUMN IF NOT EXISTS intelligence_snapshot jsonb;
```

## 4) Consolidate schema.sql
Update database/schema.sql to include:
- stores brand_profile fields (migration 023)
- campaigns domain_input fields (migration 024)
- weekly_plan_items target_* fields (migration 018)
- campaign_approved_assets table (migration 021/022)

## 5) Notes on data types
- Keep text for free-form values; use check constraints for enums (already in use).
- Use jsonb for evolving intelligence structures.
- Add typed columns for high-cardinality filters used in dashboards and learning.
