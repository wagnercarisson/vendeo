import Link from "next/link";

export function DashboardActions() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Nova campanha (AÇÃO PRINCIPAL) */}
      <div className="rounded-2xl border bg-white p-6 shadow-soft transition hover:shadow-md flex flex-col">
        <div className="text-lg font-semibold text-vendeo-text">
          Nova campanha
        </div>

        <p className="mt-1 text-sm text-vendeo-muted">
          Crie um post que vende em minutos
        </p>

        {/* wrapper trava o botão sem esticar */}
        <div className="mt-auto pt-5 flex">
          <Link
            href="/dashboard/campaigns/new"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
          >
            Criar campanha
          </Link>
        </div>
      </div>

      {/* Plano semanal (AÇÃO SECUNDÁRIA) */}
      <div className="rounded-2xl border bg-white p-6 shadow-soft transition hover:shadow-md flex flex-col">
        <div className="text-lg font-semibold text-vendeo-text">
          Plano semanal
        </div>

        <p className="mt-1 text-sm text-vendeo-muted">
          Sugestões prontas para cada dia
        </p>

        {/* wrapper trava o botão sem esticar */}
        <div className="mt-auto pt-5 flex">
          <Link
            href="/dashboard/plans/new"
            className="inline-flex items-center justify-center rounded-xl border border-vendeo-border bg-white px-5 py-2 text-sm font-semibold text-vendeo-text hover:bg-slate-50 transition"
          >
            Gerar plano
          </Link>
        </div>
      </div>
    </div>
  );
}