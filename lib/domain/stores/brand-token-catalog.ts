import {
  BrandBackgroundIntensity,
  BrandBackgroundStyle,
  BrandBodyFont,
  BrandHeadlineFont,
  BrandImageFilter,
  BrandTemperature,
  BrandToneOfVoice,
  BrandVisualStyle,
} from "./brand-dna";

export type BrandArchetype =
  | "luxury"
  | "editorial"
  | "sensorial"
  | "friendly"
  | "clean"
  | "impact"
  | "precision"
  | "trust"
  | "modern";

export const SEGMENT_TO_ARCHETYPE: Record<string, BrandArchetype> = {
  // Luxury / Sofistiação
  adega: "luxury",
  bebida: "luxury",
  vinho: "luxury",
  joalheria: "luxury",
  relogio: "luxury",

  // Editorial / Moda
  boutique: "editorial",
  moda: "editorial",
  vestuario: "editorial",
  calcado: "editorial",
  acessorio: "editorial",
  fashion: "editorial",

  // Sensorial / Gastronomia
  restaurante: "sensorial",
  alimentacao: "sensorial",
  food: "sensorial",
  cafe: "sensorial",
  doceria: "sensorial",
  padaria: "sensorial",
  hamburgueria: "sensorial",

  // Friendly / Proximidade
  pet: "friendly",
  "pet shop": "friendly",
  animal: "friendly",
  veterinaria: "friendly",
  brinquedo: "friendly",
  infantil: "friendly",

  // Clean / Saúde e Bem-estar
  farmacia: "clean",
  drogaria: "clean",
  saude: "clean",
  clinica: "clean",
  estetica: "clean",
  cosmetico: "clean",
  perfumaria: "clean",

  // Impact / Varejo Popular
  mercado: "impact",
  supermercado: "impact",
  varejo: "impact",
  hortifruti: "impact",
  acougue: "impact",
  promocao: "impact",

  // Precision / Tecnologia
  tech: "precision",
  eletronico: "precision",
  tecnologia: "precision",
  informatica: "precision",
  celular: "precision",

  // Trust / Serviços Profissionais
  servico: "trust",
  contabilidade: "trust",
  advocacia: "trust",
  imobiliaria: "trust",
  seguro: "trust",
  oficina: "trust",

  // Padrão
  outro: "modern",
};

export interface ArchetypeTokens {
  visual_style: BrandVisualStyle;
  visual_aggression: number;
  headline_font: BrandHeadlineFont;
  body_font: BrandBodyFont;
  tone_of_voice: BrandToneOfVoice;
  temperature_base: BrandTemperature;
  background_style: BrandBackgroundStyle;
  background_intensity: BrandBackgroundIntensity;
  image_filter: BrandImageFilter;
  default_primary: string;
  positioning_template: string;
}

export const ARCHETYPE_CATALOG: Record<BrandArchetype, ArchetypeTokens> = {
  luxury: {
    visual_style: "luxury",
    visual_aggression: 0.4,
    headline_font: "serif_elegant",
    body_font: "sans_clean",
    tone_of_voice: "premium",
    temperature_base: "warm",
    background_style: "editorial_shadow",
    background_intensity: "balanced",
    image_filter: "warm",
    default_primary: "#7B2D2D",
    positioning_template: "Sofisticação e qualidade no segmento de {segment}",
  },
  editorial: {
    visual_style: "minimal",
    visual_aggression: 0.35,
    headline_font: "serif_elegant",
    body_font: "sans_clean",
    tone_of_voice: "premium",
    temperature_base: "cool",
    background_style: "editorial_light",
    background_intensity: "subtle",
    image_filter: "natural",
    default_primary: "#2C3E50",
    positioning_template: "Elegância e tendência em {segment}",
  },
  sensorial: {
    visual_style: "luxury",
    visual_aggression: 0.5,
    headline_font: "serif_elegant",
    body_font: "sans_clean",
    tone_of_voice: "friendly",
    temperature_base: "warm",
    background_style: "editorial_light",
    background_intensity: "balanced",
    image_filter: "warm",
    default_primary: "#8B4513",
    positioning_template: "Experiência e sabor em {segment}",
  },
  friendly: {
    visual_style: "modern",
    visual_aggression: 0.55,
    headline_font: "rounded_bold",
    body_font: "sans_clean",
    tone_of_voice: "friendly",
    temperature_base: "neutral",
    background_style: "gradient_brand_soft",
    background_intensity: "balanced",
    image_filter: "natural",
    default_primary: "#2E7D32",
    positioning_template: "Proximidade e cuidado com {segment}",
  },
  clean: {
    visual_style: "minimal",
    visual_aggression: 0.3,
    headline_font: "sans_display",
    body_font: "sans_clean",
    tone_of_voice: "informative",
    temperature_base: "cool",
    background_style: "solid_clean",
    background_intensity: "subtle",
    image_filter: "cool",
    default_primary: "#1565C0",
    positioning_template: "Confiança e bem-estar em {segment}",
  },
  impact: {
    visual_style: "bold",
    visual_aggression: 0.75,
    headline_font: "rounded_bold",
    body_font: "sans_clean",
    tone_of_voice: "friendly",
    temperature_base: "neutral",
    background_style: "geometric_bold",
    background_intensity: "expressive",
    image_filter: "high_contrast",
    default_primary: "#C62828",
    positioning_template: "Energia e melhores ofertas em {segment}",
  },
  precision: {
    visual_style: "modern",
    visual_aggression: 0.6,
    headline_font: "sans_display",
    body_font: "sans_clean",
    tone_of_voice: "informative",
    temperature_base: "cool",
    background_style: "gradient_brand_soft",
    background_intensity: "balanced",
    image_filter: "cool",
    default_primary: "#212121",
    positioning_template: "Precisão e tecnologia para {segment}",
  },
  trust: {
    visual_style: "minimal",
    visual_aggression: 0.4,
    headline_font: "sans_display",
    body_font: "sans_clean",
    tone_of_voice: "informative",
    temperature_base: "neutral",
    background_style: "solid_clean",
    background_intensity: "subtle",
    image_filter: "natural",
    default_primary: "#37474F",
    positioning_template: "Credibilidade e excelência em {segment}",
  },
  modern: {
    visual_style: "modern",
    visual_aggression: 0.5,
    headline_font: "sans_display",
    body_font: "sans_clean",
    tone_of_voice: "friendly",
    temperature_base: "neutral",
    background_style: "gradient_brand_soft",
    background_intensity: "balanced",
    image_filter: "natural",
    // Cor com luminosidade suficiente para que a variação de hue por seed seja visível.
    // #111827 (quase preto) não permitia variação perceptível de hue.
    default_primary: "#3B5998",
    positioning_template: "Comércio local com atendimento personalizado",
  },
};
