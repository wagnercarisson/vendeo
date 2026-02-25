-- =============================================
-- VENDEO
-- Migration 003
-- weekly_plan_items: day_of_week constraint (1..7)
-- =============================================

alter table public.weekly_plan_items
add constraint weekly_plan_items_day_check
check (day_of_week between 1 and 7);