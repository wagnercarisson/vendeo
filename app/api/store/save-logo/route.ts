import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST /api/store/save-logo
 * 
 * Story 3 (Logo IA - DALL-E 3): Save selected logo to Supabase Storage
 * 
 * Flow:
 * 1. Download image from temporary DALL-E URL (expires 1h)
 * 2. Upload to Supabase Storage: campaign-images/{storeId}/logo.png
 * 3. Update stores.logo_url with permanent URL
 * 4. Return permanent Supabase Storage URL
 * 
 * Rate Limit: None (user already passed rate limit check in generate-logo endpoint)
 */

const BodySchema = z.object({
  logoUrl: z.string().url({ message: "invalid_logo_url" }),
  storeId: z.string().uuid({ message: "invalid_store_id" }).optional(),
});

/**
 * Resolve store ID and verify ownership.
 * 
 * Authorization:
 * - If storeId provided: Verify user owns this store
 * - If no storeId: Auto-detect user's first store
 * 
 * @throws Error if user not authenticated or store not owned
 */
async function resolveOwnedStoreId(requestedStoreId?: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("not_authenticated");
  }

  // Auto-detect: Get user's first store if no storeId provided
  if (!requestedStoreId) {
    const { data: store, error } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!store?.id) {
      throw new Error("store_not_found");
    }

    return { storeId: store.id as string, userId: user.id };
  }

  // Verify ownership if storeId provided
  const admin = getSupabaseAdmin();
  const { data: ownedStore, error } = await admin
    .from("stores")
    .select("id")
    .eq("id", requestedStoreId)
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!ownedStore?.id) {
    throw new Error("forbidden");
  }

  return { storeId: ownedStore.id as string, userId: user.id };
}

/**
 * Download image from DALL-E temporary URL and upload to Supabase Storage.
 * 
 * @param logoUrl Temporary DALL-E URL (expires in 1 hour)
 * @param storeId Store UUID
 * @returns Permanent Supabase Storage public URL
 */
async function saveLogoToStorage(logoUrl: string, storeId: string): Promise<string> {
  // 1. Download image from temporary DALL-E URL
  const response = await fetch(logoUrl);

  if (!response.ok) {
    throw new Error(`download_failed: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();

  // 2. Upload to Supabase Storage (overwrites previous logo if exists)
  const admin = getSupabaseAdmin();
  const storagePath = `${storeId}/logo.png`;

  const { error: uploadError } = await admin.storage
    .from("campaign-images")
    .upload(storagePath, buffer, {
      contentType: "image/png",
      upsert: true, // Overwrite previous logo
      cacheControl: "3600", // 1 hour cache
    });

  if (uploadError) {
    throw new Error(`upload_failed: ${uploadError.message}`);
  }

  // 3. Get permanent public URL
  const { data: publicData } = admin.storage
    .from("campaign-images")
    .getPublicUrl(storagePath);

  return publicData.publicUrl;
}

/**
 * Update stores.logo_url with permanent Supabase Storage URL.
 */
async function updateStoreLogo(storeId: string, logoUrl: string): Promise<void> {
  const admin = getSupabaseAdmin();

  const { error } = await admin
    .from("stores")
    .update({ logo_url: logoUrl })
    .eq("id", storeId);

  if (error) {
    throw new Error(`update_failed: ${error.message}`);
  }
}

export async function POST(req: Request) {
  try {
    // 1. Parse and validate request body
    const json = await req.json().catch(() => null);

    if (json === null) {
      return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
    }

    const body = BodySchema.safeParse(json);

    if (!body.success) {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_body",
          details: body.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { logoUrl, storeId: requestedStoreId } = body.data;

    // 2. Resolve store ID and verify ownership
    const { storeId } = await resolveOwnedStoreId(requestedStoreId);

    // 3. Download from DALL-E URL and upload to Supabase Storage
    const permanentUrl = await saveLogoToStorage(logoUrl, storeId);

    // 4. Update stores.logo_url
    await updateStoreLogo(storeId, permanentUrl);

    // 5. Return success with permanent URL
    return NextResponse.json({
      success: true,
      logo_url: permanentUrl,
      message: "Logo saved successfully",
    });
  } catch (error: any) {
    console.error("[save-logo] Error:", error.message);

    // Handle specific errors
    if (error.message === "not_authenticated") {
      return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });
    }

    if (error.message === "forbidden") {
      return NextResponse.json(
        { success: false, error: "forbidden", message: "You do not own this store" },
        { status: 403 }
      );
    }

    if (error.message === "store_not_found") {
      return NextResponse.json(
        { success: false, error: "store_not_found", message: "No store found for this user" },
        { status: 404 }
      );
    }

    if (error.message.startsWith("download_failed")) {
      return NextResponse.json(
        {
          success: false,
          error: "download_failed",
          message: "Failed to download logo from DALL-E URL",
        },
        { status: 500 }
      );
    }

    if (error.message.startsWith("upload_failed")) {
      return NextResponse.json(
        {
          success: false,
          error: "upload_failed",
          message: "Failed to upload logo to storage",
        },
        { status: 500 }
      );
    }

    if (error.message.startsWith("update_failed")) {
      return NextResponse.json(
        {
          success: false,
          error: "update_failed",
          message: "Failed to update store logo URL",
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: "internal_server_error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
