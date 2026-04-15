import { 
    AUDIENCE_OPTIONS, 
    OBJECTIVE_OPTIONS, 
    PRODUCT_POSITIONING_OPTIONS,
    CampaignObjective,
} from "@/lib/constants/strategy";

export function formatAudience(value?: string | null) {
    if (!value) return "";
    const option = AUDIENCE_OPTIONS.find((opt) => opt.value === value);
    return option ? option.label : humanize(value);
}

export function formatObjective(value?: string | null) {
    if (!value) return "";
    const option = OBJECTIVE_OPTIONS.find((opt) => opt.value === value);
    return option ? option.label : humanize(value);
}

export function formatPositioning(value?: string | null) {
    if (!value) return "";
    const option = PRODUCT_POSITIONING_OPTIONS.find((opt) => opt.value === value);
    return option ? option.label : humanize(value);
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

/**
 * Normaliza um valor de estratégia buscando por valor exato ou label aproximada.
 * Utilizado para garantir que parâmetros de URL e herança de plano usem os IDs técnicos (value)
 * mesmo quando o dado de origem vem formatado ou sugerido pela IA como texto.
 */
export function normalizeStrategyValue(
    input: string | null | undefined,
    options: readonly { value: string; label: string }[]
): string {
    if (!input) return "";
    
    const normalizedInput = input.trim().toLowerCase();

    const found = options.find((opt) => {
        const val = opt.value.toLowerCase();
        const lab = opt.label.toLowerCase();
        
        return (
            val === normalizedInput ||
            lab === normalizedInput ||
            lab.startsWith(normalizedInput) ||
            normalizedInput.startsWith(lab.split(" (")[0].toLowerCase())
        );
    });

    return found?.value || input;
}

export function normalizeAudience(input?: string | null) {
    return normalizeStrategyValue(input, AUDIENCE_OPTIONS);
}

export function normalizeObjective(input?: string | null) {
    if (!input) return "";

    const normalizedInput = input.trim().toLowerCase();

    const aliases: Record<string, CampaignObjective> = {
        promo: "promocao",
        "promoção": "promocao",
        promocao: "promocao",
        promocoes: "promocao",
        "promoções": "promocao",
        lancamento: "novidade",
        "lançamento": "novidade",
        novidade: "novidade",
        "chegou hoje": "novidade",
        queima: "queima",
        sazonal: "sazonal",
        reposicao: "reposicao",
        reposição: "reposicao",
        combo: "combo",
        engajamento: "engajamento",
        visitas: "visitas",
        trafego: "visitas",
        "tráfego": "visitas",
        informativo: "informativo",
        informacao: "informativo",
        informação: "informativo",
        institucional: "institucional",
        reconhecimento: "institucional",
        autoridade: "autoridade",
        consideracao: "autoridade",
        consideração: "autoridade",
    };

    if (aliases[normalizedInput]) {
        return aliases[normalizedInput];
    }

    const normalized = normalizeStrategyValue(input, OBJECTIVE_OPTIONS);
    return OBJECTIVE_OPTIONS.some((opt) => opt.value === normalized)
        ? (normalized as CampaignObjective)
        : "";
}

export function normalizePositioning(input?: string | null) {
    return normalizeStrategyValue(input, PRODUCT_POSITIONING_OPTIONS);
}