# Logo IA Optimization - Roadmap Completo

**Criado:** 01 Mai 2026  
**Responsáveis:** @ux-design-expert (Uma), @analyst (Alex), @prompt-eng (Wordsmith), @dev (Dex)  
**Objetivo:** Melhorar approval rate de logos de 20% para 85%+ e reduzir custos em 80%

---

## 📊 CONTEXTO & DECISÃO ESTRATÉGICA

### Problema Atual
- **Approval rate:** ~20% (80% dos lojistas rejeitam os 3 logos gerados)
- **Qualidade:** Logos inutilizáveis (grids, abstrações, mock-ups)
- **Custo:** $0.12/geração (DALL-E 3)
- **Impacto UX:** Frustração, perda de confiança, churn risk

### Pesquisa Realizada
- **@analyst:** Comparativo de 8 plataformas (DALL-E, Flux, Ideogram, Recraft, Midjourney)
- **Resultado:** Flux Schnell (92% economia) + Recraft V3 (qualidade premium)
- **Estratégia escolhida:** **Hybrid Approach** (Opção B)

### Estratégia Hybrid (Aprovada)
1. **Primeira geração:** Flux Schnell ($0.009) - rápido + econômico
2. **Regeneração:** Recraft V3 ($0.12) - qualidade premium
3. **Custo médio:** $0.024 (-80% vs atual)
4. **Target approval:** 85%+ final (80% Flux + 95% Recraft)

---

## 🎯 MÉTRICAS DE SUCESSO

### Baseline (ANTES)
```
Approval rate: ~20%
Regeneration rate: ~60%
Time to approval: >2 min
NPS (Logo feature): -40 (hipótese)
Custo/geração: $0.12
```

### Target (APÓS - Sprint 3)
```
Approval rate: ≥85% (+325%)
Regeneration rate: ≤15% (-75%)
Time to approval: <30s (-75%)
NPS (Logo feature): +20 (+60 pts)
Custo médio: $0.024 (-80%)
```

---

## 📅 SPRINT 1: Prompt Refinement + Flux Testing (Semana 1)

### Objetivos
- [x] Refinar prompts DALL-E 3 com @prompt-eng
- [x] Testar Flux Schnell em paralelo
- [x] Comparar qualidade lado a lado

### Tarefas

#### 1.1 Prompt Refinement (@prompt-eng)
**Duração:** 2-3 horas  
**Artefato:** `prompt-refinement-brief.md` (entregue)  
**Deliverable:** `logo-prompts-v2.ts` com prompts refinados

**Vulnerabilidades a corrigir:**
1. ❌ "a bottle, glass, OR refreshment symbol" → Gera MÚLTIPLOS elementos
2. ❌ "Simple geometric shapes" (plural) → Interpreta como "many shapes"
3. ❌ "suitable for social media" → Gera post/mockup
4. ❌ Falta "no mockups" → Gera cartões de visita
5. ❌ Falta "single unified icon" → Permite grids/painéis
6. ❌ Falta "centered composition" → Logos desbalanceados

**Target:** +50% approval (de 20% para 30-40%)

#### 1.2 Flux Schnell Integration (Paralelo)
**Responsável:** @dev  
**Duração:** 2-3 horas  
**Stack:** Replicate API

**Implementação:**
```typescript
// app/api/ai/generate-logo-flux/route.ts (novo endpoint)
const response = await fetch("https://api.replicate.com/v1/predictions", {
  method: "POST",
  headers: { "Authorization": `Token ${process.env.REPLICATE_API_KEY}` },
  body: JSON.stringify({
    version: "black-forest-labs/flux-schnell",
    input: {
      prompt: optimizedPrompt,
      num_outputs: 1,
      aspect_ratio: "1:1"
    }
  })
});
```

**Ambiente:** Criar em paralelo, não substituir DALL-E ainda

#### 1.3 A/B Testing
**Duração:** 1-2 dias  
**Método:** Gerar 6 logos (3 DALL-E + 3 Flux) com MESMOS prompts refinados  
**Segmentos testados:** 2-3 segmentos (ex: Loja de bebidas, Farmácia, Mercearia)

**Critérios de aprovação Flux:**
- [ ] Qualidade visual ≥ DALL-E 3
- [ ] Prompt adherence equivalente
- [ ] Nenhum logo com grids/mockups/abstrações nonsense
- [ ] Aprovação @ux-design-expert: ≥7/10

