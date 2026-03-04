import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  // ✅ Auth guard robusto
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  if (error || !user) {
    redirect(`/login?mode=login&next=${encodeURIComponent("/dashboard")}`);
  }

  // ✅ Loja é opcional no layout (para não criar loop em /dashboard/store)
  const { data: store } = await supabase
    .from("stores")
    .select("id,name,city,state")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <DashboardShell
      user={user}
      storeId={store?.id ?? null}
      storeName={store?.name ?? null}
      storeCity={store?.city ?? null}
      storeState={store?.state ?? null}
    >
      {children}
    </DashboardShell>
  );
}