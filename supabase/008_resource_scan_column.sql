-- Adds the one column the VirusTotal integration needs that
-- 007_resources_and_downloads.sql didn't include -- the scanner's own
-- analysis id, so the admin review page can look up a scan's result later
-- (scanning is asynchronous; the result usually isn't ready the instant a
-- file is uploaded). Run this in the Supabase SQL editor AFTER 007.

alter table public.resources
  add column if not exists vt_analysis_id text;
