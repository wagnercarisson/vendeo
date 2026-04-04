"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Salva ou atualiza os dados da loja e invalida o cache do Next.js.
 * 
 * @param payload Dados da loja mapeados para snake_case (formato do banco)
 * @param storeId ID da loja (se estiver editando)
 */
export async function saveStoreAction(payload: any, storeId?: string) {
  const supabase = createSupabaseServerClient();
  
  // ✅ Extrai filiais para tratar separadamente na RPC
  const { branches, ...storeData } = payload;
  
  // ✅ Chama a RPC atômica que cuida de Loja + Filiais em uma transação
  const { error } = await supabase.rpc('save_store_with_branches', {
    p_store_id: storeId || null,
    p_store_data: storeData,
    p_branches: branches || []
  });

  if (!error) {
    // Força o Next.js a descartar o cache (servidor e navegador) de toda a dashboard
    revalidatePath("/dashboard", "layout");
  }

  return { error: error?.message };
}
