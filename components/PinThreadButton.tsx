"use client";

import { useState, useTransition } from "react";
import { pinThread } from "@/app/actions";

export default function PinThreadButton({
  threadId,
  pinned,
}: {
  threadId: string;
  pinned: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function stop(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={(e) => {
          stop(e);
          startTransition(async () => {
            const result = await pinThread(threadId, !pinned);
            if (result?.error) setError(result.error);
          });
        }}
        className={
          pinned
            ? "text-sage-400 hover:text-sage-300 hover:underline"
            : "text-cream/50 hover:text-sage-400 hover:underline"
        }
      >
        {isPending ? "..." : pinned ? "Unpin" : "Pin"}
      </button>
      {error && <span className="text-red-400">{error}</span>}
    </span>
  );
}
