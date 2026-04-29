# Squad de Marketing AIOX para Vendeo
**Data:** 28 de Abril de 2026  
**Status:** 🎯 Proposta Estruturada para Implementação  
**Autor:** @analyst (Alex) — Synkra AIOX  

---

## 📋 INTRODUÇÃO

O Vendeo necessita de um **squad de marketing especializado** que trabalhe em conjunto para:
1. Gerar campanhas que **convertem** em adegas/mercearias
2. Manter **consistência visual** em cada loja
3. Otimizar **ROI** através de IA orquestradora
4. Validar **qualidade** antes da lojista usar

Este documento define:
- **Personas** (agentes)
- **Responsabilidades** de cada um
- **Fluxos de trabalho**
- **Pontos de integração** no Vendeo
- **Checklist de qualidade**

---

## 🤖 SQUAD CORE (Necessário para v1)

### 1. @prompt-eng (Wordsmith) — Ajustador de IA

**Quem é:** Especialista em otimização de prompts e fine-tuning de modelos de linguagem.

**Responsabilidade Principal:**
Calibrar os prompts de geração de campanhas para que a IA entenda:
- Contexto de adegas/mercearias (alto giro, promoção, urgência)
- Produtos específicos (bebidas, alimentos, combos)
- Tone de voice que funciona neste segmento
- Padrões de CTA que convertem em social

**Entrada (do Vendeo):**
```json
{
  "product": {
    "name": "Cerveja Brahma 350ml",
    "price": 2.50,
    "originalPrice": 3.50,
    "category": "bebida"
  },
  "store": {
    "segment": "adegas",
    "positioning": "confiável, bairro",
    "tone": "amigável"
  },
  "context": {
    "day": "terça-feira",
    "weather": "quente",
    "occasion": "happy hour"
  }
}
```

**Saída (prompt otimizado → IA gera campanha):**
```
Você é estrategista de marketing para adegas brasileiras.
Objetivo: Converter clientes em VISITAS IMEDIATAS.

PRODUTO: Cerveja Brahma 350ml
PREÇO: R$2,50 (era R$3,50) ← URGÊNCIA
CONTEXTO: Terça-feira, clima quente → Bebida fria = venda quente

TONE REQUERIDO: "de bairro, confiável, urgência moderada"

Gere:
1. Headline (máx 8 palavras): Foco em preço + urgência
2. Body (máx 20 palavras): Ação imediata, clima
3. CTA (máx 4 palavras): "Vem conferir", "Sai já", "Chama a turma"

REGRA CRÍTICA: Evite termos genéricos (agência). Fale como lojista de bairro.
```

**Responsabilidades Específicas:**
- [ ] Criar 5 prompts base (para 5 tipos de produto em adegas)
- [ ] Calibrar temperatura IA (criatividade vs precisão)
- [ ] Testar com 50+ campanhas reais de beta
- [ ] Criar biblioteca de CTAs que convertem
- [ ] Documentar padrões que funcionam (o "playbook" de adegas)

**Métrica de Sucesso:**
- Taxa de aprovação de campanhas ≥80% (lojista não precisa rejeitar/regenerar)
- CTAs com engagement ≥2x média de social genérico

**Integração Vendeo:**
- Prompts salvos em `lib/ai/prompts/vendors/adega/*.ts`
- Seleção automática baseado em product.category
- A/B testing de prompts por feedback do lojista

---

### 2. @commerce-strategist (NEW) — Especialista em Varejo

**Quem é:** Consultor de negócios com experiência em adegas/mercearias, entende dinâmica de vendas, sazonalidade, giro de estoque.

**Responsabilidade Principal:**
Alimentar o sistema de IA com **contexto comercial real** que influencia a geração de campanhas.

**Conhecimento Necessário:**
- Quando adegas têm picos de venda (sexta, sábado, véspera feriado)
- Como clima influencia vendas (calor → bebida fria)
- Padrões de abastecimento (segunda = distribuidor chega)
- Sazonalidade (Natal, Ano Novo, Festa de junho)
- Comportamento de clientes (happy hour, churrasco, reunião)

**Responsabilidades Específicas:**

#### Função 1: Gerar Calendário de Oportunidades
```typescript
interface ComercialOpportunity {
  date: "2026-05-15",
  day_of_week: 5,  // sexta
  opportunity: "happy_hour",
  reason: "Movimento máximo da semana",
  products: ["cerveja", "refrigerante", "água"],
  recommended_tone: "urgência_leve",
  weather_influence: "quente = vendas +30%",
  suggested_promo: "Combo happy hour 2x1"
}
```

