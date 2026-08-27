-- Contact Sheet forum schema
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query) once,
-- after creating your Supabase project.

-- 1. Profiles -----------------------------------------------------------
-- One row per user, created automatically when someone signs up.
-- Only stores a username -- deliberately not collecting anything else.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Automatically create a profile row whenever a new user signs up.
-- Pulls the username out of the signup form's metadata (see app/signup).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Threads --------------------------------------------------------------

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  body text not null check (char_length(body) between 1 and 10000),
  author_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.threads enable row level security;

-- Anyone -- signed in or not -- can read threads. This is the "public read" half.
create policy "Threads are publicly readable"
  on public.threads for select
  using (true);

-- Only a signed-in user can create a thread, and only as themselves.
-- This is the "gated write" half.
create policy "Signed-in users can create threads"
  on public.threads for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can update their own threads"
  on public.threads for update
  to authenticated
  using (auth.uid() = author_id);

create policy "Users can delete their own threads"
  on public.threads for delete
  to authenticated
  using (auth.uid() = author_id);

-- 3. Replies ----------------------------------------------------------------

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  author_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.replies enable row level security;

create policy "Replies are publicly readable"
  on public.replies for select
  using (true);

create policy "Signed-in users can create replies"
  on public.replies for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can update their own replies"
  on public.replies for update
  to authenticated
  using (auth.uid() = author_id);

create policy "Users can delete their own replies"
  on public.replies for delete
  to authenticated
  using (auth.uid() = author_id);

-- 4. Helpful indexes ----------------------------------------------------

create index if not exists threads_created_at_idx on public.threads (created_at desc);
create index if not exists replies_thread_id_idx on public.replies (thread_id);
