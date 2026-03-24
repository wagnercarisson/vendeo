-- Migration: 016_secure_storage_and_paths.sql
-- Objetivo: Restringir acesso público ao bucket de imagens e aplicar RLS por proprietário.

BEGIN;

-- 1. Tornar o bucket privado
UPDATE storage.buckets 
SET public = false 
WHERE id = 'campaign-images';

-- 2. Adicionar política de leitura apenas para o dono (SELECT)
-- Nota: INSERT, UPDATE e DELETE já existem conforme verificado via SQL Editor.
DROP POLICY IF EXISTS "auth_select_campaign_images" ON storage.objects;
CREATE POLICY "auth_select_campaign_images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'campaign-images' AND owner = auth.uid());

COMMIT;
