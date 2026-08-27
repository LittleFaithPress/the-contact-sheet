-- Adds admin moderation on top of the base schema (supabase/schema.sql).
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- AFTER you've already run schema.sql once. Safe to run even if some of
-- this already exists.

-- 1. Add a role to profiles ------------------------------------------------
-- Everyone starts as 'member'. Nobody can set their own role to 'admin' --
-- there's no UI or API path for it, and RLS below only lets a user update
-- their own row without touching this column's meaning (an admin still has
-- to be promoted by hand, see step 3).

alter table public.profiles
  add column if not exists role text not null default 'member'
  check (role in ('member', 'admin'));

-- 2. Let admins delete any thread or reply, not just their own -------------

drop policy if exists "Users can delete their own threads" on public.threads;
drop policy if exists "Users can delete their own threads or admins can delete any" on public.threads;
create policy "Users can delete their own threads or admins can delete any"
  on public.threads for delete
  to authenticated
  using (
    auth.uid() = author_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Users can delete their own replies" on public.replies;
drop policy if exists "Users can delete their own replies or admins can delete any" on public.replies;
create policy "Users can delete their own replies or admins can delete any"
  on public.replies for delete
  to authenticated
  using (
    auth.uid() = author_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 3. Make yourself an admin --------------------------------------------------
-- Sign up in the app first with whatever username you want to use, THEN run
-- this once, swapping in that username. This is deliberately a manual,
-- database-side step -- there's no "become admin" button anywhere in the app.
--
-- update public.profiles set role = 'admin' where username = 'your-username-here';
