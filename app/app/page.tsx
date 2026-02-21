import { redirect } from "next/navigation";
import { getUserStoreIdOrNull } from "@/lib/store/getUserStoreId";

export default async function AppEntry() {
  const { user, storeId } = await getUserStoreIdOrNull();

  if (!user) redirect("/login?redirect=/app");
  if (!storeId) redirect("/onboarding/store");

  redirect("/app/dashboard");
}
