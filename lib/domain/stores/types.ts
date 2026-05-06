export type StoreCategory =
  | 'bebidas_alcoolicas'
  | 'mercearia'
  | 'farmacias'
  | 'moda'
  | 'pet_shop'
  | 'restaurante';

export type BebidaSubcategory =
  | 'adega'
  | 'loja-bebidas'
  | 'distribuidor'
  | 'emporio-cervejas'
  | 'outro';

export type MerceariaSubcategory =
  | 'mercadinho-bairro'
  | 'minimercado'
  | 'hortifruti'
  | 'emporio-gourmet'
  | 'sacolao'
  | 'outro';

/** Campos mínimos da loja que os services de geração precisam. */
export interface Store {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  main_segment: string | null;
  category?: StoreCategory | null;
  subcategory?: BebidaSubcategory | MerceariaSubcategory | string | null;
  subcategory_custom?: string | null;
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
}

export type StoreContext = Store;
