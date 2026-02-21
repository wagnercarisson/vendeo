import { redirect } from "next/navigation";
import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";

export default async function AppEntry() {
  try {
    await getUserStoreIdOrThrow();
  } catch (e: any) {
    const msg = String(e?.message || "");

    if (msg === "not_authenticated") {
      redirect("/login?redirect=/app");
    }

    if (msg === "store_not_found") {
      redirect("/onboarding/store");
    }

    redirect("/login");
  }

  redirect("/app/dashboard");
}
