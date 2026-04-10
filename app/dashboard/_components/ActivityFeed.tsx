import React from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Campaign } from "@/lib/domain/campaigns/types";
import { WeeklyPlan } from "@/lib/domain/weekly-plans/types";

type Activity = {
    id: string;
    type: "campaign" | "plan" | "system" | "ai";
    message: string;
    timeStr: string;
    date: Date;
    icon: string;
};

// Helper for relative time (e.g. "Há 2 horas")
function getRelativeTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();

    // Convert to units
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return diffDays === 1 ? "Ontem" : `Há ${diffDays} dias`;
    if (diffHours > 0) return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffMins > 0) return `Há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    return "Agora";
}

export async function ActivityFeed({ storeId }: { storeId: string }) {
    const supabase = await createSupabaseServerClient();

    // Fetch last 5 campaigns
    const { data: recentCampaigns } = await supabase
        .from("campaigns")
        .select("id, product_name, created_at")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(5);

    // Fetch last 5 AI generations (campaigns where ai_generated_at or reels_generated_at is not null)
    const { data: recentAI } = await supabase
        .from("campaigns")
        .select("id, product_name, ai_generated_at, reels_generated_at")
        .eq("store_id", storeId)
        .or("ai_generated_at.not.is.null,reels_generated_at.not.is.null")
        // We can't order by a computed max date easily in Supabase without a view, 
        // so we just grab the newest by created_at which usually correlates, or we can fetch broader.
        // For simplicity, let's just use ai_generated_at if present.
        .order("ai_generated_at", { ascending: false, nullsFirst: false })
        .limit(5);

    // Fetch last 3 plans
    const { data: recentPlans } = await supabase
        .from("weekly_plans")
        .select("id, week_start, created_at")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(3);

    const activities: Activity[] = [];

    if (recentCampaigns) {
        recentCampaigns.forEach((c) => {
            activities.push({
                id: `camp_${c.id}`,
                type: "campaign",
                message: `Nova campanha criada: ${c.product_name ?? "Sem nome"}`,
                date: new Date(c.created_at),
                timeStr: getRelativeTime(c.created_at),
                icon: "🚀"
            });
        });
    }

    if (recentAI) {
        recentAI.forEach((c) => {
            const aiDate = (c as any).ai_generated_at || (c as any).reels_generated_at;
            if (aiDate) {
                activities.push({
                    id: `ai_${c.id}`,
                    type: "ai",
                    message: `Conteúdo IA gerado para ${c.product_name ?? "campanha"}`,
                    date: new Date(aiDate),
                    timeStr: getRelativeTime(aiDate),
                    icon: "✨"
                });
            }
        });
    }

    if (recentPlans) {
        recentPlans.forEach((p) => {
            // week_start is YYYY-MM-DD
            const [y, m, d] = (p as any).week_start.split("-");
            const dateStr = `${d}/${m}`;
            activities.push({
                id: `plan_${p.id}`,
                type: "plan",
                message: `Plano semanal gerado para a semana de ${dateStr}`,
                date: new Date(p.created_at),
                timeStr: getRelativeTime(p.created_at),
                icon: "📅"
            });
        });
    }

    // Sort by Date descending and take top 5
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    const topActivities = activities.slice(0, 5);

    return (
        <div className="rounded-2xl border bg-white p-5 shadow-soft">
            <h3 className="text-lg font-semibold text-vendeo-text">Atividade Recente</h3>

            {topActivities.length === 0 ? (
                <div className="mt-6 text-center text-sm text-vendeo-muted pb-4">
                    Nenhuma atividade recente. Comece criando sua primeira campanha!
                </div>
            ) : (
                <>
                    <div className="mt-4 space-y-4">
                        {topActivities.map((activity) => (
                            <div key={activity.id} className="flex gap-4 items-start">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-sm">
                                    {activity.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-vendeo-text leading-tight">{activity.message}</p>
                                    <p className="mt-1 text-xs text-vendeo-muted">{activity.timeStr}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
