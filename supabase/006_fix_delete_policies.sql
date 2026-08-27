-- Fixes a CRITICAL regression that 005 introduced, found by testing THIS
-- migration itself against a real database (not caught by reasoning about
-- the code alone) rather than by a report from you. Run this in the
-- Supabase SQL editor AFTER 005_fix_role_and_admin_scope.sql.
--
-- What happened: 002_admin_role.sql's two "delete" policies (one on
-- threads, one on replies) check admin status with their own inline
-- `exists (select 1 from profiles where role = 'admin')` -- the same
-- pattern that 005 already had to fix on the "Admins can update any
-- thread" policy, for the same reason: that subquery is a plain part of
-- the policy, not a SECURITY DEFINER function, so it runs with the
-- CALLER's own privileges. 005 tightened those privileges (nobody but the
-- function owner can read profiles.role directly anymore) but only fixed
-- the ONE policy it was already touching -- it missed that these two
-- delete policies have the identical problem.
--
-- The practical effect, reproduced against a real test database before
-- writing this: after running 005, EVERY delete stopped working for
-- EVERYONE -- not just admins trying to delete someone else's post, but a
-- completely ordinary member trying to delete their OWN thread or reply.
-- Postgres has to check column access for every column a policy
-- expression touches before it will run the query at all -- it doesn't
-- matter that `auth.uid() = author_id` alone would have been enough to
-- allow it; the mere presence of `profiles.role` elsewhere in the same
-- policy is enough to block the whole thing with a permission error.
-- If you ran 005 and then tried to delete a post and it silently failed,
-- this is why -- and running this migration is the fix.

drop policy if exists "Users can delete their own threads or admins can delete any" on public.threads;
create policy "Users can delete their own threads or admins can delete any"
  on public.threads for delete
  to authenticated
  using (
    auth.uid() = author_id
    or public.am_i_admin()
  );

drop policy if exists "Users can delete their own replies or admins can delete any" on public.replies;
create policy "Users can delete their own replies or admins can delete any"
  on public.replies for delete
  to authenticated
  using (
    auth.uid() = author_id
    or public.am_i_admin()
  );

-- am_i_admin() (from 004) is SECURITY DEFINER, so it can read profiles.role
-- using the function owner's privileges regardless of what 005 revoked from
-- the caller -- exactly the same fix already applied to the thread-update
-- policy in 005, just extended to these two delete policies as well.
