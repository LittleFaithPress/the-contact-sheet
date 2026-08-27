-- Fixes two CRITICAL bugs found in a deeper follow-up security review, plus
-- one medium-severity scope gap. Run this in the Supabase SQL editor AFTER
-- 004_restrict_role_visibility.sql. Every statement here is safe to re-run.
--
-- Both bugs below were independently reproduced against a real Postgres
-- instance (not just reasoned about) before being written up -- see the
-- audit report for the reproduction steps.

-- 1. CRITICAL -- any signed-up member could grant themselves admin ----------
--
-- "Users can update their own profile" (schema.sql) has no WITH CHECK
-- clause. In Postgres, when WITH CHECK is left out, the USING clause is
-- reused as the check against the NEW row. That policy's USING clause is
-- `auth.uid() = id` -- since a user isn't changing their own id, that stays
-- true no matter what ELSE they change in the same UPDATE, including role.
-- Concretely, any logged-in member could run this themselves and become an
-- admin, with no error:
--
--   update profiles set role = 'admin' where id = auth.uid();
--
-- 004 never addressed this -- it only restricted reading the role column,
-- not writing it. This closes it the same way 003 already closes the
-- equivalent gap on threads.pinned/category: a trigger that re-derives
-- admin status itself and blocks the change outright, regardless of RLS or
-- table grants.

revoke update (role) on public.profiles from authenticated;

create or replace function public.enforce_profile_role_column()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- auth.uid() is only ever non-null when this update is running through
  -- PostgREST as a specific signed-in user (the anon key + that user's
  -- JWT) -- i.e. through the app or a direct API call. It's null for a
  -- session in the Supabase SQL editor (which connects as the postgres
  -- role, with no user JWT at all), which is the app's own documented way
  -- of promoting an account -- that path must keep working.
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'role cannot be changed through the API. Promote an admin manually in the SQL editor instead.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_profile_role_column on public.profiles;
create trigger enforce_profile_role_column
  before update on public.profiles
  for each row execute procedure public.enforce_profile_role_column();

-- 2. CRITICAL -- 004's fix for role visibility didn't actually work --------
--
-- 004 ran: revoke select (role) on public.profiles from anon, authenticated;
-- That looks right, but it's a well-known Postgres gotcha: a column-level
-- REVOKE cannot claw back access that a broader TABLE-level grant already
-- gives. Every Supabase project grants table-wide SELECT on public tables
-- to anon/authenticated by default (this app depends on that same grant for
-- every other public read to work at all) -- and that table-wide grant on
-- its own is enough to read every column, role included. 004's revoke had
-- no effect: a completely signed-out visitor could still run
-- `select username, role from profiles` directly against the API and get a
-- full list of who's an admin.
--
-- The real fix is to revoke the table-wide SELECT first, then re-grant only
-- the specific columns that should be public.

revoke select on public.profiles from anon, authenticated;
grant select (id, username, created_at) on public.profiles to anon, authenticated;

-- am_i_admin() (004) is unaffected by this -- it's SECURITY DEFINER, so it
-- already reads role with the function owner's privileges, not the
-- caller's. This only changes what a direct API/SQL query can see.
--
-- One thing THIS DOES affect, caught by testing this migration against a
-- real database rather than just reasoning about it: 003's "Admins can
-- update any thread" policy checks admin status with its own inline
-- `exists (select ... from profiles where role = 'admin')` -- unlike
-- am_i_admin(), that subquery is NOT security definer, so it runs with the
-- caller's own (now-restricted) grants and would start failing with a
-- permission error the moment an admin tried to pin someone else's thread.
-- Replacing it to reuse am_i_admin() instead fixes that.

drop policy if exists "Admins can update any thread" on public.threads;
create policy "Admins can update any thread"
  on public.threads for update
  to authenticated
  using (public.am_i_admin());

-- 3. MEDIUM -- "Admins can update any thread" had no real scope -----------
--
-- 003's admin update policy just checks "is this caller an admin" -- it
-- never limited WHAT they could change. Combined with bug #1 above (which
-- made "admin" trivially reachable by anyone), that meant an attacker could
-- have used a self-granted admin role to rewrite the title/body of someone
-- else's thread, or even reassign its author_id, not just pin/categorize
-- it -- which is all the feature was ever meant to allow.
--
-- This extends the existing trigger from 003 so that even a genuine admin
-- can only pin/categorize someone else's thread -- editing its title, body,
-- or authorship still requires actually being the author.

create or replace function public.enforce_thread_admin_columns()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  caller_is_admin boolean;
  caller_is_author boolean;
begin
  select (role = 'admin') into caller_is_admin
  from public.profiles
  where id = auth.uid();

  caller_is_author := (auth.uid() = old.author_id);

  if not coalesce(caller_is_admin, false) then
    if new.pinned is distinct from old.pinned then
      raise exception 'Only admins can pin or unpin a thread.';
    end if;
    if new.category is distinct from old.category then
      raise exception 'Only admins can change a thread''s category after it''s posted.';
    end if;
  end if;

  if not caller_is_author then
    if new.title is distinct from old.title then
      raise exception 'Only the author can edit a thread''s title.';
    end if;
    if new.body is distinct from old.body then
      raise exception 'Only the author can edit a thread''s body.';
    end if;
    if new.author_id is distinct from old.author_id then
      raise exception 'A thread cannot be reassigned to a different author.';
    end if;
  end if;

  return new;
end;
$$;

-- Trigger definition itself is unchanged (already created by 003) -- this
-- just replaces the function body it calls.
