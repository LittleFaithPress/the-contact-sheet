import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import Pill from "@/components/Pill";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  let isAdmin = false;
  if (user) {
    const [{ data: profile }, { data: adminCheck }] = await Promise.all([
      supabase.from("profiles").select("username").eq("id", user.id).single(),
      supabase.rpc("am_i_admin"),
    ]);
    username = profile?.username ?? null;
    isAdmin = adminCheck === true;
  }

  return (
    <header className="border-b border-navy-700 bg-navy-900">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link
          href="/"
          className="font-serif text-lg font-semibold uppercase tracking-wide text-cream"
        >
          The Contact Sheet
        </Link>
        <div className="flex items-center gap-4 font-mono text-xs">
          <Link href="/downloads" className="text-cream/70 hover:text-sage-400">
            Downloads
          </Link>
          {user ? (
            <>
              <Link
                href="/new"
                className="rounded-full bg-sage-500 px-3.5 py-1.5 font-medium text-navy-950 transition hover:bg-sage-400"
              >
                New thread
              </Link>
              <span className="flex items-center gap-1.5 text-cream/60">
                {username ?? user.email}
                {isAdmin && <Pill tone="sage">Admin</Pill>}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-cream/70 hover:text-sage-400">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-sage-500 px-3.5 py-1.5 font-medium text-navy-950 transition hover:bg-sage-400"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
