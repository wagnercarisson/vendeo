export function formatAudience(value?: string | null) {
    if (!value) return "";

    const map: Record<string, string> = {
        jovens_festa: "Jovens / Festa",
        familias: "Famílias",
        casal: "Casais",
        geral: "Público geral",
    };

    return map[value] || humanize(value);
}

export function formatObjective(value?: string | null) {
    if (!value) return "";

    const map: Record<string, string> = {
        novidade: "Novidade (lançamento/chegou hoje)",
        promocao: "Promoção",
        giro: "Giro de estoque",
        oportunidade: "Oportunidade",
    };

    return map[value] || humanize(value);
}

export function formatPositioning(value?: string | null) {
    if (!value) return "";

    const map: Record<string, string> = {
        jovem: "Jovem / Festa",
        premium: "Premium",
        economico: "Econômico",
    };

    return map[value] || humanize(value);
}

function humanize(value: string) {
    if (!value) return "";

    return value
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => {
            if (!word) return "";
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
}