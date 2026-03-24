import Link from "next/link";

export function GettingStarted({
  hasCampaigns,
  hasPlan,
}: {
  hasCampaigns: boolean;
  hasPlan: boolean;
}) {
  const stepsTotal = 3;
  const stepsDone = 1 + (hasCampaigns ? 1 : 0) + (hasPlan ? 1 : 0);
  const progressPct = Math.round((stepsDone / stepsTotal) * 100);

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-vendeo-text">
            Comece por aqui
          </div>
          <p className="mt-1 text-sm text-vendeo-muted">
            Complete esses passos para tirar o máximo do Vendeo.
          </p>
        </div>

        <div className="shrink-0 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-vendeo-text">
          {stepsDone}/{stepsTotal}
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-emerald-600 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-vendeo-muted">
          Progresso: {progressPct}%
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {/* Step 1 */}
        <div className="flex items-start gap-3 rounded-xl border p-3">
          <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border bg-emerald-50 text-xs font-bold text-emerald-700">
            ✓
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-vendeo-text">
              Loja cadastrada
            </div>
            <div className="text-xs text-vendeo-muted">
              Você já concluiu o primeiro passo.
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-3 rounded-xl border p-3">
          <div
            className={[
              "mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border text-xs font-bold",
              hasCampaigns
                ? "bg-emerald-50 text-emerald-700"
                : "bg-white text-vendeo-muted",
            ].join(" ")}
          >
            {hasCampaigns ? "✓" : "2"}
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-vendeo-text">
              {hasCampaigns ? (
                "Primeira campanha criada"
              ) : (
                <span>Crie sua primeira campanha</span>
              )}
            </div>

            <div className="mt-1 text-xs text-vendeo-muted">
              {hasCampaigns ? (
                "Agora você já consegue gerar conteúdo sempre que precisar."
              ) : (
                <>
                  <span>Crie um post pronto para vender em minutos. </span>
                  <Link
                    className="font-semibold text-emerald-700 hover:text-emerald-800"
                    href="/dashboard/campaigns/new"
                  >
                    Criar campanha →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-3 rounded-xl border p-3">
          <div
            className={[
              "mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border text-xs font-bold",
              hasPlan ? "bg-emerald-50 text-emerald-700" : "bg-white text-vendeo-muted",
            ].join(" ")}
          >
            {hasPlan ? "✓" : "3"}
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-vendeo-text">
              {hasPlan ? "Plano semanal gerado" : "Gere seu primeiro plano semanal"}
            </div>

            <div className="mt-1 text-xs text-vendeo-muted">
              {hasPlan ? (
                "Você já tem sugestões prontas para publicar ao longo da semana."
              ) : (
                <>
                  <span>Receba sugestões por dia e mantenha consistência. </span>
                  <Link
                    className="font-semibold text-emerald-700 hover:text-emerald-800"
                    href="/dashboard/plans?view=new"
                  >
                    Gerar plano →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}