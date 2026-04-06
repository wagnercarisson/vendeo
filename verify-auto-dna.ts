import { buildAutoDNA, RawStoreData } from './lib/domain/stores/auto-dna';

const store1: RawStoreData = {
  id: "store-a",
  main_segment: "adega",
  primary_color: null,
  tone_of_voice: null,
  brand_positioning: null
};

const store2: RawStoreData = {
  id: "store-b", // ID diferente deve gerar cor primária diferente
  main_segment: "adega",
  primary_color: null,
  tone_of_voice: null,
  brand_positioning: null
};

console.log("=== INICIANDO TESTES AUTO-DNA (TS) ===");

// 1. Testar Determinismo
const dna1a = buildAutoDNA(store1);
const dna1b = buildAutoDNA(store1);
const isDeterministic = JSON.stringify(dna1a) === JSON.stringify(dna1b);
console.log(`Determinismo: ${isDeterministic ? "✅ PASSOU" : "❌ FALHOU"}`);

// 2. Testar Fallback Modern
const storeNull: RawStoreData = { ...store1, main_segment: null };
const dnaNull = buildAutoDNA(storeNull);
const isModern = dnaNull.visual_style === "modern";
console.log(`Fallback Modern: ${isModern ? "✅ PASSOU" : "❌ FALHOU"}`);

// 3. Testar Anti-colisão (Seeds diferentes para mesmo segmento)
const dna2 = buildAutoDNA(store2);
const isDifferent = dna1a.palette.primary !== dna2.palette.primary;
console.log(`Anti-colisão (Primary Color via Seed): ${isDifferent ? "✅ PASSOU" : "❌ FALHOU"}`);
console.log(`  Store A primary: ${dna1a.palette.primary}`);
console.log(`  Store B primary: ${dna2.palette.primary}`);

// 4. Verificar Undefined/Completude
const hasUndefined = JSON.stringify(dna1a).includes("undefined");
const isComplete = 
  dna1a.brand_temperature && 
  dna1a.image_treatment.filter && 
  dna1a.background_treatment.style &&
  dna1a.palette.neutral;

console.log(`Verificação de Completude: ${isComplete && !hasUndefined ? "✅ PASSOU" : "❌ FALHOU"}`);

console.log("=== FIM DOS TESTES ===");
