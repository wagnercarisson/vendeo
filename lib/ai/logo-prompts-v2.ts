/**
 * DALL-E 3 Logo Prompt Templates v2 - Refined by @prompt-eng (Wordsmith)
 * 
 * This module provides REFINED segment-specific prompt templates for generating
 * professional logos via DALL-E 3 API. Version 2 addresses 6 critical vulnerabilities
 * identified in the initial implementation that caused low approval rates (20%).
 * 
 * TARGET: Increase approval rate from 20% to 70%+
 * 
 * CHANGES FROM V1:
 * 1. ✅ Singular "shape" vs plural "shapes" (prevents grid generation)
 * 2. ✅ "ONE single icon" enforced throughout (prevents multiple elements)
 * 3. ✅ Explicit "no mockups/grids" constraint (prevents business cards)
 * 4. ✅ "Centered composition" added (ensures balance)
 * 5. ✅ Expanded negative prompting (clear DO NOT section)
 * 6. ✅ "Choose EITHER...OR" forcing single element selection
 * 
 * @see docs/ux/logo-ia-optimization/prompt-refinement-brief.md
 * @refined-by @prompt-eng (Wordsmith)
 * @date 2026-05-01
 * @version 2.0.0
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
  | "Próximo / \"de bairro\""
  | "Outro…";

/**
 * Structured prompt template for DALL-E 3 logo generation
 * 
 * This interface enforces a clear separation of concerns in prompt construction,
 * making each section explicit and preventing ambiguity that leads to poor results.
 */
interface LogoPromptV2 {
  basePrompt: string;      // Intro + store context
  iconSelection: string;   // Force single choice (EITHER...OR pattern)
  visualStyle: string;     // Minimalist, professional aesthetic
  composition: string;     // Centered, balanced, unified
  constraints: string;     // Positive constraints (what it MUST be)
  negativePrompt: string;  // Explicit "DO NOT CREATE" section
  technical: string;       // Background, format, scalability
}

/**
 * Segment-specific DALL-E 3 prompt templates v2
 * 
 * Design principles (REFINED):
 * - ONE cohesive geometric shape (singular, not plural)
 * - Force single element choice (EITHER bottle OR glass, not both)
 * - Explicit negative prompting (no mockups, no grids, no text)
 * - Centered composition with balanced visual weight
 * - Scalable from 32px to 512px
 * - Isolated on pure white background (#FFFFFF)
 */
