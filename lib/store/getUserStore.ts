import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserPrimaryStoreId() {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return { user: null as any, storeId: null as string | null };
  }

  const { data, error } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    // não quebra o app por isso
    return { user, storeId: null };
  }

  return { user, storeId: data?.id ?? null };
}