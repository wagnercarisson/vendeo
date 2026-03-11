import React from "react";

export function ContentCalendarSkeleton() {
    return (
        <div className="rounded-2xl border bg-white p-5 shadow-soft overflow-hidden animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-6 w-48 rounded bg-slate-200" />
                <div className="h-5 w-24 rounded-full bg-slate-200" />
            </div>
            
            <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex min-w-[80px] flex-1 flex-col items-center rounded-xl p-3 border border-slate-100 bg-white">
                        <div className="h-3 w-8 rounded bg-slate-200" />
                        <div className="mt-1 h-4 w-10 rounded bg-slate-200" />
                        <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AISuggestionCardSkeleton() {
    return (
        <div className="rounded-2xl border bg-emerald-50 p-6 shadow-premium animate-pulse">
            <div className="h-5 w-32 rounded-full bg-emerald-200/50" />
            <div className="mt-4 h-7 w-48 rounded bg-emerald-200/50" />
            <div className="mt-2 space-y-2">
                <div className="h-4 w-full rounded bg-emerald-200/50" />
                <div className="h-4 w-5/6 rounded bg-emerald-200/50" />
            </div>
            <div className="mt-6 h-10 w-36 rounded-xl bg-emerald-200/50" />
        </div>
    );
}

export function ActivityFeedSkeleton() {
    return (
        <div className="rounded-2xl border bg-white p-6 shadow-soft animate-pulse">
            <div className="h-6 w-40 rounded bg-slate-200" />
            <div className="mt-6 relative before:absolute before:inset-y-0 before:left-[17px] before:w-0.5 before:bg-slate-100 space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="relative z-10 flex gap-4 pl-1">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 border-2 border-white" />
                        <div className="flex flex-col gap-2 w-full pt-1">
                            <div className="h-4 w-1/3 rounded bg-slate-200" />
                            <div className="h-3 w-2/3 rounded bg-slate-200" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
