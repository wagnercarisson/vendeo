# Plano de Implementação — Passo 5: `brand-render-engine.ts`

> **Agente responsável:** implementação técnica (Fase 2 — Renderização)
> **Pré-requisito:** Fase 1 concluída e aprovada (28/28 testes passando)
> **Arquivo central:** `g:/Projetos/vendeo/lib/graphics/brand-render-engine.ts` *(criar novo)*
> **Arquivo de integração:** `g:/Projetos/vendeo/lib/graphics/renderer.ts` *(modificar — pontos exatos mapeados abaixo)*
> **Arquivo a aposentar:** `g:/Projetos/vendeo/lib/graphics/seed-engine.ts` *(NÃO deletar — renomear ou comentar cabeçalho)*

---

## Contexto

O `seed-engine.ts` atual gera:
- `applyBackground()` — gradientes aleatórios a ~8% de opacidade (invisíveis)
- `applyOverTexture()` — ruído de 1–2px com `opacity * 0.30` (não perceptível)

O `brand-render-engine.ts` substitui completamente esse comportamento. O papel muda de **"variar"** para **"materializar identidade editorial"** com base no `BrandDNA` resolvido.

---

## Contrato da API Pública (interface do novo engine)

O `renderer.ts` instancia e chama o engine exatamente assim:

```typescript
// Onde hoje existe:
const seedEngine = new SeedEngine(dna.visual_seed);
seedEngine.applyBackground(ctx, dna);
// ... renderização do layout ...
seedEngine.applyOverTexture(ctx, dna, layoutDef.zones);

// Passará a existir:
const brandEngine = new BrandRenderEngine(dna.visual_seed);
brandEngine.applyBackground(ctx, dna);
// ... renderização do layout (sem mudança) ...
brandEngine.applyOverTexture(ctx, dna, layoutDef.zones);
```

A assinatura dos métodos públicos é **idêntica** à do `SeedEngine`. Isso garante que o `renderer.ts` precise apenas de:
1. Trocar o `import`
2. Trocar o nome da classe instanciada

Nenhuma outra linha do `renderer.ts` muda no Passo 5.

---

## Arquivo a Criar: `lib/graphics/brand-render-engine.ts`

### Imports necessários

```typescript
import { BrandDNA, BrandBackgroundStyle, BrandBackgroundIntensity } from "../domain/stores/brand-dna";
import { SafeZones, Rect } from "../domain/campaigns/types";
```

> **Nota:** `SafeZones` e `Rect` já são usados pelo `seed-engine.ts` — os imports existem no projeto.

---

### Classe Principal

```typescript
export class BrandRenderEngine {
  private seed: string;
  private prng: () => number;

  constructor(seed: string) {
    this.seed = seed;
    this.prng = this.createPRNG(this.hashString(seed));
  }
```

Os métodos `createPRNG` e `hashString` são idênticos ao `seed-engine.ts` — copiar exatamente:

```typescript
  private createPRNG(a: number) {
    return () => {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
```

---

### Método Público 1: `applyBackground()`

**Chamado antes da imagem do produto.**
Materializa `dna.background_treatment.style` + `dna.background_treatment.intensity`.

```typescript
  public applyBackground(ctx: CanvasRenderingContext2D, dna: BrandDNA): void {
    const { style, intensity } = dna.background_treatment;
    const { primary, secondary, accent, neutral } = dna.palette;

    ctx.save();

    switch (style) {
      case "solid_clean":
        this.drawSolidBackground(ctx, neutral, intensity);
        break;
      case "gradient_brand_soft":
        this.drawGradientBackground(ctx, primary, secondary, intensity);
        break;
      case "geometric_bold":
        this.drawGeometricBackground(ctx, primary, accent, intensity);
        break;
      case "editorial_light":
        this.drawEditorialLightBackground(ctx, primary, neutral, intensity);
        break;
      case "editorial_shadow":
        this.drawEditorialShadowBackground(ctx, primary, secondary, intensity);
        break;
    }

    ctx.restore();
  }
```

#### Implementação de cada estilo de fundo

**`solid_clean`** — fundo de cor sólida, neutro. Intensidade afeta opacidade.
```typescript
  private drawSolidBackground(
    ctx: CanvasRenderingContext2D,
    neutral: string,
    intensity: BrandBackgroundIntensity
  ): void {
    const opacityMap = { subtle: 0.06, balanced: 0.12, expressive: 0.20 };
    const opacity = opacityMap[intensity];
    ctx.fillStyle = this.hexToRgba(neutral, opacity);
    ctx.fillRect(0, 0, 1080, 1350);
  }
```

