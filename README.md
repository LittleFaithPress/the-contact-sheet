# Contact Sheet

A minimal forum: anyone can read every thread and reply, no account needed.
You only need to sign up to post a thread or reply. Built with Next.js +
Supabase, deployable for $0.

## What's actually enforced, and where

Read access is open everywhere — the home page and thread pages never check
for a session. Write access (creating a thread, replying) is checked in
**three** places, on purpose:

1. The page itself redirects you to `/login` if you try to visit `/new`
   signed out (`app/new/page.tsx`).
2. The server action checks for a session before touching the database
   (`app/actions.ts`).
3. The database itself refuses the write via Row Level Security if the first
   two somehow got bypassed (`supabase/schema.sql`).

That third layer is the one that actually matters for security — 1 and 2 are
just there for a decent user experience. Even if someone found a way to call
the database directly, RLS still blocks them.

## One-time setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a free account and a new
project. In **Project Settings → API**, copy the **Project URL** and the
**anon public** key.

### 2. Run the schema

In the Supabase dashboard, open **SQL Editor → New query**, and run these
three files in order, each as its own query:

1. `supabase/schema.sql` — creates the `profiles`, `threads`, and `replies`
   tables, turns on Row Level Security, and sets the policies that make
   reads public and writes require a signed-in user.
2. `supabase/002_admin_role.sql` — adds the `role` column and lets an admin
   delete any thread/reply, not just their own. Read the comment at the
   bottom of that file for how to make your own account an admin.
3. `supabase/003_categories_and_pinning.sql` — adds thread categories
   (General, Critique, Gear Talk, Technique, Off Topic) and admin-only
   pinning, with a database trigger that blocks anyone but an admin from
   setting either, even via a direct API call.
4. `supabase/004_restrict_role_visibility.sql` — closes a gap found in a
   security review: previously, anyone (including a signed-out visitor
   calling the API directly) could read every profile's `role` column and
   see exactly who the admin is. The app's admin checks (the admin badge,
   the Pin button, admin-only delete) all call the `am_i_admin()` function
   this migration creates, so without it those features silently stop
   working. Run it — but see the next one, which fixes a bug in it.
5. `supabase/005_fix_role_and_admin_scope.sql` — **required, and urgent if
   004 is already live.** A second, deeper security review found that 004's
   fix for the point above didn't actually work (a Postgres quirk meant the
   `role` column stayed publicly readable regardless), and — separately and
   more seriously — found that **any signed-up member could make their own
   account an admin**, with a single request, no bug or trick needed beyond
   knowing it was possible. Both are closed by this migration. See
   `SECURITY-AUDIT-2.md` for the full writeup, including how both were
   proven (against a real test database, not just reasoned about) before
   being fixed. If your site is already live and members can already sign
   up, run this migration immediately, then check **Authentication → Users**
   → each account's row in the `profiles` table in the Table Editor for any
   `role` you don't recognize as `admin`.

### 3. Set the auth redirect URL

In **Authentication → URL Configuration**, set the Site URL to your deployed
URL once you have one (or `http://localhost:3000` for now), and add
`{that URL}/auth/callback` as a redirect URL. This is what makes the
email-confirmation link work.

If you'd rather skip email confirmation entirely while testing, you can turn
it off under **Authentication → Providers → Email → Confirm email**.

### 4. Environment variables

```
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with
the values from step 1. The anon key is safe to expose in the browser — it
can only do what your RLS policies allow it to do, which is the whole point
of RLS.

Also set `NEXT_PUBLIC_SITE_URL` to your real deployed URL (e.g.
`https://thecontactsheet.vercel.app`) once you have one — locally, leave it
as `http://localhost:3000`. This is used to build the link inside
password-reset emails; it used to be guessed from the incoming request
instead, which a second security review flagged as something that could be
spoofed to send a member a reset link pointing somewhere other than your
real site. **Update this in your Vercel project's Environment Variables
before going live** — it won't happen automatically.

### 5. Run it locally

```
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Deploying for free

- **App:** push this to a GitHub repo, then import it into
  [Vercel](https://vercel.com) (free tier). Add all three environment
  variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_SITE_URL`) in the Vercel project settings. Every push
  redeploys automatically.
- **Database/auth:** already covered by Supabase's free tier — no separate
  step needed, but see the backup warning below.
