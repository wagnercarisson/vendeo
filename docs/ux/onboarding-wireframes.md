# 🎨 Onboarding Progressivo — Wireframes Detalhados
**Agent:** @ux-design-expert (Uma)  
**Data:** 2026-04-30  
**Versão:** Mobile-First (375x667px — iPhone SE)

---

## FASE 1: Dados Básicos (4 Telas)

### Tela 1/4: Identidade da Loja

```
┌───────────────────────────────────────────┐
│  ←                   [●○○○] 1/4           │ ← Header fixo
├───────────────────────────────────────────┤
│                                           │
│  🏪                                       │
│  Vamos conhecer sua loja                  │ ← Título (28px, bold)
│                                           │
│  Isso ajuda o Vendeo a criar              │
│  campanhas com a cara do seu              │ ← Subtítulo (14px, muted)
│  negócio                                  │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ Nome da loja *                      │ │ ← Label (12px, bold)
│  ├─────────────────────────────────────┤ │
│  │ Ex: Adega do Bairro                 │ │ ← Input (16px, placeholder)
│  └─────────────────────────────────────┘ │
│                                           │
│  Segmento da loja *                       │ ← Label (12px, bold)
│                                           │
│  ┌───────┐ ┌───────┐ ┌───────┐           │
│  │   🍷  │ │   💊  │ │   👗  │           │ ← Card 80x80px (tappable)
│  │       │ │       │ │       │           │
│  │ Adega │ │Farmá- │ │ Moda  │           │ ← Label (12px)
│  │       │ │ cia   │ │       │           │
│  └───────┘ └───────┘ └───────┘           │
│                                           │
│  ┌───────┐ ┌───────┐                     │
│  │   💄  │ │   🏠  │                     │
│  │       │ │       │                     │
│  │Beauty │ │ Casa/ │                     │
│  │       │ │ Decor │                     │
│  └───────┘ └───────┘                     │
│                                           │
│                                           │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │          Continuar                  │ │ ← CTA (48px altura, verde)
│  └─────────────────────────────────────┘ │
│                                           │
└───────────────────────────────────────────┘

Estados:
- CTA desabilitado (opacity 0.5) se nome OU segmento vazios
- Segmento selecionado: borda verde 2px
- Input focus: ring verde 2px

Acessibilidade:
- Touch targets: 80x80px (segmentos), 48px (CTA)
- Font-size input: 16px (evita zoom iOS)
- Labels com for= (screen readers)
```

---

### Tela 2/4: Localização

```
┌───────────────────────────────────────────┐
│  ←                   [●●○○] 2/4           │
├───────────────────────────────────────────┤
│                                           │
│  📍                                       │
│  Onde sua loja fica?                      │
│                                           │
│  O Vendeo usa isso pra criar              │
│  campanhas relevantes pro seu             │
│  bairro                                   │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ Cidade *                            │ │
│  ├─────────────────────────────────────┤ │
│  │ Ex: Ibirama                         │ │ ← Autocomplete (ViaCEP API)
│  └─────────────────────────────────────┘ │
│  └── 📍 Sugestões:                        │ ← Dropdown autocomplete
│      • Ibirama, SC                        │
│      • Ibirá, SP                          │
│                                           │
│  ┌──────────────────┐ ┌────────────────┐ │
│  │ Estado *         │ │ UF             │ │ ← Grid 2 colunas
│  ├──────────────────┤ ├────────────────┤ │
│  │ Santa Catarina   │ │ SC ▼           │ │ ← Select dropdown
│  └──────────────────┘ └────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ Bairro (opcional)                   │ │
│  ├─────────────────────────────────────┤ │
│  │ Ex: Centro                          │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  💡 Dica: O bairro ajuda a criar          │ ← Hint (12px, muted)
│     campanhas com contexto local          │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │          Continuar                  │ │
│  └─────────────────────────────────────┘ │
│                                           │
└───────────────────────────────────────────┘

Interações:
- Autocomplete cidade: dispara após 3 caracteres
- Select estado: pré-filtra por região (Sul, Sudeste...)
- Bairro: opcional mas recomendado (hint visível)

Validações:
- Cidade + Estado obrigatórios
- Bairro opcional (não bloqueia CTA)
```

