import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { StoreContext, Store } from "./types";
import { mapDbStoreToDomain } from "./mapper";

/**
 * Busca a única loja do usuário logado (padrão do sistema).
 * Memoizado via React cache() para evitar múltiplas queries por requisição.
 */
export const getStoreByOwner = cache(async (userId: string): Promise<Store | null> => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbStoreToDomain(data);
});

/**
 * Busca os campos de contexto da loja necessários para geração de IA.
 * Retorna null se a loja não for encontrada.
 */
export async function fetchStoreContext(
  storeId: string
): Promise<StoreContext | null> {
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("stores")
    .select(
      `id, name, city, state,
       brand_positioning, main_segment, tone_of_voice,
       whatsapp, phone, instagram,
       address, neighborhood,
       primary_color, secondary_color, logo_url,
       brand_profile, brand_profile_version, brand_profile_updated_at`
    )
    .eq("id", storeId)
    .single();

  if (error || !data) return null;
  return mapDbStoreToDomain(data);
}