Exemplo de calendário semanal:
```
SEGUNDA: Abastecimento → "Chegou coisa nova"
TERÇA: Movimento normal → "Ofertas de semana"
QUARTA: Pré-pico → "Prepare pro fim de semana"
QUINTA: Pico começando → "Está quente aqui"
SEXTA: PICO MÁXIMO → "VEM GALERA! Happy Hour"
SÁBADO: PICO MÁXIMO → "Fim de semana tem tudo"
DOMINGO: Repouso lojista → "Aproveita pra descansar"
```

#### Função 2: Mapear Sazonalidade
```
JANEIRO: Recuperação pós-feriado, vendas normais
FEVEREIRO: Pré-carnaval (bebida em alta)
MARÇO: Pós-carnaval, normalização
ABRIL-MAIO: Frio em algumas regiões (bebida quente?)
JUNHO: Festas juninas (bebida alta)
JULHO: Férias escolares
...
NOVEMBRO: Black Friday (adegas participam)
DEZEMBRO: Natal/Ano Novo (PICO TOTAL)
```

#### Função 3: Validar Relevância da Campanha
Pergunta crítica antes de gerar:
- "Essa campanha faz sentido COMERCIALMENTE agora?"
- Exemplo: "Gelo em promoção em julho caro (concorrência) vs dezembro (ouro)"

**Integração Vendeo:**
- Calendário salvo em `lib/data/commercial-opportunities.ts`
- Seleção automática de "briefing context" ao criar campanha
- Sugestões de tipo de conteúdo baseado em day + weather

---

### 3. @content-copy (NEW) — Copywriter Especializado

**Quem é:** Especialista em redação social que entende psicologia do consumidor em adegas.

**Responsabilidade Principal:**
Garantir que o **copy (texto) de cada campanha converte** em visitas/vendas reais.

**Expertise Necessária:**
- Gatilhos psicológicos que funcionam em social (urgência, escassez, FOMO)
- Tom de voz de adegas (confiável, "do bairro", descontraído)
- Estrutura de CTA que converte
- Adaptação de copy por público (jovens vs pais vs 3ª idade)

**Responsabilidades Específicas:**

#### Função 1: Criar Templates de Copy por Contexto
```typescript
// Templates que funcionam em adegas
const CopyTemplates = {
  urgency: {
    headline: "{product_name} tá SAINDO! R${price}",
    body: "Só temos {quantity} caixas. Quando acabar, era.",
    cta: "Vem conferir"
  },
  combo: {
    headline: "Combo irrecusável: {product1} + {product2}",
    body: "Perfeito pra {occasion}",
    cta: "Monta seu combo"
  },
  weather_driven: {
    headline: "Tá {weather}? Então bora gelada!",
    body: "{product_name} geladinha à sua espera",
    cta: "Chama a turma"
  },
  seasonal: {
    headline: "{season_event} é aqui! E a gente tem tudo",
    body: "Não falta nada pra sua {occasion}",
    cta: "Vem! Já tá marcado?"
  }
}
```

#### Função 2: Validar Copy Antes de Publicar
Checklist:
- [ ] Copy tem urgência? (sem ser desespero)
- [ ] CTA está claro e é ação imediata?
- [ ] Tone combina com tom de voz da loja?
- [ ] Produto está claro (nome, preço)?
- [ ] Temática é relevante pra data/clima?
- [ ] Não tem jargão de agência (evitar "brand awareness")?

#### Função 3: A/B Testing de CTAs
Rastrear qual CTA funciona melhor:
```
"Vem conferir" vs "Chama a turma" vs "Sai já" vs "Tá esperando aí?"

Por segmento de público:
- Jovens: "Chama a turma", "Sai já"
- Pais: "Vem conferir", "Aproveita agora"
- 3ª idade: "Tá esperando aí?", "Vem ver"
```

**Integração Vendeo:**
- Templates salvos em `lib/domain/campaigns/copy-templates.ts`
- Seleção automática baseado em context + audience
- Analytics de performance por CTA

---

### 4. @brand-designer (NEW) — Designer Gráfico & Branding

**Quem é:** Designer gráfico com expertise em branding e identidade visual para varejo local. Profissional de MARKETING (não técnico) com olho clínico para:
- Criar identidade visual única que destaca cada loja
- Garantir reconhecimento instantâneo da marca pelo cliente
- Distinguir visualmente uma loja das outras (competição)
- Imprimir sensação de pertencimento em cada campanha