---

### Tela 3/4: Contato

```
┌───────────────────────────────────────────┐
│  ←                   [●●●○] 3/4           │
├───────────────────────────────────────────┤
│                                           │
│  💬                                       │
│  Como o cliente fala com você?            │
│                                           │
│  Essas infos vão aparecer nas             │
│  suas campanhas                           │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ Telefone/WhatsApp *                 │ │
│  ├─────────────────────────────────────┤ │
│  │ (47) 99999-9999                     │ │ ← Máscara automática
│  └─────────────────────────────────────┘ │
│                                           │
│  ☑ Esse número também é WhatsApp          │ ← Checkbox (checked padrão)
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ Instagram (opcional)                │ │
│  ├─────────────────────────────────────┤ │
│  │ @sualojaaqui                        │ │ ← @ automático se não digitar
│  └─────────────────────────────────────┘ │
│                                           │
│  💡 Dica: Instagram ajuda em              │
│     campanhas de redes sociais            │
│                                           │
│                                           │
│                                           │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │          Continuar                  │ │
│  └─────────────────────────────────────┘ │
│                                           │
└───────────────────────────────────────────┘

Comportamentos:
- Máscara telefone: (XX) XXXXX-XXXX (Brasil)
- Valida DDD: aceita 11-99
- Instagram: adiciona @ se usuário não digitou
- Checkbox desmarcado → campo "WhatsApp" separado aparece (hidden por padrão)

Mobile:
- Keyboard type="tel" para telefone
- Keyboard type="text" para Instagram (com @ sugerido)
```

---

### Tela 4/4: Identidade Visual (Versão Completa)

```
┌───────────────────────────────────────────┐
│  ←                   [●●●●] 4/4           │
├───────────────────────────────────────────┤
│                                           │
│  🎨                                       │
│  Deixa sua loja com a sua cara            │
│                                           │
│  O Vendeo usa logo e cores pra            │
│  criar campanhas com a identidade         │
│  da sua marca                             │
│                                           │
│  Logo da loja                             │
│  ┌─────────────────────────────────────┐ │
│  │                                     │ │
│  │         📤                          │ │ ← Dropzone (150px altura)
│  │    Clique ou arraste                │ │
│  │     sua logo aqui                   │ │
│  │                                     │ │
│  │  PNG ou JPG (max 5MB)               │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │  🤖 Gerar logo com IA                │ │ ← Button secundário
│  └─────────────────────────────────────┘ │
│                                           │
│  ⏭️ Vou adicionar depois                  │ ← Link (skip logo)
│                                           │
│  Cores da marca                           │
│  ┌──────────────┐ ┌──────────────┐       │
│  │  ███████████ │ │  ███████████ │       │ ← Color preview 60px
│  │  Primária    │ │  Secundária  │       │
│  │  #16A34A ▼   │ │  #2563EB ▼   │       │ ← Picker dropdown
│  └──────────────┘ └──────────────┘       │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │  🎨 Extrair cores do logo           │ │ ← Aparece após upload
│  └─────────────────────────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │   Criar minha loja e começar        │ │ ← CTA primário (verde, bold)
│  └─────────────────────────────────────┘ │
│                                           │
│  ⚡ Calibrar inteligência da IA           │ ← Link secundário (Fase 2)
│     (opcional - melhora campanhas)        │
│                                           │
└───────────────────────────────────────────┘

Estados Visuais:
┌─────────────────────────────────────────┐
│  APÓS UPLOAD DE LOGO:                   │
│  ┌─────────────────────────────────────┐│
│  │        [Preview logo 120x120]       ││ ← Thumbnail centralizada
│  │        ✕ Remover                    ││ ← Link remover (top-right)
│  └─────────────────────────────────────┘│
│  ✅ Logo adicionada!                     │
│  ┌─────────────────────────────────────┐│
│  │  🎨 Extrair cores do logo           ││ ← Botão ativo
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  APÓS CLICAR "Gerar logo com IA":       │
│  ┌─────────────────────────────────────┐│
│  │  Descreva o estilo da sua loja      ││ ← Modal full-screen
│  │  ┌───────────────────────────────┐  ││
│  │  │ Moderna, minimalista, cores   │  ││ ← Textarea
│  │  │ vibrantes                     │  ││
│  │  └───────────────────────────────┘  ││
│  │  [Gerar 3 opções]                   ││ ← CTA
│  └─────────────────────────────────────┘│
│  ... (carregando 10s) ...               │
│  ┌─────────────────────────────────────┐│
│  │  Escolha uma opção:                 ││
│  │  [Logo A] [Logo B] [Logo C]         ││ ← Grid 3 opções
│  │  [Gerar novamente] [Usar esta]      ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘

Validações:
- Logo opcional (pode pular)
- Cores obrigatórias (padrão #16A34A, #2563EB se não customizar)
- Extração de cores só aparece se logo foi enviada
```

