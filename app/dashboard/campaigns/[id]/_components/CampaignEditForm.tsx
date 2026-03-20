"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { Upload, Loader2, Sparkles, Video, Lock } from "lucide-react";
import {
    AUDIENCE_OPTIONS,
    OBJECTIVE_OPTIONS,
    PRODUCT_POSITIONING_OPTIONS
} from "../../new/_components/constants";
import { supabase } from "@/lib/supabase";
import { Campaign } from "@/lib/domain/campaigns/types";
import { Store } from "@/lib/domain/stores/types";
import { formatBRLMask, parseBRLToNumber } from "@/lib/formatters/priceMask";



export type CampaignSavePayload = {
    product_name: string;
    price: number | null;
    audience: string;
    objective: string;
    product_positioning: string;
    product_image_url: string;
    reels_hook?: string;
    reels_script?: string;
    reels_caption?: string;
    reels_cta?: string;
    reels_hashtags?: string;
    description?: string;
};

interface CampaignEditFormProps {
    campaign: Campaign;
    store?: Store | null;
    onSave: (data: CampaignSavePayload) => Promise<void>;
    onCancel: () => void;
    onGenerateArt: (data: CampaignSavePayload) => Promise<void>;
    onGenerateVideo: (data: CampaignSavePayload) => Promise<void>;
    onApprove?: (data: CampaignSavePayload) => Promise<void>;
    isSaving: boolean;
    isGeneratingArt: boolean;
    isGeneratingVideo: boolean;
    activeTab?: "art" | "video";
    lockContext?: boolean;
    lockStrategyFields?: boolean;
}

