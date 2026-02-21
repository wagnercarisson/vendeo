import { redirect } from "next/navigation";
import { getUserPrimaryStoreId } from "@/lib/store/getUserStore";

export default async function AppEntry() {
  const { user, storeId } = await getUserPrimaryStoreId();

  if (!user) {
    redirect("/login?redirect=/app");
  }

  if (!storeId) {
    redirect("/onboarding/store");
  }

  redirect("/app/dashboard");
}