### Deliverables Sprint 1
- [ ] `lib/ai/logo-prompts-v2.ts` (prompts refinados)
- [ ] `app/api/ai/generate-logo-flux/route.ts` (endpoint Flux)
- [ ] `docs/ux/logo-ia-optimization/sprint1-comparison.md` (resultados A/B)
- [ ] Decisão: GO/NO-GO para Sprint 2

### Decisão GO/NO-GO
**GO se:**
- Flux Schnell qualidade ≥ DALL-E 3
- Prompts refinados melhoram approval em +30%+
- Zero blockers técnicos

**NO-GO se:**
- Flux qualidade inferior em 2+ segmentos
- Prompts refinados não melhoram approval
- Replicate API instável

---

## 📅 SPRINT 2: Hybrid Strategy Implementation (Semana 2-3)

### Pré-requisitos
- ✅ Sprint 1 aprovado (GO decision)
- ✅ Flux Schnell validado como equivalente/superior

### Objetivos
- [ ] Implementar lógica Hybrid (Flux → Recraft fallback)
- [ ] Integrar Recraft V3 API
- [ ] Deploy em produção com feature flag
- [ ] Monitoring + alertas

### Tarefas

#### 2.1 Recraft V3 Integration
**Responsável:** @dev  
**Duração:** 3-4 horas

**Implementação:**
```typescript
// app/api/ai/generate-logo-recraft/route.ts (novo endpoint)
const response = await fetch("https://api.replicate.com/v1/predictions", {
  method: "POST",
  headers: { "Authorization": `Token ${process.env.REPLICATE_API_KEY}` },
  body: JSON.stringify({
    version: "recraft-ai/recraft-v3",
    input: {
      prompt: optimizedPrompt,
      num_outputs: 1,
      size: "1024x1024"
    }
  })
});
```

#### 2.2 Hybrid Logic (Smart Router)
**Responsável:** @dev  
**Duração:** 4-6 horas

**Lógica:**
```typescript
// app/api/ai/generate-logo/route.ts (atualizado)
async function generateLogos(request: LogoRequest, attempt: number) {
  // Primeira geração: Flux Schnell (rápido + barato)
  if (attempt === 1) {
    return generateWithFluxSchnell(request);
  }
  
  // Regeneração: Recraft V3 (premium quality)
  if (attempt === 2) {
    return generateWithRecraftV3(request);
  }
  
  // 3+ tentativas: Cap em Recraft (evitar abuso)
  if (attempt >= 3) {
    return { 
      error: "Limite de regenerações atingido. Entre em contato se precisar de ajuda." 
    };
  }
}
```

**Tracking:**
- Armazenar `generation_attempt` em `logo_generations` table
- Incrementar a cada "Gerar novos logos"
- Reset após logo salvo

#### 2.3 UI Updates
**Responsável:** @dev  
**Duração:** 2-3 horas

**Mudanças no `LogoGeneratorModal.tsx`:**
1. Loading state diferente para Flux (5-10s) vs Recraft (15-20s)
2. Badge "Qualidade Premium" quando Recraft ativa
3. Mensagem: "Gerando com nossa melhor IA..." (attempt ≥2)

**Não comunicar técnica (Flux/Recraft) ao lojista** - apenas "IA melhorada"

#### 2.4 Feature Flag
**Responsável:** @dev  
**Duração:** 1 hora

```typescript
// lib/constants/feature-flags.ts
export const FEATURE_FLAGS = {
  HYBRID_LOGO_GENERATION: process.env.NEXT_PUBLIC_ENABLE_HYBRID_LOGO === "true",
  // Rollback fácil se necessário
};
```

#### 2.5 Monitoring & Alertas
**Responsável:** @dev + @devops  
**Duração:** 2-3 horas

**Métricas rastreadas:**
- `logo_approval_rate` (% que clica "Usar este logo" sem regenerar)
- `logo_regeneration_rate` (% que clica "Gerar novos logos")
- `logo_generation_cost_avg` (custo médio por geração)
- `logo_time_to_approval` (tempo até seleção)
- `logo_model_used` (Flux vs Recraft distribuição)

**Alertas:**
- Approval rate < 60% (2 dias consecutivos)
- Regeneration rate > 40% (abuso ou qualidade ruim)
- Recraft usage > 30% (custo acima do esperado)

