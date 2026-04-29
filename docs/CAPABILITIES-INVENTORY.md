# Vendeo Capabilities Inventory

Last updated: 2026-04-29
Scope: current codebase + architecture plans

Legend:
- Status: Implemented | Planned | Gap | Refactor
- Criticality: 🔴 CRITICA | 🟡 MEDIA | 🟢 BAIXA
- Flows: F1 Manual Campaign, F2 Content Generation, F3 Weekly Plan -> Campaigns, F4 Product vs Image Validation, F5 Approval/Status

---

## Bounded Context: Identity and Access

### Capacidades Implementadas
| Path | Descricao | Status | Usado em (Fluxo) | Criticidade |
|------|-----------|--------|------------------|-------------|
| [app/dashboard/layout.tsx](app/dashboard/layout.tsx) + [lib/domain/stores/queries.ts](lib/domain/stores/queries.ts) | Auth guard + store lookup for dashboard access | Implemented | F1, F2, F3, F5 | 🔴 CRITICA |
| [lib/store/getUserStoreId.ts](lib/store/getUserStoreId.ts) + [app/api/generate/weekly-plan/route.ts](app/api/generate/weekly-plan/route.ts) | Server-side ownership validation for API routes | Implemented | F1, F2, F3, F5 | 🔴 CRITICA |
| [database/migrations/002_rls_owner_based.sql](database/migrations/002_rls_owner_based.sql) | Owner-based RLS baseline | Implemented | F1, F2, F3, F5 | 🔴 CRITICA |

### Capacidades Planejadas
| Capacidade | Descricao | Fonte (doc) | Blocker | Prioridade |
|------------|-----------|-------------|---------|------------|
| None | - | - | - | - |

### Refatoracoes Previstas
| Alvo | Tipo | Descricao | Fonte | Risk |
|------|------|-----------|-------|------|
| None | - | - | - | - |

### Gaps Identificados
| Gap | Impacto | Fonte |
|-----|---------|-------|
| None | - | - |

---

## Bounded Context: Store Profile

### Capacidades Implementadas
| Path | Descricao | Status | Usado em (Fluxo) | Criticidade |
|------|-----------|--------|------------------|-------------|
| [app/api/onboarding/store/route.ts](app/api/onboarding/store/route.ts) | Onboarding store creation (owner-based) | Implemented | F1, F2 | 🔴 CRITICA |
| [app/dashboard/store/page.tsx](app/dashboard/store/page.tsx) + [lib/domain/stores/actions.ts](lib/domain/stores/actions.ts) | Store profile edit UI + save action | Implemented | F1, F2, F3 | 🔴 CRITICA |
| [lib/domain/stores/queries.ts](lib/domain/stores/queries.ts) + [lib/domain/stores/mapper.ts](lib/domain/stores/mapper.ts) | Store context fetch + mapping for AI and UI | Implemented | F1, F2, F3 | 🔴 CRITICA |
| [lib/supabase/storage-actions.ts](lib/supabase/storage-actions.ts) + [lib/supabase/storage-server.ts](lib/supabase/storage-server.ts) | Signed URL access for logos and images | Implemented | F1, F3, F5 | 🟡 MEDIA |
| [database/schema.sql](database/schema.sql) | stores table and brand fields (brand_positioning, tone_of_voice, colors) | Implemented | F1, F2, F3 | 🔴 CRITICA |

### Capacidades Planejadas
| Capacidade | Descricao | Fonte (doc) | Blocker | Prioridade |
|------------|-----------|-------------|---------|------------|
| Marketing Intelligence Layer (store_intelligence) | Store context and learned patterns | [docs/architecture/migration-plan.md](docs/architecture/migration-plan.md) | Not started | 🔴 ALTA |
| Onboarding questionnaire (5 min) | Structured profile collection | [docs/analysis/critical-product-evaluation-lojista.md](docs/analysis/critical-product-evaluation-lojista.md) | Not started | 🔴 ALTA |

### Refatoracoes Previstas
| Alvo | Tipo | Descricao | Fonte | Risk |
|------|------|-----------|-------|------|
| [database/schema.sql](database/schema.sql) | Sync | Regenerate schema snapshot from migrations (drift control) | [docs/architecture/migration-plan.md](docs/architecture/migration-plan.md) | Baixo |

### Gaps Identificados
| Gap | Impacto | Fonte |
|-----|---------|-------|
| Store intelligence fields (best_days, best_hours, target_audience, main_differentiation) missing | Weekly plan and copy remain generic | [docs/architecture/schema-audit.md](docs/architecture/schema-audit.md) |
| stores.instagram captured but not used in prompts | Lost channel context | [docs/architecture/schema-audit.md](docs/architecture/schema-audit.md) |

