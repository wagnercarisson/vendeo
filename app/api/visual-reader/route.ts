import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/ratelimit";
import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";

import { getVisualReaderAlerts } from "@/lib/ai/visual-reader/alerts";
import { readVisualTarget } from "@/lib/ai/visual-reader/service";
import { VisualReaderInputSchema } from "@/lib/ai/visual-reader/contracts";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const json = await req.json().catch(() => null);
    const body = VisualReaderInputSchema.safeParse(json);

    if (body.success === false) {
      return NextResponse.json(
        { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() },
        { status: 400 }
      );
    }

    let userId: string;
    try {
      ({ userId } = await getUserStoreIdOrThrow());
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg === "not_authenticated") {
        return NextResponse.json({ ok: false, requestId, error: "not_authenticated" }, { status: 401 });
      }

      return NextResponse.json({ ok: false, requestId, error: "store_not_found" }, { status: 403 });
    }

    try {
      const { success, limit, reset, remaining } = await checkRateLimit(userId);
      if (!success) {
        return NextResponse.json(
          {
            ok: false,
            requestId,
            error: "TOO_MANY_REQUESTS",
            message: "Voce atingiu o limite de analises. Tente novamente em alguns segundos.",
            resetAt: new Date(reset).toISOString(),
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }
    } catch (rateLimitError) {
      console.error("[visual-reader/route] rate limit error:", rateLimitError);
    }

    const profile = await readVisualTarget(body.data);

    return NextResponse.json({
      ok: true,
      requestId,
      profile,
      alerts: getVisualReaderAlerts(profile),
    });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "UNKNOWN_ERROR";
    console.error("[visual-reader/route] error:", msg, err?.stack ?? err);
    return NextResponse.json(
      { ok: false, requestId, error: "UNHANDLED", details: msg },
      { status: 500 }
    );
  }
}