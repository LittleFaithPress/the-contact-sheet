-- Adds a rights attestation to both upload paths -- a thread photo and a
-- Downloads-page file. Whoever's uploading has to confirm they made it
-- (themselves or with AI) or otherwise have the right to share it, and
-- that confirmation is recorded with a timestamp, not just shown once and
-- forgotten. This is the same kind of evidentiary record as the signup
-- consent checkbox in 012_terms_acceptance.sql -- proof that the site
-- asked, not a guarantee anyone answered honestly.
--
-- Run this in the Supabase SQL editor AFTER 012_terms_acceptance.sql.
-- Safe to run even if some of this already exists.

-- 1. Thread photos -----------------------------------------------------------
-- A thread's photo is optional, so the attestation only matters when one is
-- actually attached. Rather than a NOT NULL column (which can't express
-- "required only sometimes"), this uses a CHECK constraint: enforced by
-- Postgres itself on every insert or update, regardless of whether it goes
-- through this app's own server action or a direct API call -- a thread
-- can never end up with an image_path set but no attestation timestamp.

alter table public.threads add column if not exists image_rights_attested_at timestamptz;

alter table public.threads drop constraint if exists threads_image_rights_attested_chk;
alter table public.threads add constraint threads_image_rights_attested_chk
  check (image_path is null or image_rights_attested_at is not null);

-- 2. Downloads-page files -----------------------------------------------------
-- Every resource submission includes a file, so this is required, full
-- stop -- same backfill-then-not-null pattern as legal_docs_accepted_at in
-- 012_terms_acceptance.sql: existing rows (uploaded before this migration,
-- if any) get stamped with their own created_at as an honest best-available
-- proxy, then the column is switched to not null so nothing new can skip it.

alter table public.resources add column if not exists rights_attested_at timestamptz;

update public.resources
  set rights_attested_at = created_at
  where rights_attested_at is null;

alter table public.resources alter column rights_attested_at set not null;

-- Neither column needs a visibility change: both threads and resources are
-- already public-read tables (schema.sql / 007_resources_and_downloads.sql),
-- and there's nothing sensitive about "an attestation happened at this
-- time" the way there is with the signup consent record -- no email or
-- other private detail is attached to it, just a timestamp.