---

## Bounded Context: Campaign

### Capacidades Implementadas
| Path | Descricao | Status | Usado em (Fluxo) | Criticidade |
|------|-----------|--------|------------------|-------------|
| [lib/domain/campaigns/service.ts](lib/domain/campaigns/service.ts) + [app/api/generate/campaign/route.ts](app/api/generate/campaign/route.ts) | Campaign content generation pipeline (copy) | Implemented | F1, F2 | 🔴 CRITICA |
| [lib/domain/campaigns/mapper.ts](lib/domain/campaigns/mapper.ts) + [lib/domain/campaigns/schemas.ts](lib/domain/campaigns/schemas.ts) | Domain mapping, AI output normalization, validation | Implemented | F1, F2, F5 | 🔴 CRITICA |
| [lib/domain/campaigns/logic.ts](lib/domain/campaigns/logic.ts) + [lib/domain/campaigns/selectors.ts](lib/domain/campaigns/selectors.ts) | Status rules, UI status, ready/approved logic | Implemented | F1, F5 | 🔴 CRITICA |
| [app/dashboard/campaigns/new/_components/NewCampaignShell.tsx](app/dashboard/campaigns/new/_components/NewCampaignShell.tsx) | Manual campaign creation flow | Implemented | F1 | 🔴 CRITICA |
| [app/dashboard/campaigns/[id]/_components/CampaignPreviewClient.tsx](app/dashboard/campaigns/[id]/_components/CampaignPreviewClient.tsx) | Campaign edit, regenerate, approve flow | Implemented | F1, F5 | 🔴 CRITICA |
| [app/api/generate/og-image/route.tsx](app/api/generate/og-image/route.tsx) | OG image rendering endpoint | Implemented | F3, F5 | 🟡 MEDIA |
| [database/schema.sql](database/schema.sql) | campaigns table (status, content_type, post/reels, domain_input) | Implemented | F1, F2, F5 | 🔴 CRITICA |

### Capacidades Planejadas
| Capacidade | Descricao | Fonte (doc) | Blocker | Prioridade |
|------------|-----------|-------------|---------|------------|
| Campaign events tracking | Passive lifecycle events (created, approved, regenerated) | [docs/architecture/migration-plan.md](docs/architecture/migration-plan.md) | Not started | 🟡 MEDIA |
| Campaign brief contract v2 (domain_input) | Typed content domain separation | [docs/architecture/arquitetura-alvo-vendeo-v2.md](docs/architecture/arquitetura-alvo-vendeo-v2.md) | Partial | 🟡 MEDIA |
| Agency Principles templates | Conversion-focused prompt templates | [docs/analysis/critical-product-evaluation-lojista.md](docs/analysis/critical-product-evaluation-lojista.md) | Not started | 🔴 ALTA |

### Refatoracoes Previstas
| Alvo | Tipo | Descricao | Fonte | Risk |
|------|------|-----------|-------|------|
| [database/schema.sql](database/schema.sql) | Sync | Drift reconciliation for domain_input, campaign_approved_assets | [docs/architecture/schema-audit.md](docs/architecture/schema-audit.md) | Baixo |
| [lib/domain/campaigns/mapper.ts](lib/domain/campaigns/mapper.ts) | Extension | Adopt domain_input as canonical brief for engines | [docs/architecture/arquitetura-alvo-vendeo-v2.md](docs/architecture/arquitetura-alvo-vendeo-v2.md) | Medio |

### Gaps Identificados
| Gap | Impacto | Fonte |
|-----|---------|-------|
| campaign_approved_assets table exists but no app usage | Approval audit not leveraged | [database/schema.sql](database/schema.sql) |
| No campaign_events table | No passive learning signals | [docs/architecture/schema-proposal.md](docs/architecture/schema-proposal.md) |

---

## Bounded Context: Weekly Planning

