"use client";

import { useState } from "react";
import { createThread } from "@/app/actions";
import { CATEGORIES } from "@/lib/categories";

export default function NewThreadForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await createThread(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-cream/60">
          Category
        </label>
        <select
          name="category"
          defaultValue="General"
          className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream focus:border-sage-500 focus:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-cream/60">
          Title
        </label>
        <input
          name="title"
          required
          minLength={3}
          maxLength={200}
          className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream placeholder-cream/30 focus:border-sage-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-cream/60">
          Content
        </label>
        <textarea
          name="body"
          required
          rows={8}
          className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream placeholder-cream/30 focus:border-sage-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        className="rounded-full bg-sage-500 px-5 py-2 text-sm font-medium text-navy-950 transition hover:bg-sage-400"
      >
        Post thread
      </button>
    </form>
  );
}
