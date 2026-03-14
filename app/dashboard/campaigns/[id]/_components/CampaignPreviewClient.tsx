"use client"; // Fix ReferenceError v2

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Copy, Check, Sparkles, ArrowLeft, Wand2, Video, Upload, Loader2, Image as ImageIcon, Download, Printer, Pencil, AlertCircle, CheckCircle2 } from "lucide-react";
import SalesFeedbackInline from "@/components/feedback/SalesFeedbackInline";
import { CampaignEditForm } from "./CampaignEditForm";
import { AUDIENCE_OPTIONS, OBJECTIVE_OPTIONS, PRODUCT_POSITIONING_OPTIONS } from "../../new/_components/constants";

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

import { Store } from "@/lib/domain/stores/types";
import { Campaign as CampaignDomain, ContentState, ActiveTab, ViewMode } from "@/lib/domain/campaigns/types";
import { ShortVideoShotScene as ReelsShot } from "@/lib/domain/short-videos/types";
import { getContentState } from "@/lib/domain/campaigns/logic";
import { CampaignPreviewData } from "../../new/_components/types";
import { CampaignArtViewer } from "@/app/dashboard/campaigns/_components/CampaignArtViewer";
import { PreviewReadyState } from "../../new/_components/PreviewReadyState";

/** Campanha com relação de loja incluída (para preview). */
export type Campaign = CampaignDomain & {
    stores?: Store | null;
};

function Field({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="rounded-xl border border-black/5 bg-zinc-50 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                {label}
            </div>
            <div className="mt-1 text-sm text-zinc-900 whitespace-pre-wrap">{value}</div>
        </div>
    );
}

function Empty({ title, hint }: { title: string; hint?: string }) {
    return (
        <div className="rounded-xl border border-dashed border-black/10 bg-zinc-50 px-4 py-4">
            <div className="text-sm font-semibold text-zinc-800">{title}</div>
            {hint ? <div className="mt-1 text-xs text-zinc-500">{hint}</div> : null}
        </div>
    );
}

function EditInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm transition focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
        </div>
    );
}

function EditTextarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm transition focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 resize-none"
            />
        </div>
    );
}

function ContentEmptyState({
    type,
    loading,
    onClick,
}: {
    type: "art" | "video";
    loading: boolean;
    onClick: () => void;
}) {
    const isArt = type === "art";
    const Icon = isArt ? Sparkles : Video;
    const title = isArt ? "Esta campanha ainda não tem arte." : "Esta campanha ainda não tem vídeo.";
    const btnLabel = isArt ? (loading ? "Gerando arte..." : "Gerar arte") : (loading ? "Gerando vídeo..." : "Gerar vídeo");

    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-zinc-50 py-12 px-4 text-center">
            <div className={cx(
                "flex h-12 w-12 items-center justify-center rounded-full mb-4",
                isArt ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600"
            )}>
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900">{isArt ? "Arte não gerada" : "Vídeo não gerado"}</h3>
            <p className="mt-1 mb-6 max-w-sm text-sm text-zinc-500">
                {title}
            </p>
            <button
                type="button"
                onClick={onClick}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md disabled:opacity-50"
            >
                {isArt ? <Wand2 className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                {btnLabel}
            </button>
        </div>
    );
}

function Card({
    title,
    subtitle,
    children,
    right,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    right?: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3 border-b border-black/5 px-5 py-4">
                <div>
                    <div className="text-sm font-semibold text-zinc-900">{title}</div>
                    {subtitle ? <div className="mt-0.5 text-xs text-zinc-500">{subtitle}</div> : null}
                </div>
                {right}
            </div>
            <div className="px-5 py-4">{children}</div>
        </section>
    );
}

function useCopy() {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    async function copy(key: string, text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            window.setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1500);
        } catch { }
    }

    async function copyImage(key: string, url: string) {
        try {
            setCopiedKey(key); 
            // In a better flow we would download and put the Blob in the clipboard 
            // but sharing the direct link is the most reliable way across browsers for now
            await navigator.clipboard.writeText(url);
            window.setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1500);
        } catch {}
    }

    return { copiedKey, copy, copyImage };
}

function isLikelyUnconfiguredRemote(url: string) {
    try {
        const u = new URL(url);
        if (u.hostname === "ibassets.com.br") return true;
        return false;
    } catch {
        return false;
    }
}

function safeToString(v: any) {
    if (v === null || v === undefined) return "";
    return String(v);
}

