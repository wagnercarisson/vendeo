import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/security/sanitizeNextPath";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const origin = url.origin;

    const code = url.searchParams.get("code");
    const next = sanitizeNextPath(url.searchParams.get("next"), "/dashboard");

    if (!code) {
        return NextResponse.redirect(`${origin}/login?mode=login`);
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return NextResponse.redirect(
            `${origin}/login?mode=login&error=${encodeURIComponent("oauth_failed")}`
        );
    }

    return NextResponse.redirect(`${origin}${next}`);
}