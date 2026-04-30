# Phase 2 Hybrid Breakdown — Data Engineer Briefing

**Data:** 2026-04-30  
**Decisão:** Phase 2 Híbrida (Opção C) — Implementação Incremental  
**Executor:** @data-engineer (Dara)  
**Validado por:** @commerce-strategist, @content-copy, @prompt-eng

---

## 🎯 CONTEXTO DA DECISÃO

**Problema:** Proposta inicial de Phase 2 tinha apenas 7 campos. Squad Marketing identificou **31 campos críticos/importantes** ausentes após revisão.

**Solução:** Dividir Phase 2 em 3 sub-phases incrementais:
- **2.0:** MVP Mínimo (5 campos críticos) — 1 dia
- **2.1:** Expansão (10 campos importantes) — 2 dias (+1 semana)
- **2.2:** Governança + Otimização — 2-3 dias (+2 semanas)

**Benefício:** Deploy rápido + validação iterativa + risco distribuído

---

## 📋 PHASE 2.0: MVP MÍNIMO (PRÓXIMA)

### **Migration 031: `store_intelligence` table (base + 5 campos críticos)**

```sql
CREATE TABLE IF NOT EXISTS public.store_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,

  -- Tier 2 (contexto manual do lojista via onboarding progressivo)
  context jsonb NOT NULL DEFAULT '{
    "schema_version": "2.0"
  }'::jsonb,

  -- Tier 3 (padrões aprendidos passivamente pelo sistema)
  learned_patterns jsonb NOT NULL DEFAULT '{
    "schema_version": "2.0"
  }'::jsonb,

  intelligence_score int NOT NULL DEFAULT 0,
  last_learned timestamptz,
  campaigns_analyzed int NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT store_intelligence_store_unique UNIQUE (store_id),
  
  -- 🔴 CRITICAL: Validação obrigatória de schema_version
  CONSTRAINT context_has_schema_version CHECK (context ? 'schema_version'),
  CONSTRAINT learned_patterns_has_schema_version CHECK (learned_patterns ? 'schema_version')
);

CREATE INDEX IF NOT EXISTS idx_store_intelligence_store_id
  ON public.store_intelligence(store_id);

COMMENT ON TABLE public.store_intelligence IS 'Phase 2.0: Base table with 5 critical fields. Expandido em Phase 2.1 com 10 campos importantes.';
```

### **Estrutura `context` (Phase 2.0 — 5 campos críticos):**

```jsonb
{
  "schema_version": "2.0",  -- OBRIGATÓRIO (validado por constraint)
  
  -- CAMPO 1: Brand Voice (30% do score de conversão)
  "brand_voice": {
    "tone": "amigavel|profissional|irreverente|tradicional",
    "personality_traits": ["confiavel", "acolhedor"],
    "avoid_words": [],  -- Palavras que lojista NÃO quer usar
    "preferred_style": "direto|storytelling|educacional"
  },
  
  -- CAMPO 2: Seasonal Peaks (60% das vendas anuais)
  "seasonal_peaks": ["natal", "black_friday", "dia_dos_pais"],
  
  -- Campos originais (mantidos):
  "best_days": ["sexta", "sabado"],
  "best_hours": ["18-22"],
  "target_audience": "adultos_25_45",
  "main_differentiation": "qualidade_premium",
  "top_products": ["vinhos_tintos", "cervejas_artesanais"],
  "price_positioning": "premium",
  "competitors": ["Loja X"]
}
```

**Nota:** Campos `best_days`, `best_hours` mantidos mas serão DEPRECIADOS em Phase 2.2 (movidos para `learned_patterns`).

---

### **Migration 032: `campaign_events` table (base + 3 campos críticos)**

