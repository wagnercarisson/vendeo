import { Sparkles, CalendarRange, MousePointerClick } from "lucide-react";
import { MotionWrapper } from "@/app/dashboard/_components/MotionWrapper";

export function PlansSkeleton() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-6 space-y-8">
      {/* Header Skeleton */}
      <MotionWrapper delay={0.1}>
        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-96 animate-pulse rounded bg-slate-100" />
        </div>
      </MotionWrapper>

      {/* Week Selection Skeleton */}
      <MotionWrapper delay={0.2} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-black/5">
           <div>
              <div className="h-5 w-40 mb-2 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
           </div>
           <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-50 border border-slate-100" />
        </div>

        <div className="space-y-4">
           <div className="h-5 w-48 mb-4 animate-pulse rounded bg-slate-200" />
           <div className="flex gap-3">
              {[1,2,3,4,5,6,7].map((i) => (
                  <div key={i} className="h-24 flex-1 rounded-xl animate-pulse bg-slate-50 border border-slate-100" />
              ))}
           </div>
           <div className="pt-4 flex justify-end">
              <div className="h-11 w-40 rounded-xl animate-pulse bg-emerald-100" />
           </div>
        </div>
      </MotionWrapper>
    </main>
  );
}
