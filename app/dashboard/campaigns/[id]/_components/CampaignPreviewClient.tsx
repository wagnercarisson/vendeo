"use client";

import React, { useMemo, useState } from "react";
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
    const [isCloning, setIsCloning] = useState(false);
    const [previewData, setPreviewData] = useState<CampaignPreviewData | null>(
        campaign.status === "ready"
            ? mapCampaignToPreviewData(campaign, campaign.stores)
            : null
    );
    const [loadingText, setLoadingText] = useState(false);
    const [loadingReels, setLoadingReels] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [artStatus, setArtStatus] = useState<"idle" | "copying" | "copied" | "saving">("idle");
    const [videoStatus, setVideoStatus] = useState<"idle" | "copied">("idle");
    const [isChildEditing, setIsChildEditing] = useState(false);

    const hasArt = !!(campaign.image_url || campaign.ai_generated_at || previewData?.headline);
    const hasVideo = !!(campaign.reels_script || campaign.reels_generated_at || previewData?.reels_hook);
    const isApproved = campaign.status === "approved";
    const isEmptyDraft = !hasArt && !hasVideo;

    const [activeTab, setActiveTab] = useState<ActiveTab>(
        campaign.image_url || campaign.ai_generated_at ? "art" : (campaign.reels_script || campaign.reels_generated_at ? "video" : "art")
    );

    const [viewMode, setViewMode] = useState<ViewMode>(
        modeParam === "edit"
            ? "edit"
            : campaign.status === "ready" && !( !campaign.image_url && !campaign.ai_generated_at && !campaign.reels_script && !campaign.reels_generated_at)
                ? "review"
                : "view"
    );

    const startEditing = () => setViewMode("edit");

    const hasAi = hasArt;
    const hasReels = hasVideo;
    const currentTabHasContent = activeTab === "art" ? hasAi : hasReels;

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

    const isStrategyLocked = isPlanLinked || campaign.origin === "plan";

    function buildStrategySafeBaseUpdate(data: CampaignSavePayload) {
        if (isStrategyLocked) {
            return {
                product_name: data.product_name,
                price: data.price,
                product_image_url: data.product_image_url,
            };
        }

        return {
            product_name: data.product_name,
            price: data.price,
            audience: data.audience,
            objective: data.objective,
            product_positioning: data.product_positioning,
            product_image_url: data.product_image_url,
        };
    }

    async function handleSaveBaseFields(data: CampaignSavePayload) {
        try {
            setErrorMsg(null);
            setIsSaving(true);

            const hasExistingArt = !!(campaign.image_url || campaign.ai_generated_at);
            const hasExistingVideo = !!(campaign.reels_script || campaign.reels_generated_at);

            const isEditingArt = activeTab === "art";
            const isEditingVideo = activeTab === "video";

            const nextHasArt = isEditingArt ? false : hasExistingArt;
            const nextHasVideo = isEditingVideo ? false : hasExistingVideo;

            const nextStatus = campaign.status === 'approved' ? 'ready' : (campaign.status || 'draft');

            const baseUpdate = {
                ...buildStrategySafeBaseUpdate(data),
                status: nextStatus as "draft" | "ready" | "approved",
            };

            const payload = {
                ...buildStrategySafeBaseUpdate(data),
                status: nextStatus as "draft" | "ready" | "approved",
            };

            const { error } = await supabase
                .from("campaigns")
                .update(payload)
                .eq("id", campaign.id);

            if (error) throw error;

            router.refresh();
            setViewMode("view");
            // Nota: mantemos o previewData para que a transição para View/Review seja suave
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsSaving(false);
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
                status: "approved" as const,
            };

            const { error } = await supabase
                .from("campaigns")
                .update(payload)
                .eq("id", campaign.id);

            if (error) throw error;

            setViewMode("view");
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

            setPreviewData({
                image_url: overrides?.product_image_url || campaign.product_image_url || "",
                headline:
                    aiOutput?.headline ||
                    overrides?.product_name ||
                    campaign.product_name ||
                    "",
                body_text: aiOutput?.text || "",
                cta: aiOutput?.cta || "",
                caption: campaign.ai_caption || "",
                hashtags: campaign.ai_hashtags || "",
                price:
                    overrides?.price !== undefined ? overrides.price : campaign.price,
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
                    : undefined,
            });

            setIsCloning(false);
            setActiveTab("art");
            setViewMode("review");
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
            };

            if (activeTab === "video") {
                const { error: videoErr } = await supabase
                    .from("campaigns")
                    .update(videoPayload)
                    .eq("id", campaign.id);

                if (videoErr) throw videoErr;
            } else {
                const { error: dbErr } = await supabase
                    .from("campaigns")
                    .update(artData)
                    .eq("id", campaign.id);

                if (dbErr) throw dbErr;
            }

            setViewMode("view");
            router.refresh();
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
            // Removido o redirecionamento para o dashboard para manter o usuário no contexto
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

            if (!res.ok) throw new Error("Erro na geração");

            const genData = await res.json();
            const reels = genData.reels;

            setPreviewData({
                image_url: overrides?.product_image_url || campaign.product_image_url || "",
                headline: overrides?.product_name || campaign.product_name || "",
                price:
                    overrides?.price !== undefined ? overrides.price : campaign.price,
                reels_hook: campaign.reels_hook,
                reels_script: campaign.reels_script,
                reels_shotlist: reels.shotlist,
                reels_on_screen_text: reels.on_screen_text,
                reels_audio_suggestion: reels.audio_suggestion,
                reels_duration_seconds: reels.duration_seconds,
                reels_cta: reels.cta,
                reels_hashtags: reels.hashtags,
                store: campaign.stores
                    ? {
                        name: campaign.stores.name,
                        primary_color: campaign.stores.primary_color,
                    }
                    : undefined,
            });

            setIsCloning(false);
            setViewMode("review");
            setActiveTab("video");
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
                            viewMode === "review"
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : currentTabHasContent
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-black/5 bg-white text-zinc-700"
                        )}
                    >
                        <Sparkles className="h-4 w-4" />
                        <span>
                            {viewMode === "review"
                                ? "Aguardando aprovação"
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

            {viewMode === "review" && previewData ? (
                <div className="space-y-6">
                    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:flex-row">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">
                                Revisão da Campanha
                            </h2>
                            <p className="max-w-md text-sm text-zinc-500">
                                Finalize a sua campanha. Edite, gere novo conteúdo,
                                aprove e salve a nova campanha para postar e vender!
                            </p>
                        </div>
                        <button
                            onClick={handleApproveReview}
                            disabled={isSaving || isChildEditing}
                            className={`inline-flex h-10 w-full items-center justify-center rounded-xl px-6 text-sm font-bold text-white shadow-sm transition sm:w-auto ${
                                isChildEditing ? "bg-zinc-300 cursor-not-allowed shadow-none" : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                        >
                            {isSaving ? "Salvando..." : "Aprovar e salvar"}
                        </button>
                    </div>

                    <PreviewReadyState
                        preview={previewData}
                        onUpdatePreview={setPreviewData}
                        generate_post={hasArt}
                        generate_reels={hasVideo}
                        onRegenerateArt={() => generateText(true)}
                        onRegenerateReels={() => generateReels(true)}
                        onEditingChange={setIsChildEditing}
                    />

                    {!isChildEditing && (
                        <div className="flex items-center justify-between pt-4">
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-6 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50"
                            >
                                Cancelar
                            </button>

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
            ) : viewMode === "edit" ? (
                <CampaignEditForm
                    campaign={campaign}
                    store={campaign.stores}
                    onSave={handleSaveBaseFields}
                    onCancel={() => setViewMode("view")}
                    onGenerateArt={(d) => handleGenerateFromEdit("art", d)}
                    onGenerateVideo={(d) => handleGenerateFromEdit("video", d)}
                    onApprove={handleApproveFromEdit}
                    activeTab={activeTab}
                    lockContext={true}
                    lockStrategyFields={isPlanLinked}
                    isSaving={isSaving}
                    isGeneratingArt={loadingText}
                    isGeneratingVideo={loadingReels}
                />
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:flex-row">
                        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl border border-black/5 bg-zinc-50">
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

                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-zinc-900">
                                    {campaign.product_name}
                                </h2>
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

                            <div className="mt-2 flex flex-wrap gap-2">
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
                        </div>
                    </div>

                    {isEmptyDraft ? (
                        <CampaignEditForm
                            campaign={campaign}
                            store={campaign.stores}
                            onSave={handleSaveBaseFields}
                            onCancel={() => router.push("/dashboard/campaigns")}
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
                            lockContext={false}
                            lockStrategyFields={isPlanLinked}
                            isSaving={isSaving}
                            isGeneratingArt={loadingText}
                            isGeneratingVideo={loadingReels}
                        />
                    ) : (
                        <>
                            <div className="flex border-b border-black/5">
                                <button
                                    onClick={() => setActiveTab("art")}
                                    className={cx(
                                        "px-5 py-3 text-sm font-bold transition",
                                        activeTab === "art"
                                            ? "border-b-2 border-zinc-900 text-zinc-900"
                                            : "text-zinc-400"
                                    )}
                                >
                                    Arte
                                </button>
                                <button
                                    onClick={() => setActiveTab("video")}
                                    className={cx(
                                        "px-5 py-3 text-sm font-bold transition",
                                        activeTab === "video"
                                            ? "border-b-2 border-zinc-900 text-zinc-900"
                                            : "text-zinc-400"
                                    )}
                                >
                                    Vídeo
                                </button>
                            </div>

                            <div className="mx-auto max-w-3xl">
                                {activeTab === "art" &&
                                    (hasAi ? (
                                        <div className="space-y-6 rounded-3xl border border-black/5 bg-white p-6">
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
                                                            <>
                                                                <Check className="h-4 w-4 text-emerald-600" />{" "}
                                                                Copiado!
                                                            </>
                                                        ) : artStatus === "copying" ? (
                                                            <>
                                                                <ImageIcon className="h-4 w-4 animate-pulse" />{" "}
                                                                Copiando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ImageIcon className="h-4 w-4" />{" "}
                                                                Copiar Arte
                                                            </>
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
                                                            <>
                                                                <Download className="h-4 w-4 animate-bounce" />{" "}
                                                                Baixando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Download className="h-4 w-4" />{" "}
                                                                Baixar Arte
                                                            </>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={startEditing}
                                                        className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-6 text-sm font-bold text-zinc-600 shadow-sm transition hover:bg-zinc-50"
                                                    >
                                                        Editar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-3xl border border-dashed bg-zinc-50 p-12 text-center">
                                            <Sparkles className="mx-auto mb-4 h-8 w-8 text-zinc-300" />
                                            <p className="mb-6 text-sm text-zinc-500">
                                                Essa campanha não tem arte pronta, você pode gerar uma arte nova agora!
                                            </p>
                                            <button
                                                onClick={() => {
                                                    startEditing();
                                                    setActiveTab("art");
                                                }}
                                                className="rounded-xl bg-zinc-900 px-8 py-2.5 font-bold text-white transition-all hover:bg-black"
                                            >
                                                Gerar Conteúdo
                                            </button>
                                        </div>
                                    ))}

                                {activeTab === "video" &&
                                    (hasReels ? (
                                        <div className="space-y-6 rounded-3xl border border-black/5 bg-white p-6">
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
                                                        <>
                                                            <Check className="h-4 w-4 text-emerald-600" />{" "}
                                                            Copiado!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-4 w-4" />{" "}
                                                            Copiar Roteiro
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={handlePrintVideo}
                                                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800"
                                                >
                                                    <Printer className="h-4 w-4" /> Imprimir Roteiro
                                                </button>

                                                <button
                                                    onClick={startEditing}
                                                    className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-6 text-sm font-bold text-zinc-600 shadow-sm transition hover:bg-zinc-50"
                                                >
                                                    Editar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-3xl border border-dashed bg-zinc-50 p-12 text-center">
                                            <Video className="mx-auto mb-4 h-8 w-8 text-zinc-300" />
                                            <p className="mb-6 text-sm text-zinc-500">
                                                Essa campanha não tem roteiro de vídeo pronto, você pode gerar um novo agora!
                                            </p>
                                            <button
                                                onClick={() => {
                                                    startEditing();
                                                    setActiveTab("video");
                                                }}
                                                className="rounded-xl bg-zinc-900 px-8 py-2.5 font-bold text-white transition-all hover:bg-black"
                                            >
                                                Gerar Roteiro
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}