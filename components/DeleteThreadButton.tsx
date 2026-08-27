"use client";

import { useState, useTransition } from "react";
import { deleteThread } from "@/app/actions";

export default function DeleteThreadButton({ threadId }: { threadId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function stop(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          setConfirming(true);
        }}
        className="font-mono text-[11px] text-red-400/70 hover:text-red-400 hover:underline"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2 font-mono text-[11px]">
      <span className="text-cream/50">Delete this thread?</span>
      <button
        type="button"
        disabled={isPending}
        onClick={(e) => {
          stop(e);
          startTransition(async () => {
            const result = await deleteThread(threadId);
            if (result?.error) setError(result.error);
          });
        }}
        className="font-medium text-red-400 hover:underline disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          setConfirming(false);
        }}
        className="text-cream/50 hover:text-cream"
      >
        Cancel
      </button>
      {error && <span className="text-red-400">{error}</span>}
    </span>
  );
}
