import { NextResponse } from "next/server";
import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  WeeklyPlanPostBodySchema,
  WeeklyPlanQuerySchema,
} from "@/lib/domain/weekly-plans/schemas";
import {
  fetchWeeklyPlan,
  generateWeeklyPlan,
  getWeekStartMondayISO,
} from "@/lib/domain/weekly-plans/service";
import { StrategyItem } from "@/lib/domain/weekly-plans/types";

/** Tipo de retorno do ownership check */
type StoreOwnershipResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

/** Valida se a store_id pertence ao user logado. */
async function assertStoreOwnership(
  requestId: string,
  storeId: string
): Promise<StoreOwnershipResult> {
  let userId: string;
  try {
    ({ userId } = await getUserStoreIdOrThrow());
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg === "not_authenticated") {
      return { ok: false, response: NextResponse.json({ error: "not_authenticated" }, { status: 401 }) };
    }
    return { ok: false, response: NextResponse.json({ error: "store_not_found" }, { status: 403 }) };
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: owned, error: ownErr } = await supabaseAdmin
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (ownErr) throw new Error(ownErr.message);

  if (!owned) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, requestId, error: "STORE_NOT_FOUND" }, { status: 403 }),
    };
  }

  return { ok: true, userId };
}

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  const supabaseAdmin = getSupabaseAdmin();

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id")?.trim() || undefined;
    const week_start = url.searchParams.get("week_start")?.trim() || undefined;
    const store_id = url.searchParams.get("store_id")?.trim() || undefined;

    const q = WeeklyPlanQuerySchema.safeParse({ id, store_id, week_start });
    if (q.success === false) {
      return NextResponse.json(
        { ok: false, requestId, error: "INVALID_QUERY", details: q.error.flatten() },
        { status: 400 }
      );
    }

    if (q.data.id) {
       // Fetch by ID doesn't strict check store ownership here if we trust the ID 
       // but for parity we should still verify if we have a userId
       try { await getUserStoreIdOrThrow(); } catch(e) { 
          return NextResponse.json({ error: "not_authenticated" }, { status: 401 }); 
       }
    } else {
       const own = await assertStoreOwnership(requestId, q.data.store_id!);
       if (own.ok === false) return own.response;
    }

    const result = await fetchWeeklyPlan({
       id: q.data.id,
       storeId: q.data.store_id,
       weekStart: q.data.week_start
    });

    return NextResponse.json({
      ok: true,
      requestId,
      exists: !!result,
      plan: result?.plan ?? null,
      items: result?.items ?? [],
      campaigns: result?.campaigns ?? [],
    });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "UNKNOWN_ERROR";
    console.error("[weekly-plan][GET] error:", msg, err?.stack ?? err);
    return NextResponse.json(
      { ok: false, requestId, error: "UNHANDLED", details: msg },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const supabaseAdmin = getSupabaseAdmin();

  try {
    const json = await req.json().catch(() => null);
    const body = WeeklyPlanPostBodySchema.safeParse(json);

    if (body.success === false) {
      return NextResponse.json(
        { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() },
        { status: 400 }
      );
    }

    const { store_id, force, approved_strategy } = body.data;
    const weekStart = (body.data.week_start ?? getWeekStartMondayISO()).trim();

    const own = await assertStoreOwnership(requestId, store_id);
    if (own.ok === false) return own.response;

    const result = await generateWeeklyPlan({
      storeId: store_id,
      weekStart,
      force,
      approvedStrategy: approved_strategy as StrategyItem[],
    });

    if (result.ok === false) {
      return NextResponse.json(
        { ok: false, requestId, error: result.error },
        { status: result.status ?? 500 }
      );
    }

    return NextResponse.json({ ...result, requestId });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "UNKNOWN_ERROR";
    console.error("[weekly-plan][POST] error:", msg, err?.stack ?? err);
    return NextResponse.json(
      { ok: false, requestId, error: "UNHANDLED", details: msg },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const requestId = crypto.randomUUID();
  const supabaseAdmin = getSupabaseAdmin();

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id")?.trim();
    const week_start = url.searchParams.get("week_start")?.trim();
    const store_id = url.searchParams.get("store_id")?.trim();

    if (!id && (!week_start || !store_id)) {
      return NextResponse.json({ error: "missing_params" }, { status: 400 });
    }

    // Auth check
    try { await getUserStoreIdOrThrow(); } catch(e) { 
       return NextResponse.json({ error: "not_authenticated" }, { status: 401 }); 
    }

    let planId = id;

    // Se veio por semana, precisamos do ID primeiro para limpar itens/campanhas
    if (!planId && store_id && week_start) {
      const { data: p } = await supabaseAdmin
        .from("weekly_plans")
        .select("id")
        .eq("store_id", store_id)
        .eq("week_start", week_start)
        .maybeSingle();
      if (p) planId = p.id;
    }

    if (!planId) {
      return NextResponse.json({ ok: true, message: "not_found_nothing_to_do" });
    }

    // 1. Buscar IDs dos itens para limpeza segura
    const { data: items } = await supabaseAdmin
      .from("weekly_plan_items")
      .select("id")
      .eq("plan_id", planId);
    
    const itemIds = (items ?? []).map(i => i.id);

    if (itemIds.length > 0) {
      // 2. Desvincular campanhas (torná-las manuais)
      await supabaseAdmin
        .from("campaigns")
        .update({ weekly_plan_item_id: null, origin: 'manual' })
        .in("weekly_plan_item_id", itemIds);

      // 3. Deletar Itens
      await supabaseAdmin.from("weekly_plan_items").delete().in("id", itemIds);
    }

    // 4. Deletar Plano
    const { error: delError } = await supabaseAdmin
      .from("weekly_plans")
      .delete()
      .eq("id", planId);

    if (delError) {
       console.error("Delete Error:", delError);
       return NextResponse.json({ ok: false, error: "DELETE_SQL_FAILED", details: delError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Delete Catch:", err);
    return NextResponse.json(
      { ok: false, requestId, error: "DELETE_UNHANDLED", details: err.message },
      { status: 500 }
    );
  }
}