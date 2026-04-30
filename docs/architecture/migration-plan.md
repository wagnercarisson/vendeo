# Migration Plan (Marketing Intelligence)

**Status:** ✅ APROVADO — 29 Abril 2026  
**Timeline:** 7-9 dias  
**Blocker:** Phase 0 (resolver drift) deve ser executado PRIMEIRO

---

## ✅ PHASE 0: Resolver Schema Drift (CONCLUÍDA — 29/04/2026)

**Problema:** Migrations 017-030 foram PERDIDAS em merges malfeitos. Schema remoto tinha 15 tabelas, mas migrations paravam na 016.

**Ação Executada:**
```bash
# @data-engineer (Dara) reconstituiu migrations perdidas
# a partir de schema-29-04-2026.sql (dump remoto)

# Migrations criadas: 017-030 (14 migrations)
# Todas com guardas de idempotência (IF NOT EXISTS)
# Dependências respeitadas, RLS policies implementadas
```

**Resultado:**
✅ Migrations 002-030 completas e sequenciais  
✅ Schema local (schema.sql) alinhado com remoto  
✅ Migrations são canonical source restaurado  
✅ Base sólida para Phase 2  

**Responsável:** @data-engineer (Dara)  
**Risk:** Baixo (DDL reverso de schema em produção)  
**Status:** ✅ CONCLUÍDA  
**Decisão:** DEC-2026-04-29-003  
**Data:** 2026-04-29T17:30:00Z

---

## ✅ PHASE 1: Cleanup (CONCLUÍDA — 29/04/2026)

**Problema:** schema.sql divergiu de migrations após 018, 021-024. Migrations são canonical source mas schema estava desatualizado.

**Ação Executada:**
```bash
# Regenerar schema.sql via dump do database remoto
supabase db dump --schema public > database/schema.sql
```

**Resultado:**
✅ schema.sql reconciliado com migrations 002-030  
✅ +2126 linhas, -148 linhas (reconciliação massiva)  
✅ database/README.md atualizado com timestamp  
✅ Zero mudanças destrutivas (data é sample)

**Responsável:** @data-engineer (Dara)  
**Risk:** Baixo (regeneração de snapshot derivado)  
**Status:** ✅ CONCLUÍDA  
**Commit:** ecd4987  
**Timestamp:** 2026-04-29 15:54:50

**Nota:** Phase 1 foi executada em conjunto com Phase 0 no mesmo dia. O commit referenciou "PHASE 0" mas a ação corresponde exatamente ao escopo de Phase 1.

---

## Phase 2: Additive Changes — ABORDAGEM HÍBRIDA (Safe)

**Decisão:** 2026-04-30 — Opção C (Phase 2 Híbrida - Implementação Incremental)  
**Rationale:** Deploy rápido + evolução controlada + validação iterativa com Squad Marketing  
**Validação:** Campos revisados por @commerce-strategist, @content-copy, @prompt-eng

### **Phase 2.0: MVP Mínimo** — ✅ CONCLUÍDA (30/04/2026)

Criar tabelas base + 5 campos críticos essenciais

**Migrations Deployadas:**
- ✅ 031: `store_intelligence` table (context + learned_patterns JSONB, 4 RLS policies, 2 indexes, trigger)
- ✅ 032: `campaign_events` table (A/B testing + passive learning, 6 indexes, 4 RLS policies)
- ✅ 033: `weekly_plans.intelligence_snapshot` (audit trail JSONB)

**5 Campos Críticos Deployados (Phase 2.0):**
1. ✅ `brand_voice` (tone, personality_traits, brand_adjectives) — TONE MATCH (30% do score)
2. ✅ `seasonal_peaks` (dates array) — Sazonalidade (60% vendas anuais)
3. ✅ `prompt_version` — Tracking de prompts (A/B testing base)
4. ✅ `approval_rating` (1-5 estrelas) — Feedback de qualidade
5. ✅ `schema_version` — Governança JSONB (migração futura)

**Validação:**
- 11/11 queries validadas com sucesso (RLS, constraints, indexes, triggers)
- 15 correções de schema implementadas (13 obrigatórias + 2 opcionais)
- Squad Marketing validou todos os campos (@commerce-strategist, @content-copy, @prompt-eng)
- Zero downtime deployment (migrations idempotentes)

