"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { banMember, unbanMember } from "@/app/actions";

// Shown next to a member's name, admin-only, everywhere a username appears
// on a thread. Banning requires an explicit confirm (it affects someone
// else's account); unbanning is a single click, same as the asymmetry
// between Pin and Delete elsewhere in this app -- undoing a ban is safe and
// reversible, so it doesn't need the same friction as applying one.
export default function BanButton({
  userId,
  banned,
}: {
  userId: string;
  banned: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function stop(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (banned) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <button
          type="button"
          disabled={isPending}
          onClick={(e) => {
            stop(e);
            startTransition(async () => {
              const result = await unbanMember(userId);
              if (result?.error) {
                setError(result.error);
              } else {
                router.refresh();
              }
            });
          }}
          className="text-sage-400 hover:text-sage-300 hover:underline"
        >
          {isPending ? "..." : "Unban"}
        </button>
        {error && <span className="text-red-400">{error}</span>}
      </span>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          setConfirming(true);
        }}
        className="text-red-400/70 hover:text-red-400 hover:underline"
      >
        Ban
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-cream/50">Ban this member?</span>
      <button
        type="button"
        disabled={isPending}
        onClick={(e) => {
          stop(e);
          startTransition(async () => {
            const result = await banMember(userId);
            if (result?.error) {
              setError(result.error);
            } else {
              setConfirming(false);
              router.refresh();
            }
          });
        }}
        className="font-medium text-red-400 hover:underline disabled:opacity-50"
      >
        {isPending ? "Banning..." : "Yes, ban"}
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

