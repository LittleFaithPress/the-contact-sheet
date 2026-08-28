import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NavMenu from "@/components/NavMenu";
import InactivityLogout from "@/components/InactivityLogout";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  let isAdmin = false;
  let isBanned = false;
  if (user) {
    const [{ data: profile }, { data: adminCheck }] = await Promise.all([
      supabase.from("profiles").select("username, banned").eq("id", user.id).single(),
      supabase.rpc("am_i_admin"),
    ]);
    username = profile?.username ?? null;
    isAdmin = adminCheck === true;
    isBanned = profile?.banned === true;
  }

  return (
    <header className="border-b border-navy-700 bg-navy-900">
      <InactivityLogout signedIn={!!user} />
      {/* `relative` here is what the mobile dropdown menu in NavMenu.tsx
          anchors itself against (it's positioned `absolute inset-x-0
          top-full`) -- without this, it would position against the whole
          page instead of just this header. */}
      <nav className="relative mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:py-5">
        <Link
          href="/"
          className="whitespace-nowrap font-serif text-base font-semibold uppercase tracking-wide text-cream sm:text-lg"
        >
          The Contact Sheet
        </Link>
        <NavMenu
          signedIn={!!user}
          username={username}
          email={user?.email ?? null}
          isAdmin={isAdmin}
          isBanned={isBanned}
        />
      </nav>
    </header>
  );
}
