import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserStoreIdOrThrow() {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("not_authenticated");

  const { data, error } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data?.id) throw new Error("store_not_found");

  return { userId: user.id, storeId: data.id as string };
}