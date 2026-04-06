# Plano Mestre V3: Vendeo Brand Identity Engine (Final)

Este é o blueprint definitivo para o **Vendeo Brand Identity Engine**. Ele transforma o motor de artes em uma infraestrutura de produto de elite, garantindo determinismo, acessibilidade e escala industrial.

---

## 🏗️ Fase 1: Fundação de Identidade & Snapshots

Objetivo: Garantir que o sistema seja imutável e escalável.

### [MODIFY] [stores & campaigns tables]
- **`brand_dna`**: JSONB versionado (v1, v2...) no nível Store.
- **`layout_snapshot`**: Snapshot formal do layout utilizado (Ex: `split_v1`) na tabela Campaign.
- **`brand_dna_snapshot`**: Cópia local do DNA na campanha para consistência histórica eterna.

---

## 🎨 Fase 2: Token Intelligence & Contrast Engine

Objetivo: Inteligência de design desacoplada da renderização.

### [NEW] [lib/graphics/tokens.ts]
#### `deriveBrandTokens(dna, intensity: number)`
- **Contrast Engine**: Função `ensureContrast(color1, color2)` que ajusta automaticamente a luminância do texto/CTA para atingir o ratio WCAG AA (4.5:1).
- **Style Intensity (0.0 — 1.0)**: Multiplicador que afeta o vigor visual (ex: 0.2 = sutil, 0.8 = expressivo).
- **Token Cache**: Hashing do DNA para evitar reprocessamento desnecessário.

---

## 🖌️ Fase 3: Renderer Robusto em 4 Camadas

Objetivo: Renderização segura e ciente do contexto de conteúdo.

#### [MODIFY] [lib/graphics/renderer.ts]
Arquitetura de camadas blindada:

1.  **`renderBaseLayout(ctx, layoutSnapshot)`**: 
    - Define as **Safe Zones** formais (Rects para Background, Content, Text, CTA).
    - Aplica regras de `image_fit` e `text_alignment`.
2.  **`renderBrandStyle(ctx, tokens)`**: Aplica o visual derivado (Radius, Sombras, Fontes).
3.  **`renderContent(ctx, data, contentType)`**: 
    - Ajusta a "agressividade" do design baseado no `content_type` (Oferta vs Info vs Inst).
4.  **`renderSeedVariation(ctx, seed, config)`**: 
    - **Anti-Caos**: Restrita estritamente à `background_area`.
    - Proibida de alterar layout, tipografia ou contraste.

---

## 🛠️ Fase 4: Debug & Blindagem de Performance

- **Debug Mode**: Overlay visual que desenha as `Safe Zones` e IDs de tokens para troubleshooting em tempo real.
- **Experimental Flag**: Suporte nativo para variações de teste A/B sem quebrar o DNA global.
- **Motion Ready**: Tokens preparados para intercalação de tempo (interpolação), visando futura evolução para Reels/Motion.

---

## ✅ Plano de Verificação (Nível Elite)

### Automated Tests
- **Contrast Guard**: Teste de unidade que falha se os tokens gerarem um ratio de contraste < 4.5.
- **Version Guard**: Validar se uma campanha `layout_v1` renderiza idêntica após a introdução do `layout_v2`.

### Manual Verification
- Ativar o **Debug Overlay** e validar o isolamento da `Seed Layer` fora das áreas críticas de conteúdo.
