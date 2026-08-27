import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReplyForm from "@/components/ReplyForm";
import Avatar from "@/components/Avatar";
import Pill from "@/components/Pill";
import SectionHeading from "@/components/SectionHeading";
import DeleteThreadButton from "@/components/DeleteThreadButton";
import DeleteReplyButton from "@/components/DeleteReplyButton";
import PinThreadButton from "@/components/PinThreadButton";
import BanButton from "@/components/BanButton";

// Public page: the thread and every reply load for anyone. Only the reply
// FORM below is gated on being signed in -- reading is always open.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ThreadPage({ params }: { params: { id: string } }) {
  // Cheap defense-in-depth: a thread id is always a UUID, so anything else in
  // the URL can't possibly match a real thread. This isn't fixing a real bug
  // (Supabase already returns a clean "not found" for a malformed id, tested
  // as part of this review) -- it just skips a pointless round-trip to the
  // database for obviously-bad input.
  if (!UUID_RE.test(params.id)) notFound();

  const supabase = createClient();

  const { data: thread, error: threadError } = await supabase
    .from("threads")
    .select(
      "id, title, body, created_at, author_id, category, pinned, profiles(username, banned)"
    )
    .eq("id", params.id)
    .single();

  if (threadError || !thread) notFound();

  const { data: replies } = await supabase
    .from("replies")
    .select("id, body, created_at, author_id, profiles(username, banned)")
    .eq("thread_id", params.id)
    .order("created_at", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let viewerBanned = false;
  if (user) {
    const [{ data: isAdminData }, { data: viewerProfile }] = await Promise.all([
      supabase.rpc("am_i_admin"),
      supabase.from("profiles").select("banned").eq("id", user.id).single(),
    ]);
    isAdmin = isAdminData === true;
    viewerBanned = viewerProfile?.banned === true;
  }

  const author = (thread as any).profiles?.username ?? "unknown";
  const authorBanned = (thread as any).profiles?.banned === true;
  const canDeleteThread = isAdmin || user?.id === (thread as any).author_id;
  const replyCount = replies?.length ?? 0;

  return (
    <div className="space-y-8">
      <Link href="/" className="font-mono text-xs text-cream/55 hover:text-sage-400">
        &larr; Back to all threads
      </Link>

      <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {thread.pinned && <Pill tone="sage">&#128204; Pinned</Pill>}
          <Pill>{thread.category}</Pill>
        </div>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
          <h1 className="font-serif text-2xl text-cream">{thread.title}</h1>
          {(isAdmin || canDeleteThread) && (
            <div className="flex items-center gap-3 font-mono text-[11px]">
              {isAdmin && (
                <PinThreadButton threadId={thread.id} pinned={thread.pinned} />
              )}
              {canDeleteThread && <DeleteThreadButton threadId={thread.id} />}
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-cream/55">
          <Avatar username={author} />
          <span>{author}</span>
          {authorBanned && <Pill tone="danger">Banned</Pill>}
          <span className="text-navy-500">&middot;</span>
          <span>{new Date(thread.created_at).toLocaleString()}</span>
          {isAdmin && user?.id !== (thread as any).author_id && (
            <>
              <span className="text-navy-500">&middot;</span>
              <BanButton userId={(thread as any).author_id} banned={authorBanned} />
            </>
          )}
        </div>

        <p className="mt-4 whitespace-pre-wrap text-cream/80">{thread.body}</p>
      </div>

      <div className="space-y-4">
        <SectionHeading
          eyebrow="Discussion"
          title={`${replyCount} ${replyCount === 1 ? "Reply" : "Replies"}`}
        />

        {replyCount === 0 ? (
          <p className="text-sm text-cream/55">No replies yet — be the first.</p>
        ) : (
          <div className="divide-y divide-navy-700/60 overflow-hidden rounded-xl border border-navy-700 bg-navy-900">
            {replies!.map((r: any) => (
              <div key={r.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-cream/55">
                  <Avatar username={r.profiles?.username ?? "unknown"} />
                  <span>{r.profiles?.username ?? "unknown"}</span>
                  {r.profiles?.banned && <Pill tone="danger">Banned</Pill>}
                  <span className="text-navy-500">&middot;</span>
                  <span>{new Date(r.created_at).toLocaleString()}</span>
                  {isAdmin && user?.id !== r.author_id && (
                    <>
                      <span className="text-navy-500">&middot;</span>
                      <BanButton userId={r.author_id} banned={r.profiles?.banned === true} />
                    </>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-cream/85">
                  {r.body}
                </p>
                {(isAdmin || user?.id === r.author_id) && (
                  <div className="mt-2 flex justify-end font-mono text-[11px]">
                    <DeleteReplyButton replyId={r.id} threadId={thread.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {user && viewerBanned ? (
        <p className="rounded-xl border border-red-500/30 bg-navy-900 p-4 text-sm text-cream/70">
          Your account has been banned from posting.
        </p>
      ) : user ? (
        <ReplyForm threadId={thread.id} />
      ) : (
        <p className="rounded-xl border border-navy-700 bg-navy-900 p-4 text-sm text-cream/70">
          <Link href="/login" className="font-medium text-sage-400 underline">
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="font-medium text-sage-400 underline">
            sign up
          </Link>{" "}
          to reply.
        </p>
      )}
    </div>
  );
}