const LOGO_PROMPT_TEMPLATES_V2: Record<Segment, LogoPromptV2> = {
  "Mercado / Mercearia": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a local grocery store specializing in fresh produce and everyday essentials.',
    
    iconSelection:
      // v1: "Simple geometric shapes representing fresh produce or a shopping basket"
      // v2: Force single choice, singular form
      'DESIGN: Create ONE single geometric icon. Choose EITHER a shopping basket silhouette OR a fresh produce symbol (apple or carrot) (select only one element, not both). The icon must be simple, unified, and instantly recognizable.',
    
    visualStyle:
      'STYLE: Welcoming and trustworthy. Use maximum 2-3 colors (green, orange, or earthy tones like brown). Flat design aesthetic with clean lines and friendly appeal.',
    
    composition:
      // v1: No composition guidance (Vulnerability #6)
      // v2: Explicit centered composition + scalability
      'COMPOSITION: The logo must be ONE cohesive shape forming a single unified icon mark. Centered composition with balanced visual weight. All elements visually connected. The icon should work equally well at small sizes (32px) and large sizes (512px).',
    
    constraints:
      'The logo should evoke: freshness, community trust, and everyday convenience through its shape and color palette alone.',
    
    negativePrompt:
      // v1: Only "no text" constraint (Vulnerability #4)
      // v2: Comprehensive negative prompting
      'CONSTRAINTS - DO NOT CREATE:\n- Business cards, mockups, social media posts, or application examples\n- Grids of multiple logo variations or options\n- Text, letters, words, numbers, or store name inside the logo\n- Complex illustrations, realistic drawings, or photographic elements\n- Cartoon characters or childish graphics\n- Tech symbols or luxury aesthetics',
    
    technical:
      // v1: "suitable for social media" (Vulnerability #3 - triggers mockups)
      // v2: Explicit "logo icon itself, isolated"
      'OUTPUT FORMAT: The logo icon itself, isolated and centered on pure white background (#FFFFFF). High contrast for visibility. No shadows, no borders, no decorative frames.',
  },

  "Loja de bebidas": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a beverage store specializing in quality drinks.',
    
    iconSelection:
      // v1: "a bottle, glass, or refreshment symbol" (Vulnerability #1 - multiple options)
      // v2: EITHER...OR forcing choice
      'DESIGN: Create ONE single geometric icon. Choose EITHER a bottle silhouette OR a glass outline (select only one element, not both). The icon must be simple, unified, and instantly recognizable.',
    
    visualStyle:
      'STYLE: Sophisticated and inviting. Use maximum 2-3 colors (burgundy, amber, or dark green). Flat design aesthetic with clean lines and modern appeal.',
    
    composition:
      'COMPOSITION: The logo must be ONE cohesive shape forming a single unified icon mark. Centered composition with balanced visual weight. All elements visually connected. The icon should work equally well at small sizes (32px) and large sizes (512px).',
    
    constraints:
      'The logo should evoke: quality, refreshment, and social enjoyment through its shape and color palette alone.',
    
    negativePrompt:
      'CONSTRAINTS - DO NOT CREATE:\n- Business cards, mockups, social media posts, or application examples\n- Grids of multiple logo variations or options\n- Text, letters, words, numbers, or store name inside the logo\n- Complex illustrations, realistic drawings, or photographic elements\n- Cartoonish drinks or neon colors\n- Childish elements or busy patterns',
    
    technical:
      'OUTPUT FORMAT: The logo icon itself, isolated and centered on pure white background (#FFFFFF). High contrast for visibility. No shadows, no borders, no decorative frames.',
  },

  "Moda / Boutique": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a fashion boutique offering contemporary style.',
    
    iconSelection:
      'DESIGN: Create ONE single geometric icon. Choose EITHER a dress silhouette OR a hanger symbol (select only one element, not both). The icon must be simple, unified, and instantly recognizable.',
    
    visualStyle:
      'STYLE: Elegant and modern. Use maximum 2-3 colors (black, gold, or rose). Flat design aesthetic with clean lines and contemporary fashion appeal.',
    
    composition:
      'COMPOSITION: The logo must be ONE cohesive shape forming a single unified icon mark. Centered composition with balanced visual weight. All elements visually connected. The icon should work equally well at small sizes (32px) and large sizes (512px).',
    
    constraints:
      'The logo should evoke: style, elegance, and contemporary fashion through its shape and color palette alone.',
    
    negativePrompt:
      'CONSTRAINTS - DO NOT CREATE:\n- Business cards, mockups, social media posts, or application examples\n- Grids of multiple logo variations or options\n- Text, letters, words, numbers, or store name inside the logo\n- Complex illustrations, realistic drawings, or photographic elements\n- Overly ornate designs or dated fashion symbols\n- Cluttered elements or childish graphics',
    
    technical:
      'OUTPUT FORMAT: The logo icon itself, isolated and centered on pure white background (#FFFFFF). High contrast for visibility. No shadows, no borders, no decorative frames.',
  },

  "Farmácia": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a pharmacy dedicated to health and professional care.',
    
    iconSelection:
      'DESIGN: Create ONE single geometric icon. Choose EITHER a medical cross OR a heart symbol (select only one element, not both). The icon must be simple, unified, and instantly recognizable.',
    
    visualStyle:
      'STYLE: Trustworthy and caring. Use maximum 2-3 colors (green, blue, or white accents). Flat design aesthetic with clean lines and professional medical appeal.',
    
    composition:
      'COMPOSITION: The logo must be ONE cohesive shape forming a single unified icon mark. Centered composition with balanced visual weight. All elements visually connected. The icon should work equally well at small sizes (32px) and large sizes (512px).',
    
    constraints:
      'The logo should evoke: trust, health, and professional care through its shape and color palette alone.',
    
    negativePrompt:
      'CONSTRAINTS - DO NOT CREATE:\n- Business cards, mockups, social media posts, or application examples\n- Grids of multiple logo variations or options\n- Text, letters, words, numbers, or store name inside the logo\n- Complex illustrations, realistic drawings, or photographic elements\n- Scary medical symbols or complex chemical formulas\n- Red colors (too alarming) or dark colors',
    
    technical:
      'OUTPUT FORMAT: The logo icon itself, isolated and centered on pure white background (#FFFFFF). High contrast for visibility. No shadows, no borders, no decorative frames.',
  },

  "Restaurante / Lanchonete": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a restaurant or snack bar serving delicious food.',
    
    iconSelection:
      'DESIGN: Create ONE single geometric icon. Choose EITHER a fork and knife crossed OR a chef hat silhouette (select only one element, not both). The icon must be simple, unified, and instantly recognizable.',
    
    visualStyle:
      'STYLE: Appetizing and friendly. Use maximum 2-3 colors (red, orange, or brown). Flat design aesthetic with clean lines and warm, inviting appeal.',
    
    composition:
      'COMPOSITION: The logo must be ONE cohesive shape forming a single unified icon mark. Centered composition with balanced visual weight. All elements visually connected. The icon should work equally well at small sizes (32px) and large sizes (512px).',
    
    constraints:
      'The logo should evoke: appetite, warmth, and delicious food through its shape and color palette alone.',
    
    negativePrompt:
      'CONSTRAINTS - DO NOT CREATE:\n- Business cards, mockups, social media posts, or application examples\n- Grids of multiple logo variations or options\n- Text, letters, words, numbers, or store name inside the logo\n- Complex illustrations, realistic drawings, or photographic elements\n- Unappetizing colors or complex food illustrations\n- Corporate aesthetics or cold colors (blue/purple)',
    
    technical:
      'OUTPUT FORMAT: The logo icon itself, isolated and centered on pure white background (#FFFFFF). High contrast for visibility. No shadows, no borders, no decorative frames.',
  },

  "Pet shop": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a pet shop dedicated to animal care and happiness.',
    
    iconSelection:
      'DESIGN: Create ONE single geometric icon. Choose EITHER a paw print OR a simple dog/cat silhouette (select only one element, not both). The icon must be simple, unified, and instantly recognizable.',
    
    visualStyle:
      'STYLE: Playful and caring. Use maximum 2-3 colors (blue, orange, or green). Flat design aesthetic with clean lines and friendly, approachable appeal.',
    
    composition:
      'COMPOSITION: The logo must be ONE cohesive shape forming a single unified icon mark. Centered composition with balanced visual weight. All elements visually connected. The icon should work equally well at small sizes (32px) and large sizes (512px).',
    
    constraints:
      'The logo should evoke: love for animals, playfulness, and professional care through its shape and color palette alone.',
    
    negativePrompt:
      'CONSTRAINTS - DO NOT CREATE:\n- Business cards, mockups, social media posts, or application examples\n- Grids of multiple logo variations or options\n- Text, letters, words, numbers, or store name inside the logo\n- Complex illustrations, realistic drawings, or photographic elements\n- Scary animal faces or too many animal types\n- Dark or aggressive colors',
    
    technical:
      'OUTPUT FORMAT: The logo icon itself, isolated and centered on pure white background (#FFFFFF). High contrast for visibility. No shadows, no borders, no decorative frames.',
  },

  "Materiais de construção": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a construction materials store providing quality building supplies.',
    
    iconSelection:
      'DESIGN: Create ONE single geometric icon. Choose EITHER a house frame outline OR a hammer symbol (select only one element, not both). The icon must be simple, unified, and instantly recognizable.',
    
    visualStyle:
      'STYLE: Solid and reliable. Use maximum 2-3 colors (orange, gray, or terracotta). Flat design aesthetic with clean lines and strong, trustworthy appeal.',
    
    composition:
      'COMPOSITION: The logo must be ONE cohesive shape forming a single unified icon mark. Centered composition with balanced visual weight. All elements visually connected. The icon should work equally well at small sizes (32px) and large sizes (512px).',
    
    constraints:
      'The logo should evoke: strength, reliability, and quality materials through its shape and color palette alone.',
    
    negativePrompt:
      'CONSTRAINTS - DO NOT CREATE:\n- Business cards, mockups, social media posts, or application examples\n- Grids of multiple logo variations or options\n- Text, letters, words, numbers, or store name inside the logo\n- Complex illustrations, realistic drawings, or photographic elements\n- Delicate or fragile elements\n- Soft colors or overly complex tools',
    
    technical:
      'OUTPUT FORMAT: The logo icon itself, isolated and centered on pure white background (#FFFFFF). High contrast for visibility. No shadows, no borders, no decorative frames.',
  },

  "Salão / Estética": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a beauty salon or spa focused on elegance and self-care.',
    
    iconSelection:
      // Brief note: Addressed "too feminine" concern from brief
      'DESIGN: Create ONE single geometric icon. Choose EITHER scissors symbol OR a lotus flower outline (select only one element, not both). The icon must be simple, unified, and instantly recognizable. Note: Design should be elegant and modern, suitable for diverse clientele (not overly feminine).',
    
    visualStyle:
      'STYLE: Elegant and pampering. Use maximum 2-3 colors (pink, purple, or gold - use restrained tones for broader appeal). Flat design aesthetic with clean lines and sophisticated appeal.',
    
    composition:
      'COMPOSITION: The logo must be ONE cohesive shape forming a single unified icon mark. Centered composition with balanced visual weight. All elements visually connected. The icon should work equally well at small sizes (32px) and large sizes (512px).',
    
    constraints:
      'The logo should evoke: beauty, relaxation, and self-care through its shape and color palette alone.',
    
    negativePrompt:
      'CONSTRAINTS - DO NOT CREATE:\n- Business cards, mockups, social media posts, or application examples\n- Grids of multiple logo variations or options\n- Text, letters, words, numbers, or store name inside the logo\n- Complex illustrations, realistic drawings, or photographic elements\n- Overly complex illustrations or medical aesthetics\n- Exclusively feminine elements (ensure broad appeal)',
    
    technical:
      'OUTPUT FORMAT: The logo icon itself, isolated and centered on pure white background (#FFFFFF). High contrast for visibility. No shadows, no borders, no decorative frames.',
  },

  "Eletrônicos": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", an electronics store offering modern technology.',
    
    iconSelection:
      // Brief note: Addressed "overly complex circuits" concern
      'DESIGN: Create ONE single geometric icon. Choose EITHER a simple plug icon OR a lightning bolt symbol (select only one element, not both). The icon must be simple, unified, and instantly recognizable. Avoid overly complex circuit patterns.',
    
    visualStyle:
      'STYLE: Modern and tech-savvy. Use maximum 2-3 colors (blue, black, or cyan). Flat design aesthetic with clean lines and contemporary tech appeal.',
    
    composition:
      'COMPOSITION: The logo must be ONE cohesive shape forming a single unified icon mark. Centered composition with balanced visual weight. All elements visually connected. The icon should work equally well at small sizes (32px) and large sizes (512px).',
    
    constraints:
      'The logo should evoke: innovation, technology, and modernity through its shape and color palette alone.',
    
    negativePrompt:
      'CONSTRAINTS - DO NOT CREATE:\n- Business cards, mockups, social media posts, or application examples\n- Grids of multiple logo variations or options\n- Text, letters, words, numbers, or store name inside the logo\n- Complex illustrations, realistic drawings, or photographic elements\n- Dated tech symbols (floppy disk) or overly complex circuits\n- Warm colors or organic shapes',
    
    technical:
      'OUTPUT FORMAT: The logo icon itself, isolated and centered on pure white background (#FFFFFF). High contrast for visibility. No shadows, no borders, no decorative frames.',
  },

  "Casa & Decoração": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a home decor store focused on comfort and style.',
    
    iconSelection:
      'DESIGN: Create ONE single geometric icon. Choose EITHER a simple house outline OR a decorative plant/vase symbol (select only one element, not both). The icon must be simple, unified, and instantly recognizable.',
    
    visualStyle:
      'STYLE: Cozy and stylish. Use maximum 2-3 colors (brown, teal, or coral). Flat design aesthetic with clean lines and warm, inviting appeal.',
    
    composition:
      'COMPOSITION: The logo must be ONE cohesive shape forming a single unified icon mark. Centered composition with balanced visual weight. All elements visually connected. The icon should work equally well at small sizes (32px) and large sizes (512px).',
    
    constraints:
      'The logo should evoke: comfort, style, and home warmth through its shape and color palette alone.',
    
    negativePrompt:
      'CONSTRAINTS - DO NOT CREATE:\n- Business cards, mockups, social media posts, or application examples\n- Grids of multiple logo variations or options\n- Text, letters, words, numbers, or store name inside the logo\n- Complex illustrations, realistic drawings, or photographic elements\n- Construction elements or cold industrial aesthetics\n- Too literal furniture or childish home symbols',
    
    technical:
      'OUTPUT FORMAT: The logo icon itself, isolated and centered on pure white background (#FFFFFF). High contrast for visibility. No shadows, no borders, no decorative frames.',
  },

  "Academia": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a gym or fitness center promoting active lifestyle.',
    
    iconSelection:
      'DESIGN: Create ONE single geometric icon. Choose EITHER a dumbbell symbol OR a flexed arm silhouette (select only one element, not both). The icon must be simple, unified, and instantly recognizable.',
    
    visualStyle:
      'STYLE: Energetic and strong. Use maximum 2-3 colors (red, black, or orange). Flat design aesthetic with clean lines and powerful, motivating appeal.',
    
    composition:
      'COMPOSITION: The logo must be ONE cohesive shape forming a single unified icon mark. Centered composition with balanced visual weight. All elements visually connected. The icon should work equally well at small sizes (32px) and large sizes (512px).',
    
    constraints:
      'The logo should evoke: energy, strength, and active lifestyle through its shape and color palette alone.',
    
    negativePrompt:
      'CONSTRAINTS - DO NOT CREATE:\n- Business cards, mockups, social media posts, or application examples\n- Grids of multiple logo variations or options\n- Text, letters, words, numbers, or store name inside the logo\n- Complex illustrations, realistic drawings, or photographic elements\n- Bodybuilder stereotypes or overly aggressive imagery\n- Soft or pastel colors',
    
    technical:
      'OUTPUT FORMAT: The logo icon itself, isolated and centered on pure white background (#FFFFFF). High contrast for visibility. No shadows, no borders, no decorative frames.',
  },

  "Outro…": {
    basePrompt:
      'A minimalist, professional logo for "{storeName}", a business seeking versatile and professional visual identity.',
    
    iconSelection:
      // Generic segment needs flexibility while enforcing single element
      'DESIGN: Create ONE single geometric icon using abstract shapes (circle, triangle, or square-based forms). The icon must be simple, unified, and instantly recognizable. Reflect the specific business nature through abstract symbolism.',
    
    visualStyle:
      'STYLE: Clean and modern. Use maximum 2-3 colors (black, white, or indigo blue). Flat design aesthetic with clean lines and professional appeal.',
    
    composition:
      'COMPOSITION: The logo must be ONE cohesive shape forming a single unified icon mark. Centered composition with balanced visual weight. All elements visually connected. The icon should work equally well at small sizes (32px) and large sizes (512px).',
    
    constraints:
      'The logo should be versatile and professional, suitable for any business type.',
    
    negativePrompt:
      'CONSTRAINTS - DO NOT CREATE:\n- Business cards, mockups, social media posts, or application examples\n- Grids of multiple logo variations or options\n- Text, letters, words, numbers, or store name inside the logo\n- Complex illustrations, realistic drawings, or photographic elements\n- Overly specific symbols\n- Too many colors or dated design trends',
    
    technical:
      'OUTPUT FORMAT: The logo icon itself, isolated and centered on pure white background (#FFFFFF). High contrast for visibility. No shadows, no borders, no decorative frames.',
  },
};

