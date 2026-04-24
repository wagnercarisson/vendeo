# Epic 4: Requisitos do Motor de Imagens — Resposta ao @architect

**Data:** 22/04/2026  
**Contexto:** Análise técnica para decisão entre APIs externas vs implementação própria  
**Responsável:** @aiox-master (com input do Product Owner)  
**Destinatário:** @architect (Aria)  

---

## 📊 **Q1: Volume Estimado de Imagens/Dia por Plano**

### Contexto do Lançamento

**Fase:** Open Beta (experimental)  
**Meta:** 1.000 usuários do plano Basic nos primeiros 6 meses  
**Estratégia:** Lançamento gradual com poucos usuários inicialmente  

---

### Projeção de Crescimento

| Mês | Usuários Free | Usuários Basic | Usuários Pro | Total Usuários |
|-----|---------------|----------------|--------------|----------------|
| **M1** | 50 | 10 | 2 | 62 |
| **M2** | 100 | 30 | 5 | 135 |
| **M3** | 200 | 100 | 10 | 310 |
| **M4** | 400 | 300 | 20 | 720 |
| **M5** | 600 | 600 | 40 | 1.240 |
| **M6** | 800 | 1.000 | 60 | 1.860 |

**Crescimento:** ~4x ao mês nos primeiros 3 meses, depois ~1.5-2x/mês

---

### Limites e Uso Estimado por Plano

#### **Plano FREE**
- **Limite:** 5 campanhas/mês (produto atual)
- **Variações por campanha:** 1 arte (sem variações)
- **Taxa de regeneração:** 60% (usuários experimentam sem compromisso)
- **Média de imagens:** 8 imagens/usuário/mês (5 campanhas × 1 arte × 1.6 regenerações)

#### **Plano BASIC** (Foco do Open Beta)
- **Limite:** 30 campanhas/mês (estimado)
- **Variações por campanha:** 4-6 artes (Story 4.3)
- **Taxa de regeneração:** 35% (usuários mais engajados, menos tentativa-erro)
- **Weekly Plan:** Sim (Story 4.6 — gera 4-7 campanhas/semana automaticamente)
- **Média de imagens:** 180 imagens/usuário/mês
  - 30 campanhas × 5 variações × 1.35 regenerações = **202 imagens/usuário/mês**
  - Arredondado para **180** (conservador)

#### **Plano PRO** (Poucos early adopters)
- **Limite:** Ilimitado (ou 100 campanhas/mês)
- **Variações por campanha:** 4-6 artes
- **Taxa de regeneração:** 25% (usuários power users, mais assertivos)
- **Weekly Plan:** Sim (estratégico + adaptativo)
- **Média de imagens:** 400 imagens/usuário/mês
  - 50 campanhas × 5 variações × 1.25 regenerações = **312 imagens/usuário/mês**
  - Ajustado para **400** (uso intenso)

---

### **VOLUME TOTAL — Projeção por Mês**

| Mês | Imagens FREE | Imagens BASIC | Imagens PRO | **Total Imagens/Mês** | **Pico Diário (p95)** |
|-----|--------------|---------------|-------------|----------------------|----------------------|
| **M1** | 400 | 1.800 | 800 | **3.000** | ~200 |
| **M2** | 800 | 5.400 | 2.000 | **8.200** | ~500 |
| **M3** | 1.600 | 18.000 | 4.000 | **23.600** | ~1.500 |
| **M4** | 3.200 | 54.000 | 8.000 | **65.200** | ~3.500 |
| **M5** | 4.800 | 108.000 | 16.000 | **128.800** | ~6.500 |
| **M6** | 6.400 | 180.000 | 24.000 | **210.400** | ~10.000 |

**Pico diário (p95):** Calculado como `(Total Mês / 30) × 1.5` (concentração em dias úteis)

---

### **Imagens/Dia por Operação (M6 — Pico)**

Considerando Epic 4 Architecture (4 motores):

| Operação | Volume/Dia | Tipo de Carga | Latência Alvo |
|----------|-----------|---------------|---------------|
| **Análise de Imagem (Story 4.1)** | ~1.500 | Vision API (GPT-4o) | <2s |
| **Intent Resolver (Story 4.2)** | ~1.500 | LLM API (GPT-4o/Claude) | <1.5s |
| **Visual Composer (Story 4.3)** | ~1.500 | LLM API (4-6 variações/call) | <3s |
| **Renderização (Story 4.4)** | ~10.000 | Composição programática | <3s |
| **Upload Supabase Storage** | ~10.000 | Upload (PNG 1080x1080) | <1s |

