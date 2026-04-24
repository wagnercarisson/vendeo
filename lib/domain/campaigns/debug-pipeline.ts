import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchStoreContext } from "@/lib/domain/stores/queries";

import { generateCampaignVisuals } from "./visual-pipeline";
import { mapDbCampaignToDomain } from "./mapper";

export async function debugPipeline(campaign_id: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from("campaigns").select("*").eq("id", campaign_id).single();

  if (error || !data) {
    throw new Error("CAMPAIGN_NOT_FOUND");
  }

  const campaign = mapDbCampaignToDomain(data);
  const store = await fetchStoreContext(campaign.store_id);
  if (!store) {
    throw new Error("STORE_NOT_FOUND");
  }

  const result = await generateCampaignVisuals({
    campaign_id: campaign.id,
    store_id: campaign.store_id,
    product_image_url: campaign.product_image_url || campaign.image_url || "",
    campaign_data: {
      product_name: campaign.product_name || "Produto",
      objective: campaign.objective || "promocao",
      audience: campaign.audience || "geral",
      price: campaign.price,
      price_label: campaign.price_label,
      content_type: campaign.content_type || "product",
      product_positioning: campaign.product_positioning,
    },
    visual_signature: {
      logo_url: store.logo_url,
      store_name: store.name,
    },
  });

  console.log("=== PIPELINE DEBUG START ===");
  console.log("Campaign ID:", campaign_id);
  console.log("Trace ID:", result.trace_id);
  console.log(JSON.stringify(result, null, 2));
  console.log("=== PIPELINE DEBUG END ===");

  return result;
}