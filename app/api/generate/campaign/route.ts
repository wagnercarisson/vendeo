import { NextResponse } from "next/server";
import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
import { CampaignRequestSchema } from "@/lib/domain/campaigns/schemas";
import { generateCampaignContent } from "@/lib/domain/campaigns/service";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const json = await req.json().catch(() => null);
    const body = CampaignRequestSchema.safeParse(json);

    if (body.success === false) {
      return NextResponse.json(
        { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() },
        { status: 400 }
      );
    }

    let storeId: string;
    try {
      ({ storeId } = await getUserStoreIdOrThrow());
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg === "not_authenticated") {
        return NextResponse.json({ ok: false, requestId, error: "not_authenticated" }, { status: 401 });
      }
      return NextResponse.json({ ok: false, requestId, error: "store_not_found" }, { status: 403 });
    }

    const result = await generateCampaignContent({
      campaign_id: body.data.campaign_id,
      storeId,
      force: body.data.force,
      description: body.data.description,
      persist: body.data.persist,
    });

    if (result.ok === false) {
      return NextResponse.json(
        {
          ok: false,
          requestId,
          error: result.error,
          details: result.details,
        },
        { status: result.status }
      );
    }

    return NextResponse.json({ ...result, requestId });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "UNKNOWN_ERROR";
    console.error("[generate/campaign] error:", msg, err?.stack ?? err);
    return NextResponse.json(
      { ok: false, requestId, error: "UNHANDLED", details: msg },
      { status: 500 }
    );
  }
}