### Deliverables Sprint 2
- [ ] `app/api/ai/generate-logo-recraft/route.ts`
- [ ] `app/api/ai/generate-logo/route.ts` (hybrid logic)
- [ ] `components/LogoGeneratorModal.tsx` (UI updates)
- [ ] `database/migrations/XXX_add_generation_attempt.sql`
- [ ] Feature flag configurado
- [ ] Monitoring dashboard (Supabase/external)
- [ ] Deploy produção com flag OFF

### Rollout Strategy
**Fase 2.1:** Feature flag ON para 10% usuários (3 dias)  
**Fase 2.2:** Se métricas OK → 50% usuários (3 dias)  
**Fase 2.3:** Se métricas OK → 100% usuários  
**Rollback:** Feature flag OFF (imediato se problemas)

---

## 📅 SPRINT 3: Validation & Optimization (Semana 4+)

### Objetivos
- [ ] Validar com lojistas reais (usability testing)
- [ ] Ajustar prompts baseado em feedback
- [ ] Otimizar custos (se Recraft > 30% usage)
- [ ] Documentar learnings

### Tarefas

#### 3.1 Usability Testing
**Responsável:** @ux-design-expert  
**Duração:** 1 semana  
**Método:** 5-10 lojistas reais (não-tech-savvy)

**Perfis testados:**
- Adega (Tom popular)
- Farmácia (Tom profissional)
- Mercearia (Tom próximo/bairro)
- Açougue (Tom direto)
- Salão Beleza (Tom premium)

**Protocolo:**
1. **Task:** "Crie um logo para sua loja usando a IA"
2. **Observação:** Onde hesitam? Quantas regenerações?
3. **Satisfação:** Escala 1-10, NPS

**Critérios de sucesso:**
- [ ] 80%+ aprovam logo sem ajuda
- [ ] Time to approval < 1 minuto
- [ ] NPS ≥ +20

#### 3.2 Prompt Optimization (Iteração 2)
**Responsável:** @prompt-eng  
**Duração:** 2-3 horas

**Baseado em:**
- Feedback lojistas (usability testing)
- Logs de regeneração (quais segmentos falham mais?)
- Comparação Flux vs Recraft (onde Recraft salvou?)

**Ajustes esperados:**
- Refinar prompts de segmentos com baixa aprovação
- Adicionar constraints específicos (ex: açougue = cores quentes)
- Testar variações de tom (premium vs popular)

#### 3.3 Cost Optimization
**Responsável:** @pm + @ux-design-expert  
**Duração:** Análise 1-2 dias

**Cenários:**

**SE Recraft usage > 30%:**
- Investigar: Flux falha consistente em algum segmento?
- Opção A: Melhorar prompts Flux para reduzir regenerações
- Opção B: Usar Recraft direto em segmentos específicos (ex: premium)
- Opção C: Adicionar terceiro modelo intermediário (Flux Dev - $0.025)

**SE Recraft usage < 20%:**
- ✅ Hybrid funcionando perfeitamente
- Considerar: Aumentar cap de regenerações (3 → 5)

#### 3.4 Documentation & Knowledge Base
**Responsável:** @ux-design-expert + @pm  
**Duração:** 1-2 dias

**Documentos a criar:**
- `docs/ux/logo-ia-optimization/LESSONS-LEARNED.md`
- `docs/ux/logo-ia-optimization/PROMPT-GUIDELINES.md` (para futuras iterações)
- `docs/ux/logo-ia-optimization/LOJISTA-FEEDBACK.md` (compilado de testes)

### Deliverables Sprint 3
- [ ] Relatório usability testing (5-10 lojistas)
- [ ] `lib/ai/logo-prompts-v3.ts` (se necessário ajuste)
- [ ] Decisão sobre cost optimization (se Recraft > 30%)
- [ ] Documentação completa (3 arquivos acima)
- [ ] Apresentação de resultados (stakeholders)

---

## 📊 KPIs & TRACKING

### Daily Metrics (Supabase Dashboard)
```sql
-- Approval Rate (últimos 7 dias)
SELECT 
  COUNT(CASE WHEN selected_logo_url IS NOT NULL AND generation_attempt = 1 THEN 1 END)::float / 
  COUNT(*) * 100 AS approval_rate_first_attempt
FROM logo_generations
WHERE generated_at >= NOW() - INTERVAL '7 days';

-- Regeneration Rate
SELECT 
  COUNT(CASE WHEN generation_attempt > 1 THEN 1 END)::float / 
  COUNT(*) * 100 AS regeneration_rate
FROM logo_generations
WHERE generated_at >= NOW() - INTERVAL '7 days';

-- Custo médio
SELECT AVG(cost_usd) AS avg_cost
FROM logo_generations
WHERE generated_at >= NOW() - INTERVAL '7 days';

-- Distribuição de modelos
SELECT 
  model_used,
  COUNT(*) AS usage_count,
  AVG(cost_usd) AS avg_cost
FROM logo_generations
WHERE generated_at >= NOW() - INTERVAL '7 days'
GROUP BY model_used;
```

