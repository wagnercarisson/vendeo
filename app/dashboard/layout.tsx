import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStoreByOwner } from "@/lib/domain/stores/queries";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { NavigationGuardProvider } from "@/lib/context/NavigationGuardContext";

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

  // ✅ Busca unificada e memoizada (Etapa 1.1)
  const store = await getStoreByOwner(user.id);

  return (
    <NavigationGuardProvider>
      <DashboardShell
        user={user}
        storeId={store?.id ?? null}
        storeName={store?.name ?? null}
        storeCity={store?.city ?? null}
        storeState={store?.state ?? null}
      >
        {children}
      </DashboardShell>
    </NavigationGuardProvider>
  );
}