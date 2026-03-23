/**
 * Fonte de verdade dos valores estratégicos normalizados (Público, Objetivo, Posicionamento).
 */

export const AUDIENCE_OPTIONS = [
    { value: "geral", label: "Geral / Público amplo" },
    { value: "jovens_festa", label: "Jovens / Festa" },
    { value: "familia", label: "Família" },
    { value: "infantil", label: "Infantil" },
    { value: "maes_pais", label: "Mães e pais" },
    { value: "mulheres", label: "Mulheres" },
    { value: "homens", label: "Homens" },
    { value: "fitness", label: "Fitness / Saudável" },
    { value: "terceira_idade", label: "Terceira idade" },
    { value: "premium_exigente", label: "Premium / exigente" },
    { value: "economico", label: "Econômico / preço baixo" },
    { value: "b2b", label: "Profissionais / empresas (B2B)" },
] as const;

export const OBJECTIVE_OPTIONS = [
    { value: "promocao", label: "Promoção (preço/condição especial)" },
    { value: "novidade", label: "Novidade (lançamento/chegou hoje)" },
    { value: "queima", label: "Queima de estoque (últimas unidades)" },
    { value: "sazonal", label: "Sazonal / data comemorativa" },
    { value: "reposicao", label: "Reposição / volta ao estoque" },
    { value: "combo", label: "Combo / leve mais por menos" },
    { value: "engajamento", label: "Engajamento (perguntas/enquete)" },
    { value: "visitas", label: "Gerar visitas na loja" },
] as const;

export const PRODUCT_POSITIONING_OPTIONS = [
    { value: "popular", label: "Popular" },
    { value: "medio", label: "Médio" },
    { value: "premium", label: "Premium" },
    { value: "jovem", label: "Jovem / Festa" },
    { value: "familia", label: "Família" },
] as const;
