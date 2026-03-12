import { NextResponse } from "next/server";
import { WeeklyStrategyRequestSchema } from "@/lib/domain/weekly-plans/schemas";
import { generateWeeklyStrategy } from "@/lib/domain/weekly-plans/strategy";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    // 1) Parse e validação do body
    const json = await req.json().catch(() => null);
    const body = WeeklyStrategyRequestSchema.safeParse(json);

    if (!body.success) {
      return NextResponse.json(
        { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() },
        { status: 400 }
      );
    }

    // 2) Delega ao service de estratégia
    const result = await generateWeeklyStrategy({
      storeId: body.data.store_id,
      weekStart: body.data.week_start,
      selectedDays: body.data.selected_days,
      city: body.data.city,
      state: body.data.state,
      holidays: body.data.holidays,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, requestId, error: result.error },
        { status: result.status ?? 500 }
      );
    }

    // 3) Retorna — mantém a chave strategy_summary que o WizardShell espera
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
