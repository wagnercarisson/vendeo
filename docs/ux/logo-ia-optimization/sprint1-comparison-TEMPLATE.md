# Sprint 1 - Comparação A/B: DALL-E v1 vs v2 vs Flux Schnell

**Data de execução:** [TBD]  
**Responsáveis:** @prompt-eng (prompts v2) + @dev (Flux integration)  
**Avaliador:** @ux-design-expert (Uma)  
**Status:** 🟡 TEMPLATE - Aguardando execução

---

## 📋 METODOLOGIA

### Segmentos Testados
1. **Loja de bebidas** (Comercial Teste Beta)
2. **Farmácia** (Farmácia Saúde & Vida)
3. **Mercearia** (Mercadinho do Bairro)

**Justificativa:** Segmentos com alta diversidade visual + representativos do público Vendeo

### Configuração de Teste

#### DALL-E 3 v1 (Baseline)
- **Prompt:** Template atual (`lib/ai/logo-prompts.ts`)
- **Modelo:** DALL-E 3 (OpenAI)
- **Parâmetros:** `quality: "standard"`, `size: "1024x1024"`, `style: "natural"`
- **Custo:** $0.04/imagem × 3 = $0.12/segmento
- **Total gerações:** 9 logos (3 segmentos × 3 logos cada)

#### DALL-E 3 v2 (Prompts Refinados)
- **Prompt:** Template refinado (`lib/ai/logo-prompts-v2.ts`)
- **Modelo:** DALL-E 3 (OpenAI)
- **Parâmetros:** Idênticos a v1
- **Custo:** $0.04/imagem × 3 = $0.12/segmento
- **Total gerações:** 9 logos

#### Flux Schnell (Novo Modelo)
- **Prompt:** MESMO template refinado (v2)
- **Modelo:** Flux Schnell (via Replicate)
- **Parâmetros:** `aspect_ratio: "1:1"`, `num_outputs: 1`
- **Custo:** $0.003/imagem × 3 = $0.009/segmento
- **Total gerações:** 9 logos

**Custo total teste:** $0.12 + $0.12 + $0.009 = $0.249 (~27 logos gerados)

---

## 🎯 CRITÉRIOS DE AVALIAÇÃO

### Escala de Score (1-10)

#### 1-3: INUTILIZÁVEL
- Grid/painel com múltiplos logos
- Abstrações sem conexão visual
- Mock-ups (cartões de visita, posts)
- Texto/letras dentro do logo

#### 4-6: UTILIZÁVEL MAS PROBLEMÁTICO
- Logo funcional mas genérico
- Desbalanceado ou não escalável
- Não representa bem o segmento
- Cores inadequadas

#### 7-8: BOM
- Logo profissional e utilizável
- Representa o segmento adequadamente
- Escalável e balanceado
- Pequenos ajustes desejáveis

#### 9-10: EXCELENTE
- Logo premium, surpreende positivamente
- Perfeita representação do segmento
- Zero ajustes necessários
- Lojista aprovaria imediatamente

### Checklist por Logo

- [ ] **Único:** É UM logo, não grid/painel
- [ ] **Isolado:** Sem mockups, cartões, posts
- [ ] **Sem texto:** Zero letras/palavras dentro
- [ ] **Coeso:** Elementos visualmente conectados
- [ ] **Escalável:** Funciona em 32px e 512px
- [ ] **Balanceado:** Composição centralizada
- [ ] **Adequado:** Representa o segmento
- [ ] **Cores apropriadas:** Paleta adequada ao segmento
- [ ] **Profissional:** Não parece "feito por IA genérica"

---

## 📊 RESULTADOS - DALL-E 3 v1 (Baseline)

### Segmento 1: Loja de bebidas (Comercial Teste Beta)

#### Logo 1.1
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** 
  - [ ] Único
  - [ ] Isolado
  - [ ] Sem texto
  - [ ] Coeso
  - [ ] Escalável
  - [ ] Balanceado
  - [ ] Adequado
  - [ ] Cores
  - [ ] Profissional
- **Problemas identificados:**
  - [Descrever problemas]
- **Observações:**
  - [Notas qualitativas]

#### Logo 1.2
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Problemas:** [...]
- **Observações:** [...]

#### Logo 1.3
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Problemas:** [...]
- **Observações:** [...]

**Score médio Loja de bebidas (v1):** __/10

---

### Segmento 2: Farmácia (Farmácia Saúde & Vida)

#### Logo 2.1
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Problemas:** [...]
- **Observações:** [...]

#### Logo 2.2
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Problemas:** [...]
- **Observações:** [...]

#### Logo 2.3
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Problemas:** [...]
- **Observações:** [...]

**Score médio Farmácia (v1):** __/10

---

### Segmento 3: Mercearia (Mercadinho do Bairro)

#### Logo 3.1
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Problemas:** [...]
- **Observações:** [...]

#### Logo 3.2
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Problemas:** [...]
- **Observações:** [...]

