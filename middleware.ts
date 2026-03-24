import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { checkRateLimit } from "@/lib/security/rateLimit";

function isProtectedPath(pathname: string) {
  // ✅ tudo logado vive em /dashboard
  return pathname.startsWith("/dashboard");
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    // Basic rate limit for generation APIs even if not in dashboard (per IP)
    if (pathname.startsWith("/api/generate")) {
      const ip = request.ip ?? "127.0.0.1";
      const { success } = await checkRateLimit(`api-ip-${ip}`);
      if (!success) {
        return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
      }
    }
    return NextResponse.next();
  }

  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // ✅ padroniza com o layout: ?next=/dashboard/...
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // Specific rate limit for authenticated users on expensive routes (per User ID)
  if (pathname.startsWith("/api/generate")) {
    const { success, remaining, limit, reset } = await checkRateLimit(`api-user-${data.user.id}`);
    
    if (!success) {
      console.warn(`[RateLimit] User ${data.user.id} exceeded limit.`);
      return NextResponse.json(
        { 
          error: "too_many_requests", 
          retryAfter: Math.ceil((reset - Date.now()) / 1000) 
        }, 
        { status: 429 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/generate/:path*"],
};