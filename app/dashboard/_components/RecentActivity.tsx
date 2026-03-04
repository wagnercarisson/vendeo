type Activity =
    | {
        type: "campaign_created";
        title: string;
        created_at: string;
        href?: string;
        badge?: string;
    }
    | {
        type: "ai_generated";
        title: string;
        created_at: string;
        href?: string;
        badge?: string;
    }
    | {
        type: "plan_generated";
        title: string;
        created_at: string;
        href?: string;
        badge?: string;
    };

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
    });
}

function getMeta(type: Activity["type"]) {
    switch (type) {
        case "campaign_created":
            return {
                badge: "Campanha",
                badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
                dotClass: "bg-slate-400",
                title: "Campanha criada",
            };
        case "ai_generated":
            return {
                badge: "IA",
                badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
                dotClass: "bg-emerald-500",
                title: "Conteúdo IA gerado",
            };
        case "plan_generated":
            return {
                badge: "Plano",
                badgeClass: "border-orange-200 bg-orange-50 text-orange-700",
                dotClass: "bg-orange-500",
                title: "Plano semanal gerado",
            };
    }
}

export function RecentActivity({
    items,
    limit = 5,
}: {
    items: Activity[];
    limit?: number;
}) {
    if (!items.length) return null;

    const shown = items.slice(0, limit);

    return (
        <div className="rounded-2xl border bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
                <div className="text-lg font-semibold text-vendeo-text">
                    📈 Atividade recente
                </div>

                <div className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-vendeo-text">
                    {shown.length} eventos
                </div>
            </div>

            <div className="mt-4">
                <div className="relative pl-6">
                    <div className="absolute left-[11px] top-1 bottom-1 w-px bg-slate-200" />

                    <div className="space-y-4">
                        {shown.map((a, i) => {
                            const meta = getMeta(a.type);

                            return (
                                <div key={i} className="relative">
                                    <div
                                        className={[
                                            "absolute left-[6px] top-2 h-3 w-3 rounded-full ring-4 ring-white",
                                            meta.dotClass,
                                        ].join(" ")}
                                    />

                                    <div className="rounded-xl border bg-white p-3 hover:bg-slate-50/60 transition">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={[
                                                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                                                    meta.badgeClass,
                                                ].join(" ")}
                                            >
                                                {meta.badge}
                                            </span>

                                            <div className="text-sm font-semibold text-vendeo-text">
                                                {meta.title}
                                            </div>

                                            <div className="text-xs text-vendeo-muted">
                                                • {formatDate(a.created_at)}
                                            </div>
                                        </div>

                                        {a.href ? (
                                            <a
                                                href={a.href}
                                                className="mt-1 block truncate text-sm text-vendeo-muted hover:text-vendeo-text hover:underline"
                                            >
                                                {a.title}
                                            </a>
                                        ) : (
                                            <div className="mt-1 truncate text-sm text-vendeo-muted">
                                                {a.title}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4 text-xs text-vendeo-muted">
                    Dica: quanto mais você cria e gera, mais ideias o Vendeo aprende sobre sua loja.
                </div>
            </div>
        </div>
    );
}