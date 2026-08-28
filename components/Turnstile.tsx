"use client";

import Script from "next/script";

// Cloudflare Turnstile: a free, privacy-friendly CAPTCHA widget.
//
// Rendered here in Turnstile's own "implicit" mode -- the div below is all
// that's needed. Cloudflare's script finds it, renders the widget, and
// automatically injects a hidden `cf-turnstile-response` input into the
// SAME <form> this div sits inside once someone completes it. That means it
// shows up in FormData like every other field, with no extra wiring on this
// end -- the matching server action in app/actions.ts just reads that field
// and passes it to Supabase as `captchaToken`.
//
// If NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set, this quietly renders nothing
// and the form behaves exactly as it did before -- see README.md for how to
// get a free site key and turn this on.
declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export default function Turnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenge.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="dark" />
    </>
  );
}

// Call after a failed submit so a retry doesn't get rejected for reusing an
// already-spent (or, after a few minutes, expired) token. Safe to call even
// if Turnstile isn't configured or hasn't finished loading yet.
export function resetTurnstile() {
  if (typeof window !== "undefined") {
    window.turnstile?.reset();
  }
}