#### Logo 3.3
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Problemas:** [...]
- **Observações:** [...]

**Score médio Mercearia (v1):** __/10

---

### DALL-E 3 v1 - Resumo Consolidado

| Métrica | Resultado |
|---------|-----------|
| **Score médio geral** | __/10 |
| **Logos utilizáveis (≥7)** | __/9 (___%) |
| **Grids/Painéis** | __/9 |
| **Mock-ups** | __/9 |
| **Abstrações nonsense** | __/9 |
| **Texto dentro** | __/9 |

**Principais problemas recorrentes:**
1. [...]
2. [...]
3. [...]

---

## 📊 RESULTADOS - DALL-E 3 v2 (Prompts Refinados)

### Segmento 1: Loja de bebidas (Comercial Teste Beta)

#### Logo 1.1 (v2)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Melhorias vs v1:** [...]
- **Observações:** [...]

#### Logo 1.2 (v2)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Melhorias vs v1:** [...]
- **Observações:** [...]

#### Logo 1.3 (v2)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Melhorias vs v1:** [...]
- **Observações:** [...]

**Score médio Loja de bebidas (v2):** __/10

---

### Segmento 2: Farmácia (Farmácia Saúde & Vida)

#### Logo 2.1 (v2)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Melhorias vs v1:** [...]
- **Observações:** [...]

#### Logo 2.2 (v2)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Melhorias vs v1:** [...]
- **Observações:** [...]

#### Logo 2.3 (v2)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Melhorias vs v1:** [...]
- **Observações:** [...]

**Score médio Farmácia (v2):** __/10

---

### Segmento 3: Mercearia (Mercadinho do Bairro)

#### Logo 3.1 (v2)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Melhorias vs v1:** [...]
- **Observações:** [...]

#### Logo 3.2 (v2)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Melhorias vs v1:** [...]
- **Observações:** [...]

#### Logo 3.3 (v2)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Melhorias vs v1:** [...]
- **Observações:** [...]

**Score médio Mercearia (v2):** __/10

---

### DALL-E 3 v2 - Resumo Consolidado

| Métrica | v1 (Baseline) | v2 (Refinado) | Δ |
|---------|---------------|---------------|---|
| **Score médio geral** | __/10 | __/10 | +__ |
| **Logos utilizáveis (≥7)** | __/9 | __/9 | +__ |
| **Grids/Painéis** | __/9 | __/9 | -__ |
| **Mock-ups** | __/9 | __/9 | -__ |
| **Abstrações nonsense** | __/9 | __/9 | -__ |
| **Texto dentro** | __/9 | __/9 | -__ |

**Melhorias observadas:**
1. [...]
2. [...]
3. [...]

**Problemas ainda presentes:**
1. [...]
2. [...]

---

## 📊 RESULTADOS - Flux Schnell

### Segmento 1: Loja de bebidas (Comercial Teste Beta)

#### Logo 1.1 (Flux)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Comparação DALL-E v2:** [...]
- **Observações:** [...]

#### Logo 1.2 (Flux)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Comparação DALL-E v2:** [...]
- **Observações:** [...]

#### Logo 1.3 (Flux)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Comparação DALL-E v2:** [...]
- **Observações:** [...]

**Score médio Loja de bebidas (Flux):** __/10

---

### Segmento 2: Farmácia (Farmácia Saúde & Vida)

#### Logo 2.1 (Flux)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Comparação DALL-E v2:** [...]
- **Observações:** [...]

#### Logo 2.2 (Flux)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Comparação DALL-E v2:** [...]
- **Observações:** [...]

#### Logo 2.3 (Flux)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Comparação DALL-E v2:** [...]
- **Observações:** [...]

**Score médio Farmácia (Flux):** __/10

---

### Segmento 3: Mercearia (Mercadinho do Bairro)

#### Logo 3.1 (Flux)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Comparação DALL-E v2:** [...]
- **Observações:** [...]

#### Logo 3.2 (Flux)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Comparação DALL-E v2:** [...]
- **Observações:** [...]

#### Logo 3.3 (Flux)
- **Imagem:** [link ou anexo]
- **Score:** __/10
- **Checklist:** [...]
- **Comparação DALL-E v2:** [...]
- **Observações:** [...]

**Score médio Mercearia (Flux):** __/10

---

### Flux Schnell - Resumo Consolidado

| Métrica | DALL-E v2 | Flux Schnell | Δ |
|---------|-----------|--------------|---|
| **Score médio geral** | __/10 | __/10 | +__ |
| **Logos utilizáveis (≥7)** | __/9 | __/9 | +__ |
| **Grids/Painéis** | __/9 | __/9 | -__ |
| **Mock-ups** | __/9 | __/9 | -__ |
| **Abstrações nonsense** | __/9 | __/9 | -__ |
| **Texto dentro** | __/9 | __/9 | -__ |
| **Velocidade geração** | 15-30s | 5-10s | **-67%** |
| **Custo** | $0.12 | $0.009 | **-92%** |

