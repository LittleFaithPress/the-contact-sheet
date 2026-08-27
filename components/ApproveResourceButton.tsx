"use client";

import { useState, useTransition } from "react";
import { approveResource } from "@/app/actions";

export default function ApproveResourceButton({ resourceId }: { resourceId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const result = await approveResource(resourceId);
            if (result?.error) setError(result.error);
          });
        }}
        className="rounded-full bg-sage-500 px-3 py-1 font-mono text-[11px] font-medium text-navy-950 transition hover:bg-sage-400 disabled:opacity-50"
      >
        {isPending ? "Approving..." : "Approve"}
      </button>
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </span>
  );
}