- **Bot protection / hiding your origin:** put the site behind
  [Cloudflare](https://cloudflare.com) (free plan). Point your domain's DNS
  through Cloudflare, turn on the proxy (orange cloud), and turn on Bot Fight
  Mode under **Security → Bots**. This is the closest free equivalent this
  stack has to a VPN or firewall — see "Do we need a VPN or firewall?" below
  for why those specific tools don't apply here, and what does.
- **Vercel Deployment Protection:** every push to a branch other than your
  production one gets its own preview URL — by default these are guessable
  and reachable by anyone who finds the link, and they run against the
  *same* Supabase project as production. Under your Vercel project's
  **Settings → Deployment Protection**, turn on **Standard Protection** (or
  **Vercel Authentication** if everyone who needs preview access already has
  a Vercel login) so a stray preview link can't be used to poke at your real
  data. This is free on Vercel's free tier.

You'll only start paying anything once you outgrow Supabase's and Vercel's
free tiers, which for a community in the dozens-to-low-hundreds range is
unlikely to happen soon.

### Supabase free tier has no automatic backups

This is worth knowing before you launch, not after something goes wrong:
Supabase's free tier does not include point-in-time recovery or scheduled
backups at all — if a bug (yours or a future one) or a bad manual query
deletes or corrupts data, there is no built-in "restore to yesterday"
button. Paid Supabase plans add daily backups starting at their Pro tier.
Two free-tier-compatible options if that risk matters to you: periodically
export your data yourself (**Database → Backups → Manual backup** in the
dashboard, or a scheduled `pg_dump`), or budget for Supabase Pro once real
members' content is on the site. This isn't something I could fix in code —
it's a plan-tier decision, so it's flagged here rather than changed.

### Do we need a VPN or firewall?

Short answer: no, and here's the plain-language reason why, plus what
*does* apply to a site built this way.

A VPN and a traditional firewall both exist to protect **a server you
control** — something with an IP address sitting on the internet, running
software you're responsible for patching, with ports that could be probed
or broken into. This app doesn't have one of those. Vercel runs the app
code and Supabase runs the database; both are fully managed platforms that
patch and secure their own infrastructure, and neither hands you a server
to log into or a port to expose. There is nothing here for a VPN to tunnel
into or a firewall to stand in front of — asking "should we add a firewall"
is a bit like asking whether your email needs one: the provider (Gmail,
Supabase, Vercel) is the one running the servers, not you.

What this stack's actual attack surface is instead: the public web app
itself (this Next.js site) and the public API Supabase automatically
exposes for it (guarded by Row Level Security — see the top of this file).
The tools that actually defend *that* are the ones already covered in this
README:

- **Cloudflare's free proxy + Bot Fight Mode** (above) is the real
  equivalent of a firewall for this kind of stack — it sits in front of the
  app and filters out bot traffic, scraping, and abusive request floods
  before they ever reach Vercel or Supabase.
- **Supabase CAPTCHA (Attack Protection)** and **rate limiting**, covered
  under "Before this goes fully public" below, stop automated abuse of the
  signup/login/post forms specifically.
- **Row Level Security**, already covered above, is what actually decides
  who can read or write what — this is doing the job a firewall does on a
  traditional server, just at the database layer instead of the network
  layer.

If down the road you do end up running something that keeps its own
persistent state on a server you manage (which nothing in this project
does today), that's the point a VPN/firewall conversation would become
relevant again — it isn't for a Vercel + Supabase site.

## Forgot password

`/login` has a "Forgot password?" link that takes a member through a normal
self-service reset:

1. They enter their email at `/forgot-password`, which calls
   `supabase.auth.resetPasswordForEmail`. The same confirmation message shows
   whether or not that email actually has an account, so this can't be used
   to check who's a member.
2. Supabase emails a link that goes through `/auth/callback` (the same route
   used for signup confirmation) and on to `/reset-password`.
3. They set a new password there, which calls `supabase.auth.updateUser` —
   this app never sees or stores the password itself, same as signup and
   login.

This reuses the same redirect URL you already set up in **Authentication →
URL Configuration** in one-time setup step 3 — no extra configuration needed.

Two Supabase-side limits worth knowing about, so a burst of activity doesn't
look like something's broken: the free tier caps outgoing auth emails
(confirmation + password reset combined) at **2 per hour, project-wide** —
fine for a small community trickling in, but a poor fit if you ever ran a
signup push; and **leaked-password protection** (checking new passwords
against known breach databases) is a real Supabase feature, but it's gated
to paid plans, not a free toggle — worth turning on if/when you upgrade, but
don't go looking for it on the free tier.

## Before this goes fully public

Two things worth doing before you post the link somewhere people you don't
know will find it, neither of which is a code change:

- **Turn on Supabase's CAPTCHA integration** under **Authentication → Attack
  Protection**. This isn't just a dashboard checkbox — Supabase requires you
  to actually add a CAPTCHA widget (Turnstile, free, integrates cleanly with
  Cloudflare if you're already using it; or hCaptcha) to the signup, login,
  and forgot-password forms' HTML and pass its token along with the request.
  Right now nothing stops a script from creating hundreds of accounts or
  hammering the password-reset form at a real member's inbox — a small,
  scoped follow-up task, not something to fold into a security pass
  silently.
- **Vercel Deployment Protection** — see "Deploying for free" above.

## What's deliberately NOT here

- No custom password handling — Supabase Auth does that (including the
  reset flow above), so you're never storing or hashing a password yourself.
- No collection of anything beyond username, email, and password. No name,
  no location, no phone number.
- No images, likes, or per-user moderation queue — this is a working
  skeleton, not a finished product. Easy to extend once the core is live.

## What admins can do

Once you've run `003_categories_and_pinning.sql` and promoted your account
(see the comment at the bottom of `002_admin_role.sql`), an admin sees two
extra controls a regular member doesn't:

- **Pin / Unpin** on any thread, in the list and on the thread page — pinned
  threads sort to the top regardless of when they were posted, useful for a
  welcome post or your community guidelines.
- **Delete** on any thread or reply, not just their own (regular members
  only see this on their own posts).

Both are enforced twice: the button only renders for an admin, and the
database itself rejects the change for anyone else — see the trigger in
`003_categories_and_pinning.sql`.

## Extending it

- **OAuth (Google/Discord sign-in):** turn on the provider in
  **Authentication → Providers**, then add a "Continue with Google" button
  that calls `supabase.auth.signInWithOAuth({ provider: "google" })`.
- **More categories:** edit the `CATEGORIES` array in `lib/categories.ts`
  *and* the matching `check` constraint in
  `supabase/003_categories_and_pinning.sql` — they have to stay in sync.
- **Locking a thread:** follow the same pattern as pinning — add a `locked`
  boolean, a trigger clause, and hide `ReplyForm` when it's set.
