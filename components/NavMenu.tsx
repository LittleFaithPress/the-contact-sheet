"use client";

import { useState } from "react";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import Pill from "@/components/Pill";

// All the nav data (username, isAdmin, etc.) is fetched server-side in
// Navbar.tsx and just handed down here as plain props -- this component's
// only job is the RESPONSIVE LAYOUT and the mobile menu's open/closed
// state, which is why it's the one split out as a client component instead
// of making the whole navbar client-side.
export default function NavMenu({
  signedIn,
  username,
  email,
  isAdmin,
  isBanned,
}: {
  signedIn: boolean;
  username: string | null;
  email: string | null;
  isAdmin: boolean;
  isBanned: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const links = (
    <>
      <Link href="/downloads" onClick={close} className="text-cream/70 hover:text-sage-400">
        Downloads
      </Link>
      {signedIn ? (
        <>
          <Link
            href="/new"
            onClick={close}
            className="rounded-full bg-sage-500 px-3.5 py-1.5 text-center font-medium text-navy-950 transition hover:bg-sage-400"
          >
            New thread
          </Link>
          <span className="flex items-center gap-1.5 text-cream/60">
            {username ?? email}
            {isAdmin && <Pill tone="sage">Admin</Pill>}
            {isBanned && <Pill tone="danger">Banned</Pill>}
          </span>
          <SignOutButton />
        </>
      ) : (
        <>
          <Link href="/login" onClick={close} className="text-cream/70 hover:text-sage-400">
            Log in
          </Link>
          <Link
            href="/signup"
            onClick={close}
            className="rounded-full bg-sage-500 px-3.5 py-1.5 text-center font-medium text-navy-950 transition hover:bg-sage-400"
          >
            Sign up
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      {/* Desktop / wide screens: the same single-row layout as before.
          Hidden below the `sm` breakpoint so it never has to fight for
          space with the site title on a phone-width screen. */}
      <div className="hidden items-center gap-4 font-mono text-xs sm:flex">{links}</div>

      {/* Phone-width screens: a hamburger button that expands into a
          stacked list below the header, instead of squeezing everything
          into one cramped row (the actual bug being fixed here). */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-navy-600 text-cream sm:hidden"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M2 2l14 14M16 2L2 16" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M2 4.5h14M2 9h14M2 13.5h14" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 border-b border-navy-700 bg-navy-900 px-4 py-4 shadow-lg sm:hidden">
          <div className="flex flex-col items-start gap-3 font-mono text-xs">{links}</div>
        </div>
      )}
    </>
  );
}