### Capacidades Implementadas
| Path | Descricao | Status | Usado em (Fluxo) | Criticidade |
|------|-----------|--------|------------------|-------------|
| [lib/domain/weekly-plans/service.ts](lib/domain/weekly-plans/service.ts) + [app/api/generate/weekly-plan/route.ts](app/api/generate/weekly-plan/route.ts) | Weekly plan create, fetch, delete, item generation | Implemented | F3 | 🔴 CRITICA |
| [lib/domain/weekly-plans/strategy.ts](lib/domain/weekly-plans/strategy.ts) + [app/api/generate/weekly-strategy/route.ts](app/api/generate/weekly-strategy/route.ts) | Weekly strategy generation (weather + history) | Implemented | F3 | 🟡 MEDIA |
| [app/dashboard/plans/_components/WizardShell.tsx](app/dashboard/plans/_components/WizardShell.tsx) | Weekly plan wizard (week config, review, execution) | Implemented | F3 | 🔴 CRITICA |
| [database/schema.sql](database/schema.sql) | weekly_plans + weekly_plan_items tables | Implemented | F3 | 🔴 CRITICA |

### Capacidades Planejadas
| Capacidade | Descricao | Fonte (doc) | Blocker | Prioridade |
|------------|-----------|-------------|---------|------------|
| intelligence_snapshot in weekly_plans | Store intelligence snapshot for audit | [docs/architecture/design-decisions.md](docs/architecture/design-decisions.md) | Not started | 🟡 MEDIA |
| Strategy contract v2 (target_content_type, target_domain_input) | Explicit domain intent | [docs/architecture/arquitetura-alvo-vendeo-v2.md](docs/architecture/arquitetura-alvo-vendeo-v2.md) | Partial | 🟡 MEDIA |

### Refatoracoes Previstas
| Alvo | Tipo | Descricao | Fonte | Risk |
|------|------|-----------|-------|------|
| [lib/domain/weekly-plans/service.ts](lib/domain/weekly-plans/service.ts) | Extension | Consume store_intelligence for plan generation | [docs/architecture/migration-plan.md](docs/architecture/migration-plan.md) | Alto |

### Gaps Identificados
| Gap | Impacto | Fonte |
|-----|---------|-------|
| No intelligence snapshot stored with plan | Loss of auditability | [docs/architecture/design-decisions.md](docs/architecture/design-decisions.md) |
| Weekly plan does not use store_intelligence | Plans remain generic | [docs/analysis/critical-product-evaluation-lojista.md](docs/analysis/critical-product-evaluation-lojista.md) |

---

## Bounded Context: Content Intelligence

### Capacidades Implementadas
| Path | Descricao | Status | Usado em (Fluxo) | Criticidade |
|------|-----------|--------|------------------|-------------|
| [lib/ai/parse.ts](lib/ai/parse.ts) + [lib/ai/client.ts](lib/ai/client.ts) | AI call, JSON parsing, retry with correction | Implemented | F2, F3 | 🔴 CRITICA |
| [lib/domain/campaigns/prompts.ts](lib/domain/campaigns/prompts.ts) | Campaign copy prompt engineering | Implemented | F2 | 🔴 CRITICA |
| [lib/domain/short-videos/prompts.ts](lib/domain/short-videos/prompts.ts) + [app/api/generate/reels/route.ts](app/api/generate/reels/route.ts) | Reels script generation | Implemented | F2 | 🟡 MEDIA |
| [lib/domain/weekly-plans/prompts.ts](lib/domain/weekly-plans/prompts.ts) | Weekly strategy prompt with weather and history | Implemented | F3 | 🟡 MEDIA |

### Capacidades Planejadas
| Capacidade | Descricao | Fonte (doc) | Blocker | Prioridade |
|------------|-----------|-------------|---------|------------|
| Agency Principles prompt templates | 8 conversion principles embedded in copy | [docs/analysis/critical-product-evaluation-lojista.md](docs/analysis/critical-product-evaluation-lojista.md) | Research pending | 🔴 ALTA |
| Marketing Intelligence inputs | Store context (best days, audience, differentiation) | [docs/architecture/schema-proposal.md](docs/architecture/schema-proposal.md) | Not started | 🔴 ALTA |

### Refatoracoes Previstas
| Alvo | Tipo | Descricao | Fonte | Risk |
|------|------|-----------|-------|------|
| [lib/domain/campaigns/prompts.ts](lib/domain/campaigns/prompts.ts) | Extension | Inject intelligence_snapshot + agency principles | [docs/analysis/critical-product-evaluation-lojista.md](docs/analysis/critical-product-evaluation-lojista.md) | Alto |

### Gaps Identificados
| Gap | Impacto | Fonte |
|-----|---------|-------|
| No conversion science layer | Copy is pretty but low conversion | [docs/analysis/critical-product-evaluation-lojista.md](docs/analysis/critical-product-evaluation-lojista.md) |
| Content is one-dimensional | No weekly narrative or micro-moments | [docs/analysis/critical-product-evaluation-lojista.md](docs/analysis/critical-product-evaluation-lojista.md) |

---

