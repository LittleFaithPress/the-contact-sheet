-- Lets a member attach one photo to a thread when they post it -- the
-- missing piece for a photography community whose whole point is critiquing
-- actual photos, not just text. Deliberately scoped to threads only for now
-- (not replies) -- that covers "here's my shot, what do you think," which is
-- the core case. Replies can get the same treatment later if it turns out
-- to be needed.
--
-- Run this in the Supabase SQL editor AFTER 009_ban_members.sql.
-- Safe to run even if some of this already exists.

-- 1. The column itself -------------------------------------------------------
-- Nullable -- a thread with no photo is still a normal, valid thread, same
-- as every thread posted before this migration existed.

alter table public.threads
  add column if not exists image_path text unique;

-- 2. The storage bucket --------------------------------------------------------
-- Same pattern as the resources bucket in 007: created NOT public, with an
-- explicit read policy below controlling visibility instead of trusting the
-- bucket's own public/private flag. `allowed_mime_types` blocks anything
-- that isn't actually an image at the storage layer itself -- not just as a
-- hint in the upload form, which a direct API call could ignore.

insert into storage.buckets (id, name, public)
values ('thread-images', 'thread-images', false)
on conflict (id) do nothing;

-- 30 MB, not 50 -- Supabase Storage's free-tier per-file ceiling is 50 MB and
-- can't be configured past that on this plan, so this leaves headroom below
-- the hard platform limit. In practice this is rarely the binding
-- constraint anyway: the app resizes/re-compresses a photo in the browser
-- before it's ever uploaded (see lib/threadImage.ts), so even a 60+ MB
-- straight-off-the-camera JPEG lands well under this.
update storage.buckets
set
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  file_size_limit = 31457280  -- 30 MB
where id = 'thread-images';

-- A thread's photo is exactly as public as the thread itself -- every
-- thread is already readable by anyone, signed in or not (see schema.sql),
-- so there's no separate "approved" gate here the way resources has one.
-- No `to` clause -- same as the resources download policy in 007, this
-- applies to anon as well as authenticated, which is what lets a
-- signed-out visitor actually see the photo on a public thread page.
drop policy if exists "Thread photos are publicly readable" on storage.objects;
create policy "Thread photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'thread-images');

-- Upload: signed-in only, only into a folder named after their own user id
-- (stops one member's upload from colliding with another's, same as
-- resources), and blocked for a banned member -- same reasoning as the
-- insert policies in 009: this holds even against a direct API call that
-- skips the app's own thread-creation form entirely.
drop policy if exists "Signed-in non-banned users can upload a thread photo" on storage.objects;
create policy "Signed-in non-banned users can upload a thread photo"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'thread-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.banned
    )
  );

-- Delete: the uploader or an admin -- mirrors exactly who can already
-- delete the thread itself (schema.sql's "Users can delete their own
-- threads" plus admin), so removing a thread's photo follows the same
-- ownership rule as removing the thread.
drop policy if exists "Uploader or admin can delete a thread photo" on storage.objects;
create policy "Uploader or admin can delete a thread photo"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'thread-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.am_i_admin()
    )
  );

-- No update policy on purpose, same reasoning as resources -- swapping a
-- thread's photo means deleting the old file and posting a new one, not
-- silently overwriting it in place.
