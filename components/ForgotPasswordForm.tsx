"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions";

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await requestPasswordReset(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <p className="rounded-md border border-sage-500/30 bg-sage-500/10 p-3 text-sm text-cream/80">
        If an account exists for that email, a reset link is on its way — check your inbox (and spam folder).
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-cream/80">
        Enter the email you signed up with and we&rsquo;ll send you a link to set a new password.
      </p>
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
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-full bg-sage-500 px-4 py-2 text-sm font-medium text-navy-950 transition hover:bg-sage-400"
        >
          Send reset link
        </button>
      </form>

      <p className="text-sm text-cream/80">
        <Link href="/login" className="text-sage-400 underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
