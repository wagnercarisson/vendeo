import { NextResponse } from "next/server";
import { readVisualTarget } from "@/lib/visual-reader/service";
import { VisualReaderInputSchema, DEFAULT_VISUAL_READER_OUTPUT } from "@/lib/visual-reader/contracts";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = VisualReaderInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "invalid_request_body", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const reader = await readVisualTarget(parseResult.data);
    return NextResponse.json({ reader });
  } catch (error: unknown) {
    console.error("[sandbox/visual-reader/crop] error:", error);
    return NextResponse.json({ reader: DEFAULT_VISUAL_READER_OUTPUT });
  }
}