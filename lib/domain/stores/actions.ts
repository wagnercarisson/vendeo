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
  const supabase = await createSupabaseServerClient();

  let error;
  if (storeId) {
    const { error: err } = await supabase.from("stores").update(payload).eq("id", storeId);
    error = err;
  } else {
    const { error: err } = await supabase.from("stores").insert(payload);
    error = err;
  }

  if (!error) {
    // Força o Next.js a descartar o cache (servidor e navegador) de toda a dashboard
    // O tipo "layout" garante que o layout pai também seja revalidado
    revalidatePath("/dashboard", "layout");
  }

  return { error: error?.message };
}
