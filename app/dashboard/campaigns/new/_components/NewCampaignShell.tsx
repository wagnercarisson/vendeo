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
import { ShortVideoAIOutput } from "@/lib/domain/short-videos/types";

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

export function NewCampaignShell() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [product, setProduct] = useState<CampaignFormData>(INITIAL_CAMPAIGN);
    const [strategy, setStrategy] = useState<StrategyData>(INITIAL_STRATEGY);

    useEffect(() => {
        const typeParam = searchParams.get("type");
        const objectiveParam = searchParams.get("objective");
        const audienceParam = searchParams.get("audience");
        const positioningParam = searchParams.get("positioning") || searchParams.get("product_positioning");
        const reasoningParam = searchParams.get("reasoning");

        if (typeParam || objectiveParam || audienceParam || positioningParam) {
            if (typeParam) {
                setProduct((prev) => ({
                    ...prev,
                    type:
                        typeParam === "product" || typeParam === "service" || typeParam === "info"
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
                generatePost: generatePostParam ? generatePostParam === "true" : prev.generatePost,
                generateReels: generateReelsParam ? generateReelsParam === "true" : prev.generateReels,
            }));
        }
    }, [searchParams]);

    const [generationState, setGenerationState] = useState<CampaignGenerationState>("idle");
    const [preview, setPreview] = useState<CampaignPreviewData | null>(null);
    const [campaignId, setCampaignId] = useState<string | null>(null);

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
                price: product.type === "info" ? null : parseFloat(product.price.replace(",", ".")) || 0,
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
                const { data: newC, error: cErr } = await supabase
                    .from("campaigns")
                    .insert(campaignData)
                    .select("id")
                    .single();

                if (cErr) throw cErr;
                currentId = newC.id;
                setCampaignId(currentId);
            }

            if (strategy.generatePost) {
                const genResponse = await fetch("/api/generate/campaign", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        campaign_id: currentId,
                        force: false,
                        description: product.description,
                    }),
                });

                const genData = await genResponse.json();
                if (genData.ok === false) {
                    throw new Error(genData.error || "Erro ao gerar post.");
                }
            }

            const { data: finalCampaign, error: fetchErr } = await supabase
                .from("campaigns")
                .select("*")
                .eq("id", currentId)
                .single();

            if (fetchErr || !finalCampaign) {
                throw new Error("Falha ao recuperar dados da campanha.");
            }

            let reels: ShortVideoAIOutput | null = null;

            if (strategy.generateReels) {
                try {
                    const reelsResponse = await fetch("/api/generate/reels", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            campaign_id: currentId,
                            force: false,
                        }),
                    });

                    const reelsData = await reelsResponse.json();
                    if (reelsData.ok === true) {
                        reels = reelsData.reels;
                    }
                } catch (reelsErr) {
                    console.warn("Falha silenciosa ao gerar Reels:", reelsErr);
                }
            }

            const { data: fullStore } = await supabase
                .from("stores")
                .select("name, address, neighborhood, city, state, whatsapp, phone, primary_color, secondary_color, logo_url")
                .eq("id", store.id)
                .single();

            setPreview({
                imageUrl:
                    finalCampaign.image_url ||
                    finalCampaign.product_image_url ||
                    product.imageUrl ||
                    "",
                headline: finalCampaign.headline || finalCampaign.product_name,
                bodyText: finalCampaign.ai_text || "",
                cta: finalCampaign.ai_cta || "",
                caption: finalCampaign.ai_caption || "",
                hashtags: finalCampaign.ai_hashtags || "",
                price: finalCampaign.price,
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
                reelsHook: reels?.hook || finalCampaign.reels_hook || "",
                reelsScript: reels?.script || finalCampaign.reels_script || "",
                reelsShotlist: reels?.shotlist || finalCampaign.reels_shotlist || [],
                reelsAudioSuggestion:
                    reels?.audio_suggestion || finalCampaign.reels_audio_suggestion || "",
                reelsDurationSeconds:
                    reels?.duration_seconds || finalCampaign.reels_duration_seconds || 15,
                reelsOnScreenText:
                    reels?.on_screen_text || finalCampaign.reels_on_screen_text || [],
                reelsCaption: reels?.caption || finalCampaign.reels_caption || "",
                reelsCta: reels?.cta || finalCampaign.reels_cta || "",
                reelsHashtags: reels?.hashtags || finalCampaign.reels_hashtags || "",
            });

            setGenerationState("ready");

            const planItemId = searchParams.get("plan_item_id");
            if (planItemId) {
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
            alert(err.message || "Erro durante o processo de geração.");
            setGenerationState("idle");
        }
    }

    async function handleApprove() {
        if (!campaignId || !preview) return;

        try {
            setGenerationState("generating");

            let finalImageUrl = preview.imageUrl;

            if (strategy.generatePost) {
                try {
                    const ogResponse = await fetch("/api/generate/og-image", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            layout: preview.layout || "solid",
                            imageUrl: preview.imageUrl ? preview.imageUrl.split("#")[0] : "",
                            headline: preview.headline,
                            bodyText: preview.bodyText,
                            cta: preview.cta,
                            price: preview.price,
                            storeName: preview.store?.name,
                            storeAddress: preview.store?.address,
                            whatsapp: preview.store?.whatsapp,
                            primaryColor: preview.store?.primary_color,
                        }),
                    });

                    if (ogResponse.ok) {
                        const imageBlob = await ogResponse.blob();
                        const fileName = `${campaignId}-${Date.now()}.png`;

                        const { error: uploadErr } = await supabase.storage
                            .from("campaign-images")
                            .upload(fileName, imageBlob, {
                                contentType: "image/png",
                                upsert: true,
                            });

                        if (uploadErr) {
                            console.error("Erro no upload da arte final:", uploadErr);
                        } else {
                            const { data: publicUrlData } = supabase.storage
                                .from("campaign-images")
                                .getPublicUrl(fileName);

                            finalImageUrl = publicUrlData.publicUrl;
                        }
                    } else {
                        console.error("Falha ao gerar preview OG", await ogResponse.text());
                    }
                } catch (ogErr) {
                    console.error("Erro requisição OG Image:", ogErr);
                }
            }

            const campaignUpdatePayload = {
                headline: strategy.generatePost ? preview.headline : null,
                ai_text: strategy.generatePost ? preview.bodyText : null,
                ai_cta: strategy.generatePost ? preview.cta : null,
                ai_caption: strategy.generatePost ? preview.caption : null,
                ai_hashtags: strategy.generatePost ? preview.hashtags : null,
                image_url: strategy.generatePost ? finalImageUrl : null,

                reels_hook: strategy.generateReels ? preview.reelsHook || null : null,
                reels_script: strategy.generateReels ? preview.reelsScript || null : null,
                reels_shotlist: strategy.generateReels ? preview.reelsShotlist || [] : null,
                reels_on_screen_text: strategy.generateReels ? preview.reelsOnScreenText || [] : null,
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
            alert(err.message || "Erro ao salvar alterações da campanha.");
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
            </MotionWrapper>

            {generationState === "ready" && (
                <MotionWrapper delay={0.15}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">Revisão da Campanha</h2>
                            <p className="text-sm text-zinc-500">
                                Você pode editar os textos antes de aprovar.
                            </p>
                        </div>
                        <button
                            onClick={handleApprove}
                            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
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