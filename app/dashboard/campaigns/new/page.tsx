import { Suspense } from "react";
import { NewCampaignShell } from "./_components/NewCampaignShell";
import { NewCampaignSkeleton } from "./_components/NewCampaignSkeleton";

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<NewCampaignSkeleton />}>
      <NewCampaignShell />
    </Suspense>
  );
}