---

## FASE 2: Intelligence Calibration (Modal)

### Estrutura Geral do Modal

```
┌───────────────────────────────────────────┐
│  Calibre a inteligência do Vendeo      × │ ← Close button (top-right)
├───────────────────────────────────────────┤
│  Quanto mais você conta sobre sua loja,   │
│  melhores ficam as campanhas              │
│                                           │
│  [████████░░░░░░░░░] 5/15 preenchidos     │ ← Progresso (verde)
│  Score: 33/100 (Inteligência Básica 🥉)   │ ← Badge visual
│                                           │
│  ┌───┬───┬───┬───┬───┐                   │
│  │Tom│Pos│Con│Ling│Sum│ ← Abas (5 tabs) │
│  └───┴───┴───┴───┴───┘                   │
│  ────────────────────────                │ ← Active tab indicator
│                                           │
│  [CONTEÚDO DA ABA ATIVA]                  │ ← 400px altura (scroll)
│  (ver detalhes abaixo)                    │
│                                           │
│                                           │
│  ┌──────────────┐  ┌──────────────────┐  │
│  │ Pular tudo   │  │ Próxima aba      │  │ ← CTAs contextuais
│  └──────────────┘  └──────────────────┘  │
│                                           │
└───────────────────────────────────────────┘

Comportamento:
- Modal abre full-screen (mobile) ou slide-in lateral (desktop)
- Progresso atualiza em tempo real (auto-save)
- Pode fechar e voltar depois (campos salvos em localStorage)
- "Pular tudo" → fecha modal, salva o que foi preenchido
- "Próxima aba" → avança (sem obrigação de preencher tudo)
```

---

### Aba 1: Tom & Público