## Bounded Context: Visual Intelligence

### Capacidades Implementadas
| Path | Descricao | Status | Usado em (Fluxo) | Criticidade |
|------|-----------|--------|------------------|-------------|
| None found in codebase | Visual reader implementation not present in repo | Gap | F4 | 🔴 CRITICA |

### Capacidades Planejadas
| Capacidade | Descricao | Fonte (doc) | Blocker | Prioridade |
|------------|-----------|-------------|---------|------------|
| Visual Reader (18 fields contract) | Visual analysis contract for product vs image | [docs/architecture/arquitetura-alvo-vendeo-v2.md](docs/architecture/arquitetura-alvo-vendeo-v2.md) | Missing implementation | 🔴 ALTA |

### Refatoracoes Previstas
| Alvo | Tipo | Descricao | Fonte | Risk |
|------|------|-----------|-------|------|
| lib/visual-reader (missing) | Extension | Add 8 composition fields on top of 18 existing | [docs/PROJECT-CONSTITUTION.md](docs/PROJECT-CONSTITUTION.md) | Alto |

### Gaps Identificados
| Gap | Impacto | Fonte |
|-----|---------|-------|
| Visual Reader code missing | F4 cannot be enforced (product vs image validation) | [docs/CRITICAL-FLOWS.md](docs/CRITICAL-FLOWS.md) |

---

## Bounded Context: Visual Composition

### Capacidades Implementadas
| Path | Descricao | Status | Usado em (Fluxo) | Criticidade |
|------|-----------|--------|------------------|-------------|
| [lib/graphics/renderer.ts](lib/graphics/renderer.ts) | Canvas renderer (solid/floating/split layouts) | Implemented | F1, F5 | 🔴 CRITICA |
| [app/dashboard/campaigns/_components/CampaignArtViewer.tsx](app/dashboard/campaigns/_components/CampaignArtViewer.tsx) | Preview renderer (parity targets) | Implemented | F3, F5 | 🔴 CRITICA |
| [app/dashboard/campaigns/_components/renderCampaignArt.ts](app/dashboard/campaigns/_components/renderCampaignArt.ts) | Client render fallback for export | Implemented | F3, F5 | 🟡 MEDIA |
| [app/api/generate/og-image/route.tsx](app/api/generate/og-image/route.tsx) | Server-side OG image render | Implemented | F3 | 🟡 MEDIA |

### Capacidades Planejadas
| Capacidade | Descricao | Fonte (doc) | Blocker | Prioridade |
|------------|-----------|-------------|---------|------------|
| Composition Intent Contract | Deterministic spec for composition decisions | [docs/architecture/arquitetura-alvo-vendeo-v2.md](docs/architecture/arquitetura-alvo-vendeo-v2.md) | Not started | 🟡 MEDIA |

### Refatoracoes Previstas
| Alvo | Tipo | Descricao | Fonte | Risk |
|------|------|-----------|-------|------|
| [lib/graphics/renderer.ts](lib/graphics/renderer.ts) + [app/dashboard/campaigns/_components/CampaignArtViewer.tsx](app/dashboard/campaigns/_components/CampaignArtViewer.tsx) | Parity | Formalize preview vs renderer parity gates | [docs/PROJECT-CONSTITUTION.md](docs/PROJECT-CONSTITUTION.md) | Alto |

### Gaps Identificados
| Gap | Impacto | Fonte |
|-----|---------|-------|
| Visual reader signals not consumed | Composition does not adapt to image content | [docs/architecture/arquitetura-alvo-vendeo-v2.md](docs/architecture/arquitetura-alvo-vendeo-v2.md) |

---

## Bounded Context: Feedback and Learning

### Capacidades Implementadas
| Path | Descricao | Status | Usado em (Fluxo) | Criticidade |
|------|-----------|--------|------------------|-------------|
| [app/api/feedback/route.ts](app/api/feedback/route.ts) + [lib/domain/feedback/service.ts](lib/domain/feedback/service.ts) | Detailed feedback capture | Implemented | F1, F2 | 🟡 MEDIA |
| [app/api/generation-feedback/route.ts](app/api/generation-feedback/route.ts) + [components/feedback/SalesFeedbackInline.tsx](components/feedback/SalesFeedbackInline.tsx) | Inline usefulness feedback (yes/maybe/no) | Implemented | F1, F2, F3 | 🟡 MEDIA |
| [database/schema.sql](database/schema.sql) | generation_feedback table | Implemented | F1, F2, F3 | 🟡 MEDIA |

