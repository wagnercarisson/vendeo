# 🎨 Onboarding Progressivo — Análise UX & Wireframes
**Agent:** @ux-design-expert (Uma)  
**Data:** 2026-04-30  
**Status:** Proposta de Redesign

---

## 📊 Diagnóstico: Fluxo Atual vs Necessidade

### Onboarding Atual (❌ CRÍTICO)
**Arquivo:** `app/onboarding/store/page.tsx`

**Campos capturados:**
- ✅ Nome da loja
- ✅ Cidade
- ✅ Estado

**Problemas identificados:**
1. ❌ **Segmento não é capturado** → IA não sabe se é adega, farmácia, moda, beauty ou casa
2. ❌ **Logo hardcoded como NULL** → Campanhas sem identidade visual
3. ❌ **Cores hardcoded** (`#16A34A` verde, `#2563EB` azul) → Todas lojas com mesma paleta
4. ❌ **Sem contato** (telefone, WhatsApp, Instagram) → Campanhas sem call-to-action relevante
5. ❌ **Zero intelligence context** → IA gera campanhas genéricas, sem personalização
6. ❌ **Tempo de onboarding:** <1 min (bom) MAS lojista chega no dashboard SEM contexto para gerar campanhas úteis

### Gap Crítico
**Atual:** 3 campos básicos (name, city, state)  
**Necessário:**
- **Fase 1 (obrigatória):** 8 campos básicos da loja
- **Fase 2 (opcional):** 15 campos de intelligence calibration

**Impacto no produto:**
- **Primeira campanha gerada:** Genérica, sem tom da marca, sem contexto local → Lojista desiste
- **Rejeição em testes:** "Não parece minha loja" (falta logo, cores erradas, tom genérico)
- **Churn precoce:** Lojista testa 1x, não vê valor, abandona

---

## 🎯 Proposta: Onboarding Progressivo em 2 Fases

### Filosofia UX
- **Fase 1:** Dados mínimos para a primeira campanha funcionar (tom, segmento, identidade visual)
- **Fase 2:** Calibração avançada para campanhas melhores (opcional, não bloqueia)
- **Tom:** Informal, direto, sem corporativês ("Conta pra gente sobre sua loja" vs "Preencha os dados cadastrais")
- **Tempo:** Fase 1 < 2 min (3-4 telas), Fase 2 ~ 5 min (modal de 15 perguntas)

---

## 📐 FASE 1: Dados Básicos da Loja (Obrigatória)

### Estrutura: 4 Telas Progressivas

#### **Tela 1/4: Identidade da Loja**
**Título:** "Vamos conhecer sua loja 🏪"  
**Subtítulo:** "Isso ajuda o Vendeo a criar campanhas com a cara do seu negócio"

**Campos:**
1. **Nome da loja** (text input)
   - Placeholder: "Ex: Adega do Bairro"
   - Obrigatório
   
2. **Segmento da loja** (select visual com ícones)
   - Opções: 
     - 🍷 Adega
     - 💊 Farmácia
     - 👗 Moda
     - 💄 Beauty
     - 🏠 Casa/Decoração
   - Obrigatório
   - **Nota UX:** Ícones grandes (64x64px), tappable area 80x80px (mobile-first)

**CTA:** "Continuar" (desabilitado até preencher)

---

#### **Tela 2/4: Localização**
**Título:** "Onde sua loja fica? 📍"  
**Subtítulo:** "O Vendeo usa isso pra criar campanhas relevantes pro seu bairro"

**Campos:**
3. **Cidade** (text input com autocomplete - API ViaCEP?)
   - Placeholder: "Ex: Ibirama"
   - Obrigatório

4. **Estado** (select)
   - Lista de UFs
   - Obrigatório

5. **Bairro** (text input - NOVO)
   - Placeholder: "Ex: Centro"
   - Opcional (mas importante para contexto local)

**CTA:** "Continuar"

---

