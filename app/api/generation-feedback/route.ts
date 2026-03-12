import { NextResponse } from "next/server";
import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
import { GenerationFeedbackSchema } from "@/lib/domain/feedback/schemas";
import { saveGenerationFeedback } from "@/lib/domain/feedback/service";

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const body = GenerationFeedbackSchema.safeParse(json);

    if (body.success === false) {
      return NextResponse.json(
        { ok: false, error: "INVALID_INPUT", details: body.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, storeId } = await getUserStoreIdOrThrow();

    const result = await saveGenerationFeedback({
      user_id: userId,
      store_id: storeId,
      campaign_id: body.data.campaignId ?? undefined,
      weekly_plan_id: body.data.weeklyPlanId ?? undefined,
      content_type: body.data.contentType,
      vote: body.data.vote,
      reason: body.data.reason ?? undefined,
      would_post: body.data.wouldPost ?? undefined,
      page_path: body.data.pagePath,
      user_agent: body.data.userAgent,
    });

    if (result.ok === false) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = String(err?.message || "unknown");
    if (msg === "not_authenticated") {
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    }
    console.error("[api/generation-feedback] error:", err);
    return NextResponse.json({ error: "UNHANDLED", details: msg }, { status: 500 });
  }
}
