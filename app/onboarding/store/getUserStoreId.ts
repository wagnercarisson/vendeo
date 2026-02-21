import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserStoreIdOrNull() {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return { user: null, storeId: null as string | null };

  const { data, error } = await supabase
    .from("store_members")
    .select("store_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return { user, storeId: null };
  return { user, storeId: data?.store_id ?? null };
}

export async function getUserStoreIdOrThrow() {
  const { user, storeId } = await getUserStoreIdOrNull();
  if (!user) throw new Error("not_authenticated");
  if (!storeId) throw new Error("store_not_found");
  return { user, storeId };
}