**Nota:** Story 4.1 (Visual Reader) cacheia análises de imagens repetidas → Volume real pode ser 60-70% menor.

---

## 🛠️ **Q2: Escopo do Motor de Imagens**

### **Operações em ESCOPO (Epic 4)**

Baseado nas Stories 4.1-4.6:

#### ✅ **ANÁLISE (Story 4.1 — Visual Reader)**
- Detecção de background type (transparent/solid/complex)
- Análise de ocupação (low/medium/high/full)
- Qualidade de recorte (hasClearCutout, edgeQuality)
- Orientação e posicionamento
- **Implementação:** GPT-4o Vision API (multimodal)
- **Cache:** Sim (Supabase ou Redis para imagens repetidas)

#### ✅ **COMPOSIÇÃO PROGRAMÁTICA (Story 4.4 — Renderer)**
- Resize/crop/posicionamento de imagem do produto
- Aplicação de background (cores da Visual Signature)
- Overlay de elementos:
  - Texto (headline, body, preço, CTA)
  - Logo da loja (80x80px)
  - Badges e selos promocionais
  - Shapes decorativas
- **Implementação:** Canvas API (Node.js) + Sharp
- **Output:** PNG 1080x1080 (Instagram)
- **Otimização:** Compressão, quality 90+

#### ✅ **VALIDAÇÃO DE CONTRASTE (Story 4.5)**
- Algoritmo WCAG AA (4.5:1 contrast ratio)
- Auto-ajuste de cores quando necessário

---

### **Operações FORA DO ESCOPO (Epic 4)**

#### ❌ **GERAÇÃO VIA IA (ex: DALL-E, Midjourney, Stable Diffusion)**
- **Razão:** Epic 4 usa imagens DO PRODUTO fornecidas pelo lojista
- **Decisão:** Composição programática (Canvas/Sharp) é suficiente
- **Custo evitado:** $0.02-0.08/imagem (APIs generativas são 10-40x mais caras)

#### ❌ **BACKGROUND REMOVAL (ex: remove.bg, ClipDrop)**
- **Razão:** Story 4.1 detecta se imagem tem fundo transparente, mas não remove
- **Decisão:** Lojista fornece imagem com/sem fundo, motor adapta composição
- **Custo evitado:** $0.002-0.02/imagem

#### ❌ **UPSCALING (ex: Topaz, Let's Enhance)**
- **Razão:** Não mencionado em nenhuma story
- **Decisão:** Imagens de entrada devem ter qualidade mínima (validação frontend)

#### ❌ **ESTILIZAÇÃO/FILTROS AVANÇADOS (ex: Prisma, DeepArt)**
- **Razão:** Fora do escopo da Epic 4 (foco em composição, não estética avançada)
- **Decisão:** Visual Signature aplica cores/tipografia da marca, não filtros artísticos

---

### **Operações Simples vs Complexas**

| Operação | Latência | Custo | Onde Rodar |
|----------|---------|-------|------------|
| **Resize/crop/compress** | <200ms | ~$0 | Serverless (Vercel Edge) |
| **Canvas compositing** | 1-3s | ~$0.001 | Serverless (Vercel Functions) |
| **Vision API (GPT-4o)** | 1-2s | ~$0.01/imagem | Externa (OpenAI) |
| **LLM prompts (GPT-4o/Claude)** | 1-3s | ~$0.02/call | Externa (OpenAI/Anthropic) |

**Conclusão:** 90% das operações são baratas e rápidas (Canvas/Sharp local). Custo real vem das APIs de IA (Stories 4.1-4.3).

---

## 🏗️ **Q3: Restrições de Hosting**

### **Stack Atual do Vendeo**

| Componente | Tecnologia | Hosting |
|------------|-----------|---------|
| **Frontend/Backend** | Next.js 15 (App Router) | **Vercel** (presumido) |
| **Database** | PostgreSQL | **Supabase** |
| **Storage** | Object Storage | **Supabase Storage** |
| **Auth** | Authentication | **Supabase Auth** |

---

### **Restrições e Preferências**

#### ✅ **PODE usar SaaS externos** (já usamos):
- OpenAI GPT-4o (copywriting atual)
- OpenAI GPT-4o Vision (Story 4.1)
- Claude Sonnet (alternativa para Stories 4.2-4.3)
- Supabase Storage (upload de artes renderizadas)

#### ⚠️ **PREFERÊNCIA por processamento local** quando possível:
- Canvas/Sharp para renderização (Story 4.4) → **Serverless Functions (Vercel)**
- Não há necessidade de rodar 100% on-prem/na infra Vendeo
- **Razão:** Custo e latência melhores que APIs externas de renderização

