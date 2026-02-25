-- =============================================
-- VENDEO
-- Migration 005
-- weekly_plans: week_start must be Monday
-- =============================================

-- Em PostgreSQL: extract(isodow) retorna 1..7 (1=segunda, 7=domingo)
alter table public.weekly_plans
add constraint weekly_plans_week_start_is_monday_check
check (extract(isodow from week_start) = 1);