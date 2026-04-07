/** @deprecated Substituído por brand-render-engine.ts (Fase 2 - Passo 5) */
import { BrandDNA, BrandVisualStyle } from "../domain/stores/brand-dna";
import { SafeZones, Rect } from "../domain/campaigns/types";

/**
 * SeedEngine - V4 Calibration (Degrau 5.1).
 * Gerador de variações estéticas controladas em duas fases.
 * @deprecated Use o BrandRenderEngine para maior conformidade com o BrandDNA.
 */
export class SeedEngine {
  private seed: string;
  private prng: () => number;

  constructor(seed: string) {
    this.seed = seed;
    this.prng = this.createPRNG(this.hashString(seed));
  }

  /**
   * FASE 1: FUNDO GENERATIVO
   * Pintado antes da imagem e do conteúdo.
   */
  public applyBackground(ctx: CanvasRenderingContext2D, dna: BrandDNA) {
    const aggression = dna.config.visual_aggression || 0.5;
    ctx.save();
    // Gradientes de marca com opacidade ajustada para "presença"
    this.drawDeterministicGradients(ctx, dna.palette.primary, dna.palette.secondary, aggression * 1.5);
    ctx.restore();
  }

  /**
   * FASE 2: OVER-TEXTURE (TEXTURA SOBREPOSTA)
   * Pintado após a imagem, protegendo estritamente blocos de texto/CTA.
   */
  public applyOverTexture(ctx: CanvasRenderingContext2D, dna: BrandDNA, zones: SafeZones) {
    const aggression = dna.config.visual_aggression || 0.5;

    ctx.save();
    
    // 1. BLINDAGEM DE CONTEÚDO (Clipar apenas o que deve ser limpo: Texto/Preço/CTA)
    this.applyLegibilityClipping(ctx, zones);

    // 2. APLICAR PADRÕES COM "VISIBILITY BOOST"
    this.drawBackgroundNoise(ctx, dna.visual_style, aggression);

    ctx.restore();
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
   * Proteção Rígida para áreas de leitura.
   * Recorta Áreas de Texto, Preço e Branding para mantê-las 100% limpas.
   */
  private applyLegibilityClipping(ctx: CanvasRenderingContext2D, zones: SafeZones) {
    ctx.beginPath();
    ctx.rect(0, 0, 1080, 1350); // Canvas Full

    // Áreas de proteção absoluta (Excluem o desenho do ruído/grão)
    const protectedAreas = [
      zones.text_area,
      zones.price_area,
      zones.cta_area,
      zones.branding_area,
    ].filter((z): z is Rect => !!z);

    for (const rect of protectedAreas) {
      // Usamos um leve respiro (padding) para a limpeza não parecer "colada" no texto
      ctx.moveTo(rect.x - 5, rect.y - 5);
      ctx.lineTo(rect.x - 5, rect.y + rect.h + 5);
      ctx.lineTo(rect.x + rect.w + 5, rect.y + rect.h + 5);
      ctx.lineTo(rect.x + rect.w + 5, rect.y - 5);
      ctx.closePath();
    }

    ctx.clip("evenodd");
  }

  private drawBackgroundNoise(ctx: CanvasRenderingContext2D, style: BrandVisualStyle, aggression: number) {
    // Visibility Boost: Dobramos o multiplicador de opacidade de 0.15 para 0.30
    const opacity = aggression * 0.30; 
    const density = aggression * 0.6;

    if (style === "minimal") {
      this.drawGrain(ctx, opacity * 0.2, 1);
    } else if (style === "luxury" || style === "modern") {
      this.drawGrain(ctx, opacity, 2); // Cinematic Grain
    } else if (style === "bold") {
      this.drawHalftone(ctx, opacity, density); // Technical Halftone
    }
  }

  private drawGrain(ctx: CanvasRenderingContext2D, opacity: number, dotSize: number) {
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    for (let i = 0; i < 8000; i++) { // Mais densidade
      const x = this.prng() * 1080;
      const y = this.prng() * 1350;
      ctx.fillRect(x, y, dotSize, dotSize);
    }
  }

  private drawHalftone(ctx: CanvasRenderingContext2D, opacity: number, density: number) {
    const step = 15 + (1 - density) * 35;
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    for (let x = 0; x < 1080; x += step) {
      for (let y = 0; y < 1350; y += step) {
        const radius = (this.prng() * step) / 2.5; 
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawDeterministicGradients(ctx: CanvasRenderingContext2D, primary: string, secondary: string, aggression: number) {
    const numGradients = Math.floor(aggression * 4);
    if (numGradients === 0) return;

    for (let i = 0; i < numGradients; i++) {
        const x1 = this.prng() * 1080;
        const y1 = this.prng() * 1350;
        const x2 = this.prng() * 1080;
        const y2 = this.prng() * 1350;
        
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, "transparent");
        // Opacidade um pouco mais alta para o background
        grad.addColorStop(1, `${primary}${Math.floor(aggression * 40).toString(16).padStart(2, '0')}`);
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1350);
    }
  }
}
