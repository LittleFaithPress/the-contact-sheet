// Shared by middleware.ts and lib/supabase/server.ts.
//
// @supabase/ssr's cookie storage layer (node_modules/@supabase/ssr/dist/.../cookies.js)
// always computes a hardcoded 400-day Max-Age for any auth cookie it's
// setting -- `{ ...cookieOptions, maxAge: DEFAULT_COOKIE_OPTIONS.maxAge }` --
// which OVERRIDES whatever maxAge this app passes to createServerClient's
// cookieOptions. There is no supported way to shorten that from the options
// object handed to createServerClient: the override happens inside the
// library, after this app's options have already been merged in.
//
// The one place this app still controls the outcome is here, in the
// setAll() callback this app itself supplies -- the last stop before the
// cookie is actually written. Stripping maxAge/expires at that point turns
// the auth cookies into session cookies: the browser drops them once it's
// fully closed (not on a schedule, not just because one tab among several
// closed -- cookies aren't scoped per tab), instead of keeping a visitor
// signed in for over a year, which was the actual bug being fixed here.
//
// A real deletion is left untouched -- sign-out asks for maxAge: 0
// specifically so the browser removes the cookie immediately, and that has
// to survive this step unchanged or sign-out would silently stop working.
import type { CookieOptions } from "@supabase/ssr";

export function sessionScopedCookieOptions(options: CookieOptions): CookieOptions {
  if (options?.maxAge !== undefined && options.maxAge <= 0) {
    return options;
  }
  const { maxAge, expires, ...rest } = options;
  return rest;
}
