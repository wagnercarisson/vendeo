# Plano Mestre V2: Vendeo Brand Identity Engine

Este documento detalha a arquitetura final do motor de identidade visual do Vendeo, transformando ideias em um **Design System Generativo** de nível profissional.

## User Review Required

> [!IMPORTANT]
> **Design Tokens**: Introduziremos uma camada intermediária entre o DNA e o Renderer. O Renderer consome tokens numéricos, não conceitos abstratos de "estilo".

> [!CAUTION]
> **Safe Zones**: A Camada de Variação (Seed) é estritamente proibida de atuar em áreas de conteúdo crítico (Preço, Headline, CTA) para garantir legibilidade 100%.

---

## 🏗️ Fase 1: Núcleo de Identidade (Brand DNA V2)

Objetivo: Criar um schema fechado e versionado para evitar caos no banco de dados.

### [MODIFY] [stores table](file:///g:/Projetos/vendeo/supabase/migrations/...)
- `brand_dna` (JSONB) com Schema Estrito:
  - `visual_style`: Enum(`minimal`, `bold`, `luxury`, `modern`, `playful`)
  - `tone_of_voice`: Enum(`premium`, `friendly`, `aggressive`, `informative`)
  - `visual_seed`: Hash único (UUID).
  - `version`: Inteiro para controle de quebras.
- `brand_dna_snapshot` (JSONB) na tabela `campaigns` para persistência histórica.

---

## 🎨 Fase 2: Design Tokens & Camada de Derivação

Objetivo: Isolar a lógica de marca do código de renderização.

### [NEW] [lib/graphics/tokens.ts]
Implementar `deriveBrandTokens(dna: BrandDNA): BrandTokens`:
- Mapeia o `visual_style` para valores reais de `border_radius`, `padding`, `shadow_intensity`.
- Converte cores de marca em esquemas de `background`, `surface` e `text_contrast`.

---

## 🖌️ Fase 3: Renderer em 4 Camadas com Safe Zones

Objetivo: Motor de renderização hierárquico e seguro.

#### [MODIFY] [lib/graphics/renderer.ts](file:///g:/Projetos/vendeo/lib/graphics/renderer.ts)

Refatoração para arquitetura modular:

1.  **`renderBaseLayout(ctx, layoutDef)`**: Define as `SafeZones` (áreas proibidas para a semente).
2.  **`renderBrandStyle(ctx, tokens)`**: Aplica o visual derivado dos Design Tokens.
3.  **`renderContent(ctx, data)`**: Injeta ativos de campanha (Produto, Copy).
4.  **`renderSeedVariation(ctx, seed, config)`**: 
    - **Regra de Ouro**: Só desenha nas áreas marcadas como `background_area`.
    - **SeedConfig**: Intensidade controlada (Noise, Patterns, Shapes).

---

## 🧠 Fase 4: Onboarding & Omnipresença

Objetivo: Reduzir a fricção e garantir a voz da marca.

- **Onboarding Inteligente**: IA sugere o DNA inicial baseado no `main_segment` e nome da loja.
- **Copy Alignment**: O `tone_of_voice` do DNA é o parâmetro mestre para todos os prompts de IA (Post, Reels, Planos).
- **Multi-filial**: DNA é compartilhado; variações de localidade (Endereço/WhatsApp) são aplicadas na Camada 3 (Content).

---

## 🛠️ Plano de Verificação

### Automated Tests
- **Mutation Test**: Alterar a versão do DNA e garantir que o renderer use o snapshot correto da campanha anterior.
- **Collision Test**: Validar se nenhum pixel da camada 4 (Seed) sobrepõe áreas de texto.

### Manual Verification
- Visualizar o Dashboard: "Sugestão de Identidade" gerada pela IA durante a criação da loja.