```sql
CREATE TABLE IF NOT EXISTS public.campaign_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,

  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Campos tipados para analytics (originais)
  event_objective text,
  event_audience text,
  event_price numeric,
  event_day_of_week smallint,
  event_hour smallint,

  -- 🔴 CAMPO 3: Prompt Version (A/B testing base)
  prompt_version text NOT NULL DEFAULT 'v1.0',
  
  -- 🔴 CAMPO 4: Approval Rating (feedback de qualidade)
  approval_rating smallint,  -- 1-5 estrelas, NULL se não aplicável
  
  -- 🔴 CAMPO 5 (parcial): Edit tracking básico
  approval_duration_seconds int,
  edited_fields text[],

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
  ),
  CONSTRAINT campaign_events_rating_check CHECK (
    approval_rating IS NULL OR (approval_rating >= 1 AND approval_rating <= 5)
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

-- 🔴 Index para prompt version tracking (Phase 2.0)
CREATE INDEX IF NOT EXISTS idx_campaign_events_prompt_version
  ON public.campaign_events(prompt_version, approval_rating);

COMMENT ON TABLE public.campaign_events IS 'Phase 2.0: Base table with 3 critical fields. Expandido em Phase 2.1 com weather_context, commercial_result_feedback, edit_tracking estruturado.';
```

---

### **Migration 033: `weekly_plans.intelligence_snapshot`**

```sql
ALTER TABLE public.weekly_plans
  ADD COLUMN IF NOT EXISTS intelligence_snapshot jsonb DEFAULT '{
    "schema_version": "2.0"
  }'::jsonb;

COMMENT ON COLUMN public.weekly_plans.intelligence_snapshot IS 'Phase 2.0: Snapshot parcial da inteligência. Estrutura expandida em Phase 2.1.';
```

**Estrutura snapshot (Phase 2.0 — mínima):**
```jsonb
{
  "schema_version": "2.0",
  "intelligence_score": 75,
  "campaigns_analyzed": 23,
  "snapshot_at": "2026-04-30T10:00:00Z"
}
```

---

## 📋 PHASE 2.1: EXPANSÃO (+10 CAMPOS) — SEMANA 2

### **Migration 034: Expandir `store_intelligence.context`**

```sql
-- Não precisa ALTER TABLE (JSONB é schemaless)
-- Apenas documentar estrutura expandida

COMMENT ON TABLE public.store_intelligence IS 'Phase 2.1: Context expandido com 10 campos importantes (customer_pain_points, conversion_triggers, unique_selling_proposition, etc). Ver docs/schemas/store-intelligence-context-v2.1.json';
```

**Estrutura `context` expandida (Phase 2.1):**

```jsonb
{
  "schema_version": "2.1",  -- Versão atualizada
  
  // Campos Phase 2.0 (mantidos):
  "brand_voice": { /* ... */ },
  "seasonal_peaks": [ /* ... */ ],
  
  // NOVOS CAMPOS Phase 2.1:
  
  "customer_pain_points": [
    "preco_alto_concorrentes",
    "dificuldade_estacionamento"
  ],
  
  "conversion_triggers": {
    "urgency_preference": "alta|moderada|baixa",
    "scarcity_comfortable": true,
    "social_proof_available": ["testemunhos", "anos_tradicao"],
    "guarantee_offered": "satisfacao_garantida|troca_7dias|null"
  },
  
  "successful_past_ctas": [
    {"cta": "Passe aqui 🍷", "approval_speed_seconds": 30, "context": "promocao"}
  ],
  
  "unique_selling_proposition": {
    "primary_usp": "unica_adega_com_vinhos_organicos_bairro",
    "supporting_points": ["certificacao_organica"],
    "proof_elements": ["10_anos_tradicao"]
  },
  
  "average_ticket_brl": 45.50,
  
  "local_events_calendar": ["jogos_do_flamengo", "feira_aos_sabados"],
  
  "segment_specific_context": {
    "adega": {
      "has_delivery": true,
      "delivery_radius_km": 3,
      "focus_products": ["cerveja", "vinho"]
    }
  },
  
  "language_specifics": {
    "uses_regional_slang": true,
    "formality_level": "voce|tu",
    "emoji_comfort": "alto|medio|baixo",
    "max_exclamations_per_copy": 1
  },
  
  "copy_length_preferences": {
    "headline_max_words": 8,
    "body_max_words": 15,
    "prefers_brevity": true
  },
  
  "store_location_context": {
    "neighborhood_type": "residencial|comercial",
    "foot_traffic": "alto|medio|baixo",
    "near_competitors": 3
  }
}
```

