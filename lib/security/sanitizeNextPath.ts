export function sanitizeNextPath(
    value?: string | null,
    fallback: string = "/dashboard"
) {
    if (!value) return fallback;

    let next = value.trim();

    try {
        next = decodeURIComponent(next);
    } catch {
        return fallback;
    }

    if (!next) return fallback;

    // precisa ser path interno
    if (!next.startsWith("/")) return fallback;

    // bloqueia protocol-relative //evil.com
    if (next.startsWith("//")) return fallback;

    // bloqueia backslashes e caracteres estranhos
    if (next.includes("\\") || next.includes("\0") || /[\r\n]/.test(next)) {
        return fallback;
    }

    // bloqueia esquemas tipo javascript:, http:, https:
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(next)) {
        return fallback;
    }

    return next;
}