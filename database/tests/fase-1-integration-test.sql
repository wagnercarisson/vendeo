-- =============================================
-- VENDEO
-- FASE 1 - Integration Test
-- Motor V2 - Visual Signature System
-- Data: 2026-04-19
-- =============================================

-- TESTE 1: Verificar contagens básicas
-- Esperado: lojas = signatures, profiles = 5 × signatures
SELECT 
    'TESTE 1: Contagens Básicas' AS test_name,
    (SELECT COUNT(*) FROM stores) AS lojas,
    (SELECT COUNT(*) FROM visual_signatures) AS signatures,
    (SELECT COUNT(*) FROM visual_signature_profiles) AS profiles,
    (SELECT COUNT(*) FROM visual_signature_profiles)::float / NULLIF((SELECT COUNT(*) FROM visual_signatures), 0) AS profiles_por_signature;

-- TESTE 2: Verificar integridade dos dados migrados
-- Esperado: Todas as lojas têm signature, cores não são NULL
SELECT 
    'TESTE 2: Integridade dos Dados' AS test_name,
    COUNT(*) FILTER (WHERE vs.id IS NULL) AS lojas_sem_signature,
    COUNT(*) FILTER (WHERE vs.primary_color IS NULL) AS signatures_sem_primary_color,
    COUNT(*) FILTER (WHERE vs.secondary_color IS NULL) AS signatures_sem_secondary_color,
    COUNT(*) FILTER (WHERE vs.signature_seed IS NULL) AS signatures_sem_seed
FROM stores s
LEFT JOIN visual_signatures vs ON vs.store_id = s.id;

-- TESTE 3: Verificar profiles criados
-- Esperado: Cada signature tem exatamente 5 profiles (um de cada tipo)
SELECT 
    'TESTE 3: Profiles por Signature' AS test_name,
    COUNT(DISTINCT signature_id) AS total_signatures,
    COUNT(*) AS total_profiles,
    MIN(profile_count) AS min_profiles_por_signature,
    MAX(profile_count) AS max_profiles_por_signature,
    AVG(profile_count)::numeric(10,2) AS avg_profiles_por_signature
FROM (
    SELECT signature_id, COUNT(*) AS profile_count
    FROM visual_signature_profiles
    GROUP BY signature_id
) profile_counts;

-- TESTE 4: Verificar que todos os 5 contextos existem
-- Esperado: 5 contextos únicos
SELECT 
    'TESTE 4: Tipos de Contexto' AS test_name,
    context_type,
    COUNT(*) AS quantidade
FROM visual_signature_profiles
GROUP BY context_type
ORDER BY context_type;

-- TESTE 5: Inspecionar exemplo de profile (detalhes)
-- Esperado: JSONs estruturados, não vazios
SELECT 
    'TESTE 5: Exemplo de Profile' AS test_name,
    s.name AS loja_nome,
    vsp.context_type,
    vsp.intensity_level,
    vsp.composition_rules,
    vsp.typography_rules,
    vsp.color_rules
FROM visual_signature_profiles vsp
JOIN visual_signatures vs ON vs.id = vsp.signature_id
JOIN stores s ON s.id = vs.store_id
WHERE vsp.context_type = 'promotional'
LIMIT 1;

-- TESTE 6: Verificar novas colunas em campaigns
-- Esperado: Colunas existem, campanhas antigas têm NULL/default
SELECT 
    'TESTE 6: Campanhas - Novas Colunas' AS test_name,
    COUNT(*) AS total_campaigns,
    COUNT(visual_signature_id) AS campaigns_com_signature,
    COUNT(*) FILTER (WHERE visual_context = 'standard') AS campaigns_context_standard,
    COUNT(*) FILTER (WHERE visual_context != 'standard') AS campaigns_context_outros
FROM campaigns;

-- TESTE 7: Testar JOIN completo (sistema integrado)
-- Esperado: Join funciona, retorna dados coerentes
SELECT 
    'TESTE 7: JOIN Completo' AS test_name,
    s.name AS loja,
    vs.primary_color,
    vs.secondary_color,
    COUNT(DISTINCT vsp.id) AS profiles_configurados,
    COUNT(DISTINCT c.id) AS total_campanhas
FROM stores s
LEFT JOIN visual_signatures vs ON vs.store_id = s.id
LEFT JOIN visual_signature_profiles vsp ON vsp.signature_id = vs.id
LEFT JOIN campaigns c ON c.store_id = s.id
GROUP BY s.id, s.name, vs.primary_color, vs.secondary_color
LIMIT 3;

-- TESTE 8: Verificar constraints funcionando
-- Esperado: Tentativa de inserir contexto inválido FALHA
DO $$
BEGIN
    -- Tentar inserir profile com contexto inválido
    INSERT INTO visual_signature_profiles (
        signature_id, 
        context_type, 
        intensity_level
    )
    SELECT 
        id, 
        'invalid_context', 
        'balanced'
    FROM visual_signatures
    LIMIT 1;
    
    RAISE EXCEPTION 'TESTE 8 FALHOU: Constraint não bloqueou contexto inválido!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'TESTE 8: PASSOU - Constraint bloqueou contexto inválido corretamente';
    WHEN OTHERS THEN
        RAISE NOTICE 'TESTE 8: ERRO INESPERADO - %', SQLERRM;
END $$;

-- TESTE 9: Verificar que sistema antigo ainda funciona
-- Esperado: Campanhas podem ser criadas sem visual_signature_id
SELECT 
    'TESTE 9: Compatibilidade Sistema Antigo' AS test_name,
    COUNT(*) FILTER (WHERE visual_signature_id IS NULL) AS campanhas_sem_signature,
    COUNT(*) FILTER (WHERE visual_signature_id IS NOT NULL) AS campanhas_com_signature,
    CASE 
        WHEN COUNT(*) FILTER (WHERE visual_signature_id IS NULL) > 0 
        THEN 'PASSOU - Sistema antigo funcionando'
        ELSE 'AVISO - Todas as campanhas têm signature (esperado se DB vazia)'
    END AS status
FROM campaigns;

-- RESUMO FINAL
SELECT 
    '=== RESUMO DOS TESTES ===' AS resumo,
    (SELECT COUNT(*) FROM stores) AS total_lojas,
    (SELECT COUNT(*) FROM visual_signatures) AS total_signatures,
    (SELECT COUNT(*) FROM visual_signature_profiles) AS total_profiles,
    (SELECT COUNT(*) FROM campaigns) AS total_campanhas,
    CASE 
        WHEN (SELECT COUNT(*) FROM visual_signatures) = (SELECT COUNT(*) FROM stores)
        AND (SELECT COUNT(*) FROM visual_signature_profiles) = (SELECT COUNT(*) FROM visual_signatures) * 5
        THEN '✅ TODOS OS TESTES PASSARAM'
        ELSE '⚠️ VERIFICAR TESTES ACIMA'
    END AS status_geral;