---

### **Migration 035: Expandir `campaign_events`**

```sql
ALTER TABLE public.campaign_events ADD COLUMN IF NOT EXISTS
  -- Weather Context (do @commerce-strategist)
  weather_temperature_celsius smallint,
  weather_condition text,  -- 'sunny', 'rainy', 'cold', etc
  
  -- Commercial Result Feedback (fecha o loop)
  commercial_result_feedback jsonb,  -- {"sales_impact": "alto|medio|baixo", "reported_at": "..."}
  
  -- Edit Tracking Estruturado (diff analysis)
  edit_magnitude text,  -- 'none', 'minor', 'major', 'rewrite'
  original_content jsonb,  -- Conteúdo original para diff
  edited_content jsonb,  -- Conteúdo editado
  
  -- Performance Metrics (do @prompt-eng)
  generation_latency_ms int,
  token_count_input int,
  token_count_output int;

-- Constraints:
ALTER TABLE public.campaign_events
  ADD CONSTRAINT events_magnitude_check
    CHECK (edit_magnitude IS NULL OR edit_magnitude IN ('none', 'minor', 'major', 'rewrite'));

-- Indexes adicionais:
CREATE INDEX IF NOT EXISTS idx_campaign_events_weather
  ON public.campaign_events(weather_condition, weather_temperature_celsius);

CREATE INDEX IF NOT EXISTS idx_campaign_events_quality
  ON public.campaign_events(approval_rating, edit_magnitude);

COMMENT ON TABLE public.campaign_events IS 'Phase 2.1: Expandido com weather_context, commercial_result_feedback, edit_tracking estruturado, performance metrics.';
```

---

## 📋 PHASE 2.2: GOVERNANÇA + OTIMIZAÇÃO — SEMANA 3-4

### **Migration 036: JSON Schema Validation Triggers**

```sql
-- Função de validação de schema
CREATE OR REPLACE FUNCTION validate_intelligence_schema()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar schema_version obrigatório
  IF NOT (NEW.context ? 'schema_version') THEN
    RAISE EXCEPTION 'context must contain schema_version';
  END IF;
  
  -- Validar brand_voice obrigatório (Phase 2.0+)
  IF NOT (NEW.context ? 'brand_voice') THEN
    RAISE WARNING 'context should contain brand_voice for optimal prompt quality';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger BEFORE INSERT/UPDATE
CREATE TRIGGER validate_intelligence_before_insert
  BEFORE INSERT OR UPDATE ON store_intelligence
  FOR EACH ROW EXECUTE FUNCTION validate_intelligence_schema();

COMMENT ON FUNCTION validate_intelligence_schema IS 'Phase 2.2: Validação de schema obrigatório para store_intelligence.context';
```

---

### **Migration 037: Agregação Mensal (TTL Strategy — 2 camadas)**

