-- =============================================
-- VENDEO
-- Migration 002
-- RLS Owner-Based Multi-Tenant Model
-- =============================================

-- =============================================
-- STORES
-- =============================================

drop policy if exists "stores_select_own" on public.stores;
drop policy if exists "stores_insert_owner" on public.stores;
drop policy if exists "stores_update_own" on public.stores;
drop policy if exists "stores_delete_own" on public.stores;

create policy "stores_select_own"
on public.stores
for select
to authenticated
using (owner_user_id = auth.uid());

create policy "stores_insert_owner"
on public.stores
for insert
to authenticated
with check (owner_user_id = auth.uid());

create policy "stores_update_own"
on public.stores
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "stores_delete_own"
on public.stores
for delete
to authenticated
using (owner_user_id = auth.uid());

-- =============================================
-- CAMPAIGNS
-- =============================================

drop policy if exists "campaigns_select_owner" on public.campaigns;
drop policy if exists "campaigns_insert_owner" on public.campaigns;
drop policy if exists "campaigns_update_owner" on public.campaigns;
drop policy if exists "campaigns_delete_owner" on public.campaigns;

create policy "campaigns_select_owner"
on public.campaigns
for select
to authenticated
using (
  exists (
    select 1
    from public.stores s
    where s.id = campaigns.store_id
      and s.owner_user_id = auth.uid()
  )
);

create policy "campaigns_insert_owner"
on public.campaigns
for insert
to authenticated
with check (
  exists (
    select 1
    from public.stores s
    where s.id = campaigns.store_id
      and s.owner_user_id = auth.uid()
  )
);

create policy "campaigns_update_owner"
on public.campaigns
for update
to authenticated
using (
  exists (
    select 1
    from public.stores s
    where s.id = campaigns.store_id
      and s.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.stores s
    where s.id = campaigns.store_id
      and s.owner_user_id = auth.uid()
  )
);

create policy "campaigns_delete_owner"
on public.campaigns
for delete
to authenticated
using (
  exists (
    select 1
    from public.stores s
    where s.id = campaigns.store_id
      and s.owner_user_id = auth.uid()
  )
);

-- =============================================
-- WEEKLY_PLANS
-- =============================================

drop policy if exists "weekly_plans_select_owner" on public.weekly_plans;
drop policy if exists "weekly_plans_insert_owner" on public.weekly_plans;
drop policy if exists "weekly_plans_update_owner" on public.weekly_plans;
drop policy if exists "weekly_plans_delete_owner" on public.weekly_plans;

create policy "weekly_plans_select_owner"
on public.weekly_plans
for select
to authenticated
using (
  exists (
    select 1
    from public.stores s
    where s.id = weekly_plans.store_id
      and s.owner_user_id = auth.uid()
  )
);

create policy "weekly_plans_insert_owner"
on public.weekly_plans
for insert
to authenticated
with check (
  exists (
    select 1
    from public.stores s
    where s.id = weekly_plans.store_id
      and s.owner_user_id = auth.uid()
  )
);

create policy "weekly_plans_update_owner"
on public.weekly_plans
for update
to authenticated
using (
  exists (
    select 1
    from public.stores s
    where s.id = weekly_plans.store_id
      and s.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.stores s
    where s.id = weekly_plans.store_id
      and s.owner_user_id = auth.uid()
  )
);

create policy "weekly_plans_delete_owner"
on public.weekly_plans
for delete
to authenticated
using (
  exists (
    select 1
    from public.stores s
    where s.id = weekly_plans.store_id
      and s.owner_user_id = auth.uid()
  )
);

-- =============================================
-- WEEKLY_PLAN_ITEMS
-- =============================================

drop policy if exists "weekly_plan_items_select_owner" on public.weekly_plan_items;
drop policy if exists "weekly_plan_items_insert_owner" on public.weekly_plan_items;
drop policy if exists "weekly_plan_items_update_owner" on public.weekly_plan_items;
drop policy if exists "weekly_plan_items_delete_owner" on public.weekly_plan_items;

create policy "weekly_plan_items_select_owner"
on public.weekly_plan_items
for select
to authenticated
using (
  exists (
    select 1
    from public.weekly_plans wp
    join public.stores s on s.id = wp.store_id
    where wp.id = weekly_plan_items.plan_id
      and s.owner_user_id = auth.uid()
  )
);

create policy "weekly_plan_items_insert_owner"
on public.weekly_plan_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.weekly_plans wp
    join public.stores s on s.id = wp.store_id
    where wp.id = weekly_plan_items.plan_id
      and s.owner_user_id = auth.uid()
  )
  and (
    campaign_id is null
    or exists (
      select 1
      from public.campaigns c
      join public.stores s2 on s2.id = c.store_id
      where c.id = weekly_plan_items.campaign_id
        and s2.owner_user_id = auth.uid()
    )
  )
);

create policy "weekly_plan_items_update_owner"
on public.weekly_plan_items
for update
to authenticated
using (
  exists (
    select 1
    from public.weekly_plans wp
    join public.stores s on s.id = wp.store_id
    where wp.id = weekly_plan_items.plan_id
      and s.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.weekly_plans wp
    join public.stores s on s.id = wp.store_id
    where wp.id = weekly_plan_items.plan_id
      and s.owner_user_id = auth.uid()
  )
  and (
    campaign_id is null
    or exists (
      select 1
      from public.campaigns c
      join public.stores s2 on s2.id = c.store_id
      where c.id = weekly_plan_items.campaign_id
        and s2.owner_user_id = auth.uid()
    )
  )
);

create policy "weekly_plan_items_delete_owner"
on public.weekly_plan_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.weekly_plans wp
    join public.stores s on s.id = wp.store_id
    where wp.id = weekly_plan_items.plan_id
      and s.owner_user_id = auth.uid()
  )
);