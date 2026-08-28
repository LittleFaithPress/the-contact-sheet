"use client";

import { useState } from "react";
import { uploadResource } from "@/app/actions";
import { RESOURCE_CATEGORIES } from "@/lib/resourceCategories";

export default function UploadResourceForm() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    const result = await uploadResource(formData);
    setSubmitting(false);
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
          defaultValue={RESOURCE_CATEGORIES[0]}
          className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream focus:border-sage-500 focus:outline-none"
        >
          {RESOURCE_CATEGORIES.map((c) => (
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
          maxLength={150}
          className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream placeholder-cream/30 focus:border-sage-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-cream/60">
          Description
        </label>
        <textarea
          name="description"
          required
          rows={4}
          maxLength={2000}
          className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream placeholder-cream/30 focus:border-sage-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-cream/60">
          File
        </label>
        <input
          type="file"
          name="file"
          required
          accept=".pdf,.zip,.jpg,.jpeg,.png"
          className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream file:mr-3 file:rounded-full file:border-0 file:bg-sage-500 file:px-3 file:py-1 file:text-navy-950"
        />
        <p className="mt-1 text-[11px] text-cream/45">PDF, ZIP, JPG, or PNG. 50 MB max.</p>
      </div>
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          name="rightsAttested"
          id="rightsAttested"
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy-600 bg-navy-900 text-sage-500 focus:ring-sage-500"
        />
        <label htmlFor="rightsAttested" className="text-xs leading-relaxed text-cream/70">
          I created this myself (including with AI tools) or otherwise have the right to share it
          here.
        </label>
      </div>
      <p className="text-[11px] text-cream/45">
        Uploads are reviewed by an admin -- including an automatic security scan -- before
        they're visible to anyone else. This usually takes a little while, not instantly.
      </p>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-sage-500 px-5 py-2 text-sm font-medium text-navy-950 transition hover:bg-sage-400 disabled:opacity-50"
      >
        {submitting ? "Uploading..." : "Submit for review"}
      </button>
    </form>
  );
}
