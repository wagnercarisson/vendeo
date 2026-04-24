# Visual Reader — Documentação Completa (Master Index)

**Data:** 23/04/2026  
**Preparação para:** Story 4.1 — Motor de Leitura Visual  
**Status:** ✅ Pronto para Desenvolvimento

---

## 📚 Documentos Criados

Esta análise completa está dividida em 4 documentos especializados:

### 1. 📋 [VISUAL-READER-FIELDS-ANALYSIS.md](./VISUAL-READER-FIELDS-ANALYSIS.md)
**O QUE É:** Análise detalhada e completa de TODOS os 24 campos do Visual Reader

**QUANDO USAR:**
- Precisa entender em profundidade cada campo (entrada/saída)
- Quer saber de onde vem cada campo e para que é usado
- Está implementando validações ou normalizações
- Precisa justificar decisões técnicas

**CONTEÚDO:**
- ✅ 6 campos de entrada (origem, validação, uso)
- ✅ 24 campos de saída (criticidade, uso, exemplos)
- ✅ Campos obsoletos/redundantes identificados
- ✅ Fluxo completo: Entrada → Saída → Consumo
- ✅ Resumo de criticidade (CRÍTICO/IMPORTANTE/SECUNDÁRIO)

**TAMANHO:** ~4.500 linhas  
**FORMATO:** Documentação detalhada com exemplos práticos

---

### 2. ⚡ [VISUAL-READER-QUICK-REFERENCE.md](./VISUAL-READER-QUICK-REFERENCE.md)
**O QUE É:** Referência rápida em formato de tabelas

**QUANDO USAR:**
- Está codificando e precisa consultar rapidamente um campo
- Quer ver a visão geral em um único documento
- Precisa lembrar quais campos são críticos
- Está escrevendo testes e quer ver fixtures obrigatórias

**CONTEÚDO:**
- ✅ Tabela de entrada (6 campos)
- ✅ Tabela de saída (24 campos em 6 categorias)
- ✅ Top 7 campos mais importantes
- ✅ Regras de normalização pós-modelo
- ✅ 10 fixtures de teste obrigatórias

**TAMANHO:** ~400 linhas  
**FORMATO:** Tabelas e listas estruturadas

---

### 3. 🛠️ [VISUAL-READER-RECOMMENDATIONS.md](./VISUAL-READER-RECOMMENDATIONS.md)
**O QUE É:** Decisões técnicas e recomendações de implementação

**QUANDO USAR:**
- Está iniciando a implementação da Story 4.1
- Quer saber o que REMOVER, MANTER ou MELHORAR
- Precisa entender validações obrigatórias
- Quer saber métricas de sucesso e checklist pré-release

**CONTEÚDO:**
- ❌ Remoções recomendadas (`hasBackground`, `content_type`)
- ✅ Melhorias obrigatórias (validações cruzadas)
- 🧪 10 fixtures prioritárias para testes
- 📏 Métricas de sucesso (acurácia, latência, cache)
- 🔒 Checklist de qualidade pré-release
- 🚀 Roadmap de melhorias futuras

**TAMANHO:** ~600 linhas  
**FORMATO:** Listas de ações e decisões técnicas

---

### 4. 🎨 [VISUAL-READER-FLOW-DIAGRAM.md](./VISUAL-READER-FLOW-DIAGRAM.md)
**O QUE É:** Diagramas visuais do fluxo completo de dados

**QUANDO USAR:**
- Quer entender o fluxo end-to-end
- Precisa explicar o sistema para outro desenvolvedor
- Está debugando e quer ver todas as etapas
- Quer entender casos de uso específicos (PNG transparente, lifestyle, etc.)

**CONTEÚDO:**
- 🔄 Fluxo completo: Frontend → Workflow → Motor 1 → Motor 2-4
- ⚙️ Detalhamento das 4 etapas internas do Visual Reader
- 🔀 4 casos de uso principais (PNG transparente, lifestyle, múltiplos, sem match)
- ⚡ Cache e otimizações de performance
- 🛡️ Error handling e fallback graceful
- 📊 Eventos de log e observabilidade

