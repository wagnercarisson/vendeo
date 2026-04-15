import { getSupabaseAdmin } from "./admin";
import { extractStoragePath } from "./storage-path";

export type ApprovedCampaignAssetKind = "post_image" | "reels_cover" | "reels_video";

type ApprovedAssetResolverClient = {
  from: (table: string) => {
    select: (columns: string) => any;
  };
};

type ResolveApprovedCampaignAssetSourceInput = {
  supabase: ApprovedAssetResolverClient;
  campaignId: string;
  storeId: string;
  assetKind: ApprovedCampaignAssetKind;
  fallbackPathOrUrl?: string | null;
};

export type ResolvedApprovedCampaignAssetSource = {
  storageBucket: string | null;
  storagePath: string | null;
  publicUrlLegacy: string | null;
  sourcePathOrUrl: string | null;
  source: "canonical-storage" | "canonical-legacy" | "fallback";
};

/**
 * Gera uma URL assinada para um arquivo no bucket 'campaign-images'.
 * @param path O caminho do arquivo dentro do bucket (ex: 'uploads/user_id/file.png')
 * @param expiresIn Tempo de expiração em segundos (padrão 1 hora)
 */
export async function getSignedImageUrl(
  path: string,
  expiresIn = 3600,
  bucketOverride?: string | null
) {
  if (!path) return null;
  const originalPath = path;

  // Heurística de segurança: se o "caminho" já for uma URL completa do nosso storage, 
  // tenta extrair o path puro para re-gerar a assinatura (Healing)
  const isSupabaseUrl = path.includes("supabase.co") && (path.includes("/object/public/") || path.includes("/object/sign/"));

  // URLs externas ao Supabase devem ser preservadas.
  if (path.startsWith("http") && !isSupabaseUrl) {
    return path;
  }

  // Detectar o bucket da URL ou usar o padrão 'campaign-images'
  let bucket = bucketOverride || "campaign-images";
  let relativePath = extractStoragePath(path) || path;

  // Cura Automática: Se o caminho contém "logos/USER_ID/logos/...", remove o "logos/" duplicado
  if (relativePath.includes("logos/") && relativePath.split("logos/").length > 2) {
      // Ex: logos/ID/logos/file.png -> logos/ID/file.png
      const parts = relativePath.split("/");
      if (parts[0] === "logos" && parts[2] === "logos") {
          relativePath = [parts[0], parts[1], ...parts.slice(3)].join("/");
      }
  }

  // Padrão Supabase: /storage/v1/object/[public|sign]/[bucket]/[path]
  const storagePatterns = [
    "/storage/v1/object/public/",
    "/storage/v1/object/sign/"
  ];

  for (const pattern of storagePatterns) {
    if (path.includes(pattern)) {
      const parts = path.split(pattern)[1].split("/");
      bucket = parts[0];
      relativePath = parts.slice(1).join("/").split("?")[0];
      break;
    }
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(relativePath, expiresIn);

  if (error) {
    console.error(`[storage-server] Error creating signed URL for bucket ${bucket}, path ${relativePath}:`, error.message);
    const isInternalStoragePath =
      !originalPath.startsWith("http") ||
      (originalPath.includes("supabase.co") && originalPath.includes("/storage/v1/object/"));

    return isInternalStoragePath ? null : originalPath;
  }

  return data.signedUrl;
}

export async function resolveApprovedCampaignAssetSource(
  input: ResolveApprovedCampaignAssetSourceInput
): Promise<ResolvedApprovedCampaignAssetSource> {
  const { supabase, campaignId, storeId, assetKind, fallbackPathOrUrl = null } = input;

  const { data } = await supabase
    .from("campaign_approved_assets")
    .select("storage_bucket, storage_path, public_url_legacy")
    .eq("campaign_id", campaignId)
    .eq("store_id", storeId)
    .eq("asset_kind", assetKind)
    .eq("approval_status", "approved")
    .order("approved_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const storagePath = typeof data?.storage_path === "string" && data.storage_path.trim().length > 0
    ? data.storage_path
    : null;
  const publicUrlLegacy =
    typeof data?.public_url_legacy === "string" && data.public_url_legacy.trim().length > 0
      ? data.public_url_legacy
      : null;
  const storageBucket =
    typeof data?.storage_bucket === "string" && data.storage_bucket.trim().length > 0
      ? data.storage_bucket
      : null;

  if (storagePath) {
    return {
      storageBucket,
      storagePath,
      publicUrlLegacy,
      sourcePathOrUrl: storagePath,
      source: "canonical-storage",
    };
  }

  if (publicUrlLegacy) {
    return {
      storageBucket,
      storagePath: null,
      publicUrlLegacy,
      sourcePathOrUrl: publicUrlLegacy,
      source: "canonical-legacy",
    };
  }

  return {
    storageBucket: null,
    storagePath: null,
    publicUrlLegacy: null,
    sourcePathOrUrl: fallbackPathOrUrl,
    source: "fallback",
  };
}

export async function getApprovedCampaignAssetSignedUrl(
  input: ResolveApprovedCampaignAssetSourceInput & { expiresIn?: number }
) {
  const { expiresIn = 3600, fallbackPathOrUrl = null } = input;
  const resolved = await resolveApprovedCampaignAssetSource(input);

  if (!resolved.sourcePathOrUrl) {
    return fallbackPathOrUrl;
  }

  return getSignedImageUrl(
    resolved.sourcePathOrUrl,
    expiresIn,
    resolved.storagePath ? resolved.storageBucket : null
  );
}
