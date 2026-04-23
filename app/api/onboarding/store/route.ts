import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { VISUAL_PIPELINE_SCHEMA_VERSION } from "@/lib/domain/visual-composition/contracts";

const HexColorSchema = z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/);

const BodySchema = z.object({
  store_name: z.string().trim().min(2),
  primary_color: HexColorSchema,
  tone_of_voice: z.string().trim().min(1),
  main_segment: z.string().trim().min(1),
  secondary_color: HexColorSchema.optional(),
  logo_url: z.string().url().optional(),
  brand_positioning: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  neighborhood: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
});

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Beta owner-based:
  // 1 usuário = 1 loja
  // Antes de criar, verifica se já existe loja para este owner.
  const { data: existingStore, error: existingStoreErr } = await admin
    .from("stores")
    .select("id")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingStoreErr) {
    return NextResponse.json(
      { error: "store_lookup_failed", details: existingStoreErr.message },
      { status: 500 }
    );
  }

  if (existingStore?.id) {
    return NextResponse.json({
      ok: true,
      store_id: existingStore.id,
      already_exists: true,
    });
  }

  const { data: store, error: storeErr } = await admin
    .from("stores")
    .insert({
      name: parsed.data.store_name,
      owner_user_id: user.id,
      main_segment: parsed.data.main_segment,
      tone_of_voice: parsed.data.tone_of_voice,
      primary_color: parsed.data.primary_color,
      secondary_color: parsed.data.secondary_color ?? null,
      logo_url: parsed.data.logo_url ?? null,
      brand_positioning: parsed.data.brand_positioning ?? null,
      whatsapp: parsed.data.whatsapp ?? null,
      phone: parsed.data.phone ?? null,
      address: parsed.data.address ?? null,
      neighborhood: parsed.data.neighborhood ?? null,
      city: parsed.data.city ?? null,
      state: parsed.data.state ?? null,
    })
    .select("id")
    .single();

  if (storeErr || !store) {
    // Em caso de corrida/duplo clique, o índice único pode disparar.
    // Fazemos uma segunda leitura para retornar a loja existente
    // em vez de quebrar a UX do onboarding.
    const isUniqueViolation =
      storeErr?.code === "23505" ||
      storeErr?.message?.toLowerCase().includes("duplicate") ||
      storeErr?.message?.toLowerCase().includes("unique");

    if (isUniqueViolation) {
      const { data: retryStore, error: retryErr } = await admin
        .from("stores")
        .select("id")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (retryErr) {
        return NextResponse.json(
          { error: "store_insert_race_condition", details: retryErr.message },
          { status: 500 }
        );
      }

      if (retryStore?.id) {
        return NextResponse.json({
          ok: true,
          store_id: retryStore.id,
          already_exists: true,
        });
      }
    }

    return NextResponse.json(
      { error: "store_insert_failed", details: storeErr?.message },
      { status: 500 }
    );
  }

  const d = parsed.data;
  const brandProfile = {
    schema_version: VISUAL_PIPELINE_SCHEMA_VERSION,
    store_id: store.id,
    store_name: d.store_name,
    contact: {
      whatsapp: d.whatsapp ?? null,
      phone: d.phone ?? null,
    },
    location: {
      address: d.address ?? null,
      neighborhood: d.neighborhood ?? null,
      city: d.city ?? null,
      state: d.state ?? null,
    },
    visual: {
      primary_color: d.primary_color,
      secondary_color: d.secondary_color ?? null,
      logo_url: d.logo_url ?? null,
    },
    voice: {
      tone_of_voice: d.tone_of_voice,
      brand_positioning: d.brand_positioning ?? null,
    },
  };

  const { error: profileErr } = await admin
    .from("stores")
    .update({
      brand_profile: brandProfile,
      brand_profile_updated_at: new Date().toISOString(),
    })
    .eq("id", store.id);

  if (profileErr) {
    return NextResponse.json(
      { error: "brand_profile_update_failed", details: profileErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    store_id: store.id,
    already_exists: false,
  });
}