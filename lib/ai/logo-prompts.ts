/**
 * DALL-E 3 Logo Prompt Templates - Optimized by @prompt-eng (Wordsmith)
 * 
 * This module provides segment-specific prompt templates for generating
 * professional logos via DALL-E 3 API. Each template is optimized for
 * visual style, color palette, and iconic elements appropriate to the
 * business segment.
 * 
 * @see Story 3: Logo IA - DALL-E 3 (Intelligence Sprint 1)
 * @created 2026-04-30
 */

export type Segment =
  | "Mercado / Mercearia"
  | "Loja de bebidas"
  | "Moda / Boutique"
  | "Farmácia"
  | "Restaurante / Lanchonete"
  | "Pet shop"
  | "Materiais de construção"
  | "Salão / Estética"
  | "Eletrônicos"
  | "Casa & Decoração"
  | "Academia"
  | "Outro…";

export type ToneOfVoice =
  | "Amigável"
  | "Direto"
  | "Promocional"
  | "Premium"
  | "Divertido"
  | "Técnico"
  | "Próximo / "de bairro""
  | "Outro…";

interface LogoPromptTemplate {
  basePrompt: string; // Base prompt with {storeName} placeholder
  visualStyle: string; // Default visual style
  colorSuggestions: string[]; // Hex color codes
  iconicElements: string[]; // Characteristic visual elements
  avoidElements: string[]; // What NOT to include
}

/**
 * Segment-specific DALL-E 3 prompt templates
 * 
 * Design principles:
 * - Minimalist and professional
 * - 2-3 colors maximum
 * - Flat design, suitable for social media
 * - No text in logo (store name will be added separately)
 * - High contrast, white background
 */
