import Link from "next/link";

type DashboardHeroProps = {
    greeting: string;
    storeName: string;
    city: string;
    state: string;
};

export function DashboardHero({
    greeting,
    storeName,
    city,
    state,
}: DashboardHeroProps) {
    return (
        <div className="rounded-2xl border bg-white p-8 shadow-soft">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                    <h1 className="text-3xl font-bold tracking-tight text-vendeo-text">
                        {greeting}, {storeName} <span className="align-middle">👋</span>
                    </h1>

                    <p className="mt-2 text-base text-vendeo-muted">
                        Sugestões para vender mais em{" "}
                        <span className="text-vendeo-text/80 font-medium">
                            {city}, {state}
                        </span>
                        .
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/campaigns/new"
                        className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
                    >
                        Nova campanha
                    </Link>

                    <Link
                        href="/dashboard/plans/new"
                        className="inline-flex items-center justify-center rounded-xl border border-vendeo-border bg-white px-4 py-2 text-sm font-semibold text-vendeo-text hover:bg-slate-50 transition"
                    >
                        Gerar plano
                    </Link>
                </div>
            </div>

            <div className="mt-6 h-2 w-full rounded-full bg-gradient-to-r from-emerald-500/25 via-orange-500/15 to-transparent" />
        </div>
    );
}