```
┌───────────────────────────────────────────┐
│  [Tom & Público] Posicionamento Conversão │ ← Tab ativa (bold + underline)
├───────────────────────────────────────────┤
│                                           │
│  Tom de voz da marca                      │
│  ○ Formal ("Prezado cliente...")          │
│  ● Informal ("E aí, galera!") ← selected  │
│  ○ Técnico ("Produto com certificação")   │
│  ○ Divertido ("Vem que tem promoção! 🎉") │
│                                           │
│  Público-alvo principal                   │
│  ┌─────────────────────────────────────┐ │
│  │ Homens 30-50 anos, que curtem       │ │ ← Textarea (200 chars)
│  │ vinho, moram no bairro              │ │
│  └─────────────────────────────────────┘ │
│  120/200 caracteres                       │ ← Counter
│                                           │
│  Picos sazonais                           │
│  ☑ Verão  ☑ Dia dos Pais  ☐ Natal        │ ← Checkboxes multi-select
│  ☐ Black Friday  ☐ Páscoa  ☐ Outros      │
│  ┌─────────────────────────────────────┐ │
│  │ Outros eventos (opcional)           │ │ ← Input condicional (se "Outros")
│  └─────────────────────────────────────┘ │
│                                           │
│  Principais diferenciais                  │
│  ┌─────────────────────────────────────┐ │
│  │ Atendimento personalizado,          │ │ ← Textarea (300 chars)
│  │ entrega rápida, produtos            │ │
│  │ exclusivos                          │ │
│  └─────────────────────────────────────┘ │
│  85/300 caracteres                        │
│                                           │
│  Produtos top 5                           │
│  ┌─────────────────────────────────────┐ │
│  │ 1. Vinho Chileno             [× ]   │ │ ← Lista dinâmica (+ remover)
│  │ 2. Cerveja Artesanal         [× ]   │ │
│  │ 3. Whisky Premium            [× ]   │ │
│  └─────────────────────────────────────┘ │
│  [+ Adicionar produto] (max 5)            │
│                                           │
│  ┌──────────────┐  ┌──────────────────┐  │
│  │ Pular tudo   │  │ Próxima aba      │  │
│  └──────────────┘  └──────────────────┘  │
│                                           │
└───────────────────────────────────────────┘

Validações:
- Todos campos opcionais (nenhum obrigatório)
- Produtos: max 5 itens
- Textarea: counter visível, soft limit (não bloqueia)
```

---

### Aba 2: Posicionamento

```
┌───────────────────────────────────────────┐
│  Tom & Público [Posicionamento] Conversão │
├───────────────────────────────────────────┤
│                                           │
│  Posicionamento de preço                  │
│  ┌─────────────────────────────────────┐ │
│  │ Médio ("Equilíbrio preço/qualidade")│ │ ← Select dropdown
│  └─────────────────────────────────────┘ │
│  Opções:                                  │
│  - Econômico ("Preço baixo, valor alto")  │
│  - Médio                                  │
│  - Premium ("Produtos selecionados")      │
│  - Luxo ("Alta qualidade, exclusividade") │
│                                           │
│  Ticket médio (R$)                        │
│  ┌─────────────────────────────────────┐ │
│  │ 150                                 │ │ ← Number input (BRL)
│  └─────────────────────────────────────┘ │
│  💡 Ajuda a IA calibrar urgência e CTAs   │
│                                           │
│  Principais concorrentes                  │
│  ┌─────────────────────────────────────┐ │
│  │ 1. Adega Concorrente A       [× ]   │ │ ← Lista dinâmica (max 3)
│  │ 2. Supermercado Local        [× ]   │ │
│  └─────────────────────────────────────┘ │
│  [+ Adicionar concorrente] (max 3)        │
│                                           │
│  Proposta única de venda (USP)            │
│  ┌─────────────────────────────────────┐ │
│  │ Único com entrega em 30 min no      │ │ ← Textarea (200 chars)
│  │ bairro                              │ │
│  └─────────────────────────────────────┘ │
│  45/200 caracteres                        │
│                                           │
│  Dores do cliente que você resolve        │
│  ☑ Falta de tempo  ☐ Preço alto           │ ← Checkboxes multi-select
│  ☑ Falta de variedade  ☐ Atendimento ruim │
│  ☐ Entrega demorada  ☐ Outros             │
│  ┌─────────────────────────────────────┐ │
│  │ Outras dores (opcional)             │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  ┌──────────────┐  ┌──────────────────┐  │
│  │ ← Voltar     │  │ Próxima aba      │  │
│  └──────────────┘  └──────────────────┘  │
│                                           │
└───────────────────────────────────────────┘
```

---

### Aba 3: Conversão

