/** Campos mínimos da loja que os services de geração precisam. */
export interface StoreBrandProfile {
  schema_version: string;
  store_id: string;
  store_name: string;
  contact: {
    whatsapp: string | null;
    phone: string | null;
  };
  location: {
    address: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
  };
  visual: {
    primary_color: string | null;
    secondary_color: string | null;
    logo_url: string | null;
  };
  voice: {
    tone_of_voice: string | null;
    brand_positioning: string | null;
  };
}

/**
 * Indica qual fonte originou o Brand Profile resolvido para esta instância da Store.
 * "published"  — a coluna brand_profile JSONB existia e foi validada com sucesso.
 * "legacy"     — brand_profile estava ausente ou inválido; fallback determinístico aplicado.
 * Fallback legado é compatibilidade com o domínio atual, não é preferência aprendida nem snapshot.
 */
export type BrandProfileSource = "published" | "legacy";

export interface Store {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  main_segment: string | null;
  brand_positioning: string | null;
  tone_of_voice: string | null;
  whatsapp: string | null;
  phone: string | null;
  instagram: string | null;
  address?: string | null;
  neighborhood?: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  brand_profile?: StoreBrandProfile | null;
  brand_profile_version?: number | null;
  brand_profile_updated_at?: string | null;
  /** Indica a origem do Brand Profile resolvido nesta instância. */
  brand_profile_source?: BrandProfileSource | null;
}

export type StoreContext = Store;
