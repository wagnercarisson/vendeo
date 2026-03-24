import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ratelimit } from "@/lib/ratelimit";

function isProtectedPath(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/api/generate");
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
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

  // --- Rate Limiting para rotas de geração ---
  if (pathname.startsWith("/api/generate")) {
    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(data.user.id);
      
      if (!success) {
        return NextResponse.json(
          { 
            error: "TOO_MANY_REQUESTS", 
            message: "Você atingiu o limite de gerações. Tente novamente em alguns segundos.",
            resetAt: new Date(reset).toISOString()
          },
          { 
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            }
          }
        );
      }
    } catch (rlError) {
      console.error("[middleware] Rate limit error:", rlError);
      // Se o Upstash falhar, deixamos passar para não bloquear o usuário legítimo
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/generate/:path*"],
};