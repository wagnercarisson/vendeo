import { resolveBrandDNA } from './lib/domain/stores/mapper';
import { BrandDNA } from './lib/domain/stores/brand-dna';

console.log("=== INICIANDO TESTES DO MAPPER ===");

const storeId = "store-123";

// 1. Caso: Loja sem DNA (Novo Onboarding)
const rawNew = {
  main_segment: "pet shop",
  primary_color: null,
};
const dnaNew = resolveBrandDNA(rawNew, storeId);
console.log(`1. Loja sem DNA -> Gerou automático (V2): ${dnaNew.version === 2 ? "✅" : "❌"}`);
console.log(`   Estilo: ${dnaNew.visual_style} (Esperado: modern)`);

// 2. Caso: Loja com DNA parcial/legado (V1)
const rawLegacy = {
  main_segment: "adega",
  brand_dna: {
    version: 1,
    palette: { primary: "#FF0000" },
    visual_style: "luxury"
  }
};
const dnaHydrated = resolveBrandDNA(rawLegacy, storeId);
console.log(`2. Loja com DNA V1 -> Hidratou para V2: ${dnaHydrated.version === 2 ? "✅" : "❌"}`);
console.log(`   Manteve cor primária: ${dnaHydrated.palette.primary === "#FF0000" ? "✅" : "❌"}`);
console.log(`   Adicionou temperatura: ${dnaHydrated.brand_temperature ? "✅" : "❌"}`);

// 3. Caso: Loja com DNA completo (V2)
const v2Dna: BrandDNA = {
  version: 2,
  visual_seed: storeId,
  visual_style: "minimal",
  brand_temperature: "cool",
  palette: { primary: "#0000FF", secondary: "#0000AA", accent: "#000055", neutral: "#CCCCCC" },
  typography: { headline_font: "sans_display", body_font: "sans_clean" },
  image_treatment: { filter: "natural", warmth: 0, contrast: 0, saturation: 0 },
  background_treatment: { style: "solid_clean", intensity: "subtle" },
  tone_of_voice: "informative",
  positioning: "Teste V2",
  config: { visual_aggression: 0.5 }
};
const rawComplete = { brand_dna: v2Dna };
const dnaMaintained = resolveBrandDNA(rawComplete, storeId);
console.log(`3. Loja com DNA V2 -> Manteve original: ${dnaMaintained.visual_style === "minimal" ? "✅" : "❌"}`);

console.log("=== FIM DOS TESTES DO MAPPER ===");
