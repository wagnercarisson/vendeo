-- Migration: Harden Storage Security
-- Objetivo: Tornar buckets privados e remover políticas de leitura pública.
-- Data: 2026-03-23

BEGIN;

-- 1) Atualizar buckets para privados
UPDATE storage.buckets
SET public = false
WHERE id IN ('campaign-images', 'product-images');

-- 2) Remover políticas de leitura pública
DROP POLICY IF EXISTS "public_read_campaign_images" ON storage.objects;
DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;

-- 3) Garantir política de leitura para usuários autenticados (opcional se usar Signed URLs, mas boa prática)
-- Nota: Signed URLs ignoram RLS de select, mas mantemos RLS para segurança extra em listagens se necessário.
-- Para o Beta, Signed URLs serão o método principal.

COMMIT;
