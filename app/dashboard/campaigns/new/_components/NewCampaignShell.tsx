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
    const [preview, setPreview] = useState<CampaignPreviewData | null>(null);
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
            ? preview?.image_url ||
            finalCampaign.image_url ||
            finalCampaign.product_image_url ||
            ""
            : finalCampaign.image_url ||
            finalCampaign.product_image_url ||
            "";

        setPreview({
            image_url: nextImageUrl,
            headline: finalCampaign.headline || finalCampaign.product_name || "",
            body_text: finalCampaign.ai_text || "",
            cta: finalCampaign.ai_cta || "",
            caption: finalCampaign.ai_caption || "",
            hashtags: finalCampaign.ai_hashtags || "",
            price: finalCampaign.price,
            layout: preview?.layout || "solid",
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
            reels_hook: reelsRow?.reels_hook || preview?.reels_hook || "",
            reels_script: reelsRow?.reels_script || preview?.reels_script || "",
            reels_shotlist:
                reelsRow?.reels_shotlist || preview?.reels_shotlist || [],
            reels_audio_suggestion:
                reelsRow?.reels_audio_suggestion ||
                preview?.reels_audio_suggestion ||
                "",
            reels_duration_seconds:
                reelsRow?.reels_duration_seconds ||
                preview?.reels_duration_seconds ||
                15,
            reels_on_screen_text:
                reelsRow?.reels_on_screen_text ||
                preview?.reels_on_screen_text ||
                [],
            reels_caption:
                reelsRow?.reels_caption || preview?.reels_caption || "",
            reels_cta: reelsRow?.reels_cta || preview?.reels_cta || "",
            reels_hashtags:
                reelsRow?.reels_hashtags || preview?.reels_hashtags || "",
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
                    : parseFloat(product.price.replace(",", ".")) || 0,
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
                preview &&
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
        if (!campaignId || !preview) return;

        try {
            setGenerationState("generating");

            if (strategy.generate_post) {
                let finalImageUrl: string | null = null;

                const ogResponse = await fetch("/api/generate/og-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        layout: preview.layout || "solid",
                        image_url: preview.image_url
                            ? preview.image_url.split("#")[0]
                            : "",
                        headline: preview.headline,
                        body_text: preview.body_text,
                        cta: preview.cta,
                        price: preview.price,
                        store_name: preview.store?.name,
                        store_address: preview.store?.address,
                        whatsapp: preview.store?.whatsapp,
                        primary_color: preview.store?.primary_color,
                    }),
                });

                if (!ogResponse.ok) {
                    await ogResponse.text().catch(() => "");
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

                finalImageUrl = publicUrlData.publicUrl;

                if (!finalImageUrl) {
                    throw new Error(
                        "Não conseguimos finalizar a arte. Código: VND-NC-URL-01"
                    );
                }

                const { error } = await supabase
                    .from("campaigns")
                    .update({
                        headline: preview.headline,
                        ai_text: preview.body_text,
                        ai_cta: preview.cta,
                        ai_caption: preview.caption,
                        ai_hashtags: preview.hashtags,
                        image_url: finalImageUrl,
                        status: "approved",
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
        }
    }

    const isPlanLinked = !!searchParams.get("plan_item_id");
    const planContentType = searchParams.get("content_type");
    const planContentLabel =
        planContentType === "reels" ? "reels" : "post";

    return (
        <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
            <MotionWrapper delay={0.1}>
                <NewCampaignHeader />
                {isPlanLinked && generationState !== "ready" && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-sm font-medium text-emerald-800">
                            <strong>Plano Semanal:</strong> esta campanha já veio
                            com a estratégia herdada do plano e com foco em{" "}
                            <strong>{planContentLabel}</strong>. Basta preencher o
                            produto e gerar.
                        </p>
                    </div>
                )}
            </MotionWrapper>

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
                        <button
                            onClick={handleApprove}
                            className="w-full rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 sm:w-auto"
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
                                isDisabled={isPlanLinked}
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
                            <ProductFormCard
                                value={product}
                                onChange={setProduct}
                            />
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
                        generate_post={strategy.generate_post}
                        generate_reels={strategy.generate_reels}
                        onRegenerateArt={
                            strategy.generate_post ? regenerateArt : undefined
                        }
                        onRegenerateReels={
                            strategy.generate_reels ? regenerateReels : undefined
                        }
                        isRegenerating={isRegenerating}
                    />
                </MotionWrapper>
            )}
        </main>
    );
}