"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AppEntryPage() {
  const router = useRouter();

  useEffect(() => {
    async function run() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?mode=login&next=%2Fdashboard");
        return;
      }

      const { data: store, error } = await supabase
        .from("stores")
        .select("id")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar store:", error);
        router.replace("/login?mode=login&next=%2Fdashboard");
        return;
      }

      if (!store) {
        router.replace("/dashboard/store");
        return;
      }

      router.replace("/dashboard/plans");
    }

    run();
  }, [router]);

  return (
    <main style={{ padding: 40 }}>
      <h1>Entrando no Vendeo...</h1>
      <p>Carregando…</p>
    </main>
  );
}