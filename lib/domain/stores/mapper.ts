import { Store } from "./types";
import { BrandDNA } from "./brand-dna";
import { buildAutoDNA } from "./auto-dna";

/**
 * Resolve a identidade visual da loja com suporte a fallback legado.
 * Garante que o Domínio sempre tenha um DNA completo (V2), mesmo que o banco seja antigo.
 */
export function resolveBrandDNA(raw: any, storeId: string): BrandDNA {
  // 1. Prioridade absoluta: DNA persistido no Banco de Dados
  if (raw.brand_dna && typeof raw.brand_dna === "object") {
    const existing = raw.brand_dna as Partial<BrandDNA>;

    // Se já for V2 e tiver campos novos, assume que está pronto
    if (existing.version === 2 && existing.brand_temperature) {
      return existing as BrandDNA;
    }

    // Se for V1 (legado do beta fechado), hidratamos com os novos campos
    return hydrateLegacyDNA(existing, raw, storeId);
  }

  // 2. Sem DNA persistido: Geramos automaticamente (Fluxo Free/Onboarding)
  return buildAutoDNA({
    id: storeId,
    main_segment: raw.main_segment ?? null,
    primary_color: raw.primary_color ?? null,
    tone_of_voice: raw.tone_of_voice ?? null,
    brand_positioning: raw.brand_positioning ?? null,
  });
}

/**
 * Hidratação de DNA legado:
 * Lojas do beta fechado têm DNA no banco mas sem os campos operacionais novos.
 * Esta função completa os campos ausentes usando o Auto DNA Engine
 * sem sobrescrever o que o lojista já definiu (estilo, paleta base).
 */
function hydrateLegacyDNA(
  existing: Partial<BrandDNA>,
  raw: any,
  storeId: string
): BrandDNA {
  const auto = buildAutoDNA({
    id: storeId,
    main_segment: raw.main_segment ?? null,
    primary_color: raw.primary_color ?? null,
    tone_of_voice: raw.tone_of_voice ?? null,
    brand_positioning: raw.brand_positioning ?? null,
  });

  return {
    ...auto, // Começa com o DNA completo gerado pelo engine
    ...existing, // Sobrescreve com o que já existia no banco
    version: 2, // Eleva para a versão 2
    // Merge profundo da paleta para evitar buracos (ex: falta neutral ou accent)
    palette: {
      primary: existing.palette?.primary ?? auto.palette.primary,
      secondary: existing.palette?.secondary ?? auto.palette.secondary,
      accent: existing.palette?.accent ?? auto.palette.accent,
      neutral: existing.palette?.neutral ?? auto.palette.neutral,
    },
    // Merge da tipografia
    typography: {
      headline_font:
        existing.typography?.headline_font ?? auto.typography.headline_font,
      body_font: existing.typography?.body_font ?? auto.typography.body_font,
    },
  };
}

/**
 * Mapeia uma linha crua do banco para o tipo de domínio Store.
 * Garante que campos opcionais tenham fallbacks consistentes (null).
 */
export function mapDbStoreToDomain(raw: any): Store {
  const storeId = String(raw.id);

  return {
    id: storeId,
    name: String(raw.name || "Sem Nome"),
    city: raw.city ?? null,
    state: raw.state ?? null,
    main_segment: raw.main_segment ?? null,
    brand_positioning: raw.brand_positioning ?? null,
    tone_of_voice: raw.tone_of_voice ?? null,
    whatsapp: raw.whatsapp ?? null,
    phone: raw.phone ?? null,
    instagram: raw.instagram ?? null,
    address: raw.address ?? null,
    neighborhood: raw.neighborhood ?? null,
    primary_color: raw.primary_color ?? null,
    secondary_color: raw.secondary_color ?? null,
    logo_url: raw.logo_url ?? null,
    owner_user_id: raw.owner_user_id ?? null,
    brand_dna: resolveBrandDNA(raw, storeId),
    branches: Array.isArray(raw.branches)
      ? raw.branches.map((b: any) => ({
        id: String(b.id),
        name: String(b.name),
        address: b.address ?? null,
        neighborhood: b.neighborhood ?? null,
        city: b.city ?? null,
        state: b.state ?? null,
        whatsapp: b.whatsapp ?? null,
        is_main: !!b.is_main,
        is_active: !!b.is_active,
      }))
      : Array.isArray(raw.store_branches)
        ? raw.store_branches.map((b: any) => ({
          id: String(b.id),
          name: String(b.name),
          address: b.address ?? null,
          neighborhood: b.neighborhood ?? null,
          city: b.city ?? null,
          state: b.state ?? null,
          whatsapp: b.whatsapp ?? null,
          is_main: !!b.is_main,
          is_active: !!b.is_active,
        }))
        : [],
  };
}
