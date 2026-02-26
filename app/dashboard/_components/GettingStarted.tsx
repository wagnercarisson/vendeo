import Link from "next/link";

export function GettingStarted({
  hasCampaigns,
  hasPlan,
}: {
  hasCampaigns: boolean;
  hasPlan: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-soft">
      <div className="text-lg font-semibold">Comece por aqui</div>
      <p className="mt-1 text-sm text-muted-foreground">
        Complete esses passos para tirar o máximo do Vendeo.
      </p>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-5 w-5 items-center justify-center rounded border text-xs">
            ✓
          </div>
          <div className="text-sm">Cadastre sua loja</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-5 w-5 items-center justify-center rounded border text-xs">
            {hasCampaigns ? "✓" : ""}
          </div>
          <div className="text-sm">
            {hasCampaigns ? (
              "Crie sua primeira campanha"
            ) : (
              <Link className="underline" href="/dashboard/campaigns/new">
                Crie sua primeira campanha
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-5 w-5 items-center justify-center rounded border text-xs">
            {hasPlan ? "✓" : ""}
          </div>
          <div className="text-sm">
            {hasPlan ? (
              "Gere seu primeiro plano semanal"
            ) : (
              <Link className="underline" href="/dashboard/plans/new">
                Gere seu primeiro plano semanal
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}