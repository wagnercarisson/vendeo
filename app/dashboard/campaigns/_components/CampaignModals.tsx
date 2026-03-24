import React, { useEffect, useState } from "react";
import { X, Copy, Check, Sparkles, Video, Download, Image as ImageIcon, Printer } from "lucide-react";
import { ReelsPreviewCard } from "../new/_components/ReelsPreviewCard";
import { SecureImage } from "@/components/storage/SecureImage";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCampaignImageSignedUrl } from "@/lib/supabase/storage-utils";

function useCopy() {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    async function copy(key: string, text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            window.setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1500);
        } catch {}
    }

    return { copiedKey, copy };
}

import { Campaign } from "@/lib/domain/campaigns/types";

type ModalProps = {
    campaign: Campaign;
    onClose: () => void;
};

// --- POST MODAL ---
export function PostModal({ campaign, onClose }: ModalProps) {
    const { copiedKey, copy } = useCopy();
    const [artStatus, setArtStatus] = useState<"idle" | "copying" | "copied" | "saving">("idle");

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const parsedText = typeof campaign.ai_text === "string" && campaign.ai_text.startsWith("{")
        ? (() => { try { return JSON.parse(campaign.ai_text); } catch { return null; } })()
        : null;

    const headline  = parsedText?.headline  || campaign.headline  || campaign.product_name;
    const body_text = parsedText?.body      || campaign.ai_text    || campaign.body_text || "";
    const cta       = parsedText?.cta       || campaign.ai_cta     || campaign.cta || "";
    const caption   = campaign.ai_caption    || "";
    const hashtags  = campaign.ai_hashtags   || "";
    const image_url = campaign.image_url     || "";

    // "Copiar Tudo" inclui headline + body + cta + legenda + hashtags
    const allText = [headline, "", body_text, "", cta, "", caption, hashtags]
        .filter((l) => l !== undefined && l !== "")
        .join("\n");

    // Copiar imagem para área de transferência
    async function handleCopyArt() {
        if (!image_url || artStatus !== "idle") return;
        try {
            setArtStatus("copying");
            const supabase = createSupabaseBrowserClient();
            const resolvedUrl = await getCampaignImageSignedUrl(supabase, image_url);
            const res = await fetch(resolvedUrl);
            const blob = await res.blob();
            const pngBlob = blob.type === "image/png" ? blob : await convertToPng(blob);
            await (navigator.clipboard as any).write([
                new ClipboardItem({ "image/png": pngBlob }),
            ]);
            setArtStatus("copied");
            setTimeout(() => setArtStatus("idle"), 2000);
        } catch {
            // Fallback: copia o link da imagem
            await navigator.clipboard.writeText(image_url);
            setArtStatus("copied");
            setTimeout(() => setArtStatus("idle"), 2000);
        }
    }

    // Salvar imagem no computador
    async function handleSaveArt() {
        if (!image_url || artStatus === "saving") return;
        try {
            setArtStatus("saving");
            const supabase = createSupabaseBrowserClient();
            const resolvedUrl = await getCampaignImageSignedUrl(supabase, image_url);
            const res = await fetch(resolvedUrl);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `arte-${campaign.product_name?.replace(/\s+/g, "-").toLowerCase() || "campanha"}.png`;
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
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("img load failed")); };
            img.src = url;
        });
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">Arte com IA</h2>
                            <p className="text-sm text-zinc-500">{campaign.product_name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid lg:grid-cols-12 gap-10">
                        {/* Arte */}
                        <div className="lg:col-span-5">
                            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Arte Aprovada</h3>
                            <div className="sticky top-6">
                                <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 shadow-lg max-w-[400px] mx-auto aspect-[4/5]">
                                    {image_url ? (
                                        <SecureImage 
                                            src={image_url} 
                                            alt="Arte da Campanha" 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-zinc-500">Arte não disponível</div>
                                    )}
                                </div>

                                {/* Botões de arte */}
                                {image_url && (
                                    <div className="mt-4 flex gap-3 max-w-[400px] mx-auto">
                                        <button
                                            onClick={handleCopyArt}
                                            disabled={artStatus === "copying" || artStatus === "saving"}
                                            className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
                                            type="button"
                                        >
                                            {artStatus === "copied"
                                                ? <><Check className="h-4 w-4 text-emerald-600" /> Copiada!</>
                                                : artStatus === "copying"
                                                ? <><ImageIcon className="h-4 w-4 animate-pulse" /> Copiando...</>
                                                : <><ImageIcon className="h-4 w-4" /> Copiar Arte</>
                                            }
                                        </button>
                                        <button
                                            onClick={handleSaveArt}
                                            disabled={artStatus === "saving" || artStatus === "copying"}
                                            className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
                                            type="button"
                                        >
                                            {artStatus === "saving"
                                                ? <><Download className="h-4 w-4 animate-bounce" /> Baixando...</>
                                                : <><Download className="h-4 w-4" /> Baixar Arte</>
                                            }
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Textos */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-zinc-900">Textos do Post</h3>
                                <button
                                    onClick={() => copy("tudo", allText)}
                                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-black/5 bg-white px-4 text-xs font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                                >
                                    {copiedKey === "tudo" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                    Copiar Tudo
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-xl border border-black/5 bg-zinc-50 px-4 py-3">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Headline</div>
                                    <div className="mt-1 text-base font-semibold text-zinc-900">{headline}</div>
                                </div>

                                {body_text && (
                                    <div className="rounded-xl border border-black/5 bg-white px-4 py-3">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Texto Principal</div>
                                        <div className="mt-1 text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">{body_text}</div>
                                    </div>
                                )}

                                {cta && (
                                    <div className="rounded-xl border border-black/5 bg-white px-4 py-3">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">CTA</div>
                                        <div className="mt-1 text-sm font-bold text-zinc-900">{cta}</div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-black/5 grid sm:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-zinc-900">Legenda</h3>
                                        <button
                                            onClick={() => copy("legenda", caption)}
                                            title="copiar legenda"
                                            className="text-zinc-400 hover:text-zinc-700 transition"
                                        >
                                            {copiedKey === "legenda" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <div className="rounded-xl border border-black/5 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">
                                        {caption || "Nenhuma legenda gerada."}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-zinc-900">Hashtags</h3>
                                        <button
                                            onClick={() => copy("hashtags", hashtags)}
                                            title="copiar hashtags"
                                            className="text-zinc-400 hover:text-zinc-700 transition"
                                        >
                                            {copiedKey === "hashtags" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <div className="rounded-xl border border-black/5 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 whitespace-pre-wrap">
                                        {hashtags || "#hashtags"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- REELS MODAL ---
export function ReelsModal({ campaign, onClose }: ModalProps) {
    const { copiedKey, copy } = useCopy();

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const allText = [
        "HOOK:",        campaign.reels_hook,      "",
        "ROTEIRO:",     campaign.reels_script,    "",
        campaign.reels_duration_seconds ? `FOCO DO VÍDEO:\n⏱️ ${campaign.reels_duration_seconds}s${campaign.reels_audio_suggestion ? ` · 🎵 ${campaign.reels_audio_suggestion}` : ""}` : null, "",
        Array.isArray(campaign.reels_on_screen_text) && campaign.reels_on_screen_text.length ? `TEXTO NA TELA:\n${campaign.reels_on_screen_text.map((t: string) => `"${t}"`).join(" · ")}` : null, "",
        Array.isArray(campaign.reels_shotlist) && campaign.reels_shotlist.length ? `CENAS SUGERIDAS:\n${campaign.reels_shotlist.map((s: any) => `Cena ${s.scene} [${s.camera}]\nAção: ${s.action}\n"${s.dialogue}"`).join("\n\n")}` : null, "",
        "LEGENDA:",     campaign.reels_caption,   "",
        "CTA:",         campaign.reels_cta,       "",
        "HASHTAGS:",    campaign.reels_hashtags,
    ].filter(Boolean).join("\n");

    function handlePrint() {
        const product_name = campaign.product_name || "Campanha";
        const lines: string[] = [
            `ROTEIRO DE VÍDEO CURTO — ${product_name}`,
            "=" .repeat(50),
            "",
        ];
        if (campaign.reels_hook) lines.push(`🎯 HOOK (Gancho Vital)\n${campaign.reels_hook}\n`);
        if (campaign.reels_duration_seconds || campaign.reels_audio_suggestion) {
            const parts = [];
            if (campaign.reels_duration_seconds) parts.push(`⏱️ ${campaign.reels_duration_seconds}s`);
            if (campaign.reels_audio_suggestion) parts.push(`🎵 ${campaign.reels_audio_suggestion}`);
            lines.push(`📽️ FOCO DO VÍDEO\n${parts.join(" · ")}\n`);
        }
        if (Array.isArray(campaign.reels_on_screen_text) && campaign.reels_on_screen_text.length) {
            lines.push(`📝 TEXTO NA TELA\n${campaign.reels_on_screen_text.map((t: string) => `• "${t}"`).join("\n")}\n`);
        }
        if (campaign.reels_script) lines.push(`🎬 ROTEIRO SUGERIDO\n${campaign.reels_script}\n`);
        if (Array.isArray(campaign.reels_shotlist) && campaign.reels_shotlist.length) {
            lines.push(`📋 CENAS SUGERIDAS`);
            campaign.reels_shotlist.forEach((s: any) => {
                lines.push(`  Cena ${s.scene} [${s.camera}]\n  Ação: ${s.action}\n  Fala: "${s.dialogue}"\n`);
            });
        }
        if (campaign.reels_caption) lines.push(`💬 LEGENDA\n${campaign.reels_caption}\n`);
        if (campaign.reels_cta) lines.push(`📣 CTA\n${campaign.reels_cta}\n`);
        if (campaign.reels_hashtags) lines.push(`#️⃣ HASHTAGS\n${campaign.reels_hashtags}\n`);

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

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Video className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">Roteiro de Vídeo Curto</h2>
                            <p className="text-sm text-zinc-500">{campaign.product_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => copy("tudo", allText)}
                            className="inline-flex h-11 items-center gap-2 rounded-xl border border-black/5 bg-white px-4 text-xs font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                        >
                            {copiedKey === "tudo" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            Copiar Tudo
                        </button>
                        <button
                            onClick={handlePrint}
                            className="inline-flex h-11 items-center gap-2 rounded-xl bg-zinc-900 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800"
                        >
                            <Printer className="h-4 w-4 text-indigo-400" />
                            Imprimir Roteiro
                        </button>
                        <button
                            onClick={onClose}
                            className="ml-2 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-zinc-50/50">
                    <ReelsPreviewCard
                        hook={campaign.reels_hook}
                        script={campaign.reels_script}
                        shotlist={campaign.reels_shotlist as any}
                        audio_suggestion={campaign.reels_audio_suggestion}
                        duration_seconds={campaign.reels_duration_seconds}
                        on_screen_text={campaign.reels_on_screen_text}
                        caption={campaign.reels_caption}
                        cta={campaign.reels_cta}
                        hashtags={campaign.reels_hashtags}
                    />
                </div>
            </div>
        </div>
    );
}