**Responsabilidade Principal:**
Criar e manter a **identidade visual única de cada loja**, garantindo que quando o cliente vê uma campanha, **identifica imediatamente a loja** (reconhecimento instantâneo < 1 segundo). Cada campanha deve transmitir "essa é a cara da [Nome da Loja]" - sensação de pertencimento e distinção.

**Expertise Necessária:**
- **Branding:** Criação e manutenção de identidade de marca
- **Psicologia de Marca:** Como cores/formas/tipografia criam reconhecimento
- **Brand Recall:** Técnicas para fixar marca na memória do cliente
- **Diferenciação Visual:** Distinguir loja de competidores (mesmo bairro)
- **Design para Varejo Local:** Entender posicionamento de adegas/mercearias
- Hierarquia visual em composições
- Aplicação consistente mas não repetitiva (70% consistência + 30% variação)
- Adaptação para redes sociais (Instagram, Facebook, WhatsApp)

**Responsabilidades Específicas:**

#### Função 1: Definir Visual Signature por Loja

**Objetivo:** Criar DNA visual único da loja que será aplicado em TODAS as campanhas.

**Processo:**
1. **Análise de Marca:** Entender posicionamento da loja (tradicional? moderna? festiva?)
2. **Pesquisa de Competição:** Ver identidades visuais de adegas vizinhas (diferenciar)
3. **Psicologia de Cores:** Selecionar paleta que transmite valores da loja
4. **Definir DNA Visual:** Capturar no onboarding:

```typescript
interface StoreVisualSignature {
  storeId: string;
  // Nome e posicionamento
  store_name: string;
  positioning: "tradicional" | "moderna" | "festiva" | "premium" | "popular";
  target_audience: "jovens" | "familias" | "terceira_idade" | "misto";
  
  colors: {
    primary: "#FF5733",      // Cor principal (logo)
    secondary: "#3366FF",    // Cor complementar
    accent: "#FFD700"        // Destaque
    // Rationale psicológico:
    primary_meaning: "confiança, tradição" // Ex: azul = confiança
  };
  typography: {
    headline: "Poppins Bold",     // Fonte para títulos
    body: "Inter Regular"          // Fonte para corpo
    weight_emphasis: "700",        // Bold
    personality: "moderna" | "classica" | "descontraida"
  };
  logo: {
    url: "...",
    placement: "top_left" | "top_right" | "bottom_right",
    opacity: 0.8,
    size: "medium"  // Não ofuscar produto
  };
  visual_style: "modern" | "classic" | "playful" | "premium";
  badge_preference: "rectangular" | "circular" | "cloud" | "star";
  
  // NOVO: Elementos de reconhecimento
  brand_recognition: {
    unique_element: "cores" | "tipografia" | "logo_placement" | "composicao",
    consistency_level: 0.7,  // 70% consistência, 30% variação
    differentiation_from: ["Adega Silva", "Adega Central"]  // Competidores
  };
}
```

**Saída:**
- Visual Signature salvo no banco
- 3 mockups de exemplo mostrados ao lojista
- Validação: "Essas campanhas têm a cara da sua loja?"

#### Função 2: Criar Composições Variadas com Mesma Identidade
Motor 3 (Composer) deve gerar 3+ variações que:
- [ ] Todas aplicam Visual Signature
- [ ] Diferentes layouts (grid, centrado, off-center)
- [ ] Diferentes posições de badge/preço
- [ ] Diferentes hierarquias (produto first vs preço first)

Exemplo: Mesma cerveja, 3 layouts:
```
VARIAÇÃO 1 (Clássico):
- Produto centrado
- Preço em rodapé
- Logo discreto canto

VARIAÇÃO 2 (Urgência):
- Produto menor, mais acima
- Preço GRANDE em destaque
- Logo discreto mas visível

VARIAÇÃO 3 (Premium):
- Produto maior, espaço negativo
- Preço elegante, tipografia refinada
- Logo integrado (não solto)
```

