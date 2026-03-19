import { 
    AUDIENCE_OPTIONS, 
    OBJECTIVE_OPTIONS, 
    PRODUCT_POSITIONING_OPTIONS 
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