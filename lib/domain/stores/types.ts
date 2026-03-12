/** Campos mínimos da loja que os services de geração precisam. */
export interface StoreContext {
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
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
}
