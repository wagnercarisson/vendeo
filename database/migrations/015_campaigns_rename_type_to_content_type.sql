-- Migration: 015_campaigns_rename_type_to_content_type.sql
-- Objetivo: Renomear a coluna 'type' não utilizada para 'content_type',
-- oficializando a persistência da natureza do conteúdo (Produto, Serviço, Aviso)
-- em conformidade com as regras de normalização estratégica do Vendeo.

-- 1. Renomear a coluna existente
ALTER TABLE public.campaigns 
  RENAME COLUMN type TO content_type;

-- 2. Garantir que apenas os valores normalizados sejam aceitos
ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_content_type_check
  CHECK (content_type IN ('product', 'service', 'info'));

-- 3. Definir o padrão seguro para novas campanhas que ignorarem o campo
ALTER TABLE public.campaigns
  ALTER COLUMN content_type SET DEFAULT 'product';

-- 4. Backfill (retroativo) cobrindo campanhas antigas onde o valor era nulo
-- Isso reflete o comportamento que o frontend sempre teve para campanhas legadas.
UPDATE public.campaigns
SET content_type = 'product'
WHERE content_type IS NULL;