### Capacidades Planejadas
| Capacidade | Descricao | Fonte (doc) | Blocker | Prioridade |
|------------|-----------|-------------|---------|------------|
| campaign_events table | Passive learning signals + TTL | [docs/architecture/schema-proposal.md](docs/architecture/schema-proposal.md) | Not started | 🟡 MEDIA |
| Learning fields (approval_duration_seconds, edited_fields) | MVP learning for quality | [docs/architecture/design-decisions.md](docs/architecture/design-decisions.md) | Not started | 🟡 MEDIA |

### Refatoracoes Previstas
| Alvo | Tipo | Descricao | Fonte | Risk |
|------|------|-----------|-------|------|
| Feedback -> intelligence pipeline | Extension | Feed store_intelligence from feedback/events | [docs/architecture/migration-plan.md](docs/architecture/migration-plan.md) | Medio |

### Gaps Identificados
| Gap | Impacto | Fonte |
|-----|---------|-------|
| No event capture for approvals/regeneration | Learning signals missing | [docs/architecture/schema-proposal.md](docs/architecture/schema-proposal.md) |

---

## Cross-Cutting Platform Services

### Capacidades Implementadas
| Path | Descricao | Status | Usado em (Fluxo) | Criticidade |
|------|-----------|--------|------------------|-------------|
| [lib/supabase/admin.ts](lib/supabase/admin.ts) + [lib/supabase/server.ts](lib/supabase/server.ts) | Supabase admin/server clients | Implemented | F1-F5 | 🔴 CRITICA |
| [lib/http.ts](lib/http.ts) | Fetch helper with error normalization | Implemented | F3 | 🟡 MEDIA |
| [lib/ratelimit.ts](lib/ratelimit.ts) | Rate limit helper (Upstash) | Implemented | F1-F5 | 🟢 BAIXA |
| [lib/security/sanitizeNextPath.ts](lib/security/sanitizeNextPath.ts) | Safe redirect path sanitizer | Implemented | F1 | 🟢 BAIXA |

### Capacidades Planejadas
| Capacidade | Descricao | Fonte (doc) | Blocker | Prioridade |
|------------|-----------|-------------|---------|------------|
| None | - | - | - | - |

### Refatoracoes Previstas
| Alvo | Tipo | Descricao | Fonte | Risk |
|------|------|-----------|-------|------|
| None | - | - | - | - |

### Gaps Identificados
| Gap | Impacto | Fonte |
|-----|---------|-------|
| None | - | - |

---

## Misalignments (Bounded Context vs Current Structure)

| Misalignment | Impacto | Fonte |
|--------------|---------|-------|
| Content and visual composition responsibilities mixed in UI and domain services | Harder to enforce contracts and versioning | [docs/architecture/arquitetura-alvo-vendeo-v2.md](docs/architecture/arquitetura-alvo-vendeo-v2.md) |
| Visual Intelligence context not implemented | F4 cannot be enforced | [docs/CRITICAL-FLOWS.md](docs/CRITICAL-FLOWS.md) |
| Planned intelligence data not persisted | Strategy and copy remain generic | [docs/analysis/critical-product-evaluation-lojista.md](docs/analysis/critical-product-evaluation-lojista.md) |

---

## Schema Drift Watchlist (Inconsistency to Resolve)

These fields are listed as drift in [docs/architecture/schema-audit.md](docs/architecture/schema-audit.md). Current [database/schema.sql](database/schema.sql) appears to include some of them, so confirm in live DB and regenerate snapshot if needed.

| Item | Expected Location | Note |
|------|-------------------|------|
| stores.brand_profile, brand_profile_version, brand_profile_updated_at | stores table | Verify presence and usage |
| campaigns.domain_input, domain_input_version, legacy_content_type | campaigns table | Verify presence and usage |
| weekly_plan_items.target_content_type, target_domain_input | weekly_plan_items table | Verify presence and usage |
| campaign_approved_assets table | public | Verify usage in app |

---

## Critical Gaps Summary (Top 3)

1) Marketing Intelligence Layer missing (store_intelligence + onboarding questionnaire) -> generic campaigns and churn risk. Source: [docs/analysis/critical-product-evaluation-lojista.md](docs/analysis/critical-product-evaluation-lojista.md)
2) Conversion science missing (Agency Principles) -> pretty content, low conversion. Source: [docs/analysis/critical-product-evaluation-lojista.md](docs/analysis/critical-product-evaluation-lojista.md)
3) Visual Reader missing in codebase -> F4 cannot be enforced. Source: [docs/CRITICAL-FLOWS.md](docs/CRITICAL-FLOWS.md)
