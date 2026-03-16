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
import { renderCampaignArtToBlob } from "@/app/dashboard/campaigns/_components/renderCampaignArt";
import type {
    CampaignGenerationState,
    CampaignPreviewData,
    CampaignFormData,
    StrategyData,
} from "./types";
import type { CampaignAIOutput } from "@/lib/domain/campaigns/types";
import type { ShortVideoAIOutput } from "@/lib/domain/short-videos/types";

const INITIAL_CAMPAIGN: CampaignFormData = {
    type: "product",
    productName: "",
    description: "",
    price: "",
    imageUrl: "",
};

const INITIAL_STRATEGY: StrategyData = {
    audience: "",
    objective: "",
    productPositioning: "",
    reasoning: "",
    source: null,
    generatePost: true,
    generateReels: false,
};

function hasPostPreviewContent(preview: CampaignPreviewData | null) {
    if (!preview) return false;

    return (
        (preview.headline || "").trim().length > 0 &&
        (preview.bodyText || "").trim().length > 0 &&
        (preview.cta || "").trim().length > 0 &&
        (preview.caption || "").trim().length > 0 &&
        (preview.hashtags || "").trim().length > 0
    );
}

function hasReelsPreviewContent(preview: CampaignPreviewData | null) {
    if (!preview) return false;

    return (
        (preview.reelsHook || "").trim().length > 0 &&
        (preview.reelsScript || "").trim().length > 0 &&
        Array.isArray(preview.reelsShotlist) &&
        preview.reelsShotlist.length > 0 &&
        Array.isArray(preview.reelsOnScreenText) &&
        preview.reelsOnScreenText.length > 0 &&
        (preview.reelsAudioSuggestion || "").trim().length > 0 &&
        typeof preview.reelsDurationSeconds === "number" &&
        preview.reelsDurationSeconds > 0 &&
        (preview.reelsCaption || "").trim().length > 0 &&
        (preview.reelsCta || "").trim().length > 0 &&
        (preview.reelsHashtags || "").trim().length > 0
    );
}

