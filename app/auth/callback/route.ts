// Handles the link Supabase emails for confirmation / password reset / OAuth.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Where to send the user once the code is exchanged -- defaults to home,
  // but the password-reset flow passes ?next=/reset-password so they land
  // there instead. Only a same-site relative path is honored, so this can't
  // be turned into an open redirect.
  const rawNext = searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") ? rawNext : "/";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
