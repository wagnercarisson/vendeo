import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const CATEGORY_OPTIONS = {
    bebidas_alcoolicas: {
        label: "Bebidas Alcoólicas",
        subcategories: ["adega", "loja-bebidas", "distribuidor", "emporio-cervejas", "outro"],
        subcategoryLabels: {
            adega: "Adega / Wine Bar",
            "loja-bebidas": "Loja de Bebidas",
            distribuidor: "Distribuidora / Atacado",
            "emporio-cervejas": "Empório de Cervejas / Craft",
            outro: "Outro",
        },
    },
    mercearia: {
        label: "Mercado / Mercearia",
        subcategories: ["mercadinho-bairro", "minimercado", "hortifruti", "emporio-gourmet", "sacolao", "outro"],
        subcategoryLabels: {
            "mercadinho-bairro": "Mercadinho de Bairro",
            minimercado: "Minimercado",
            hortifruti: "Hortifrúti / Frutaria",
            "emporio-gourmet": "Empório Gourmet",
            sacolao: "Sacolão",
            outro: "Outro",
        },
    },
} as const;

type SupportedCategory = keyof typeof CATEGORY_OPTIONS;

type StorePayload = {
    storeId?: string | null;
    name?: string | null;
    city?: string | null;
    state?: string | null;
    logo_url?: string | null;
    main_segment?: string | null;
    category?: string | null;
    subcategory?: string | null;
    subcategory_custom?: string | null;
    brand_positioning?: string | null;
    tone_of_voice?: string | null;
    address?: string | null;
    neighborhood?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    instagram?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
};

const KEYWORD_MAPPING: Record<SupportedCategory, Array<{
    suggest: string;
    keywords?: string[];
    exact?: string[];
}>> = {
    bebidas_alcoolicas: [
        { suggest: "adega", keywords: ["adega", "vinho", "vinhos", "wine"] },
        { suggest: "emporio-cervejas", keywords: ["cerveja", "cervejas", "craft", "artesanal"], exact: ["emporio", "emporio de cervejas"] },
        { suggest: "distribuidor", keywords: ["distribuidora", "distribuidor", "atacado"] },
        { suggest: "loja-bebidas", keywords: ["loja de bebida", "loja de bebidas"] },
    ],
    mercearia: [
        { suggest: "mercadinho-bairro", keywords: ["mercadinho", "bairro"] },
        { suggest: "hortifruti", keywords: ["hortifruti", "hortifruti", "fruta", "verdura", "frutaria"] },
        { suggest: "emporio-gourmet", keywords: ["gourmet", "especial", "premium"], exact: ["emporio"] },
        { suggest: "sacolao", keywords: ["sacolao"] },
        { suggest: "minimercado", keywords: ["minimercado", "mini mercado"] },
    ],
};

function normalizeText(value: string | null | undefined) {
    return (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

function toNullableString(value: unknown) {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function detectSubcategoryKeywords(category: SupportedCategory, customValue: string) {
    const normalizedInput = normalizeText(customValue);

    for (const mapping of KEYWORD_MAPPING[category]) {
        const exactMatch = mapping.exact?.some((keyword) => normalizedInput === normalizeText(keyword));
        const keywordMatch = mapping.keywords?.some((keyword) => normalizedInput.includes(normalizeText(keyword)));

        if (exactMatch || keywordMatch) {
            const suggestionLabel = CATEGORY_OPTIONS[category].subcategoryLabels[mapping.suggest as keyof typeof CATEGORY_OPTIONS[typeof category]["subcategoryLabels"]];

            return {
                detected: true,
                suggestion: mapping.suggest,
                message: `Detectamos que seu negócio se encaixa melhor em "${suggestionLabel}". Escolha essa opção para campanhas mais efetivas.`,
            };
        }
    }

    return { detected: false };
}

function validateCategory(category: string | null): category is SupportedCategory {
    return category === "bebidas_alcoolicas" || category === "mercearia";
}

function buildStorePayload(body: StorePayload) {
    return {
        name: toNullableString(body.name),
        city: toNullableString(body.city),
        state: toNullableString(body.state)?.toUpperCase() ?? null,
        logo_url: toNullableString(body.logo_url),
        main_segment: toNullableString(body.main_segment),
        category: toNullableString(body.category),
        subcategory: toNullableString(body.subcategory),
        subcategory_custom: toNullableString(body.subcategory_custom),
        brand_positioning: toNullableString(body.brand_positioning),
        tone_of_voice: toNullableString(body.tone_of_voice),
        address: toNullableString(body.address),
        neighborhood: toNullableString(body.neighborhood),
        phone: toNullableString(body.phone),
        whatsapp: toNullableString(body.whatsapp),
        instagram: toNullableString(body.instagram),
        primary_color: toNullableString(body.primary_color),
        secondary_color: toNullableString(body.secondary_color),
    };
}

function validatePayload(payload: ReturnType<typeof buildStorePayload>) {
    if (!payload.name || payload.name.length < 2) {
        return { status: 400, body: { error: "Informe o nome da loja com pelo menos 2 caracteres." } };
    }

    if (!payload.category || !validateCategory(payload.category)) {
        return { status: 400, body: { error: "Selecione uma categoria válida para a loja." } };
    }

    const allowedSubcategories = CATEGORY_OPTIONS[payload.category].subcategories as readonly string[];

    if (!payload.subcategory || !allowedSubcategories.includes(payload.subcategory)) {
        return { status: 400, body: { error: "Escolha um tipo de loja válido para a categoria selecionada." } };
    }

    if (payload.subcategory === "outro" && !payload.subcategory_custom) {
        return {
            status: 400,
            body: { error: 'Campo "especifique o tipo" é obrigatório quando seleciona "Outro".' },
        };
    }

    if (payload.subcategory !== "outro") {
        payload.subcategory_custom = null;
    }

    if (payload.subcategory === "outro" && payload.subcategory_custom) {
        const keywordCheck = detectSubcategoryKeywords(payload.category, payload.subcategory_custom);
        if (keywordCheck.detected) {
            return {
                status: 400,
                body: {
                    error: "Opção existente detectada",
                    message: keywordCheck.message,
                    suggestion: keywordCheck.suggestion,
                },
            };
        }
    }

    return null;
}

async function handleStoreSave(request: Request, mode: "create" | "update") {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
        return NextResponse.json({ error: "Você precisa estar logado para salvar a loja." }, { status: 401 });
    }

    const body = (await request.json()) as StorePayload;
    const storePayload = buildStorePayload(body);
    const validation = validatePayload(storePayload);

    if (validation) {
        return NextResponse.json(validation.body, { status: validation.status });
    }

    let error;

    if (mode === "update") {
        const storeId = toNullableString(body.storeId);
        if (!storeId) {
            return NextResponse.json({ error: "Store ID is required for updates." }, { status: 400 });
        }

        const { error: updateError } = await supabase
            .from("stores")
            .update({ ...storePayload, owner_user_id: authData.user.id })
            .eq("id", storeId)
            .eq("owner_user_id", authData.user.id);

        error = updateError;
    } else {
        const { error: insertError } = await supabase
            .from("stores")
            .insert({ ...storePayload, owner_user_id: authData.user.id });

        error = insertError;
    }

    if (error) {
        return NextResponse.json({ error: error.message || "Erro ao salvar a loja." }, { status: 400 });
    }

    revalidatePath("/dashboard", "layout");
    return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
    return handleStoreSave(request, "create");
}

export async function PUT(request: Request) {
    return handleStoreSave(request, "update");
}