```
┌───────────────────────────────────────────┐
│  Tom & Público Posicionamento [Conversão] │
├───────────────────────────────────────────┤
│                                           │
│  Gatilhos de conversão                    │
│                                           │
│  Urgência nas promoções                   │
│  ┌──────────────────────────────────────┐│
│  │  ○─────●─────────────────○           ││ ← Slider (0-10)
│  │  0     5                10           ││
│  └──────────────────────────────────────┘│
│                                           │
│  Usa "últimas unidades" / "estoque limit."│
│  ┌──────────────────────────────────────┐│
│  │  ○───────────●───────────○           ││ ← Slider (0-10)
│  │  0           7          10           ││
│  └──────────────────────────────────────┘│
│                                           │
│  ☑ Tem avaliações/depoimentos de clientes │ ← Checkbox
│  ☑ Oferece garantia estendida ou troca    │
│                                           │
│  CTAs que já funcionaram                  │
│  ┌─────────────────────────────────────┐ │
│  │ CTA: Compre agora e ganhe 10%       │ │ ← Lista dinâmica (max 3)
│  │ Contexto: Black Friday 2025  [× ]   │ │
│  │ ───────────────────────────────────│ │
│  │ CTA: Últimas unidades!              │ │
│  │ Contexto: Promoção dia das mães [×] │ │
│  └─────────────────────────────────────┘ │
│  [+ Adicionar CTA] (max 3)                │
│                                           │
│  Eventos locais importantes               │
│  ┌─────────────────────────────────────┐ │
│  │ Festa do Colono (outubro),          │ │ ← Textarea (150 chars)
│  │ Sommerfest (janeiro)                │ │
│  └─────────────────────────────────────┘ │
│  💡 IA cria campanhas alinhadas com       │
│     calendário local                      │
│                                           │
│  ┌──────────────┐  ┌──────────────────┐  │
│  │ ← Voltar     │  │ Próxima aba      │  │
│  └──────────────┘  └──────────────────┘  │
│                                           │
└───────────────────────────────────────────┘
```

---

### Aba 4: Linguagem (v2.1 Avançado)

```
┌───────────────────────────────────────────┐
│  Posicionamento Conversão [Linguagem] Sum │
├───────────────────────────────────────────┤
│                                           │
│  Preferências de linguagem                │
│                                           │
│  ☑ Usa gírias regionais (ex: tchê, uai)   │ ← Checkbox
│                                           │
│  Conforto com emojis                      │
│  ┌──────────────────────────────────────┐│
│  │  ○───●───────────────────○           ││ ← Slider (0-10)
│  │  0   3                  10           ││
│  │  Nenhum → Poucos → Muitos            ││
│  └──────────────────────────────────────┘│
│                                           │
│  Nível de formalidade                     │
│  ┌─────────────────────────────────────┐ │
│  │ Informal                            │ │ ← Select dropdown
│  └─────────────────────────────────────┘ │
│  Opções: Muito formal, Formal, Neutro,    │
│          Informal, Muito informal         │
│                                           │
│  Max exclamações por copy                 │
│  ┌──────────────────────────────────────┐│
│  │  ○─────●─────────────────○           ││ ← Slider (0-5)
│  │  0     2                 5           ││
│  └──────────────────────────────────────┘│
│                                           │
│  Tamanho de copy preferido                │
│  ○ Curto e direto                         │ ← Radio buttons
│     Título: 5-7 palavras | Corpo: 15-20   │
│  ● Médio ← selected                       │
│     Título: 8-10 palavras | Corpo: 25-35  │
│  ○ Detalhado                              │
│     Título: 10-12 palavras | Corpo: 40-50 │
│                                           │
│  Preview: [Campanha exemplo - tamanho médio]│ ← Visual feedback
│                                           │
│  ┌──────────────┐  ┌──────────────────┐  │
│  │ ← Voltar     │  │ Ver resumo       │  │
│  └──────────────┘  └──────────────────┘  │
│                                           │
└───────────────────────────────────────────┘
```

---

### Aba 5: Resumo Final

