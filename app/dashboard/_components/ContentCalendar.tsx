import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WeeklyPlanItemBrief } from "@/lib/domain/weekly-plans/types";
import Link from "next/link";
import { Plus, Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSnow, Sun, CloudFog } from "lucide-react";
import { formatObjective } from "@/lib/formatters/strategyLabels";
import { formatCampaignStatus, getStatusBadgeClass } from "@/lib/formatters/statusLabels";

type Day = {
    label: string;
    date: string;
    fullDate: string;
    status: "done" | "upcoming" | "today";
    campaignFormat?: string;
    campaignObjective?: string;
    badgeColor?: string;
    textColor?: string;
    textHoverColor?: string;
    titleTooltip?: string;
    ctaLink?: string;
    holidayName?: string;
};

type Holiday = {
    date: string;
    name: string;
    type: string;
};

type PlanItemWithCampaign = {
    id: string;
    day_of_week: number;
    content_type: string;
    theme: string | null;
    brief: WeeklyPlanItemBrief | null | any;
    campaign_id: string | null;
    campaigns: Array<{
        id: string;
        status: string;
        objective: string | null;
        product_name: string | null;
    }> | {
        id: string;
        status: string;
        objective: string | null;
        product_name: string | null;
    } | null;
};

// Utils string date YYYY-MM-DD for Monday
function getWeekStartMondayISO(today = new Date()) {
    // Treat "today" in local timezone or UTC to avoid shifting? 
    // Usually local timezone is better for front-end, let's just use local JS Date
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const jsDay = d.getDay(); // 0 is Sunday
    const diffToMonday = (jsDay + 6) % 7;
    d.setDate(d.getDate() - diffToMonday);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export async function ContentCalendar({ storeId }: { storeId: string }) {
    const supabase = await createSupabaseServerClient();
    const currentWeekStart = getWeekStartMondayISO();

    // Fetch active plan for this week
    const { data: plan } = await supabase
        .from("weekly_plans")
        .select("id")
        .eq("store_id", storeId)
        .eq("week_start", currentWeekStart)
        .maybeSingle();

    let planItems: any[] = [];
    let campaignMap: Record<string, any> = {};

    if (plan) {
        // 1. Buscar itens do plano (sem join para evitar erros silenciosos)
        const { data: items, error: itemsErr } = await supabase
            .from("weekly_plan_items")
            .select("*")
            .eq("plan_id", plan.id);

        if (itemsErr) {
            console.error("Erro ao buscar itens do plano:", itemsErr);
        } else if (items) {
            planItems = items;

            // 2. Buscar campanhas vinculadas, se houver
            const campaignIds = items
                .map((it) => it.campaign_id)
                .filter(Boolean) as string[];

            if (campaignIds.length > 0) {
                const { data: campaigns } = await supabase
                    .from("campaigns")
                    .select("id, status, objective, product_name")
                    .in("id", campaignIds);

                if (campaigns) {
                    campaignMap = Object.fromEntries(
                        campaigns.map((c) => [c.id, c])
                    );
                }
            }
        }
    }

    // Fetch store info for weather
    const { data: store } = await supabase
        .from("stores")
        .select("city, state")
        .eq("id", storeId)
        .maybeSingle();

    let weatherData = null;
    if (store?.city) {
        try {
            const query = encodeURIComponent(`${store.city},${store.state || ""}`);
            const res = await fetch(`https://api.hgbrasil.com/weather?format=json-cors&key=1306bd70&city_name=${query}`, {
                next: { revalidate: 3600 } // cache de 1 hora
            });
            if (res.ok) {
                weatherData = await res.json();
            }
        } catch (e) {
            console.error("Erro ao buscar clima", e);
        }
    }
    const weather = weatherData?.results;

    // Fetch BrasilAPI Holidays for the current year
    const now = new Date();
    let holidays: Holiday[] = [];
    try {
        const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${now.getFullYear()}`, {
            next: { revalidate: 86400 } // cache de 24 horas
        });
        if (res.ok) {
            holidays = await res.json();
        }
    } catch (e) {
        console.error("Erro ao buscar feriados", e);
    }

    const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const ymd = currentWeekStart.split("-").map(Number);
    const monday = new Date(ymd[0], ymd[1] - 1, ymd[2]);

    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const days: Day[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);

        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        let status: "done" | "upcoming" | "today" = "upcoming";
        if (dStr === todayStr) status = "today";
        else if (d.getTime() < new Date(todayStr).getTime()) status = "done";

        // Find if there is an item for this day (day_of_week: 1 = Monday ... 7 = Sunday)
        const matchingItem = planItems.find((it) => it.day_of_week === (i + 1));

        // Find if this day constitutes a holiday
        const matchingHoliday = holidays.find((h) => h.date === dStr);
        const holidayName = matchingHoliday ? matchingHoliday.name : undefined;

        // Find forecast for this day (format DD/MM)
        const dayDateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        const dayForecast = weather?.forecast?.find((f: { date: string }) => f.date === dayDateStr);

        let campaignFormat = undefined;
        let campaignObjective = undefined;
        let badgeColor = "bg-slate-100";
        let textColor = "text-vendeo-text";
        let textHoverColor = "group-hover/link:text-emerald-600";
        let titleTooltip = undefined;
        let ctaLink = undefined;

        if (matchingItem) {
            campaignFormat = matchingItem.content_type === 'reels' ? "Vídeo Curto" : "Post";

            let objRaw = "Estratégia sugerida";
            const linkedCampaign = matchingItem.campaign_id ? campaignMap[matchingItem.campaign_id] : null;

            if (linkedCampaign) {
                objRaw = linkedCampaign.objective || matchingItem.brief?.objective || matchingItem.theme || "Estratégia sugerida";
            } else {
                objRaw = matchingItem.brief?.objective || matchingItem.theme || "Estratégia sugerida";
            }
            // Use formatObjective to get the pretty label from constants
            const prettyObj = formatObjective(objRaw);
            campaignObjective = prettyObj.length > 25 ? prettyObj.substring(0, 22) + "..." : prettyObj;

            let cStatus = "draft";
            let cId = matchingItem.campaign_id;
            if (linkedCampaign) {
                cStatus = linkedCampaign.status || "draft";
            }

            if (!matchingItem.campaign_id) {
                badgeColor = "bg-yellow-400";
                textColor = "text-yellow-600";
                textHoverColor = "group-hover/link:text-yellow-700";
                titleTooltip = "Em rascunho. Falta finalizar.";

                const qTheme = encodeURIComponent(matchingItem.theme || "");
                const qAudience = encodeURIComponent(matchingItem.brief?.audience || "");
                const qObjective = encodeURIComponent(matchingItem.brief?.objective || "");
                const qPositioning = encodeURIComponent(matchingItem.brief?.product_positioning || "");
                const qContentType = encodeURIComponent(matchingItem.content_type || "post");

                ctaLink = `/dashboard/campaigns/new?plan_item_id=${matchingItem.id}&theme=${qTheme}&audience=${qAudience}&objective=${qObjective}&positioning=${qPositioning}&content_type=${qContentType}`;
            } else {
                const statusInfo = formatCampaignStatus(cStatus);
                badgeColor = getStatusBadgeClass(statusInfo.tone).split(" ")[1]; // bg-X-Y
                textColor = getStatusBadgeClass(statusInfo.tone).split(" ")[2]; // text-X-Y

                // Specific coloring for special days in active status
                if (cStatus === "active" || cStatus === "ready" || cStatus === "approved") {
                    if (dStr === todayStr) {
                        badgeColor = "bg-red-500";
                        textColor = "text-red-500";
                        textHoverColor = "group-hover/link:text-red-600";
                        titleTooltip = "Pronta. A postagem é hoje!";
                    } else if (d.getTime() < new Date(todayStr).getTime()) {
                        badgeColor = "bg-emerald-500";
                        textColor = "text-emerald-600";
                        textHoverColor = "group-hover/link:text-emerald-700";
                        titleTooltip = "Pronta. Data de postagem atingida.";
                    } else {
                        badgeColor = "bg-orange-400";
                        textColor = "text-orange-600";
                        textHoverColor = "group-hover/link:text-orange-700";
                        titleTooltip = "Pronta. Aguardando a data de postagem.";
                    }
                } else {
                    // Fallback para campanhas em rascunho (com ID)
                    titleTooltip = "Em rascunho. Falta finalizar.";
                }
                ctaLink = `/dashboard/campaigns/${matchingItem.campaign_id}`;
            }
        }

        days.push({
            label: labels[i],
            date: dayDateStr,
            fullDate: dStr,
            status,
            campaignFormat,
            campaignObjective,
            badgeColor,
            textColor,
            textHoverColor,
            titleTooltip,
            ctaLink,
            holidayName,
        });
    }

    const renderWeatherIcon = (slug?: string) => {
        if (!slug) return <Cloud className="h-4 w-4" />;
        switch (slug) {
            case "storm": return <CloudLightning className="h-4 w-4 text-emerald-600" />;
            case "snow":
            case "hail": return <CloudSnow className="h-4 w-4 text-emerald-600" />;
            case "rain": return <CloudRain className="h-4 w-4 text-emerald-600" />;
            case "fog": return <CloudFog className="h-4 w-4 text-emerald-600" />;
            case "clear_day": return <Sun className="h-4 w-4 text-yellow-500" />;
            case "clear_night": return <Cloud className="h-4 w-4 text-emerald-600" />;
            case "cloud":
            case "cloudly_day":
            case "cloudly_night": return <CloudDrizzle className="h-4 w-4 text-emerald-600" />;
            default: return <Cloud className="h-4 w-4 text-emerald-600" />;
        }
    };

    return (
        <div className="rounded-2xl border bg-white p-5 shadow-soft overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-vendeo-text">Calendário da Semana</h3>
                    {weather && (
                        <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600" title={weather.description}>
                            {renderWeatherIcon(weather.condition_slug)}
                            <span>{weather.temp}°C</span>
                        </div>
                    )}
                </div>
                {plan ? (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">Plano Ativo</span>
                ) : (
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-wider">Sem Plano</span>
                )}
            </div>

            <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {days.map((day, idx) => (
                    <div
                        key={idx}
                        className={[
                            "group flex min-w-[100px] flex-1 flex-col items-center rounded-xl p-3 border transition-all hover:shadow-soft relative",
                            day.status === "today" ? "bg-emerald-50 border-emerald-200" : "bg-white",
                            day.status === "done" ? "opacity-70" : ""
                        ].join(" ")}
                    >
                        {day.status !== "done" && (
                            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/dashboard/campaigns/new?date=${day.fullDate}`} className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700 transition-colors" title="Agendar sem vincular ao plano">
                                    <Plus className="h-3 w-3" />
                                </Link>
                            </div>
                        )}
                        <span className="text-[10px] font-bold uppercase text-vendeo-muted">{day.label}</span>
                        <div className="mt-1 flex flex-col items-center">
                            <span className="text-sm font-bold text-vendeo-text">{day.date}</span>
                            {day.holidayName && (
                                <span className="text-[8px] font-semibold text-red-500 uppercase mt-0.5" title={day.holidayName}>
                                    Feriado
                                </span>
                            )}
                        </div>

                        <div className={`mt-3 h-1.5 w-full rounded-full transition-colors ${day.badgeColor}`} title={day.titleTooltip} />

                        {day.campaignFormat && (
                            <div className="mt-2 text-center" title={day.titleTooltip}>
                                {day.ctaLink && day.titleTooltip?.includes("rascunho") ? (
                                    <Link href={day.ctaLink} className="group/link block">
                                        <div className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${day.textColor} ${day.textHoverColor}`}>
                                            {day.campaignFormat}
                                        </div>
                                        <div className={`mt-0.5 text-[10px] font-medium leading-tight transition-colors opacity-80 ${day.textColor} ${day.textHoverColor} group-hover/link:underline`}>
                                            {day.campaignObjective}
                                        </div>
                                    </Link>
                                ) : (
                                    <>
                                        {day.ctaLink ? (
                                            <Link href={day.ctaLink} className="group/link block">
                                                <div className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${day.textColor} ${day.textHoverColor}`}>
                                                    {day.campaignFormat}
                                                </div>
                                                <div className={`mt-0.5 text-[10px] font-medium leading-tight transition-colors opacity-80 ${day.textColor} ${day.textHoverColor} group-hover/link:underline`}>
                                                    {day.campaignObjective}
                                                </div>
                                            </Link>
                                        ) : (
                                            <div>
                                                <div className={`text-[9px] font-bold uppercase tracking-wider ${day.textColor}`}>
                                                    {day.campaignFormat}
                                                </div>
                                                <div className={`mt-0.5 text-[10px] font-medium leading-tight opacity-80 ${day.textColor}`}>
                                                    {day.campaignObjective}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {day.status === "today" && (
                            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
