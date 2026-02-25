-- =============================================
-- VENDEO
-- Migration 004
-- weekly_plan_items: content_type constraint (post|reels)
-- =============================================

alter table public.weekly_plan_items
add constraint weekly_plan_items_content_type_check
check (content_type in ('post', 'reels'));