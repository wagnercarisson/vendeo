import React from "react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
import { CampaignPreviewClient } from "./_components/CampaignPreviewClient";
import { mapDbCampaignToDomain } from "@/lib/domain/campaigns/mapper";
import { mapDbStoreToDomain } from "@/lib/domain/stores/mapper";
import {
    getApprovedCampaignAssetSignedUrl,
    getSignedImageUrl,
} from "@/lib/supabase/storage-server";

export default async function CampaignPreviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { storeId } = await getUserStoreIdOrThrow();

    const { data: campaign, error } = await supabase
        .from("campaigns")
        .select(`
            *,
            stores (
              id, name, city, state,
              brand_positioning, main_segment, tone_of_voice,
              address, neighborhood, phone, whatsapp, instagram,
                            primary_color, secondary_color, logo_url,
                            brand_profile, brand_profile_version, brand_profile_updated_at
            )
        `)
        .eq("id", id)
        .eq("store_id", storeId)
        .maybeSingle();

    if (error || !campaign) return notFound();

    const storesRaw = Array.isArray(campaign.stores) ? campaign.stores[0] : campaign.stores || null;
    const resolvedStore = storesRaw ? mapDbStoreToDomain(storesRaw) : null;

    // Assinar URLs de imagem
    const [signedImageUrl, signedProductImageUrl, signedLogoUrl] = await Promise.all([
        getApprovedCampaignAssetSignedUrl({
            supabase,
            campaignId: campaign.id,
            storeId,
            assetKind: "post_image",
            fallbackPathOrUrl: campaign.image_url,
        }),
        getSignedImageUrl(campaign.product_image_url),
        getSignedImageUrl(resolvedStore?.logo_url || null),
    ]);

    const normalizedCampaign = {
        ...mapDbCampaignToDomain(campaign),
        image_url: signedImageUrl,
        product_image_url: signedProductImageUrl,
        stores: resolvedStore ? {
            ...resolvedStore,
            logo_url: signedLogoUrl,
        } : null,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900">
                        Gerenciar campanha
                    </h1>
                    <p className="text-sm text-zinc-600">
                        {normalizedCampaign.origin === "plan"
                            ? "Estratégia herdada do seu Plano Semanal."
                            : "Edite, gere e organize o conteúdo da sua campanha."}
                    </p>
                </div>
            </div>

            <CampaignPreviewClient
                campaign={normalizedCampaign}
                isPlanLinked={normalizedCampaign.origin === "plan"}
            />
        </div>
    );
}