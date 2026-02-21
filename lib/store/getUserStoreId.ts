import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserStoreIdOrThrow() {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("not_authenticated");

  const { data, error } = await supabase
    .from("store_members")
    .select("store_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data?.store_id) throw new Error("store_not_found");

  return { user, storeId: data.store_id as string };
}
