// A thin wrapper around VirusTotal's public API v3, used to automatically
// scan every uploaded resource before an admin reviews it.
//
// Deliberately fails soft everywhere: if VIRUSTOTAL_API_KEY isn't set, or
// any call to VirusTotal itself fails (rate limit, network issue, VT
// downtime), these functions return null instead of throwing. An upload
// should never be blocked or broken by the scanner being unavailable --
// worst case, a resource just sits with scan_status = 'pending' and an
// admin reviews it manually, same as if this integration didn't exist.

const VT_BASE = "https://www.virustotal.com/api/v3";

export type VtSubmitResult = { analysisId: string } | null;

export type VtAnalysisResult =
  | { status: "queued" }
  | { status: "completed"; malicious: number; suspicious: number; harmless: number; undetected: number }
  | null;

export async function submitFileForScan(file: File): Promise<VtSubmitResult> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;

  try {
    // VirusTotal's plain /files endpoint only accepts files up to 32MB;
    // requesting an upload URL first works for any size up to 650MB, so we
    // always go through it rather than branching on file size ourselves.
    const uploadUrlRes = await fetch(`${VT_BASE}/files/upload_url`, {
      headers: { "x-apikey": apiKey },
    });
    if (!uploadUrlRes.ok) return null;
    const { data: uploadUrl } = (await uploadUrlRes.json()) as { data: string };

    const body = new FormData();
    body.append("file", file);

    const submitRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "x-apikey": apiKey },
      body,
    });
    if (!submitRes.ok) return null;

    const submitJson = (await submitRes.json()) as { data?: { id?: string } };
    const analysisId = submitJson.data?.id;
    if (!analysisId) return null;

    return { analysisId };
  } catch {
    // Network failure, VT downtime, etc. -- fail soft, see file header.
    return null;
  }
}

export async function getScanResult(analysisId: string): Promise<VtAnalysisResult> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${VT_BASE}/analyses/${analysisId}`, {
      headers: { "x-apikey": apiKey },
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      data?: {
        attributes?: {
          status?: string;
          stats?: { malicious?: number; suspicious?: number; harmless?: number; undetected?: number };
        };
      };
    };

    const status = json.data?.attributes?.status;
    if (status !== "completed") return { status: "queued" };

    const stats = json.data?.attributes?.stats ?? {};
    return {
      status: "completed",
      malicious: stats.malicious ?? 0,
      suspicious: stats.suspicious ?? 0,
      harmless: stats.harmless ?? 0,
      undetected: stats.undetected ?? 0,
    };
  } catch {
    return null;
  }
}

// Turns a completed VT result into the plain-language summary stored on the
// resources row and shown to the admin reviewing it.
export function summarizeVtResult(result: { malicious: number; suspicious: number }): {
  status: "clean" | "flagged";
  summary: string;
} {
  const flags = result.malicious + result.suspicious;
  if (flags === 0) {
    return { status: "clean", summary: "0 security vendors flagged this file." };
  }
  return {
    status: "flagged",
    summary: `${flags} security vendor${flags === 1 ? "" : "s"} flagged this file -- do not approve without checking it yourself.`,
  };
}
