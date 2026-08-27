-- Closes an information-disclosure gap found in a security review.
--
-- Today, "Profiles are publicly readable" (schema.sql) means ANYONE --
-- including a signed-out visitor calling the Supabase API directly, not
-- just someone using the app's UI -- can select every profile's `role`
-- column and get a full list of who's an admin. That's free reconnaissance
-- for anyone who wants to specifically target the admin account (phishing,
-- credential stuffing, social engineering).
--
-- This does NOT touch the "Profiles are publicly readable" policy itself --
-- usernames still need to be visible to everyone so they show up next to
-- threads and replies. It only removes the `role` column from what the API
-- will return, for every caller, and replaces the app's direct role lookups
-- with a function that can only ever answer "is the CURRENTLY signed-in
-- user an admin" -- it has no way to be asked about anyone else's role,
-- because it reads auth.uid() itself rather than taking a parameter.
--
-- Run this in the Supabase SQL editor AFTER schema.sql, 002_admin_role.sql,
-- and 003_categories_and_pinning.sql. Safe to run even if some of this
-- already exists.

-- 1. Stop the API from ever returning the role column to anyone ------------

revoke select (role) on public.profiles from anon, authenticated;

-- 2. A safe, narrow way for the app to ask "am I an admin?" ----------------
-- SECURITY DEFINER means this runs with the privileges of the function's
-- owner, not the caller -- so it can still read the role column even though
-- the grant above just took that ability away from anon/authenticated
-- directly. Because it always checks auth.uid() (never a passed-in id), it
-- cannot be used to look up someone else's role.

create or replace function public.am_i_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

grant execute on function public.am_i_admin() to anon, authenticated;

-- Nothing else needs to change: the existing trigger and handle_new_user
-- functions are already SECURITY DEFINER, so they were never affected by
-- API-level column grants in the first place -- this migration only closes
-- the direct-API read that a browser or script could make as anon/authenticated.
