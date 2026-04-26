# Motor 3 Prompt V2 - Manual Benchmark Guide

Este guia orienta a execução do benchmark manual para validar o Prompt V2.

---

## 📋 Preparação

### 1. Servidor Rodando
```bash
npm run dev
```

### 2. Abrir Console do Navegador
- Abrir DevTools (F12)
- Aba "Console"
- Preparar para coletar logs

---

## 🧪 Protocolo de Teste

### Criar 20 Campanhas

Execute as campanhas abaixo **na ordem** e anote os resultados na tabela:

| # | Produto | Formato | Objetivo | Preço | Notas |
|---|---------|---------|----------|-------|-------|
| 1 | Coca-Cola 600ml | PNG | Promoção | 1.79 | - |
| 2 | Coca-Cola 2L | PNG | Lançamento | 4.99 | - |
| 3 | Refrigerante Guaraná 350ml | PNG | Promoção | 0.99 | - |
| 4 | Suco Del Valle 1L | PNG | Destaque | 3.49 | - |
| 5 | Água Mineral 500ml | PNG | Promoção | 0.79 | - |
| 6 | Cerveja Schin 350ml | WEBP | Promoção | 0.99 | - |
| 7 | Cerveja Heineken 330ml | WEBP | Destaque | 2.49 | - |
| 8 | Cerveja Skol Lata 350ml | WEBP | Promoção | 1.29 | - |
| 9 | Vinho Tinto 750ml | WEBP | Lançamento | 12.90 | - |
| 10 | Energético Red Bull 250ml | WEBP | Destaque | 4.99 | - |
| 11 | Kit Churrasco 3 itens | PNG | Promoção | 29.90 | Composto |
| 12 | Combo Família Refrigerante | WEBP | Promoção | 15.90 | Composto |
| 13 | Chocolate Lacta 90g | PNG | Destaque | 3.99 | - |
| 14 | Biscoito Cream Cracker | WEBP | Promoção | 2.49 | - |
| 15 | Produto Genérico Teste | PNG | Promoção | 9.99 | Edge case |
| 16 | Item Especial Premium | WEBP | Lançamento | 49.90 | Edge case |
| 17 | Leite Integral 1L | PNG | Promoção | 2.99 | - |
| 18 | Iogurte Grego 170g | WEBP | Destaque | 3.49 | - |
| 19 | Queijo Mussarela 500g | PNG | Promoção | 18.90 | - |
| 20 | Presunto Fatiado 200g | WEBP | Destaque | 7.99 | - |

---

## 📊 Coleta de Dados

### Para Cada Campanha, Anote:

1. **Motor 3 Time** (ms) - do log `[MOTOR-3][OUTPUT] { motor3_ms: XXXX }`
2. **Resultado**:
   - ✅ **SUCCESS** - Se `[MOTOR-3][VALIDATION]` apareceu
   - ⏱️ **TIMEOUT** - Se `[visual-composer] AI call failed Error: TIMEOUT` apareceu
   - ❌ **VALIDATION_FAIL** - Se `[MOTOR-3][VALIDATION-FAIL]` apareceu
3. **Variações** - Quantas variações foram geradas (esperado: 4)
4. **Observações** - Qualquer comportamento inesperado

---

## 📝 Template de Resultados

Copie e preencha:

```
## Test Results (20 campaigns)

| # | Product | Format | Motor3 Time | Result | Variations | Notes |
|---|---------|--------|-------------|--------|------------|-------|
| 1 | Coca-Cola 600ml | PNG | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 2 | Coca-Cola 2L | PNG | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 3 | Guaraná 350ml | PNG | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 4 | Suco Del Valle 1L | PNG | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 5 | Água 500ml | PNG | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 6 | Schin 350ml | WEBP | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 7 | Heineken 330ml | WEBP | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 8 | Skol 350ml | WEBP | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 9 | Vinho 750ml | WEBP | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 10 | Red Bull 250ml | WEBP | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 11 | Kit Churrasco | PNG | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 12 | Combo Família | WEBP | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 13 | Chocolate 90g | PNG | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 14 | Biscoito | WEBP | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 15 | Genérico | PNG | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 16 | Premium | WEBP | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 17 | Leite 1L | PNG | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 18 | Iogurte 170g | WEBP | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 19 | Queijo 500g | PNG | ___ms | ✅/⏱️/❌ | ___ | ___ |
| 20 | Presunto 200g | WEBP | ___ms | ✅/⏱️/❌ | ___ | ___ |

## Aggregated Metrics

- **Average Motor 3 Time:** ___ms (calcular média)
- **Timeout Rate:** ___/20 (___%)
- **Success Rate:** ___/20 (___%)
- **Fastest:** ___ms
- **Slowest:** ___ms
```

---

## 🎯 Critérios de Decisão

Após preencher, calcule:

### Métricas

| Critério | Valor Calculado | Target | Status |
|----------|-----------------|--------|--------|
| Tempo médio Motor 3 | ___ms | <15000ms | ✅/❌ |
| Taxa de timeout | ___% | <10% | ✅/❌ |
| Taxa de sucesso | ___% | >90% | ✅/❌ |

### Decisão

- **3/3 critérios ✅** → **GO** - Merge Prompt V2
- **2/3 critérios ✅** → **GO** - Merge Prompt V2 (com ressalvas)
- **≤1/3 critérios ✅** → **NO-GO** - Rollback, implementar Story 4.5.4

---

## 📄 Após Conclusão

1. Preencher `docs/analysis/motor-3-prompt-v2-benchmarks.md` com os dados
2. Compartilhar resultados com @aiox-master
3. Aguardar decisão GO/NO-GO
4. Se GO: Commit atômico + push (@devops)
5. Se NO-GO: Rollback + Story 4.5.4

---

**Tempo estimado:** 40-60 minutos (2-3 min por campanha)
