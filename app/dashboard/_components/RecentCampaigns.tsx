import Link from "next/link";

type Campaign = {
  id: string;
  product_name: string;
  status: string | null;
  created_at: string;
};

export function RecentCampaigns({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Últimas campanhas</div>
        <Link
          href="/dashboard/campaigns"
          className="text-sm text-muted-foreground underline hover:text-foreground"
        >
          Ver todas
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed p-4">
          <div className="text-sm font-medium">
            Você ainda não criou campanhas
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece criando sua primeira campanha para gerar conteúdo pronto.
          </p>

          <Link
            href="/dashboard/campaigns/new"
            className="mt-3 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Criar primeira campanha
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border p-3"
            >
              <div>
                <div className="text-sm font-medium">{c.product_name}</div>
                <div className="text-xs text-muted-foreground">
                  {(c.status ?? "draft").toString()} •{" "}
                  {new Date(c.created_at).toLocaleDateString("pt-BR")}
                </div>
              </div>

              <Link
                href={`/dashboard/campaigns/${c.id}`}
                className="inline-flex rounded-xl border px-3 py-2 text-sm hover:bg-muted"
              >
                Abrir
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}