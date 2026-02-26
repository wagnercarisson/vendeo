import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  // 1 usuário = 1 loja: pega a primeira loja do owner
  const { data: store } = await supabase
    .from("stores")
    .select("name,city,state")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <DashboardShell
      user={user}
      storeName={store?.name ?? null}
      storeCity={store?.city ?? null}
      storeState={store?.state ?? null}
    >
      {children}
    </DashboardShell>
  );
}