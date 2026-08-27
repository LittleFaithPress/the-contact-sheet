import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SectionHeading from "@/components/SectionHeading";
import ApproveResourceButton from "@/components/ApproveResourceButton";
import RejectResourceButton from "@/components/RejectResourceButton";
import { formatFileSize } from "@/lib/format";
import { getScanResult, summarizeVtResult } from "@/lib/virustotal";

// Admin-only. The real gate is still Row Level Security -- this page can
// only ever see a pending resource in the first place because of the
// "Admins can see every resource" policy in 007_resources_and_downloads.sql
// -- this redirect is just so a non-admin never sees the page shell at all.
export default async function ReviewResourcesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) redirect("/downloads");

  const { data: pendingRaw } = await supabase
    .from("resources")
    .select(
      "id, title, description, category, file_path, file_name, file_size, mime_type, created_at, uploader_id, scan_status, scan_result, vt_analysis_id, profiles(username)"
    )
    .eq("approved", false)
    .order("created_at", { ascending: true });

  const items = pendingRaw ?? [];

  // Check for a fresher scan result for anything still "pending" with a
  // scan actually in flight. Capped at 4 checks per page load to stay under
  // VirusTotal's free-tier rate limit (4 requests/minute) -- reloading the
  // page catches the rest a few seconds later.
  let checksUsed = 0;
  for (const item of items as any[]) {
    if (item.scan_status === "pending" && item.vt_analysis_id && checksUsed < 4) {
      checksUsed++;
      const result = await getScanResult(item.vt_analysis_id);
      if (result?.status === "completed") {
        const { status, summary } = summarizeVtResult(result);
        await supabase
          .from("resources")
          .update({ scan_status: status, scan_result: summary, scanned_at: new Date().toISOString() })
          .eq("id", item.id);
        item.scan_status = status;
        item.scan_result = summary;
      }
    }
  }

  // A signed preview link works here for the same reason it works on the
  // public downloads page -- except this one is only reachable because
  // 007's storage policy separately lets an admin read a still-pending
  // file, not the "approved" one everyone else relies on.
  const withPreviews = await Promise.all(
    (items as any[]).map(async (r) => {
      const { data: signed } = await supabase.storage
        .from("resources")
        .createSignedUrl(r.file_path, 3600);
      return { ...r, previewUrl: signed?.signedUrl ?? null };
    })
  );

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Admin" title="Uploads waiting for review" />

      {withPreviews.length === 0 ? (
        <p className="text-sm text-cream/55">Nothing pending right now.</p>
      ) : (
        <div className="divide-y divide-navy-700/60 overflow-hidden rounded-xl border border-navy-700 bg-navy-900">
          {withPreviews.map((r) => (
            <div key={r.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-lg text-cream">{r.title}</h3>
                  <p className="mt-1 text-sm text-cream/70">{r.description}</p>
                  <p className="mt-2 font-mono text-[11px] text-cream/45">
                    {r.category} &middot; {r.profiles?.username ?? "unknown"} &middot;{" "}
                    {formatFileSize(r.file_size)} &middot; {r.mime_type}
                  </p>
                </div>
                {r.previewUrl && (
                  <a
                    href={r.previewUrl}
                    className="shrink-0 rounded-full border border-navy-600 px-3 py-1 font-mono text-[11px] text-cream/70 transition hover:border-sage-500/50 hover:text-cream"
                  >
                    Preview / download to check
                  </a>
                )}
              </div>

              <p
                className={`font-mono text-[11px] ${
                  r.scan_status === "flagged"
                    ? "text-red-400"
                    : r.scan_status === "clean"
                    ? "text-sage-400"
                    : "text-cream/45"
                }`}
              >
                Scan:{" "}
                {r.scan_status === "pending"
                  ? r.vt_analysis_id
                    ? "still scanning -- reload this page in a bit"
                    : "scanning isn't set up yet -- check the file yourself before approving"
                  : r.scan_result}
              </p>

              <div className="flex items-center gap-4">
                <ApproveResourceButton resourceId={r.id} />
                <RejectResourceButton resourceId={r.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
