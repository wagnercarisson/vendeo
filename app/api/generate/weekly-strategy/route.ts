import { NextResponse } from "next/server";
import { WeeklyStrategyRequestSchema } from "@/lib/domain/weekly-plans/schemas";
import { generateWeeklyStrategy } from "@/lib/domain/weekly-plans/strategy";
import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
import { supabaseAdmin } from "@/lib/supabase/admin";

type StoreOwnershipResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

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
      return {
        ok: false,
        response: NextResponse.json(
          { ok: false, requestId, error: "not_authenticated" },
          { status: 401 }
        ),
      };
    }

    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, requestId, error: "store_not_found" },
        { status: 403 }
      ),
    };
  }

  const { data: owned, error } = await supabaseAdmin
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!owned) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, requestId, error: "STORE_NOT_FOUND" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, userId };
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const json = await req.json().catch(() => null);
    const body = WeeklyStrategyRequestSchema.safeParse(json);

    if (body.success === false) {
      return NextResponse.json(
        {
          ok: false,
          requestId,
          error: "INVALID_INPUT",
          details: body.error.flatten(),
        },
        { status: 400 }
      );
    }

    const own = await assertStoreOwnership(requestId, body.data.store_id);
    if (own.ok === false) return own.response;

    const result = await generateWeeklyStrategy({
      storeId: body.data.store_id,
      weekStart: body.data.week_start,
      selectedDays: body.data.selected_days,
      city: body.data.city,
      state: body.data.state,
      holidays: body.data.holidays as Array<{ date: string; name: string }>,
    });

    if (result.ok === false) {
      return NextResponse.json(
        { ok: false, requestId, error: result.error },
        { status: result.status ?? 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      requestId,
      strategy_summary: result.strategyItems,
    });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "UNKNOWN_ERROR";
    console.error("[weekly-strategy][POST] error:", msg, err?.stack ?? err);

    return NextResponse.json(
      { ok: false, requestId, error: "UNHANDLED", details: msg },
      { status: 500 }
    );
  }
}