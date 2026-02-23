import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();

  await supabase.auth.signOut();

  // Redireciona pro login no mesmo host atual (funciona local e na Vercel)
  const url = new URL(request.url);
  url.pathname = "/login";
  url.search = "";

  return NextResponse.redirect(url);
}