"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Sparkles,
    ArrowLeft,
    Video,
    Download,
    Check,
    Copy,
    Image as ImageIcon,
    Printer,
    Calendar,
} from "lucide-react";

import SalesFeedbackInline from "@/components/feedback/SalesFeedbackInline";
import { CampaignEditForm, CampaignSavePayload } from "./CampaignEditForm";
import { OBJECTIVE_OPTIONS } from "../../new/_components/constants";
import { Store } from "@/lib/domain/stores/types";
import { Campaign as CampaignModel, ActiveTab, ViewMode } from "@/lib/domain/campaigns/types";
import { CampaignPreviewData } from "../../new/_components/types";
import { PreviewReadyState } from "../../new/_components/PreviewReadyState";
import { renderCampaignArtToBlob } from "@/app/dashboard/campaigns/_components/renderCampaignArt";
import { mapCampaignToPreviewData } from "@/lib/domain/campaigns/mapper";
import { calculateGlobalStatus } from "@/lib/domain/campaigns/logic";

export type Campaign = CampaignModel & {
    stores?: Store | null;
};

function cx(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(" ");
}

function Field({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="rounded-xl border border-black/5 bg-zinc-50 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                {label}
            </div>
            <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">{value}</div>
        </div>
    );
}

export function CampaignPreviewClient({
    campaign,
    isPlanLinked = false,
}: {
    campaign: Campaign;
    isPlanLinked?: boolean;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const modeParam = searchParams.get("mode");

    const [isSaving, setIsSaving] = useState(false);
    const [pendingSaveData, setPendingSaveData] = useState<CampaignSavePayload | null>(null);
    const [isCloning, setIsCloning] = useState(false);
    const hasAnyReadyContent = 
        campaign.status === "ready" || campaign.status === "approved" || 
        campaign.post_status === "ready" || campaign.reels_status === "ready";

    const [previewData, setPreviewData] = useState<CampaignPreviewData | null>(
        hasAnyReadyContent
            ? mapCampaignToPreviewData(campaign, campaign.stores)
            : null
    );
    const [loadingText, setLoadingText] = useState(false);
    const [loadingReels, setLoadingReels] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [artStatus, setArtStatus] = useState<"idle" | "copying" | "copied" | "saving">("idle");
    const [videoStatus, setVideoStatus] = useState<"idle" | "copied">("idle");
    const [isChildEditing, setIsChildEditing] = useState(false);
    const [isGenerationTriggered, setIsGenerationTriggered] = useState(false);

    const [successToast, setSuccessToast] = useState<string | null>(null);
    const showSuccess = (msg: string) => {
        setSuccessToast(msg);
        setTimeout(() => setSuccessToast(null), 3000);
    };
    const [isReviewDirty, setIsReviewDirty] = useState(false);

    const hasArt = !!(campaign.image_url || campaign.ai_generated_at || previewData?.headline);
    const hasVideo = !!(campaign.reels_script || campaign.reels_generated_at || previewData?.reels_hook);
    const isApproved = campaign.status === "approved";
    const isEmptyDraft = !hasArt && !hasVideo;

    const [activeTab, setActiveTab] = useState<ActiveTab>(
        campaign.campaign_type === "reels" ? "video" : "art"
    );

    const [localPostStatus, setLocalPostStatus] = useState(campaign.post_status);
    const [localReelsStatus, setLocalReelsStatus] = useState(campaign.reels_status);

    useEffect(() => {
        setLocalPostStatus(campaign.post_status);
        setLocalReelsStatus(campaign.reels_status);
    }, [campaign.post_status, campaign.reels_status]);

    const hasAi = hasArt;
    const hasReels = hasVideo;
    const currentTabHasContent = activeTab === "art"
        ? localPostStatus !== "none" && localPostStatus !== "draft"
        : localReelsStatus !== "none" && localReelsStatus !== "draft";

    const [isEditingBase, setIsEditingBase] = useState(
        modeParam === "edit"
    );

    const startEditing = (isGenTrigger: boolean = false) => {
        setIsGenerationTriggered(isGenTrigger);
        setIsEditingBase(true);
    };

    const finalArtUrlClean = (campaign.image_url || "").split("#")[0];
    const heroImageUrlClean = (campaign.image_url || campaign.product_image_url || "").split("#")[0];

    const priceText = useMemo(() => {
        if (campaign.price == null) return null;
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(campaign.price);
    }, [campaign.price]);

    const canGenerate = !!(
        campaign.product_name &&
        campaign.price != null &&
        campaign.audience &&
        campaign.objective
    );

    const isBothReady = (localPostStatus === 'ready' || localPostStatus === 'approved') && 
                       (localReelsStatus === 'ready' || localReelsStatus === 'approved');
    const hasAnyReady = (localPostStatus === 'ready' || localPostStatus === 'approved') || 
                        (localReelsStatus === 'ready' || localReelsStatus === 'approved');

    const isStrategyLocked = isPlanLinked || campaign.origin === "plan";

    // lockContext logic:
    // Case 1: Both ready -> Locked
    // Case 2: One ready AND Gen trigger -> Locked (for consistency)
    // Case 3: One ready AND Base Edit -> Unlocked (for correction)
    const lockContext = isPlanLinked || isBothReady || (hasAnyReady && isGenerationTriggered);

    function buildStrategySafeBaseUpdate(data: CampaignSavePayload) {
        if (isStrategyLocked) {
            return {
                product_name: data.product_name,
                price: data.price,
                product_image_url: data.product_image_url,
                body_text: data.description,
            };
        }

        return {
            product_name: data.product_name,
            price: data.price,
            audience: data.audience,
            objective: data.objective,
            product_positioning: data.product_positioning,
            product_image_url: data.product_image_url,
            body_text: data.description,
            content_type: data.content_type,
        };
    }

    async function executeSaveBaseFields(data: CampaignSavePayload, shouldRegenerate: boolean = false) {
        try {
            setErrorMsg(null);
            setIsSaving(true);
            
            const nextStatus = campaign.status === 'approved' ? 'ready' : (campaign.status || 'draft');

            const payload = {
                ...buildStrategySafeBaseUpdate(data),
                status: nextStatus as "draft" | "ready" | "approved",
            };

            const { error } = await supabase
                .from("campaigns")
                .update(payload)
                .eq("id", campaign.id);

            if (error) throw error;
            
            setPendingSaveData(null);

            if (shouldRegenerate) {
                // Determine what to regenerate based on active statuses
                const genArt = localPostStatus !== "none" && localPostStatus !== "draft";
                const genReels = localReelsStatus !== "none" && localReelsStatus !== "draft";
                
                if (genArt) {
                    await generateText(true, data, true);
                }
                if (genReels) {
                    await generateReels(true, data);
                }
                
                setIsEditingBase(false);
                router.refresh();
                showSuccess("Tudo pronto! Seu projeto foi atualizado com base nas novas informações.");
            } else {
                setIsEditingBase(false);
                router.refresh();
                showSuccess("Informações base da campanha salvas com sucesso!");
            }

        } catch (err: any) {
            setErrorMsg(err.message);
            // Hide modal if hit error
            setPendingSaveData(null);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSaveBaseFields(data: CampaignSavePayload) {
        const hasContent = (localPostStatus !== "none" && localPostStatus !== "draft") || 
                           (localReelsStatus !== "none" && localReelsStatus !== "draft");
        if (hasContent) {
            setPendingSaveData(data);
        } else {
            executeSaveBaseFields(data, false);
        }
    }

    function handleCancelEdit() {
        if (confirm("Deseja cancelar a edição desta campanha? As alterações não salvas serão perdidas.")) {
            router.back();
        }
    }


    async function handleApproveFromEdit(data: CampaignSavePayload) {

        try {
            setErrorMsg(null);
            setIsSaving(true);

            const payload = {
                product_name: data.product_name,
                price: data.price,
                audience: data.audience,
                objective: data.objective,
                product_positioning: data.product_positioning,
                product_image_url: data.product_image_url,
                reels_hook: data.reels_hook,
                reels_script: data.reels_script,
                reels_caption: data.reels_caption,
                reels_cta: data.reels_cta,
                reels_hashtags: data.reels_hashtags,
                content_type: data.content_type,
                status: "approved" as const,
            };

            const { error } = await supabase
                .from("campaigns")
                .update(payload)
                .eq("id", campaign.id);

            if (error) throw error;

            setIsEditingBase(false);
            router.refresh();
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleGenerateFromEdit(type: "art" | "video", data: CampaignSavePayload) {
        try {
            setErrorMsg(null);
            if (type === "art") {
                setLoadingText(true);
                await generateText(true, data, true);
            } else {
                setLoadingReels(true);
                await generateReels(false, data);
            }
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setLoadingText(false);
            setLoadingReels(false);
        }
    }

    async function generateText(
        force = false,
        overrides?: Partial<CampaignSavePayload>,
        isFromEditFlow = false
    ) {
        if (!canGenerate && !overrides) return;
        try {
            setErrorMsg(null);
            setLoadingText(true);

            const { error: updateErr } = await supabase
                .from("campaigns")
                .update(
                    buildStrategySafeBaseUpdate({
                        product_name: overrides?.product_name ?? campaign.product_name ?? "",
                        price: overrides?.price ?? campaign.price ?? null,
                        audience: overrides?.audience ?? campaign.audience ?? "",
                        objective: overrides?.objective ?? campaign.objective ?? "",
                        product_positioning:
                            overrides?.product_positioning ?? campaign.product_positioning ?? "",
                        product_image_url:
                            overrides?.product_image_url ?? campaign.product_image_url ?? "",
                        content_type:
                            overrides?.content_type ?? campaign.content_type ?? "product",
                    })
                )
                .eq("id", campaign.id);

            if (updateErr) throw updateErr;

            const res = await fetch("/api/generate/campaign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaign_id: campaign.id,
                    force,
                    description: overrides?.description,
                    persist: true,
                }),
            });

            const genData = await res.json();
            if (!genData.ok) throw new Error(genData.error);

            const aiOutput = genData.output;
            const rawStore = campaign.stores;

            setPreviewData((prev) => ({
                ...prev,
                image_url: overrides?.product_image_url || campaign.product_image_url || prev?.image_url || "",
                headline:
                    aiOutput?.headline ||
                    overrides?.product_name ||
                    campaign.product_name ||
                    prev?.headline ||
                    "",
                body_text: aiOutput?.text || prev?.body_text || "",
                cta: aiOutput?.cta || prev?.cta || "",
                caption: aiOutput?.caption || prev?.caption || "",
                hashtags: aiOutput?.hashtags || prev?.hashtags || "",
                price: overrides?.price !== undefined ? overrides.price : campaign.price,
                layout: "solid",
                store: rawStore
                    ? {
                        name: rawStore.name,
                        address: `${rawStore.address || ""}${rawStore.neighborhood ? `, ${rawStore.neighborhood}` : ""
                            }`,
                        whatsapp: rawStore.whatsapp || rawStore.phone || "",
                        primary_color: rawStore.primary_color,
                        secondary_color: rawStore.secondary_color,
                        logo_url: rawStore.logo_url,
                    }
                    : prev?.store,
            }));

            setIsCloning(false);
            setActiveTab("art");
            setIsEditingBase(false);
            setLocalPostStatus("ready");
            setIsReviewDirty(false);
            router.refresh();
            showSuccess("Arte criada com inteligência artiificial!");
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setLoadingText(false);
        }
    }

    async function handleApproveReview() {
        if (!previewData) return;

        try {
            setIsSaving(true);
            let finalImageUrl = previewData.image_url;

            if (activeTab === "art") {
                const blob = await renderCampaignArtToBlob({
                    layout: previewData.layout || "solid",
                    image_url: previewData.image_url?.split("#")[0] || "",
                    headline: previewData.headline || "",
                    body_text: previewData.body_text || "",
                    cta: previewData.cta || "",
                    price: previewData.price,
                    store: previewData.store,
                });

                const path = `art-${campaign.id}-${Date.now()}.png`;

                const { error: upErr } = await supabase.storage
                    .from("campaign-images")
                    .upload(path, blob, {
                        contentType: "image/png",
                        upsert: true,
                    });

                if (upErr) throw upErr;

                const { data: pub } = supabase.storage
                    .from("campaign-images")
                    .getPublicUrl(path);

                finalImageUrl = pub.publicUrl;
            }

            const artData = {
                price:
                    typeof previewData.price === "string"
                        ? parseFloat(previewData.price.replace(",", ".")) || 0
                        : previewData.price,
                audience: campaign.audience,
                objective: campaign.objective,
                product_positioning: campaign.product_positioning,
                product_image_url: campaign.product_image_url,
                headline: previewData.headline,
                ai_text: previewData.body_text,
                ai_cta: previewData.cta,
                ai_caption: previewData.caption,
                ai_hashtags: previewData.hashtags,
                image_url: finalImageUrl,
                ai_generated_at: new Date().toISOString(),
                status: "approved" as const,
                post_status: "approved" as const,
            };

            const videoPayload = {
                reels_hook: previewData.reels_hook,
                reels_script: previewData.reels_script,
                reels_shotlist: previewData.reels_shotlist,
                reels_on_screen_text: previewData.reels_on_screen_text,
                reels_audio_suggestion: previewData.reels_audio_suggestion,
                reels_duration_seconds: previewData.reels_duration_seconds,
                reels_caption: previewData.reels_caption,
                reels_cta: previewData.reels_cta,
                reels_hashtags: previewData.reels_hashtags,
                reels_generated_at: new Date().toISOString(),
                status: "approved" as const,
                reels_status: "approved" as const,
            };

            if (activeTab === "video") {
                const newGlobalStatus = calculateGlobalStatus(
                    localPostStatus,
                    "approved",
                    campaign.campaign_type
                );

                const { error: videoErr } = await supabase
                    .from("campaigns")
                    .update({
                        ...videoPayload,
                        status: newGlobalStatus
                    })
                    .eq("id", campaign.id);

                if (videoErr) throw videoErr;
                setLocalReelsStatus("approved");
            } else {
                const newGlobalStatus = calculateGlobalStatus(
                    "approved",
                    localReelsStatus,
                    campaign.campaign_type
                );

                const { error: dbErr } = await supabase
                    .from("campaigns")
                    .update({
                        ...artData,
                        status: newGlobalStatus
                    })
                    .eq("id", campaign.id);

                if (dbErr) throw dbErr;
                setLocalPostStatus("approved");
            }

            setIsEditingBase(false);
            setIsReviewDirty(false);
            router.refresh();
            showSuccess(activeTab === "art" ? "Arte aprovada com sucesso!" : "Roteiro de vídeo aprovado com sucesso!");
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSaveDraftReview() {
        if (!previewData) return;

        try {
            setIsSaving(true);
            setErrorMsg(null);

            const payload = {
                price:
                    typeof previewData.price === "string"
                        ? parseFloat(previewData.price.replace(",", ".")) || 0
                        : previewData.price,
                headline: previewData.headline,
                ai_text: previewData.body_text,
                ai_cta: previewData.cta,
                ai_caption: previewData.caption,
                ai_hashtags: previewData.hashtags,
                reels_hook: previewData.reels_hook,
                reels_script: previewData.reels_script,
                reels_shotlist: previewData.reels_shotlist,
                reels_on_screen_text: previewData.reels_on_screen_text,
                reels_audio_suggestion: previewData.reels_audio_suggestion,
                reels_duration_seconds: previewData.reels_duration_seconds,
                reels_caption: previewData.reels_caption,
                reels_cta: previewData.reels_cta,
                reels_hashtags: previewData.reels_hashtags,
                status: "ready" as const,
            };

            const { error } = await supabase
                .from("campaigns")
                .update(payload)
                .eq("id", campaign.id);

            if (error) throw error;

            router.refresh();
            setIsReviewDirty(false);
            showSuccess("As edições do seu conteúdo foram salvas.");
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsSaving(false);
        }
    }

    async function generateReels(force = false, overrides?: Partial<CampaignSavePayload>) {
        if (!canGenerate && !overrides) return;

        try {
            setErrorMsg(null);
            setLoadingReels(true);

            const { error: updateErr } = await supabase
                .from("campaigns")
                .update(
                    buildStrategySafeBaseUpdate({
                        product_name: overrides?.product_name ?? campaign.product_name ?? "",
                        price: overrides?.price ?? campaign.price ?? null,
                        audience: overrides?.audience ?? campaign.audience ?? "",
                        objective: overrides?.objective ?? campaign.objective ?? "",
                        product_positioning:
                            overrides?.product_positioning ?? campaign.product_positioning ?? "",
                        product_image_url:
                            overrides?.product_image_url ?? campaign.product_image_url ?? "",
                        content_type:
                            overrides?.content_type ?? campaign.content_type ?? "product",
                    })
                )
                .eq("id", campaign.id);

            if (updateErr) throw updateErr;

            const res = await fetch("/api/generate/reels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaign_id: campaign.id,
                    force,
                    persist: true,
                    description: overrides?.description,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || "Erro na geração");
            }

            const genData = await res.json();
            const reels = genData.reels;

            setPreviewData((prev) => ({
                ...prev,
                image_url: overrides?.product_image_url || campaign.product_image_url || prev?.image_url || "",
                headline: overrides?.product_name || campaign.product_name || prev?.headline || "",
                price: overrides?.price !== undefined ? overrides.price : campaign.price,
                reels_hook: reels.hook || "",
                reels_script: reels.script || "",
                reels_shotlist: reels.shotlist || [],
                reels_on_screen_text: reels.on_screen_text || [],
                reels_audio_suggestion: reels.audio_suggestion || "",
                reels_duration_seconds: reels.duration_seconds || 30,
                reels_caption: reels.caption || "",
                reels_cta: reels.cta || "",
                reels_hashtags: reels.hashtags || "",
                store: campaign.stores
                    ? {
                        name: campaign.stores.name,
                        primary_color: campaign.stores.primary_color,
                    }
                    : prev?.store,
            }));

            setIsCloning(false);
            setIsEditingBase(false);
            setActiveTab("video");
            setLocalReelsStatus("ready");
            setIsReviewDirty(false);
            router.refresh();
            showSuccess("Roteiro para Reels redigido pela IA com sucesso!");
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setLoadingReels(false);
        }
    }

    async function handleCopyVideoScript() {
        if (!campaign.reels_script) return;

        const allText = [
            "HOOK:",
            campaign.reels_hook,
            "",
            "ROTEIRO:",
            campaign.reels_script,
            "",
            campaign.reels_duration_seconds
                ? `FOCO DO VÍDEO:\n⏱️ ${campaign.reels_duration_seconds}s${campaign.reels_audio_suggestion
                    ? ` · 🎵 ${campaign.reels_audio_suggestion}`
                    : ""
                }`
                : null,
            "",
            Array.isArray(campaign.reels_on_screen_text) && campaign.reels_on_screen_text.length
                ? `TEXTO NA TELA:\n${campaign.reels_on_screen_text
                    .map((t: string) => `"${t}"`)
                    .join(" · ")}`
                : null,
            "",
            Array.isArray(campaign.reels_shotlist) && campaign.reels_shotlist.length
                ? `CENAS SUGERIDAS:\n${campaign.reels_shotlist
                    .map(
                        (s: any) =>
                            `Cena ${s.scene} [${s.camera}]\nAção: ${s.action}\n"${s.dialogue}"`
                    )
                    .join("\n\n")}`
                : null,
            "",
            "LEGENDA:",
            campaign.reels_caption,
            "",
            "CTA:",
            campaign.reels_cta,
            "",
            "HASHTAGS:",
            campaign.reels_hashtags,
        ]
            .filter((v) => v !== null)
            .join("\n");

        try {
            await navigator.clipboard.writeText(allText);
            setVideoStatus("copied");
            setTimeout(() => setVideoStatus("idle"), 2000);
        } catch (err) {
            console.error("Clipboard error:", err);
        }
    }

    function handlePrintVideo() {
        if (!campaign.reels_hook) return;

        const product_name = campaign.product_name || "Campanha";
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
            <head>
                <title>Roteiro — ${product_name}</title>
                <style>
                    body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; color: #18181b; line-height: 1.6; }
                    h1 { font-size: 18px; border-bottom: 2px solid #18181b; padding-bottom: 8px; margin-bottom: 24px; }
                    section { margin-bottom: 24px; }
                    .label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; margin-bottom: 4px; }
                    .content { white-space: pre-wrap; font-size: 14px; }
                    .scene { border-left: 3px solid #18181b; padding: 8px 12px; margin: 8px 0; font-size: 13px; }
                    .scene-num { font-weight: 700; font-size: 11px; text-transform: uppercase; }
                    @media print { body { margin: 20px; } }
                </style>
            </head>
            <body>
                <h1>Roteiro de Vídeo Curto — ${product_name}</h1>
                ${campaign.reels_hook ? `<section><div class="label">🎯 Hook (Gancho Vital)</div><div class="content" style="font-weight:700; font-style:italic; font-size:16px">${campaign.reels_hook}</div></section>` : ""}
                ${campaign.reels_duration_seconds || campaign.reels_audio_suggestion ? `<section><div class="label">📽️ Foco do Vídeo</div><div class="content">${campaign.reels_duration_seconds ? `⏱️ ${campaign.reels_duration_seconds}s` : ""} ${campaign.reels_audio_suggestion ? `🎵 ${campaign.reels_audio_suggestion}` : ""}</div></section>` : ""}
                ${Array.isArray(campaign.reels_on_screen_text) && campaign.reels_on_screen_text.length ? `<section><div class="label">📝 Texto na Tela</div><div class="content">${campaign.reels_on_screen_text.map((t: string) => `• "${t}"`).join("<br>")}</div></section>` : ""}
                ${campaign.reels_script ? `<section><div class="label">🎬 Roteiro Sugerido</div><div class="content">${campaign.reels_script.replace(/\n/g, "<br>")}</div></section>` : ""}
                ${Array.isArray(campaign.reels_shotlist) && campaign.reels_shotlist.length ? `<section><div class="label">📋 Cenas Sugeridas</div>${campaign.reels_shotlist.map((s: any) => `<div class="scene"><div class="scene-num">Cena ${s.scene} — ${s.camera}</div><div>Ação: ${s.action}</div><div style="color:#52525b;font-style:italic">"${s.dialogue}"</div></div>`).join("")}</section>` : ""}
                ${campaign.reels_caption ? `<section><div class="label">💬 Legenda</div><div class="content">${campaign.reels_caption}</div></section>` : ""}
                ${campaign.reels_cta ? `<section><div class="label">📣 CTA</div><div class="content" style="font-weight:700">${campaign.reels_cta}</div></section>` : ""}
                ${campaign.reels_hashtags ? `<section><div class="label">#️⃣ Hashtags</div><div class="content" style="color:#52525b">${campaign.reels_hashtags}</div></section>` : ""}
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

    async function handleCopyArt() {
        if (!finalArtUrlClean) return;

        setArtStatus("copying");
        try {
            const res = await fetch(finalArtUrlClean);
            const blob = await res.blob();
            const pngBlob = blob.type === "image/png" ? blob : await convertToPng(blob);
            const item = new ClipboardItem({ "image/png": pngBlob });
            await (navigator.clipboard as any).write([item]);
            setArtStatus("copied");
        } catch {
            await navigator.clipboard.writeText(finalArtUrlClean);
            setArtStatus("copied");
        } finally {
            setTimeout(() => setArtStatus("idle"), 1500);
        }
    }

    async function handleDownloadArt() {
        if (!finalArtUrlClean || artStatus === "saving") return;

        try {
            setArtStatus("saving");
            const res = await fetch(finalArtUrlClean);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `arte-${campaign.product_name?.replace(/\s+/g, "-").toLowerCase() || "campanha"
                }.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } finally {
            setArtStatus("idle");
        }
    }

    async function convertToPng(blob: Blob): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0);
                canvas.toBlob((b) => {
                    URL.revokeObjectURL(url);
                    b ? resolve(b) : reject(new Error("canvas toBlob failed"));
                }, "image/png");
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("img load failed"));
            };

            img.src = url;
        });
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    href="/dashboard/campaigns"
                    className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                >
                    <ArrowLeft className="h-4 w-4" /> Voltar
                </Link>

                <div className="flex items-center gap-2">
                    <div
                        className={cx(
                            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium shadow-sm transition",
                            isEditingBase
                                ? "border-black/5 bg-white text-zinc-700"
                                : campaign.status === "approved"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : currentTabHasContent
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-black/5 bg-white text-zinc-700"
                        )}
                    >
                        <Sparkles className="h-4 w-4" />
                        <span>
                            {isEditingBase ? "Editando" :
                              campaign.status === "approved"
                                ? "Aprovada"
                                : currentTabHasContent
                                    ? "Conteúdo por IA"
                                    : "Aguardando geração"}
                        </span>
                    </div>

                    {isPlanLinked && (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 shadow-sm transition">
                            <Calendar className="h-4 w-4" />
                            <span>Estratégia do Plano Semanal</span>
                        </div>
                    )}
                </div>
            </div>

            {errorMsg && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMsg}
                </div>
            )}

            {isEditingBase ? (
                <CampaignEditForm
                    campaign={campaign}
                    store={campaign.stores}
                    onSave={handleSaveBaseFields}
                    onCancel={isEmptyDraft ? () => router.push("/dashboard/campaigns") : () => setIsEditingBase(false)}
                    onGenerateArt={(d) => {
                        setActiveTab("art");
                        return handleGenerateFromEdit("art", d);
                    }}
                    onGenerateVideo={(d) => {
                        setActiveTab("video");
                        return handleGenerateFromEdit("video", d);
                    }}
                    onApprove={handleApproveFromEdit}
                    activeTab={activeTab}
                    lockContext={lockContext}
                    lockStrategyFields={isPlanLinked}
                    isSaving={isSaving}
                    isGeneratingArt={loadingText}
                    isGeneratingVideo={loadingReels}
                />
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:flex-row">
                        <div className="relative h-32 w-32 sm:h-40 sm:w-40 shrink-0 overflow-hidden rounded-2xl border border-black/5 bg-zinc-50">
                            {heroImageUrlClean ? (
                                <img
                                    src={heroImageUrlClean}
                                    alt="Post"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="grid h-full w-full place-items-center">
                                    <ImageIcon className="h-8 w-8 text-zinc-200" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 w-full text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <h2 className="text-2xl font-bold text-zinc-900">
                                    {campaign.product_name}
                                </h2>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                  {isPlanLinked && (
                                      <span className="rounded bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-700 ring-1 ring-inset ring-amber-600/10">
                                          Plano Semanal
                                      </span>
                                  )}
                                  {isApproved && (
                                      <span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                                          Aprovada
                                      </span>
                                  )}
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                                {priceText && (
                                    <span className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-semibold">
                                        {priceText}
                                    </span>
                                )}
                                <span className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-semibold uppercase">
                                    {OBJECTIVE_OPTIONS.find(
                                        (o) => o.value === campaign.objective
                                    )?.label || campaign.objective}
                                </span>
                            </div>
                            <div className="mt-5 flex justify-center sm:justify-start flex-wrap gap-2">
                                <button
                                    onClick={() => startEditing(false)}
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 text-xs font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                                >
                                    Editar Informações Base
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex border-b border-black/5">
                        <button
                            onClick={() => setActiveTab("art")}
                            className={cx(
                                "px-5 py-3 text-sm font-bold transition flex items-center gap-2",
                                activeTab === "art"
                                    ? "border-b-2 border-zinc-900 text-zinc-900"
                                    : "text-zinc-400"
                            )}
                        >
                            <span>Arte</span>
                            {localPostStatus === 'none' || localPostStatus === 'draft' ? null : (
                              <div className={cx(
                                  "w-1.5 h-1.5 rounded-full",
                                  localPostStatus === 'approved' ? "bg-emerald-500" : "bg-amber-400"
                              )} />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("video")}
                            className={cx(
                                "px-5 py-3 text-sm font-bold transition flex items-center gap-2",
                                activeTab === "video"
                                    ? "border-b-2 border-zinc-900 text-zinc-900"
                                    : "text-zinc-400"
                            )}
                        >
                            <span>Vídeo</span>
                            {localReelsStatus === 'none' || localReelsStatus === 'draft' ? null : (
                              <div className={cx(
                                  "w-1.5 h-1.5 rounded-full",
                                  localReelsStatus === 'approved' ? "bg-emerald-500" : "bg-amber-400"
                              )} />
                            )}
                        </button>
                    </div>

                    <div className="mx-auto max-w-3xl">
                        {activeTab === "art" && (
                            localPostStatus === "draft" || localPostStatus === "none" ? (
                                <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-12 text-center">
                                    <Sparkles className="mx-auto mb-4 h-8 w-8 text-zinc-300" />
                                    <p className="mb-6 text-sm text-zinc-500">
                                        Essa campanha não tem arte pronta.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setActiveTab("art");
                                            startEditing();
                                        }}
                                        className="rounded-xl bg-zinc-900 px-8 py-2.5 font-bold text-white transition-all hover:bg-black"
                                    >
                                        Gerar Arte com IA
                                    </button>
                                </div>
                            ) : localPostStatus === "ready" && previewData ? (
                                <div className="space-y-6">
                                  <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:flex-row">
                                      <div>
                                          <h2 className="text-lg font-bold text-amber-900">
                                              Revisão da Arte
                                          </h2>
                                          <p className="max-w-md text-sm text-amber-700/80">
                                              Sua arte foi gerada, revise o conteúdo, ajuste se necessário e salve.
                                          </p>
                                      </div>
                                      <button
                                          onClick={() => { setActiveTab("art"); handleApproveReview(); }}
                                          disabled={isSaving || isChildEditing}
                                          className={`inline-flex h-10 w-full items-center justify-center rounded-xl px-6 text-sm font-bold text-white shadow-sm transition sm:w-auto ${
                                              isChildEditing ? "bg-zinc-300 cursor-not-allowed shadow-none" : "bg-emerald-600 hover:bg-emerald-700"
                                          }`}
                                      >
                                          {isSaving ? "Salvando..." : "Aprovar Arte"}
                                      </button>
                                  </div>
                                  <PreviewReadyState
                                      preview={previewData}
                                      onUpdatePreview={(next) => { setPreviewData(next); setIsReviewDirty(true); }}
                                      generate_post={hasArt}
                                      generate_reels={false}
                                      onRegenerateArt={() => generateText(true)}
                                      onEditingChange={setIsChildEditing}
                                  />
                                  {!isChildEditing && isReviewDirty && (
                                    <div className="flex items-center justify-end animate-in fade-in slide-in-from-bottom-2">
                                        <button
                                            onClick={handleSaveDraftReview}
                                            disabled={isSaving}
                                            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-900 bg-white px-6 text-sm font-bold text-zinc-900 transition hover:bg-zinc-50"
                                        >
                                            {isSaving ? "Salvando..." : "Salvar rascunho"}
                                        </button>
                                    </div>
                                  )}
                                </div>
                            ) : localPostStatus === "approved" ? (
                                <div className="space-y-6">
                                  <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:flex-row">
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-lg font-bold text-emerald-900">
                                                Arte Aprovada
                                            </h2>
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200 text-emerald-800">
                                                <Check className="h-3 w-3" />
                                            </span>
                                          </div>
                                          <p className="max-w-md text-sm text-emerald-800/80">
                                              Esta arte já foi aprovada e está pronta para uso em sua campanha.
                                          </p>
                                      </div>
                                  </div>
                                  <div className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                    <div className="aspect-[4/5] relative rounded-2xl overflow-hidden shadow-lg max-w-[400px] mx-auto border border-zinc-100">
                                        {campaign.image_url ? (
                                            <img
                                                src={finalArtUrlClean}
                                                alt="Arte"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full grid place-items-center bg-zinc-50 text-zinc-300">
                                                <ImageIcon className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <Field label="Legenda" value={campaign.ai_caption} />
                                        <Field
                                            label="Hashtags"
                                            value={campaign.ai_hashtags}
                                        />
                                        <SalesFeedbackInline
                                            contentType="campaign"
                                            campaignId={campaign.id}
                                        />
                                        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                            <button
                                                onClick={handleCopyArt}
                                                disabled={
                                                    !campaign.image_url ||
                                                    artStatus === "copying" ||
                                                    artStatus === "saving"
                                                }
                                                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
                                            >
                                                {artStatus === "copied" ? (
                                                    <><Check className="h-4 w-4 text-emerald-600" /> Copiado!</>
                                                ) : artStatus === "copying" ? (
                                                    <><ImageIcon className="h-4 w-4 animate-pulse" /> Copiando...</>
                                                ) : (
                                                    <><ImageIcon className="h-4 w-4" /> Copiar Arte</>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleDownloadArt}
                                                disabled={
                                                    !campaign.image_url ||
                                                    artStatus === "saving" ||
                                                    artStatus === "copying"
                                                }
                                                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
                                            >
                                                {artStatus === "saving" ? (
                                                    <><Download className="h-4 w-4 animate-bounce" /> Baixando...</>
                                                ) : (
                                                    <><Download className="h-4 w-4" /> Baixar Arte</>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActiveTab("art");
                                                    startEditing(true);
                                                }}
                                                className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-6 text-sm font-bold text-zinc-600 shadow-sm transition hover:bg-zinc-50"
                                            >
                                                Regerar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            ) : null
                        )}

                        {activeTab === "video" && (
                            localReelsStatus === "draft" || localReelsStatus === "none" ? (
                                <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-12 text-center">
                                    <Video className="mx-auto mb-4 h-8 w-8 text-zinc-300" />
                                    <p className="mb-6 text-sm text-zinc-500">
                                        Essa campanha não tem roteiro de vídeo pronto.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setActiveTab("video");
                                            startEditing(true);
                                        }}
                                        className="rounded-xl bg-zinc-900 px-8 py-2.5 font-bold text-white transition-all hover:bg-black"
                                    >
                                        Gerar Roteiro de Vídeo
                                    </button>
                                </div>
                            ) : localReelsStatus === "ready" && previewData ? (
                                <div className="space-y-6">
                                  <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:flex-row">
                                      <div>
                                          <h2 className="text-lg font-bold text-amber-900">
                                              Revisão do Vídeo
                                          </h2>
                                          <p className="max-w-md text-sm text-amber-700/80">
                                              Seu roteiro foi gerado, revise o conteúdo, altere o que precisar e salve.
                                          </p>
                                      </div>
                                      <button
                                          onClick={() => { setActiveTab("video"); handleApproveReview(); }}
                                          disabled={isSaving || isChildEditing}
                                          className={`inline-flex h-10 w-full items-center justify-center rounded-xl px-6 text-sm font-bold text-white shadow-sm transition sm:w-auto ${
                                              isChildEditing ? "bg-zinc-300 cursor-not-allowed shadow-none" : "bg-emerald-600 hover:bg-emerald-700"
                                          }`}
                                      >
                                          {isSaving ? "Salvando..." : "Aprovar Vídeo"}
                                      </button>
                                  </div>
                                  <PreviewReadyState
                                      preview={previewData}
                                      onUpdatePreview={(next) => { setPreviewData(next); setIsReviewDirty(true); }}
                                      generate_post={false}
                                      generate_reels={hasVideo}
                                      onRegenerateReels={() => generateReels(true)}
                                      onEditingChange={setIsChildEditing}
                                  />
                                  {!isChildEditing && isReviewDirty && (
                                    <div className="flex items-center justify-end animate-in fade-in slide-in-from-bottom-2">
                                        <button
                                            onClick={handleSaveDraftReview}
                                            disabled={isSaving}
                                            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-900 bg-white px-6 text-sm font-bold text-zinc-900 transition hover:bg-zinc-50"
                                        >
                                            {isSaving ? "Salvando..." : "Salvar rascunho"}
                                        </button>
                                    </div>
                                  )}
                                </div>
                            ) : localReelsStatus === "approved" ? (
                                <div className="space-y-6">
                                  <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:flex-row">
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-lg font-bold text-emerald-900">
                                                Roteiro Aprovado
                                            </h2>
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200 text-emerald-800">
                                                <Check className="h-3 w-3" />
                                            </span>
                                          </div>
                                          <p className="max-w-md text-sm text-emerald-800/80">
                                              Este roteiro de vídeo já foi aprovado e está pronto para gravação.
                                          </p>
                                      </div>
                                  </div>
                                  <div className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                    <Field label="Hook" value={campaign.reels_hook} />
                                    <Field label="Roteiro" value={campaign.reels_script} />
                                    <SalesFeedbackInline
                                        contentType="reels"
                                        campaignId={campaign.id}
                                    />
                                    <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                        <button
                                            onClick={handleCopyVideoScript}
                                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                                        >
                                            {videoStatus === "copied" ? (
                                                <><Check className="h-4 w-4 text-emerald-600" /> Copiado!</>
                                            ) : (
                                                <><Copy className="h-4 w-4" /> Copiar Roteiro</>
                                            )}
                                        </button>
                                        <button
                                            onClick={handlePrintVideo}
                                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800"
                                        >
                                            <Printer className="h-4 w-4" /> Imprimir
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActiveTab("video");
                                                startEditing(true);
                                            }}
                                            className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-6 text-sm font-bold text-zinc-600 shadow-sm transition hover:bg-zinc-50"
                                        >
                                            Regerar
                                        </button>
                                    </div>
                                </div>
                                </div>
                            ) : null
                        )}
                    </div>
                </div>
            )}

            {pendingSaveData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 shadow-xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-zinc-900 mb-2">Atenção!</h3>
                        <p className="text-sm text-zinc-500 mb-6">
                            Você alterou informações da campanha que já possui conteúdos gerados. 
                            Deseja apenas salvar as configurações ou regerar todos os conteúdos (Arte/Vídeo) usando os novos dados?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => executeSaveBaseFields(pendingSaveData, true)}
                                disabled={isSaving || loadingText || loadingReels}
                                className="w-full flex justify-center items-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-black disabled:opacity-50"
                            >
                                {(isSaving || loadingText || loadingReels) ? "Processando..." : "Salvar e Regerar"}
                            </button>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setPendingSaveData(null)}
                                    disabled={isSaving || loadingText || loadingReels}
                                    className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={() => executeSaveBaseFields(pendingSaveData, false)}
                                    disabled={isSaving || loadingText || loadingReels}
                                    className="flex-1 rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-50"
                                >
                                    {(isSaving && !loadingText && !loadingReels) ? "Salvando..." : "Apenas Salvar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Toast System */}
            {successToast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] rounded-xl bg-emerald-600 px-6 py-3.5 shadow-xl animate-in fade-in slide-in-from-top-6 flex items-center gap-3">
                    <Check className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white tracking-wide">{successToast}</span>
                </div>
            )}
        </div>
    );
}