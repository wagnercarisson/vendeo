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

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/campaigns/new"
                        className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:-translate-y-[1px] transition-all active:scale-[0.98]"
                    >
                        Nova campanha
                    </Link>

                    <Link
                        href="/dashboard/plans?view=new"
                        className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-vendeo-text hover:bg-slate-50 transition-all"
                    >
                        Gerar plano
                    </Link>
                </div>
            </div>

            <div className="mt-8 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-500 to-orange-500 opacity-30" />
            </div>
        </div>
    );
}