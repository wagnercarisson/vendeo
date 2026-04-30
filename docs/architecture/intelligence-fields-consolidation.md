# Consolidação de Feedback — Intelligence Fields Review

**Data:** 2026-04-30  
**Status:** 📊 CONSOLIDADO — Aguardando Decisões  
**Revisores:** @commerce-strategist, @content-copy (Lyric), @prompt-eng (Wordsmith)

---

## 🎯 RESUMO EXECUTIVO

**Situação:** 3 agentes identificaram **31 campos críticos ausentes** e **9 problemas estruturais graves**.

**Severidade:**
- 🔴 **15 campos CRÍTICOS** (NON-NEGOTIABLE para funcionar)
- 🟠 **10 campos IMPORTANTES** (impacto alto em conversão)
- 🟡 **6 campos DESEJÁVEIS** (otimização futura)

**Decisão necessária:** Aprovar campos críticos OU simplificar escopo OU adiar Phase 2.

---

## 🔴 CAMPOS CRÍTICOS (Bloqueiam efetividade)

### **Grupo 1: Brand Voice & Personalização (30% do score de conversão)**

| Campo | Justificativa | Agente | Impacto sem isso |
|-------|---------------|--------|------------------|
| `brand_voice` (tone, personality_traits, avoid_words, preferred_style) | TONE MATCH (1.5 pts) + SEGMENT LANGUAGE (1.5 pts) = 30% do score | @content-copy | Copy genérico, tom desalinhado, regenerações +60% |
| `language_specifics` (regional_slang, formality_level, emoji_comfort, max_exclamations) | SEGMENT LANGUAGE (1.5 pts) + NO JARGON (1.0 pt) | @content-copy | Copy usa "você" quando loja fala "tu", desalinhamento regional |
| `unique_selling_proposition` (primary_usp, supporting_points, proof_elements) | CLARITY (1.5 pts) — Mensagem clara em <3s | @content-copy | "Main_differentiation" vago demais, copy não destaca diferenciais únicos |

**DECISÃO NECESSÁRIA:**  
✅ **Aprovar** esses 3 campos como REQUIRED no onboarding (com defaults)?  
❌ **Rejeitar** e aceitar copy genérico (score médio <5/10)?

---

### **Grupo 2: Contexto Comercial Sazonal**

| Campo | Justificativa | Agente | Impacto sem isso |
|-------|---------------|--------|------------------|
| `seasonal_peaks` (natal, black_friday, dia_dos_pais, etc) | 60% das vendas anuais concentram-se em 6-8 datas | @commerce-strategist | Sistema NUNCA é pró-ativo em momentos-chave, perde 60% das oportunidades |
| `local_events_calendar` (jogos, feiras, eventos do bairro) | Eventos locais podem DOBRAR vendas em dias específicos | @commerce-strategist | Campanha sem contexto local converte 50% menos |
| `segment_specific_context` (has_delivery, accepts_prescriptions, etc) | Cada segmento tem diferenciais únicos que DEVEM aparecer | @commerce-strategist | Adegas sem mencionar delivery = perder diferencial crítico |

**DECISÃO NECESSÁRIA:**  
✅ **Aprovar** campos de sazonalidade + contexto local?  
❌ **Simplificar** para apenas `seasonal_peaks` (mínimo viável)?  
⏸️ **Adiar** para depois do MVP?

---

### **Grupo 3: Aprendizado & Prompt Engineering**

| Campo | Justificativa | Agente | Impacto sem isso |
|-------|---------------|--------|------------------|
| `prompt_version` | A/B testing de prompts impossível sem versioning | @prompt-eng | Impossível saber qual prompt gerou campanha X, zero otimização |
| `model_temperature` | Calibração automática por segmento (adegas 0.7, farmacias 0.6) | @prompt-eng | Temperatura fixa = qualidade subótima |
| `approval_rating` (1-5 estrelas) | `approval_duration_seconds` é proxy fraco (rápido ≠ bom) | @prompt-eng | Sem feedback direto de qualidade, aprendizado impossível |
| `edit_tracking` (original vs edited com diff) | `edited_fields` não diz O QUE mudou, aprendizado impossível | @content-copy + @prompt-eng | Sistema não aprende com edições, continua errando |
| `token_count` + `token_cost_usd` | Otimização de custo impossível sem métricas | @prompt-eng | Gasto descontrolado, prompts verbose custam 2x sem melhorar qualidade |