#### **Tela 3/4: Contato**
**Título:** "Como o cliente fala com você? 💬"  
**Subtítulo:** "Essas infos vão aparecer nas suas campanhas"

**Campos:**
6. **Telefone/WhatsApp** (input com máscara)
   - Placeholder: "(47) 99999-9999"
   - Máscara: (XX) XXXXX-XXXX
   - Obrigatório
   - **Checkbox:** "Esse número também é WhatsApp" (checked por padrão)

7. **Instagram** (text input)
   - Placeholder: "@sualojaaqui"
   - Opcional (mas importante para CTAs de redes sociais)
   - **Nota UX:** Validação: @ é automático se usuário não digitar

**CTA:** "Continuar"

---

#### **Tela 4/4: Identidade Visual**
**Título:** "Deixa sua loja com a sua cara 🎨"  
**Subtítulo:** "O Vendeo usa logo e cores pra criar campanhas com a identidade da sua marca"

**Campos:**
8. **Logo da loja** (upload OU geração com IA)
   - **Opção A:** Upload de imagem (drag & drop ou clique)
     - Formatos: PNG, JPG (max 5MB)
     - Preview instantâneo
   - **Opção B:** "Gerar logo com IA" (modal)
     - Input: "Descreva o estilo da sua loja"
     - Gera 3 opções de logo (Replicate API?)
     - Lojista escolhe e edita
   - **Opção C:** "Vou adicionar depois" (logo fica NULL)
     - **⚠️ Warning:** "Suas campanhas terão um logo genérico até você adicionar o seu"

