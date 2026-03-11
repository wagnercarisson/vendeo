import Link from "next/link";

type Campaign = {
  id: string;
  product_name: string;
  status: string | null;
  created_at: string;
};

function formatStatus(status: string | null) {
  const s = (status ?? "").toLowerCase();
  if (!s) return { label: "Rascunho", tone: "neutral" as const };
  if (s === "draft") return { label: "Rascunho", tone: "neutral" as const };
  if (s === "generated") return { label: "Gerado", tone: "success" as const };
  if (s === "scheduled") return { label: "Agendado", tone: "warning" as const };
  if (s === "published") return { label: "Publicado", tone: "success" as const };
  if (s === "active") return { label: "Ativo", tone: "success" as const };
  return { label: status ?? "Rascunho", tone: "neutral" as const };
}

function badgeClass(tone: "neutral" | "success" | "warning") {
  if (tone === "success")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "warning")
    return "border-orange-200 bg-orange-50 text-orange-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function accentClass(tone: "neutral" | "success" | "warning") {
  if (tone === "success") return "bg-emerald-500";
  if (tone === "warning") return "bg-orange-500";
  return "bg-slate-400";
}

function formatDateCompact(date: string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function RecentCampaigns({
  campaigns,
  title = "Campanhas recentes",
  viewAllLabel = "Visualizar todas",
}: {
  campaigns: Campaign[];
  title?: string;
  viewAllLabel?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-vendeo-text">{title}</div>
          <div className="mt-1 text-xs text-vendeo-muted">
            {campaigns.length > 0 ? (
              <>
                <span className="font-semibold text-vendeo-text">
                  {campaigns.length}
                </span>{" "}
                recentes
              </>
            ) : (
              "Crie sua primeira campanha para começar."
            )}
          </div>
        </div>

        <Link
          href="/dashboard/campaigns"
          className="text-sm text-vendeo-muted underline hover:text-vendeo-text"
        >
          {viewAllLabel}
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed p-4">
          <div className="text-sm font-semibold text-vendeo-text">
            Você ainda não criou campanhas
          </div>
          <p className="mt-1 text-sm text-vendeo-muted">
            Comece criando sua primeira campanha para gerar conteúdo pronto.
          </p>

          <Link
            href="/dashboard/campaigns/new"
            className="mt-3 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Criar primeira campanha
          </Link>
        </div>
      ) : (
        <>
          {/* Scroll discreto: mantém dashboard “curta” */}
          <div className="mt-4 max-h-[420px] space-y-3 overflow-auto pr-1">
            {campaigns.map((c) => {
              const st = formatStatus(c.status);

              return (
                <div
                  key={c.id}
                  className="group relative overflow-hidden rounded-2xl border bg-white p-4 transition-all hover:shadow-md hover:-translate-y-[1px] hover:border-slate-200"
                >
                  <div
                    className={[
                      "absolute left-0 top-0 h-full w-1.5",
                      accentClass(st.tone),
                    ].join(" ")}
                  />

                  <div className="flex items-center justify-between gap-4 pl-2">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Thumbnail Placeholder */}
                      <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-vendeo-bg border overflow-hidden relative group-hover:scale-105 transition-transform">
                         <div className="absolute inset-0 bg-glass-gradient" />
                         <span className="text-xl">📦</span>
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-vendeo-text">
                          {c.product_name}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span
                            className={[
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              badgeClass(st.tone),
                            ].join(" ")}
                          >
                            {st.label}
                          </span>

                          <span className="text-xs text-vendeo-muted">
                            {formatDateCompact(c.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/campaigns/${c.id}`}
                      className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
                    >
                      <span className="text-lg">→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* hint super discreto */}
          <div className="mt-3 text-[11px] text-vendeo-muted">
            Dica: suas campanhas recentes ficam aqui para você retomar rápido.
          </div>
        </>
      )}
    </div>
  );
}