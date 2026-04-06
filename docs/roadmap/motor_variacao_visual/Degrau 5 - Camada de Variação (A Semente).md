# Degrau 5: Camada de Variação (A Semente)

Este degrau é o coração generativo do sistema. Vamos criar o motor que transforma a semente imutável da marca (`visual_seed`) em elementos visuais dinâmicos (ruído, grãos, texturas e padrões geométricos), respeitando rigorosamente as Safe Zones catalogadas no Degrau 4.

## User Review Required

> [!IMPORTANT]
> **Determinismo**: Uma mesma semente deve SEMPRE gerar exatamente o mesmo fundo. Usaremos um gerador de números pseudo-aleatórios (PRNG) focado em estabilidade.

> [!NOTE]
> **Subordinação**: A semente não cria a identidade visual sozinha; ela atua apenas na variação de fundo e textura, sempre subordinada às Safe Zones que protegem o conteúdo vital (texto/preço).

---

## Proposed Changes

### [Gráficos: Motor de Variação]

#### [NEW] [seed-engine.ts](file:///g:/Projetos/vendeo/lib/graphics/seed-engine.ts)
- Implementar a classe `SeedEngine` que recebe a semente (string).
- **PRNG de Hash**: Criar um pequeno utilitário para converter a string de semente em uma sequência de números entre 0 e 1.
- **Funções de Desenho Generativo**:
    - `applyNoiseGrain(ctx, dna)`: 
        - `luxury` / `modern` ➔ Ruído tipo **Grainy Film** (textura cinematográfica).
        - `bold` ➔ Padrão de **Meio-tom / Retícula** (Estilo pop/HQ).
        - `minimal` ➔ **Grão ultra sutil** (Quase imperceptível).
    - `applyDeterministicGradients(ctx, primary, secondary)`: Pinta gradientes baseados na semente.
- **Agressividade Visual**: O valor de `visual_aggression` controlará tanto a **opacidade** quanto a **densidade** (complexidade) dos padrões gerados.

### [Gráficos: Renderer]

#### [MODIFY] [renderer.ts](file:///g:/Projetos/vendeo/lib/graphics/renderer.ts)
- Integrar o `SeedEngine` no pipeline de renderização:
    - O Renderer passará o `brand_dna` e as `SafeZones` para o Seed Engine.
    - O Seed Engine desenhará a camada de variação antes do conteúdo principal.

---

## Decisões de Projeto (Fechadas)

1. **Intensidade**: Agressividade visual mapeia 1 para 1 com opacidade e densidade de partículas.
2. **Estética por Estilo**: O tipo de grão é decidido pelo `visual_style` do DNA, garantindo que uma marca "Luxury" nunca receba uma retícula "Bold" acidentalmente.

---

## Verification Plan

### Automated Tests
- Testar o determinismo: Chamar o `SeedEngine` 100 vezes com a mesma semente e validar se o hash do canvas resultante é idêntico.

### Manual Verification
- Renderizar uma arte com o Seed Engine ativado e validar visualmente se as áreas de texto (Safe Zones) continuam com contraste perfeito e legíveis.
