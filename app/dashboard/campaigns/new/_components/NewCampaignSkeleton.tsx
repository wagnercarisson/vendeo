import { Sparkles, Image as ImageIcon } from "lucide-react";
import { MotionWrapper } from "@/app/dashboard/_components/MotionWrapper";

export function NewCampaignSkeleton() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-6 space-y-6">
      {/* Header Skeleton */}
      <MotionWrapper delay={0.1}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-5 w-96 animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>
      </MotionWrapper>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
        <div className="space-y-5">
          {/* Formulário Skeleton */}
          <MotionWrapper delay={0.2} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="space-y-1 mb-6">
              <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-slate-50 rounded-xl border border-slate-100">
               <div className="h-8 rounded-lg animate-pulse bg-white shadow-sm border border-black/5" />
               <div className="h-8 rounded-lg animate-pulse bg-slate-200/50" />
               <div className="h-8 rounded-lg animate-pulse bg-slate-200/50" />
            </div>

            <div className="space-y-4">
               <div>
                  <div className="h-4 w-20 mb-2 animate-pulse rounded bg-slate-100" />
                  <div className="h-11 w-full animate-pulse rounded-xl bg-slate-50 border border-slate-100" />
               </div>
               <div>
                  <div className="h-4 w-40 mb-2 animate-pulse rounded bg-slate-100" />
                  <div className="h-24 w-full animate-pulse rounded-xl bg-slate-50 border border-slate-100" />
               </div>
               <div>
                  <div className="h-4 w-20 mb-2 animate-pulse rounded bg-slate-100" />
                  <div className="h-11 w-full animate-pulse rounded-xl bg-slate-50 border border-slate-100" />
               </div>
               <div>
                  <div className="h-4 w-32 mb-2 animate-pulse rounded bg-slate-100" />
                  <div className="h-32 w-full animate-pulse rounded-xl bg-slate-50 border border-slate-100 border-dashed flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-slate-200" />
                  </div>
               </div>
            </div>
          </MotionWrapper>
        </div>

        {/* Preview Panel Skeleton */}
        <div>
          <MotionWrapper delay={0.3} className="sticky top-24 rounded-2xl border border-black/5 bg-white shadow-sm overflow-hidden">
             <div className="border-b border-black/5 bg-slate-50/50 px-5 py-4 flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-emerald-300" />
                </div>
                <div className="space-y-2 flex-1">
                   <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                   <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
                </div>
             </div>
             <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 mb-4 animate-pulse rounded-2xl bg-slate-50 flex items-center justify-center">
                     <ImageIcon className="h-6 w-6 text-slate-200" />
                </div>
                <div className="h-5 w-48 mb-2 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
             </div>
          </MotionWrapper>
        </div>
      </div>
    </main>
  );
}
