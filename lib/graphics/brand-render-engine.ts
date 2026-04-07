import { BrandDNA, BrandBackgroundStyle, BrandBackgroundIntensity } from "../domain/stores/brand-dna";
import { SafeZones, Rect } from "../domain/campaigns/types";

export class BrandRenderEngine {
  private seed: string;
  private prng: () => number;

  constructor(seed: string) {
    this.seed = seed;
    this.prng = this.createPRNG(this.hashString(seed));
  }

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

  /**
   * Método Público 1: applyBackground()
   * Chamado antes da imagem do produto.
   * Materializa dna.background_treatment.style + dna.background_treatment.intensity.
   */
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

  /**
   * Método Público 2: applyOverTexture()
   * Chamado após toda a renderização do layout.
   */
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

  private hexToRgba(hex: string, alpha: number): string {
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
