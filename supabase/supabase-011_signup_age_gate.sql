-- Adds an 18+ age gate at signup. Nobody's date of birth is collected or
-- stored -- signup asks a single self-reported "how old are you?" number,
-- used once to make the yes/no call, then discarded. If the answer is under
-- 18, the email they typed is recorded here so the SAME email can't just be
-- resubmitted a second time. This is a blocklist of emails that failed the
-- age check, not a record of anyone's actual age.
--
-- Honesty check, same as this project's other docs: self-reported age is
-- what most sites use (there's no free, privacy-respecting way to verify a
-- real age online), so someone who wants to lie about being 18 still can,
-- the first time. What this actually stops is the same person immediately
-- retrying with the same email after answering honestly. It does not stop
-- a different email address, and -- because Supabase's own signup endpoint
-- is a public API separate from this app -- it only applies to signups that
-- go through app/actions.ts's signUp(), not literally every possible way to
-- call Supabase directly. Closing that last gap fully would mean setting up
-- a Supabase "Before User Created" Auth Hook (a Postgres function Supabase
-- itself calls during signup, dashboard-configured, not a plain code
-- change) -- worth doing before this goes fully public, flagged here rather
-- than silently assumed.
--
-- Run this in the Supabase SQL editor AFTER 010_thread_images.sql.
-- Safe to run even if some of this already exists.

-- 1. The table itself --------------------------------------------------------
-- RLS is on with NO policies below, which means: nobody, not even anon or
-- authenticated, can select/insert/update/delete this table directly via
-- the API. The only way in or out is the two SECURITY DEFINER functions in
-- part 2, which expose exactly the two things the signup form needs -- "is
-- this email already blocked?" and "block this email" -- and nothing else
-- (no way to list blocked emails, no way to unblock one, from the API).

create table if not exists public.blocked_signup_emails (
  email_lower text primary key,
  blocked_at timestamptz not null default now()
);

alter table public.blocked_signup_emails enable row level security;

-- 2. The two functions the signup action actually calls ---------------------

create or replace function public.is_email_signup_blocked(p_email text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.blocked_signup_emails
    where email_lower = lower(trim(p_email))
  );
$$;

grant execute on function public.is_email_signup_blocked(text) to anon, authenticated;

create or replace function public.record_blocked_signup_email(p_email text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.blocked_signup_emails (email_lower)
  values (lower(trim(p_email)))
  on conflict (email_lower) do nothing;
$$;

grant execute on function public.record_blocked_signup_email(text) to anon, authenticated;

-- Note on abuse: because this function is callable by anyone (it has to be
-- -- it runs before a person has an account to be "authenticated" as), it's
-- technically possible for someone to call it directly with an email that
-- isn't theirs and lock that address out of ever signing up. That's a real,
-- open limitation, not a hidden one -- see the note at the top of this
-- file. If this ever becomes a real problem in practice, an admin can
-- delete a row from blocked_signup_emails directly in the Supabase Table
-- Editor (SQL editor connections bypass RLS, same as everywhere else in
-- this app) to un-block a specific email.