/**
 * Tone of voice adjustments for visual style
 * 
 * These mappings translate business tone preferences into
 * visual style descriptors that DALL-E 3 understands better.
 * 
 * NOTE: Tone adjustments in v2 are more subtle than v1 to prevent
 * conflicting with the core prompt structure. They modify only the
 * style description, not the entire prompt.
 */
const TONE_STYLE_ADJUSTMENTS: Record<ToneOfVoice, string> = {
  Amigável: "friendly and approachable",
  Direto: "bold and straightforward",
  Promocional: "vibrant and attention-grabbing",
  Premium: "elegant and sophisticated",
  Divertido: "playful and energetic",
  Técnico: "professional and precise",
  "Próximo / \"de bairro\"": "warm and community-focused",
  "Outro…": "", // No adjustment, use base style
};

/**
 * Build complete DALL-E 3 prompt from structured template
 * 
 * This function concatenates all sections of the LogoPromptV2 interface
 * in the optimal order for DALL-E 3 comprehension. Each section is
 * separated by line breaks for clarity.
 * 
 * @param template - Structured prompt template
 * @param storeName - Name of the store to inject
 * @param toneAdjustment - Optional style adjustment from tone
 * @returns Complete prompt string
 * 
 * @internal
 */
function buildPromptV2(
  template: LogoPromptV2,
  storeName: string,
  toneAdjustment?: string
): string {
  // Replace store name placeholder in base prompt
  let basePrompt = template.basePrompt.replace("{storeName}", storeName);

  // Apply tone adjustment to visual style if provided
  let visualStyle = template.visualStyle;
  if (toneAdjustment) {
    // Extract the current style descriptor (first sentence after "STYLE:")
    const styleMatch = visualStyle.match(/STYLE: ([^.]+)/);
    if (styleMatch) {
      visualStyle = visualStyle.replace(styleMatch[1], toneAdjustment);
    }
  }

  // Concatenate all sections in optimal order
  const sections = [
    basePrompt,
    "",
    template.iconSelection,
    "",
    visualStyle,
    "",
    template.composition,
    "",
    template.constraints,
    "",
    template.negativePrompt,
    "",
    template.technical,
  ];

  return sections.join("\n");
}

