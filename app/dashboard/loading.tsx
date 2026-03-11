export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl p-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="h-10 w-64 rounded-lg bg-slate-200" />
          <div className="mt-3 flex gap-2">
            <div className="h-6 w-24 rounded-full bg-slate-200" />
            <div className="h-6 w-32 rounded-full bg-slate-200" />
          </div>
          <div className="mt-3 h-5 w-48 rounded-md bg-slate-200" />
        </div>

        <div className="flex shrink-0 items-center justify-start gap-4 md:justify-end">
          <div className="h-12 w-32 rounded-xl bg-slate-200" />
          <div className="h-12 w-48 rounded-xl bg-slate-200" />
        </div>
      </div>

      {/* Metrics Skeleton */}
      <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 rounded-md bg-slate-200" />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <div className="h-8 w-16 rounded-md bg-slate-200" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-5 w-16 rounded-full bg-slate-200" />
              <div className="h-4 w-32 rounded-md bg-slate-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Layout Skeleton */}
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Campanhas Recentes e Calendário */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="h-[300px] w-full rounded-2xl bg-slate-200" />
          <div className="h-[150px] w-full rounded-2xl bg-slate-200" />
          <div className="h-[400px] w-full rounded-2xl bg-slate-200" />
        </div>

        {/* Lateral Direita */}
        <div className="space-y-6">
          <div className="h-[200px] w-full rounded-2xl bg-slate-200" />
          <div className="h-[500px] w-full rounded-2xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}