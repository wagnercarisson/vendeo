/**
 * Vendeo Brand DNA - Contrato de Domínio (Degrau 1)
 * 
 * Este arquivo define a estrutura central da identidade visual e verbal de uma marca.
 * O DNA é a fonte de verdade (genes) que o motor gráfico usará para derivar tokens
 * de renderização e variações visuais.
 */

export type BrandVisualStyle = "minimal" | "bold" | "luxury" | "modern";

export type BrandToneOfVoice =
  | "premium"
  | "friendly"
  | "aggressive"
  | "informative";

export type BrandHeadlineFont =
  | "sans_display"
  | "serif_elegant"
  | "rounded_bold";

export type BrandBodyFont = "sans_clean" | "serif_clean";

// === Novos Tipos (Fase 1 V2) ===
export type BrandTemperature = "warm" | "cool" | "neutral";

export type BrandImageFilter = "natural" | "warm" | "cool" | "high_contrast";

export type BrandBackgroundStyle =
  | "solid_clean"
  | "gradient_brand_soft"
  | "geometric_bold"
  | "editorial_light"
  | "editorial_shadow";

export type BrandBackgroundIntensity = "subtle" | "balanced" | "expressive";

export interface BrandImageTreatment {
  filter: BrandImageFilter;
  /** Range beta: -0.3 a +0.3 (0 = neutro) */
  warmth: number;
  /** Range beta: -0.2 a +0.2 */
  contrast: number;
  /** Range beta: -0.3 a 0 (nunca supersaturar) */
  saturation: number;
}

export interface BrandBackgroundTreatment {
  style: BrandBackgroundStyle;
  /** Escala opacidade, tamanho e contraste do fundo no renderer. */
  intensity: BrandBackgroundIntensity;
}

export interface BrandDNA {
  /** Versão do schema do DNA para suportar evolução futura. */
  version: number;

  /**
   * Identificador determinístico da variação visual da marca.
   * Gerado via hash do store.id para garantir estabilidade.
   */
  visual_seed: string;

  /** Estilo visual macro que orienta as decisões do renderer. */
  visual_style: BrandVisualStyle;

  /** Energia visual percebida. Derivada de hue + arquétipo + posicionamento. */
  brand_temperature: BrandTemperature;

  /**
   * Paleta de cores essenciais da marca.
   * Todas as cores em formato hexadecimal (Ex: #FFFFFF).
   */
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    /** Cinza modulado pela temperatura. Obrigatório no DNA resolvido. */
    neutral: string;
  };

  /** Intenção tipográfica da marca. */
  typography: {
    headline_font: BrandHeadlineFont;
    body_font: BrandBodyFont;
  };

  /** Define como a foto do produto é apresentada (filtros e ajustes suaves). */
  image_treatment: BrandImageTreatment;

  /** Define o estilo e a energia do fundo atrás do produto. */
  background_treatment: BrandBackgroundTreatment;

  /** Tom de voz para alinhamento de IA (Copy e Estratégia). */
  tone_of_voice: BrandToneOfVoice;

  /**
   * Posicionamento estratégico da marca.
   * Ex: "Sofisticação e qualidade no segmento de adega"
   */
  positioning: string;

  /** Governança e regras de uso do logotipo. */
  logo_usage?: {
    allow_monochrome: boolean;
  };

  config: {
    /**
     * Intensidade visual global da marca.
     * Range: 0.0 (mínimo) a 1.0 (máximo).
     */
    visual_aggression: number;
  };
}

