import { NextResponse } from "next/server";
import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
import { ShortVideoRequestSchema } from "@/lib/domain/short-videos/schemas";
import { generateShortVideoContent } from "@/lib/domain/short-videos/service";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    // 1) Parse e validação do body
    const json = await req.json().catch(() => null);
    const body = ShortVideoRequestSchema.safeParse(json);

    if (!body.success) {
      return NextResponse.json(
        { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() },
        { status: 400 }
      );
    }

    // 2) Autenticação e autorização
    let storeId: string;
    try {
      ({ storeId } = await getUserStoreIdOrThrow());
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg === "not_authenticated") {
        return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
      }
      return NextResponse.json({ error: "store_not_found" }, { status: 403 });
    }

    // 3) Delega ao service
    const result = await generateShortVideoContent({
      campaign_id: body.data.campaign_id,
      storeId,
      force: body.data.force,
    });

    // 4) Retorna response
    if (result.ok === false) {
      return NextResponse.json(
        { 
          ok: false, 
          requestId, 
          error: result.error, 
          details: result.details 
        },
        { status: result.status }
      );
    }

    return NextResponse.json({
      ok: true,
      requestId,
      reused: result.reused,
      reels: result.video,
    });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "UNKNOWN_ERROR";
    console.error("[generate/reels] error:", msg, err?.stack ?? err);
    return NextResponse.json(
      { ok: false, requestId, error: "UNHANDLED", details: msg },
      { status: 500 }
    );
  }
}