/**
 * Get optimized DALL-E 3 prompt for a specific business segment (v2)
 * 
 * This is the PRIMARY function for generating logo prompts. It returns a
 * fully structured, refined prompt that addresses all 6 vulnerabilities
 * identified in v1:
 * 
 * 1. ✅ Forces single element choice (EITHER...OR pattern)
 * 2. ✅ Uses singular "shape" not plural "shapes"
 * 3. ✅ Removes "suitable for social media" (prevents mockups)
 * 4. ✅ Adds explicit "DO NOT CREATE" section
 * 5. ✅ Enforces "ONE cohesive shape" language
 * 6. ✅ Adds "centered composition" guidance
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
 * // Returns structured prompt with all v2 refinements applied
 * ```
 */
export function getLogoPromptBySegment(
  storeName: string,
  segment: Segment,
  tone?: ToneOfVoice
): string {
  // Get template for segment (fallback to "Outro…" if not found)
  const template =
    LOGO_PROMPT_TEMPLATES_V2[segment] || LOGO_PROMPT_TEMPLATES_V2["Outro…"];

  // Get tone adjustment if provided
  let toneAdjustment: string | undefined;
  if (tone && tone !== "Outro…") {
    toneAdjustment = TONE_STYLE_ADJUSTMENTS[tone];
  }

  // Build complete prompt
  return buildPromptV2(template, storeName, toneAdjustment);
}

