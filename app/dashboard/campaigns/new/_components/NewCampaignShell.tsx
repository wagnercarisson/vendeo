"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    getSignedUrlAction,
    registerApprovedAssetAction,
} from "@/lib/supabase/storage-actions";
import { NewCampaignHeader } from "./NewCampaignHeader";
import { ProductFormCard } from "./ProductFormCard";
import { StrategyFormCard } from "./StrategyFormCard";
import { GenerateCampaignCard } from "./GenerateCampaignCard";
import { CampaignPreviewPanel } from "./CampaignPreviewPanel";
import { renderGraphicToBlob } from "@/lib/graphics/renderer";
import { MotionWrapper } from "@/app/dashboard/_components/MotionWrapper";
import { extractStoragePath } from "@/lib/supabase/storage-path";
import type {
    CampaignGenerationState,
    CampaignPreviewData,
    CampaignFormData,
    StrategyData,
} from "./types";
import { parseBRLToNumber } from "@/lib/formatters/priceMask";
import { normalizeObjective } from "@/lib/formatters/strategyLabels";
import {
    buildCampaignContentTypeWrite,
    normalizeCampaignContentType,
} from "@/lib/domain/campaigns/mapper";
import { mapDbStoreToDomain } from "@/lib/domain/stores/mapper";
import {
    buildCampaignDomainInputFromWeeklyPlanTarget,
    normalizeWeeklyPlanTargetContentType,
    normalizeWeeklyPlanTargetDomainInput,
} from "@/lib/domain/weekly-plans/mapper";

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
    const [storeId, setStoreId] = useState<string | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);

    async function getPlanItemContext(planItemId: string) {
        const { data } = await supabase
            .from("weekly_plan_items")
            .select("*, weekly_plans(status, week_start)")
            .eq("id", planItemId)
            .single();

        return data || null;
    }

    useEffect(() => {
        async function fetchStore() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from("stores").select("id").eq("owner_user_id", user.id).single();
                if (data) setStoreId(data.id);
            }
        }
        fetchStore();
    }, []);

    useEffect(() => {
        const typeParam = searchParams.get("type");
        const objectiveParam = normalizeObjective(searchParams.get("objective"));
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
                type: normalizeCampaignContentType(typeParam),
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
                reasoning: "Diretriz automática vinda do Plano Semanal.",
                source: "ai",
                generate_post: planFlags.generate_post,
                generate_reels: planFlags.generate_reels,
            }));
        }

        if (planItemIdParam) {
            hydrateFromPlanItem(planItemIdParam);
        }

        async function hydrateFromPlanItem(id: string) {
            const planItem = await getPlanItemContext(id);
            const plan = planItem?.weekly_plans as any;

            if (plan?.status === "draft") {
                alert("Este plano ainda é um rascunho. Por favor, revise e aprove o plano antes de orquestrar campanhas.");
                router.replace(`/dashboard/plans?view=new&week_start=${plan.week_start}`);
                return;
            }

            const plannedTargetType = normalizeWeeklyPlanTargetContentType(
                planItem?.target_content_type
            );

            if (plannedTargetType) {
                setProduct((prev) => ({
                    ...prev,
                    type: plannedTargetType,
                }));
            }
        }
    }, [searchParams, router]);

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
            router.refresh();
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
        const hasRequiredPrice = true; // Preço agora é opcional em todos os tipos
        const hasGenerationType =
            strategy.generate_post || strategy.generate_reels;
        const hasRequiredImage = !strategy.generate_post || product.image_url.trim().length > 0;

        return (
            hasBasicInfo &&
            hasRequiredPrice &&
            hasRequiredImage &&
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
                "id, name, address, neighborhood, city, state, whatsapp, phone, primary_color, secondary_color, logo_url, brand_profile, brand_profile_version, brand_profile_updated_at"
            )
            .eq("id", storeId)
            .single();

        return fullStore ? mapDbStoreToDomain(fullStore) : null;
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

        const nextImageUrl = finalCampaign.product_image_url || "";
                const [signedImg, signedLogo] = await Promise.all([
                    getSignedUrlAction(nextImageUrl),
                    getSignedUrlAction(fullStore?.logo_url)
                ]);

        setArtPreview({
                        image_url: signedImg || "",
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
                    logo_url: signedLogo || "",
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
        const planItemContext = isPlanDerived && planItemId
            ? await getPlanItemContext(planItemId)
            : null;
        const plannedTargetType = normalizeWeeklyPlanTargetContentType(
            planItemContext?.target_content_type
        );
        const effectiveContentType = plannedTargetType || product.type;
        const contentTypeWrite = buildCampaignContentTypeWrite(effectiveContentType);
        const normalizedTargetDomainInput = normalizeWeeklyPlanTargetDomainInput(
            planItemContext?.target_domain_input
        );
        const domainInput = isPlanDerived
            ? buildCampaignDomainInputFromWeeklyPlanTarget({
                targetContentType: plannedTargetType,
                targetDomainInput: normalizedTargetDomainInput,
                productName: product.product_name,
                price:
                    !product.price || effectiveContentType === "message"
                        ? null
                        : parseBRLToNumber(product.price),
                priceLabel: product.price_label || null,
                productPositioning: strategy.product_positioning,
                productImageUrl: extractStoragePath(product.image_url),
                description: product.description || null,
            })
            : null;

        const campaignData = {
            store_id: store.id,
            product_name: product.product_name,
            price:
                !product.price || effectiveContentType === "message"
                    ? null
                    : parseBRLToNumber(product.price),
            price_label: product.price_label || null,
            product_image_url: extractStoragePath(product.image_url),
            audience: strategy.audience,
            objective: strategy.objective,
            product_positioning: strategy.product_positioning,
            body_text: product.description || null,
            status: "draft" as const,
            origin: isPlanDerived ? ("plan" as const) : ("manual" as const),
            weekly_plan_item_id: isPlanDerived ? planItemId : null,
            ...contentTypeWrite,
            ...(domainInput
                ? {
                    domain_input: domainInput,
                    domain_input_version: 1,
                }
                : {}),
            image_url: null,
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

        // NOVO: Garantir vínculo na tabela de itens do plano se vier de um plano
        if (isPlanDerived && planItemId) {
            const { error: linkErr } = await supabase
                .from("weekly_plan_items")
                .update({ campaign_id: currentId })
                .eq("id", planItemId);

            if (linkErr) {
                console.error("Erro ao vincular rascunho ao item do plano:", linkErr);
            }
        }

        return { currentId, storeId: store.id };

    }

    async function regenerateArt() {
        if (!campaignId) return;

        const confirmed = confirm(
            "Esta campanha já possui uma arte gerada. Gerar uma nova irá sobrepor a atual e consumir créditos de IA. Deseja continuar?"
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
            if (data?.ok === false || !response.ok) {
                console.error("[regenerateArt] API Error:", data);
                throw new Error(
                    data?.message ||
                    data?.error ||
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
            "Esta campanha já possui um roteiro de vídeo gerado. Gerar um novo irá sobrepor o atual e consumir créditos de IA. Deseja continuar?"
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
            if (data?.ok === false || !response.ok) {
                console.error("[regenerateReels] API Error:", data);
                throw new Error(
                    data?.message ||
                    data?.error ||
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
                if (genData.ok === false || !genResponse.ok) {
                    console.error("[handleGenerateCampaign] Campaign API Error:", genData);
                    throw new Error(
                        genData.message ||
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
                if (reelsData?.ok === false || !reelsResponse.ok) {
                    console.error("[handleGenerateCampaign] Reels API Error:", reelsData);
                    throw new Error(
                        reelsData.message ||
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
            router.refresh();

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
                // UNIFICAÇÃO: Usando renderização via Canvas no navegador (idêntico à Edição)
                // Evita problemas de segurança/fetch no Edge Runtime do servidor.
                const imageBlob = await renderGraphicToBlob({
                    layout: artPreview.layout || "solid",
                    image_url: artPreview.image_url || "",
                    headline: artPreview.headline,
                    body_text: artPreview.body_text,
                    cta: artPreview.cta,
                    price: artPreview.price,
                    price_label: artPreview.price_label,
                    store: artPreview.store
                });

                const finalStoreId = artPreview.store?.id || storeId;
                const fileName = `stores/${finalStoreId}/campaigns/${campaignId}/art-${Date.now()}.png`;

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

                const publicUrlLegacy = publicUrlData.publicUrl || null;

                const { error } = await supabase
                    .from("campaigns")
                    .update({
                        headline: artPreview.headline,
                        ai_text: artPreview.body_text,
                        ai_cta: artPreview.cta,
                        ai_caption: artPreview.caption,
                        ai_hashtags: artPreview.hashtags,
                        image_url: fileName,
                        status: "approved",
                        post_status: "approved",
                        reels_status: strategy.generate_reels ? "approved" : "none",
                        price:
                            (!artPreview.price || product.type === "message")
                                ? null
                                : typeof artPreview.price === "string"
                                    ? parseFloat(artPreview.price.replace(",", ".")) || 0
                                    : artPreview.price,
                        price_label: artPreview.price_label || null,
                    })
                    .eq("id", campaignId);

                if (error) {
                    throw new Error(
                        "Não conseguimos salvar sua campanha. Código: VND-NC-SAVE-01"
                    );
                }

                await registerApprovedAssetAction({
                    campaignId,
                    storeId: finalStoreId,
                    assetKind: "post_image",
                    storageBucket: "campaign-images",
                    storagePath: fileName,
                    publicUrlLegacy,
                    generationSource: "campaign_approval",
                    visualSnapshot: {
                        layout: artPreview.layout || "solid",
                        headline: artPreview.headline,
                        body_text: artPreview.body_text,
                        cta: artPreview.cta,
                        caption: artPreview.caption,
                        hashtags: artPreview.hashtags,
                        price: artPreview.price,
                        price_label: artPreview.price_label,
                    },
                });
            } else {
                const { error } = await supabase
                    .from("campaigns")
                    .update({
                        status: "approved",
                        post_status: "none",
                        reels_status: "approved",
                        price:
                            (!artPreview.price || product.type === "message")
                                ? null
                                : typeof artPreview.price === "string"
                                    ? parseFloat(artPreview.price.replace(",", ".")) || 0
                                    : artPreview.price,
                        price_label: artPreview.price_label || null,
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
                        product.type === "message"
                            ? null
                            : !artPreview.price 
                                ? null
                                : typeof artPreview.price === "string"
                                    ? parseFloat(artPreview.price.replace(",", ".")) || 0
                                    : artPreview.price,
                    price_label: artPreview.price_label || null,
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
                    image_url: null, // Limpa arte obsoleta ao salvar rascunho de edição
                })
                .eq("id", campaignId);

            if (error) throw error;

            router.refresh();
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
        <main className={`mx-auto max-w-6xl space-y-6 px-4 lg:px-6 py-6 ${(generationState === "generating" || isSaving || isRegenerating) ? "cursor-wait" : ""}`}>
            {generationState === "idle" || generationState === "error" ? (
                <div className="space-y-8">
                    {/* Cabeçalho */}
                    <MotionWrapper delay={0.1}>
                        <NewCampaignHeader />
                    </MotionWrapper>


                    {isPlanLinked && (
                        <MotionWrapper delay={0.15}>
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-medium text-emerald-800">
                                        <strong>Plano Semanal:</strong> esta campanha já veio
                                        com a estratégia herdada do plano e com foco em{" "}
                                        <strong>{planContentLabel}</strong>. Basta preencher o
                                        produto e gerar.
                                    </p>
                                    {searchParams.get("theme") && (
                                        <div className="mt-2 border-t border-emerald-200/50 pt-2">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600/70">
                                                💡 Raciocínio Varejista
                                            </p>
                                            <p className="text-sm italic text-emerald-900 leading-relaxed">
                                                "{searchParams.get("theme")}"
                                            </p>
                                        </div>
                                    )}
                                </div>
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
                                storeId={storeId || undefined}
                                onChange={setProduct}
                                isImageRequired={strategy.generate_post}
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
                                        disabled={!canGenerate || isSaving || isChildEditing || isRegenerating}
                                        className={`relative flex h-14 items-center justify-center gap-3 overflow-hidden rounded-2xl px-8 font-bold text-white transition-all active:scale-95 shadow-lg shadow-emerald-200/50 ${
                                            !canGenerate || isSaving || isChildEditing || isRegenerating
                                                ? "bg-zinc-300 cursor-not-allowed opacity-70"
                                                : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-300/50"
                                        }`}
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            ✨ Gerar Campanha
                                        </span>
                                    </button>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                    <button
                                        onClick={handleCancel}
                                        type="button"
                                        disabled={isSaving || isChildEditing || isRegenerating}
                                        className={`h-11 w-full sm:w-auto px-6 rounded-xl border font-bold transition-all text-sm ${
                                            isSaving || isChildEditing || isRegenerating
                                                ? "border-zinc-100 text-zinc-300 cursor-not-allowed"
                                                : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                                        }`}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveDraft}
                                        type="button"
                                        disabled={!isFormDirty || isSaving || isChildEditing || isRegenerating}
                                        className={`h-11 w-full sm:w-auto rounded-xl px-6 font-bold transition-all text-sm border ${
                                            !isFormDirty || isSaving || isChildEditing || isRegenerating
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
                                        disabled={isSaving || isChildEditing || isRegenerating}
                                        className={`w-full sm:w-auto rounded-xl border border-zinc-900 bg-white px-6 py-2.5 text-sm font-bold shadow-sm transition-all ${
                                            isChildEditing || isSaving || isRegenerating ? "opacity-50 cursor-not-allowed border-zinc-200 text-zinc-400" : "text-zinc-900 hover:bg-zinc-50"
                                        }`}
                                    >
                                        {isSaving ? "Salvando..." : "Salvar rascunho"}
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={isSaving || isChildEditing || isRegenerating}
                                        className={`w-full sm:w-auto rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all ${
                                            isChildEditing || isSaving || isRegenerating ? "bg-zinc-300 cursor-not-allowed shadow-none" : "bg-emerald-600 hover:bg-emerald-700"
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