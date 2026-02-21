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
        router.replace("/login?redirect=%2Fapp");
        return;
      }

      const { data: store, error } = await supabase
        .from("stores")
        .select("id")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        router.replace("/login?redirect=%2Fapp");
        return;
      }

      if (!store) {
        router.replace("/store");
        return;
      }

      router.replace("/plans");
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