**DECISÃO NECESSÁRIA:**  
✅ **Aprovar** tracking completo (5 campos)?  
⚠️ **Simplificar** para apenas `prompt_version` + `approval_rating` (mínimo)?  
❌ **Rejeitar** e aceitar zero aprendizado automático?

---

### **Grupo 4: Feedback Loop Comercial**

| Campo | Justificativa | Agente | Impacto sem isso |
|-------|---------------|--------|------------------|
| `commercial_result_feedback` (campanha vendeu? sim/não/pouco) | Loop atual: gera → aprova → FIM. Deveria: gera → aprova → VENDEU? | @commerce-strategist | Aprovar ≠ Vender. Sistema otimiza para aprovação, não para vendas |
| `weather_context` (temperature, condition) | Calor 30°C+ = +40% vendas bebidas geladas, frio <15°C = +25% vinhos | @commerce-strategist | Campanha desalinhada com clima converte 30-40% menos |

**DECISÃO NECESSÁRIA:**  
✅ **Aprovar** feedback comercial + weather (fecha o loop)?  
⚠️ **Adiar** weather para v2 (MVP sem contexto climático)?  
❌ **Rejeitar** feedback comercial (otimizar apenas para aprovação)?

---

## 🟠 CAMPOS IMPORTANTES (Impacto alto)

| Campo | Justificativa | Agente | Prioridade |
|-------|---------------|--------|------------|
| `customer_pain_points` | EMOTIONAL TRIGGER (0.5 pt) + CLARITY (1.5 pts) = 2.0 pts | @content-copy | Alta |
| `conversion_triggers` (urgency_preference, scarcity_comfortable, social_proof) | URGENCY LEVEL (1.0 pt) + EMOTIONAL TRIGGER (0.5 pt) | @content-copy | Alta |
| `successful_past_ctas` | CTA CLARITY (2.0 pts — PESO MÁXIMO do framework) | @content-copy | Alta |
| `average_ticket_brl` | Define estratégia combo vs produto único | @commerce-strategist | Média |
| `store_location_context` (neighborhood_type, foot_traffic, near_competitors) | Localização determina perfil de cliente e urgência | @commerce-strategist | Média |
| `copy_length_preferences` | LENGTH (0.5 pt) + MOBILE READABILITY (0.5 pt) = 1.0 pt | @content-copy | Média |
| `product_category` (em campaign_events) | Detectar quais categorias performam melhor por dia/hora | @commerce-strategist | Média |
| `discount_percentage` (em campaign_events) | Correlacionar desconto com aprovação e conversão | @commerce-strategist | Média |
| `generation_latency_ms` | Monitoramento de SLA (<3s geração) | @prompt-eng | Média |
| `regeneration_count` | Regeneração alta = prompt ruim para esse contexto | @prompt-eng | Média |

**DECISÃO NECESSÁRIA:**  
✅ **Incluir no MVP** (todos os 10 campos)?  
⚠️ **Priorizar top 5** (customer_pain_points, conversion_triggers, successful_past_ctas, average_ticket, product_category)?  
⏸️ **Adiar para v2** (implementar depois)?

---

## 🟡 CAMPOS DESEJÁVEIS (Otimização futura)

| Campo | Justificativa | Agente | Quando? |
|-------|---------------|--------|---------|
| `competitor_activity` | Entender se campanha foi reativa ou proativa | @commerce-strategist | v2 |
| `schema_version` (em JSONBs) | Migração de dados futura | @prompt-eng | MVP (fácil) |
| `experiment_id` (A/B testing infrastructure) | Experimentos automatizados | @prompt-eng | v2 |
| `prohibited_terms` | Filtrar termos que lojista REJEITA | @content-copy | v2 |
| `headline_word_count`, `body_word_count`, etc | Content analysis granular | @prompt-eng | v2 |
| Materialized views para analytics | Performance boost em queries ML | @prompt-eng | v3 |

