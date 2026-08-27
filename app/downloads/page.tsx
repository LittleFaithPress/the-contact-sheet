import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SectionHeading from "@/components/SectionHeading";
import DeleteResourceButton from "@/components/DeleteResourceButton";
import { RESOURCE_CATEGORIES, RESOURCE_CATEGORY_DESCRIPTIONS } from "@/lib/resourceCategories";
import { formatFileSize } from "@/lib/format";

// Public page: every APPROVED resource is downloadable by anyone, signed in
// or not -- no auth check gates reading this page. Only uploading (the
// /downloads/upload page) requires a session.
export default async function DownloadsPage() {
  const supabase = createClient();

  const { data: resources, error } = await supabase
    .from("resources")
    .select(
      "id, title, description, category, file_path, file_name, file_size, created_at, uploader_id, profiles(username)"
    )
    .eq("approved", true)
    .order("created_at", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let pendingCount = 0;
  if (user) {
    const { data } = await supabase.rpc("am_i_admin");
    isAdmin = data === true;
    if (isAdmin) {
      const { count } = await supabase
        .from("resources")
        .select("id", { count: "exact", head: true })
        .eq("approved", false);
      pendingCount = count ?? 0;
    }
  }

  if (error) {
    return (
      <p className="text-red-400">
        Couldn't load downloads right now. Try refreshing in a moment.
      </p>
    );
  }

  // The storage bucket is deliberately not public (see the migration) --
  // this signed URL is the actual mechanism that makes a download work, not
  // just a plain link straight to the file. It expires after an hour.
  const withLinks = await Promise.all(
    (resources ?? []).map(async (r: any) => {
      const { data: signed } = await supabase.storage
        .from("resources")
        .createSignedUrl(r.file_path, 3600);
      return { ...r, downloadUrl: signed?.signedUrl ?? null };
    })
  );

  return (
    <div className="space-y-10">
      <div className="space-y-3 border-b border-navy-700 pb-8 text-center">
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-cream">
          Downloads
        </h1>
        <p className="mx-auto max-w-md text-sm text-cream/60">
          Free guides, LUTs, and preset packs from the community. Anyone can download &mdash; no
          account needed.
        </p>
        {user ? (
          <Link
            href="/downloads/upload"
            className="inline-block rounded-full bg-sage-500 px-4 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wide text-navy-950 transition hover:bg-sage-400"
          >
            Share something
          </Link>
        ) : (
          <p className="text-xs text-cream/60">
            <Link href="/signup" className="text-sage-400 underline hover:text-sage-300">
              Sign up
            </Link>{" "}
            if you'd like to share one yourself.
          </p>
        )}
        {isAdmin && pendingCount > 0 && (
          <p>
            <Link
              href="/downloads/review"
              className="font-mono text-xs text-sage-400 underline hover:text-sage-300"
            >
              {pendingCount} upload{pendingCount === 1 ? "" : "s"} waiting for review
            </Link>
          </p>
        )}
      </div>

      {RESOURCE_CATEGORIES.map((category) => {
        const items = withLinks.filter((r) => r.category === category);
        return (
          <div key={category} className="space-y-4">
            <SectionHeading eyebrow="Downloads" title={category} />
            <p className="text-xs text-cream/55">{RESOURCE_CATEGORY_DESCRIPTIONS[category]}</p>

            {items.length === 0 ? (
              <div className="rounded-xl border border-navy-700 bg-navy-900 p-6 text-center text-sm text-cream/55">
                Nothing here yet.
              </div>
            ) : (
              <div className="divide-y divide-navy-700/60 overflow-hidden rounded-xl border border-navy-700 bg-navy-900">
                {items.map((r) => (
                  <div key={r.id} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif text-lg text-cream">{r.title}</h3>
                        <p className="mt-1 text-sm text-cream/70">{r.description}</p>
                        <p className="mt-2 font-mono text-[11px] text-cream/45">
                          {r.profiles?.username ?? "unknown"} &middot; {formatFileSize(r.file_size)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {r.downloadUrl ? (
                          <a
                            href={r.downloadUrl}
                            className="rounded-full bg-sage-500 px-3.5 py-1.5 font-mono text-[11px] font-medium text-navy-950 transition hover:bg-sage-400"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="font-mono text-[11px] text-red-400/70">
                            Link unavailable
                          </span>
                        )}
                        {(isAdmin || user?.id === r.uploader_id) && (
                          <DeleteResourceButton resourceId={r.id} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
