type MetricsRowProps = {
    campaignsWeek: number;
    campaigns30: number;
    ai30: number;
    reels30: number;
    hasPlan: boolean;
};

function formatNumber(n: number) {
    return new Intl.NumberFormat("pt-BR").format(n);
}

function MetricCard({
    label,
    value,
    sub,
}: {
    label: string;
    value: string;
    sub: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border bg-white p-5 shadow-soft transition-all hover:shadow-md hover:-translate-y-[1px]">
            <div className="text-sm font-medium text-vendeo-muted">{label}</div>
            <div className="mt-2 text-3xl font-bold tracking-tight text-vendeo-text transition-all">
                {value}
            </div>
            <div className="mt-2 text-xs text-vendeo-muted">{sub}</div>
        </div>
    );
}

export function MetricsRow({
    campaignsWeek,
    campaigns30,
    ai30,
    reels30,
    hasPlan,
}: MetricsRowProps) {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
                label="Campanhas (semana)"
                value={formatNumber(campaignsWeek)}
                sub={
                    <>
                        Últimos 30 dias:{" "}
                        <span className="font-semibold text-vendeo-text">
                            {formatNumber(campaigns30)}
                        </span>
                    </>
                }
            />

            <MetricCard
                label="Conteúdo IA (30 dias)"
                value={formatNumber(ai30)}
                sub="Legendas / textos gerados"
            />

            <MetricCard
                label="Reels (30 dias)"
                value={formatNumber(reels30)}
                sub="Ideias/roteiros criados"
            />

            <MetricCard
                label="Plano atual"
                value={hasPlan ? "Ativo" : "—"}
                sub={hasPlan ? "Plano semanal pronto para uso" : "Nenhum plano gerado"}
            />
        </div>
    );
}