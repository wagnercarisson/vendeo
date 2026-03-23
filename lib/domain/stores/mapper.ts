import { Store } from "./types";

/**
 * Mapeia uma linha crua do banco para o tipo de domínio Store.
 * Garante que campos opcionais tenham fallbacks consistentes (null).
 */
export function mapDbStoreToDomain(raw: any): Store {
  return {
    id: String(raw.id),
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
  };
}
