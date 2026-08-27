import Link from "next/link";
import Avatar from "@/components/Avatar";
import Pill from "@/components/Pill";
import DeleteThreadButton from "@/components/DeleteThreadButton";
import PinThreadButton from "@/components/PinThreadButton";

type ThreadRowProps = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  username: string;
  authorBanned?: boolean;
  category: string;
  pinned: boolean;
  replyCount: number;
  canDelete?: boolean;
  isAdmin?: boolean;
};

// A single row inside the divided thread-list card on the home page --
// deliberately has no border/corners of its own, so a run of these reads as
// one continuous list (like a table of contents) rather than a stack of
// separate boxes.
export default function ThreadRow({
  id,
  title,
  body,
  createdAt,
  username,
  authorBanned = false,
  category,
  pinned,
  replyCount,
  canDelete = false,
  isAdmin = false,
}: ThreadRowProps) {
  return (
    <div className={`p-4 transition ${pinned ? "bg-sage-500/[0.05]" : "hover:bg-navy-800/50"}`}>
      <div className="flex items-start justify-between gap-4">
        <Link href={`/thread/${id}`} className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {pinned && <Pill tone="sage">&#128204; Pinned</Pill>}
            <Pill>{category}</Pill>
          </div>
          <h2 className="mt-1.5 font-serif text-lg text-cream">{title}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-cream/70">{body}</p>
        </Link>

        <div className="flex shrink-0 flex-col items-end gap-1 text-right">
          <span className="font-mono text-xs text-sage-400">
            {replyCount} {replyCount === 1 ? "reply" : "replies"}
          </span>
          <span className="font-mono text-[10px] text-cream/55">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-cream/55">
        <div className="flex items-center gap-2">
          <Avatar username={username} />
          <span>{username}</span>
          {authorBanned && <Pill tone="danger">Banned</Pill>}
        </div>
        {(canDelete || isAdmin) && (
          <div className="flex items-center gap-3">
            {isAdmin && <PinThreadButton threadId={id} pinned={pinned} />}
            {canDelete && <DeleteThreadButton threadId={id} />}
          </div>
        )}
      </div>
    </div>
  );
}