const LOGO_PROMPT_TEMPLATES: Record<Segment, LogoPromptTemplate> = {
  "Mercado / Mercearia": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a local grocery store. Style: welcoming and trustworthy. Design: Simple geometric shapes representing fresh produce or a shopping basket, maximum 2-3 colors (green, orange, or earthy tones), no text, flat design suitable for social media, white background, high contrast. The logo should evoke freshness, community, and everyday convenience.',
    visualStyle: "welcoming and trustworthy",
    colorSuggestions: ["#4CAF50", "#FF9800", "#8D6E63"],
    iconicElements: [
      "shopping basket",
      "fresh produce (apple, carrot)",
      "storefront silhouette",
      "leaf motif",
    ],
    avoidElements: [
      "complex illustrations",
      "cartoon characters",
      "tech symbols",
      "luxury aesthetics",
    ],
  },

  "Loja de bebidas": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a beverage store. Style: sophisticated and inviting. Design: Simple geometric shapes representing a bottle, glass, or refreshment symbol, maximum 2-3 colors (burgundy, amber, or dark green), no text, flat design suitable for social media, white background, high contrast. The logo should evoke quality, refreshment, and social enjoyment.',
    visualStyle: "sophisticated and inviting",
    colorSuggestions: ["#8B0000", "#D4AF37", "#2E7D32"],
    iconicElements: [
      "bottle silhouette",
      "glass outline",
      "droplet or wave",
      "barrel icon",
    ],
    avoidElements: [
      "cartoonish drinks",
      "complex patterns",
      "neon colors",
      "childish elements",
    ],
  },

  "Moda / Boutique": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a fashion boutique. Style: elegant and modern. Design: Simple geometric shapes representing fashion elements like a dress silhouette, hanger, or stylized fabric pattern, maximum 2-3 colors (black, gold, or rose), no text, flat design suitable for social media, white background, high contrast. The logo should evoke style, elegance, and contemporary fashion.',
    visualStyle: "elegant and modern",
    colorSuggestions: ["#000000", "#D4AF37", "#E91E63"],
    iconicElements: [
      "dress silhouette",
      "hanger icon",
      "fashion mannequin outline",
      "fabric wave pattern",
    ],
    avoidElements: [
      "overly ornate designs",
      "dated fashion symbols",
      "cluttered elements",
      "childish graphics",
    ],
  },

  Farmácia: {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a pharmacy. Style: trustworthy and caring. Design: Simple geometric shapes representing health symbols like a cross, heart, or pill, maximum 2-3 colors (green, blue, or white), no text, flat design suitable for social media, white background, high contrast. The logo should evoke trust, health, and professional care.',
    visualStyle: "trustworthy and caring",
    colorSuggestions: ["#00A86B", "#0288D1", "#FFFFFF"],
    iconicElements: [
      "medical cross",
      "heart icon",
      "pill or capsule",
      "mortar and pestle",
    ],
    avoidElements: [
      "scary medical symbols",
      "complex chemical formulas",
      "red (too alarming)",
      "dark colors",
    ],
  },

  "Restaurante / Lanchonete": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a restaurant or snack bar. Style: appetizing and friendly. Design: Simple geometric shapes representing food elements like a fork and knife, plate, or chef hat, maximum 2-3 colors (red, orange, or brown), no text, flat design suitable for social media, white background, high contrast. The logo should evoke appetite, warmth, and delicious food.',
    visualStyle: "appetizing and friendly",
    colorSuggestions: ["#E53935", "#FF9800", "#6D4C41"],
    iconicElements: [
      "fork and knife",
      "plate icon",
      "chef hat",
      "cloche (food cover)",
    ],
    avoidElements: [
      "unappetizing colors",
      "complex food illustrations",
      "corporate aesthetics",
      "cold colors (blue/purple)",
    ],
  },

  "Pet shop": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a pet shop. Style: playful and caring. Design: Simple geometric shapes representing pets like a paw print, dog/cat silhouette, or heart with pet motif, maximum 2-3 colors (blue, orange, or green), no text, flat design suitable for social media, white background, high contrast. The logo should evoke love for animals, playfulness, and care.',
    visualStyle: "playful and caring",
    colorSuggestions: ["#2196F3", "#FF9800", "#4CAF50"],
    iconicElements: [
      "paw print",
      "dog silhouette",
      "cat silhouette",
      "heart with pet motif",
    ],
    avoidElements: [
      "scary animal faces",
      "complex realistic drawings",
      "dark or aggressive colors",
      "too many animal types",
    ],
  },

  "Materiais de construção": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a construction materials store. Style: solid and reliable. Design: Simple geometric shapes representing construction elements like a house frame, hammer, or brick pattern, maximum 2-3 colors (orange, gray, or terracotta), no text, flat design suitable for social media, white background, high contrast. The logo should evoke strength, reliability, and quality materials.',
    visualStyle: "solid and reliable",
    colorSuggestions: ["#FF6F00", "#607D8B", "#D84315"],
    iconicElements: [
      "house frame",
      "hammer icon",
      "brick pattern",
      "ruler or level tool",
    ],
    avoidElements: [
      "delicate or fragile elements",
      "soft colors",
      "overly complex tools",
      "residential home (too specific)",
    ],
  },

  "Salão / Estética": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a beauty salon or spa. Style: elegant and pampering. Design: Simple geometric shapes representing beauty elements like scissors, a mirror, or a lotus flower, maximum 2-3 colors (pink, purple, or gold), no text, flat design suitable for social media, white background, high contrast. The logo should evoke beauty, relaxation, and self-care.',
    visualStyle: "elegant and pampering",
    colorSuggestions: ["#E91E63", "#9C27B0", "#D4AF37"],
    iconicElements: [
      "scissors icon",
      "mirror silhouette",
      "lotus flower",
      "comb or brush",
    ],
    avoidElements: [
      "masculine elements",
      "aggressive colors",
      "overly complex illustrations",
      "medical aesthetics",
    ],
  },

  Eletrônicos: {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", an electronics store. Style: modern and tech-savvy. Design: Simple geometric shapes representing technology like a circuit pattern, plug icon, or abstract tech symbol, maximum 2-3 colors (blue, black, or cyan), no text, flat design suitable for social media, white background, high contrast. The logo should evoke innovation, technology, and modernity.',
    visualStyle: "modern and tech-savvy",
    colorSuggestions: ["#2196F3", "#000000", "#00BCD4"],
    iconicElements: [
      "circuit pattern",
      "plug or power icon",
      "abstract tech symbol",
      "lightning bolt",
    ],
    avoidElements: [
      "dated tech symbols (floppy disk)",
      "overly complex circuits",
      "warm colors",
      "organic shapes",
    ],
  },

  "Casa & Decoração": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a home decor store. Style: cozy and stylish. Design: Simple geometric shapes representing home elements like a house outline, furniture silhouette, or decorative pattern, maximum 2-3 colors (brown, teal, or coral), no text, flat design suitable for social media, white background, high contrast. The logo should evoke comfort, style, and home warmth.',
    visualStyle: "cozy and stylish",
    colorSuggestions: ["#795548", "#80CBC4", "#FF7043"],
    iconicElements: [
      "house outline",
      "furniture silhouette (chair, lamp)",
      "decorative pattern",
      "plant or vase",
    ],
    avoidElements: [
      "construction elements",
      "too literal furniture",
      "cold industrial aesthetics",
      "childish home symbols",
    ],
  },

  Academia: {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a gym or fitness center. Style: energetic and strong. Design: Simple geometric shapes representing fitness like a dumbbell, flexed arm, or abstract movement lines, maximum 2-3 colors (red, black, or orange), no text, flat design suitable for social media, white background, high contrast. The logo should evoke energy, strength, and active lifestyle.',
    visualStyle: "energetic and strong",
    colorSuggestions: ["#E53935", "#000000", "#FF6F00"],
    iconicElements: [
      "dumbbell icon",
      "flexed arm silhouette",
      "abstract movement lines",
      "heartbeat line",
    ],
    avoidElements: [
      "bodybuilder stereotypes",
      "overly aggressive imagery",
      "soft or pastel colors",
      "static poses",
    ],
  },

  "Outro…": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}". Style: clean and modern. Design: Simple geometric shapes with abstract elements, maximum 2-3 colors, no text, flat design suitable for social media, white background, high contrast. The logo should be versatile and professional, suitable for any business type.',
    visualStyle: "clean and modern",
    colorSuggestions: ["#000000", "#FFFFFF", "#3F51B5"],
    iconicElements: [
      "abstract geometric shapes",
      "circle or triangle motifs",
      "minimalist patterns",
    ],
    avoidElements: [
      "overly specific symbols",
      "complex illustrations",
      "too many colors",
      "dated design trends",
    ],
  },
};