#### Função 3: Validar Composição Antes de Apresentar ao Lojista
Checklist:
- [ ] Logo visível mas não ofusca produto?
- [ ] Cores primárias/secundárias usadas corretamente?
- [ ] Tipografia consistente com brand?
- [ ] Badge (preço/promoção) é legível?
- [ ] **Layout DISTINGUE esta loja de competidores?** (crítico)
- [ ] **Cliente identificaria loja em <1 segundo?** (teste visual)
- [ ] Proporções de aspectos corretos (1080x1350 para feed)?
- [ ] **Lojista sentiria "essa tem a cara da minha loja"?** (pertencimento)

**Métrica de Sucesso (NOVA):**
- [ ] **Brand Recognition Score:** ≥85% de clientes identificam loja em <1 segundo
- [ ] **Diferenciação:** 100% das campanhas visualmente distintas de competidores
- [ ] **Pertencimento:** ≥90% lojistas sentem "essa campanha representa minha loja"
- [ ] **Consistência Controlada:** 70% elementos fixos + 30% variação (não enjoar)

**Integração Vendeo:**
- Visual Signature salvo em `lib/domain/stores/visual-signature.ts`
- Aplicado automaticamente em Motor 3 (Composer)
- Lojista pode editar cores/logo no onboarding

---

### 5. @ux-design (Existing) — UX/UI do Vendeo

**Papel Estendido:**
Validar que o workflow do Vendeo é **intuitivo e natural** para lojistas de adegas (baixa tech savviness).

**Responsabilidades Específicas:**
- [ ] Testar com 5-10 lojistas reais (não tech-savvy)
- [ ] Simplificar fluxo ao máximo (3 cliques para gerar campanha)
- [ ] Criar tutoriais em vídeo 2min (tipo Loom)
- [ ] Validar que botões, labels, ícones são claros
- [ ] Testar mobile (muitos lojistas usam só celular)

**Métrica:** Tempo até primeira campanha gerada ≤5 minutos

---

## 🤖 SQUAD EXTENDED (Para Premium + Evolução)

### 6. @analytics-engine (NEW) — Especialista em Métricas

**Quando Ativar:** Após v1 no mercado (Fase 2), para validar ROI real.

**Responsabilidade:**
Coletar dados reais de vendas e engajamento social, correlacionar com campanhas do Vendeo.

**Fluxo de Dados:**
```
1. Lojista usa Vendeo → Gera campanha
2. Campanha publicada no social
3. Lojista marca campanhas que resultaram em vendas (survey simples)
4. @analytics-engine correlaciona:
   - Qual tipo de campanha converteu?
   - Qual CTA funcionou melhor?
   - Qual dia/hora teve mais vendas?
5. Feedback → Alimenta @prompt-eng e @content-copy
```

---

### 7. @ai-orchestrator (NEW) — Gerenciador de IA Adaptativa

**Quando Ativar:** Premium tier (Fase 3), para automação total.

**Responsabilidade:**
Gerenciar a IA de forma **autônoma, baseada em dados históricos da loja**.

**Exemplo de Orquestração:**
```
Adega João da Silva:
├─ Segunda: "Chegou Brahma" (sempre funciona bem)
├─ Quarta: "Combo happy hour" (engagement alto)
├─ Sexta: "Promoção relâmpago" (urgência máxima)
├─ Sábado: "Mix de bebidas" (movimento balanceado)
└─ Domingo: (sem campanha, loja repousante)

IA Aprende:
- "Segunda sempre vende +40% de cerveja importada"
- "Sexta é melhor fazer combo do que vender isolado"
- "CTAs com 'Chama a turma' convertem 3x"

IA Propõe Automaticamente:
- "Segunda vem aí, que tal Brahma novamente?"
- "Sexta = combo happy hour? Histórico mostra +35% conversão"
```

---

## 🔄 FLUXO DE CAMPANHA COM SQUAD

