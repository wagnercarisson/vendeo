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
    trend,
}: {
    label: string;
    value: string;
    sub: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-soft transition-all hover:shadow-md hover:-translate-y-[1px]">
            {/* Sparkline Background Placeholder */}
            <div className="absolute bottom-0 left-0 right-0 h-12 opacity-10 transition-opacity group-hover:opacity-20">
                <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <path
                        d="M0 35 Q 25 35, 50 20 T 100 15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-emerald-500"
                    />
                </svg>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-vendeo-muted">{label}</div>
                    {trend && (
                        <div
                            className={[
                                "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
                                trend.isPositive
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-red-50 text-red-600",
                            ].join(" ")}
                        >
                            {trend.isPositive ? "↑" : "↓"} {trend.value}%
                        </div>
                    )}
                </div>
                <div className="mt-2 text-3xl font-bold tracking-tight text-vendeo-text transition-all">
                    {value}
                </div>
                <div className="mt-2 text-xs text-vendeo-muted">{sub}</div>
            </div>
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
                trend={{ value: 12, isPositive: true }} // Mock trend
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
                trend={{ value: 5, isPositive: true }} // Mock trend
                sub="Legendas / textos gerados"
            />

            <MetricCard
                label="Vídeos Curtos (30 dias)"
                value={formatNumber(reels30)}
                trend={{ value: 8, isPositive: true }} // Mock trend
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