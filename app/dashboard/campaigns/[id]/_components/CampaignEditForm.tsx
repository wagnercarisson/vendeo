"use client";

import React, { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Campaign } from "@/lib/domain/campaigns/types";
import { Store } from "@/lib/domain/stores/types";
import { formatBRLMask, parseBRLToNumber } from "@/lib/formatters/priceMask";
import { StrategyFormCard } from "../../new/_components/StrategyFormCard";
import { ProductFormCard } from "../../new/_components/ProductFormCard";
import { MotionWrapper } from "@/app/dashboard/_components/MotionWrapper";
import { CampaignFormData, StrategyData } from "../../new/_components/types";
import * as selectors from "@/lib/domain/campaigns/selectors";

export type CampaignSavePayload = {
    product_name: string;
    price: number | null;
    audience: string;
    objective: string;
    product_positioning: string;
    product_image_url: string;
    description?: string;
    content_type: "product" | "service" | "info";
    reels_hook?: string;
    reels_script?: string;
    reels_caption?: string;
    reels_cta?: string;
    reels_hashtags?: string;
};


interface CampaignEditFormProps {
    campaign: Campaign;
    store?: Store | null;
    onSave: (data: CampaignSavePayload) => Promise<void>;
    onCancel: () => void;
    onGenerateArt: (data: CampaignSavePayload) => Promise<void>;
    onGenerateVideo?: (data: CampaignSavePayload) => Promise<void>;
    onApprove?: (data: CampaignSavePayload) => Promise<void>;
    isSaving: boolean;
    isGeneratingArt: boolean;
    isGeneratingVideo?: boolean;
    activeTab?: "art" | "video";
    lockContext?: boolean;
}

