import { AUDIENCE_OPTIONS, OBJECTIVE_OPTIONS, PRODUCT_POSITIONING_OPTIONS } from "@/app/dashboard/campaigns/new/_components/constants";

type DeciderOptions = {
    selectedDays: number[];
    storeSegment: string | null;
    storePositioning: string | null;
    holidayMap: Record<number, string>; // { day_of_week: 'Nome Feriado' }
};

export type AlgorithmGeneratedItem = {
    day_of_week: number;
    content_type: "post" | "reels";
    theme: string;
    recommended_time: string;
    brief: {
        angle: string;
        hook_hint: string;
        cta_hint: string;
        audience: string;
        objective: string;
        product_positioning: string;
    };
};

export function generateDailyItems(
    options: DeciderOptions
): AlgorithmGeneratedItem[] {
    const { selectedDays, storeSegment, storePositioning, holidayMap } = options;

    // 1. Positioning
    const normalizedPos = storePositioning?.toLowerCase().trim() || "";
    let positioning = "medio";
    if (normalizedPos.includes("popular")) positioning = "popular";
    if (normalizedPos.includes("premium")) positioning = "premium";
    if (normalizedPos.includes("jovem") || normalizedPos.includes("festa")) positioning = "jovem";
    if (normalizedPos.includes("família") || normalizedPos.includes("familia")) positioning = "familia";

    // 2. Audience
    let audience = "geral";
    const normalizedSegment = storeSegment?.toLowerCase().trim() || "";
    
    // Regras simples baseadas no segmento
    if (normalizedSegment.includes("infantil") || normalizedSegment.includes("brinquedo")) audience = "infantil";
    else if (normalizedSegment.includes("mãe") || normalizedSegment.includes("mae") || normalizedSegment.includes("maternidade")) audience = "maes_pais";
    else if (normalizedSegment.includes("moda feminina") || normalizedSegment.includes("salao") || normalizedSegment.includes("salão")) audience = "mulheres";
    else if (normalizedSegment.includes("moda masculina") || normalizedSegment.includes("barbearia")) audience = "homens";
    else if (normalizedSegment.includes("fitness") || normalizedSegment.includes("academia") || normalizedSegment.includes("saude") || normalizedSegment.includes("saúde") || normalizedSegment.includes("natural")) audience = "fitness";
    else if (normalizedSegment.includes("b2b") || normalizedSegment.includes("atacado")) audience = "b2b";
    else if (positioning === "premium") audience = "premium_exigente";
    else if (positioning === "popular") audience = "economico";

    const getObjectiveLabel = (obj: string) => OBJECTIVE_OPTIONS.find(o => o.value === obj)?.label || obj;
    const getAudienceLabel = (aud: string) => AUDIENCE_OPTIONS.find(o => o.value === aud)?.label || aud;
    const getPositioningLabel = (pos: string) => PRODUCT_POSITIONING_OPTIONS.find(o => o.value === pos)?.label || pos;

    const daysToGenerate = selectedDays.length > 0 ? selectedDays : [1, 3, 5, 6];

    return daysToGenerate.map((day) => {
        // 3. Objective
        let objective = "engajamento"; // fallback útil
        
        // Se tem feriado no dia
        if (holidayMap[day]) {
            objective = "sazonal";
        } 
        // Sexta, sabado e domingo -> foco em vendas/visitas
        else if (day >= 5) {
            objective = Math.random() > 0.5 ? "promocao" : "visitas";
        } 
        // Segunda ou terca -> novidade ou reposicao
        else if (day <= 2) {
             objective = Math.random() > 0.5 ? "novidade" : "reposicao";
        }

        const objLabel = getObjectiveLabel(objective);
        const audLabel = getAudienceLabel(audience);
        const posLabel = getPositioningLabel(positioning);

        // O tema gerado não precisa mais do "textão", ele deve referenciar claramente as escolhas da campanha
        const theme = `Diretriz Prática:\nObjetivo: ${objLabel}\nPúblico: ${audLabel}\nTom: ${posLabel}`;

        // Mesclar posts e reels de forma simples
        const isReels = Math.random() > 0.6;
        const contentType = isReels ? "reels" : "post";
        
        const isEvening = Math.random() > 0.5;
        const recommendedTime = isEvening ? "18:00" : "12:00";

        return {
            day_of_week: day,
            content_type: contentType,
            theme,
            recommended_time: recommendedTime,
            brief: {
                angle: `Criar campanha com objetivo de ${objLabel} focado em ${audLabel}`,
                hook_hint: "Atenção inicial para o público-alvo",
                cta_hint: "Chamada para ação apropriada para o negócio",
                audience,
                objective,
                product_positioning: positioning,
            }
        };
    });
}
