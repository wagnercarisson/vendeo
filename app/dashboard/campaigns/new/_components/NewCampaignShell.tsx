"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { NewCampaignHeader } from "./NewCampaignHeader";
import { ProductFormCard } from "./ProductFormCard";
import { StrategyFormCard } from "./StrategyFormCard";
import { GenerateCampaignCard } from "./GenerateCampaignCard";
import { CampaignPreviewPanel } from "./CampaignPreviewPanel";
import { MotionWrapper } from "@/app/dashboard/_components/MotionWrapper";
import type {
    CampaignGenerationState,
    CampaignPreviewData,
    CampaignFormData,
    StrategyData,
} from "./types";

const INITIAL_CAMPAIGN: CampaignFormData = {
    type: "product",
    productName: "",
    description: "",
    price: "",
    imageUrl: "",
};

const INITIAL_STRATEGY: StrategyData = {
    audience: "",
    objective: "",
    productPositioning: "",
    reasoning: "",
    source: null,
    generatePost: true,
    generateReels: false,
};

export function NewCampaignShell() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [product, setProduct] = useState<CampaignFormData>(INITIAL_CAMPAIGN);
    const [strategy, setStrategy] = useState<StrategyData>(INITIAL_STRATEGY);
    
    // Pre-filling effect
    useEffect(() => {
        const typeParam = searchParams.get("type");
        const objectiveParam = searchParams.get("objective");
        const audienceParam = searchParams.get("audience");
        const positioningParam = searchParams.get("positioning");

        if (typeParam || objectiveParam || audienceParam || positioningParam) {
            if (typeParam) {
                setProduct(prev => ({ 
                    ...prev, 
                    type: (typeParam === "product" || typeParam === "service" || typeParam === "info") 
                        ? (typeParam as any) 
                        : prev.type 
                }));
            }
            
            setStrategy(prev => ({
                ...prev,
                objective: objectiveParam || prev.objective,
                audience: audienceParam || prev.audience,
                productPositioning: positioningParam || prev.productPositioning,
                reasoning: "Configurado automaticamente com base na sugestão escolhida.",
                source: "manual",
            }));
        }

        const planItemIdParam = searchParams.get("plan_item_id");
        const themeParam = searchParams.get("theme");
        const generatePostParam = searchParams.get("generatePost");
        const generateReelsParam = searchParams.get("generateReels");

        if (planItemIdParam) {
            setStrategy(prev => ({
                ...prev,
                // Preserva os params vindos da URL do plano, ou no pior caso cai pro prev/theme
                objective: objectiveParam || themeParam || prev.objective,
                audience: audienceParam || prev.audience,
                productPositioning: positioningParam || prev.productPositioning,
                reasoning: "Diretriz automática vinda do Plano Semanal.",
                source: "ai",
                generatePost: generatePostParam === "true",
                generateReels: generateReelsParam === "true",
            }));
        }
    }, [searchParams]);

    const [generationState, setGenerationState] = useState<CampaignGenerationState>("idle");
    const [preview, setPreview] = useState<CampaignPreviewData | null>(null);
    const [campaignId, setCampaignId] = useState<string | null>(null);

    const canGenerate = useMemo(() => {
        const hasBasicInfo = product.productName.trim().length > 1;
        const hasRequiredPrice = product.type === "info" || product.price.trim().length > 0;
        const hasGenerationType = strategy.generatePost || strategy.generateReels;
        
        return (
            hasBasicInfo &&
            hasRequiredPrice &&
            hasGenerationType &&
            strategy.audience.trim().length > 0 &&
            strategy.objective.trim().length > 0
        );
    }, [product, strategy]);

    async function handleGenerateCampaign() {
        try {
            // Confirmar se já existe conteúdo gerado (uso comedido)
            if (preview && !confirm("Você já possui uma campanha gerada. Deseja gerar uma nova? (Isso consumirá créditos de IA)")) {
                return;
            }

            setGenerationState("generating");

            const { data: auth } = await supabase.auth.getUser();
            if (!auth.user) throw new Error("Usuário não autenticado.");

            const { data: store } = await supabase
                .from("stores")
                .select("id")
                .eq("owner_user_id", auth.user.id)
                .single();

            if (!store) throw new Error("Loja não encontrada.");

            // 1) Salvar/Atualizar campanha no Supabase
            const campaignData = {
                store_id: store.id,
                product_name: product.productName,
                // description: product.description, // Removido: coluna não existe no banco
                price: product.type === "info" ? null : parseFloat(product.price.replace(",", ".")) || 0,
                image_url: product.imageUrl,
                // type: product.type,
                audience: strategy.audience,
                objective: strategy.objective,
                product_positioning: strategy.productPositioning,
                status: "active" as const
            };

            let currentId = campaignId;

            if (currentId) {
                const { error: upErr } = await supabase.from("campaigns").update(campaignData).eq("id", currentId);
                if (upErr) throw upErr;
            } else {
                const { data: newC, error: cErr } = await supabase
                    .from("campaigns")
                    .insert(campaignData)
                    .select("id")
                    .single();
                
                if (cErr) throw cErr;
                currentId = newC.id;
                setCampaignId(currentId);
            }

            // 2) Chamar API de geração de conteúdo se Post solicitado
            if (strategy.generatePost) {
                const genResponse = await fetch("/api/generate/campaign", {
                    method: "POST",
                    body: JSON.stringify({ 
                        campaign_id: currentId, 
                        force: true,
                        description: product.description // Enviando via body já que não está no banco
                    }),
                });

                const genData = await genResponse.json();
                if (!genData.ok) throw new Error(genData.error || "Erro ao gerar post.");
            }

            // 3) Buscar dados atualizados para o preview
            const { data: finalCampaign, error: fetchErr } = await supabase
                .from("campaigns")
                .select("*")
                .eq("id", currentId)
                .single();

            if (fetchErr || !finalCampaign) throw new Error("Falha ao recuperar dados da campanha.");

            // 4) Tenta gerar Reels se Vídeo solicitado
            let reels: any = null;
            if (strategy.generateReels) {
                try {
                    const reelsResponse = await fetch("/api/generate/reels", {
                        method: "POST",
                        body: JSON.stringify({ campaign_id: currentId, force: true }),
                    });
                    const reelsData = await reelsResponse.json();
                    if (reelsData.ok) reels = reelsData.reels;
                } catch (reelsErr) {
                    console.warn("Falha silenciosa ao gerar Reels:", reelsErr);
                }
            }

            // Buscar dados completos da loja para o preview (cores, contatos, etc)
            const { data: fullStore } = await supabase
                .from("stores")
                .select("name, address, neighborhood, city, state, whatsapp, phone, primary_color, secondary_color, logo_url")
                .eq("id", store.id)
                .single();

            setPreview({
                imageUrl: finalCampaign.image_url || "",
                headline: finalCampaign.headline || finalCampaign.product_name,
                bodyText: finalCampaign.ai_text || "",
                cta: finalCampaign.ai_cta || "",
                caption: finalCampaign.ai_caption || "",
                hashtags: finalCampaign.ai_hashtags || "",
                price: finalCampaign.price,
                store: fullStore ? {
                    name: fullStore.name,
                    address: `${fullStore.address || ""}${fullStore.neighborhood ? `, ${fullStore.neighborhood}` : ""}`,
                    whatsapp: fullStore.whatsapp || fullStore.phone || "",
                    primary_color: fullStore.primary_color,
                    secondary_color: fullStore.secondary_color,
                    logo_url: fullStore.logo_url,
                } : undefined,
                reelsHook: reels?.hook || "",
                reelsScript: reels?.script || "",
                reelsShotlist: reels?.shotlist || [],
                reelsAudioSuggestion: reels?.audio_suggestion || "",
                reelsDurationSeconds: reels?.duration_seconds || 15,
                reelsOnScreenText: reels?.on_screen_text || [],
                reelsCaption: reels?.caption || "",
                reelsCta: reels?.cta || "",
                reelsHashtags: reels?.hashtags || "",
            });

            setGenerationState("ready");
            
            // 5) Se veio de um plano semanal, atualizar o vínculo
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

            document.getElementById("dashboard-main-content")?.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Erro durante o processo de geração.");
            setGenerationState("idle");
        }
    }

    async function handleApprove() {
        if (!campaignId || !preview) return;

        try {
            setGenerationState("generating"); // Add visual feedback for saving

            // Atualizar os textos editados na campanha (Post)
            if (strategy.generatePost) {
                let finalImageUrl = preview.imageUrl;

                // 1) Gerar a imagem oficial estática via API
                try {
                    const ogResponse = await fetch("/api/generate/og-image", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            layout: preview.layout || "solid",
                            imageUrl: preview.imageUrl ? preview.imageUrl.split('#')[0] : "",
                            headline: preview.headline,
                            bodyText: preview.bodyText,
                            cta: preview.cta,
                            price: preview.price,
                            storeName: preview.store?.name,
                            storeAddress: preview.store?.address,
                            whatsapp: preview.store?.whatsapp,
                            primaryColor: preview.store?.primary_color,
                        }),
                    });

                    if (ogResponse.ok) {
                        const imageBlob = await ogResponse.blob();
                        const fileName = `${campaignId}-${Date.now()}.png`;

                        // 2) Fazer upload real pro Supabase Storage
                        const { data: uploadData, error: uploadErr } = await supabase.storage
                            .from("campaign-images")
                            .upload(fileName, imageBlob, {
                                contentType: "image/png",
                                upsert: true,
                            });

                        if (uploadErr) {
                            console.error("Erro no upload da arte final:", uploadErr);
                        } else {
                            const { data: publicUrlData } = supabase.storage
                                .from("campaign-images")
                                .getPublicUrl(fileName);
                            
                            finalImageUrl = publicUrlData.publicUrl;
                        }
                    } else {
                        console.error("Falha ao gerar preview OG", await ogResponse.text());
                    }
                } catch (ogErr) {
                    console.error("Erro requisição OG Image:", ogErr);
                }

                // 3) Atualiza o banco com os novos textos e com o link real do PNG
                const { error } = await supabase
                    .from("campaigns")
                    .update({
                        headline: preview.headline,
                        ai_text: preview.bodyText,
                        ai_cta: preview.cta,
                        ai_caption: preview.caption,
                        ai_hashtags: preview.hashtags,
                        image_url: finalImageUrl,
                        status: "approved",
                    })
                    .eq("id", campaignId);

                if (error) throw error;
            }

            // Opcional: Se precisar atualizar o banco para Reels também, faríamos aqui 
            // ex: buscar o post de reels vinculado a essa campanha e dar update.
            // Atualmente, a API de salvar só mantém o preview visual.

            router.push(`/dashboard/campaigns/${campaignId}`);
        } catch (err: any) {
            console.error(err);
            setGenerationState("ready"); // volta ao estado anterior
            alert(err.message || "Erro ao salvar alterações da campanha.");
        }
    }

    return (
        <main className="mx-auto max-w-6xl px-6 py-6 space-y-6">
            <MotionWrapper delay={0.1}>
                <NewCampaignHeader />
                {searchParams.get("plan_item_id") && generationState !== "ready" && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-sm font-medium text-emerald-800">
                            <strong>Plano Semanal:</strong> A IA já pré-configurou a estratégia com base no seu calendário. 
                            Basta preencher o Produto e gerar!
                        </p>
                    </div>
                )}
            </MotionWrapper>

            {generationState === "ready" && (
                <MotionWrapper delay={0.15}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">Revisão da Campanha</h2>
                            <p className="text-sm text-zinc-500">
                                Você pode editar os textos antes de aprovar.
                            </p>
                        </div>
                        <button
                            onClick={handleApprove}
                            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
                        >
                            Aprovar e Salvar
                        </button>
                    </div>
                </MotionWrapper>
            )}

            {generationState === "idle" || generationState === "error" ? (
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-5">
                        <MotionWrapper delay={0.2}>
                            <StrategyFormCard
                                value={strategy}
                                onChange={(next) => {
                                    setStrategy({
                                        ...next,
                                        source: next.source ?? "manual",
                                    });
                                }}
                            />
                        </MotionWrapper>
                    </div>

                    <div className="space-y-5">
                        <MotionWrapper delay={0.3}>
                            <ProductFormCard
                                value={product}
                                onChange={setProduct}
                            />
                        </MotionWrapper>

                        <MotionWrapper delay={0.4}>
                            <GenerateCampaignCard
                                generationState={generationState}
                                canGenerate={canGenerate}
                                onGenerate={handleGenerateCampaign}
                            />
                        </MotionWrapper>
                    </div>
                </div>
            ) : (
                <MotionWrapper delay={0.2}>
                    <CampaignPreviewPanel
                        generationState={generationState}
                        preview={preview}
                        onUpdatePreview={setPreview}
                        generatePost={strategy.generatePost}
                        generateReels={strategy.generateReels}
                    />
                </MotionWrapper>
            )}
        </main>
    );
}