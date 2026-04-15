import { VISUAL_PIPELINE_SCHEMA_VERSION } from "@/lib/domain/visual-composition/contracts";
import { Store, StoreBrandProfile } from "./types";

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNullableRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function buildLegacyBrandProfile(raw: any): StoreBrandProfile {
  return {
    schema_version: VISUAL_PIPELINE_SCHEMA_VERSION,
    store_id: String(raw.id),
    store_name: String(raw.name || "Sem Nome"),
    contact: {
      whatsapp: raw.whatsapp ?? null,
      phone: raw.phone ?? null,
    },
    location: {
      address: raw.address ?? null,
      neighborhood: raw.neighborhood ?? null,
      city: raw.city ?? null,
      state: raw.state ?? null,
    },
    visual: {
      primary_color: raw.primary_color ?? null,
      secondary_color: raw.secondary_color ?? null,
      logo_url: raw.logo_url ?? null,
    },
    voice: {
      tone_of_voice: raw.tone_of_voice ?? null,
      brand_positioning: raw.brand_positioning ?? null,
    },
  };
}

function parsePublishedBrandProfile(raw: any): StoreBrandProfile | null {
  const brandProfile = asNullableRecord(raw.brand_profile);
  if (!brandProfile) return null;

  const contact = asNullableRecord(brandProfile.contact);
  const location = asNullableRecord(brandProfile.location);
  const visual = asNullableRecord(brandProfile.visual);
  const voice = asNullableRecord(brandProfile.voice);

  if (!contact || !location || !visual || !voice) {
    return null;
  }

  return {
    schema_version:
      asNullableString(brandProfile.schema_version) || VISUAL_PIPELINE_SCHEMA_VERSION,
    store_id: asNullableString(brandProfile.store_id) || String(raw.id),
    store_name: asNullableString(brandProfile.store_name) || String(raw.name || "Sem Nome"),
    contact: {
      whatsapp: asNullableString(contact.whatsapp),
      phone: asNullableString(contact.phone),
    },
    location: {
      address: asNullableString(location.address),
      neighborhood: asNullableString(location.neighborhood),
      city: asNullableString(location.city),
      state: asNullableString(location.state),
    },
    visual: {
      primary_color: asNullableString(visual.primary_color),
      secondary_color: asNullableString(visual.secondary_color),
      logo_url: asNullableString(visual.logo_url),
    },
    voice: {
      tone_of_voice: asNullableString(voice.tone_of_voice),
      brand_positioning: asNullableString(voice.brand_positioning),
    },
  };
}

export function resolveStoreBrandProfile(raw: any): StoreBrandProfile {
  return parsePublishedBrandProfile(raw) || buildLegacyBrandProfile(raw);
}

/**
 * Mapeia uma linha crua do banco para o tipo de domínio Store.
 * Garante que campos opcionais tenham fallbacks consistentes (null).
 */
export function mapDbStoreToDomain(raw: any): Store {
  const brandProfile = resolveStoreBrandProfile(raw);

  return {
    id: String(raw.id),
    name: brandProfile.store_name,
    city: brandProfile.location.city ?? raw.city ?? null,
    state: brandProfile.location.state ?? raw.state ?? null,
    main_segment: raw.main_segment ?? null,
    brand_positioning: brandProfile.voice.brand_positioning,
    tone_of_voice: brandProfile.voice.tone_of_voice,
    whatsapp: brandProfile.contact.whatsapp,
    phone: brandProfile.contact.phone,
    instagram: raw.instagram ?? null,
    address: brandProfile.location.address,
    neighborhood: brandProfile.location.neighborhood ?? raw.neighborhood ?? null,
    primary_color: brandProfile.visual.primary_color,
    secondary_color: brandProfile.visual.secondary_color,
    logo_url: brandProfile.visual.logo_url,
    brand_profile: brandProfile,
    brand_profile_version:
      typeof raw.brand_profile_version === "number" ? raw.brand_profile_version : null,
    brand_profile_updated_at:
      typeof raw.brand_profile_updated_at === "string" ? raw.brand_profile_updated_at : null,
  };
}
