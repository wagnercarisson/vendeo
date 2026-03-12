import { NextResponse } from "next/server";
import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
import { supabaseAdmin } from "@/lib/supabase/admin";
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

  try {
    const url = new URL(req.url);
    const week_start = (url.searchParams.get("week_start") ?? getWeekStartMondayISO()).trim();
    const store_id = (url.searchParams.get("store_id") ?? "").trim();

    const q = WeeklyPlanQuerySchema.safeParse({ store_id, week_start });
    if (!q.success) {
      return NextResponse.json(
        { ok: false, requestId, error: "INVALID_QUERY", details: q.error.flatten() },
        { status: 400 }
      );
    }

    const own = await assertStoreOwnership(requestId, q.data.store_id);
    if (own.ok === false) return own.response;

    const result = await fetchWeeklyPlan(q.data.store_id, q.data.week_start ?? getWeekStartMondayISO());

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

  try {
    const json = await req.json().catch(() => null);
    const body = WeeklyPlanPostBodySchema.safeParse(json);

    if (!body.success) {
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