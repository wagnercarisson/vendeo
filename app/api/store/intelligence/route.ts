import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  calculateIntelligenceScore,
  mergeIntelligenceContext,
} from "@/lib/domain/intelligence/service";

const BodySchema = z
  .object({
    store_id: z.string().uuid().optional(),
    storeId: z.string().uuid().optional(),
    context: z.object({}).catchall(z.unknown()),
  })
  .refine(
    (value) => !value.store_id || !value.storeId || value.store_id === value.storeId,
    {
      message: "store_id_mismatch",
      path: ["storeId"],
    }
  );

async function resolveOwnedStoreId(requestedStoreId?: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("not_authenticated");
  }

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

    return { supabase, storeId: store.id as string };
  }

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

  return { supabase, storeId: ownedStore.id as string };
}

function isUniqueViolation(error: { code?: string | null; message?: string | null } | null) {
  if (!error) {
    return false;
  }

  const message = error.message?.toLowerCase() ?? "";
  return error.code === "23505" || message.includes("duplicate") || message.includes("unique");
}

export async function PATCH(req: Request) {
  try {
    const json = await req.json().catch(() => null);

    if (json === null) {
      return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
    }

    const body = BodySchema.safeParse(json);

    if (body.success === false) {
      return NextResponse.json(
        { success: false, error: "invalid_body", details: body.error.flatten() },
        { status: 400 }
      );
    }

    const requestedStoreId = body.data.store_id ?? body.data.storeId;

    let supabase;
    let storeId: string;

    try {
      ({ supabase, storeId } = await resolveOwnedStoreId(requestedStoreId));
    } catch (error: any) {
      const message = String(error?.message ?? "unknown");

      if (message === "not_authenticated") {
        return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });
      }

      if (message === "forbidden" || message === "store_not_found") {
        return NextResponse.json({ success: false, error: "forbidden" }, { status: 403 });
      }

      throw error;
    }

    const { data: existingRecord, error: fetchError } = await supabase
      .from("store_intelligence")
      .select("context")
      .eq("store_id", storeId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    const mergedContext = mergeIntelligenceContext(existingRecord?.context, body.data.context);
    const score = calculateIntelligenceScore(mergedContext);

    let persistedRecord:
      | { context: unknown; intelligence_score: number; updated_at: string }
      | null = null;

    if (existingRecord) {
      const { data, error } = await supabase
        .from("store_intelligence")
        .update({
          context: mergedContext,
          intelligence_score: score,
        })
        .eq("store_id", storeId)
        .select("context, intelligence_score, updated_at")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      persistedRecord = data;
    } else {
      const { data, error } = await supabase
        .from("store_intelligence")
        .insert({
          store_id: storeId,
          context: mergedContext,
          intelligence_score: score,
        })
        .select("context, intelligence_score, updated_at")
        .single();

      if (error && isUniqueViolation(error)) {
        const retry = await supabase
          .from("store_intelligence")
          .update({
            context: mergedContext,
            intelligence_score: score,
          })
          .eq("store_id", storeId)
          .select("context, intelligence_score, updated_at")
          .single();

        if (retry.error) {
          throw new Error(retry.error.message);
        }

        persistedRecord = retry.data;
      } else if (error) {
        throw new Error(error.message);
      } else {
        persistedRecord = data;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        context: persistedRecord?.context ?? mergedContext,
        score: persistedRecord?.intelligence_score ?? score,
        updated_at: persistedRecord?.updated_at ?? null,
      },
    });
  } catch (error: any) {
    const message = String(error?.message ?? "unknown");
    console.error("[api/store/intelligence] error:", message, error);
    return NextResponse.json(
      { success: false, error: "unhandled", details: message },
      { status: 500 }
    );
  }
}