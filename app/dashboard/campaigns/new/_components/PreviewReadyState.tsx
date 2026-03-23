import { useEffect, useState } from "react";
import { Check, X, Layout, Maximize2, Columns } from "lucide-react";
import type { CampaignPreviewData } from "./types";
import { ReelsPreviewCard } from "./ReelsPreviewCard";
import { formatBRLMask, parseBRLToNumber } from "@/lib/formatters/priceMask";
import { CampaignQuickActions } from "./CampaignQuickActions";

import { CampaignArtViewer } from "@/app/dashboard/campaigns/_components/CampaignArtViewer";

type PreviewReadyStateProps = {
    preview: CampaignPreviewData;
    onUpdatePreview: (next: CampaignPreviewData) => void;
    generate_post: boolean;
    generate_reels: boolean;
    onRegenerateArt?: () => void;
    onRegenerateReels?: () => void;
    isRegenerating?: boolean;
    onEditingChange?: (isEditing: boolean) => void;
};

export function PreviewReadyState({
    preview,
    onUpdatePreview,
    generate_post,
    generate_reels,
    onRegenerateArt,
    onRegenerateReels,
    isRegenerating = false,
    onEditingChange,
}: PreviewReadyStateProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingReels, setIsEditingReels] = useState(false);
    const [editData, setEditData] = useState(preview);
    const [activeLayout, setActiveLayout] = useState<"solid" | "floating" | "split">(preview.layout || "solid");

    useEffect(() => {
        setEditData(preview);
        setActiveLayout(preview.layout || "solid");
    }, [preview]);

    function handleSave() {
        const normalizedPrice = typeof editData.price === "string" 
            ? parseBRLToNumber(editData.price) 
            : editData.price;

            
        onUpdatePreview({ ...editData, price: normalizedPrice, layout: activeLayout });
        setIsEditing(false);
        onEditingChange?.(false);
    }

    function handleCancel() {
        setEditData(preview);
        setActiveLayout(preview.layout || "solid");
        setIsEditing(false);
        onEditingChange?.(false);
    }

    const formatPrice = (p?: number | string) => {
        if (!p) return "";
        const num = typeof p === "string" ? parseFloat(p.replace(",", ".")) : p;
        if (isNaN(num)) return p.toString();
        return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    const formattedPrice = formatPrice(preview.price);

    const formatWhatsApp = (val?: string) => {
        if (!val) return null;
        const cleaned = val.replace(/\D/g, "");
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }
        return val;
    };

    const whatsappDisplay = formatWhatsApp(preview.store?.whatsapp);

    return (
        <div className={`grid gap-6 ${generate_post && generate_reels ? "xl:grid-cols-2" : "max-w-3xl mx-auto"}`}>
            {generate_post && (
                <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm h-fit">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="text-sm font-semibold text-zinc-900">Preview do Post</h2>
                                <div className="flex rounded-lg border border-zinc-100 bg-zinc-50 p-1">
                                    <button
                                        onClick={() => {
                                            setActiveLayout("solid");
                                            onUpdatePreview({ ...preview, layout: "solid" });
                                        }}
                                        className={`p-1 rounded-md transition-all ${activeLayout === "solid" ? "bg-white shadow text-emerald-600" : "text-zinc-400 hover:text-zinc-600"}`}
                                        title="Rodapé Sólido"
                                        type="button"
                                    >
                                        <Layout className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveLayout("floating");
                                            onUpdatePreview({ ...preview, layout: "floating" });
                                        }}
                                        className={`p-1 rounded-md transition-all ${activeLayout === "floating" ? "bg-white shadow text-emerald-600" : "text-zinc-400 hover:text-zinc-600"}`}
                                        title="Card Flutuante"
                                        type="button"
                                    >
                                        <Maximize2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveLayout("split");
                                            onUpdatePreview({ ...preview, layout: "split" });
                                        }}
                                        className={`p-1 rounded-md transition-all ${activeLayout === "split" ? "bg-white shadow text-emerald-600" : "text-zinc-400 hover:text-zinc-600"}`}
                                        title="Divisão Vertical"
                                        type="button"
                                    >
                                        <Columns className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancel}
                                        type="button"
                                        className="flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200"
                                    >
                                        <X className="h-3 w-3" /> Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        type="button"
                                        className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                                    >
                                        <Check className="h-3 w-3" /> Salvar
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 shadow-xl max-w-[400px] mx-auto group">
                            <div className="aspect-[4/5] w-full relative">
                                {!preview.image_url ? (
                                    <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                                        Arte da campanha
                                    </div>
                                ) : (
                                    <CampaignArtViewer
                                        layout={activeLayout}
                                        image_url={preview.image_url}
                                        headline={isEditing ? editData.headline : preview.headline}
                                        body_text={isEditing ? editData.body_text : preview.body_text}
                                        cta={isEditing ? editData.cta : preview.cta}
                                        price={isEditing ? editData.price : preview.price}
                                        store={preview.store}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-zinc-400">Headline</label>
                                        <input
                                            type="text"
                                            value={editData.headline || ""}
                                            onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
                                            className="w-full rounded-lg border border-zinc-200 p-2 text-sm outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-zinc-400">Texto Principal</label>
                                        <textarea
                                            value={editData.body_text || ""}
                                            onChange={(e) => setEditData({ ...editData, body_text: e.target.value })}
                                            rows={2}
                                            className="w-full rounded-lg border border-zinc-200 p-2 text-sm outline-none focus:border-emerald-500 resize-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-zinc-400">Preço</label>
                                        <input
                                            type="text"
                                            value={editData.price || ""}
                                            onChange={(e) => setEditData({ ...editData, price: formatBRLMask(e.target.value) })}
                                            placeholder="Ex: 99,90"
                                            className="w-full rounded-lg border border-zinc-200 p-2 text-sm outline-none focus:border-emerald-500"
                                        />

                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-zinc-400">CTA</label>
                                        <input
                                            type="text"
                                            value={editData.cta || ""}
                                            onChange={(e) => setEditData({ ...editData, cta: e.target.value })}
                                            className="w-full rounded-lg border border-zinc-200 p-2 text-sm outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 text-left">
                                    <h3 className="text-lg font-semibold text-zinc-900 leading-tight">
                                        {preview.headline || "Headline da campanha"}
                                    </h3>
                                    <p className="text-sm leading-6 text-zinc-700">
                                        {preview.body_text || "Texto principal da campanha."}
                                    </p>
                                    <p className="text-sm font-medium text-emerald-700">
                                        {preview.cta || "CTA da campanha"}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left">
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Legenda do Post</p>
                            {isEditing ? (
                                <textarea
                                    value={editData.caption || ""}
                                    onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
                                    rows={4}
                                    className="mt-2 w-full rounded-lg border border-zinc-200 p-2 text-sm outline-none focus:border-emerald-500 resize-none"
                                />
                            ) : (
                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-700">
                                    {preview.caption || "Legenda da campanha"}
                                </p>
                            )}
                            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-500">Hashtags</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.hashtags || ""}
                                    onChange={(e) => setEditData({ ...editData, hashtags: e.target.value })}
                                    className="mt-2 w-full rounded-lg border border-zinc-200 p-2 text-sm outline-none focus:border-emerald-500"
                                />
                            ) : (
                                <p className="mt-2 text-sm leading-6 text-zinc-700">{preview.hashtags || "#oferta"}</p>
                            )}
                        </div>

                        {!isEditing && onRegenerateArt && (
                            <CampaignQuickActions
                                onEdit={() => {
                                    const displayPrice = preview.price?.toString().replace(".", ",") || "";
                                    setEditData({ ...preview, price: displayPrice });
                                    setIsEditing(true);
                                    onEditingChange?.(true);
                                }}
                                onRegenerateArt={onRegenerateArt}
                                onRegenerateReels={onRegenerateReels}
                                generate_reels={generate_reels}
                                isBusy={isRegenerating}
                            />
                        )}
                    </div>
                </section>
            )}

            {generate_reels && (
                <div className="h-fit space-y-4">
                    {isEditingReels ? (
                        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-zinc-900">Editando Roteiro</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditData(preview);
                                            setIsEditingReels(false);
                                            onEditingChange?.(false);
                                        }}
                                        type="button"
                                        className="flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200"
                                    >
                                        <X className="h-3 w-3" /> Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            onUpdatePreview({ ...editData, layout: activeLayout });
                                            setIsEditingReels(false);
                                            onEditingChange?.(false);
                                        }}
                                        type="button"
                                        className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                                    >
                                        <Check className="h-3 w-3" /> Salvar
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-zinc-400">Hook (Gancho Vital)</label>
                                    <textarea
                                        value={editData.reels_hook || ""}
                                        onChange={(e) => setEditData({ ...editData, reels_hook: e.target.value })}
                                        rows={2}
                                        className="w-full rounded-lg border border-zinc-200 p-2 text-sm outline-none focus:border-emerald-500 resize-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-zinc-400">Roteiro Sugerido</label>
                                    <textarea
                                        value={editData.reels_script || ""}
                                        onChange={(e) => setEditData({ ...editData, reels_script: e.target.value })}
                                        rows={6}
                                        className="w-full rounded-lg border border-zinc-200 p-2 text-sm outline-none focus:border-emerald-500 resize-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-zinc-400">Legenda do Reels</label>
                                    <textarea
                                        value={editData.reels_caption || ""}
                                        onChange={(e) => setEditData({ ...editData, reels_caption: e.target.value })}
                                        rows={3}
                                        className="w-full rounded-lg border border-zinc-200 p-2 text-sm outline-none focus:border-emerald-500 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <ReelsPreviewCard
                            hook={preview.reels_hook}
                            script={preview.reels_script}
                            shotlist={preview.reels_shotlist}
                            audio_suggestion={preview.reels_audio_suggestion}
                            duration_seconds={preview.reels_duration_seconds}
                            on_screen_text={preview.reels_on_screen_text}
                            caption={preview.reels_caption}
                            cta={preview.reels_cta}
                            hashtags={preview.reels_hashtags}
                        />
                    )}

                    {!isEditingReels && (
                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditingReels(true);
                                    onEditingChange?.(true);
                                }}
                                disabled={isRegenerating}
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-sm hover:text-emerald-700 hover:border-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-pencil h-4 w-4"
                                >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                </svg>
                                Editar roteiro
                            </button>
                            <button
                                type="button"
                                onClick={onRegenerateReels}
                                disabled={isRegenerating || !onRegenerateReels}
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-sm hover:text-emerald-700 hover:border-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-popcorn h-4 w-4"
                                >
                                    <path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4" />
                                    <path d="M10 22 9 8" />
                                    <path d="m14 22 1-14" />
                                    <path d="M20 8l-2 14H6L4 8z" />
                                </svg>
                                {isRegenerating ? "Gerando reels..." : "Gerar novo reels"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}