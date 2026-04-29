# Schema Audit (Marketing Intelligence Readiness)

Date: 2026-04-29
Scope: stores, campaigns, weekly_plans, weekly_plan_items, generation_feedback, other related tables.

## Key Findings
- schema.sql is not fully aligned with later migrations. Newer columns/tables exist in migrations (and backups) but are missing from schema.sql.
- Stores and campaigns already contain most Tier 1 data for onboarding, but Tier 2 and Tier 3 intelligence structures are missing.
- No dedicated event tracking table exists for passive learning. generation_feedback captures feedback but not lifecycle events.

## Schema/DDL Drift
These items exist in migrations but are not present in database/schema.sql:
- stores: brand_profile, brand_profile_version, brand_profile_updated_at (migration 023)
- campaigns: domain_input, domain_input_version, legacy_content_type (migration 024)
- weekly_plan_items: target_content_type, target_domain_input (migration 018)
- campaign_approved_assets table (migrations 021/022)

Recommendation: regenerate schema.sql from the live schema or apply a consolidated schema update.

## Table: stores
| Field | Type | Used? | Orphan? | Notes |
| --- | --- | --- | --- | --- |
| id | uuid | Yes | No | Primary key. |
| owner_user_id | uuid | Yes | No | Used in auth and store lookup. Unique. |
| name | text | Yes | No | Onboarding, UI, prompts. |
| city | text | Yes | No | Weekly strategy prompt, store snapshot. |
| state | text | Yes | No | Weekly strategy prompt, store snapshot. |
| logo_url | text | Yes | No | Onboarding, visual pipeline. |
| address | text | Yes | No | Preview, store snapshot. |
| neighborhood | text | Yes | No | Preview, store snapshot. |
| phone | text | Yes | No | CTA fallback. |
| whatsapp | text | Yes | No | CTA and store context. |
| instagram | text | Partial | No | Selected in UI, not used in prompts. |
| primary_color | text | Yes | No | Visual pipeline / intent resolver. |
| secondary_color | text | Yes | No | Visual pipeline / intent resolver. |
| main_segment | text | Yes | No | Prompts and weekly strategy. |
| brand_positioning | text | Yes | No | Prompts and weekly strategy. |
| tone_of_voice | text | Yes | No | Prompts and weekly strategy. |
| created_at | timestamptz | Yes | No | Ordering and audit. |
| updated_at | timestamptz | Yes | No | Standard auditing. |
| brand_profile | jsonb | Yes | No | Used in store mapper (brand profile resolve). |
| brand_profile_version | integer | Yes | No | Tracked in generation context. |
| brand_profile_updated_at | timestamptz | Yes | No | Tracked in generation context. |

Missing for marketing intelligence (Tier 2/3):
- best_days, best_hours, target_audience, main_differentiation
- learned_patterns aggregate store intelligence

## Table: campaigns
| Field | Type | Used? | Orphan? | Notes |
| --- | --- | --- | --- | --- |
| id | uuid | Yes | No | Primary key. |
| store_id | uuid | Yes | No | FK to stores. |
| weekly_plan_item_id | uuid | Yes | No | Plan linkage. |
| origin | text | Yes | No | manual/plan.
| product_name | text | Yes | No | Core prompt input. |
| price | numeric | Yes | No | Pricing input. |
| price_label | text | Yes | No | Visual + copy. |
| content_type | text | Yes | No | product/service/info/message. |
| campaign_type | text | Yes | No | post/reels/both. |
| audience | text | Yes | No | Strategy field. |
| objective | text | Yes | No | Strategy field. |
| product_positioning | text | Yes | No | Strategy field. |
| status | text | Yes | No | Global status. |
| post_status | text | Yes | No | Granular status. |
| reels_status | text | Yes | No | Granular status. |
| image_url | text | Yes | No | Approved asset link. |
| product_image_url | text | Yes | No | Base asset for generation. |
| headline | text | Yes | No | Output. |
| body_text | text | Yes | No | Output. |
| cta | text | Yes | No | Output. |
| ai_text | text | Yes | No | Output. |
| ai_caption | text | Yes | No | Output. |
| ai_hashtags | text | Yes | No | Output. |
| ai_cta | text | Yes | No | Output. |
| ai_generated_at | timestamptz | Yes | No | Output timestamp. |
| reels_hook | text | Yes | No | Output. |
| reels_script | text | Yes | No | Output. |
| reels_shotlist | jsonb | Yes | No | Output. |
| reels_on_screen_text | jsonb | Yes | No | Output. |
| reels_audio_suggestion | text | Yes | No | Output. |
| reels_duration_seconds | int | Yes | No | Output. |
| reels_caption | text | Yes | No | Output. |
| reels_cta | text | Yes | No | Output. |
| reels_hashtags | text | Yes | No | Output. |
| reels_generated_at | timestamptz | Yes | No | Output timestamp. |
| created_at | timestamptz | Yes | No | Audit. |
| updated_at | timestamptz | Yes | No | Audit. |
| domain_input | jsonb | Yes | No | Domain snapshot used by visual pipeline. |
| domain_input_version | int | Yes | No | Snapshot version. |
| legacy_content_type | text | Yes | No | Backward compatibility. |

