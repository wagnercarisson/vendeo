import React from "react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
import { CampaignPreviewClient } from "./_components/CampaignPreviewClient";

export default async function CampaignPreviewPage({
    params,
}: {
    params: { id: string };
}) {
    const supabase = createSupabaseServerClient();
    const { storeId } = await getUserStoreIdOrThrow();

    const { data: campaign, error } = await supabase
        .from("campaigns")
        .select(
            `
        id, store_id, product_name, price, audience, objective,
        image_url, headline, body_text, cta,
        ai_caption, ai_text, ai_hashtags, ai_cta, ai_generated_at,
        reels_hook, reels_script, reels_caption, reels_cta, reels_hashtags, reels_generated_at,
        reels_shotlist, reels_on_screen_text, reels_audio_suggestion, reels_duration_seconds,
        product_positioning,
        stores (
          id, name, city, state,
          brand_positioning, main_segment, tone_of_voice,
          address, neighborhood, phone, whatsapp, instagram,
          primary_color, secondary_color
        )
      `
        )
        .eq("id", params.id)
        .eq("store_id", storeId)
        .maybeSingle();

    if (error || !campaign) return notFound();

    const normalizedCampaign = {
        ...campaign,
        stores: Array.isArray(campaign.stores)
            ? campaign.stores[0] ?? null
            : campaign.stores ?? null,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900">
                        Preview da campanha
                    </h1>
                    <p className="text-sm text-zinc-600">
                        Tudo pronto para copiar e postar — com aparência premium.
                    </p>
                </div>
            </div>

            <CampaignPreviewClient campaign={normalizedCampaign} />
        </div>
    );
}