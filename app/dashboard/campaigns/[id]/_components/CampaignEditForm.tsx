"use client";

import React, { useState, useRef, useMemo } from "react";
import { Upload, Loader2, X, Check, Sparkles, Video, Info } from "lucide-react";
import { 
    AUDIENCE_OPTIONS, 
    OBJECTIVE_OPTIONS, 
    PRODUCT_POSITIONING_OPTIONS 
} from "../../new/_components/constants";
import { supabase } from "@/lib/supabase";

interface CampaignEditFormProps {
    campaign: any;
    store?: any;
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
    onGenerateArt: (data: any) => Promise<void>;
    onGenerateVideo: (data: any) => Promise<void>;
    isSaving: boolean;
    isGeneratingArt: boolean;
    isGeneratingVideo: boolean;
    activeTab?: "art" | "video";
}

function cx(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}

export function CampaignEditForm({ 
    campaign, 
    store, 
    onSave, 
    onCancel, 
    onGenerateArt,
    onGenerateVideo,
    isSaving,
    isGeneratingArt,
    isGeneratingVideo,
    activeTab = "art"
}: CampaignEditFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [localTab, setLocalTab] = useState<"art" | "video">(activeTab);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    // Fallback logic for product_positioning
    const initialPositioning = useMemo(() => {
        if (campaign.product_positioning) return campaign.product_positioning;
        
        const storeBrandPos = store?.brand_positioning;
        if (storeBrandPos) {
            const isValid = PRODUCT_POSITIONING_OPTIONS.some(opt => opt.value === storeBrandPos);
            if (isValid) return storeBrandPos;
        }
        return "";
    }, [campaign.product_positioning, store?.brand_positioning]);

    const [formData, setFormData] = useState({
        product_name: campaign.product_name || "",
        price: campaign.price !== null ? String(campaign.price) : "",
        audience: campaign.audience || "",
        objective: campaign.objective || "",
        product_positioning: initialPositioning,
        product_image_url: campaign.product_image_url || "",
        reels_hook: campaign.reels_hook || "",
        reels_script: campaign.reels_script || "",
        reels_caption: campaign.reels_caption || "",
        reels_cta: campaign.reels_cta || "",
        reels_hashtags: campaign.reels_hashtags || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelected = async (file: File | null) => {
        if (!file) return;

        const maxMb = 8;
        if (file.size > maxMb * 1024 * 1024) {
            alert(`Imagem muito grande. Máximo: ${maxMb}MB.`);
            return;
        }

        try {
            setUploadingImage(true);
            setUploadProgress(0);

            const safeName = file.name.replace(/[^\w.\-]+/g, "_");
            const path = `${campaign.id}/${Date.now()}_${safeName}`;

            const { error: upErr } = await supabase.storage
                .from("campaign-images")
                .upload(path, file, {
                    cacheControl: "3600",
                    upsert: true,
                    contentType: file.type,
                });

            if (upErr) throw upErr;

            const { data: pub } = supabase.storage.from("campaign-images").getPublicUrl(path);
            const publicUrl = pub?.publicUrl;
            if (!publicUrl) throw new Error("Falha ao obter URL pública da imagem.");

            setFormData(prev => ({ ...prev, product_image_url: publicUrl }));
            setUploadProgress(100);
        } catch (err: any) {
            alert(err?.message || "Erro ao enviar imagem.");
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const canGenerate = !!(
        formData.product_name.trim() && 
        formData.price.trim() !== "" && 
        formData.audience && 
        formData.objective
    );

    const getSubmissionData = () => {
        return {
            ...formData,
            price: formData.price.trim() === "" ? null : parseFloat(formData.price.replace(",", ".")) || 0
        };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(getSubmissionData());
    };

    const handleGenerateArt = () => {
        if (!canGenerate) return;
        onGenerateArt(getSubmissionData());
    };

    const handleGenerateVideo = () => {
        if (!canGenerate) return;
        onGenerateVideo(getSubmissionData());
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-3xl border border-black/5 p-6 shadow-sm">
            <div className="flex items-center gap-1 border-b border-black/5 -mx-6 px-6">
                <button
                    type="button"
                    onClick={() => setLocalTab("art")}
                    className={cx(
                        "relative px-4 py-3 text-sm font-bold transition-all",
                        localTab === "art" ? "text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    Arte
                </button>
                <button
                    type="button"
                    onClick={() => setLocalTab("video")}
                    className={cx(
                        "relative px-4 py-3 text-sm font-bold transition-all",
                        localTab === "video" ? "text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    Vídeo (Reels)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Coluna da Imagem */}
                <div className="md:col-span-1 space-y-3">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                        Foto base do produto
                    </label>
                    <div 
                        className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 transition hover:bg-zinc-100 cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {formData.product_image_url ? (
                            <>
                                <img 
                                    src={formData.product_image_url} 
                                    alt="Preview" 
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
                                    <div className="text-center text-white">
                                        <Upload className="mx-auto h-6 w-6 mb-1" />
                                        <span className="text-xs font-bold">Trocar imagem</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full w-full grid place-items-center p-4">
                                <div className="text-center">
                                    <Upload className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
                                    <p className="text-xs font-medium text-zinc-500">Clique para enviar foto</p>
                                </div>
                            </div>
                        )}

                        {uploadingImage && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 grid place-items-center">
                                <div className="text-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-zinc-900 mx-auto mb-2" />
                                    <span className="text-[10px] font-bold text-zinc-600">Enviando...</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
                    />
                    <p className="text-[10px] text-zinc-400 px-1">
                        Dica: Use uma foto nítida e com fundo simples para melhores resultados.
                    </p>
                </div>

                {/* Coluna dos Dados */}
                <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                                Nome do Produto *
                            </label>
                            <input
                                type="text"
                                name="product_name"
                                value={formData.product_name}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Chocoleite 1L"
                                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm transition focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                                Preço (R$) *
                            </label>
                            <input
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                placeholder="0,00"
                                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm transition focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                                Posicionamento
                            </label>
                            <select
                                name="product_positioning"
                                value={formData.product_positioning}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm transition focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 appearance-none"
                            >
                                <option value="">Selecione um estilo...</option>
                                {PRODUCT_POSITIONING_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                                Público-alvo *
                            </label>
                            <select
                                name="audience"
                                value={formData.audience}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm transition focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 appearance-none"
                            >
                                <option value="">Selecione o público...</option>
                                {AUDIENCE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                                Objetivo *
                            </label>
                            <select
                                name="objective"
                                value={formData.objective}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm transition focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 appearance-none"
                            >
                                <option value="">Selecione o objetivo...</option>
                                {OBJECTIVE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {localTab === "video" && (
                        <div className="mt-6 border-t border-black/5 pt-6 space-y-4">
                            <h3 className="text-sm font-bold text-zinc-900">Roteiro e Conteúdo do Vídeo</h3>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Hook (Gancho)</label>
                                    <textarea
                                        name="reels_hook"
                                        value={formData.reels_hook}
                                        onChange={(e: any) => handleChange(e)}
                                        rows={2}
                                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm transition focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Roteiro Completo</label>
                                    <textarea
                                        name="reels_script"
                                        value={formData.reels_script}
                                        onChange={(e: any) => handleChange(e)}
                                        rows={5}
                                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm transition focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Legenda (Vídeo)</label>
                                        <textarea
                                            name="reels_caption"
                                            value={formData.reels_caption}
                                            onChange={(e: any) => handleChange(e)}
                                            rows={3}
                                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm transition focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">CTA (Chamada)</label>
                                            <input
                                                type="text"
                                                name="reels_cta"
                                                value={formData.reels_cta}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm transition focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Hashtags</label>
                                            <input
                                                type="text"
                                                name="reels_hashtags"
                                                value={formData.reels_hashtags}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm transition focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t border-black/5 flex flex-wrap items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving || isGeneratingArt || isGeneratingVideo}
                    className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 hover:scale-[1.02] disabled:opacity-50"
                >
                    <X className="h-4 w-4" />
                    Cancelar
                </button>
                
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={handleGenerateArt}
                        disabled={isSaving || isGeneratingArt || isGeneratingVideo || !canGenerate}
                        className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 hover:scale-[1.02] disabled:opacity-50"
                    >
                        {isGeneratingArt ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4" />
                        )}
                        Gerar Arte
                    </button>

                    <button
                        type="button"
                        onClick={handleGenerateVideo}
                        disabled={isSaving || isGeneratingArt || isGeneratingVideo || !canGenerate}
                        className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 hover:scale-[1.02] disabled:opacity-50"
                    >
                        {isGeneratingVideo ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Video className="h-4 w-4" />
                        )}
                        Gerar Vídeo
                    </button>

                    <button
                        type="submit"
                        disabled={isSaving || isGeneratingArt || isGeneratingVideo || uploadingImage}
                        className="flex items-center gap-2 rounded-xl border border-transparent bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 hover:scale-[1.02] disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                Salvar Alterações
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
