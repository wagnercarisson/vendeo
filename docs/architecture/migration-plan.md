# Migration Plan (Marketing Intelligence)

**Status:** ✅ APROVADO — 29 Abril 2026  
**Timeline:** 7-9 dias  
**Blocker:** Phase 0 (resolver drift) deve ser executado PRIMEIRO

---

## ⚠️ PHASE 0: Resolver Schema Drift (BLOCKER — 30 min)

**Problema:** schema.sql divergiu de migrations (campos desalinhados)

**Ação Imediata:**
```bash
# Executar AGORA, antes de qualquer nova migration
cd supabase
supabase db dump --schema public > ../database/schema.sql

# Commit
git add database/schema.sql
git commit -m "fix: regenerate schema.sql from migrations (resolve drift)"

# Documentar em database/README.md
echo "Migrations são canonical source. schema.sql é derivado." >> ../database/README.md
```

**Responsável:** @dev (Dex)  
**Risk:** Baixo (sincronização de snapshot)  
**Blocker:** SIM — drift cria base inconsistente para novas migrations

---

## Phase 1: Cleanup (Safe)
- Reconcile schema.sql with migrations (023, 024, 018, 021/022)
- Confirm no destructive changes to production data (current data is sample)
Risk: Low
ETA: 1 day

## Phase 2: Additive Changes (Safe)
- Create store_intelligence table
- Create campaign_events table
- Add weekly_plans.intelligence_snapshot (optional)
- Add indexes for campaign_events
Risk: Low
ETA: 1 day

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