**TAMANHO:** ~550 linhas  
**FORMATO:** Diagramas ASCII + explicações

---

## 🎯 GUIA DE USO RÁPIDO

### Se você quer...

| Objetivo | Documento | Seção |
|----------|-----------|-------|
| **Entender um campo específico** | FIELDS-ANALYSIS | Buscar pelo nome do campo |
| **Ver lista de todos os campos** | QUICK-REFERENCE | Tabelas de entrada/saída |
| **Saber o que remover/melhorar** | RECOMMENDATIONS | Remoções + Melhorias |
| **Criar testes** | QUICK-REFERENCE ou RECOMMENDATIONS | Fixtures obrigatórias |
| **Debugar normalização** | FLOW-DIAGRAM | Etapa 4: Normalização |
| **Entender casos de uso** | FLOW-DIAGRAM | Casos 1-4 |
| **Implementar cache** | FLOW-DIAGRAM | Cache de análises |
| **Saber métricas de sucesso** | RECOMMENDATIONS | Métricas de sucesso |

---

## 🚦 STATUS DAS DECISÕES

### ✅ APROVADO para Story 4.1

1. **Remover** `hasBackground` (saída) — REDUNDANTE com `backgroundType`
2. **Manter** `content_type` (entrada) — Reavaliar na Story 4.2
3. **Adicionar** validação cruzada `backgroundType` ↔ `backgroundNoise`
4. **Adicionar** validação `relevantCount` ↔ `ignoredElements`
5. **Fortalecer** validação `matchType=category_only` → `targetBox` obrigatória
6. **Implementar** 10 fixtures de teste obrigatórias
7. **Garantir** latência <2s p95 (sem cache), <500ms p95 (com cache)

### ⏭️ PENDENTE para Stories futuras

1. Avaliar consolidação `focusClarity` + `imageQuality`
2. Implementar cache distribuído (Redis/Upstash) se necessário
3. Multi-model fallback (GPT-4o + Claude Opus)
4. Progressive enhancement (análise básica rápida + enriquecimento async)

---

## 📊 RESUMO EXECUTIVO

### Campos de Entrada (6)

| Campo | Status | Notas |
|-------|--------|-------|
| `imageUrl` | ✅ Obrigatório | URL pública da imagem |
| `targetLabel` | ✅ Obrigatório | Categoria genérica |
| `productName` | ✅ Opcional | Nome específico (match exact vs category) |
| `category` | ✅ Opcional | Contexto adicional |
| `campaignType` | ✅ Opcional | single_product / multiple_products / info |
| `content_type` | ⚠️ Deprecado | Redundante — manter temporariamente |

### Campos de Saída (24 → 23 após remoção de `hasBackground`)

| Categoria | Campos | Críticos | Importantes | Secundários |
|-----------|--------|----------|-------------|-------------|
| **Match Detection** | 6 | 3 (detected, matchType, sceneType) | 1 (matchedTarget) | 2 (confidence, relevantCount) |
| **Spatial** | 5 | 2 (targetBox, targetOccupancy) | 3 (orientation, position, ignoredElements) | 0 |
| **Quality** | 4 | 1 (backgroundNoise) | 2 (visibility, framing) | 1 (imageQuality) |
| **Background** | 1 | 1 (backgroundType) | 0 | 0 |
| **Crop Potential** | 4 | 0 | 3 (subjectCutoff, safeExpansionPotential, visualIsolation) | 1 (focusClarity) |
| **Metadata** | 1 | 0 | 0 | 1 (reasoningSummary) |
| **TOTAL** | **21** | **7** | **9** | **5** |

*(Removido: hasBackground, focusClarity movido para secundário)*

---

## 🔍 CAMPOS MAIS IMPORTANTES (Top 7)

