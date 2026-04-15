-- 017_campaigns_objective_check.sql
-- Normaliza valores legados de campaigns.objective antes de aplicar constraint.
-- Decisão desta rodada: "lancamento" não é objetivo oficial separado; convergir para "novidade".

BEGIN;

-- Mapeamentos explícitos aplicados antes do CHECK para evitar falha por legado:
-- vendas / promo / promoção -> promocao
-- lancamento / lançamento -> novidade
-- reconhecimento -> institucional
-- trafego / tráfego -> visitas
-- consideracao / consideração -> autoridade
-- Valores oficiais com variação de caixa/acentuação também são normalizados.
-- Qualquer valor não reconhecido após esse mapeamento é definido como NULL
-- para preservar o registro sem forçar uma classificação incorreta.

UPDATE public.campaigns
SET objective = CASE
  WHEN objective IS NULL OR btrim(objective) = '' THEN NULL
  WHEN lower(btrim(objective)) IN ('promocao', 'promo', 'promoção', 'promocoes', 'promoções', 'vendas') THEN 'promocao'
  WHEN lower(btrim(objective)) IN ('novidade', 'lancamento', 'lançamento', 'chegou hoje') THEN 'novidade'
  WHEN lower(btrim(objective)) IN ('queima', 'queima de estoque', 'ultimas unidades', 'últimas unidades') THEN 'queima'
  WHEN lower(btrim(objective)) IN ('sazonal', 'data comemorativa') THEN 'sazonal'
  WHEN lower(btrim(objective)) IN ('reposicao', 'reposição', 'volta ao estoque') THEN 'reposicao'
  WHEN lower(btrim(objective)) IN ('combo', 'leve mais por menos') THEN 'combo'
  WHEN lower(btrim(objective)) IN ('engajamento', 'enquete', 'perguntas', 'interacao', 'interação') THEN 'engajamento'
  WHEN lower(btrim(objective)) IN ('visitas', 'trafego', 'tráfego', 'gerar visitas', 'visita loja') THEN 'visitas'
  WHEN lower(btrim(objective)) IN ('informativo', 'informacao', 'informação', 'educativo') THEN 'informativo'
  WHEN lower(btrim(objective)) IN ('institucional', 'reconhecimento', 'marca') THEN 'institucional'
  WHEN lower(btrim(objective)) IN ('autoridade', 'consideracao', 'consideração', 'especialista', 'credibilidade') THEN 'autoridade'
  ELSE NULL
END
WHERE objective IS DISTINCT FROM CASE
  WHEN objective IS NULL OR btrim(objective) = '' THEN NULL
  WHEN lower(btrim(objective)) IN ('promocao', 'promo', 'promoção', 'promocoes', 'promoções', 'vendas') THEN 'promocao'
  WHEN lower(btrim(objective)) IN ('novidade', 'lancamento', 'lançamento', 'chegou hoje') THEN 'novidade'
  WHEN lower(btrim(objective)) IN ('queima', 'queima de estoque', 'ultimas unidades', 'últimas unidades') THEN 'queima'
  WHEN lower(btrim(objective)) IN ('sazonal', 'data comemorativa') THEN 'sazonal'
  WHEN lower(btrim(objective)) IN ('reposicao', 'reposição', 'volta ao estoque') THEN 'reposicao'
  WHEN lower(btrim(objective)) IN ('combo', 'leve mais por menos') THEN 'combo'
  WHEN lower(btrim(objective)) IN ('engajamento', 'enquete', 'perguntas', 'interacao', 'interação') THEN 'engajamento'
  WHEN lower(btrim(objective)) IN ('visitas', 'trafego', 'tráfego', 'gerar visitas', 'visita loja') THEN 'visitas'
  WHEN lower(btrim(objective)) IN ('informativo', 'informacao', 'informação', 'educativo') THEN 'informativo'
  WHEN lower(btrim(objective)) IN ('institucional', 'reconhecimento', 'marca') THEN 'institucional'
  WHEN lower(btrim(objective)) IN ('autoridade', 'consideracao', 'consideração', 'especialista', 'credibilidade') THEN 'autoridade'
  ELSE NULL
END;

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_objective_check;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_objective_check
  CHECK (
    objective IS NULL OR objective IN (
      'promocao',
      'novidade',
      'queima',
      'sazonal',
      'reposicao',
      'combo',
      'engajamento',
      'visitas',
      'informativo',
      'institucional',
      'autoridade'
    )
  );

COMMIT;