```
┌──────────────────────────────────────────────────────────┐
│ LOJISTA ABRE VENDEO                                      │
│ Produto: "Cerveja Brahma 350ml"                          │
│ Preço: R$2,50 (promoção)                                 │
│ Imagem: Foto do celular                                  │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│ SQUAD PROCESSA EM PARALELO:                              │
│                                                          │
│ @commerce-strategist:                                    │
│  "Terça-feira, 09:00, temp 28°C"                         │
│  → Contexto: "happy_hour_incoming"                       │
│                                                          │
│ @prompt-eng:                                             │
│  "Cerveja + promoção + happy_hour"                       │
│  → Prompt: "Gere CTA urgente, tone descontraído"        │
│                                                          │
│ @content-copy:                                           │
│  Template: "urgency_combo"                              │
│  → 3 variações de CTA prontas                            │
│                                                          │
│ @brand-designer:                                         │
│  Visual Signature: Cores azul/amarelo, logo canto       │
│  → 3 layouts diferentes, mesma identidade               │
│  → Teste: Cliente reconhece loja em <1 segundo?        │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│ MOTOR VISUAL GERA 3 CAMPANHAS:                           │
│                                                          │
│ OPÇÃO 1: "CHEGOU! Brahma R$2,50"                         │
│ ├─ Layout: Centrado, urgência alta                       │
│ ├─ CTA: "Chama a turma"                                  │
│ └─ Identidade: Cores marca + logo visível               │
│                                                          │
│ OPÇÃO 2: "Tá quente aqui! Gelada à espera"             │
│ ├─ Layout: Produto esquerda, vibe clima                 │
│ ├─ CTA: "Vem conferir"                                   │
│ └─ Identidade: Cores marca + logo discreto              │
│                                                          │
│ OPÇÃO 3: "Happy hour já começou! Brahma 2,50"          │
│ ├─ Layout: Premium, espaço negativo                      │
│ ├─ CTA: "Sai já pra cá"                                  │
│ └─ Identidade: Cores marca + logo integrado             │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│ LOJISTA ESCOLHE OPÇÃO 2 E PUBLICA                        │
│ ✅ Campanha salva com feedback                           │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│ FEEDBACK LOOP (Se Premium + Analytics):                  │
│                                                          │
│ Lojista marca: "Resultou em vendas"                      │
│ @analytics-engine rastreia:                              │
│  - CTA "Vem conferir" + clima quente = +35% conversão   │
│  - Layout com produto esquerda = preferência             │
│                                                          │
│ IA Aprende:                                              │
│  - "Terça com clima quente + CTA específico = ouro"     │
│  - Próximas terças quentes: repetir padrão              │
└──────────────────────────────────────────────────────────┘
```

---

## 📋 CHECKLIST DE QUALIDADE

### Antes de Lojista Ver Campanha

| Responsável | Verificação | Sim/Não |
|-------------|----------|---------|
| @content-copy | Copy tem urgência sem ser desespero? | [ ] |
| @brand-designer | Visual Signature aplicada? Cliente reconhece loja? | [ ] |
| @prompt-eng | CTA é claro e conversível? | [ ] |
| @commerce-strategist | Contexto comercial faz sentido hoje? | [ ] |
| @ux-design | UI/UX está intuitiva? | [ ] |

### Após Lojista Usar (Feedback Collection)

```
SURVEY SIMPLES:
1. "Essa campanha resultou em vendas?" [Sim/Não]
2. "Qual CTA te agradou?" [Descritivo]
3. "Gostou do design?" [1-5 stars]
4. "Qual dia é melhor postar?" [Select]

GOALS:
- Coletar 100+ feedbacks em 4 semanas
- Identificar padrões (qual CTA, qual dia, qual tipo de produto funciona)
- Alimentar @prompt-eng e @content-copy com dados reais
```

---

## 🛠️ PRÓXIMAS AÇÕES

1. **Semana 1:** 
   - [ ] @pm (Morgan) valida Squad proposto
   - [ ] @architect (Aria) aprova arquitetura
   - [ ] Ajustes baseado em feedback

2. **Semana 2-3:**
   - [ ] Onboarding de agentes no AIOX
   - [ ] Criar prompts iniciais (@prompt-eng)
   - [ ] Definir Visual Signature template (@brand-designer)

3. **Semana 4:**
   - [ ] Integrar Squad ao Vendeo (Motor Visual v2.0)
   - [ ] Testar com 5 campanhas exemplo

4. **Semana 5-8:**
   - [ ] Beta com 10-15 adegas reais
   - [ ] Coleta de feedback
   - [ ] Refinamento de prompts/templates

---

## 📊 MÉTRICAS DE SUCESSO DO SQUAD

| Métrica | Target | Como Medir |
|---------|--------|------------|
| Taxa de aprovação (lojista não rejeita) | ≥80% | Contar rejeições/regenerações |
| CTAs com performance >2x média | ≥70% | Trackear engagement por CTA |
| Tempo até campanha pronta | ≤2 min | Cronometrar fluxo |
| NPS de satisfação visual | ≥4/5 | Survey ao lojista |
| ROI percebido lojista | +20% | Survey: "Vendeu mais?" |

---

**Squad Pronto para Implementação — Aguardando Aprovação de @pm + @architect**
