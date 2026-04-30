import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const BodySchema = z.object({
  name: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  main_segment: z.string().optional(),
  brand_positioning: z.string().optional(),
  tone_of_voice: z.string().optional(),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
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
      ...parsed.data,
      owner_user_id: user.id,
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

  return NextResponse.json({
    ok: true,
    store_id: store.id,
    already_exists: false,
  });
}