**`gradient_brand_soft`** — gradiente suave derivado da paleta. Diagonal, dois stops.
```typescript
  private drawGradientBackground(
    ctx: CanvasRenderingContext2D,
    primary: string,
    secondary: string,
    intensity: BrandBackgroundIntensity
  ): void {
    const opacityMap = { subtle: 0.08, balanced: 0.15, expressive: 0.25 };
    const opacity = opacityMap[intensity];

    const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
    grad.addColorStop(0, this.hexToRgba(primary, opacity));
    grad.addColorStop(1, this.hexToRgba(secondary, opacity * 0.6));

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1350);
  }
```

**`geometric_bold`** — formas geométricas da marca (triângulos/retângulos). Posição deterministicamente derivada do `prng`.
```typescript
  private drawGeometricBackground(
    ctx: CanvasRenderingContext2D,
    primary: string,
    accent: string,
    intensity: BrandBackgroundIntensity
  ): void {
    const opacityMap = { subtle: 0.06, balanced: 0.12, expressive: 0.22 };
    const shapeCountMap = { subtle: 3, balanced: 5, expressive: 8 };
    const opacity = opacityMap[intensity];
    const count = shapeCountMap[intensity];

    for (let i = 0; i < count; i++) {
      const color = i % 2 === 0 ? primary : accent;
      const x = this.prng() * 1080;
      const y = this.prng() * 1350;
      const size = 80 + this.prng() * 220;
      const rotation = this.prng() * Math.PI * 2;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = this.hexToRgba(color, opacity);

      // Alterna entre retângulo e triângulo deterministicamente
      if (i % 3 === 0) {
        ctx.fillRect(-size / 2, -size / 2, size, size * 0.6);
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(size / 2, size / 2);
        ctx.lineTo(-size / 2, size / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }
```

**`editorial_light`** — composição com área de luz. Um foco de claridade no centro/topo.
```typescript
  private drawEditorialLightBackground(
    ctx: CanvasRenderingContext2D,
    primary: string,
    neutral: string,
    intensity: BrandBackgroundIntensity
  ): void {
    const opacityMap = { subtle: 0.07, balanced: 0.14, expressive: 0.22 };
    const opacity = opacityMap[intensity];

    // Foco de luz no topo-centro
    const radial = ctx.createRadialGradient(540, 200, 0, 540, 200, 700);
    radial.addColorStop(0, this.hexToRgba(neutral, opacity * 1.5));
    radial.addColorStop(0.5, this.hexToRgba(primary, opacity * 0.3));
    radial.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1080, 1350);
  }
```

**`editorial_shadow`** — composição com profundidade. Sombra lateral / vinheta.
```typescript
  private drawEditorialShadowBackground(
    ctx: CanvasRenderingContext2D,
    primary: string,
    secondary: string,
    intensity: BrandBackgroundIntensity
  ): void {
    const opacityMap = { subtle: 0.10, balanced: 0.18, expressive: 0.28 };
    const opacity = opacityMap[intensity];

    // Vinheta nas bordas com cor da marca
    const grad = ctx.createRadialGradient(540, 675, 200, 540, 675, 800);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.7, this.hexToRgba(primary, opacity * 0.4));
    grad.addColorStop(1, this.hexToRgba(secondary, opacity));

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1350);
  }
```

---

### Método Público 2: `applyOverTexture()`

**Chamado após toda a renderização do layout.**
Mantém a proteção das safe zones (herdada do seed-engine). Aplica apenas uma assinatura visual sutil — não ruído aleatório.

```typescript
  public applyOverTexture(
    ctx: CanvasRenderingContext2D,
    dna: BrandDNA,
    zones: SafeZones
  ): void {
    const { style, intensity } = dna.background_treatment;

    // Intensidade "subtle" não adiciona over-texture — o fundo já é leve o suficiente
    if (intensity === "subtle") return;

    ctx.save();
    this.applyLegibilityClipping(ctx, zones); // Protege text/price/cta/branding

    // Over-texture: apenas para estilos que ganham com profundidade adicional
    if (style === "editorial_shadow" || style === "geometric_bold") {
      const opacity = intensity === "expressive" ? 0.04 : 0.02;
      this.drawSubtleVignette(ctx, dna.palette.primary, opacity);
    }

    ctx.restore();
  }
```

#### `applyLegibilityClipping` — copiado exatamente do seed-engine.ts

```typescript
  private applyLegibilityClipping(ctx: CanvasRenderingContext2D, zones: SafeZones): void {
    ctx.beginPath();
    ctx.rect(0, 0, 1080, 1350);

    const protectedAreas = [
      zones.text_area,
      zones.price_area,
      zones.cta_area,
      zones.branding_area,
    ].filter((z): z is Rect => !!z);

    for (const rect of protectedAreas) {
      ctx.moveTo(rect.x - 5, rect.y - 5);
      ctx.lineTo(rect.x - 5, rect.y + rect.h + 5);
      ctx.lineTo(rect.x + rect.w + 5, rect.y + rect.h + 5);
      ctx.lineTo(rect.x + rect.w + 5, rect.y - 5);
      ctx.closePath();
    }

    ctx.clip("evenodd");
  }
```