```sql
-- Tabela agregada mensal (retenção 24 meses)
CREATE TABLE IF NOT EXISTS public.campaign_events_aggregated_monthly (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregation_month date NOT NULL,  -- Primeiro dia do mês
  
  -- Dimensões
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  segment text NOT NULL,
  event_objective text,
  prompt_version text NOT NULL,
  
  -- Métricas Agregadas
  total_campaigns int NOT NULL DEFAULT 0,
  total_approved int NOT NULL DEFAULT 0,
  
  avg_approval_duration_seconds numeric(8,2),
  avg_approval_rating numeric(3,2),
  avg_generation_latency_ms numeric(8,2),
  
  heavy_edit_rate numeric(4,3),  -- % de major/rewrite edits
  instant_approval_rate numeric(4,3),  -- % aprovado <60s sem edit
  
  created_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT monthly_aggregation_unique UNIQUE (aggregation_month, store_id, segment, event_objective, prompt_version)
);

-- Indexes:
CREATE INDEX IF NOT EXISTS idx_monthly_aggregation_month
  ON public.campaign_events_aggregated_monthly(aggregation_month);

CREATE INDEX IF NOT EXISTS idx_monthly_aggregation_store
  ON public.campaign_events_aggregated_monthly(store_id, aggregation_month);

COMMENT ON TABLE public.campaign_events_aggregated_monthly IS 'Phase 2.2: Agregação mensal de campaign_events (retenção 24 meses). Alimentado por cronjob mensal ANTES de cleanup de 90 dias.';
```

**Cronjob mensal (agregação + cleanup):**
```sql
-- Função de agregação mensal
CREATE OR REPLACE FUNCTION aggregate_campaign_events_monthly()
RETURNS void AS $$
BEGIN
  -- Agregar mês anterior
  INSERT INTO campaign_events_aggregated_monthly (
    aggregation_month, store_id, segment, event_objective, prompt_version,
    total_campaigns, total_approved, avg_approval_duration_seconds, avg_approval_rating, 
    avg_generation_latency_ms, heavy_edit_rate, instant_approval_rate
  )
  SELECT 
    DATE_TRUNC('month', created_at) as aggregation_month,
    store_id,
    'adegas' as segment,  -- TODO: Derivar de stores table
    event_objective,
    prompt_version,
    COUNT(*) as total_campaigns,
    SUM(CASE WHEN event_type = 'approved' THEN 1 ELSE 0 END) as total_approved,
    AVG(approval_duration_seconds) as avg_approval_duration_seconds,
    AVG(approval_rating) as avg_approval_rating,
    AVG(generation_latency_ms) as avg_generation_latency_ms,
    AVG(CASE WHEN edit_magnitude IN ('major', 'rewrite') THEN 1 ELSE 0 END) as heavy_edit_rate,
    AVG(CASE WHEN approval_duration_seconds < 60 AND edit_magnitude = 'none' THEN 1 ELSE 0 END) as instant_approval_rate
  FROM campaign_events
  WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
  GROUP BY aggregation_month, store_id, event_objective, prompt_version
  ON CONFLICT (aggregation_month, store_id, segment, event_objective, prompt_version) DO UPDATE
    SET total_campaigns = EXCLUDED.total_campaigns,
        total_approved = EXCLUDED.total_approved,
        avg_approval_duration_seconds = EXCLUDED.avg_approval_duration_seconds,
        avg_approval_rating = EXCLUDED.avg_approval_rating,
        avg_generation_latency_ms = EXCLUDED.avg_generation_latency_ms,
        heavy_edit_rate = EXCLUDED.heavy_edit_rate,
        instant_approval_rate = EXCLUDED.instant_approval_rate;
  
  -- Cleanup eventos > 90 dias (APÓS agregação)
  DELETE FROM campaign_events
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION aggregate_campaign_events_monthly IS 'Phase 2.2: Agregação mensal + cleanup 90 dias. Rodar via cron: primeiro sábado de cada mês, 3AM.';
```

---

### **Migration 038: Indexes Otimizados para ML**