/**
 * Get color suggestions for a specific business segment
 * 
 * NOTE: Color suggestions remain unchanged from v1 as they are not
 * related to the prompt structure vulnerabilities.
 * 
 * @param segment - Business segment from SEGMENT_OPTIONS
 * @returns Array of hex color codes
 */
export function getColorSuggestions(segment: Segment): string[] {
  // Color palettes unchanged from v1 - use same logic
  const colorMap: Record<Segment, string[]> = {
    "Mercado / Mercearia": ["#4CAF50", "#FF9800", "#8D6E63"],
    "Loja de bebidas": ["#8B0000", "#D4AF37", "#2E7D32"],
    "Moda / Boutique": ["#000000", "#D4AF37", "#E91E63"],
    "Farmácia": ["#00A86B", "#0288D1", "#FFFFFF"],
    "Restaurante / Lanchonete": ["#E53935", "#FF9800", "#6D4C41"],
    "Pet shop": ["#2196F3", "#FF9800", "#4CAF50"],
    "Materiais de construção": ["#FF6F00", "#607D8B", "#D84315"],
    "Salão / Estética": ["#E91E63", "#9C27B0", "#D4AF37"],
    "Eletrônicos": ["#2196F3", "#000000", "#00BCD4"],
    "Casa & Decoração": ["#795548", "#80CBC4", "#FF7043"],
    "Academia": ["#E53935", "#000000", "#FF6F00"],
    "Outro…": ["#000000", "#FFFFFF", "#3F51B5"],
  };

  return colorMap[segment] || colorMap["Outro…"];
}

