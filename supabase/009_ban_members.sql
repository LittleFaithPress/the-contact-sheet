-- Adds member banning: an admin can block a specific member from posting
-- new threads, replies, or downloads uploads, WITHOUT deleting their
-- account or anything they've already posted.
--
-- This is deliberately narrower than deleting someone: a ban only ever
-- affects future writes. It never touches read access (which was already
-- open to everyone, signed in or not, before this migration -- banning
-- someone doesn't hide their past posts, and can't, by design) and it
-- never deletes anything.
--
-- Run this in the Supabase SQL editor AFTER 008_resource_scan_column.sql.
-- Safe to run even if some of this already exists.

-- 1. The column itself -------------------------------------------------------

alter table public.profiles
  add column if not exists banned boolean not null default false;

-- Publicly readable, same as username -- a banned member's posts stay
-- visible, and showing that they're banned next to their name is the same
-- kind of transparency most communities already expect (compare: this app
-- already shows an "Admin" badge publicly-ish; this is the same idea).
grant select (banned) on public.profiles to anon, authenticated;

-- 2. Let an admin actually change it, for someone else's row ----------------
-- The existing "Users can update their own profile" policy only ever
-- matches auth.uid() = id -- it was never possible for one member to update
-- ANOTHER member's row at all, which is exactly what banning someone
-- requires. This adds that ability, scoped to admins only.

drop policy if exists "Admins can ban or unban a member" on public.profiles;
create policy "Admins can ban or unban a member"
  on public.profiles for update
  to authenticated
  using (public.am_i_admin());

-- 3. Scope that new ability down to ONLY the banned column ------------------
-- Same pattern as 005's enforce_thread_admin_columns: being allowed to
-- reach a row via RLS is not the same as being allowed to change anything
-- on it. This trigger makes sure the new policy above can only ever be used
-- to flip `banned` -- never username, role, or anything else -- and that
-- nobody, admin included, can change their OWN banned status (stops an
-- admin from fat-fingering themselves into being banned, and stops a
-- member from trying to unban themselves directly via the API).

create or replace function public.enforce_profile_ban_column()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- auth.uid() is null only in the Supabase SQL editor (the app's own
  -- trusted "root" path, same reasoning as the role column in 005) -- that
  -- path stays free to change anything, including your own ban status,
  -- same as it's always been able to promote an admin directly.
  if new.banned is distinct from old.banned and auth.uid() is not null then
    if auth.uid() = old.id then
      raise exception 'You cannot change your own banned status.';
    end if;
    if not public.am_i_admin() then
      raise exception 'Only an admin can ban or unban a member.';
    end if;
  end if;

  -- When this update is reaching someone ELSE's row through the API, the
  -- only way that's possible is the "Admins can ban or unban a member"
  -- policy above -- and that policy should only ever be used to flip
  -- `banned`, nothing else about the profile.
  if auth.uid() is not null and auth.uid() <> old.id then
    if new.id is distinct from old.id
      or new.username is distinct from old.username
      or new.role is distinct from old.role
      or new.created_at is distinct from old.created_at then
      raise exception 'Admins can only change whether a member is banned -- nothing else about their profile.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_profile_ban_column on public.profiles;
create trigger enforce_profile_ban_column
  before update on public.profiles
  for each row execute procedure public.enforce_profile_ban_column();

-- 4. The actual enforcement: block new posts/uploads from a banned member ---
-- Same defense-in-depth as everywhere else in this app -- app/actions.ts
-- checks this too, for a fast/friendly error message, but THIS is what
-- holds even against a direct API call. A banned member can still read
-- everything, including their own past posts -- these policies only ever
-- gate INSERT.

drop policy if exists "Signed-in users can create threads" on public.threads;
create policy "Signed-in users can create threads"
  on public.threads for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and not exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.banned
    )
  );

drop policy if exists "Signed-in users can create replies" on public.replies;
create policy "Signed-in users can create replies"
  on public.replies for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and not exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.banned
    )
  );

drop policy if exists "Signed-in users can submit a resource" on public.resources;
create policy "Signed-in users can submit a resource"
  on public.resources for insert
  to authenticated
  with check (
    auth.uid() = uploader_id
    and approved = false
    and not exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.banned
    )
  );
