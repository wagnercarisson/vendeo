import {
  BrandBackgroundTreatment,
  BrandDNA,
  BrandImageFilter,
  BrandImageTreatment,
  BrandTemperature,
  BrandToneOfVoice,
} from "./brand-dna";
import {
  ARCHETYPE_CATALOG,
  BrandArchetype,
  SEGMENT_TO_ARCHETYPE,
} from "./brand-token-catalog";

// === UTILS: STRING & HASH ===

/**
 * Normalização robusta de segmento para melhorar o acerto do arquétipo.
 */
export function normalizeSegment(segment: string | null): string {
  if (!segment) return "";

  let normalized = segment
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos

  const stopwords = [
    "loja de",
    "comercio de",
    "mercado de",
    "casa de",
    "venda de",
    "produtos",
  ];

  stopwords.forEach((sw) => {
    normalized = normalized.replace(new RegExp(sw, "g"), "");
  });

  // Plural simples (remover 's' final de palavras longas)
  normalized = normalized
    .split(" ")
    .map((word) => (word.length > 4 && word.endsWith("s") ? word.slice(0, -1) : word))
    .join(" ");

  return normalized.trim();
}

/**
 * Gera um hash numérico estável a partir de uma string.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// === UTILS: COLOR MANIPULATION (PURE) ===

interface HSL {
  h: number;
  s: number;
  l: number;
}

function hexToHsl(hex: string): HSL {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

/**
 * Calcula o contraste WCAG 2.1 entre duas cores hex.
 */
function getContrastRatio(hex1: string, hex2: string): number {
  const getL = (hex: string) => {
    const rgb = [
      parseInt(hex.slice(1, 3), 16) / 255,
      parseInt(hex.slice(3, 5), 16) / 255,
      parseInt(hex.slice(5, 7), 16) / 255,
    ].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };

  const l1 = getL(hex1);
  const l2 = getL(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function ensureContrast(
  color: string,
  background: string,
  minRatio: number = 4.5
): string {
  if (getContrastRatio(color, background) >= minRatio) return color;
  return getContrastRatio("#FFFFFF", background) > getContrastRatio("#000000", background)
    ? "#FFFFFF"
    : "#000000";
}

// === ENGINE FUNCTIONS ===

export function inferBrandArchetype(segment: string | null): BrandArchetype {
  const normalized = normalizeSegment(segment);
  if (!normalized) return "modern";

  // Busca exata
  if (SEGMENT_TO_ARCHETYPE[normalized]) return SEGMENT_TO_ARCHETYPE[normalized];

  // Busca por substring em cada token
  const tokens = normalized.split(" ");
  for (const token of tokens) {
    if (token.length < 3) continue;
    for (const [key, value] of Object.entries(SEGMENT_TO_ARCHETYPE)) {
      if (key.includes(token)) return value;
    }
  }

  return "modern";
}

export function inferColorTemperature(
  hex: string,
  archetype: BrandArchetype
): BrandTemperature {
  const { h } = hexToHsl(hex);

  let base: BrandTemperature = "neutral";
  if ((h >= 0 && h <= 70) || (h >= 291 && h <= 360)) base = "warm";
  else if (h >= 161 && h <= 290) base = "cool";

  // Modulação pelo arquétipo
  if (archetype === "luxury" && base === "neutral") return "warm";
  if (archetype === "clean" && base === "neutral") return "cool";

  return base;
}

export function buildExpandedPalette(
  primary: string,
  temperature: BrandTemperature,
  archetype: BrandArchetype
) {
  const hsl = hexToHsl(primary);

  // 1. Secondary
  let secondary: string;
  if (archetype === "luxury" || archetype === "editorial" || archetype === "trust") {
    secondary = hslToHex(hsl.h, Math.max(0, hsl.s - 15), Math.min(100, hsl.l + 20));
  } else if (archetype === "impact") {
    secondary = hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 15));
  } else {
    secondary = hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l);
  }

  // 2. Accent (Complementar)
  const isSophisticated = ["luxury", "editorial", "precision"].includes(archetype);
  const accent_hue = (hsl.h + (isSophisticated ? 120 : 180)) % 360;
  const rawAccent = hslToHex(accent_hue, hsl.s, hsl.l);
  const accent = ensureContrast(rawAccent, "#FFFFFF", 3.1);

  // 3. Neutral
  let neutral = "#71717A"; // default zinc-500
  if (temperature === "warm") neutral = "#78716C"; // stone-500
  if (temperature === "cool") neutral = "#64748B"; // slate-500

  return { primary, secondary, accent, neutral };
}

