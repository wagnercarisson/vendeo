import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStoreByOwner } from "@/lib/domain/stores/queries";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  // ✅ Auth guard robusto
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  if (error || !user) {
    redirect(`/login?mode=login&next=${encodeURIComponent("/dashboard")}`);
  }

  // ✅ Busca unificada e memoizada (Etapa 1.1)
  const store = await getStoreByOwner(user.id);

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