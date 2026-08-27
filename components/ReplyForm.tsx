"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createReply } from "@/app/actions";

export default function ReplyForm({ threadId }: { threadId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createReply(threadId, formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    (document.getElementById("reply-form") as HTMLFormElement)?.reset();
    startTransition(() => router.refresh());
  }

  return (
    <form id="reply-form" action={handleSubmit} className="space-y-2">
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Add a reply..."
        className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-sm text-cream placeholder-cream/30 focus:border-sage-500 focus:outline-none"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-sage-500 px-5 py-1.5 text-sm font-medium text-navy-950 transition hover:bg-sage-400 disabled:opacity-50"
      >
        {isPending ? "Posting..." : "Reply"}
      </button>
    </form>
  );
}
