"use client";

import { signOut } from "@/app/actions";

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="text-cream/70 hover:text-sage-400">
        Sign out
      </button>
    </form>
  );
}