**Timeline (Atualizado — Abordagem Híbrida)**
- Phase 0: ✅ Concluída (29/04/2026)
- Phase 1: ✅ Concluída (29/04/2026)
- Phase 2.0: ✅ Concluída (30/04/2026) — 1 dia
- Phase 2.1: 2 dias (+1 semana — Campos Importantes)
- Phase 2.2: 2-3 dias (+2 semanas — Governança)
- Phase 3: 2 dias (Backfill — após 2.2)
- Phase 4: 3-5 dias (Code Updates — após 2.2)
Total Phase 2 (Híbrida): 5-6 dias ao longo de 3 semanas
Total Phase 0-4: 12-16 dias distribuído

**Responsável:** @data-engineer (Dara)  
**Risk:** Baixo  
**Status:** ✅ DEPLOYED  
**Decisão:** DEC-2026-04-30-002  
**Deployment:** 2026-04-30

---

### **Phase 2.1: Campos Importantes (+10 campos)** — SEMANA 2

Expandir contexto comercial + aprendizado

**Migrations:**
- 034: Adicionar 10 campos em `store_intelligence.context`
- 035: Adicionar 5 campos em `campaign_events`

**10 Campos Importantes (Phase 2.1):**
- `customer_pain_points` — Superar objeções
- `conversion_triggers` (urgency_preference, scarcity_comfortable) — Calibrar urgência
- `successful_past_ctas` — Aprender CTAs que funcionam
- `unique_selling_proposition` — USP estruturado
- `average_ticket_brl` — Estratégia combo vs produto único
- `local_events_calendar` — Eventos locais (jogos, feiras)
- `segment_specific_context` — Diferenciais por segmento
- `weather_context` (em campaign_events) — Temperatura + condição
- `commercial_result_feedback` (em campaign_events) — Campanha vendeu?
- `edit_tracking` estruturado (original vs edited) — Diff analysis

**Onboarding:** Modais contextuais continuam coletando dados progressivamente

**Risk:** Baixo-Médio (mais campos, mais complexidade)  
**ETA:** 2 dias (1 dia migrations + 1 dia validação)

---

### **Phase 2.2: Governança + Otimização** — SEMANA 3-4

Estrutura de longo prazo + analytics

**Migrations:**
- 036: JSON Schema validation triggers
- 037: `campaign_events_aggregated_monthly` table (retenção 24 meses)
- 038: Indexes otimizados para ML queries
- 039: Materialized view para analytics (opcional)

**Componentes (Phase 2.2):**
- Database triggers para validação de schema
- Função de migração de schemas (v1.0 → v2.0)
- Agregação mensal (TTL strategy 2 camadas: 90d hot + 24m warm)
- Indexes para A/B testing, weather analysis, quality analysis
- Documentação: `docs/schemas/store-intelligence-context-v2.0.json`

**Risk:** Médio (triggers + agregações)  
**ETA:** 2-3 dias

---

**Timeline Total Phase 2 (Híbrida):**
- Phase 2.0: 1 dia (imediato)
- Phase 2.1: 2 dias (+1 semana)
- Phase 2.2: 2-3 dias (+2 semanas)
- **Total:** 5-6 dias ao longo de 3 semanas

## Phase 3: Restructure / Backfill (Medium)
- Backfill store_intelligence.context with existing store fields (if desired)
- Optional: backfill campaign_events from existing tables (campaigns, campaign_approved_assets, generation_feedback)
Risk: Medium (data correctness)
ETA: 2 days

## Phase 4: Code Updates (High Impact)
- Add application-level logging for campaign_events
- Update weekly plan generation to read store_intelligence + intelligence_snapshot
- Update TypeScript types + Zod schemas
Risk: High (touches domain and API)
ETA: 3-5 days

## Timeline Estimate
- Phase 1: 1 day
- Phase 2: 1 day
- Phase 3: 2 days
- Phase 4: 3-5 days
Total: 7-9 days

## Risk Notes
- Event logging needs consistent server-side entry points to avoid gaps
- Weekly plan generation should be deterministic with clear fallbacks
- JSONB structures must have version fields if used in prompts