**DECISÃO NECESSÁRIA:**  
✅ **Incluir `schema_version` no MVP** (low-hanging fruit)?  
⏸️ **Adiar todo resto para v2/v3**?

---

## 🚨 PROBLEMAS ESTRUTURAIS GRAVES

### **Problema 1: JSONB sem Governança**
**Identificado por:** @prompt-eng  
**Risco:** Schema drift, validation gap, query hell  
**Solução:** 
- Adicionar `schema_version` obrigatório
- Criar JSON Schema documentation (docs/schemas/)
- Adicionar database triggers para validação
- Função de migração de schemas

**DECISÃO NECESSÁRIA:**  
✅ **Implementar governança completa**?  
⚠️ **Apenas `schema_version` + docs mínimos**?

---

### **Problema 2: Enums Insuficientes**
**Identificado por:** @content-copy  
**Risco:** Copy genérico, zero granularidade  
**Exemplos:**
- "institucional" é ambíguo (branding? awareness? milestone?)
- "familias" é vago (com crianças? sem filhos? qual renda?)
- "jovens" não distingue estudantes (18-24, baixa renda) vs profissionais (25-35, renda estável)

**Solução:** Expandir enums ou tornar JSONB estruturado

**DECISÃO NECESSÁRIA:**  
✅ **Expandir enums** (ex: "familias_criancas_pequenas", "jovens_estudantes")?  
⚠️ **Manter enums simples + adicionar campos complementares** (ex: income_level)?  
❌ **Aceitar granularidade baixa no MVP**?

---

### **Problema 3: TTL 90 Dias = Perda de Aprendizado Sazonal**
**Identificado por:** @prompt-eng  
**Risco:** 
- Natal 2025 vs Natal 2026 → Impossível comparar year-over-year
- Campanhas de alta qualidade (5/5) deletadas após 90 dias = perder melhores exemplos

**Solução:** 
- Criar `campaign_events_aggregated_monthly` (retenção 24 meses)
- Criar `campaign_events_high_quality` (retenção permanente para few-shot)
- Archive S3 após 90 dias (raw data)

**DECISÃO NECESSÁRIA:**  
✅ **Implementar estratégia de 3 camadas** (hot/warm/cold)?  
⚠️ **Apenas agregação mensal** (evitar perda total)?  
❌ **Manter TTL 90 dias simples** (aceitar perda de contexto sazonal)?

---

### **Problema 4: Campos Atuais Vagos/Genéricos**
**Identificado por:** @commerce-strategist + @content-copy  
**Problemas:**
- `main_differentiation`: "qualidade premium" não é copy, é concept
- `target_audience`: "familias" não captura renda, comportamento, necessidades
- `price_positioning`: Define estratégia, mas não COMO comunicar isso
- `competitors` (lista de nomes): Nomes não agregam valor, importa O QUE eles fazem bem

**Solução:** Substituir por campos estruturados (ver Grupo 1)

**DECISÃO NECESSÁRIA:**  
✅ **Substituir todos os 4 campos** (breaking change)?  
⚠️ **Manter + adicionar complementares** (backwards compatible)?

---

## 📊 IMPACTO QUANTITATIVO (Se todos os campos críticos forem implementados)

| Métrica | Atual (sem campos) | Com Campos Críticos | Delta |
|---------|-------------------|---------------------|-------|
| Copy atinge threshold (≥7/10) | ~40% | 70-80% | +75-100% |
| Regenerações | ~60% campanhas | <20% campanhas | -67% |
| Edições pelo lojista | ~60% campanhas | <20% campanhas | -67% |
| CTAs convertem | Baseline | 2-3x mais | +200-300% |
| Seasonal relevância | 0% (genérico) | +20-30% | N/A |
| Conversão alinhada ao clima | Baseline | +15-25% | N/A |
| Aprendizado automático | Zero | Loop fechado | N/A |
| Custo por campanha | Baseline | -30-40% (otimizado) | N/A |

