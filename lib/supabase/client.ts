// Supabase client for use in the browser (Client Components).
//
// This is left at @supabase/ssr's default cookie handling (not httpOnly)
// deliberately, not as an oversight: a browser-side client that's ever
// actually used to sign a user in/out from client-side JS needs to be able
// to read and write its own session cookie. It's currently unused anywhere
// in the app (auth all happens through Server Actions via
// lib/supabase/server.ts, which IS hardened with httpOnly cookies -- see
// that file) -- so today nothing depends on this file's cookies being
// readable by JS. If this ever starts being used for real client-side auth,
// revisit whether it still needs to be.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
