/**
 * Formatadores unificados para status de Planos e Campanhas.
 * Segue as definições em docs/CAMPAIGN_FLOW_RULES.md e lib/domain/weekly-plans/types.ts
 */

export type StatusTone = "neutral" | "success" | "warning" | "error" | "info";

export interface StatusDisplay {
    label: string;
    tone: StatusTone;
}

/**
 * Formata o status de um Plano Semanal (weekly_plans)
 */
export function formatPlanStatus(status: string | null): StatusDisplay {
    const s = (status ?? "").toLowerCase();
    
    switch (s) {
        case "draft":
            return { label: "Rascunho", tone: "neutral" };
        case "approved":
            return { label: "Aprovado", tone: "success" };
        default:
            return { label: "Gerado", tone: "success" };
    }
}

/**
 * Formata o status de uma Campanha (campaigns)
 */
export function formatCampaignStatus(status: string | null): StatusDisplay {
    const s = (status ?? "").toLowerCase();
    
    switch (s) {
        case "draft":
            return { label: "Rascunho", tone: "neutral" };
        case "ready":
            return { label: "Gerada", tone: "success" };
        case "approved":
            return { label: "Aprovada", tone: "success" };
        case "active":
            return { label: "Ativa", tone: "success" };
        case "scheduled":
            return { label: "Agendada", tone: "warning" };
        case "published":
            return { label: "Publicada", tone: "success" };
        default:
            return { label: "Rascunho", tone: "neutral" };
    }
}

/**
 * Retorna as classes CSS baseadas no tom do status
 */
export function getStatusBadgeClass(tone: StatusTone): string {
    switch (tone) {
        case "success":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";
        case "warning":
            return "border-orange-200 bg-orange-50 text-orange-700";
        case "error":
            return "border-red-200 bg-red-50 text-red-700";
        case "info":
            return "border-blue-200 bg-blue-50 text-blue-700";
        default:
            return "border-slate-200 bg-slate-50 text-slate-700";
    }
}

/**
 * Retorna a classe de cor de destaque (bordas laterais, etc)
 */
export function getStatusAccentClass(tone: StatusTone): string {
    switch (tone) {
        case "success": return "bg-emerald-500";
        case "warning": return "bg-orange-500";
        case "error": return "bg-red-500";
        case "info": return "bg-blue-500";
        default: return "bg-slate-400";
    }
}