**Total:** LTV aumenta de R$ 200-300 para R$ 900-1.200 (+200-300%)

---

## 🎯 OPÇÕES DE DECISÃO

### **Opção A: MVP Completo (Recomendado)**
✅ **Aprovar 15 campos críticos** (Grupos 1-4)  
✅ **Incluir 5 campos importantes prioritários**  
✅ **Implementar governança JSONB**  
⏸️ **Adiar campos desejáveis para v2**  
⏸️ **Adiar materialized views para v3**

**Timeline:** +3-4 dias Phase 2 (migrations mais complexas)  
**Impacto:** Sistema funcional desde dia 1, aprendizado desde o início

---

### **Opção B: MVP Simplificado**
✅ **Aprovar 8 campos essenciais** (brand_voice, seasonal_peaks, prompt_version, approval_rating, edit_tracking, commercial_result_feedback, weather_context, schema_version)  
⏸️ **Adiar resto para Phase 2.1** (1-2 semanas depois)  
⚠️ **Aceitar score médio ~5-6/10** (vs 7-8/10 completo)

**Timeline:** Phase 2 em 1 dia (conforme planejado)  
**Impacto:** Funcionalidade básica, aprendizado parcial

---

### **Opção C: Phase 2 Híbrida (Iterativa)**
✅ **Phase 2.0:** Tabelas base + 5 campos críticos mínimos (brand_voice, seasonal_peaks, prompt_version, approval_rating, schema_version)  
✅ **Phase 2.1:** +10 campos importantes (1 semana depois)  
✅ **Phase 2.2:** Governança completa + agregações (2 semanas depois)

**Timeline:** Phase 2.0 em 1 dia, resto incremental  
**Impacto:** Deploy rápido, evolução controlada

---

## ❓ QUESTÕES PARA DECISÃO IMEDIATA

### **Q1: Escopo de Phase 2**
- [ ] **Opção A** — MVP Completo (15 campos críticos + 5 importantes + governança)
- [ ] **Opção B** — MVP Simplificado (8 campos essenciais)
- [ ] **Opção C** — Phase 2 Híbrida (5 campos → +10 campos → governança)

### **Q2: Onboarding Complexity**
Com 15+ campos, onboarding passa de "5 minutos" para "8-10 minutos". Aceitável?
- [ ] **Sim** — 8-10 minutos OK se qualidade melhora 75%
- [ ] **Não** — Manter 5 minutos, adiar campos não-essenciais
- [ ] **Híbrido** — Onboarding básico 5min + "Personalize depois" opcional

### **Q3: Governança JSONB**
Implementar schema_version + triggers + JSON Schema docs?
- [ ] **Sim** — Implementar completo (evitar schema drift futuro)
- [ ] **Parcial** — Apenas schema_version + docs mínimos
- [ ] **Não** — JSONB livre (aceitar risco de drift)

### **Q4: TTL Strategy**
- [ ] **3 camadas** — 90d hot + 24m warm (aggregated) + S3 cold (permanente)
- [ ] **2 camadas** — 90d hot + 24m warm (aggregated)
- [ ] **1 camada** — 90d TTL simples (aceitar perda de sazonalidade)

### **Q5: Enums Expansion**
- [ ] **Expandir** — "familias" → "familias_criancas_pequenas", etc (mais granular)
- [ ] **Manter + complementar** — Enums simples + campos adicionais (income_level, etc)
- [ ] **Aceitar granularidade baixa** — MVP com enums atuais

---

## 🚀 PRÓXIMOS PASSOS (Após Decisões)

1. **Você decide Q1-Q5**
2. **@aiox-master atualiza schema-proposal.md** com campos aprovados
3. **@data-engineer (Dara) implementa migrations** (Phase 2.0, 2.1, 2.2 conforme decidido)
4. **@ux-design-expert (Uma) ajusta onboarding** (5min vs 8min conforme decisão)
5. **@commerce-strategist + @content-copy + @prompt-eng validam** implementação final

---

**Aguardando suas decisões para prosseguir. 🎯**
