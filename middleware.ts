// Refreshes the Supabase auth session on every request so signed-in users
// stay signed in, and Server Components always see an up-to-date session.
//
// Rewritten to the modern getAll/setAll cookie shape. The old per-cookie
// set()/remove() shape had a real bug here: each call reassigned `response`
// to a brand-new NextResponse.next(), which discarded any cookie already
// set on the previous `response` object. Supabase auth writes more than one
// cookie in the same request (a session refresh writes a new access token
// AND a new refresh token as separate cookies) -- with the old code, only
// the last cookie written in a given request actually made it to the
// browser, silently dropping the other. getAll/setAll below batches every
// cookie change into a single response instead, so nothing gets lost.
//
// Every cookie written here also passes through sessionScopedCookieOptions()
// (see lib/supabase/sessionScopedCookie.ts) so the auth cookie is a session
// cookie -- cleared when the browser fully closes -- rather than the
// 400-day cookie @supabase/ssr writes by default. This runs on every
// request, including the session refresh triggered by getUser() below, so
// it has to stay in place here too, not just in lib/supabase/server.ts.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sessionScopedCookieOptions } from "@/lib/supabase/sessionScopedCookie";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror the incoming request first so the rest of this request's
          // handling (Server Components etc.) sees the refreshed cookies too.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, sessionScopedCookieOptions(options));
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