export function CampaignEditForm({
    campaign,
    store,
    onSave,
    onCancel,
    onGenerateArt,
    onGenerateVideo,
    onApprove,
    isSaving,
    isGeneratingArt,
    isGeneratingVideo,
    activeTab = "art",
    lockContext = false,
    lockStrategyFields = false,
}: CampaignEditFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [localTab, setLocalTab] = useState<"art" | "video">(activeTab);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        setLocalTab(activeTab);
    }, [activeTab]);

    const initialPositioning = useMemo(() => {
        if (campaign.product_positioning) return campaign.product_positioning;
        return store?.brand_positioning || "";
    }, [campaign.product_positioning, store]);

    const [formData, setFormData] = useState({
        product_name: campaign.product_name || "",
        price:
            campaign.price != null
                ? new Intl.NumberFormat("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(campaign.price)
                : "",
        audience: campaign.audience || AUDIENCE_OPTIONS[0]?.value || "",
        objective: campaign.objective || OBJECTIVE_OPTIONS[0]?.value || "",
        product_positioning: initialPositioning || PRODUCT_POSITIONING_OPTIONS[0]?.value || "",
        product_image_url: campaign.product_image_url || "",
        reels_hook: campaign.reels_hook || "",
        reels_script: campaign.reels_script || "",
        reels_caption: campaign.reels_caption || "",
        reels_cta: campaign.reels_cta || "",
        reels_hashtags: campaign.reels_hashtags || "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        
        if (name === "price") {
            const masked = formatBRLMask(value);
            setFormData((prev) => ({ ...prev, [name]: masked }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    const handleFileSelected = async (file: File | null) => {
        if (!file) return;
        try {
            setUploadingImage(true);
            const path = `${campaign.id}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
            const { error: upErr } = await supabase.storage
                .from("campaign-images")
                .upload(path, file);

            if (upErr) throw upErr;

            const { data: pub } = supabase.storage
                .from("campaign-images")
                .getPublicUrl(path);

            setFormData((prev) => ({ ...prev, product_image_url: pub.publicUrl }));
        } catch (err: any) {
            alert(err.message || "Não conseguimos enviar essa imagem.");
        } finally {
            setUploadingImage(false);
        }
    };
    const canGenerate = !!(
        formData.product_name &&
        formData.price !== "" &&
        formData.audience &&
        formData.objective &&
        formData.product_positioning
    );

    const hasContentReady = localTab === "art" 
        ? !!(campaign.image_url || campaign.ai_generated_at || campaign.headline)
        : !!(campaign.reels_generated_at || (formData.reels_hook && formData.reels_script && formData.reels_script.length > 10));

    const canApprove = canGenerate && hasContentReady && campaign.status !== 'approved';

    const getSubmissionData = (): CampaignSavePayload => ({
        ...formData,
        price: parseBRLToNumber(formData.price),
        description: formData.product_positioning,

    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSave(getSubmissionData());
            }}
            className="space-y-6 bg-white rounded-3xl border border-black/5 p-6 shadow-sm"
        >
            <div className="flex items-center justify-between border-b border-black/5 -mx-6 px-6">
                <div className="flex items-center">
                    {lockContext ? (
                        <h2 className="px-5 py-3 text-sm font-bold text-zinc-900 border-b-2 border-zinc-900">
                            {localTab === "art" ? "Editar Arte" : "Editar Roteiro de Vídeo"}
                        </h2>
                    ) : (
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={() => setLocalTab("art")}
                                className={`px-5 py-3 text-sm font-bold ${localTab === "art"
                                        ? "text-zinc-900 border-b-2 border-zinc-900"
                                        : "text-zinc-400"
                                    }`}
                            >
                                Arte
                            </button>
                            <button
                                type="button"
                                onClick={() => setLocalTab("video")}
                                className={`px-5 py-3 text-sm font-bold ${localTab === "video"
                                        ? "text-zinc-900 border-b-2 border-zinc-900"
                                        : "text-zinc-400"
                                    }`}
                            >
                                Vídeo
                            </button>
                        </div>
                    )}

                    {!lockContext && lockStrategyFields && (
                        <div className="ml-4 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-800">
                            <Lock className="h-3.5 w-3.5" />
                            Estratégia herdada
                        </div>
                    )}
                </div>

                {onApprove && hasContentReady && campaign.status !== 'approved' && (
                    <button
                        type="button"
                        onClick={() => onApprove(getSubmissionData())}
                        disabled={isSaving || !canGenerate}
                        className="my-2 h-9 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                        )}
                        Aprovar e salvar
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {localTab === "art" && (
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase text-zinc-500">
                            Foto do Produto
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="group aspect-square w-full rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 cursor-pointer overflow-hidden relative transition-all hover:border-zinc-300 hover:bg-zinc-100/50"
                        >
                            {formData.product_image_url ? (
                                <div className="relative h-full w-full">
                                    <img
                                        src={formData.product_image_url.split("#")[0]}
                                        alt="Prod"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-1 text-white">
                                            <Upload className="h-5 w-5" />
                                            <span className="text-[10px] font-medium text-white">
                                                Trocar imagem
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full grid place-items-center">
                                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                                        <Upload className="h-6 w-6" />
                                        <span className="text-[10px] font-medium">
                                            Subir foto
                                        </span>
                                    </div>
                                </div>
                            )}
                            {uploadingImage && (
                                <div className="absolute inset-0 bg-white/80 grid place-items-center">
                                    <Loader2 className="animate-spin text-emerald-600" />
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
                    </div>
                )}

                <div className={`${localTab === "art" ? "md:col-span-2" : "md:col-span-3"} space-y-4`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="text-[11px] font-bold uppercase text-zinc-500">
                                Nome do Produto
                            </label>
                            <input
                                name="product_name"
                                value={formData.product_name}
                                onChange={handleChange}
                                className="w-full mt-1 border border-zinc-200 rounded-xl px-4 h-11 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all outline-none"
                                placeholder="Ex: Whisky Johnnie Walker"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold uppercase text-zinc-500">
                                Preço (R$)
                            </label>
                            <input
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0,00"
                                className="w-full mt-1 border border-zinc-200 rounded-xl px-4 h-11 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold uppercase text-zinc-500">
                                Público Alvo
                            </label>
                            <select
                                name="audience"
                                value={formData.audience}
                                onChange={handleChange}
                                disabled={lockStrategyFields}
                                className="w-full mt-1 border border-zinc-200 rounded-xl px-4 h-11 bg-white focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all outline-none appearance-none cursor-pointer disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                            >
                                <option value="">Selecione o público</option>
                                {AUDIENCE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold uppercase text-zinc-500">
                                Objetivo da Campanha
                            </label>
                            <select
                                name="objective"
                                value={formData.objective}
                                onChange={handleChange}
                                disabled={lockStrategyFields}
                                className="w-full mt-1 border border-zinc-200 rounded-xl px-4 h-11 bg-white focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all outline-none appearance-none cursor-pointer disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                            >
                                <option value="">Selecione o objetivo</option>
                                {OBJECTIVE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold uppercase text-zinc-500">
                                Posicionamento
                            </label>
                            <select
                                name="product_positioning"
                                value={formData.product_positioning}
                                onChange={handleChange}
                                disabled={lockStrategyFields}
                                className="w-full mt-1 border border-zinc-200 rounded-xl px-4 h-11 bg-white focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all outline-none appearance-none cursor-pointer disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                            >
                                <option value="">Selecione o posicionamento</option>
                                {PRODUCT_POSITIONING_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {localTab === "video" && (
                        <div className="pt-6 border-t border-black/5 space-y-4">
                            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                                Ajuste os dados-base da campanha e gere um novo roteiro quando estiver pronto.
                            </div>

                            <div>
                                <label className="text-[11px] font-bold uppercase text-zinc-500">
                                    Hook (Gancho)
                                </label>
                                <textarea
                                    name="reels_hook"
                                    value={formData.reels_hook}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full mt-1 border border-zinc-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase text-zinc-500">
                                    Roteiro Sugerido
                                </label>
                                <textarea
                                    name="reels_script"
                                    value={formData.reels_script}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full mt-1 border border-zinc-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-6 border-t border-black/5 flex items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="h-11 px-6 rounded-xl border border-zinc-200 font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
                    disabled={isSaving || isGeneratingArt || isGeneratingVideo}
                >
                    Cancelar
                </button>

                <div className="flex items-center gap-3">
                    {localTab === "art" && (
                        <button
                            type="button"
                            onClick={() => onGenerateArt(getSubmissionData())}
                            disabled={!canGenerate || isGeneratingArt || isSaving}
                            className="h-11 px-5 rounded-xl border border-zinc-200 font-bold flex items-center gap-2 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                        >
                            {isGeneratingArt ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                                <Sparkles className="h-4 w-4 text-emerald-500" />
                            )}
                            {isGeneratingArt ? "Gerando..." : "Gerar Arte Nova"}
                        </button>
                    )}

                    {localTab === "video" && (
                        <button
                            type="button"
                            onClick={() => onGenerateVideo(getSubmissionData())}
                            disabled={!canGenerate || isGeneratingVideo || isSaving}
                            className="h-11 px-5 rounded-xl border border-zinc-200 font-bold flex items-center gap-2 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                        >
                            {isGeneratingVideo ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                                <Video className="h-4 w-4 text-violet-500" />
                            )}
                            {isGeneratingVideo ? "Gerando..." : "Gerar Vídeo Novo"}
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={isSaving || isGeneratingArt || isGeneratingVideo}
                        className="h-11 px-6 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? "Salvando..." : "Salvar Rascunho"}
                    </button>
                </div>
            </div>
        </form>
    );
}