export function inferImageTreatment(
  archetype: BrandArchetype,
  temperature: BrandTemperature
): BrandImageTreatment {
  const { image_filter } = ARCHETYPE_CATALOG[archetype];

  // Ajustes baseados na temperatura
  const warmth = temperature === "warm" ? 0.15 : temperature === "cool" ? -0.15 : 0;
  const contrast = archetype === "impact" ? 0.1 : archetype === "luxury" ? 0.05 : 0;
  const saturation = archetype === "clean" ? -0.1 : 0;

  return {
    filter: image_filter,
    warmth,
    contrast,
    saturation,
  };
}

export function inferBackgroundTreatment(
  archetype: BrandArchetype,
  aggression: number
): BrandBackgroundTreatment {
  const { background_style, background_intensity } = ARCHETYPE_CATALOG[archetype];

  let intensity = background_intensity;
  if (aggression > 0.7 && intensity === "subtle") intensity = "balanced";
  if (aggression > 0.8 && intensity === "balanced") intensity = "expressive";

  return { style: background_style, intensity };
}

export function inferToneOfVoice(
  raw: string | null,
  archetype: BrandArchetype
): BrandToneOfVoice {
  if (!raw) return ARCHETYPE_CATALOG[archetype].tone_of_voice;

  const normalized = raw.toLowerCase();
  if (normalized.includes("premium") || normalized.includes("luxo")) return "premium";
  if (normalized.includes("agressivo") || normalized.includes("impacto"))
    return "aggressive";
  if (normalized.includes("informati") || normalized.includes("educativo"))
    return "informative";

  return ARCHETYPE_CATALOG[archetype].tone_of_voice;
}

export function inferPositioning(
  segment: string | null,
  raw: string | null,
  archetype: BrandArchetype
): string {
  if (raw) return raw;

  const template = ARCHETYPE_CATALOG[archetype].positioning_template;
  const segmentLabel = segment || "seu negócio";

  return template.replace("{segment}", segmentLabel);
}

// === MAIN ENTRY POINT ===

export interface RawStoreData {
  id: string;
  main_segment: string | null;
  primary_color: string | null;
  tone_of_voice: string | null;
  brand_positioning: string | null;
}

export function buildAutoDNA(raw: RawStoreData): BrandDNA {
  // 1. Arquétipo — Tudo deriva daqui
  const archetype = inferBrandArchetype(raw.main_segment);
  const tokens = ARCHETYPE_CATALOG[archetype];

  // 2. Visual Seed (Estabilidade determinística por loja)
  const seedNum = hashString(raw.id);
  const visual_seed = raw.id;

  // 3. Cor Primária (com anti-colisão se for default)
  let primary = raw.primary_color;
  if (!primary) {
    const hsl = hexToHsl(tokens.default_primary);
    // Micro-variação de hue ±10 graus baseada na seed
    const variation = (seedNum % 21) - 10;
    primary = hslToHex((hsl.h + variation + 360) % 360, hsl.s, hsl.l);
  }

  // 4. Temperatura (Derivada de hue + arquétipo)
  const brand_temperature = inferColorTemperature(primary, archetype);

  // 5. Paleta Expandida (Derivada de primary + temp + arquétipo)
  const palette = buildExpandedPalette(primary, brand_temperature, archetype);

  // 6. Tratamentos (Filtros e Fundo)
  const image_treatment = inferImageTreatment(archetype, brand_temperature);
  const background_treatment = inferBackgroundTreatment(
    archetype,
    tokens.visual_aggression
  );

  // 7. Identidade Verbal e Estratégica
  const tone_of_voice = inferToneOfVoice(raw.tone_of_voice, archetype);
  const positioning = inferPositioning(
    raw.main_segment,
    raw.brand_positioning,
    archetype
  );

  return {
    version: 2,
    visual_seed,
    visual_style: tokens.visual_style,
    brand_temperature,
    palette,
    typography: {
      headline_font: tokens.headline_font,
      body_font: tokens.body_font,
    },
    image_treatment,
    background_treatment,
    tone_of_voice,
    positioning,
    logo_usage: {
      allow_monochrome: true,
    },
    config: {
      visual_aggression: tokens.visual_aggression,
    },
  };
}
