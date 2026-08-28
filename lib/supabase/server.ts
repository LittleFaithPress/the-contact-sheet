// Supabase client for use on the server (Server Components, Server Actions,
// Route Handlers). Reads/writes the auth session via cookies.
//
// Uses the modern getAll/setAll cookie shape (the older per-cookie get/set/
// remove shape is deprecated in @supabase/ssr, and middleware.ts had a real
// bug under it -- see that file). cookieOptions below sets explicit,
// hardened defaults for the auth cookies themselves: httpOnly so no
// in-page/injected JavaScript can read the session token, secure so the
// cookie is never sent over a plain http:// connection in production, and
// sameSite: "lax" so another site can't ride the browser's session cookie
// along on a request it triggers. setAll also runs every cookie through
// sessionScopedCookieOptions() -- see that file -- so the session cookie
// itself expires when the browser fully closes, instead of staying signed
// in for 400 days.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sessionScopedCookieOptions } from "./sessionScopedCookie";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
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
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, sessionScopedCookieOptions(options));
            });
          } catch {
            // Called from a Server Component that can't set cookies directly;
            // middleware.ts refreshes the session on every request instead.
          }
        },
      },
    }
  );
}