#### `drawSubtleVignette` — vinheta leve na borda do canvas

```typescript
  private drawSubtleVignette(
    ctx: CanvasRenderingContext2D,
    primary: string,
    opacity: number
  ): void {
    const grad = ctx.createRadialGradient(540, 675, 400, 540, 675, 760);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, this.hexToRgba(primary, opacity));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1350);
  }
```

---

### Utilitário Interno: `hexToRgba()`

```typescript
  private hexToRgba(hex: string, alpha: number): string {
    // Garante que o hex está no formato correto antes de parsear
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
```

*(Esse é o fechamento da classe `BrandRenderEngine`.)*

---

## Modificações no `renderer.ts`

São **apenas 2 alterações** — import e nome da classe. Nenhuma lógica de layout muda.

### Alteração 1 — Linha 4: Trocar import

```typescript
// ANTES (linha 4):
import { SeedEngine } from "./seed-engine";

// DEPOIS:
import { BrandRenderEngine } from "./brand-render-engine";
```

### Alteração 2 — Instanciação nos 3 layouts (3 trechos idênticos)

Localizar por string `new SeedEngine(` — ocorre exatamente 3 vezes:
- Linha 354 (dentro de `drawSolidLayout`)
- Linha 508 (dentro de `drawFloatingLayout`)
- Linha 731 (dentro de `drawSplitLayout`)

```typescript
// ANTES (em cada um dos 3 locais):
const seedEngine = new SeedEngine(dna.visual_seed);

// DEPOIS (em cada um dos 3 locais):
const brandEngine = new BrandRenderEngine(dna.visual_seed);
```

Localizar por string `seedEngine.applyBackground` — ocorre exatamente 3 vezes:
- Linha 355 (solid)
- Linha 509 (floating)
- Linha 732 (split)

```typescript
// ANTES:
seedEngine.applyBackground(ctx, dna);

// DEPOIS:
brandEngine.applyBackground(ctx, dna);
```

Localizar por string `seedEngine.applyOverTexture` — ocorre exatamente 3 vezes:
- Linha 498 (solid)
- Linha 721 (floating)
- Linha 931 (split)

```typescript
// ANTES:
seedEngine.applyOverTexture(ctx, dna, layoutDef.zones);

// DEPOIS:
brandEngine.applyOverTexture(ctx, dna, layoutDef.zones);
```

**Total de linhas modificadas no `renderer.ts`: 7 linhas (1 import + 6 substituições de nome).**

---

## O que NÃO fazer no Passo 5

- ❌ NÃO modificar nenhuma outra linha do `renderer.ts`
- ❌ NÃO alterar `drawSolidLayout`, `drawFloatingLayout`, `drawSplitLayout`
- ❌ NÃO deletar o `seed-engine.ts` — adicionar comentário no topo: `/** @deprecated Substituído por brand-render-engine.ts (Fase 2) */`
- ❌ NÃO conectar ao plano semanal ou Pro
- ❌ NÃO implementar `image_treatment` ainda — isso é Passo 6

---

## Regra de Prioridade Visual (para o Passo 5)

O fundo gerado pelo `applyBackground()` deve ser sempre **subordinado ao produto**:

```
produto (foto)  > headline > preço > fundo
```

Na prática isso significa:
- Opacidades do fundo sempre abaixo de 0.30 (limites definidos por intensidade acima)
- O `applyBackground()` é chamado **antes** de `drawImageCover()` — a imagem cobre o fundo
- O `applyOverTexture()` é chamado **depois de tudo** — mas com `intensity === "subtle"` retorna sem desenhar nada

---

## Critérios de Aceitação do Passo 5

O Passo 5 está concluído quando:

1. `lib/graphics/brand-render-engine.ts` existe e compila sem erros TypeScript
2. `renderer.ts` importa `BrandRenderEngine` (não mais `SeedEngine`)
3. O servidor `npm run dev` sobe sem erros de compilação
4. Gerar uma campanha de uma loja do arquétipo `luxury` produz um fundo perceptivelmente diferente de uma loja do arquétipo `clean`
5. Gerar uma campanha de uma loja do arquétipo `impact` (geometric_bold, expressive) produz formas visíveis no fundo
6. Gerar 3 campanhas da mesma loja produz fundos visualmente consistentes (mesma família, não aleatórios)
7. Título, preço e CTA permanecem completamente legíveis em todos os layouts
