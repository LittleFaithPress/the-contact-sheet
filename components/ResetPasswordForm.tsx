"use client";

import { useState } from "react";
import { updatePassword } from "@/app/actions";

export default function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    const result = await updatePassword(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-cream/60">
          New password
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
          Confirm new password
        </label>
        <input
          type="password"
          name="confirm"
          required
          minLength={8}
          className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream placeholder-cream/30 focus:border-sage-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-full bg-sage-500 px-4 py-2 text-sm font-medium text-navy-950 transition hover:bg-sage-400"
      >
        Update password
      </button>
    </form>
  );
}
