"use client";

function badgeTone(score: number) {
  if (score < 40) return "border-amber-200 bg-amber-50 text-amber-700";
  if (score < 70) return "border-slate-200 bg-slate-50 text-slate-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function ProgressIndicator({
  score,
  filledFields,
  totalFields,
  badge,
}: {
  score: number;
  filledFields: number;
  totalFields: number;
  badge: string;
}) {
  return (
    <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 text-sm font-medium text-zinc-600">
            <span>{filledFields}/{totalFields} campos preenchidos</span>
            <span>Score: {score}/100</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-orange-400 transition-all duration-300"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex rounded-full border px-3 py-2 text-sm font-semibold ${badgeTone(score)}`}>
            {badge}
          </span>
        </div>
      </div>
    </div>
  );
}