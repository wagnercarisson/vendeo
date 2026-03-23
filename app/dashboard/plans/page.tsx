"use client";

import { useState, useEffect } from "react";
import { WizardShell } from "./_components/WizardShell";
import { PlansList } from "./_components/PlansList";
import { useSearchParams, useRouter } from "next/navigation";

export default function PlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewPlanView = searchParams.get("view") === "new";
  const weekStartParam = searchParams.get("week_start") || undefined;

  if (isNewPlanView) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push("/dashboard/plans")}
          className="text-sm text-slate-500 hover:text-slate-800 underline mb-4 inline-block"
        >
          &larr; Voltar para Meus Planos
        </button>
        <WizardShell initialWeekStart={weekStartParam} />
      </div>
    );
  }

  return <PlansList onNewPlan={() => router.push("/dashboard/plans?view=new")} />;
}