export function CampaignEditForm({
    campaign,
    onSave,
    onCancel,
    onGenerateArt,
    onGenerateVideo,
    isSaving,
    isGeneratingArt,
    isGeneratingVideo = false,
    activeTab = "art",
    lockContext = false,
}: CampaignEditFormProps) {
    const lockStrategyFields = selectors.isStrategyLocked(campaign);
    const [formData, setFormData] = useState<CampaignFormData>({
        type: campaign.content_type || "product",
        product_name: campaign.product_name || "",
        price: campaign.price != null ? formatBRLMask(Math.round(campaign.price * 100).toString()) : "",
        description: campaign.body_text || "",
        image_url: campaign.product_image_url || "",
    });




    const [strategyData, setStrategyData] = useState<StrategyData>({
        audience: campaign.audience || "",
        objective: campaign.objective || "",
        product_positioning: campaign.product_positioning || "",
        reasoning: "",
        source: campaign.origin === "plan" ? "ai" : "manual",
        generate_post: activeTab === "video" ? false : true,
        generate_reels: activeTab === "video" ? true : false,
    });

    // Estado inicial para detecção de "Dirty State" (Compara com o que veio do banco)
    const initialData = useMemo(() => ({
        product: {
            product_name: campaign.product_name || "",
            price: campaign.price != null ? formatBRLMask(Math.round(campaign.price * 100).toString()) : "",
            description: campaign.body_text || "",
            image_url: campaign.product_image_url || "",
        },

        strategy: {
            audience: campaign.audience || "",
            objective: campaign.objective || "",
            product_positioning: campaign.product_positioning || "",
        }
    }), [campaign]);

    const isDirty = useMemo(() => {
        return (
            formData.product_name !== initialData.product.product_name ||
            formData.price !== initialData.product.price ||
            formData.description !== initialData.product.description ||
            formData.image_url !== initialData.product.image_url ||
            strategyData.audience !== initialData.strategy.audience ||
            strategyData.objective !== initialData.strategy.objective ||
            strategyData.product_positioning !== initialData.strategy.product_positioning
        );
    }, [formData, strategyData, initialData]);

    const canGenerate = useMemo(() => {
        const hasRequiredImage = !strategyData.generate_post || formData.image_url?.trim().length > 0;

        return (
            formData.product_name.trim().length > 1 &&
            (formData.type === "info" || formData.price.trim().length > 0) &&
            hasRequiredImage &&
            strategyData.audience.trim().length > 0 &&
            strategyData.objective.trim().length > 0 &&
            strategyData.product_positioning.trim().length > 0
        );
    }, [formData, strategyData]);

    const getSubmissionData = (): CampaignSavePayload => ({
        product_name: formData.product_name,
        price: parseBRLToNumber(formData.price),
        audience: strategyData.audience,
        objective: strategyData.objective,
        product_positioning: strategyData.product_positioning,
        product_image_url: formData.image_url,
        description: formData.description,
        content_type: formData.type,
    });


    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSave(getSubmissionData());
            }}
            className="space-y-6"
        >
            <div className="grid gap-6 md:grid-cols-2">
                <MotionWrapper delay={0.1}>
                    <StrategyFormCard
                        value={strategyData}
                        isDisabled={lockStrategyFields}
                        disableCampaignType={true}
                        onChange={setStrategyData}
                    />
                </MotionWrapper>

                <MotionWrapper delay={0.2}>
                    <ProductFormCard
                        value={formData}
                        onChange={setFormData}
                        disableTypeSwitch={lockContext}
                        isImageRequired={strategyData.generate_post}
                    />
                </MotionWrapper>
            </div>

            {/* Ações de Rodapé Centralizadas (Mesmo estilo de Nova Campanha) */}
            <div className="mt-12 space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <div className="mx-auto max-w-lg text-center">
                    <p className="text-sm font-medium text-zinc-500">
                        Clique em gerar para criar arte, copy e reels com os dados atuais.
                    </p>
                    <div className="mt-6 flex flex-col gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (activeTab === "video" && onGenerateVideo) {
                                    onGenerateVideo(getSubmissionData());
                                } else {
                                    onGenerateArt(getSubmissionData());
                                }
                            }}
                            disabled={!canGenerate || isGeneratingArt || isGeneratingVideo || isSaving}
                            className={`relative flex h-14 items-center justify-center gap-3 overflow-hidden rounded-2xl px-8 font-bold text-white transition-all active:scale-95 shadow-lg shadow-emerald-200/50 ${
                                !canGenerate || isGeneratingArt || isGeneratingVideo || isSaving
                                    ? "bg-zinc-300 cursor-not-allowed opacity-70"
                                    : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-300/50"
                            }`}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {(isGeneratingArt || isGeneratingVideo) ? <Loader2 className="h-5 w-5 animate-spin" /> : "✨"}
                                {isGeneratingArt || isGeneratingVideo 
                                    ? "Gerando..." 
                                    : activeTab === "video" 
                                        ? "Gerar Roteiro de Vídeo" 
                                        : "Gerar Arte"}
                            </span>
                        </button>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                            <button
                                onClick={onCancel}
                                type="button"
                                disabled={isSaving || isGeneratingArt || isGeneratingVideo}
                                className={`h-11 w-full sm:w-auto px-6 rounded-xl border font-bold transition-all text-sm ${
                                    isSaving || isGeneratingArt || isGeneratingVideo
                                        ? "border-zinc-100 text-zinc-300 cursor-not-allowed"
                                        : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                                }`}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!isDirty || isSaving || isGeneratingArt || isGeneratingVideo}
                                className={`h-11 w-full sm:w-auto rounded-xl px-6 font-bold transition-all text-sm border ${
                                    !isDirty || isSaving || isGeneratingArt || isGeneratingVideo
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

            {/* Placeholder do Preview (Reforço Visual) */}
            <MotionWrapper delay={0.4} className="rounded-2xl border-2 border-dashed border-zinc-100 py-20 text-center">
                <div className="mx-auto max-w-xs space-y-3">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50">
                        <span className="text-2xl">✨</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-400">
                        O preview atualizado aparecerá aqui após a geração
                    </p>
                </div>
            </MotionWrapper>
        </form>
    );
}