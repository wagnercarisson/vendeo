"use client";

import { useState, useEffect } from "react";
import { WizardShell } from "./_components/WizardShell";
import { PlansList } from "./_components/PlansList";
import { useSearchParams } from "next/navigation";

export default function PlansPage() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view") === "new" ? "new" : "list";
  const [view, setView] = useState<"list" | "new">(initialView);

  useEffect(() => {
    if (searchParams.get("view") === "new") {
      setView("new");
    }
  }, [searchParams]);

  const weekStartParam = searchParams.get("week_start") || undefined;

  if (view === "new") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setView("list")}
          className="text-sm text-slate-500 hover:text-slate-800 underline mb-4 inline-block"
        >
          &larr; Voltar para Meus Planos
        </button>
        <WizardShell initialWeekStart={weekStartParam} />
      </div>
    );
  }

  return <PlansList onNewPlan={() => setView("new")} />;
}