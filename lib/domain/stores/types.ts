export interface StoreBranch {
  id: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  whatsapp: string | null;
  is_main: boolean;
  is_active: boolean;
}

/** Campos mínimos da loja que os services de geração precisam. */
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
  owner_user_id?: string | null;
  branches: StoreBranch[];
}

export type StoreContext = Store;
