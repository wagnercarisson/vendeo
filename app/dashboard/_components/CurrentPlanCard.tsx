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

function formatStatus(status: string | null) {
  const s = (status ?? "").toLowerCase();
  if (!s) return { label: "Gerado", tone: "success" as const };
  if (s === "generated") return { label: "Gerado", tone: "success" as const };
  if (s === "draft") return { label: "Rascunho", tone: "neutral" as const };
  if (s === "scheduled") return { label: "Agendado", tone: "warning" as const };
  if (s === "published") return { label: "Publicado", tone: "success" as const };
  return { label: status ?? "Gerado", tone: "neutral" as const };
}

function badgeClass(tone: "neutral" | "success" | "warning") {
  if (tone === "success")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "warning")
    return "border-orange-200 bg-orange-50 text-orange-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function CurrentPlanCard({
  plan,
  title = "Planos recentes",
  viewAllLabel = "Visualizar todos",
}: {
  plan: Plan | null;
  title?: string;
  viewAllLabel?: string;
}) {
  const st = formatStatus(plan?.status ?? null);

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-vendeo-text">{title}</div>
          <div className="mt-1 text-xs text-vendeo-muted">
            {plan ? (
              <>
                <span className="font-semibold text-vendeo-text">1</span> recente
              </>
            ) : (
              "Gere um plano para organizar sua semana."
            )}
          </div>
        </div>

        <Link
          href="/dashboard/plans"
          className="text-sm text-vendeo-muted underline hover:text-vendeo-text"
        >
          {viewAllLabel}
        </Link>
      </div>

      {!plan ? (
        <div className="mt-4 rounded-xl border border-dashed p-4 transition-all hover:shadow-md hover:-translate-y-[1px]">
          <div className="text-sm font-semibold text-vendeo-text">
            Você ainda não gerou um plano
          </div>
          <p className="mt-1 text-sm text-vendeo-muted">
            Gere sugestões prontas para cada dia da semana.
          </p>

          <Link
            href="/dashboard/plans/new"
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Gerar plano agora
          </Link>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border bg-white p-4 transition-all hover:shadow-md hover:-translate-y-[1px]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-vendeo-text">
              Semana de {formatWeekStart(plan.week_start)}
            </div>

            <span
              className={[
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                badgeClass(st.tone),
              ].join(" ")}
            >
              {st.label}
            </span>
          </div>

          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
            <div className="text-xs font-medium text-vendeo-muted">Dica rápida</div>
            <div className="mt-1 text-xs text-vendeo-muted">
              Use o plano para manter consistência e vender mais durante a semana.
            </div>
          </div>

          <Link
            href={`/dashboard/plans/${plan.id}`}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold text-vendeo-text hover:bg-slate-50 transition"
          >
            Abrir plano <span className="ml-1">→</span>
          </Link>

          <Link
            href="/dashboard/plans/new"
            className="mt-3 inline-flex text-sm text-vendeo-muted underline hover:text-vendeo-text"
          >
            Gerar outro
          </Link>
        </div>
      )}
    </div>
  );
}