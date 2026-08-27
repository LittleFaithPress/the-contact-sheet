"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/app/actions";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const checkEmail = searchParams.get("checkEmail");

  async function handleSubmit(formData: FormData) {
    const result = await signIn(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="font-serif text-2xl italic text-cream">Log in</h1>

      {checkEmail && (
        <p className="rounded-md border border-sage-500/30 bg-sage-500/10 p-3 text-sm text-cream/80">
          Check your email for a confirmation link before logging in.
        </p>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-cream/60">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream placeholder-cream/30 focus:border-sage-500 focus:outline-none"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block font-mono text-xs uppercase tracking-wide text-cream/60">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="font-mono text-[11px] text-sage-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            required
            className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream placeholder-cream/30 focus:border-sage-500 focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-full bg-sage-500 px-4 py-2 text-sm font-medium text-navy-950 transition hover:bg-sage-400"
        >
          Log in
        </button>
      </form>

      <p className="text-sm text-cream/80">
        No account?{" "}
        <Link href="/signup" className="text-sage-400 underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