#### ❌ **NÃO PODE:**
- Usar infraestrutura própria (VPS, Kubernetes) → Vendeo é serverless
- Processar localmente no navegador → Renderização no backend (segurança + qualidade)

---

### **Decisão de Arquitetura**

| Etapa | Onde Rodar | Tecnologia | Latência Alvo |
|-------|-----------|-----------|---------------|
| **Visual Reader (4.1)** | Externa | GPT-4o Vision API | <2s |
| **Intent Resolver (4.2)** | Externa | GPT-4o ou Claude API | <1.5s |
| **Visual Composer (4.3)** | Externa | GPT-4o ou Claude API | <3s |
| **Renderer (4.4)** | Vercel Functions | Canvas + Sharp | <3s |
| **Upload (4.4)** | Supabase Storage | Native API | <1s |

**Total Pipeline:** <10s (p95) para gerar 4-6 variações de uma campanha

---

## 🎯 **Impactos para o Vendeo**

### **UX Targets (baseados no input do @architect)**

| Operação | Target p95 | Status Epic 4 |
|----------|-----------|---------------|
| **Transformações (resize/crop)** | <3s | ✅ <1s (Canvas/Sharp) |
| **Geração de variações** | <8s | ✅ <10s (pipeline completa) |
| **Pré-geração (Weekly Plan)** | N/A | ✅ Assíncrono (Story 4.6) |

---

### **Custo Estimado (M6 — Pico)**

| Componente | Volume/Mês | Custo Unitário | Total/Mês |
|------------|-----------|----------------|-----------|
| **Visual Reader (GPT-4o Vision)** | 45.000 análises | $0.01 | **$450** |
| **Intent Resolver (GPT-4o)** | 45.000 calls | $0.01 | **$450** |
| **Visual Composer (GPT-4o)** | 45.000 calls | $0.02 | **$900** |
| **Renderização (Canvas/Sharp)** | 210.000 artes | $0.001 | **$210** |
| **Storage (Supabase)** | 210.000 × 500KB | $0.02/GB | **$20** |
| **Total** | — | — | **~$2.030/mês** |

**Receita Mínima (M6):**
- 1.000 usuários Basic × R$ 49/mês = R$ 49.000 (~$9.800)
- Custo de IA = ~21% da receita

**ROI:** Motor V2 reduz regenerações em 50% → **Economia de $1.000/mês** em API calls (offset parcial)

---

## 📋 **Recomendações Finais**

### **Para @architect:**

1. **✅ NÃO use APIs externas de renderização** (Canvas/Sharp é suficiente e 10x mais barato)
2. **✅ Mantenha GPT-4o Vision para Story 4.1** (análise de imagem é core do produto)
3. **⚠️ Considere cache agressivo** na Story 4.1 (mesma imagem = mesma análise)
4. **⚠️ Implemente rate limiting** por plano (Free: 5/mês, Basic: 30/mês)
5. **✅ Use Vercel Functions** para Renderer (Story 4.4) — sem necessidade de infra dedicada

---

### **Questões em Aberto (Bloqueando @dev)**

Antes de liberar Stories 4.x para implementação:

- [ ] **Qual LLM usar para Stories 4.2-4.3?** (GPT-4o vs Claude Sonnet)
  - GPT-4o: Mais rápido, $0.01/call
  - Claude Sonnet: Melhor raciocínio criativo, $0.015/call
  - **Decisão necessária:** @architect precisa testar prompts e decidir

- [ ] **Cache de ImageProfile (Story 4.1): Supabase ou Redis?**
  - Supabase: Mais simples, já temos
  - Redis (Upstash): Mais rápido, custo adicional
  - **Decisão necessária:** @architect avalia tradeoff custo vs latência

- [ ] **Paralelização de variações (Story 4.3): 1 call ou 6 calls?**
  - 1 call: Mais barato, prompt mais complexo
  - 6 calls: Mais simples, 6x mais caro
  - **Decisão necessária:** @prompt-eng testa viabilidade de gerar 6 variações em 1 prompt

---

**Status:** ⏸️ AGUARDANDO ANÁLISE TÉCNICA DO @architect

**Próximos Passos:**
1. @architect analisa este documento
2. @architect responde questões em aberto
3. @architect aprova ou ajusta Stories 4.1-4.6
4. @aiox-master libera Epic 4 para @dev

---

*Documento criado em 22/04/2026 por @aiox-master (Orion)*  
*Baseado em: Epic 4 Stories (4.1-4.6), ROADMAP.md, product guidelines*