**Vantagens Flux:**
1. [...]
2. [...]
3. [...]

**Desvantagens Flux:**
1. [...]
2. [...]
3. [...]

---

## 📊 COMPARAÇÃO FINAL (3 Modelos)

### Tabela Comparativa Geral

| Métrica | DALL-E v1 | DALL-E v2 | Flux Schnell | Best |
|---------|-----------|-----------|--------------|------|
| **Score médio** | __/10 | __/10 | __/10 | __ |
| **Logos ≥7** | __/9 (___%) | __/9 (___%) | __/9 (___%) | __ |
| **Grids** | __ | __ | __ | __ (menos) |
| **Mock-ups** | __ | __ | __ | __ (menos) |
| **Abstrações** | __ | __ | __ | __ (menos) |
| **Velocidade** | 15-30s | 15-30s | 5-10s | **Flux** |
| **Custo** | $0.12 | $0.12 | $0.009 | **Flux** |

### Análise Qualitativa

#### DALL-E 3 v1 (Baseline)
**Pontos fortes:**
- [...]

**Pontos fracos:**
- [...]

**Conclusão:**
- [...]

---

#### DALL-E 3 v2 (Prompts Refinados)
**Pontos fortes:**
- [...]

**Pontos fracos:**
- [...]

**Conclusão:**
- [...]

---

#### Flux Schnell
**Pontos fortes:**
- [...]

**Pontos fracos:**
- [...]

**Conclusão:**
- [...]

---

## ✅ DECISÃO GO/NO-GO SPRINT 2

### Critérios de Aprovação

| Critério | Target | Resultado | ✅/❌ |
|----------|--------|-----------|------|
| **Score médio DALL-E v2** | ≥7/10 | __/10 | __ |
| **Score médio Flux** | ≥7/10 | __/10 | __ |
| **Zero grids/mockups (v2)** | 0/9 | __/9 | __ |
| **Zero grids/mockups (Flux)** | 0/9 | __/9 | __ |
| **Logos utilizáveis v2** | ≥6/9 (67%) | __/9 (___%) | __ |
| **Logos utilizáveis Flux** | ≥6/9 (67%) | __/9 (___%) | __ |
| **Flux ≥ DALL-E v2** | Equivalente ou superior | [Análise] | __ |

### Decisão Final

**[PREENCHER APÓS TESTES]**

**[ ] GO** - Prosseguir para Sprint 2 (Hybrid implementation)  
**[ ] NO-GO** - Iterar prompts ou considerar alternativas

**Justificativa:**
[Explicar decisão baseado em dados acima]

**Se GO, próximos passos:**
1. Implementar Recraft V3 integration
2. Implementar Hybrid logic (Flux → Recraft fallback)
3. UI updates + feature flag
4. Rollout gradual Sprint 2

**Se NO-GO, ações corretivas:**
1. [Detalhar o que precisa ser ajustado]
2. [Timeline para nova iteração]
3. [Critérios para reavaliar]

---

## 📸 GALERIA DE COMPARAÇÃO

### Side-by-Side: Loja de bebidas
| DALL-E v1 | DALL-E v2 | Flux Schnell |
|-----------|-----------|--------------|
| [Imagem 1.1] | [Imagem 1.1 v2] | [Imagem 1.1 Flux] |
| [Imagem 1.2] | [Imagem 1.2 v2] | [Imagem 1.2 Flux] |
| [Imagem 1.3] | [Imagem 1.3 v2] | [Imagem 1.3 Flux] |

### Side-by-Side: Farmácia
| DALL-E v1 | DALL-E v2 | Flux Schnell |
|-----------|-----------|--------------|
| [Imagem 2.1] | [Imagem 2.1 v2] | [Imagem 2.1 Flux] |
| [Imagem 2.2] | [Imagem 2.2 v2] | [Imagem 2.2 Flux] |
| [Imagem 2.3] | [Imagem 2.3 v2] | [Imagem 2.3 Flux] |

### Side-by-Side: Mercearia
| DALL-E v1 | DALL-E v2 | Flux Schnell |
|-----------|-----------|--------------|
| [Imagem 3.1] | [Imagem 3.1 v2] | [Imagem 3.1 Flux] |
| [Imagem 3.2] | [Imagem 3.2 v2] | [Imagem 3.2 Flux] |
| [Imagem 3.3] | [Imagem 3.3 v2] | [Imagem 3.3 Flux] |

---

## 📝 NOTAS & OBSERVAÇÕES

### Descobertas Não Previstas
- [...]
- [...]

### Learnings para Próxima Iteração
- [...]
- [...]

### Questões em Aberto
- [...]
- [...]

---

**Executado por:** [Nome/Agente]  
**Data:** [Data de execução]  
**Tempo total:** [Horas gastas]  
**Aprovado por:** @ux-design-expert (Uma)  
**Próximos passos:** [Referência Sprint 2 ou iteração]