Requested but not present in schema or code:
- generate_image, generate_video (not referenced in codebase)

## Table: weekly_plans
| Field | Type | Used? | Orphan? | Notes |
| --- | --- | --- | --- | --- |
| id | uuid | Yes | No | Primary key. |
| store_id | uuid | Yes | No | FK to stores. |
| week_start | date | Yes | No | Week anchor. |
| status | text | Yes | No | draft/approved. |
| strategy | jsonb | Yes | No | Strategy items + store_snapshot. |
| created_at | timestamptz | Yes | No | Audit. |
| updated_at | timestamptz | Yes | No | Audit. |

Missing for intelligence linkage:
- intelligence_snapshot (optional) to freeze learned patterns used for plan generation.

## Table: weekly_plan_items
| Field | Type | Used? | Orphan? | Notes |
| --- | --- | --- | --- | --- |
| id | uuid | Yes | No | Primary key. |
| plan_id | uuid | Yes | No | FK to weekly_plans. |
| day_of_week | int | Yes | No | 1-7. |
| content_type | text | Yes | No | post/reels. |
| theme | text | Yes | No | Strategy theme. |
| recommended_time | text | Yes | No | UI hints. |
| campaign_id | uuid | Partial | No | Legacy linkage. |
| brief | jsonb | Yes | No | Strategy brief. |
| status | text | Yes | No | draft/ready/approved. |
| created_at | timestamptz | Yes | No | Audit. |
| target_content_type | text | Yes | No | Target domain content type. |
| target_domain_input | jsonb | Yes | No | Target domain input. |

## Table: generation_feedback
| Field | Type | Used? | Orphan? | Notes |
| --- | --- | --- | --- | --- |
| id | uuid | Yes | No | Primary key. |
| created_at | timestamptz | Yes | No | Audit. |
| user_id | uuid | Yes | No | Auth. |
| store_id | uuid | Yes | No | Store reference. |
| campaign_id | uuid | Partial | No | Optional. |
| weekly_plan_id | uuid | Partial | No | Optional. |
| page_path | text | Partial | No | UI telemetry. |
| content_type | text | Yes | No | campaign/reels/weekly_plan/weekly_strategy. |
| vote | text | Yes | No | yes/maybe/no. |
| reason | text | Partial | No | Optional. |
| would_post | text | Partial | No | Optional. |
| user_agent | text | Partial | No | Optional. |

## Table: campaign_metrics
| Field | Type | Used? | Orphan? | Notes |
| --- | --- | --- | --- | --- |
| id | uuid | Partial | No | Created by migration. |
| campaign_id | uuid | Partial | No | Link to campaigns. |
| metric_type | text | Partial | No | e.g. usefulness. |
| value_text | text | Partial | No | Optional. |
| value_num | numeric | Partial | No | Optional. |
| metadata | jsonb | Partial | No | Optional. |
| created_at | timestamptz | Partial | No | Audit. |

## Table: beta_feedbacks
| Field | Type | Used? | Orphan? | Notes |
| --- | --- | --- | --- | --- |
| id | uuid | Partial | No | Beta telemetry. |
| user_id | uuid | Partial | No | Auth. |
| store_id | uuid | Partial | No | Optional. |
| rating | int | Partial | No | 1-5. |
| comment | text | Partial | No | Optional. |
| category | text | Partial | No | Optional. |
| metadata | jsonb | Partial | No | Optional. |
| created_at | timestamptz | Partial | No | Audit. |

## Table: campaign_approved_assets
| Field | Type | Used? | Orphan? | Notes |
| --- | --- | --- | --- | --- |
| campaign_id | uuid | Yes | No | Approved asset store. |
| store_id | uuid | Yes | No | Ownership. |
| asset_kind | text | Yes | No | post_image, etc. |
| approval_status | text | Yes | No | approved/superseded. |
| approved_at | timestamptz | Yes | No | Approval time. |
| storage_bucket | text | Yes | No | Storage reference. |
| storage_path | text | Yes | No | Storage path. |
| public_url_legacy | text | Partial | No | Legacy compatibility. |
| generation_source | text | Yes | No | e.g. campaign_approval. |
| campaign_snapshot | jsonb | Yes | No | Snapshot of campaign. |
| visual_snapshot | jsonb | Partial | No | Visual snapshot. |
| brand_profile_version | int | Partial | No | Brand profile version. |
| brand_profile_snapshot | jsonb | Partial | No | Brand profile snapshot. |
| created_at | timestamptz | Yes | No | Audit. |

## Conclusion
- Orphans: none clearly unused; instagram and beta tables are low-usage but not safe to remove yet.
- Missing: store intelligence structure, event tracking, optional store context fields.
- Action: reconcile schema.sql with migrations and design new tables for intelligence and events.