```
┌───────────────────────────────────────────┐
│  Conversão Linguagem [Resumo]             │
├───────────────────────────────────────────┤
│                                           │
│  🎉 Calibração concluída!                 │
│                                           │
│  Você preencheu 12/15 campos              │ ← Count visual
│                                           │
│  ┌──────────────────────────────────────┐│
│  │  [████████████████░░░] 80/100        ││ ← Barra verde
│  │  Inteligência Avançada 🥇            ││ ← Badge
│  └──────────────────────────────────────┘│
│                                           │
│  A IA já pode gerar campanhas             │
│  personalizadas pra você!                 │
│                                           │
│  Campos preenchidos:                      │
│  ✅ Tom de voz: Informal                  │ ← Lista resumida
│  ✅ Público-alvo: Homens 30-50 anos       │
│  ✅ Picos sazonais: Verão, Dia dos Pais   │
│  ✅ Diferenciais: Atendimento, entrega... │
│  ✅ Produtos top: Vinho Chileno, Cerveja..│
│  ✅ Posicionamento: Médio                 │
│  ✅ Ticket médio: R$ 150                  │
│  ✅ USP: Entrega 30 min                   │
│  ⊘ Concorrentes: Não preenchido           │ ← Campos vazios (muted)
│  ⊘ Dores do cliente: Não preenchido       │
│  ...                                      │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │  Gerar minha primeira campanha      │ │ ← CTA primário (verde, bold)
│  └─────────────────────────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │  Voltar pro dashboard               │ │ ← CTA secundário
│  └─────────────────────────────────────┘ │
│                                           │
│  ← Voltar pra editar                      │ ← Link (permite revisar)
│                                           │
└───────────────────────────────────────────┘

Comportamento:
- Score calculado automaticamente: (campos preenchidos / 15) * 100
- Badge dinâmico:  0-30 = Básica 🥉
                  31-60 = Média 🥈
                  61-100 = Avançada 🥇
- Lista campos preenchidos (✅) vs vazios (⊘)
- "Gerar primeira campanha" → fecha modal, redireciona pro gerador
- "Voltar pro dashboard" → fecha modal, mantém dados salvos
```

---

## Componentes Reutilizáveis (Design System)

### 1. Componente: ProgressBar
```typescript
<ProgressBar current={1} total={4} />
// Renderiza: [●○○○] 1/4
```

### 2. Componente: SegmentSelector
```typescript
<SegmentSelector 
  value={segment}
  onChange={setSegment}
  options={[
    { value: 'adega', icon: '🍷', label: 'Adega' },
    { value: 'farmacia', icon: '💊', label: 'Farmácia' },
    // ...
  ]}
/>
```

### 3. Componente: PhoneMaskInput
```typescript
<PhoneMaskInput 
  value={phone}
  onChange={setPhone}
  mask="(XX) XXXXX-XXXX"
  type="tel"
/>
```

### 4. Componente: LogoUploader
```typescript
<LogoUploader
  onUpload={handleLogoUpload}
  onGenerate={handleGenerateWithAI}
  onSkip={handleSkipLogo}
/>
```

### 5. Componente: ColorPicker
```typescript
<ColorPicker
  label="Primária"
  value={primaryColor}
  onChange={setPrimaryColor}
/>
```

### 6. Componente: IntelligenceScoreBadge
```typescript
<IntelligenceScoreBadge score={80} />
// Renderiza: "80/100 (Inteligência Avançada 🥇)"
```

---

## Responsividade: Desktop vs Mobile

### Mobile (375px - iPhone SE)
- Telas full-screen (100vw, 100vh)
- Progress bar top (fixo)
- Inputs: font-size 16px (evita zoom)
- Touch targets: 48x48dp mínimo
- Keyboard contextual (tel, url, text)
- Modal Fase 2: full-screen

### Desktop (1024px+)
- Telas centralizadas (max-width 600px)
- Progress bar top (relativo)
- Inputs: font-size 14px
- Hover states (botões, segmentos)
- Modal Fase 2: slide-in lateral (400px largura)

---

**🎨 Wireframes criados por:** @ux-design-expert (Uma)  
**📄 Referência:** `docs/ux/onboarding-progressive-redesign.md`  
**🚀 Status:** Pronto para prototipação (Figma) e implementação
