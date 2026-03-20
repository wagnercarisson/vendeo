"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { NewCampaignHeader } from "./NewCampaignHeader";
import { ProductFormCard } from "./ProductFormCard";
import { StrategyFormCard } from "./StrategyFormCard";
import { GenerateCampaignCard } from "./GenerateCampaignCard";
import { CampaignPreviewPanel } from "./CampaignPreviewPanel";
import { MotionWrapper } from "@/app/dashboard/_components/MotionWrapper";
import type {
    CampaignGenerationState,
    CampaignPreviewData,
    CampaignFormData,
    StrategyData,
} from "./types";
import { parseBRLToNumber } from "@/lib/formatters/priceMask";


const INITIAL_CAMPAIGN: CampaignFormData = {
    type: "product",
    product_name: "",
    description: "",
    price: "",
    image_url: "",
};

const INITIAL_STRATEGY: StrategyData = {
    audience: "",
    objective: "",
    product_positioning: "",
    reasoning: "",
    source: null,
    generate_post: true,
    generate_reels: false,
};

function resolvePlanGenerationFlags(
    contentTypeParam: string | null,
    generatePostParam: string | null,
    generateReelsParam: string | null
) {
    if (generatePostParam === "true" || generateReelsParam === "true") {
        return {
            generate_post: generatePostParam === "true",
            generate_reels: generateReelsParam === "true",
        };
    }

    if (contentTypeParam === "reels") {
        return {
            generate_post: false,
            generate_reels: true,
        };
    }

    return {
        generate_post: true,
        generate_reels: false,
    };
}

