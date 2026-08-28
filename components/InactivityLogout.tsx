"use client";

// Signs a member out after 10 minutes with no interaction on the site.
// Rendered by Navbar.tsx, which already knows whether anyone's signed in --
// see that file. Nothing here does anything for a signed-out visitor.
//
// Tracks activity via localStorage (not just this tab's own events) so that
// being idle in one tab doesn't sign a member out while they're actively
// using the site in another tab open to the same site: every tab writes its
// own activity to the same shared key, and every tab's timer reads that
// shared value rather than trusting only what it personally observed.
import { useEffect } from "react";
import { signOut } from "@/app/actions";

const TIMEOUT_MS = 10 * 60 * 1000;
// Checked periodically rather than with one long-lived setTimeout so a
// tab that was asleep/throttled in the background (and so missed the
// activity another tab recorded) still notices the shared timestamp
// on its next check, instead of firing on stale information.
const CHECK_INTERVAL_MS = 15 * 1000;
const STORAGE_KEY = "cs-last-activity";
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "wheel"] as const;

export default function InactivityLogout({ signedIn }: { signedIn: boolean }) {
  useEffect(() => {
    if (!signedIn) return;

    const markActive = () => {
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        // Private browsing / storage disabled -- this tab just won't see
        // other tabs' activity, and falls back to its own events only.
      }
    };

    markActive();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, markActive, { passive: true }));

    let firedSignOut = false;
    const interval = setInterval(() => {
      if (firedSignOut) return;
      let last = Date.now();
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) last = Number(stored);
      } catch {
        // Can't read shared activity -- treat this instant as "active" so a
        // storage error never causes a false sign-out.
      }
      if (Date.now() - last >= TIMEOUT_MS) {
        firedSignOut = true;
        signOut();
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, markActive));
      clearInterval(interval);
    };
  }, [signedIn]);

  return null;
}
