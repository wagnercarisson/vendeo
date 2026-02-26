import Link from "next/link";

type Plan = {
  id: string;
  week_start: string; // date (YYYY-MM-DD)
  status: string | null;
};

function formatWeekStart(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return dt.toLocaleDateString("pt-BR");
}

export function CurrentPlanCard({ plan }: { plan: Plan | null }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Plano atual</div>
        <Link
          href="/dashboard/plans"
          className="text-sm text-muted-foreground underline hover:text-foreground"
        >
          Ver todos
        </Link>
      </div>

      {!plan ? (
        <div className="mt-4 rounded-xl border border-dashed p-4">
          <div className="text-sm font-medium">
            Você ainda não gerou um plano
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Gere sugestões prontas para cada dia da semana.
          </p>

          <Link
            href="/dashboard/plans/new"
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Gerar plano agora
          </Link>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border p-4">
          <div className="text-sm font-medium">
            Semana de {formatWeekStart(plan.week_start)}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Status: {plan.status ?? "generated"}
          </div>

          <Link
            href={`/dashboard/plans/${plan.id}`}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border px-4 py-2 text-sm hover:bg-muted"
          >
            Abrir plano
          </Link>

          <Link
            href="/dashboard/plans/new"
            className="mt-3 inline-flex text-sm text-muted-foreground underline hover:text-foreground"
          >
            Gerar outro
          </Link>
        </div>
      )}
    </div>
  );
}