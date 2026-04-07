import { NextResponse } from "next/server";
import { buildAutoDNA, RawStoreData } from "@/lib/domain/stores/auto-dna";

/**
 * Rota de desenvolvimento para validar o Motor de Brand DNA V2.
 * GET /api/dev/verify-dna
 */
export async function GET() {
  const storeA: RawStoreData = {
    id: "store-a",
    main_segment: "adega",
    primary_color: null,
    tone_of_voice: null,
    brand_positioning: null
  };

  const storeB: RawStoreData = {
    id: "store-b",
    main_segment: "adega",
    primary_color: null,
    tone_of_voice: null,
    brand_positioning: null
  };

  const dnaA = buildAutoDNA(storeA);
  const dnaB = buildAutoDNA(storeB);

  const results = {
    test_suit: "Brand DNA V2 Inference Engine",
    timestamp: new Date().toISOString(),
    tests: [
      {
        name: "Determinismo (Mesma loja -> Mesmo DNA)",
        passed: JSON.stringify(dnaA) === JSON.stringify(buildAutoDNA(storeA))
      },
      {
        name: "Anti-colisão (Seeds diferentes para mesmo segmento)",
        passed: dnaA.palette.primary !== dnaB.palette.primary,
        details: { storeA: dnaA.palette.primary, storeB: dnaB.palette.primary }
      },
      {
        name: "Fallback Segmento (null -> modern)",
        passed: buildAutoDNA({ ...storeA, main_segment: null }).visual_style === "modern"
      },
      {
        name: "Completude (V2 blocks are present)",
        passed: !!(dnaA.image_treatment && dnaA.background_treatment && dnaA.brand_temperature)
      }
    ],
    payload_sample: dnaA
  };

  return NextResponse.json(results);
}