9. **Cores da marca** (color picker duplo)
   - **Opção A:** Picker manual (primary + secondary)
   - **Opção B:** "Extrair cores do logo" (automático se logo foi enviado)
     - Usa algoritmo de extração de paleta (Vibrant.js?)
   - **Opção C:** "Usar cores padrão" (mantém verde #16A34A e azul #2563EB)

**CTA:** "Criar minha loja e começar" (grande, destaque)

**Link secundário:** "⚡ Calibrar inteligência da IA (opcional)" → Abre Fase 2

---

## 🧠 FASE 2: Intelligence Calibration (Opcional)

### Estrutura: Modal de 15 Campos em Abas

**Trigger:**
- Link na Tela 4/4: "Calibrar inteligência da IA"
- OU Banner no dashboard após onboarding: "⚡ Quer campanhas ainda melhores? Calibre a IA em 5 min"

**Formato:** Modal full-screen (mobile) ou lateral slide-in (desktop)

**Título:** "Calibre a inteligência do Vendeo 🧠"  
**Subtítulo:** "Quanto mais você conta sobre sua loja, melhores ficam as campanhas"

**Progresso:** Barra de progresso (0-15 campos preenchidos)

**⚠️ UX CRÍTICO:** Lojista pode PULAR tudo e salvar depois. Nenhum campo é obrigatório.

---

### Abas (5 grupos de campos)

#### **Aba 1: Tom & Público (5 campos)**

**1. Tom de voz da marca** (radio buttons)
- Formal ("Prezado cliente...")
- Informal ("E aí, galera!")
- Técnico ("Produto com certificação XYZ")
- Divertido ("Vem que tem promoção! 🎉")
- **Placeholder:** Deixar em branco (IA infere do segmento)

**2. Público-alvo principal** (textarea)
- Placeholder: "Ex: Homens 30-50 anos, que curtem vinho, moram no bairro"
- 200 caracteres max
- Opcional

**3. Picos sazonais** (multi-select checkboxes)
- Verão, Inverno, Dia dos Pais, Natal, Black Friday, Páscoa, Dia das Mães, Outros
- **Input adicional:** "Outros eventos" (text input)
- Opcional

**4. Principais diferenciais** (textarea)
- Placeholder: "Ex: Atendimento personalizado, entrega rápida, produtos exclusivos"
- 300 caracteres max
- Opcional

**5. Produtos top 5** (lista dinâmica)
- Input: "Nome do produto" (+ botão "Adicionar mais")
- Max 5 itens
- Exemplo: "Vinho Chileno, Cerveja Artesanal, Whisky Premium"
- Opcional

**CTA Aba:** "Próximo"

---

#### **Aba 2: Posicionamento (5 campos)**

**6. Posicionamento de preço** (select)
- Econômico ("Preço baixo, valor alto")
- Médio ("Equilíbrio entre preço e qualidade")
- Premium ("Produtos selecionados, preço justo")
- Luxo ("Alta qualidade, exclusividade")
- Opcional

**7. Ticket médio (R$)** (number input)
- Placeholder: "Ex: 150"
- **Nota UX:** Ajuda a IA calibrar urgência e CTAs ("a partir de R$ X")
- Opcional

**8. Principais concorrentes** (lista dinâmica)
- Input: "Nome do concorrente" (+ botão "Adicionar mais")
- Max 3 itens
- **Nota UX:** "Isso ajuda a destacar seus diferenciais"
- Opcional

**9. Proposta única de venda (USP)** (textarea)
- Placeholder: "O que só sua loja tem? Ex: Único com entrega em 30 min no bairro"
- 200 caracteres max
- Opcional

**10. Dores do cliente que você resolve** (multi-select checkboxes)
- Falta de tempo, Preço alto, Falta de variedade, Atendimento ruim, Entrega demorada, Outros
- **Input adicional:** "Outras dores" (text input)
- Opcional

**CTA Aba:** "Próximo"

---

#### **Aba 3: Conversão (3 campos)**

**11. Gatilhos de conversão** (checkboxes com sliders)
- **Urgência:** Slider (0-10) "Quanto você usa urgência nas promoções?"
- **Escassez:** Slider (0-10) "Usa 'últimas unidades' / 'estoque limitado'?"
- **Prova social:** Checkbox "Tem avaliações/depoimentos de clientes?"
- **Garantia:** Checkbox "Oferece garantia estendida ou troca fácil?"
- Opcional

**12. CTAs que já funcionaram** (lista dinâmica)
- Input: "CTA" (ex: "Compre agora e ganhe 10%")
- Input: "Contexto" (ex: "Black Friday 2025")
- + botão "Adicionar mais" (max 3)
- **Nota UX:** IA vai reusar CTAs validados
- Opcional

**13. Eventos locais importantes** (text input)
- Placeholder: "Ex: Festa do Colono (outubro), Sommerfest (janeiro)"
- **Nota UX:** IA cria campanhas alinhadas com calendário local
- Opcional

**CTA Aba:** "Próximo"

---

#### **Aba 4: Linguagem (2 campos - v2.1 avançado)**

**14. Preferências de linguagem** (checkboxes)
- Usa gírias regionais (ex: "tchê", "uai", "mano")
- Confortável com emojis (slider 0-10: "Nenhum" → "Muitos")
- Formalidade (select: Muito formal, Formal, Neutro, Informal, Muito informal)
- Max exclamações por copy (slider 0-5)
- Opcional

**15. Tamanho de copy preferido** (radio buttons)
- Curto e direto (título: 5-7 palavras, corpo: 15-20 palavras)
- Médio (título: 8-10 palavras, corpo: 25-35 palavras)
- Detalhado (título: 10-12 palavras, corpo: 40-50 palavras)
- **Preview:** Mostra exemplo de campanha em cada tamanho
- Opcional

**CTA Aba:** "Salvar e fechar"

---

### Modal: Resumo Final
**Título:** "Calibração concluída! 🎉"  
**Conteúdo:**
- "Você preencheu X/15 campos"
- "Score de inteligência: X/100" (barra visual)
- "A IA já pode gerar campanhas personalizadas pra você!"

**CTAs:**
- "Gerar minha primeira campanha" (primário)
- "Voltar pro dashboard" (secundário)

---

## 🎨 Wireframes

### Wireframe 1: Tela 1/4 (Identidade)

```
┌─────────────────────────────────────────┐
│  ← Voltar              [Progress: 1/4]  │
├─────────────────────────────────────────┤
│                                         │
│  🏪 Vamos conhecer sua loja             │
│  Isso ajuda o Vendeo a criar            │
│  campanhas com a cara do seu negócio    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ Nome da loja *                 │    │
│  │ [Ex: Adega do Bairro_______]   │    │
│  └────────────────────────────────┘    │
│                                         │
│  Segmento da loja *                     │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │  🍷  │ │  💊  │ │  👗  │            │
│  │Adega │ │Farmá │ │ Moda │            │
│  └──────┘ └──────┘ └──────┘            │
│  ┌──────┐ ┌──────┐                     │
│  │  💄  │ │  🏠  │                     │
│  │Beauty│ │ Casa │                     │
│  └──────┘ └──────┘                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Continuar                  │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Wireframe 2: Tela 4/4 (Identidade Visual)

```
┌─────────────────────────────────────────┐
│  ← Voltar              [Progress: 4/4]  │
├─────────────────────────────────────────┤
│                                         │
│  🎨 Deixa sua loja com a sua cara       │
│  O Vendeo usa logo e cores pra criar    │
│  campanhas com a identidade da sua      │
│  marca                                  │
│                                         │
│  Logo da loja                           │
│  ┌───────────────────────────────┐     │
│  │                               │     │
│  │   📤  Clique ou arraste       │     │
│  │       sua logo aqui           │     │
│  │   PNG ou JPG (max 5MB)        │     │
│  └───────────────────────────────┘     │
│  [🤖 Gerar logo com IA]                 │
│  [⏭️ Vou adicionar depois]              │
│                                         │
│  Cores da marca                         │
│  ┌─────────┐ ┌─────────┐               │
│  │ ███████ │ │ ███████ │               │
│  │ Primária│ │Secundá- │               │
│  │         │ │  ria    │               │
│  └─────────┘ └─────────┘               │
│  [🎨 Extrair cores do logo]             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Criar minha loja e começar      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ⚡ Calibrar inteligência da IA         │
│     (opcional - melhora campanhas)      │
│                                         │
└─────────────────────────────────────────┘
```

### Wireframe 3: Modal Fase 2 (Intelligence Calibration)

```
┌─────────────────────────────────────────┐
│  Calibre a inteligência do Vendeo   × │
├─────────────────────────────────────────┤
│  Quanto mais você conta sobre sua loja, │
│  melhores ficam as campanhas            │
│                                         │
│  [████████░░░░░░░] 5/15 preenchidos     │
│                                         │
│  ┌───┬───┬───┬───┬───┐                 │
│  │Tom│Pos│Con│Ling│   │ ← Abas        │
│  └───┴───┴───┴───┴───┘                 │
│                                         │
│  Tom de voz da marca                    │
│  ○ Formal                               │
│  ● Informal  ← selecionado              │
│  ○ Técnico                              │
│  ○ Divertido                            │
│                                         │
│  Público-alvo principal                 │
│  ┌────────────────────────────────┐    │
│  │Homens 30-50 anos, que curtem   │    │
│  │vinho, moram no bairro__________│    │
│  └────────────────────────────────┘    │
│  200 caracteres                         │
│                                         │
│  Picos sazonais                         │
│  ☑ Verão  ☑ Dia dos Pais  ☐ Natal      │
│  ☐ Black Friday  ☐ Outros               │
│                                         │
│  [Pular tudo]     [Salvar e próximo]   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎯 Recomendações UX

### 1. **Progressão Visual Clara**
- **Barra de progresso:** Sempre visível (1/4, 2/4, 3/4, 4/4)
- **Botão voltar:** Permite editar campos anteriores
- **Auto-save:** Campos salvos localmente (localStorage) se lojista abandonar e voltar

### 2. **Mobile-First (70% dos lojistas acessam via smartphone)**
- **Touch targets:** 48x48dp mínimo (botões, selects)
- **Inputs grandes:** Font-size 16px (evita zoom no iOS)
- **Teclado contextual:** type="tel" para telefone, type="url" para Instagram
- **Scroll suave:** Uma seção por vez (sem scroll infinito)

### 3. **Geração de Logo com IA (Fase 4)**
- **Flow:**
  1. Lojista clica "Gerar logo com IA"
  2. Modal: "Descreva o estilo da sua loja" (ex: "Moderna, minimalista, cores vibrantes")
  3. Gera 3 opções (Replicate API + Stable Diffusion?)
  4. Lojista escolhe → Preview instantâneo
  5. "Salvar logo" ou "Gerar novamente"
- **Fallback:** Se API falhar, mostrar templates pré-prontos (5-10 logos genéricos por segmento)

### 4. **Extração de Cores do Logo (Automática)**
- **Flow:**
  1. Lojista faz upload de logo
  2. Backend extrai paleta dominante (Vibrant.js ou ColorThief)
  3. Sugere primary_color e secondary_color
  4. Lojista pode aceitar ou ajustar manualmente
- **Benefício:** Reduz atrito (não precisa saber HEX codes)

### 5. **Fase 2 (Intelligence) como Gamificação**
- **Score de inteligência:** 0-100 (aumenta conforme preenche campos)
- **Badge visual:** "Inteligência Básica" (0-30), "Inteligência Média" (31-60), "Inteligência Avançada" (61-100)
- **Incentivo:** "Sua campanha será X% melhor com mais campos preenchidos"
- **Não bloqueia:** Lojista pode ignorar e usar depois

### 6. **Validação de Campos**
- **Telefone:** Máscara brasileira (47) 99999-9999, valida DDD
- **Instagram:** Aceita @usuario ou apenas usuario (adiciona @ automaticamente)
- **Estado:** Dropdown com lista de UFs (não deixa digitar errado)
- **Cidade:** Autocomplete via API ViaCEP ou IBGE (evita typos)

### 7. **Tom de Comunicação (Vendeo-Specific)**
- ✅ "Vamos conhecer sua loja" (informal, convidativo)
- ✅ "Deixa sua loja com a sua cara" (tom próximo, lojista é protagonista)
- ❌ "Preencha os dados cadastrais" (corporativo, frio)
- ❌ "Configure sua conta" (técnico, assustador)

### 8. **Tempo de Onboarding**
- **Meta:** Fase 1 < 2 minutos (4 telas, 8 campos)
- **Realista:** ~3 minutos (lojista precisa buscar logo, pensar em cores)
- **Fase 2 (opcional):** ~5 minutos (15 campos, mas pode preencher parcialmente)
- **Total:** 3-8 minutos (vs atual: <1 min MAS sem contexto útil)

### 9. **Onboarding Skip (Emergencial)**
- **Cenário:** Lojista com pressa, quer testar rápido
- **Solução:** Botão "Pular e usar configuração padrão"
  - Logo: NULL (usa placeholder genérico)
  - Cores: Verde/Azul padrão (#16A34A, #2563EB)
  - Segmento: Inferido de nome da loja? (ex: "Adega" → segmento adega)
  - Intelligence: JSONB vazio (IA usa defaults do segmento)
- **Warning:** "Suas primeiras campanhas serão genéricas. Você pode calibrar depois no dashboard."

### 10. **Integração com @brand-designer**
- **Flow pós-onboarding:**
  1. Lojista completa Fase 1 → cria store
  2. Backend chama @brand-designer (background job):
     - Valida logo (legibilidade, contraste)
     - Valida cores (WCAG AA para textos)
     - Gera Visual Signature (tabela `visual_signatures`)
  3. Se falhar validação: Banner no dashboard "⚠️ Seu logo precisa de ajustes" (link para re-upload)

---

## 📋 Checklist de Implementação (@dev)

### Backend (API `/api/onboarding/store`)
- [ ] Expandir payload para aceitar 8 campos da Fase 1:
  - [ ] `name`, `city`, `state` (já existem)
  - [ ] `main_segment` (string: "adega" | "farmacia" | "moda" | "beauty" | "home")
  - [ ] `phone`, `whatsapp`, `instagram` (strings)
  - [ ] `logo_url` (upload para Supabase Storage)
  - [ ] `primary_color`, `secondary_color` (strings HEX)
- [ ] Criar registro em `store_intelligence` (context JSONB vazio por padrão)
- [ ] Job background: Chamar @brand-designer para validar logo/cores

### Frontend (Fase 1 - 4 Telas)
- [ ] Criar `app/onboarding/store/identity/page.tsx` (Tela 1/4)
- [ ] Criar `app/onboarding/store/location/page.tsx` (Tela 2/4)
- [ ] Criar `app/onboarding/store/contact/page.tsx` (Tela 3/4)
- [ ] Criar `app/onboarding/store/branding/page.tsx` (Tela 4/4)
- [ ] Componente: `<SegmentSelector />` (ícones grandes, tappable)
- [ ] Componente: `<LogoUploader />` (drag & drop + preview)
- [ ] Componente: `<ColorPicker />` (duplo: primary + secondary)
- [ ] Componente: `<PhoneMaskInput />` (máscara brasileira)
- [ ] Progress bar (1/4, 2/4, 3/4, 4/4)
- [ ] Auto-save em localStorage (recovery se abandonar)

### Frontend (Fase 2 - Modal Intelligence)
- [ ] Criar `components/onboarding/IntelligenceCalibrationModal.tsx`
- [ ] 5 abas: Tom & Público, Posicionamento, Conversão, Linguagem, Resumo
- [ ] 15 campos mapeados para `store_intelligence.context` (JSONB v2.1)
- [ ] Score de inteligência (0-100) calculado por campos preenchidos
- [ ] API PATCH `/api/onboarding/intelligence` (atualiza store_intelligence)

### Integrações
- [ ] Upload de logo: Supabase Storage bucket `store-logos`
- [ ] Geração de logo com IA: Integrar Replicate API (Stable Diffusion?)
- [ ] Extração de cores: Integrar Vibrant.js ou ColorThief
- [ ] Validação de cores (WCAG AA): Integrar @brand-designer validation

---

## 🚀 Próximos Passos

1. **@pm / @po:** Validar estrutura de campos (8 básicos + 15 intelligence)
2. **@architect:** Definir arquitetura de upload (Supabase Storage) e jobs background
3. **@dev:** Implementar Fase 1 (4 telas, 8 campos)
4. **@ux-design-expert (Uma):** Prototipar no Figma (wireframes interativos)
5. **@qa:** Teste de usabilidade com lojista real (perfil 45-55 anos, baixa tech literacy)
6. **@devops:** Deploy de Fase 1 → testar com beta users
7. **Iteração:** Ajustar baseado em feedback → implementar Fase 2

---

## ✅ Critérios de Sucesso

| Métrica | Target | Como Medir |
|---------|--------|------------|
| **Tempo Fase 1** | <2 min | Analytics: onboarding_start → onboarding_complete |
| **Taxa de conclusão Fase 1** | 90%+ | % usuários que chegam à Tela 4/4 |
| **Taxa de ativação Fase 2** | 30%+ | % usuários que abrem modal de intelligence |
| **Campos preenchidos (Fase 2)** | Média 8/15 | Avg campos não-null em store_intelligence.context |
| **Qualidade da primeira campanha** | Approval rate 70%+ | % campanhas aprovadas sem regeneração |
| **Feedback lojista** | "Parece minha loja" (80%+) | Survey pós-primeira campanha |

---

**🎨 Documentação criada por:** @ux-design-expert (Uma)  
**🚀 Pronto para:** Review com @pm, @architect, @dev

**Versão:** 1.0 (Proposta inicial)  
**Status:** Aguardando validação