/**
 * Tone of voice adjustments for visual style
 * 
 * These mappings translate business tone preferences into
 * visual style descriptors that DALL-E 3 understands.
 */
const TONE_STYLE_ADJUSTMENTS: Record<ToneOfVoice, string> = {
  Amigável: "friendly and approachable",
  Direto: "bold and straightforward",
  Promocional: "vibrant and attention-grabbing",
  Premium: "elegant and sophisticated",
  Divertido: "playful and energetic",
  Técnico: "professional and precise",
  "Próximo / "de bairro"": "warm and community-focused",
  "Outro…": "", // No adjustment, use base style
};

/**
 * Get optimized DALL-E 3 prompt for a specific business segment
 * 
 * @param storeName - Name of the store (e.g., "Adega do João")
 * @param segment - Business segment from SEGMENT_OPTIONS
 * @param tone - Optional tone of voice from TONE_OPTIONS
 * @returns Optimized prompt string for DALL-E 3 API
 * 
 * @example
 * ```typescript
 * const prompt = getLogoPromptBySegment(
 *   "Adega do João",
 *   "Loja de bebidas",
 *   "Premium"
 * );
 * // Returns: "A minimalist, professional logo for 'Adega do João', 
 * //           a beverage store... Style: elegant and sophisticated..."
 * ```
 */
export function getLogoPromptBySegment(
  storeName: string,
  segment: Segment,
  tone?: ToneOfVoice
): string {
  // Get template for segment (fallback to "Outro…" if not found)
  const template =
    LOGO_PROMPT_TEMPLATES[segment] || LOGO_PROMPT_TEMPLATES["Outro…"];

  // Replace store name placeholder
  let prompt = template.basePrompt.replace("{storeName}", storeName);

  // Adjust visual style based on tone (if provided)
  if (tone && tone !== "Outro…") {
    const styleAdjustment = TONE_STYLE_ADJUSTMENTS[tone];
    if (styleAdjustment) {
      // Replace the default visual style with tone-adjusted style
      prompt = prompt.replace(template.visualStyle, styleAdjustment);
    }
  }

  return prompt;
}

/**
 * Get color suggestions for a specific business segment
 * 
 * Returns an array of hex color codes that are visually appropriate
 * for the given business segment. These can be used as hints for
 * color extraction or as defaults if logo generation fails.
 * 
 * @param segment - Business segment from SEGMENT_OPTIONS
 * @returns Array of hex color codes (e.g., ["#4CAF50", "#FF9800"])
 * 
 * @example
 * ```typescript
 * const colors = getColorSuggestions("Pet shop");
 * // Returns: ["#2196F3", "#FF9800", "#4CAF50"]
 * ```
 */
export function getColorSuggestions(segment: Segment): string[] {
  const template =
    LOGO_PROMPT_TEMPLATES[segment] || LOGO_PROMPT_TEMPLATES["Outro…"];
  return template.colorSuggestions;
}

/**
 * Get iconic elements for a specific business segment
 * 
 * Returns an array of visual elements that are characteristic
 * of the given business segment. Useful for debugging or
 * providing context to designers.
 * 
 * @param segment - Business segment from SEGMENT_OPTIONS
 * @returns Array of iconic element descriptions
 * 
 * @internal This function is primarily for internal use and testing
 */
export function getIconicElements(segment: Segment): string[] {
  const template =
    LOGO_PROMPT_TEMPLATES[segment] || LOGO_PROMPT_TEMPLATES["Outro…"];
  return template.iconicElements;
}

/**
 * Get elements to avoid for a specific business segment
 * 
 * Returns an array of visual elements that should NOT be included
 * in logos for the given business segment. Useful for prompt
 * engineering and quality control.
 * 
 * @param segment - Business segment from SEGMENT_OPTIONS
 * @returns Array of elements to avoid
 * 
 * @internal This function is primarily for internal use and testing
 */
export function getAvoidElements(segment: Segment): string[] {
  const template =
    LOGO_PROMPT_TEMPLATES[segment] || LOGO_PROMPT_TEMPLATES["Outro…"];
  return template.avoidElements;
}

/**
 * Get all available segments
 * 
 * @returns Array of all available business segments
 */
export function getAllSegments(): Segment[] {
  return Object.keys(LOGO_PROMPT_TEMPLATES) as Segment[];
}

/**
 * Validate if a segment is supported
 * 
 * @param segment - Segment string to validate
 * @returns true if segment is supported, false otherwise
 */
export function isValidSegment(segment: string): segment is Segment {
  return segment in LOGO_PROMPT_TEMPLATES;
}
