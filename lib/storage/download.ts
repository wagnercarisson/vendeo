import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Downloads an asset from Supabase Storage using the SDK.
 * 
 * This provides a single point of integration with Supabase Storage for asset downloads,
 * making it easier to swap storage providers in the future if needed.
 * 
 * @param path - Relative path within the campaign-images bucket (e.g., "stores/ID/products/file.webp")
 * @returns Buffer containing the asset data
 * @throws Error if download fails
 */
export async function downloadStorageAsset(path: string): Promise<Buffer> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase.storage
    .from("campaign-images")
    .download(path);
  
  if (error) {
    throw new Error(`Failed to download storage asset: ${error.message}`);
  }
  
  if (!data) {
    throw new Error(`No data returned for path: ${path}`);
  }
  
  return Buffer.from(await data.arrayBuffer());
}
