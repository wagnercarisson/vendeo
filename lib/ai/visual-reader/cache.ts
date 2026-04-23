import { createHash } from "node:crypto";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

import {
  ImageProfileSchema,
  type ImageProfile,
  type VisualReaderInput,
} from "./contracts";

const VISUAL_READER_CACHE_TABLE = "visual_reader_cache";

export function buildVisualReaderCacheKey(input: VisualReaderInput) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        imageUrl: input.imageUrl,
        productName: input.productName.trim(),
        content_type: input.content_type,
      })
    )
    .digest("hex");
}

export async function getCachedImageProfile(input: VisualReaderInput): Promise<ImageProfile | null> {
  const supabase = getSupabaseAdmin();
  const cacheKey = buildVisualReaderCacheKey(input);

  const { data, error } = await supabase
    .from(VISUAL_READER_CACHE_TABLE)
    .select("profile")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (error) {
    console.warn("[visual-reader/cache] cache lookup failed", {
      cacheKey,
      message: error.message,
    });
    return null;
  }

  const parsed = ImageProfileSchema.safeParse(data?.profile);
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export async function setCachedImageProfile(input: VisualReaderInput, profile: ImageProfile) {
  const supabase = getSupabaseAdmin();
  const cacheKey = buildVisualReaderCacheKey(input);

  const { error } = await supabase.from(VISUAL_READER_CACHE_TABLE).upsert(
    {
      cache_key: cacheKey,
      image_url: input.imageUrl,
      product_name: input.productName,
      content_type: input.content_type,
      profile,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "cache_key" }
  );

  if (error) {
    console.warn("[visual-reader/cache] cache write failed", {
      cacheKey,
      message: error.message,
    });
  }
}