-- Adds the free downloads page: guides, LUTs, and preset packs anyone can
-- download WITHOUT an account, uploaded only by signed-in members and only
-- visible to the public after an admin approves them.
--
-- Run this in the Supabase SQL editor AFTER 006_fix_delete_policies.sql.
-- Safe to run even if some of this already exists.

-- 1. The resources table -----------------------------------------------------
-- One row per uploaded file. `approved` starts false and can only ever be
-- flipped by an admin (enforced below, the same pattern as
-- enforce_profile_role_column in 005) -- an uploader has no way, through the
-- app or a direct API call, to publish their own upload.

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 150),
  description text not null check (char_length(description) between 1 and 2000),
  category text not null check (category in ('Guide', 'LUT', 'Preset Pack')),
  file_path text not null unique,
  file_name text not null,
  file_size bigint not null,
  mime_type text not null,
  uploader_id uuid not null references public.profiles (id) on delete cascade,
  approved boolean not null default false,
  scan_status text not null default 'pending' check (scan_status in ('pending', 'clean', 'flagged', 'error')),
  scan_result text,
  scanned_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.resources enable row level security;

-- Public read: only ever the approved ones -- this is the "download without
-- an account" half. A pending upload simply doesn't exist as far as a signed
-- out visitor, or any other member, can tell.
drop policy if exists "Approved resources are publicly readable" on public.resources;
create policy "Approved resources are publicly readable"
  on public.resources for select
  using (approved = true);

-- An uploader can see their own pending upload's status (so they know it's
-- awaiting review), and an admin can see every pending upload (so there's
-- something to review in the first place).
drop policy if exists "Uploaders can see their own uploads" on public.resources;
create policy "Uploaders can see their own uploads"
  on public.resources for select
  to authenticated
  using (auth.uid() = uploader_id);

drop policy if exists "Admins can see every resource" on public.resources;
create policy "Admins can see every resource"
  on public.resources for select
  to authenticated
  using (public.am_i_admin());

-- Upload: signed-in only, always starts unapproved. The `approved = false`
-- check here stops someone from trying to insert a row that's already
-- approved -- combined with the trigger below, there is no path, through the
-- app or a direct API call, for an uploader to publish their own file.
drop policy if exists "Signed-in users can submit a resource" on public.resources;
create policy "Signed-in users can submit a resource"
  on public.resources for insert
  to authenticated
  with check (auth.uid() = uploader_id and approved = false);

-- Only an admin can ever flip `approved`, regardless of who owns the row --
-- same SECURITY DEFINER pattern as 005's role-column trigger, for the same
-- reason: this has to hold even against a direct API call, not just the UI.
create or replace function public.enforce_resource_approval_column()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.approved is distinct from old.approved and not public.am_i_admin() then
    raise exception 'Only an admin can approve a resource.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_resource_approval_column on public.resources;
create trigger enforce_resource_approval_column
  before update on public.resources
  for each row execute procedure public.enforce_resource_approval_column();

drop policy if exists "Uploader can edit their own resource" on public.resources;
create policy "Uploader can edit their own resource"
  on public.resources for update
  to authenticated
  using (auth.uid() = uploader_id);

drop policy if exists "Admins can update any resource" on public.resources;
create policy "Admins can update any resource"
  on public.resources for update
  to authenticated
  using (public.am_i_admin());

drop policy if exists "Uploader or admin can delete a resource" on public.resources;
create policy "Uploader or admin can delete a resource"
  on public.resources for delete
  to authenticated
  using (auth.uid() = uploader_id or public.am_i_admin());

create index if not exists resources_approved_created_at_idx
  on public.resources (approved, created_at desc);

-- 2. The storage bucket itself ------------------------------------------------
-- Deliberately created NOT public -- visibility is entirely controlled by the
-- policies below, which check the matching row in `resources` rather than
-- trusting the bucket's own public/private flag. `allowed_mime_types` blocks
-- anything that isn't a PDF, a ZIP archive, or an image at the storage layer
-- itself -- not just as a hint in the upload form, which a direct API call
-- could ignore.

insert into storage.buckets (id, name, public)
values ('resources', 'resources', false)
on conflict (id) do nothing;

update storage.buckets
set
  allowed_mime_types = array[
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png'
  ],
  file_size_limit = 52428800  -- 50 MB, Supabase's own free-tier per-file cap
where id = 'resources';

-- Anyone -- including a signed-out visitor -- can download a file whose
-- matching resources row is approved. This is the actual enforcement point
-- for "download without an account, but only once it's been approved" --
-- not the bucket's public flag, and not anything in the app's UI.
drop policy if exists "Download only if the matching resource is approved" on storage.objects;
create policy "Download only if the matching resource is approved"
  on storage.objects for select
  using (
    bucket_id = 'resources'
    and exists (
      select 1 from public.resources r
      where r.file_path = storage.objects.name and r.approved = true
    )
  );

-- The uploader and any admin can also read a file that's still pending, so
-- there's something for an admin to actually preview before approving it.
drop policy if exists "Admin or uploader can preview a pending file" on storage.objects;
create policy "Admin or uploader can preview a pending file"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'resources'
    and exists (
      select 1 from public.resources r
      where r.file_path = storage.objects.name
        and (r.uploader_id = auth.uid() or public.am_i_admin())
    )
  );

-- Upload: signed-in only, and only into a folder named after their own user
-- id -- stops one member from uploading a file that overwrites or collides
-- with another member's.
drop policy if exists "Signed-in users can upload into their own folder" on storage.objects;
create policy "Signed-in users can upload into their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resources'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- No update policy is created on purpose -- nobody can silently swap a file's
-- contents after the fact (e.g. after it's already been approved). Uploading
-- a revised version means deleting the old one and submitting a new one,
-- which goes through approval again.

drop policy if exists "Uploader or admin can delete their file" on storage.objects;
create policy "Uploader or admin can delete their file"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resources'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.am_i_admin()
    )
  );