```sql
-- Index 1: A/B testing de prompts
CREATE INDEX IF NOT EXISTS idx_events_ab_testing
  ON campaign_events(prompt_version, event_objective, approval_rating, created_at)
  WHERE event_type = 'approved';

-- Index 2: Weather-based analysis
CREATE INDEX IF NOT EXISTS idx_events_weather_analysis
  ON campaign_events(weather_condition, weather_temperature_celsius, event_objective)
  WHERE weather_condition IS NOT NULL;

-- Index 3: Quality analysis (low approval = problema)
CREATE INDEX IF NOT EXISTS idx_events_low_quality
  ON campaign_events(approval_rating, edit_magnitude, prompt_version)
  WHERE approval_rating < 3 OR edit_magnitude IN ('major', 'rewrite');

-- Partial Index: High-quality campaigns (para few-shot examples)
CREATE INDEX IF NOT EXISTS idx_events_high_quality_few_shot
  ON campaign_events(store_id, event_objective, original_content)
  WHERE approval_rating >= 4 AND edit_magnitude IN ('none', 'minor');

COMMENT ON INDEX idx_events_ab_testing IS 'Phase 2.2: Otimizado para queries de A/B testing de prompt versions';
COMMENT ON INDEX idx_events_high_quality_few_shot IS 'Phase 2.2: Few-shot examples (campanhas de alta qualidade)';
```

---

### **Migration 039 (OPCIONAL): Materialized View para Analytics**

```sql
-- View agregada diária (refresh noturno)
CREATE MATERIALIZED VIEW IF NOT EXISTS campaign_events_daily_stats AS
SELECT 
  DATE(created_at) as event_date,
  store_id,
  event_objective,
  prompt_version,
  COUNT(*) as total_campaigns,
  AVG(approval_duration_seconds) as avg_approval_time,
  AVG(approval_rating) as avg_rating,
  AVG(generation_latency_ms) as avg_latency,
  SUM(CASE WHEN edit_magnitude IN ('major', 'rewrite') THEN 1 ELSE 0 END) as heavy_edits
FROM campaign_events
WHERE event_type = 'created'
GROUP BY event_date, store_id, event_objective, prompt_version;

-- Index na view:
CREATE INDEX IF NOT EXISTS idx_daily_stats_date 
  ON campaign_events_daily_stats(event_date);

COMMENT ON MATERIALIZED VIEW campaign_events_daily_stats IS 'Phase 2.2: Analytics diário (refresh automático via cron). OPCIONAL — implementar se dashboard de analytics for criado.';
```

---

## 📚 DOCUMENTAÇÃO A CRIAR (Phase 2.2)

### **1. JSON Schema Canonical**

**Criar arquivos:**
- `docs/schemas/store-intelligence-context-v2.0.json` (Phase 2.0)
- `docs/schemas/store-intelligence-context-v2.1.json` (Phase 2.1)
- `docs/schemas/store-intelligence-learned-patterns-v2.0.json`
- `docs/schemas/campaign-events-v2.0.json`

**Exemplo: `store-intelligence-context-v2.1.json`**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Store Intelligence Context",
  "type": "object",
  "required": ["schema_version", "brand_voice", "seasonal_peaks"],
  "properties": {
    "schema_version": {
      "type": "string",
      "const": "2.1"
    },
    "brand_voice": {
      "type": "object",
      "required": ["tone", "personality_traits"],
      "properties": {
        "tone": {
          "type": "string",
          "enum": ["amigavel", "profissional", "irreverente", "tradicional"]
        },
        "personality_traits": {
          "type": "array",
          "items": {"type": "string"}
        }
      }
    },
    "seasonal_peaks": {
      "type": "array",
      "items": {"type": "string"},
      "minItems": 1
    }
  }
}
```

---

### **2. Migration de Schemas (Função utilitária)**

```sql
-- Função para migrar v2.0 → v2.1
CREATE OR REPLACE FUNCTION migrate_store_intelligence_v2_0_to_v2_1()
RETURNS void AS $$
BEGIN
  UPDATE store_intelligence
  SET context = context || jsonb_build_object(
    'schema_version', '2.1',
    'customer_pain_points', ARRAY[]::text[],
    'conversion_triggers', jsonb_build_object(
      'urgency_preference', 'moderada',
      'scarcity_comfortable', true
    ),
    'average_ticket_brl', 50.00  -- Default estimado
  )
  WHERE context->>'schema_version' = '2.0';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION migrate_store_intelligence_v2_0_to_v2_1 IS 'Phase 2.2: Migrar schemas v2.0 → v2.1 (adicionar campos Phase 2.1)';