### Weekly Review (Toda segunda-feira)
- [ ] Approval rate vs target (85%)
- [ ] Regeneration rate vs target (15%)
- [ ] Custo médio vs budget ($0.024)
- [ ] NPS trend
- [ ] Recraft usage % (ideal: 20-30%)

### Monthly Review (First week)
- [ ] ROI consolidado (economia real vs projeção)
- [ ] Quality feedback compilation
- [ ] Segmentos com baixa performance
- [ ] Roadmap ajustments

---

## 🚨 RISCOS & MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| **Flux não resolve qualidade** | Médio | Alto | Hybrid com Recraft como fallback ✅ |
| **Prompt refinement insuficiente** | Alto | Alto | Iteração 2 em Sprint 3 + @prompt-eng |
| **Recraft usage > 50%** | Baixo | Médio | Cost optimization em Sprint 3 |
| **Lojista não percebe melhoria** | Baixo | Médio | UI comunicar "IA melhorada" |
| **Replicate API instável** | Baixo | Alto | Rollback para DALL-E (feature flag) |
| **Regeneration abuse** | Baixo | Baixo | Cap em 3 regenerações |
| **Aprovação < 70%** | Médio | Alto | Priorizar Recraft direto (Opção C) |

---

## 💰 ROI PROJECTION

### Investimento
- **Sprint 1:** 8h (@prompt-eng 3h + @dev 5h) = ~$400
- **Sprint 2:** 20h (@dev 18h + @devops 2h) = ~$1,000
- **Sprint 3:** 10h (@ux-design-expert 6h + @prompt-eng 2h + docs 2h) = ~$500
- **Total:** ~$1,900

### Retorno (1 ano, 500 gerações/mês)
- **Economia de custo:** $55.50/mês × 12 = $666/ano
- **Churn reduction:** ~5 lojistas/mês × $20 LTV = $1,200/ano
- **NPS impact → Referrals:** ~2 novos lojistas/mês × $50 = $1,200/ano
- **Total benefício:** ~$3,066/ano

**ROI:** 61% (payback em ~7 meses)

---

## 📝 DECISÕES & APPROVALS

| Decisão | Data | Responsável | Status |
|---------|------|-------------|--------|
| Escolha Hybrid Strategy (Opção B) | 01 Mai 2026 | @ux-design-expert + @analyst | ✅ APROVADA |
| GO Sprint 1 (Prompt + Flux) | 01 Mai 2026 | @ux-design-expert | ✅ APROVADA |
| GO Sprint 2 (Hybrid implementation) | TBD | @ux-design-expert + @dev | ⏳ AGUARDANDO Sprint 1 |
| GO Sprint 3 (Validation) | TBD | @pm | ⏳ AGUARDANDO Sprint 2 |

---

## 📞 PONTOS DE CONTATO

| Sprint | Primary | Support | Stakeholders |
|--------|---------|---------|--------------|
| Sprint 1 | @prompt-eng | @dev, @ux-design-expert | @pm |
| Sprint 2 | @dev | @devops, @ux-design-expert | @pm |
| Sprint 3 | @ux-design-expert | @prompt-eng, @analyst | @pm, Product team |

---

## ✅ CHECKLIST DE CONCLUSÃO

### Sprint 1
- [ ] Prompts refinados testados (DALL-E 3 melhora +30%+)
- [ ] Flux Schnell integrado e validado (qualidade ≥ DALL-E)
- [ ] Decisão GO/NO-GO documentada

### Sprint 2
- [ ] Hybrid logic implementado e testado
- [ ] Feature flag configurado + rollout gradual
- [ ] Monitoring dashboard operacional
- [ ] Deploy produção 100% usuários

### Sprint 3
- [ ] Usability testing completo (5-10 lojistas)
- [ ] Métricas validadas (approval ≥85%, regen ≤15%)
- [ ] Documentação completa
- [ ] Apresentação de resultados

---

**Última atualização:** 01 Mai 2026  
**Próxima revisão:** Após Sprint 1 (estimado: 08 Mai 2026)
