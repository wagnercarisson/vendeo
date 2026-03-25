import { NextResponse } from "next/server";
import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
import { DetailedFeedbackSchema } from "@/lib/domain/feedback/schemas";
import { saveDetailedFeedback } from "@/lib/domain/feedback/service";

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const body = DetailedFeedbackSchema.safeParse(json);

    if (body.success === false) {
      return NextResponse.json(
        { ok: false, error: "INVALID_INPUT", details: body.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, storeId } = await getUserStoreIdOrThrow();

    const result = await saveDetailedFeedback({
      user_id: userId,
      store_id: storeId,
      step: body.data.step,
      attempt: body.data.attempt,
      result: body.data.result,
      would_help_sales: body.data.wouldHelpSales,
      improvement: body.data.improvement,
      would_post: body.data.wouldPost,
      reason_not_post: body.data.reasonNotPost,
      score: body.data.score,
      allow_contact: body.data.allowContact,
      page_path: body.data.pagePath,
      user_agent: body.data.userAgent,
      campaign_id: body.data.campaignId,
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
    console.error("[api/feedback] error:", err);
    return NextResponse.json({ error: "UNHANDLED", details: msg }, { status: 500 });
  }
}
