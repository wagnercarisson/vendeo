-- 006_storage_campaign_images.sql
-- Bucket + policies para upload de imagens de campanhas

-- 1) Bucket (id = name)
insert into storage.buckets (id, name, public)
values ('campaign-images', 'campaign-images', true)
on conflict (id) do nothing;

-- 2) Policies em storage.objects

-- Leitura pública (para permitir <Image/> sem auth)
drop policy if exists "public_read_campaign_images" on storage.objects;
create policy "public_read_campaign_images"
on storage.objects
for select
to public
using (bucket_id = 'campaign-images');

-- Upload (qualquer usuário autenticado pode inserir objetos no bucket)
drop policy if exists "auth_upload_campaign_images" on storage.objects;
create policy "auth_upload_campaign_images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'campaign-images');

-- Update apenas do dono (owner) do objeto
drop policy if exists "owner_update_campaign_images" on storage.objects;
create policy "owner_update_campaign_images"
on storage.objects
for update
to authenticated
using (bucket_id = 'campaign-images' and owner = auth.uid())
with check (bucket_id = 'campaign-images' and owner = auth.uid());

-- Delete apenas do dono (owner) do objeto
drop policy if exists "owner_delete_campaign_images" on storage.objects;
create policy "owner_delete_campaign_images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'campaign-images' and owner = auth.uid());