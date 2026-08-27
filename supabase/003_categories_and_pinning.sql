-- Adds categories and admin pinning on top of 002_admin_role.sql.
-- Run this in the Supabase SQL editor AFTER schema.sql and
-- 002_admin_role.sql. Safe to run even if some of this already exists.

-- 1. Categories on threads --------------------------------------------------
-- A fixed, small set of tags so the thread list can be filtered/scanned at
-- a glance -- deliberately not a free-form field or a separate table, to
-- keep this simple to run and simple to reason about. Set once at creation
-- time by the author (see the insert policy, unchanged); changing it after
-- the fact is treated the same as pinning below -- admin only.

alter table public.threads
  add column if not exists category text not null default 'General'
  check (category in ('General', 'Critique', 'Gear Talk', 'Technique', 'Off Topic'));

-- 2. Pinning ------------------------------------------------------------------
-- Lets an admin keep a thread (e.g. community guidelines, a welcome post)
-- stuck to the top of the list.

alter table public.threads
  add column if not exists pinned boolean not null default false;

-- Let an admin update ANY thread row (not just their own) -- needed so they
-- can pin a thread they didn't author. Combines with the existing "Users can
-- update their own threads" policy via OR, per Postgres's permissive-policy
-- semantics.
drop policy if exists "Admins can update any thread" on public.threads;
create policy "Admins can update any thread"
  on public.threads for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS above only gates which ROWS can be touched, not which COLUMNS -- on
-- its own, a non-admin author could still flip `pinned` or `category` on
-- their own thread via a raw API call, bypassing the app's UI. This trigger
-- closes that: it blocks changes to those two columns unless the caller is
-- an admin, regardless of who owns the row.
create or replace function public.enforce_thread_admin_columns()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  caller_is_admin boolean;
begin
  select (role = 'admin') into caller_is_admin
  from public.profiles
  where id = auth.uid();

  if not coalesce(caller_is_admin, false) then
    if new.pinned is distinct from old.pinned then
      raise exception 'Only admins can pin or unpin a thread.';
    end if;
    if new.category is distinct from old.category then
      raise exception 'Only admins can change a thread''s category after it''s posted.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_thread_admin_columns on public.threads;
create trigger enforce_thread_admin_columns
  before update on public.threads
  for each row execute procedure public.enforce_thread_admin_columns();

-- 3. Sort pinned threads to the top efficiently -------------------------------

create index if not exists threads_pinned_created_at_idx
  on public.threads (pinned desc, created_at desc);