/**
 * Get all available segments
 * 
 * @returns Array of all available business segments
 */
export function getAllSegments(): Segment[] {
  return Object.keys(LOGO_PROMPT_TEMPLATES_V2) as Segment[];
}

/**
 * Validate if a segment is supported
 * 
 * @param segment - Segment string to validate
 * @returns true if segment is supported, false otherwise
 */
export function isValidSegment(segment: string): segment is Segment {
  return segment in LOGO_PROMPT_TEMPLATES_V2;
}

/**
 * DEBUGGING UTILITY: Get raw template structure for inspection
 * 
 * This function is useful for debugging and testing to inspect the
 * structured template before it's compiled into a final prompt string.
 * 
 * @param segment - Business segment
 * @returns Raw LogoPromptV2 template object
 * 
 * @internal
 */
export function getRawTemplate(segment: Segment): LogoPromptV2 {
  return (
    LOGO_PROMPT_TEMPLATES_V2[segment] || LOGO_PROMPT_TEMPLATES_V2["Outro…"]
  );
}

/**
 * COMPARISON UTILITY: Get both v1 and v2 prompts side-by-side
 * 
 * This function is useful for A/B testing and comparing the changes
 * between v1 and v2 prompts. It returns both versions for the same
 * segment and store name.
 * 
 * NOTE: This requires importing the v1 function from logo-prompts.ts
 * 
 * @param storeName - Name of the store
 * @param segment - Business segment
 * @returns Object with both v1 and v2 prompts
 * 
 * @example
 * ```typescript
 * const comparison = compareV1vsV2("Test Store", "Loja de bebidas");
 * console.log("V1 Length:", comparison.v1.length);
 * console.log("V2 Length:", comparison.v2.length);
 * console.log("Improvement:", comparison.improvements);
 * ```
 */
export function compareV1vsV2(
  storeName: string,
  segment: Segment
): {
  v1: string;
  v2: string;
  improvements: string[];
} {
  // NOTE: To use this function, uncomment and import from v1:
  // import { getLogoPromptBySegment as getV1Prompt } from './logo-prompts';
  // const v1 = getV1Prompt(storeName, segment);
  
  const v1 = "[Import v1 function to compare]";
  const v2 = getLogoPromptBySegment(storeName, segment);
  
  const improvements = [
    "✅ Singular 'shape' enforced (prevents grids)",
    "✅ EITHER...OR pattern forces single element choice",
    "✅ Removed 'suitable for social media' (prevents mockups)",
    "✅ Added explicit DO NOT CREATE section",
    "✅ Added 'ONE cohesive shape' language throughout",
    "✅ Added centered composition guidance",
  ];

  return { v1, v2, improvements };
}
