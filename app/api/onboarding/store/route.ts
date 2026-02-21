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
  const supabase = createSupabaseServerClient();
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

  // Admin client para inserir com service role (sem RLS quebrar)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // 1) cria store
  const { data: store, error: storeErr } = await admin
    .from("stores")
    .insert({
      ...parsed.data,
    })
    .select("id")
    .single();

  if (storeErr || !store) {
    return NextResponse.json(
      { error: "store_insert_failed", details: storeErr?.message },
      { status: 500 }
    );
  }

  // 2) vincula user -> store
  const { error: memberErr } = await admin.from("store_members").insert({
    store_id: store.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberErr) {
    return NextResponse.json(
      { error: "member_insert_failed", details: memberErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, store_id: store.id });
}