export function CampaignPreviewClient({ campaign }: { campaign: Campaign }) {
    const router = useRouter();
    const { copiedKey, copy, copyImage } = useCopy();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [activeTab, setActiveTab] = useState<ActiveTab>("art");
    const isFinalized = campaign.status === "ready" || campaign.status === "approved";
    const [viewMode, setViewMode] = useState<ViewMode>(isFinalized ? "view" : "edit");

    const [isSaving, setIsSaving] = useState(false);
    const [previewData, setPreviewData] = useState<CampaignPreviewData | null>(null);

    function startEditing() {
        setViewMode("edit");
    }

    async function handleSaveBaseFields(baseFields: any) {
        try {
            setErrorMsg(null);
            setIsSaving(true);

            // Se baseFields tiver image_url vindo do form (antigo), removemos ou renomeamos
            const dataToUpdate = { ...baseFields };
            
            const { error } = await supabase
                .from("campaigns")
                .update(dataToUpdate)
                .eq("id", campaign.id);

            if (error) throw error;

            setViewMode("view");
            router.refresh();
        } catch (err: any) {
            setErrorMsg(err?.message || "Erro ao salvar dados básicos");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleGenerateFromEdit(type: "art" | "video", baseFields: any) {
        try {
            setErrorMsg(null);
            setIsSaving(true);
            // Salva antes de gerar
            const { error } = await supabase
                .from("campaigns")
                .update(baseFields)
                .eq("id", campaign.id);

            if (error) throw error;
            
            // Dispara a geração passando os dados novos explicitly
            if (type === "art") {
                await generateText(false, baseFields);
            } else {
                await generateReels(false, baseFields);
            }
        } catch (err: any) {
            setErrorMsg(err?.message || `Erro ao salvar e gerar ${type}`);
        } finally {
            setIsSaving(false);
        }
    }

    const [loadingText, setLoadingText] = useState(false);
    const [loadingReels, setLoadingReels] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<"text" | "reels" | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [artStatus, setArtStatus] = useState<"idle" | "copying" | "copied" | "saving">("idle");
    const [reelsScriptCopied, setReelsScriptCopied] = useState(false);
    const uploadTimerRef = useRef<number | null>(null);
    const uploadStartRef = useRef<number>(0);

    function isValidImageFile(file: File) {
        return file.type.startsWith("image/");
    }

    const contentState = useMemo(() => getContentState(campaign), [campaign]);

    // Ajusta aba inicial se só houver vídeo
    React.useEffect(() => {
        if (contentState === "video_only") {
            setActiveTab("video");
        } else {
            setActiveTab("art");
        }
    }, [contentState]);

    const hasAi = contentState === "art_only" || contentState === "art_and_video";
    const hasReels = contentState === "video_only" || contentState === "art_and_video";

    const bestHeadline = campaign.headline || campaign.product_name;
    const bestBody = campaign.ai_text || campaign.body_text || "";
    const bestCTA = campaign.ai_cta || campaign.cta || "";
    const bestCaption = campaign.ai_caption || "";
    const bestHashtags = campaign.ai_hashtags || "";

    const imageUrlClean = (campaign.image_url || campaign.product_image_url || "").split("#")[0];
    const isApproved = campaign.status === "approved";

    async function handleCopyArt() {
        if (!imageUrlClean || artStatus !== "idle") return;
        try {
            setArtStatus("copying");
            const res = await fetch(imageUrlClean);
            const blob = await res.blob();
            let pngBlob = blob;
            if (blob.type !== "image/png") {
                pngBlob = await new Promise<Blob>((resolve, reject) => {
                    const img = new window.Image();
                    const url = URL.createObjectURL(blob);
                    img.onload = () => {
                        const c = document.createElement("canvas");
                        c.width = img.width; c.height = img.height;
                        c.getContext("2d")?.drawImage(img, 0, 0);
                        c.toBlob((b) => { URL.revokeObjectURL(url); b ? resolve(b) : reject(); }, "image/png");
                    };
                    img.onerror = () => { URL.revokeObjectURL(url); reject(); };
                    img.src = url;
                });
            }
            await (navigator.clipboard as any).write([new ClipboardItem({ "image/png": pngBlob })]);
            setArtStatus("copied");
            setTimeout(() => setArtStatus("idle"), 1500);
        } catch {
            // fallback: copia o link
            await navigator.clipboard.writeText(imageUrlClean).catch(() => {});
            setArtStatus("copied");
            setTimeout(() => setArtStatus("idle"), 1500);
        }
    }

    async function handleSaveArt() {
        if (!imageUrlClean || artStatus === "saving") return;
        try {
            setArtStatus("saving");
            const res = await fetch(imageUrlClean);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `arte-${(campaign.product_name || "campanha").replace(/\s+/g, "-").toLowerCase()}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } finally {
            setArtStatus("idle");
        }
    }

    function buildReelsScriptText() {
        const parts: string[] = [];
        if (campaign.reels_hook) parts.push(`HOOK:\n${campaign.reels_hook}`);
        if (campaign.reels_duration_seconds || campaign.reels_audio_suggestion) {
            const f = [campaign.reels_duration_seconds ? `⏱️ ${campaign.reels_duration_seconds}s` : null, campaign.reels_audio_suggestion ? `🎵 ${campaign.reels_audio_suggestion}` : null].filter(Boolean).join(" · ");
            parts.push(`FOCO DO VÍDEO:\n${f}`);
        }
        if (campaign.reels_on_screen_text?.length) parts.push(`TEXTO NA TELA:\n${campaign.reels_on_screen_text.map((t) => `"${t}"`).join(" · ")}`);
        if (campaign.reels_script) parts.push(`ROTEIRO:\n${campaign.reels_script}`);
        if (campaign.reels_shotlist?.length) parts.push(`CENAS:\n${campaign.reels_shotlist.map((s) => `Cena ${s.scene} [${s.camera}]\nAção: ${s.action}\n"${s.dialogue}"`).join("\n\n")}`);
        if (campaign.reels_caption) parts.push(`LEGENDA:\n${campaign.reels_caption}`);
        if (campaign.reels_cta) parts.push(`CTA:\n${campaign.reels_cta}`);
        if (campaign.reels_hashtags) parts.push(`HASHTAGS:\n${campaign.reels_hashtags}`);
        return parts.join("\n\n");
    }

    async function handleCopyReelsScript() {
        await navigator.clipboard.writeText(buildReelsScriptText()).catch(() => {});
        setReelsScriptCopied(true);
        setTimeout(() => setReelsScriptCopied(false), 1500);
    }

    function handlePrintReels() {
        const name = campaign.product_name || "Campanha";
        const w = window.open("", "_blank");
        if (!w) return;
        w.document.write(`<html><head><title>Roteiro — ${name}</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;color:#18181b;line-height:1.6}h1{font-size:18px;border-bottom:2px solid #18181b;padding-bottom:8px;margin-bottom:24px}section{margin-bottom:24px}.label{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#71717a;margin-bottom:4px}.content{white-space:pre-wrap;font-size:14px}.scene{border-left:3px solid #18181b;padding:8px 12px;margin:8px 0;font-size:13px}.scene-num{font-weight:700;font-size:11px;text-transform:uppercase}@media print{body{margin:20px}}</style></head><body><h1>Roteiro de Vídeo Curto — ${name}</h1>${campaign.reels_hook?`<section><div class="label">🎯 Hook (Gancho Vital)</div><div class="content" style="font-weight:700;font-style:italic;font-size:16px">${campaign.reels_hook}</div></section>`:""} ${campaign.reels_duration_seconds||campaign.reels_audio_suggestion?`<section><div class="label">📽️ Foco do Vídeo</div><div class="content">${campaign.reels_duration_seconds?`⏱️ ${campaign.reels_duration_seconds}s`:""} ${campaign.reels_audio_suggestion?`🎵 ${campaign.reels_audio_suggestion}`:""}</div></section>`:""} ${campaign.reels_on_screen_text?.length?`<section><div class="label">📝 Texto na Tela</div><div class="content">${campaign.reels_on_screen_text.map(t=>`• "${t}"`).join("<br>")}</div></section>`:""} ${campaign.reels_script?`<section><div class="label">🎬 Roteiro Sugerido</div><div class="content">${campaign.reels_script.replace(/\n/g,"<br>")}</div></section>`:""} ${campaign.reels_shotlist?.length?`<section><div class="label">📋 Cenas Sugeridas</div>${campaign.reels_shotlist.map(s=>`<div class="scene"><div class="scene-num">Cena ${s.scene} — ${s.camera}</div><div>Ação: ${s.action}</div><div style="color:#52525b;font-style:italic">"${s.dialogue}"</div></div>`).join("")}</section>`:""} ${campaign.reels_caption?`<section><div class="label">💬 Legenda</div><div class="content">${campaign.reels_caption}</div></section>`:""} ${campaign.reels_cta?`<section><div class="label">📣 CTA</div><div class="content" style="font-weight:700">${campaign.reels_cta}</div></section>`:""} ${campaign.reels_hashtags?`<section><div class="label">#️⃣ Hashtags</div><div class="content" style="color:#52525b">${campaign.reels_hashtags}</div></section>`:""}</body></html>`);
        w.document.close();
        w.focus();
        w.print();
    }

    const priceText = useMemo(() => {
        if (campaign.price === null || campaign.price === undefined) return null;
        try {
            return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(campaign.price));
        } catch {
            return String(campaign.price);
        }
    }, [campaign.price]);

    function buildGenerateTextPayload(force: boolean, overrides?: any) {
        return {
            campaign_id: campaign.id,
            force,

            product_name: overrides?.product_name ?? campaign.product_name,
            price: overrides?.price ?? campaign.price,
            audience: overrides?.audience ?? campaign.audience,
            objective: overrides?.objective ?? campaign.objective,

            product_positioning: overrides?.product_positioning ?? campaign.product_positioning,

            store_name: campaign.stores?.name,
            city: campaign.stores?.city,
            state: campaign.stores?.state,
            brand_positioning: campaign.stores?.brand_positioning,
            main_segment: campaign.stores?.main_segment,
            tone_of_voice: campaign.stores?.tone_of_voice,

            whatsapp: campaign.stores?.whatsapp,
            phone: campaign.stores?.phone,
            instagram: campaign.stores?.instagram,

            primary_color: campaign.stores?.primary_color,
            secondary_color: campaign.stores?.secondary_color,
        };
    }

    function buildGenerateReelsPayload(force: boolean, overrides?: any) {
        // Mantém compatível com seu back atual (mesma ideia do texto).
        return {
            campaign_id: campaign.id,
            force,

            product_name: overrides?.product_name ?? campaign.product_name,
            price: overrides?.price ?? campaign.price,
            audience: overrides?.audience ?? campaign.audience,
            objective: overrides?.objective ?? campaign.objective,

            product_positioning: overrides?.product_positioning ?? campaign.product_positioning,

            store_name: campaign.stores?.name,
            city: campaign.stores?.city,
            state: campaign.stores?.state,
            brand_positioning: campaign.stores?.brand_positioning,
            main_segment: campaign.stores?.main_segment,
            tone_of_voice: campaign.stores?.tone_of_voice,

            whatsapp: campaign.stores?.whatsapp,
            phone: campaign.stores?.phone,
            instagram: campaign.stores?.instagram,

            primary_color: campaign.stores?.primary_color,
            secondary_color: campaign.stores?.secondary_color,
        };
    }

    const canGenerate = !!(
        campaign.product_name && 
        campaign.price !== null && 
        campaign.audience && 
        campaign.objective
    );


    async function generateText(force = false, overrides?: any) {
        if (!canGenerate && !overrides) {
            setErrorMsg("Preencha Produto, Preço, Público e Objetivo antes de gerar.");
            return;
        }

        const currentProductImage = overrides?.product_image_url ?? campaign.product_image_url;
        if (!currentProductImage && !force) {
            const proceed = window.confirm("Você não enviou uma foto do produto. A IA tentará gerar uma arte genérica. Deseja continuar?");
            if (!proceed) return;
        }

        try {
            setErrorMsg(null);
            setLoadingText(true);

            const res = await fetch("/api/generate/campaign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildGenerateTextPayload(force, overrides)),
            });

            const genData = await res.json().catch(() => ({}));
            if (genData.ok === false) throw new Error(genData.error || "Erro ao gerar post.");

            // 1) Buscar dados atualizados da campanha e loja
            const { data: updatedCampaign, error: fetchErr } = await supabase
                .from("campaigns")
                .select("*, stores(*)")
                .eq("id", campaign.id)
                .single();

            if (fetchErr || !updatedCampaign) throw new Error("Falha ao recuperar dados da campanha.");

            // 2) Preparar previewData para o Modo de Revisão
            setPreviewData({
                imageUrl: updatedCampaign.product_image_url || updatedCampaign.image_url || "",
                headline: updatedCampaign.headline || updatedCampaign.product_name || "",
                bodyText: updatedCampaign.ai_text || "",
                cta: updatedCampaign.ai_cta || "",
                caption: updatedCampaign.ai_caption || "",
                hashtags: updatedCampaign.ai_hashtags || "",
                price: updatedCampaign.price,
                layout: "solid",
                store: updatedCampaign.stores ? {
                    name: updatedCampaign.stores.name,
                    address: `${updatedCampaign.stores.address || ""}${updatedCampaign.stores.neighborhood ? `, ${updatedCampaign.stores.neighborhood}` : ""}`,
                    whatsapp: updatedCampaign.stores.whatsapp || updatedCampaign.stores.phone || "",
                    primary_color: updatedCampaign.stores.primary_color,
                    secondary_color: updatedCampaign.stores.secondary_color,
                    logo_url: updatedCampaign.stores.logo_url,
                } : undefined,
            });

            // 3) Mudar para modo de revisão
            setViewMode("review");
        } catch (err: any) {
            setErrorMsg(err?.message ?? "Erro ao gerar projeto de texto");
        } finally {
            setLoadingText(false);
        }
    }

    async function handleApproveReview() {
        if (!previewData) return;

        try {
            setIsSaving(true);
            setErrorMsg(null);

            // 1) Gerar a imagem oficial estática via API
            let finalImageUrl = previewData.imageUrl;
            try {
                const ogResponse = await fetch("/api/generate/og-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        layout: previewData.layout || "solid",
                        imageUrl: previewData.imageUrl ? previewData.imageUrl.split('#')[0] : "",
                        headline: previewData.headline,
                        bodyText: previewData.bodyText,
                        cta: previewData.cta,
                        price: previewData.price,
                        storeName: previewData.store?.name,
                        storeAddress: previewData.store?.address,
                        whatsapp: previewData.store?.whatsapp,
                        primaryColor: previewData.store?.primary_color,
                    }),
                });

                if (ogResponse.ok) {
                    const imageBlob = await ogResponse.blob();
                    const fileName = `art-${campaign.id}-${Date.now()}.png`;

                    const { error: uploadErr } = await supabase.storage
                        .from("campaign-images")
                        .upload(fileName, imageBlob, {
                            contentType: "image/png",
                            upsert: true,
                        });

                    if (!uploadErr) {
                        const { data: publicUrlData } = supabase.storage
                            .from("campaign-images")
                            .getPublicUrl(fileName);
                        
                        finalImageUrl = publicUrlData.publicUrl;
                    }
                }
            } catch (ogErr) {
                console.error("Erro ao gerar arte final:", ogErr);
            }

            // 2) Atualizar o banco com dados finais e status 'ready'
            const { error: upErr } = await supabase
                .from("campaigns")
                .update({
                    headline: previewData.headline,
                    ai_text: previewData.bodyText,
                    ai_cta: previewData.cta,
                    ai_caption: previewData.caption,
                    ai_hashtags: previewData.hashtags,
                    image_url: finalImageUrl,
                    status: 'ready'
                })
                .eq("id", campaign.id);

            if (upErr) throw upErr;

            setViewMode("view");
            setPreviewData(null);
            router.refresh();
        } catch (err: any) {
            setErrorMsg(err?.message || "Erro ao aprovar e salvar campanha");
        } finally {
            setIsSaving(false);
        }
    }

    async function generateReels(force = false, overrides?: any) {
        if (!canGenerate && !overrides) {
            setErrorMsg("Preencha Produto, Preço, Público e Objetivo antes de gerar.");
            return;
        }

        try {
            setErrorMsg(null);
            setLoadingReels(true);

            const res = await fetch("/api/generate/reels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildGenerateReelsPayload(force, overrides)),
            });

            if (res.ok === false) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.details ?? err?.error ?? `Erro na API: ${res.status}`);
            }

            await res.json().catch(() => null);
            router.refresh();
        } catch (err: any) {
            setErrorMsg(err?.message ?? "Erro ao gerar/salvar Reels");
        } finally {
            setLoadingReels(false);
        }
    }

    function openFilePicker() {
        if (uploadingImage) return;
        fileInputRef.current?.click();
    }

    function onDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (uploadingImage) return;
        if (!dragOver) setDragOver(true);
    }

    function onDragLeave(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    }

    async function onDrop(e: React.DragEvent) {
        if (uploadingImage) return;
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);

        const file = e.dataTransfer?.files?.[0] ?? null;
        if (!file) return;

        if (!isValidImageFile(file)) {
            setErrorMsg("Envie um arquivo de imagem (JPG, PNG, WEBP…).");
            return;
        }

        await onFileSelected(file);
    }

    async function onFileSelected(file: File | null) {
        if (!file) return;

        const maxMb = 8;
        if (file.size > maxMb * 1024 * 1024) {
            setErrorMsg(`Imagem muito grande. Máximo: ${maxMb}MB.`);
            return;
        }

        try {
            setErrorMsg(null);
            setUploadingImage(true);
            setUploadProgress(0);
            uploadStartRef.current = Date.now();

            if (uploadTimerRef.current) window.clearInterval(uploadTimerRef.current);

            uploadTimerRef.current = window.setInterval(() => {
                setUploadProgress((prev) => {
                    // Fase 1: sobe rápido até 55%
                    if (prev < 55) return prev + 6;

                    // Fase 2: sobe moderado até 80%
                    if (prev < 80) return prev + 2;

                    // Fase 3: bem lento até 90% (não passa disso sem concluir)
                    if (prev < 90) return prev + 1;

                    return prev; // segura em 90%
                });
            }, 180);

            // ✅ agora usa o supabase do app (sessão compartilhada)
            const { data: auth } = await supabase.auth.getUser();
            if (!auth?.user) throw new Error("Você precisa estar logado para enviar imagem.");

            const safeName = file.name.replace(/[^\w.\-]+/g, "_");
            const path = `${campaign.id}/${Date.now()}_${safeName}`;

            const { error: upErr } = await supabase.storage
                .from("campaign-images")
                .upload(path, file, {
                    cacheControl: "3600",
                    upsert: true,
                    contentType: file.type,
                });

            if (upErr) throw new Error(upErr.message);

            const { data: pub } = supabase.storage.from("campaign-images").getPublicUrl(path);
            const publicUrl = pub?.publicUrl;
            if (!publicUrl) throw new Error("Falha ao obter URL pública da imagem.");

            const { error: dbErr } = await supabase
                .from("campaigns")
                .update({ product_image_url: publicUrl })
                .eq("id", campaign.id);

            if (dbErr) throw new Error(dbErr.message);

            const minMs = 1200; // tempo mínimo para a UX não "piscar"
            const elapsed = Date.now() - uploadStartRef.current;
            const wait = Math.max(0, minMs - elapsed);

            window.setTimeout(() => {
                setUploadProgress(100);

                window.setTimeout(() => {
                    setUploadProgress(0);
                }, 450);
            }, wait);

            router.refresh();
        } catch (err: any) {
            setErrorMsg(err?.message || "Erro ao enviar imagem.");
            setUploadProgress(0);
        } finally {
            try {
                // @ts-ignore - t existe no escopo do try; se não existir, ignora
                if (typeof t !== "undefined") window.clearInterval(t);
            } catch { }
            if (uploadTimerRef.current) {
                window.clearInterval(uploadTimerRef.current);
                uploadTimerRef.current = null;
            }
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    href="/dashboard/campaigns"
                    className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para campanhas
                </Link>

                <div className="flex flex-wrap items-center gap-2">
                    <div className={cx(
                        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium shadow-sm transition",
                        hasAi 
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800" 
                            : "border-black/5 bg-white text-zinc-700"
                    )}>
                        <Sparkles className="h-4 w-4" />
                        <span>{hasAi ? "Conteúdo gerado por IA" : "Conteúdo ainda não gerado"}</span>
                    </div>
                </div>
            </div>

            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-zinc-900">
                            Regerar conteúdo
                        </h3>
                        <p className="mt-2 text-sm text-zinc-600">
                            Já existe um conteúdo criado. Esta ação irá gerar uma nova versão e <strong className="text-zinc-900">consumirá créditos adicionais</strong>. Deseja continuar?
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="rounded-xl border border-black/5 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    const action = confirmAction;
                                    setConfirmAction(null);
                                    if (action === "text") generateText(true);
                                    else if (action === "reels") generateReels(true);
                                }}
                                className="rounded-xl border border-transparent bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
                            >
                                Continuar e consumir créditos
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {errorMsg ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMsg}
                </div>
            ) : null}

            {/* HERO SECTION, TABS AND CONTENT - Conditional View/Edit/Review */}
            {viewMode === "review" && previewData ? (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setViewMode("edit")}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900 shadow-sm"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Revisão da Campanha</h2>
                                <p className="text-xs text-zinc-500">Ajuste os textos e o layout antes de finalizar a arte.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setViewMode("edit")}
                                disabled={isSaving}
                                className="rounded-xl border border-black/5 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleApproveReview}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Aprovar e Salvar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-black/5 bg-zinc-50/50 p-6">
                        <PreviewReadyState 
                            preview={previewData}
                            onUpdatePreview={(next) => setPreviewData(next)}
                            generatePost={true}
                            generateReels={false}
                        />
                    </div>
                </div>
            ) : viewMode === "edit" ? (
                <CampaignEditForm 
                    campaign={campaign}
                    store={campaign.stores}
                    onSave={handleSaveBaseFields}
                    onCancel={() => router.push("/dashboard/campaigns")}
                    onGenerateArt={(data) => handleGenerateFromEdit("art", data)}
                    onGenerateVideo={(data) => handleGenerateFromEdit("video", data)}
                    activeTab={activeTab}
                    isSaving={isSaving}
                    isGeneratingArt={loadingText}
                    isGeneratingVideo={loadingReels}
                />
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                        {/* Imagem do Produto */}
                        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl border border-black/5 bg-zinc-50">
                            {(campaign.image_url || campaign.product_image_url) ? (
                                isLikelyUnconfiguredRemote(campaign.image_url || campaign.product_image_url || "") ? (
                                    <img
                                        src={campaign.image_url || campaign.product_image_url || ""}
                                        alt={campaign.product_name || "produto"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Image
                                        src={campaign.image_url || campaign.product_image_url || ""}
                                        alt={campaign.product_name || "produto"}
                                        fill
                                        className="object-cover"
                                        sizes="160px"
                                    />
                                )
                            ) : (
                                <div className="grid h-full w-full place-items-center px-4 text-center">
                                    <ImageIcon className="h-8 w-8 text-zinc-200" />
                                </div>
                            )}
                            
                            {!isApproved && (
                                <button 
                                    onClick={() => setViewMode("edit")}
                                    className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition grid place-items-center text-white text-xs font-bold"
                                >
                                    <Upload className="h-5 w-5 mb-1" />
                                    Alterar foto
                                </button>
                            )}
                        </div>

                        {/* Detalhes do Produto */}
                        <div className="flex flex-1 flex-col justify-center sm:items-start items-center text-center sm:text-left gap-3">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
                                    {campaign.product_name}
                                    
                                    {/* Badge de Estado Inteligente */}
                                    {(() => {
                                        const status = campaign.status;
                                        
                                        if (status === "ready" || status === "approved") return (
                                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10 uppercase tracking-wider">
                                                Finalizado
                                            </span>
                                        );

                                        // Se cair aqui e não for ready/approved, tratamos como rascunho (draft ou active vindo de duplicado)
                                        return (
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-600/10 uppercase tracking-wider">
                                                Rascunho
                                            </span>
                                        );
                                    })()}
                                </h2>
                                <div className="mt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                    {priceText && (
                                        <div className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
                                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                            {priceText}
                                        </div>
                                    )}
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 uppercase tracking-wide">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] text-zinc-500 mr-0.5 lowercase">objetivo:</span>
                                        {OBJECTIVE_OPTIONS.find(o => o.value === campaign.objective)?.label || campaign.objective}
                                    </div>
                                    {campaign.audience && (
                                        <div className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
                                            Público: {AUDIENCE_OPTIONS.find(o => o.value === campaign.audience)?.label || campaign.audience}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Linha de Contexto - View Mode */}
                    <div className="flex items-center gap-2 px-1 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-semibold tracking-tight">
                            Conteúdo pronto para copiar, baixar ou publicar.
                        </span>
                    </div>

                    {/* TABS NAVIGATION */}
                    <div className="flex items-center gap-1 border-b border-black/5">
                        <button
                            onClick={() => setActiveTab("art")}
                            className={cx(
                                "relative px-5 py-3.5 text-sm font-bold transition-all",
                                activeTab === "art" ? "text-zinc-900 bg-zinc-50/50" : "text-zinc-500 hover:text-zinc-900"
                            )}
                        >
                            Arte
                            {activeTab === "art" && (
                                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-zinc-900" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("video")}
                            className={cx(
                                "relative px-5 py-3.5 text-sm font-bold transition-all",
                                activeTab === "video" ? "text-zinc-900 bg-zinc-50/50" : "text-zinc-500 hover:text-zinc-900"
                            )}
                        >
                            Vídeo
                            {activeTab === "video" && (
                                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-zinc-900" />
                            )}
                        </button>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="max-w-3xl mx-auto w-full transition-opacity duration-200">
                        {activeTab === "art" && (
                            <div className="space-y-6">
                                <Card
                                    title="Arte"
                                    subtitle="Preview do post e conteúdo pronto para uso."
                                    right={
                                        /* Badge de status — mantido no topo direito */
                                        isApproved && (
                                            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:scale-[1.02] hover:shadow-sm">
                                                <Check className="h-3 w-3" />
                                                Campanha aprovada
                                            </div>
                                        )
                                    }
                                >
                                    {hasAi ? (
                                        <div className="space-y-6">
                                            {/* 1. Preview (topo) */}
                                            <div id="campanha-arte" className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 shadow-lg max-w-[400px] mx-auto aspect-[4/5]">
                                                {isLikelyUnconfiguredRemote(imageUrlClean) ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={imageUrlClean} alt="Arte da Campanha" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Image src={imageUrlClean} alt="Arte da Campanha" fill className="object-cover" />
                                                )}
                                            </div>

                                            <div className="space-y-6">
                                                {/* 2. Content Fields */}
                                                <div className="space-y-3">
                                                    {bestHeadline && (
                                                        <div className="rounded-xl border border-black/5 bg-zinc-50 px-4 py-3">
                                                            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Headline</div>
                                                            <div className="mt-1.5 text-base font-bold text-zinc-900">{bestHeadline}</div>
                                                        </div>
                                                    )}
                                                    {bestBody && <Field label="Texto Principal" value={bestBody} />}
                                                    {bestCTA && <Field label="CTA" value={bestCTA} />}
                                                    
                                                    <div className="rounded-xl border border-black/5 bg-zinc-50 px-4 py-3">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Legenda</div>
                                                                <button
                                                                    onClick={() => copy("caption", bestCaption)}
                                                                    className="text-zinc-400 hover:text-zinc-700 transition p-1 rounded relative group"
                                                                    type="button"
                                                                    title="Copiar legenda"
                                                                >
                                                                    {copiedKey === "caption" ? (
                                                                        <>
                                                                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                                            <span className="absolute -top-7 right-0 whitespace-nowrap rounded-lg bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg ring-1 ring-white/10">Copiado!</span>
                                                                        </>
                                                                    ) : (
                                                                        <Copy className="h-3.5 w-3.5" />
                                                                    )}
                                                                </button>
                                                        </div>
                                                        <div className="text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">{bestCaption || "Legenda não encontrada"}</div>
                                                    </div>

                                                    {bestHashtags && (
                                                        <div className="rounded-xl border border-black/5 bg-zinc-50 px-4 py-3">
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Hashtags</div>
                                                                <button
                                                                    onClick={() => copy("hashtags", bestHashtags)}
                                                                    className="text-zinc-400 hover:text-zinc-700 transition p-1 rounded relative group"
                                                                    type="button"
                                                                    title="Copiar hashtags"
                                                                >
                                                                    {copiedKey === "hashtags" ? (
                                                                        <>
                                                                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                                            <span className="absolute -top-7 right-0 whitespace-nowrap rounded-lg bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg ring-1 ring-white/10">Copiado!</span>
                                                                        </>
                                                                    ) : (
                                                                        <Copy className="h-3.5 w-3.5" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div className="text-xs text-emerald-700 font-medium whitespace-pre-wrap">{bestHashtags}</div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 3. Feedback Section */}
                                                <SalesFeedbackInline 
                                                    contentType="campaign" 
                                                    campaignId={campaign.id}
                                                    contextLabel="Feedback sobre a Arte Gerada"
                                                />

                                                {/* 4. Actions (bottom) */}
                                                <div className="pt-4 border-t border-black/5 flex flex-wrap items-center justify-between gap-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {imageUrlClean && (
                                                            <>
                                                                <button
                                                                    onClick={handleCopyArt}
                                                                    disabled={artStatus === "copying" || artStatus === "saving"}
                                                                    className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                                                                    type="button"
                                                                >
                                                                    {artStatus === "copied"
                                                                        ? <><Check className="h-4 w-4 text-emerald-600" /> ✓ Copiado</>
                                                                        : artStatus === "copying"
                                                                        ? <><ImageIcon className="h-4 w-4 animate-pulse" /> Copiando...</>
                                                                        : <><ImageIcon className="h-4 w-4" /> Copiar arte</>}
                                                                </button>
                                                                <button
                                                                    onClick={handleSaveArt}
                                                                    disabled={artStatus === "saving" || artStatus === "copying"}
                                                                    className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                                                                    type="button"
                                                                >
                                                                    {artStatus === "saving"
                                                                        ? <><Download className="h-4 w-4 animate-bounce" /> Baixando...</>
                                                                        : <><Download className="h-4 w-4" /> Baixar arte</>}
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => copy("post", [bestHeadline, "", bestBody, "", bestCTA, "", bestCaption, bestHashtags].filter((l, i, a) => l !== "" || (i > 0 && a[i-1] !== "")).join("\n").trim())}
                                                            className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md hover:bg-zinc-800 disabled:opacity-50"
                                                            type="button"
                                                            disabled={!bestBody && !bestCTA}
                                                        >
                                                            {copiedKey === "post" ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4" />}
                                                            {copiedKey === "post" ? "✓ Copiado" : "Copiar conteúdo"}
                                                        </button>
                                                        
                                                        <button
                                                            onClick={startEditing}
                                                            className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md"
                                                            type="button"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                            Editar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <ContentEmptyState
                                            type="art"
                                            loading={loadingText}
                                            onClick={() => generateText(false)}
                                        />
                                    )}
                                </Card>
                            </div>
                        )}

                        {activeTab === "video" && (
                            <div className="space-y-6">
                                <Card 
                                    title="Vídeo" 
                                    subtitle="Hook + roteiro (quando gerado)."
                                    right={
                                        /* Badge de status — mantido no topo direito */
                                        isApproved && (
                                            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                <Check className="h-3 w-3" />
                                                Campanha aprovada
                                            </div>
                                        )
                                    }
                                >
                                    {hasReels || campaign.reels_hook || campaign.reels_script ? (
                                        <div className="space-y-6">
                                            {/* 1. Content Fields */}
                                            <div className="space-y-3">
                                                {campaign.reels_hook ? (
                                                    <Field label="Hook" value={safeToString(campaign.reels_hook)} />
                                                ) : (
                                                    <Empty title="Hook ainda não gerado" hint='Dados básicos incompletos ou geração pendente.' />
                                                )}

                                                {campaign.reels_duration_seconds || campaign.reels_audio_suggestion ? (
                                                    <div className="rounded-xl border border-black/5 bg-zinc-50 px-4 py-3">
                                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Foco do Vídeo</div>
                                                        <div className="flex flex-wrap gap-2 text-sm text-zinc-700">
                                                            {campaign.reels_duration_seconds && (
                                                                <span className="px-2 py-0.5 bg-zinc-100 rounded text-xs font-medium">⏱️ {campaign.reels_duration_seconds}s</span>
                                                            )}
                                                            {campaign.reels_audio_suggestion && (
                                                                <span className="px-2 py-0.5 bg-zinc-100 rounded text-xs font-medium">🎵 {campaign.reels_audio_suggestion}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : null}

                                                {campaign.reels_on_screen_text?.length ? (
                                                    <div className="rounded-xl border border-black/5 bg-zinc-50 px-4 py-3">
                                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">Texto na Tela</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(campaign.reels_on_screen_text as string[]).map((t, i) => (
                                                                <span key={i} className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase italic tracking-tighter">"{t}"</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}

                                                {campaign.reels_script ? (
                                                    <Field label="Roteiro" value={safeToString(campaign.reels_script)} />
                                                ) : (
                                                    <Empty title="Roteiro ainda não gerado" hint='Dados básicos incompletos ou geração pendente.' />
                                                )}

                                                {campaign.reels_shotlist?.length ? (
                                                    <div className="rounded-xl border border-black/5 bg-zinc-50 px-4 py-3">
                                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">Cenas Sugeridas</div>
                                                        <div className="space-y-2">
                                                            {campaign.reels_shotlist.map((item, idx) => (
                                                                <div key={idx} className="rounded-xl border border-zinc-200 bg-white p-3 flex gap-3">
                                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">{item.scene}</div>
                                                                    <div className="space-y-0.5">
                                                                        <div className="text-[10px] font-bold uppercase text-emerald-600 tracking-wide">{item.camera}</div>
                                                                        <p className="text-xs text-zinc-800"><span className="font-semibold">Ação:</span> {item.action}</p>
                                                                        <p className="text-xs italic text-zinc-500">"{item.dialogue}"</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}

                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <Field label="Legenda (vídeo)" value={safeToString(campaign.reels_caption)} />
                                                    <Field label="CTA (vídeo)" value={safeToString(campaign.reels_cta)} />
                                                </div>

                                                <Field label="Hashtags (vídeo)" value={safeToString(campaign.reels_hashtags)} />
                                            </div>

                                            {/* 2. Feedback Section */}
                                            <SalesFeedbackInline 
                                                contentType="reels" 
                                                campaignId={campaign.id}
                                                contextLabel="Feedback sobre o Vídeo (Reels)"
                                            />

                                            {/* 3. Actions (bottom) */}
                                            <div className="pt-4 border-t border-black/5 flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        onClick={handleCopyReelsScript}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md"
                                                        type="button"
                                                    >
                                                        {reelsScriptCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                                        {reelsScriptCopied ? "✓ Copiado" : "Copiar roteiro"}
                                                    </button>
                                                    <button
                                                        onClick={handlePrintReels}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md hover:bg-zinc-800"
                                                        type="button"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                        Imprimir
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={startEditing}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md"
                                                    type="button"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    Editar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <ContentEmptyState
                                            type="video"
                                            loading={loadingReels}
                                            onClick={() => generateReels(false)}
                                        />
                                    )}
                                </Card>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}