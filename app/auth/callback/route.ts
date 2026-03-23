import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const origin = url.origin;

    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next") ?? "/dashboard";

    // se veio sem code, volta pro login
    if (!code) {
        return NextResponse.redirect(`${origin}/login?mode=login`);
    }

    const supabase = createSupabaseServerClient();

    // troca o code por sessão + grava cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return NextResponse.redirect(
            `${origin}/login?mode=login&error=${encodeURIComponent("oauth_failed")}`
        );
    }

    return NextResponse.redirect(`${origin}${next}`);
}