export default function DashboardLoading() {
    return (
        <div className="space-y-7">
            <div className="rounded-3xl bg-slate-50/60 p-3 md:p-4">
                <div className="space-y-7">
                    {/* HERO skeleton */}
                    <div className="rounded-2xl border bg-white p-8 shadow-soft">
                        <div className="flex items-center justify-between gap-6">
                            <div className="space-y-3">
                                <div className="h-7 w-72 rounded-lg bg-slate-100 animate-pulse" />
                                <div className="h-4 w-96 rounded-lg bg-slate-100 animate-pulse" />
                            </div>
                            <div className="hidden md:flex gap-2">
                                <div className="h-10 w-32 rounded-xl bg-slate-100 animate-pulse" />
                                <div className="h-10 w-28 rounded-xl bg-slate-100 animate-pulse" />
                            </div>
                        </div>
                        <div className="mt-6 h-2 w-full rounded-full bg-slate-100 animate-pulse" />
                    </div>

                    {/* METRICS skeleton */}
                    <div className="grid gap-4 md:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border bg-white p-5 shadow-soft"
                            >
                                <div className="h-4 w-40 rounded bg-slate-100 animate-pulse" />
                                <div className="mt-3 h-9 w-20 rounded bg-slate-100 animate-pulse" />
                                <div className="mt-3 h-3 w-44 rounded bg-slate-100 animate-pulse" />
                            </div>
                        ))}
                    </div>

                    {/* LISTS skeleton */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 rounded-2xl border bg-white p-5 shadow-soft">
                            <div className="flex items-center justify-between">
                                <div className="h-5 w-48 rounded bg-slate-100 animate-pulse" />
                                <div className="h-4 w-28 rounded bg-slate-100 animate-pulse" />
                            </div>
                            <div className="mt-4 space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="rounded-2xl border p-4">
                                        <div className="h-4 w-64 rounded bg-slate-100 animate-pulse" />
                                        <div className="mt-3 h-3 w-40 rounded bg-slate-100 animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-1 rounded-2xl border bg-white p-5 shadow-soft">
                            <div className="flex items-center justify-between">
                                <div className="h-5 w-40 rounded bg-slate-100 animate-pulse" />
                                <div className="h-4 w-28 rounded bg-slate-100 animate-pulse" />
                            </div>
                            <div className="mt-4 rounded-2xl border p-4">
                                <div className="h-4 w-44 rounded bg-slate-100 animate-pulse" />
                                <div className="mt-3 h-16 w-full rounded bg-slate-100 animate-pulse" />
                                <div className="mt-4 h-10 w-full rounded-xl bg-slate-100 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS skeleton */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border bg-white p-6 shadow-soft">
                                <div className="h-5 w-40 rounded bg-slate-100 animate-pulse" />
                                <div className="mt-3 h-4 w-72 rounded bg-slate-100 animate-pulse" />
                                <div className="mt-6 h-10 w-36 rounded-xl bg-slate-100 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}