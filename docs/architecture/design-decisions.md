# Design Decisions (Marketing Intelligence)

**Status:** ✅ APROVADO — 29 Abril 2026  
**Última Atualização:** 30 Abril 2026 — Decisão Phase 2 Híbrida  
**Decisões finais documentadas abaixo**

---

## 🎯 DECISÃO CRÍTICA: Phase 2 Híbrida (30 Abril 2026)

**Contexto:** Squad Marketing (@commerce-strategist, @content-copy, @prompt-eng) revisou campos propostos e identificou 31 campos críticos/importantes ausentes.

**Decisão:** Implementar Phase 2 em 3 sub-phases incrementais (Opção C)

**Rationale:**
- Deploy rápido (Phase 2.0 em 1 dia) vs esperar implementação completa (4 dias)
- Validação iterativa com Squad Marketing (cada phase validada antes da próxima)
- Risco distribuído (falha em 2.1 não bloqueia 2.0)
- Onboarding progressivo via modais (não questionário único de 10 min)

**Fases:**
- **Phase 2.0 (1 dia):** 5 campos críticos mínimos (brand_voice, seasonal_peaks, prompt_version, approval_rating, schema_version)
- **Phase 2.1 (+1 semana):** 10 campos importantes (customer_pain_points, conversion_triggers, weather_context, commercial_result_feedback, etc)
- **Phase 2.2 (+2 semanas):** Governança JSONB + agregações mensais + indexes ML

**Aprovado por:** Product Owner (Wagner)  
**Executado por:** @data-engineer (Dara)  
**Documento de referência:** `docs/architecture/intelligence-fields-consolidation.md`

---

## 🎯 DECISÕES FINAIS (Aprovadas 29 Abril 2026)

### DECISÃO 1: Schema Drift
**Escolha:** Migrations são canonical source  
**Ação:** Regenerar `schema.sql` via `supabase db dump --schema public`  
**Quando:** AGORA (blocker para novas migrations)  
**Rationale:** Migrations versionadas e sequenciais; schema.sql é snapshot derivado. Evita drift silencioso.

### DECISÃO 2: intelligence_snapshot em weekly_plans
**Escolha:** Snapshot parcial (Cenário C)  
**Campos:** intelligence_score, campaigns_analyzed, detected_events, top_objectives, snapshot_at  
**Storage:** ~800 bytes/plano (400MB para 500K planos/ano)  
**Rationale:** Auditabilidade suficiente com baixo custo; evita payloads grandes.

### DECISÃO 3: Learning Fields MVP
**Incluir no MVP:**
- `approval_duration_seconds` (int)
- `edited_fields` (text[])

**Adiar para depois:**
- `generation_latency_ms` (otimização futura)
- `selected_variation_index` (quando A/B existir)

**Rationale:** Métricas críticas para qualidade da IA; custo baixo (~50-60 bytes/evento); histórico impossível recuperar depois.

### DECISÃO 4: JSONB Indexes
**Escolha:** Sem índices inicialmente  
**Threshold para adicionar:** Queries >500ms OU >10K lojas  
**Monitoring:** Ativar pg_stat_statements  
**Rationale:** Padrões de query desconhecidos; 50MB JSONB é pequeno para Postgres; adicionar sob demanda.

### DECISÃO 5: Retenção de Dados (campaign_events)
**Escolha:** TTL 90 dias  
**Cleanup:** Cron job semanal (sábado 3AM)  
**Archive:** Fase 2 quando >10K lojas ou >1M eventos/mês (S3)  
**Particionamento:** Depois, quando >10M eventos  
**Rationale:** 90 dias cobre ciclos sazonais; aprendizado consolidado fica em store_intelligence.

---

## 📚 ANÁLISE DETALHADA (Contexto das Decisões)

## 1) JSONB vs Columns for Tier 3
Option A: JSONB only
- Pros: flexible, easy to evolve, low migration cost
- Cons: harder to query, less type safety, slower aggregations

Option B: Fully columnized
- Pros: strong type safety, fast queries
- Cons: rigid, frequent migrations, higher schema churn

Recommendation: Hybrid
- Keep learned_patterns in jsonb for evolution
- Add typed columns in event table for key dimensions used in analytics (objective, audience, price, day, hour)
- Add selective indexes for common filters

Rationale: balances flexibility with query performance and keeps base schema lean.

## 2) store_intelligence table vs columns in stores
Option A: Separate table (store_intelligence)
- Pros: keeps stores lean, isolates experimental features, easy to evolve
- Cons: extra join

Option B: Add columns to stores
- Pros: no extra join, simpler queries
- Cons: bloated base table, risk of overfitting early

Recommendation: Separate table
- Use 1:1 store_intelligence linked by store_id
- Enables gradual rollout of intelligence features by plan tier

## 3) Campaign events capture: app-level vs DB triggers
Option A: App-level tracking
- Pros: flexible payloads, easy to debug, versioned in code
- Cons: risk of missed events if app path not hit

Option B: DB triggers
- Pros: guaranteed capture for state changes
- Cons: harder to debug, logic hidden in DB

Recommendation: App-level with optional DB triggers later
- Start with application-level logging for created/approved/regenerated
- If data gaps appear, add small DB triggers only for critical events (approved)

## 4) Intelligence fields for future-proofing
Recommended additions in event_data or learned_patterns:
- campaign_type, content_type
- visual_context, visual_signature_id
- selected_variation_index
- generation_latency_ms
- regeneration_count
- approval_duration_seconds
- edited_fields (array)

Rationale: supports future models without forcing new migrations.