export function NewCampaignShell() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [product, setProduct] = useState<CampaignFormData>(INITIAL_CAMPAIGN);
    const [strategy, setStrategy] = useState<StrategyData>(INITIAL_STRATEGY);
    const [generationState, setGenerationState] =
        useState<CampaignGenerationState>("idle");
    const [artPreview, setArtPreview] = useState<CampaignPreviewData | null>(null);
    const [isChildEditing, setIsChildEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [campaignId, setCampaignId] = useState<string | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);

    useEffect(() => {
        const typeParam = searchParams.get("type");
        const objectiveParam = searchParams.get("objective");
        const audienceParam = searchParams.get("audience");
        const positioningParam = searchParams.get("positioning");

        const planItemIdParam = searchParams.get("plan_item_id");
        const themeParam = searchParams.get("theme");
        const contentTypeParam = searchParams.get("content_type");
        const generatePostParam = searchParams.get("generatePost");
        const generateReelsParam = searchParams.get("generateReels");

        const planFlags = resolvePlanGenerationFlags(
            contentTypeParam,
            generatePostParam,
            generateReelsParam
        );

        if (typeParam) {
            setProduct((prev) => ({
                ...prev,
                type:
                    typeParam === "product" ||
                        typeParam === "service" ||
                        typeParam === "info"
                        ? typeParam
                        : prev.type,
            }));
        }

        if (objectiveParam || audienceParam || positioningParam || generatePostParam || generateReelsParam) {
            setStrategy((prev) => ({
                ...prev,
                objective: objectiveParam || prev.objective,
                audience: audienceParam || prev.audience,
                product_positioning:
                    positioningParam || prev.product_positioning,
                reasoning: planItemIdParam
                    ? "Diretriz automática vinda do Plano Semanal."
                    : searchParams.get("source") === "ai_weather"
                        ? "Dica contextualizada baseada em IA para sua loja."
                        : "Configurado automaticamente com base na sugestão escolhida.",
                source: planItemIdParam ? "ai" : "manual",
                generate_post: (planItemIdParam || generatePostParam || generateReelsParam)
                    ? planFlags.generate_post
                    : prev.generate_post,
                generate_reels: (planItemIdParam || generatePostParam || generateReelsParam)
                    ? planFlags.generate_reels
                    : prev.generate_reels,
            }));
        }

        if (planItemIdParam && !objectiveParam && !audienceParam && !positioningParam) {
            setStrategy((prev) => ({
                ...prev,
                objective: themeParam || prev.objective,
                reasoning: "Diretriz automática vinda do Plano Semanal.",
                source: "ai",
                generate_post: planFlags.generate_post,
                generate_reels: planFlags.generate_reels,
            }));
        }
    }, [searchParams]);

    function handleCancel() {
        const confirmed = confirm(
            "Deseja cancelar a criação desta campanha? As informações preenchidas serão perdidas."
        );
        if (confirmed) {
            router.back();
        }
    }

    async function handleSaveDraft() {
        if (!product.product_name.trim()) {
            alert("Informe o nome da oferta para salvar o rascunho.");
            return;
        }

        const confirmed = confirm(
            "Deseja salvar esta campanha como rascunho para finalizar depois?"
        );
        if (!confirmed) return;

        try {
            setIsSaving(true);
            await ensureDraftCampaign();
            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            alert(err?.message || "Não conseguimos salvar seu rascunho agora.");
        } finally {
            setIsSaving(false);
        }
    }

    const isFormDirty = useMemo(() => {
        return (
            product.product_name.trim().length > 0 ||
            product.price.trim().length > 0 ||
            (product.description && product.description.trim().length > 0) ||
            !!product.image_url
        );
    }, [product]);


    const canGenerate = useMemo(() => {
        const hasBasicInfo = product.product_name.trim().length > 1;
        const hasRequiredPrice =
            product.type === "info" || product.price.trim().length > 0;
        const hasGenerationType =
            strategy.generate_post || strategy.generate_reels;

        return (
            hasBasicInfo &&
            hasRequiredPrice &&
            hasGenerationType &&
            strategy.audience.trim().length > 0 &&
            strategy.objective.trim().length > 0 &&
            strategy.product_positioning.trim().length > 0
        );
    }, [product, strategy]);


    async function getStore() {
        const { data: auth } = await supabase.auth.getUser();

        if (!auth.user) {
            throw new Error(
                "Não foi possível validar sua sessão. Código: VND-NC-AUTH-01"
            );
        }

        const { data: store } = await supabase
            .from("stores")
            .select("id")
            .eq("owner_user_id", auth.user.id)
            .single();

        if (!store) {
            throw new Error(
                "Não encontramos a loja vinculada à sua conta. Código: VND-NC-STORE-01"
            );
        }

        return store;
    }

    async function getFullStore(storeId: string) {
        const { data: fullStore } = await supabase
            .from("stores")
            .select(
                "name, address, neighborhood, city, state, whatsapp, phone, primary_color, secondary_color, logo_url"
            )
            .eq("id", storeId)
            .single();

        return fullStore;
    }

    async function buildPreview(
        currentId: string,
        storeId: string,
        options?: { preserveArt?: boolean }
    ) {
        const { data: finalCampaign, error: fetchErr } = await supabase
            .from("campaigns")
            .select("*")
            .eq("id", currentId)
            .single();

        if (fetchErr || !finalCampaign) {
            throw new Error(
                "Não foi possível atualizar a prévia da campanha. Código: VND-NC-PREVIEW-01"
            );
        }

        const { data: reelsRow } = await supabase
            .from("campaigns")
            .select(`
                reels_hook,
                reels_script,
                reels_shotlist,
                reels_on_screen_text,
                reels_audio_suggestion,
                reels_duration_seconds,
                reels_caption,
                reels_cta,
                reels_hashtags
            `)
            .eq("id", currentId)
            .single();

        const fullStore = await getFullStore(storeId);

        const nextImageUrl = options?.preserveArt
            ? artPreview?.image_url ||
            finalCampaign.image_url ||
            finalCampaign.product_image_url ||
            ""
            : finalCampaign.image_url ||
            finalCampaign.product_image_url ||
            "";

        setArtPreview({
            image_url: nextImageUrl,
            headline: finalCampaign.headline || finalCampaign.product_name || "",
            body_text: finalCampaign.ai_text || "",
            cta: finalCampaign.ai_cta || "",
            caption: finalCampaign.ai_caption || "",
            hashtags: finalCampaign.ai_hashtags || "",
            price: finalCampaign.price,
            layout: artPreview?.layout || "solid",
            store: fullStore
                ? {
                    name: fullStore.name,
                    address: `${fullStore.address || ""}${fullStore.neighborhood
                        ? `, ${fullStore.neighborhood}`
                        : ""
                        }`,
                    whatsapp: fullStore.whatsapp || fullStore.phone || "",
                    primary_color: fullStore.primary_color,
                    secondary_color: fullStore.secondary_color,
                    logo_url: fullStore.logo_url,
                }
                : undefined,
            reels_hook: reelsRow?.reels_hook || artPreview?.reels_hook || "",
            reels_script: reelsRow?.reels_script || artPreview?.reels_script || "",
            reels_shotlist:
                reelsRow?.reels_shotlist || artPreview?.reels_shotlist || [],
            reels_audio_suggestion:
                reelsRow?.reels_audio_suggestion ||
                artPreview?.reels_audio_suggestion ||
                "",
            reels_duration_seconds:
                reelsRow?.reels_duration_seconds ||
                artPreview?.reels_duration_seconds ||
                15,
            reels_on_screen_text:
                reelsRow?.reels_on_screen_text ||
                artPreview?.reels_on_screen_text ||
                [],
            reels_caption:
                reelsRow?.reels_caption || artPreview?.reels_caption || "",
            reels_cta: reelsRow?.reels_cta || artPreview?.reels_cta || "",
            reels_hashtags:
                reelsRow?.reels_hashtags || artPreview?.reels_hashtags || "",
        });
    }

    async function ensureDraftCampaign() {
        const store = await getStore();

        const planItemId = searchParams.get("plan_item_id");
        const isPlanDerived = !!planItemId;

        const campaignData = {
            store_id: store.id,
            product_name: product.product_name,
            price:
                product.type === "info"
                    ? null
                    : parseBRLToNumber(product.price),

            product_image_url: product.image_url || null,
            audience: strategy.audience,
            objective: strategy.objective,
            product_positioning: strategy.product_positioning,
            status: "draft" as const,
            origin: isPlanDerived ? ("plan" as const) : ("manual" as const),
            weekly_plan_item_id: isPlanDerived ? planItemId : null,
        };

        let currentId = campaignId;

        if (currentId) {
            const { error: upErr } = await supabase
                .from("campaigns")
                .update(campaignData)
                .eq("id", currentId);

            if (upErr) {
                throw new Error(
                    "Não conseguimos atualizar sua campanha. Código: VND-NC-DRAFT-UPDATE-01"
                );
            }
        } else {
            const { data: newC, error: cErr } = await supabase
                .from("campaigns")
                .insert(campaignData)
                .select("id")
                .single();

            if (cErr || !newC) {
                throw new Error(
                    "Não conseguimos preparar sua campanha. Código: VND-NC-DRAFT-CREATE-01"
                );
            }

            currentId = newC.id;
            setCampaignId(currentId);
        }

        return { currentId, storeId: store.id };
    }

    async function regenerateArt() {
        if (!campaignId) return;

        const confirmed = confirm(
            "Deseja gerar uma nova arte para esta campanha? Isso consumirá créditos de IA."
        );
        if (!confirmed) return;

        try {
            setIsRegenerating(true);

            const response = await fetch("/api/generate/campaign", {
                method: "POST",
                body: JSON.stringify({
                    campaign_id: campaignId,
                    force: true,
                    description: product.description,
                }),
            });

            const data = await response.json().catch(() => null);
            if (data?.ok === false) {
                throw new Error(
                    data.error ||
                    "Não conseguimos gerar uma nova arte agora. Código: VND-NC-ART-01"
                );
            }

            const store = await getStore();
            await buildPreview(campaignId, store.id, { preserveArt: true });
        } catch (err: any) {
            console.error(err);
            alert(
                err?.message ||
                "Não conseguimos gerar uma nova arte agora. Código: VND-NC-ART-01"
            );
        } finally {
            setIsRegenerating(false);
        }
    }

    async function regenerateReels() {
        if (!campaignId) return;

        const confirmed = confirm(
            "Deseja gerar um novo reels para esta campanha? Isso consumirá créditos de IA."
        );
        if (!confirmed) return;

        try {
            setIsRegenerating(true);

            const response = await fetch("/api/generate/reels", {
                method: "POST",
                body: JSON.stringify({
                    campaign_id: campaignId,
                    force: true,
                }),
            });

            const data = await response.json().catch(() => null);
            if (data?.ok === false) {
                throw new Error(
                    data.error ||
                    "Não conseguimos gerar um novo reels agora. Código: VND-NC-REELS-01"
                );
            }

            const store = await getStore();
            await buildPreview(campaignId, store.id, { preserveArt: true });
        } catch (err: any) {
            console.error(err);
            alert(
                err?.message ||
                "Não conseguimos gerar um novo reels agora. Código: VND-NC-REELS-01"
            );
        } finally {
            setIsRegenerating(false);
        }
    }

    async function handleGenerateCampaign() {
        try {
            if (
                artPreview &&
                !confirm(
                    "Você já possui uma campanha gerada. Deseja gerar uma nova? Isso consumirá créditos de IA."
                )
            ) {
                return;
            }

            setGenerationState("generating");

            const { currentId, storeId } = await ensureDraftCampaign();

            if (strategy.generate_post) {
                const genResponse = await fetch("/api/generate/campaign", {
                    method: "POST",
                    body: JSON.stringify({
                        campaign_id: currentId,
                        force: true,
                        description: product.description,
                    }),
                });

                const genData = await genResponse.json();
                if (genData.ok === false) {
                    throw new Error(
                        genData.error ||
                        "Não conseguimos gerar a arte agora. Código: VND-NC-GEN-POST-01"
                    );
                }
            }

            if (strategy.generate_reels) {
                const reelsResponse = await fetch("/api/generate/reels", {
                    method: "POST",
                    body: JSON.stringify({
                        campaign_id: currentId,
                        force: true,
                    }),
                });

                const reelsData = await reelsResponse.json().catch(() => null);
                if (reelsData?.ok === false) {
                    throw new Error(
                        reelsData.error ||
                        "Não conseguimos gerar o reels agora. Código: VND-NC-GEN-REELS-01"
                    );
                }
            }

            await buildPreview(currentId, storeId);
            
            // Marca como pronta no banco ao finalizar a geração
            await supabase
                .from("campaigns")
                .update({ status: "ready" })
                .eq("id", currentId);

            setGenerationState("ready");

            const planItemId = searchParams.get("plan_item_id");
            if (planItemId) {
                const { error: linkErr } = await supabase
                    .from("weekly_plan_items")
                    .update({ campaign_id: currentId })
                    .eq("id", planItemId);

                if (linkErr) {
                    console.error("Erro ao vincular campanha ao plano:", linkErr);
                }
            }

            document
                .getElementById("dashboard-main-content")
                ?.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err: any) {
            console.error(err);
            alert(
                err?.message ||
                "Não conseguimos gerar sua campanha agora. Código: VND-NC-GEN-00"
            );
            setGenerationState("idle");
        }
    }

    async function handleApprove() {
        if (!campaignId || !artPreview) return;

        try {
            setIsSaving(true);
            setGenerationState("generating");

            if (strategy.generate_post) {
                const ogResponse = await fetch("/api/generate/og-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        layout: artPreview.layout || "solid",
                        image_url: artPreview.image_url
                            ? artPreview.image_url.split("#")[0]
                            : "",
                        headline: artPreview.headline,
                        body_text: artPreview.body_text,
                        cta: artPreview.cta,
                        price: artPreview.price,
                        store_name: artPreview.store?.name,
                        store_address: artPreview.store?.address,
                        whatsapp: artPreview.store?.whatsapp,
                        primary_color: artPreview.store?.primary_color,
                    }),
                });

                if (!ogResponse.ok) {
                    throw new Error(
                        "Não conseguimos gerar a arte final com essa imagem. Tente novamente ou use JPG/PNG. Código: VND-NC-OG-01"
                    );
                }

                const imageBlob = await ogResponse.blob();
                const fileName = `art-${campaignId}-${Date.now()}.png`;

                const { error: uploadErr } = await supabase.storage
                    .from("campaign-images")
                    .upload(fileName, imageBlob, {
                        contentType: "image/png",
                        upsert: true,
                    });

                if (uploadErr) {
                    throw new Error(
                        "Não conseguimos salvar a arte final. Código: VND-NC-UP-01"
                    );
                }

                const { data: publicUrlData } = supabase.storage
                    .from("campaign-images")
                    .getPublicUrl(fileName);

                const finalImageUrl = publicUrlData.publicUrl;

                if (!finalImageUrl) {
                    throw new Error(
                        "Não conseguimos finalizar a arte. Código: VND-NC-URL-01"
                    );
                }

                const { error } = await supabase
                    .from("campaigns")
                    .update({
                        headline: artPreview.headline,
                        ai_text: artPreview.body_text,
                        ai_cta: artPreview.cta,
                        ai_caption: artPreview.caption,
                        ai_hashtags: artPreview.hashtags,
                        image_url: finalImageUrl,
                        status: "approved",
                        price:
                            product.type === "info"
                                ? null
                                : typeof artPreview.price === "string"
                                    ? parseFloat(artPreview.price.replace(",", ".")) || 0
                                    : artPreview.price,
                    })
                    .eq("id", campaignId);

                if (error) {
                    throw new Error(
                        "Não conseguimos salvar sua campanha. Código: VND-NC-SAVE-01"
                    );
                }
            } else {
                const { error } = await supabase
                    .from("campaigns")
                    .update({
                        status: "approved",
                        price:
                            product.type === "info"
                                ? null
                                : typeof artPreview.price === "string"
                                    ? parseFloat(artPreview.price.replace(",", ".")) || 0
                                    : artPreview.price,
                    })
                    .eq("id", campaignId);

                if (error) {
                    throw new Error(
                        "Não conseguimos salvar sua campanha. Código: VND-NC-SAVE-02"
                    );
                }
            }

            router.push(`/dashboard/campaigns/${campaignId}`);
        } catch (err: any) {
            console.error("Erro real ao aprovar nova campanha:", err);
            setGenerationState("ready");
            alert(
                err?.message ||
                "Não conseguimos salvar sua campanha agora. Código: VND-NC-APPROVE-00"
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSaveDraftReview() {
        if (!campaignId || !artPreview) return;

        const confirmed = confirm(
            "Deseja salvar as alterações feitas nesta campanha como rascunho?"
        );
        if (!confirmed) return;

        try {
            setIsSaving(true);
            setGenerationState("generating");

            const { error } = await supabase
                .from("campaigns")
                .update({
                    price:
                        product.type === "info"
                            ? null
                            : typeof artPreview.price === "string"
                                ? parseFloat(artPreview.price.replace(",", ".")) || 0
                                : artPreview.price,
                    headline: artPreview.headline,
                    ai_text: artPreview.body_text,
                    ai_cta: artPreview.cta,
                    ai_caption: artPreview.caption,
                    ai_hashtags: artPreview.hashtags,
                    reels_hook: artPreview.reels_hook,
                    reels_script: artPreview.reels_script,
                    reels_caption: artPreview.reels_caption,
                    reels_cta: artPreview.reels_cta,
                    reels_hashtags: artPreview.reels_hashtags,
                    status: "ready",
                })
                .eq("id", campaignId);

            if (error) throw error;

            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            setGenerationState("ready");
            alert(err?.message || "Não conseguimos salvar seu rascunho agora.");
        } finally {
            setIsSaving(false);
        }
    }

    const isPlanLinked = !!searchParams.get("plan_item_id");
    const planContentType = searchParams.get("content_type");
    const planContentLabel = planContentType === "reels" ? "reels" : "post";

    return (
        <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
            {generationState === "idle" || generationState === "error" ? (
                <div className="space-y-8">
                    {/* Cabeçalho */}
                    <MotionWrapper delay={0.1}>
                        <NewCampaignHeader />
                    </MotionWrapper>


                    {isPlanLinked && (
                        <MotionWrapper delay={0.15}>
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                <p className="text-sm font-medium text-emerald-800">
                                    <strong>Plano Semanal:</strong> esta campanha já veio
                                    com a estratégia herdada do plano e com foco em{" "}
                                    <strong>{planContentLabel}</strong>. Basta preencher o
                                    produto e gerar.
                                </p>
                            </div>
                        </MotionWrapper>
                    )}

                    {/* Grid de Formulários Alinhada */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <MotionWrapper delay={0.25}>
                            <StrategyFormCard
                                value={strategy}
                                isDisabled={isPlanLinked}
                                onChange={(next) => {
                                    setStrategy({
                                        ...next,
                                        source: next.source ?? "manual",
                                    });
                                }}
                            />
                        </MotionWrapper>

                        <MotionWrapper delay={0.3}>
                            <ProductFormCard
                                value={product}
                                onChange={setProduct}
                            />
                        </MotionWrapper>
                    </div>

                    {/* Ações de Rodapé Centralizadas */}
                    <div className="mt-12 space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                        <div className="mx-auto max-w-lg text-center">
                            <p className="text-sm font-medium text-zinc-500">
                                O Vendeo vai criar arte, copy e reels em uma única geração.
                            </p>
                            <div className="mt-6 flex flex-col gap-4">
                                <button
                                    onClick={handleGenerateCampaign}
                                    disabled={!canGenerate || isSaving || isChildEditing}
                                    className={`relative flex h-14 items-center justify-center gap-3 overflow-hidden rounded-2xl px-8 font-bold text-white transition-all active:scale-95 shadow-lg shadow-emerald-200/50 ${
                                        !canGenerate || isSaving || isChildEditing
                                            ? "bg-zinc-300 cursor-not-allowed opacity-70"
                                            : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-300/50"
                                    }`}
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        ✨ Gerar Campanha Completa
                                    </span>
                                </button>

                                <div className="flex items-center justify-center gap-4 pt-2">
                                    <button
                                        onClick={handleCancel}
                                        type="button"
                                        disabled={isSaving || isChildEditing}
                                        className={`h-11 px-6 rounded-xl border font-bold transition-all text-sm ${
                                            isSaving || isChildEditing
                                                ? "border-zinc-100 text-zinc-300 cursor-not-allowed"
                                                : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                                        }`}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        onClick={handleSaveDraft}
                                        type="button"
                                        disabled={!isFormDirty || isSaving || isChildEditing}
                                        className={`h-11 rounded-xl px-6 font-bold transition-all text-sm border ${
                                            !isFormDirty || isSaving || isChildEditing
                                                ? "border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed"
                                                : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm"
                                        }`}
                                    >
                                        {isSaving ? "Salvando..." : "Salvar rascunho"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder do Preview (vazio por enquanto) */}
                    <MotionWrapper delay={0.4} className="rounded-2xl border-2 border-dashed border-zinc-100 py-20 text-center">
                        <div className="mx-auto max-w-xs space-y-3">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50">
                                <span className="text-2xl">✨</span>
                            </div>
                            <p className="text-sm font-medium text-zinc-400">
                                Sua arte e roteiro aparecerão aqui após a geração
                            </p>
                        </div>
                    </MotionWrapper>

                </div>
            ) : (
                <div className="space-y-6">
                    <NewCampaignHeader />
                    {generationState === "ready" && (
                        <MotionWrapper delay={0.15}>
                            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row">
                                <div>
                                    <h2 className="text-lg font-bold text-zinc-900">
                                        Revisão da Campanha
                                    </h2>
                                    <p className="text-sm text-zinc-500">
                                        Você pode editar os textos, regenerar e depois
                                        aprovar.
                                    </p>
                                </div>
                                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                                    <button
                                        onClick={handleSaveDraftReview}
                                        disabled={isSaving || isChildEditing}
                                        className={`rounded-xl border border-zinc-900 bg-white px-6 py-2.5 text-sm font-bold shadow-sm transition-all sm:w-auto ${
                                            isChildEditing ? "opacity-50 cursor-not-allowed border-zinc-200 text-zinc-400" : "text-zinc-900 hover:bg-zinc-50"
                                        }`}
                                    >
                                        {isSaving ? "Salvando..." : "Salvar rascunho"}
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={isSaving || isChildEditing}
                                        className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all sm:w-auto ${
                                            isChildEditing ? "bg-zinc-300 cursor-not-allowed shadow-none" : "bg-emerald-600 hover:bg-emerald-700"
                                        }`}
                                    >
                                        Aprovar e Salvar
                                    </button>
                                </div>
                            </div>
                        </MotionWrapper>
                    )}

                    <MotionWrapper delay={0.2}>
                        <CampaignPreviewPanel
                            generationState={generationState}
                            preview={artPreview}
                            onUpdatePreview={setArtPreview}
                            generate_post={strategy.generate_post}
                            generate_reels={strategy.generate_reels}
                            onRegenerateArt={
                                strategy.generate_post ? regenerateArt : undefined
                            }
                            onRegenerateReels={
                                strategy.generate_reels ? regenerateReels : undefined
                            }
                            isRegenerating={isRegenerating}
                            onEditingChange={setIsChildEditing}
                        />
                    </MotionWrapper>
                </div>
            )}
        </main>
    );
}