type MetricsRowProps = {
    campaignsWeek: number;
    campaignsPrevWeek: number;
    campaigns30: number;
    campaignsPrev30: number;
    ai30: number;
    aiPrev30: number;
    reels30: number;
    reelsPrev30: number;
    hasPlan: boolean;
};

function formatNumber(n: number) {
    return new Intl.NumberFormat("pt-BR").format(n);
}

function calculateTrend(current: number, previous: number) {
    if (current === 0 && previous === 0) return null;
    
    // Se era 0 e agora tem algo, consideramos 100% de crescimento (ou apenas positivo)
    if (previous === 0) {
        return { value: 100, isPositive: true };
    }

    const diff = current - previous;
    const percentage = Math.round((diff / previous) * 100);

    return {
        value: Math.abs(percentage),
        isPositive: percentage >= 0,
    };
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
    } | null;
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
                        className={trend?.isPositive === false ? "text-red-500" : "text-emerald-500"}
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
    campaignsPrevWeek,
    campaigns30,
    campaignsPrev30,
    ai30,
    aiPrev30,
    reels30,
    reelsPrev30,
    hasPlan,
}: MetricsRowProps) {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
                label="Campanhas (semana)"
                value={formatNumber(campaignsWeek)}
                trend={calculateTrend(campaignsWeek, campaignsPrevWeek)}
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
                label="Artes (30 dias)"
                value={formatNumber(ai30)}
                trend={calculateTrend(ai30, aiPrev30)}
                sub="Legendas/Copies criadas"
            />

            <MetricCard
                label="Vídeos Curtos (30 dias)"
                value={formatNumber(reels30)}
                trend={calculateTrend(reels30, reelsPrev30)}
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