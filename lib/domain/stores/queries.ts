import { supabaseAdmin } from "@/lib/supabase/admin";
import { StoreContext } from "./types";
import { mapDbStoreToDomain } from "./mapper";

/**
 * Busca os campos de contexto da loja necessários para geração de IA.
 * Retorna null se a loja não for encontrada.
 */
export async function fetchStoreContext(
  storeId: string
): Promise<StoreContext | null> {
  const { data, error } = await supabaseAdmin
    .from("stores")
    .select(
      `id, name, city, state,
       brand_positioning, main_segment, tone_of_voice,
       whatsapp, phone, instagram,
       primary_color, secondary_color, logo_url`
    )
    .eq("id", storeId)
    .single();

  if (error || !data) return null;
  return mapDbStoreToDomain(data);
}