export function NewCampaignShell() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [product, setProduct] = useState<CampaignFormData>(INITIAL_CAMPAIGN);
    const [strategy, setStrategy] = useState<StrategyData>(INITIAL_STRATEGY);

    const [generationState, setGenerationState] = useState<CampaignGenerationState>("idle");
    const [preview, setPreview] = useState<CampaignPreviewData | null>(null);
    const [campaignId, setCampaignId] = useState<string | null>(null);
    const [generationIssue, setGenerationIssue] = useState<string | null>(null);

    useEffect(() => {
        const typeParam = searchParams.get("type");
        const objectiveParam = searchParams.get("objective");
        const audienceParam = searchParams.get("audience");
        const positioningParam =
            searchParams.get("positioning") || searchParams.get("product_positioning");
        const reasoningParam = searchParams.get("reasoning");

        if (typeParam || objectiveParam || audienceParam || positioningParam) {
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

            setStrategy((prev) => ({
                ...prev,
                objective: objectiveParam || prev.objective,
                audience: audienceParam || prev.audience,
                productPositioning: positioningParam || prev.productPositioning,
                reasoning:
                    reasoningParam ||
                    "Configurado automaticamente com base na sugestão escolhida.",
                source: "manual",
            }));
        }

        const planItemIdParam = searchParams.get("plan_item_id");
        const themeParam = searchParams.get("theme");
        const generatePostParam = searchParams.get("generatePost");
        const generateReelsParam = searchParams.get("generateReels");

        if (planItemIdParam) {
            setStrategy((prev) => ({
                ...prev,
                objective: objectiveParam || prev.objective,
                audience: audienceParam || prev.audience,
                productPositioning: positioningParam || prev.productPositioning,
                reasoning:
                    reasoningParam ||
                    themeParam ||
                    "Diretriz automática vinda do Plano Semanal.",
                source: "ai",
                generatePost: generatePostParam
                    ? generatePostParam === "true"
                    : prev.generatePost,
                generateReels: generateReelsParam
                    ? generateReelsParam === "true"
                    : prev.generateReels,
            }));
        }
    }, [searchParams]);

    const canGenerate = useMemo(() => {
        const hasBasicInfo = product.productName.trim().length > 1;
        const hasRequiredPrice = product.type === "info" || product.price.trim().length > 0;
        const hasGenerationType = strategy.generatePost || strategy.generateReels;

        return (
            hasBasicInfo &&
            hasRequiredPrice &&
            hasGenerationType &&
            strategy.audience.trim().length > 0 &&
            strategy.objective.trim().length > 0
        );
    }, [product, strategy]);

    const approvalGuard = useMemo(() => {
        if (!preview) {
            return {
                canApprove: false,
                reason: "Gere a campanha antes de aprovar.",
            };
        }

        const missingPost = strategy.generatePost && !hasPostPreviewContent(preview);
        const missingReels = strategy.generateReels && !hasReelsPreviewContent(preview);

        if (missingPost && missingReels) {
            return {
                canApprove: false,
                reason: "A campanha ainda está incompleta. Gere novamente antes de aprovar.",
            };
        }

        if (missingPost) {
            return {
                canApprove: false,
                reason: "O post ainda não foi gerado por completo. Revise ou gere novamente antes de aprovar.",
            };
        }

        if (missingReels) {
            return {
                canApprove: false,
                reason: "O reels ainda não foi gerado por completo. Revise ou gere novamente antes de aprovar.",
            };
        }

        if (generationIssue) {
            return {
                canApprove: false,
                reason: generationIssue,
            };
        }

        return {
            canApprove: true,
            reason: null as string | null,
        };
    }, [generationIssue, preview, strategy.generatePost, strategy.generateReels]);

    async function handleGenerateCampaign() {
        try {
            if (
                preview &&
                !confirm(
                    "Você já possui uma campanha gerada. Deseja gerar uma nova? (Isso consumirá créditos de IA)"
                )
            ) {
                return;
            }

            setGenerationIssue(null);
            setGenerationState("generating");

            const { data: auth } = await supabase.auth.getUser();
            if (!auth.user) throw new Error("Usuário não autenticado.");

            const { data: store } = await supabase
                .from("stores")
                .select("id")
                .eq("owner_user_id", auth.user.id)
                .single();

            if (!store) throw new Error("Loja não encontrada.");

            const campaignData = {
                store_id: store.id,
                product_name: product.productName,
                price:
                    product.type === "info"
                        ? null
                        : parseFloat(product.price.replace(",", ".")) || 0,
                product_image_url: product.imageUrl || null,
                audience: strategy.audience,
                objective: strategy.objective,
                product_positioning: strategy.productPositioning,
                status: "draft" as const,
            };

            let currentId = campaignId;

            if (currentId) {
                const { error: upErr } = await supabase
                    .from("campaigns")
                    .update(campaignData)
                    .eq("id", currentId);

                if (upErr) throw upErr;
            } else {
                const { data: newCampaign, error: insertErr } = await supabase
                    .from("campaigns")
                    .insert(campaignData)
                    .select("id")
                    .single();

                if (insertErr) throw insertErr;
                currentId = newCampaign.id;
                setCampaignId(currentId);
            }

            const { data: draftCampaign, error: fetchDraftErr } = await supabase
                .from("campaigns")
                .select("*")
                .eq("id", currentId)
                .single();

            if (fetchDraftErr || !draftCampaign) {
                throw new Error("Falha ao recuperar os dados-base da campanha.");
            }

            let generatedPost: CampaignAIOutput | null = null;
            let generatedReels: ShortVideoAIOutput | null = null;
            let localGenerationIssue: string | null = null;

            if (strategy.generatePost) {
                const postResponse = await fetch("/api/generate/campaign", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        campaign_id: currentId,
                        force: false,
                        description: product.description,
                        persist: false,
                    }),
                });

                const postData = await postResponse.json();

                if (postData.ok === false) {
                    throw new Error(postData.error || "Erro ao gerar post.");
                }

                if (!postData.output) {
                    throw new Error("A IA não retornou o conteúdo do post.");
                }

                generatedPost = postData.output;
            }

            if (strategy.generateReels) {
                try {
                    const reelsResponse = await fetch("/api/generate/reels", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            campaign_id: currentId,
                            force: false,
                            persist: false,
                            description: product.description,
                        }),
                    });

                    const reelsData = await reelsResponse.json();

                    if (reelsData.ok === false) {
                        throw new Error(reelsData.error || "Erro ao gerar reels.");
                    }

                    if (!reelsData.reels) {
                        throw new Error("A IA não retornou o conteúdo do reels.");
                    }

                    generatedReels = reelsData.reels;
                } catch (reelsErr: any) {
                    localGenerationIssue =
                        reelsErr?.message ||
                        "O reels falhou na geração. Revise ou gere novamente antes de aprovar.";
                }
            }

            const { data: fullStore } = await supabase
                .from("stores")
                .select(
                    "name, address, neighborhood, city, state, whatsapp, phone, primary_color, secondary_color, logo_url"
                )
                .eq("id", store.id)
                .single();

            const nextPreview: CampaignPreviewData = {
                imageUrl:
                    draftCampaign.product_image_url ||
                    product.imageUrl ||
                    "",
                headline:
                    generatedPost?.headline ||
                    draftCampaign.headline ||
                    draftCampaign.product_name ||
                    product.productName,
                bodyText:
                    generatedPost?.text ||
                    draftCampaign.ai_text ||
                    "",
                cta:
                    generatedPost?.cta ||
                    draftCampaign.ai_cta ||
                    "",
                caption:
                    generatedPost?.caption ||
                    draftCampaign.ai_caption ||
                    "",
                hashtags:
                    generatedPost?.hashtags ||
                    draftCampaign.ai_hashtags ||
                    "",
                price: draftCampaign.price,
                store: fullStore
                    ? {
                        name: fullStore.name,
                        address: `${fullStore.address || ""}${fullStore.neighborhood ? `, ${fullStore.neighborhood}` : ""}`,
                        whatsapp: fullStore.whatsapp || fullStore.phone || "",
                        primary_color: fullStore.primary_color,
                        secondary_color: fullStore.secondary_color,
                        logo_url: fullStore.logo_url,
                    }
                    : undefined,
                reelsHook:
                    generatedReels?.hook ||
                    draftCampaign.reels_hook ||
                    "",
                reelsScript:
                    generatedReels?.script ||
                    draftCampaign.reels_script ||
                    "",
                reelsShotlist:
                    generatedReels?.shotlist ||
                    draftCampaign.reels_shotlist ||
                    [],
                reelsAudioSuggestion:
                    generatedReels?.audio_suggestion ||
                    draftCampaign.reels_audio_suggestion ||
                    "",
                reelsDurationSeconds:
                    generatedReels?.duration_seconds ||
                    draftCampaign.reels_duration_seconds ||
                    15,
                reelsOnScreenText:
                    generatedReels?.on_screen_text ||
                    draftCampaign.reels_on_screen_text ||
                    [],
                reelsCaption:
                    generatedReels?.caption ||
                    draftCampaign.reels_caption ||
                    "",
                reelsCta:
                    generatedReels?.cta ||
                    draftCampaign.reels_cta ||
                    "",
                reelsHashtags:
                    generatedReels?.hashtags ||
                    draftCampaign.reels_hashtags ||
                    "",
            };

            setPreview(nextPreview);
            setGenerationIssue(localGenerationIssue);
            setGenerationState("ready");

            const generationSucceededCompletely =
                (!strategy.generatePost || !!generatedPost) &&
                (!strategy.generateReels || !!generatedReels);

            const planItemId = searchParams.get("plan_item_id");
            if (planItemId && generationSucceededCompletely) {
                const editedThemeOrFallback =
                    searchParams.get("theme") ||
                    strategy.reasoning ||
                    "Diretriz do plano semanal";

                const { error: linkErr } = await supabase
                    .from("weekly_plan_items")
                    .update({
                        campaign_id: currentId,
                        status: "ready",
                        theme: editedThemeOrFallback,
                        brief: {
                            angle: "Campanha vinculada a partir do fluxo de execução.",
                            hook_hint: "Abrir com promessa clara do benefício.",
                            cta_hint: "Convidar para contato ou visita.",
                            audience: strategy.audience,
                            objective: strategy.objective,
                            product_positioning: strategy.productPositioning,
                        },
                    })
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
            setGenerationIssue(err?.message || "Erro durante o processo de geração.");
            setGenerationState("error");
        }
    }

    async function handleApprove() {
        if (!campaignId || !preview) return;

        if (!approvalGuard.canApprove) {
            alert(approvalGuard.reason || "A campanha ainda não pode ser aprovada.");
            return;
        }

        try {
            setGenerationState("generating");

            let finalImageUrl: string | null = null;

            if (strategy.generatePost) {
                try {
                    const imageBlob = await renderCampaignArtToBlob({
                        layout: preview.layout || "solid",
                        imageUrl: preview.imageUrl ? preview.imageUrl.split("#")[0] : "",
                        headline: preview.headline || "",
                        bodyText: preview.bodyText || "",
                        cta: preview.cta || "",
                        price: preview.price,
                        store: preview.store,
                    });

                    const fileName = `${campaignId}-${Date.now()}.png`;

                    const { error: uploadErr } = await supabase.storage
                        .from("campaign-images")
                        .upload(fileName, imageBlob, {
                            contentType: "image/png",
                            upsert: true,
                        });

                    if (uploadErr) {
                        throw new Error("Falha no upload da arte final da campanha.");
                    }

                    const { data: publicUrlData } = supabase.storage
                        .from("campaign-images")
                        .getPublicUrl(fileName);

                    finalImageUrl = publicUrlData.publicUrl;
                } catch (artErr) {
                    console.error("Erro ao gerar arte final no navegador:", artErr);
                    throw new Error(
                        "Não foi possível gerar a arte final. A campanha não foi aprovada para evitar salvar apenas a foto do produto."
                    );
                }
            }

            const campaignUpdatePayload = {
                headline: strategy.generatePost ? preview.headline || null : null,
                ai_text: strategy.generatePost ? preview.bodyText || null : null,
                ai_cta: strategy.generatePost ? preview.cta || null : null,
                ai_caption: strategy.generatePost ? preview.caption || null : null,
                ai_hashtags: strategy.generatePost ? preview.hashtags || null : null,
                ai_generated_at: strategy.generatePost ? new Date().toISOString() : null,
                image_url: strategy.generatePost ? finalImageUrl : null,

                reels_hook: strategy.generateReels ? preview.reelsHook || null : null,
                reels_script: strategy.generateReels ? preview.reelsScript || null : null,
                reels_shotlist: strategy.generateReels ? preview.reelsShotlist || [] : null,
                reels_on_screen_text: strategy.generateReels
                    ? preview.reelsOnScreenText || []
                    : null,
                reels_audio_suggestion: strategy.generateReels
                    ? preview.reelsAudioSuggestion || null
                    : null,
                reels_duration_seconds: strategy.generateReels
                    ? preview.reelsDurationSeconds || null
                    : null,
                reels_caption: strategy.generateReels ? preview.reelsCaption || null : null,
                reels_cta: strategy.generateReels ? preview.reelsCta || null : null,
                reels_hashtags: strategy.generateReels ? preview.reelsHashtags || null : null,
                reels_generated_at: strategy.generateReels ? new Date().toISOString() : null,

                status: "approved" as const,
            };

            const { error } = await supabase
                .from("campaigns")
                .update(campaignUpdatePayload)
                .eq("id", campaignId);

            if (error) throw error;

            const planItemId = searchParams.get("plan_item_id");
            if (planItemId) {
                const { error: itemErr } = await supabase
                    .from("weekly_plan_items")
                    .update({
                        campaign_id: campaignId,
                        status: "approved",
                    })
                    .eq("id", planItemId);

                if (itemErr) throw itemErr;
            }

            router.push(`/dashboard/campaigns/${campaignId}`);
        } catch (err: any) {
            console.error(err);
            setGenerationState("ready");
            setGenerationIssue(err?.message || "Erro ao salvar alterações da campanha.");
            alert(err?.message || "Erro ao salvar alterações da campanha.");
        }
    }

    return (
        <main className="mx-auto max-w-6xl px-6 py-6 space-y-6">
            <MotionWrapper delay={0.1}>
                <NewCampaignHeader />

                {searchParams.get("plan_item_id") && generationState !== "ready" && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-sm font-medium text-emerald-800">
                            <strong>Plano Semanal:</strong> A IA já pré-configurou a estratégia com
                            base no seu calendário. Basta preencher o Produto e gerar!
                        </p>
                    </div>
                )}

                {generationIssue && (
                    <div
                        className={`mt-4 rounded-xl p-4 ${generationState === "ready"
                            ? "border border-amber-200 bg-amber-50"
                            : "border border-rose-200 bg-rose-50"
                            }`}
                    >
                        <p
                            className={`text-sm font-medium ${generationState === "ready"
                                ? "text-amber-800"
                                : "text-rose-800"
                                }`}
                        >
                            {generationIssue}
                        </p>
                    </div>
                )}
            </MotionWrapper>

            {generationState === "ready" && (
                <MotionWrapper delay={0.15}>
                    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">Revisão da Campanha</h2>
                            <p className="text-sm text-zinc-500">
                                Você pode editar os textos antes de aprovar.
                            </p>
                            {!approvalGuard.canApprove && approvalGuard.reason && (
                                <p className="mt-2 text-sm font-medium text-amber-700">
                                    {approvalGuard.reason}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleApprove}
                            disabled={!approvalGuard.canApprove}
                            className="w-full rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                        >
                            Aprovar e Salvar
                        </button>
                    </div>
                </MotionWrapper>
            )}

            {generationState === "idle" || generationState === "error" ? (
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-5">
                        <MotionWrapper delay={0.2}>
                            <StrategyFormCard
                                value={strategy}
                                onChange={(next) => {
                                    setStrategy({
                                        ...next,
                                        source: next.source ?? "manual",
                                    });
                                }}
                            />
                        </MotionWrapper>
                    </div>

                    <div className="space-y-5">
                        <MotionWrapper delay={0.3}>
                            <ProductFormCard value={product} onChange={setProduct} />
                        </MotionWrapper>

                        <MotionWrapper delay={0.4}>
                            <GenerateCampaignCard
                                generationState={generationState}
                                canGenerate={canGenerate}
                                onGenerate={handleGenerateCampaign}
                            />
                        </MotionWrapper>
                    </div>
                </div>
            ) : (
                <MotionWrapper delay={0.2}>
                    <CampaignPreviewPanel
                        generationState={generationState}
                        preview={preview}
                        onUpdatePreview={setPreview}
                        generatePost={strategy.generatePost}
                        generateReels={strategy.generateReels}
                    />
                </MotionWrapper>
            )}
        </main>
    );
}