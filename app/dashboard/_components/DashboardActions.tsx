import Link from "next/link";

export function DashboardActions() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Nova campanha (AÇÃO PRINCIPAL) */}
      <div className="rounded-2xl border bg-white p-6 shadow-soft transition-all hover:shadow-md hover:-translate-y-[1px]">
        <div className="text-lg font-semibold text-vendeo-text">
          Nova campanha
        </div>

        <p className="mt-1 text-sm text-vendeo-muted">
          Crie um post pronto para vender em poucos minutos.
        </p>

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
      <div className="rounded-2xl border bg-white p-6 shadow-soft transition-all hover:shadow-md hover:-translate-y-[1px]">
        <div className="text-lg font-semibold text-vendeo-text">Plano semanal</div>

        <p className="mt-1 text-sm text-vendeo-muted">
          Sugestões prontas para cada dia da semana.
        </p>

        <div className="mt-auto pt-5 flex">
          <Link
            href="/dashboard/plans?view=new"
            className="inline-flex items-center justify-center rounded-xl border border-vendeo-border bg-white px-5 py-2 text-sm font-semibold text-vendeo-text hover:bg-slate-50 transition"
          >
            Gerar plano
          </Link>
        </div>
      </div>
    </div>
  );
}