"use server";

import { createSupabaseServerClient } from "./server";
import { getSignedImageUrl } from "./storage-server";
import {
  ApprovedCampaignAssetKind,
  getApprovedCampaignAssetSignedUrl,
} from "./storage-server";

/**
 * Server Action para obter uma URL assinada. 
 * Útil para componentes client-side que precisam exibir imagens de buckets privados.
 */
export async function getSignedUrlAction(path: string | null | undefined) {
  if (!path) return null;
  return await getSignedImageUrl(path);
}

type GetApprovedAssetSignedUrlActionInput = {
  campaignId: string;
  storeId: string;
  assetKind: ApprovedCampaignAssetKind;
  fallbackPathOrUrl?: string | null;
};

export async function getApprovedAssetSignedUrlAction(
  input: GetApprovedAssetSignedUrlActionInput
) {
  const supabase = await createSupabaseServerClient();

  return getApprovedCampaignAssetSignedUrl({
    supabase,
    campaignId: input.campaignId,
    storeId: input.storeId,
    assetKind: input.assetKind,
    fallbackPathOrUrl: input.fallbackPathOrUrl,
  });
}

type RegisterApprovedAssetActionInput = {
  campaignId: string;
  storeId: string;
  assetKind: ApprovedCampaignAssetKind;
  storageBucket: string;
  storagePath: string;
  publicUrlLegacy?: string | null;
  generationSource: string;
  visualSnapshot?: Record<string, unknown> | null;
};

export async function registerApprovedAssetAction(
  input: RegisterApprovedAssetActionInput
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select(
      `
        *,
        stores (
          brand_profile,
          brand_profile_version
        )
      `
    )
    .eq("id", input.campaignId)
    .eq("store_id", input.storeId)
    .maybeSingle();

  if (campaignError || !campaign) {
    throw new Error("APPROVED_ASSET_CAMPAIGN_NOT_FOUND");
  }

  const store = Array.isArray(campaign.stores) ? campaign.stores[0] : campaign.stores || null;

  const { error: supersedeError } = await supabase
    .from("campaign_approved_assets")
    .update({ approval_status: "superseded" })
    .eq("campaign_id", input.campaignId)
    .eq("store_id", input.storeId)
    .eq("asset_kind", input.assetKind)
    .eq("approval_status", "approved");

  if (supersedeError) {
    throw new Error("APPROVED_ASSET_SUPERSEDE_FAILED");
  }

  const { error: insertError } = await supabase
    .from("campaign_approved_assets")
    .insert({
      campaign_id: input.campaignId,
      store_id: input.storeId,
      asset_kind: input.assetKind,
      approval_status: "approved",
      approved_by: user?.id || null,
      storage_bucket: input.storageBucket,
      storage_path: input.storagePath,
      public_url_legacy: input.publicUrlLegacy || null,
      generation_source: input.generationSource,
      campaign_snapshot: campaign,
      visual_snapshot: input.visualSnapshot || null,
      brand_profile_version:
        typeof store?.brand_profile_version === "number" ? store.brand_profile_version : 1,
      brand_profile_snapshot: store?.brand_profile || null,
    });

  if (insertError) {
    throw new Error("APPROVED_ASSET_INSERT_FAILED");
  }

  return { ok: true };
}

/**
 * Server Action para obter múltiplas URLs assinadas em uma única requisição.
 */
export async function getSignedUrlsAction(paths: (string | null | undefined)[]) {
  if (!paths || paths.length === 0) return [];
  
  const results = await Promise.all(
    paths.map(p => p ? getSignedImageUrl(p) : null)
  );
  
  return results;
}