1. 🔴 **`backgroundType`** — DECISÃO PRINCIPAL de composição
2. 🔴 **`detected`** — Se produto exato foi encontrado
3. 🔴 **`matchType`** — Nível de correspondência (exact/category_only/none)
4. 🔴 **`targetBox`** — Coordenadas para crop
5. 🔴 **`sceneType`** — Tipo de cena (single/multiple/lifestyle/full)
6. 🔴 **`targetOccupancy`** — Quanto da imagem o produto ocupa
7. 🔴 **`backgroundNoise`** — Complexidade do fundo

**Regra:** Esses 7 campos NUNCA podem retornar `"unknown"` — devem sempre ter valor inferido.

---

## 🧪 FIXTURES OBRIGATÓRIAS (10)

1. PNG transparente (produto isolado)
2. Produto único em fundo sólido
3. Múltiplos produtos
4. Lifestyle (contexto de uso)
5. Match por categoria (marca diferente)
6. Sem match
7. Produto cortado nas bordas
8. Imagem de baixa qualidade
9. Full scene (loja/ambiente)
10. Produto + combo (múltiplos no productName)

**Cada fixture deve validar:** Input → Output esperado → Normalização → Resultado final

---

## 📏 MÉTRICAS DE SUCESSO

| Métrica | Target | Como Medir |
|---------|--------|------------|
| **Acurácia de detecção** | >90% | `detected=true` quando produto exato presente |
| **Acurácia de backgroundType** | >95% | Classificação correta de transparent/solid/complex |
| **Acurácia de targetBox** | >85% | Box contém produto com margem adequada |
| **Latência (sem cache)** | <2s p95 | Tempo de resposta da API OpenAI |
| **Latência (com cache)** | <500ms p95 | Lookup no Supabase/Redis |
| **Taxa de cache hit** | >60% | % de análises servidas do cache |
| **Taxa de fallback** | <5% | % de retornos com DEFAULT_VISUAL_READER_OUTPUT |

---

## 🔒 CHECKLIST PRÉ-RELEASE

- [ ] ✅ Todos os 10 fixtures testados e aprovados
- [ ] ✅ Schema Zod validando 100% dos outputs do modelo
- [ ] ✅ Normalização pós-modelo corrigindo inconsistências
- [ ] ✅ Cache implementado (Supabase ou Redis)
- [ ] ✅ Latência p95 < 2s (sem cache)
- [ ] ✅ Latência p95 < 500ms (com cache)
- [ ] ✅ Logs estruturados para debug
- [ ] ✅ Error handling robusto (fallback graceful)
- [ ] ✅ Endpoint `/api/analyze/image` funcional
- [ ] ✅ Documentação atualizada

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ **Análise completa** — CONCLUÍDA (este documento)
2. ⏭️ **Story 4.1:** Implementar `readVisualTarget()` com todas as validações
3. ⏭️ **Story 4.2:** Intent Resolver consome `ImageProfile`
4. ⏭️ **Story 4.3:** Visual Composer gera variações
5. ⏭️ **Story 4.4:** Renderer compõe arte final
6. ⏭️ **Story 4.5:** Visual Signature System
7. ⏭️ **Story 4.6:** Integração com Weekly Plan

---

## 📞 SUPORTE

**Dúvidas sobre:**
- Campos específicos → `VISUAL-READER-FIELDS-ANALYSIS.md`
- Implementação → `VISUAL-READER-RECOMMENDATIONS.md`
- Fluxo/casos de uso → `VISUAL-READER-FLOW-DIAGRAM.md`
- Referência rápida → `VISUAL-READER-QUICK-REFERENCE.md`

**Todas as decisões técnicas foram aprovadas por @aiox-master + Product Owner em 23/04/2026.**

---

✅ **APROVADO PARA INÍCIO DA STORY 4.1**

---

*Master Index — Documentação Completa do Visual Reader*  
*@aiox-master — 23/04/2026*
