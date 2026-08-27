"use client";

import { useState, useTransition } from "react";
import { deleteReply } from "@/app/actions";

export default function DeleteReplyButton({
  replyId,
  threadId,
}: {
  replyId: string;
  threadId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-red-400/70 hover:text-red-400 hover:underline"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <span className="text-cream/50">Delete?</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const result = await deleteReply(replyId, threadId);
            if (result?.error) setError(result.error);
          });
        }}
        className="font-medium text-red-400 hover:underline disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Yes"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-cream/50 hover:text-cream"
      >
        Cancel
      </button>
      {error && <span className="text-red-400">{error}</span>}
    </span>
  );
}
