"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/app/actions";
import Turnstile, { resetTurnstile } from "@/components/Turnstile";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      resetTurnstile();
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="font-serif text-2xl italic text-cream">Sign up</h1>
      <p className="text-sm text-cream/80">
        We ask for a username, email, password, and your age — nothing else. Your age is only
        used to confirm you&rsquo;re 18 or older; it isn&rsquo;t stored.
      </p>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-cream/60">
            Username
          </label>
          <input
            name="username"
            required
            minLength={3}
            maxLength={24}
            className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream placeholder-cream/30 focus:border-sage-500 focus:outline-none"
          />
        </div>
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
          <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-cream/60">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream placeholder-cream/30 focus:border-sage-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-cream/60">
            How old are you?
          </label>
          <input
            type="number"
            name="age"
            required
            min={1}
            max={120}
            step={1}
            className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream placeholder-cream/30 focus:border-sage-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-cream/50">
            You must be 18 or older to create an account. This number is only used for that
            check — it isn&rsquo;t saved to your profile.
          </p>
        </div>
        <Turnstile />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-full bg-sage-500 px-4 py-2 text-sm font-medium text-navy-950 transition hover:bg-sage-400"
        >
          Create account
        </button>
      </form>

      <p className="text-sm text-cream/80">
        Already have an account?{" "}
        <Link href="/login" className="text-sage-400 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