```

---

## 🚀 EXECUÇÃO (Timeline)

### **Semana 1 (Atual)**
- [ ] @data-engineer revisa este documento
- [ ] @data-engineer valida estrutura de Phase 2.0 (3 migrations)
- [ ] @data-engineer implementa Migration 031, 032, 033
- [ ] @data-engineer testa localmente (`supabase db reset` + migrations up)
- [ ] @devops push para remoto

### **Semana 2 (+1 semana)**
- [ ] @ux-design-expert implementa modais progressivos (onboarding)
- [ ] @data-engineer implementa Migration 034, 035
- [ ] Validação com Squad Marketing (campos corretos?)
- [ ] @devops push para remoto

### **Semana 3-4 (+2 semanas)**
- [ ] @data-engineer implementa Migration 036, 037, 038
- [ ] @data-engineer cria JSON Schema docs
- [ ] @prompt-eng testa queries de ML
- [ ] (Opcional) Migration 039 se dashboard for criado
- [ ] @devops push para remoto

---

## ✅ CHECKLIST DE VALIDAÇÃO (Preenchido por @data-engineer — 2026-04-30)

### **Antes de Implementar Phase 2.0:**

- [x] **Estrutura de `store_intelligence.context` (5 campos críticos) está clara?**
  > ✅ Sim. Os 5 campos estão bem definidos. `brand_voice` e `seasonal_peaks` são os mais impactantes. Estrutura legível e suficiente para Phase 2.0.

- [⚠️] **Constraint `context_has_schema_version` faz sentido?**
  > ⚠️ **PROBLEMA:** O operador `?` (key exists) aceita `{"schema_version": null}` como válido. Corrigir para:
  > ```sql
  > CONSTRAINT context_has_schema_version CHECK (
  >   (context ->> 'schema_version') IS NOT NULL AND
  >   (context ->> 'schema_version') <> ''
  > )
  > ```
  > O mesmo se aplica a `learned_patterns_has_schema_version`.

- [x] **Estrutura de `campaign_events` (3 campos críticos) está clara?**
  > ✅ Sim. `prompt_version`, `approval_rating`, `approval_duration_seconds`/`edited_fields` são a base correta para A/B testing e tracking de edições.

- [⚠️] **Indexes de Phase 2.0 são suficientes para queries básicas?**
  > ❌ **PROBLEMA CRÍTICO:** `idx_store_intelligence_store_id` é **index redundante** — a constraint `UNIQUE (store_id)` já cria um index B-tree em `store_id` automaticamente. Remover este index para evitar overhead duplo de escrita.
  >
  > ⚠️ **Lacuna:** `idx_campaign_events_created_at` sem `store_id` será ineficiente em produção. Adicionar index composto:
  > ```sql
  > CREATE INDEX IF NOT EXISTS idx_campaign_events_store_created
  >   ON public.campaign_events(store_id, created_at DESC);
  > ```
  > E remover o `idx_campaign_events_created_at` simples (ou mantê-lo apenas para admin queries).

- [⚠️] **Migrations têm guardas de idempotência (`IF NOT EXISTS`)?**
  > ✅ Tabelas e indexes: `IF NOT EXISTS` presente.
  > ❌ `ADD COLUMN IF NOT EXISTS` para Migration 033: presente ✅.
  > ⚠️ Triggers em Phase 2.2 (`CREATE TRIGGER`) não suportam `IF NOT EXISTS` no PostgreSQL — precisam de `DROP TRIGGER IF EXISTS ... ; CREATE TRIGGER ...` (ver notas Phase 2.2 abaixo).

- [❌] **Migrations têm `BEGIN/COMMIT` (transações)?**
  > ❌ **BLOQUEADOR CRÍTICO:** Migrations 031, 032, 033 **não têm `BEGIN/COMMIT`**. Padrão do projeto (migrations 029, 030) exige wrapping transacional. Todas as 3 precisam de `BEGIN;` no topo e `COMMIT;` no fim. Sem isso, falha parcial deixa schema corrompido sem rollback automático.

---

### **Dúvidas/Sugestões:**

- [x] **Campos de Phase 2.0 são realmente os mínimos necessários?**
  > ✅ Sim, a seleção está correta. Os 5 campos cobrem: voz da marca (conversão), sazonalidade (timing), e A/B de prompts + feedback de qualidade. Mínimo viável bem definido.

- [⚠️] **Estrutura JSONB precisa de ajustes?**
  > Três pontos de atenção:
  > 1. **`best_days`/`best_hours` em `context`:** Documentado como "será depreciado em Phase 2.2". Recomendo marcar com prefixo `_deprecated_best_days` já em Phase 2.0 para evitar acoplamento de código novo nesses campos.
  > 2. **`brand_voice.tone` enum via JSONB:** Não é validado no banco (apenas documentação). O trigger de Phase 2.2 corrige isso, mas até lá o backend precisa validar no nível da aplicação.
  > 3. **`intelligence_snapshot` de Phase 2.0 é mínimo demais:** O campo `intelligence_score` em `weekly_plans` sem o contexto associado de `store_id` no snapshot dificulta debug futuro. Sugestão: incluir `store_id` no snapshot JSON.

- [⚠️] **Faltam constraints de validação?**
  > Sim, 4 lacunas identificadas:
  > 1. **`intelligence_score` sem range:** Adicionar `CHECK (intelligence_score BETWEEN 0 AND 100)` na Migration 031.
  > 2. **`campaigns_analyzed` pode ser negativo:** Adicionar `CHECK (campaigns_analyzed >= 0)`.
  > 3. **`approval_duration_seconds` pode ser negativo:** Adicionar `CHECK (approval_duration_seconds IS NULL OR approval_duration_seconds >= 0)`.
  > 4. **`source` sem constraint:** Adicionar `CHECK (source IN ('app', 'api', 'webhook', 'cron'))` para controle de origens.

- [⚠️] **Indexes estão corretos para os casos de uso?**
  > Além do problema de redundância já citado:
  > - `idx_campaign_events_prompt_version(prompt_version, approval_rating)` sem `WHERE` clause é excessivamente amplo. Sugestão: filtrar para eventos relevantes:
  >   ```sql
  >   CREATE INDEX IF NOT EXISTS idx_campaign_events_prompt_version
  >     ON public.campaign_events(prompt_version, approval_rating)
  >     WHERE event_type IN ('approved', 'regenerated');
  >   ```
  > - O index em `event_type` simples tem cardinalidade baixa (apenas 5 valores distintos) — PostgreSQL raramente o usará. Transformar em index composto: `(event_type, store_id)`.

- [x] **Timeline (1 dia Phase 2.0) é realista?**
  > ✅ **Sim, com as correções acima aplicadas.** Estimativa revisada:
  > - Corrigir DDL (fixes identificados neste checklist): ~1-2h
  > - Implementar migrations 031, 032, 033 com `BEGIN/COMMIT` + RLS: ~2-3h
  > - Teste local (`supabase db reset` + migrations + queries de validação): ~1-2h
  > - **Total estimado: 4-7h → 1 dia útil é viável.**

---

### **🔴 BLOQUEADORES — Obrigatório antes de implementar Phase 2.0:**

1. **Adicionar `BEGIN/COMMIT` em 031, 032, 033**
2. **Criar Migration 031b (ou incluir em 031): RLS policies para `store_intelligence`**
   ```sql
   ALTER TABLE public.store_intelligence ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "store_intelligence_owner_policy"
     ON public.store_intelligence
     USING (EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND owner_user_id = auth.uid()))
     WITH CHECK (EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND owner_user_id = auth.uid()));
   ```
3. **Criar RLS policies para `campaign_events`** — mesma pattern, via `store_id → stores.owner_user_id`.
4. **Remover `idx_store_intelligence_store_id`** (index redundante com UNIQUE constraint).
5. **Corrigir constraints `context_has_schema_version`** e `learned_patterns_has_schema_version` (null check).
6. **Adicionar `updated_at` trigger para `store_intelligence`** — a coluna existe mas sem trigger ela nunca é atualizada automaticamente:
   ```sql
   CREATE TRIGGER set_store_intelligence_updated_at
     BEFORE UPDATE ON store_intelligence
     FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
   ```
   (Verificar se a extensão `moddatetime` está disponível; se não, usar trigger custom seguindo o padrão do projeto.)

---

### **⚠️ NOTAS PARA PHASE 2.1 (Semana 2):**

- **Migration 035 — Multiple `ADD COLUMN IF NOT EXISTS`:** A sintaxe `ALTER TABLE ... ADD COLUMN IF NOT EXISTS col1 type, ADD COLUMN IF NOT EXISTS col2 type` requer PostgreSQL 14+. Confirmar versão do Supabase. Se < 14, cada coluna precisa de statement separado.
- **`commercial_result_feedback` JSONB:** Sem constraint de estrutura mínima. O trigger de Phase 2.2 deveria validar este campo também.
- **`weather_condition text` sem constraint:** Adicionar `CHECK (weather_condition IN ('sunny', 'cloudy', 'rainy', 'cold', 'hot', 'stormy'))` para evitar dados inconsistentes para ML.
- **`edit_magnitude` + `original_content`/`edited_content`:** Dados sensíveis. Garantir que RLS de `campaign_events` também protege esses campos de leitura cruzada entre lojas.

---

### **⚠️ NOTAS PARA PHASE 2.2 (Semanas 3-4):**

- **Trigger idempotência:** `CREATE TRIGGER` não tem `IF NOT EXISTS`. Usar:
  ```sql
  DROP TRIGGER IF EXISTS validate_intelligence_before_insert ON store_intelligence;
  CREATE TRIGGER validate_intelligence_before_insert ...
  ```
- **`aggregate_campaign_events_monthly()` — segmento hardcoded:** O `'adegas' as segment` hardcoded é um TODO confirmado. Antes de colocar em produção, resolver com JOIN em `stores.main_segment`.
- **Ordem de operações no cronjob:** A função atual faz DELETE **dentro da mesma transação** que o INSERT de agregação. Risco: se o INSERT falhar por conflito único, o DELETE já pode ter executado (dependendo de onde a exceção ocorre). Recomendo separar em duas transactions:
  ```sql
  -- Transaction 1: Agregação (idempotente via ON CONFLICT)
  -- Transaction 2: DELETE após confirmar agregação bem-sucedida
  ```
- **Materialized View (Migration 039):** O index `idx_daily_stats_date(event_date)` é insuficiente — adicionar `idx_daily_stats_store_date(store_id, event_date)`. Analytics de dashboard sempre filtram por store.
- **`migrate_store_intelligence_v2_0_to_v2_1()`:** O valor `'average_ticket_brl': 50.00` hardcoded como default é problemático para dados de produção. Usar `NULL` e deixar o onboarding progressivo preencher.

---

## 📞 PRÓXIMOS PASSOS

1. **@data-engineer (Dara)** revisa este documento
2. **@data-engineer** valida estrutura e dá feedback
3. **@aiox-master** incorpora feedback e aprova versão final
4. **@data-engineer** implementa Phase 2.0 (3 migrations)
5. **Squad Marketing** valida Phase 2.0 em produção
6. **Repeat para Phase 2.1 e 2.2**

---

**Aguardando validação de @data-engineer antes de prosseguir.** 🎯
