import React from "react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
import { CampaignPreviewClient } from "./_components/CampaignPreviewClient";
import { mapDbCampaignToDomain } from "@/lib/domain/campaigns/mapper";

export default async function CampaignPreviewPage({
    params,
}: {
    params: { id: string };
}) {
    const supabase = createSupabaseServerClient();
    const { storeId } = await getUserStoreIdOrThrow();

    const { data: campaign, error } = await supabase
        .from("campaigns")
        .select(`
            *,
            stores (
              id, name, city, state,
              brand_positioning, main_segment, tone_of_voice,
              address, neighborhood, phone, whatsapp, instagram,
              primary_color, secondary_color, logo_url
            )
        `)
        .eq("id", params.id)
        .eq("store_id", storeId)
        .maybeSingle();

    if (error || !campaign) return notFound();

    const normalizedCampaign = {
        ...mapDbCampaignToDomain(campaign),
        stores: Array.isArray(campaign.stores) ? campaign.stores[0] : campaign.stores || null,
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