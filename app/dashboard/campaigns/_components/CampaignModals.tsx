import React, { useEffect, useState } from "react";
import { X, Copy, Check, Sparkles, Video } from "lucide-react";
import { ReelsPreviewCard } from "../new/_components/ReelsPreviewCard";

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

type ModalProps = {
    campaign: any;
    onClose: () => void;
};

// --- POST MODAL ---
export function PostModal({ campaign, onClose }: ModalProps) {
    const { copiedKey, copy } = useCopy();

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const headline = campaign.headline || campaign.product_name;
    const bodyText = campaign.ai_text || campaign.body_text || "";
    const cta = campaign.ai_cta || campaign.cta || "";
    const caption = campaign.ai_caption || "";
    const hashtags = campaign.ai_hashtags || "";

    const parsedText = typeof campaign.ai_text === 'string' && campaign.ai_text.startsWith('{') 
        ? JSON.parse(campaign.ai_text)
        : null;

    const actualHeadline = parsedText?.headline || headline;
    const actualBody = parsedText?.body || bodyText;
    const actualCta = parsedText?.cta || cta;

    const allText = [actualHeadline, "", actualBody, "", actualCta].filter(Boolean).join("\n");

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">Post com IA</h2>
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
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Arte */}
                        <div className="lg:col-span-5">
                            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Arte Sugerida</h3>
                            <div className="sticky top-6 relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 shadow-lg max-w-[400px] mx-auto aspect-[4/5]">
                                {campaign.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={campaign.image_url} alt="Arte da Campanha" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-zinc-500">Arte da campanha não disponível</div>
                                )}
                            </div>
                        </div>

                        {/* Textos */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-zinc-900">Textos do Post</h3>
                                <button
                                    onClick={() => copy("tudo", allText)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    {copiedKey === "tudo" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                    Copiar Tudo
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-xl border border-black/5 bg-zinc-50 px-4 py-3">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Headline</div>
                                    <div className="mt-1 text-base font-semibold text-zinc-900">{actualHeadline}</div>
                                </div>

                                {actualBody && (
                                    <div className="rounded-xl border border-black/5 bg-white px-4 py-3">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Texto Principal</div>
                                        <div className="mt-1 text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">{actualBody}</div>
                                    </div>
                                )}

                                {actualCta && (
                                    <div className="rounded-xl border border-black/5 bg-white px-4 py-3">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">CTA</div>
                                        <div className="mt-1 text-sm font-bold text-zinc-900 whitespace-pre-wrap">{actualCta}</div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-black/5 grid sm:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-zinc-900">Legenda</h3>
                                        <button
                                            onClick={() => copy("legenda", caption)}
                                            className="text-zinc-400 hover:text-zinc-700 transition"
                                        >
                                            {copiedKey === "legenda" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
                                            className="text-zinc-400 hover:text-zinc-700 transition"
                                        >
                                            {copiedKey === "hashtags" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
        "HOOK:", campaign.reels_hook, "",
        "ROTEIRO:", campaign.reels_script, "",
        "LEGENDA:", campaign.reels_caption, "",
        "HASHTAGS:", campaign.reels_hashtags
    ].filter(Boolean).join("\n");

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Video className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">Roteiro de Reels</h2>
                            <p className="text-sm text-zinc-500">{campaign.product_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => copy("tudo", allText)}
                            className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md mr-2"
                        >
                            {copiedKey === "tudo" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-zinc-500" />}
                            Copiar Script Completo
                        </button>
                        <button 
                            onClick={onClose}
                            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50">
                    <ReelsPreviewCard
                        hook={campaign.reels_hook}
                        script={campaign.reels_script}
                        shotlist={campaign.reels_shotlist}
                        audioSuggestion={campaign.reels_audio_suggestion}
                        durationSeconds={campaign.reels_duration_seconds}
                        onScreenText={campaign.reels_on_screen_text}
                        caption={campaign.reels_caption}
                        cta={campaign.reels_cta}
                        hashtags={campaign.reels_hashtags}
                    />
                </div>
            </div>
        </div>
    );
}
