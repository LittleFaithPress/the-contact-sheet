import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ThreadRow from "@/components/ThreadRow";
import SectionHeading from "@/components/SectionHeading";
import { CATEGORIES, CATEGORY_DESCRIPTIONS, isCategory } from "@/lib/categories";

// No auth check here on purpose -- this page is public. Anyone, signed in
// or not, can load it and read every thread.
export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = createClient();

  const activeCategory =
    searchParams.category && isCategory(searchParams.category)
      ? searchParams.category
      : null;

  let query = supabase
    .from("threads")
    .select(
      "id, title, body, created_at, author_id, category, pinned, profiles(username), replies(count)"
    )
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (activeCategory) {
    query = query.eq("category", activeCategory);
  }

  const { data: threads, error } = await query;

  const [{ count: threadCount }, { count: memberCount }] = await Promise.all([
    supabase.from("threads").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase.rpc("am_i_admin");
    isAdmin = data === true;
  }

  if (error) {
    return (
      <p className="text-red-400">
        Couldn't load threads right now. Try refreshing in a moment.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-3 border-b border-navy-700 pb-8 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-sage-400">
          A Field &amp; Frame Community
        </p>
        <h1 className="font-serif text-4xl font-semibold uppercase tracking-wide text-cream sm:text-5xl">
          The Contact Sheet
        </h1>
        <p className="font-serif italic text-cream/80">by fieldnframephoto</p>
        <div className="mx-auto h-px w-10 bg-navy-700" />
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream/55">
          {threadCount ?? 0} {threadCount === 1 ? "thread" : "threads"} &middot;{" "}
          {memberCount ?? 0} {memberCount === 1 ? "member" : "members"} &middot;
          open to read
        </p>
        {!user && (
          <p className="text-xs text-cream/60">
            Anyone can read every thread here — no account needed.{" "}
            <Link href="/signup" className="text-sage-400 underline hover:text-sage-300">
              Sign up
            </Link>{" "}
            only if you'd like to post or join the conversation.
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href="/"
          className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide transition ${
            !activeCategory
              ? "border-sage-500 bg-sage-500 text-navy-950"
              : "border-navy-600 text-cream/55 hover:border-sage-500/50 hover:text-cream"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/?category=${encodeURIComponent(c)}`}
            className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide transition ${
              activeCategory === c
                ? "border-sage-500 bg-sage-500 text-navy-950"
                : "border-navy-600 text-cream/55 hover:border-sage-500/50 hover:text-cream"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {activeCategory && (
        <p className="mx-auto max-w-md text-center text-xs leading-relaxed text-cream/55">
          {CATEGORY_DESCRIPTIONS[activeCategory]}
        </p>
      )}

      <div className="space-y-4">
        <SectionHeading
          eyebrow="Community"
          title={activeCategory ? `${activeCategory} Threads` : "Latest Threads"}
        />

        {threads.length === 0 ? (
          <div className="rounded-xl border border-navy-700 bg-navy-900 p-8 text-center text-sm text-cream/55">
            {activeCategory
              ? `No threads in ${activeCategory} yet.`
              : "No threads yet — be the first to post."}
          </div>
        ) : (
          <div className="divide-y divide-navy-700/60 overflow-hidden rounded-xl border border-navy-700 bg-navy-900">
            {threads.map((t: any) => (
              <ThreadRow
                key={t.id}
                id={t.id}
                title={t.title}
                body={t.body}
                createdAt={t.created_at}
                username={t.profiles?.username ?? "unknown"}
                category={t.category}
                pinned={t.pinned}
                replyCount={t.replies?.[0]?.count ?? 0}
                canDelete={isAdmin || user?.id === t.author_id}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
