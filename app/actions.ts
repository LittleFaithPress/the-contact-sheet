"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCategory } from "@/lib/categories";
import {
  isResourceCategory,
  ALLOWED_RESOURCE_MIME_TYPES,
  MAX_RESOURCE_FILE_BYTES,
} from "@/lib/resourceCategories";
import { submitFileForScan } from "@/lib/virustotal";

// --- Auth -----------------------------------------------------------------

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim();

  if (!email || !password || !username) {
    return { error: "Fill in all fields." };
  }
  if (username.length < 3 || username.length > 24) {
    return { error: "Username must be 3-24 characters." };
  }
  // Backstops the form's own minLength -- that's only a browser hint and
  // does nothing against a request sent directly to this action.
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) return { error: error.message };

  // If email confirmation is on (default), the user gets a confirmation
  // email and isn't signed in yet -- send them somewhere that says so.
  redirect("/login?checkEmail=1");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  revalidatePath("/");
  redirect("/");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

// --- Password reset -----------------------------------------------------------
// Two steps, both handled entirely by Supabase Auth -- this app never sees or
// stores a password itself, reset or otherwise.
//
// 1. requestPasswordReset emails a reset link. Supabase points that link at
//    /auth/callback (the same route already used for email confirmation),
//    which exchanges it for a short-lived signed-in session and then sends
//    the user on to /reset-password.
// 2. updatePassword runs while that session is active and sets the new
//    password via supabase.auth.updateUser -- it requires a signed-in user,
//    which is exactly what step 1's link provides.

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Enter your email address." };
  }

  const supabase = createClient();
  // Built from a fixed env var, not the request's Origin header. A request's
  // Origin can be set by whoever sends the request -- using it here would
  // let someone request a password-reset email whose link points at a site
  // of their choosing instead of this one.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  // Same response whether or not that email has an account -- this can't be
  // used to check who's a member.
  if (error) return { error: "Something went wrong. Try again in a moment." };

  return { error: null };
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "That reset link has expired or was already used. Request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  revalidatePath("/");
  redirect("/");
}

// --- Content ----------------------------------------------------------------
// Every write here requires a session. Even if this check were skipped by a
// bug, the Row Level Security policies in supabase/schema.sql would still
// block the write at the database level -- that's the real backstop.

export async function createThread(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in to start a thread." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("banned")
    .eq("id", user.id)
    .single();
  if (profile?.banned) {
    return { error: "Your account has been banned from posting." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "General").trim();

  // Both bounds are enforced again by the database's own check constraint
  // (supabase/schema.sql) -- checking them here too means a request that
  // bypasses the form's own maxLength never reaches the database at all, so
  // there's nothing there to fail and no internal error to accidentally
  // expose.
  if (title.length < 3 || title.length > 200 || body.length < 1 || body.length > 10000) {
    return { error: "Title must be 3-200 characters, and content can't be empty." };
  }
  if (!isCategory(category)) {
    return { error: "Pick a valid category." };
  }

  const { data, error } = await supabase
    .from("threads")
    .insert({ title, body, category, author_id: user.id })
    .select("id")
    .single();

  // A raw database error is a developer detail, not something to show a
  // visitor -- it can name internal table/column/constraint names. The
  // validation above already rules out the common causes, so anything that
  // still reaches here is unexpected.
  if (error) return { error: "Couldn't post that thread. Try again in a moment." };

  revalidatePath("/");
  redirect(`/thread/${data.id}`);
}

export async function createReply(threadId: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in to reply." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("banned")
    .eq("id", user.id)
    .single();
  if (profile?.banned) {
    return { error: "Your account has been banned from posting." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 1 || body.length > 5000) {
    return { error: "Reply can't be empty, and must be under 5000 characters." };
  }

  const { error } = await supabase
    .from("replies")
    .insert({ thread_id: threadId, body, author_id: user.id });

  if (error) return { error: "Couldn't post that reply. Try again in a moment." };

  revalidatePath(`/thread/${threadId}`);
  return { error: null };
}

// --- Deletion ----------------------------------------------------------------
// Same defense-in-depth as everything else here: this checks for a session
// before trying, but the real gate is the RLS policy in
// supabase/002_admin_role.sql, which only allows the delete if you're the
// author OR your profile's role is 'admin'. A non-admin, non-author calling
// these directly just gets rejected by the database.

export async function deleteThread(threadId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in." };
  }

  const { error } = await supabase.from("threads").delete().eq("id", threadId);
  if (error) return { error: "Couldn't delete that thread. Try again in a moment." };

  revalidatePath("/");
  redirect("/");
}

export async function deleteReply(replyId: string, threadId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in." };
  }

  const { error } = await supabase.from("replies").delete().eq("id", replyId);
  if (error) return { error: "Couldn't delete that reply. Try again in a moment." };

  revalidatePath(`/thread/${threadId}`);
  return { error: null };
}

// --- Moderation ----------------------------------------------------------------
// This check is just for a fast, friendly error message. The real gate is
// the database: supabase/003_categories_and_pinning.sql adds a trigger that
// rejects a `pinned` change from anyone whose profile role isn't 'admin',
// no matter who calls it or how.

export async function pinThread(threadId: string, pinned: boolean) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in." };
  }

  const { data: isAdmin } = await supabase.rpc("am_i_admin");

  if (!isAdmin) {
    return { error: "Only admins can pin threads." };
  }

  const { error } = await supabase
    .from("threads")
    .update({ pinned })
    .eq("id", threadId);

  if (error) return { error: "Couldn't update that thread. Try again in a moment." };

  revalidatePath("/");
  revalidatePath(`/thread/${threadId}`);
  return { error: null };
}

// --- Downloads / resources ---------------------------------------------------
// Same defense-in-depth pattern as everything above: these checks exist for
// a fast, friendly error message. The real gate for every part of this --
// who can upload, who can see a pending file, who can approve one, who can
// download one -- is the Row Level Security in
// supabase/007_resources_and_downloads.sql. That's what was actually tested
// against a live database, not this code.

export async function uploadResource(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in to upload." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("banned")
    .eq("id", user.id)
    .single();
  if (profile?.banned) {
    return { error: "Your account has been banned from posting." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const file = formData.get("file") as File | null;

  if (title.length < 3 || title.length > 150) {
    return { error: "Title must be 3-150 characters." };
  }
  if (description.length < 1 || description.length > 2000) {
    return { error: "Description can't be empty, and must be under 2000 characters." };
  }
  if (!isResourceCategory(category)) {
    return { error: "Pick a valid category." };
  }
  if (!file || file.size === 0) {
    return { error: "Choose a file to upload." };
  }
  if (file.size > MAX_RESOURCE_FILE_BYTES) {
    return { error: "That file is too large -- 50 MB max." };
  }
  if (!(ALLOWED_RESOURCE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { error: "That file type isn't allowed. PDFs, ZIP archives, and images only." };
  }

  // Strip the filename down to safe characters -- it becomes part of the
  // storage path, and the original is kept separately (file_name) to show
  // the real name on the downloads page.
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const filePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("resources")
    .upload(filePath, file, { contentType: file.type });

  if (uploadError) {
    return { error: "Couldn't upload that file. Try again in a moment." };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("resources")
    .insert({
      title,
      description,
      category,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      uploader_id: user.id,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    // Clean up the file so it doesn't sit in storage with no matching row --
    // otherwise nothing, not even an admin, would ever be able to see or
    // approve it.
    await supabase.storage.from("resources").remove([filePath]);
    return { error: "Couldn't save that upload. Try again in a moment." };
  }

  // Best-effort virus scan. This never blocks or fails the upload itself --
  // see lib/virustotal.ts for why. If it's not configured yet, or VirusTotal
  // is unreachable right now, the upload still goes through and simply
  // waits for manual admin review instead.
  const scan = await submitFileForScan(file);
  if (scan) {
    await supabase
      .from("resources")
      .update({ vt_analysis_id: scan.analysisId })
      .eq("id", inserted.id);
  }

  revalidatePath("/downloads");
  redirect("/downloads?uploaded=1");
}

export async function approveResource(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in." };
  }

  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) {
    return { error: "Only admins can approve uploads." };
  }

  const { error } = await supabase.from("resources").update({ approved: true }).eq("id", id);
  if (error) return { error: "Couldn't approve that upload. Try again in a moment." };

  revalidatePath("/downloads");
  revalidatePath("/downloads/review");
  return { error: null };
}

export async function rejectResource(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in." };
  }

  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) {
    return { error: "Only admins can reject uploads." };
  }

  const { data: resource } = await supabase
    .from("resources")
    .select("file_path")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) return { error: "Couldn't remove that upload. Try again in a moment." };

  if (resource?.file_path) {
    await supabase.storage.from("resources").remove([resource.file_path]);
  }

  revalidatePath("/downloads/review");
  return { error: null };
}

export async function deleteResource(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in." };
  }

  const { data: resource } = await supabase
    .from("resources")
    .select("file_path")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) return { error: "Couldn't delete that upload. Try again in a moment." };

  if (resource?.file_path) {
    await supabase.storage.from("resources").remove([resource.file_path]);
  }

  revalidatePath("/downloads");
  revalidatePath("/downloads/review");
  return { error: null };
}

// --- Membership -----------------------------------------------------------
// Same defense-in-depth pattern as everything else here: these checks exist
// for a fast, friendly error message. The real gate is the database --
// supabase/009_ban_members.sql adds a policy plus a trigger that only ever
// lets an admin flip someone ELSE's `banned` column, blocks self-ban and
// self-unban entirely (admin included), and blocks bundling any other
// profile change in with a ban toggle. That's what was actually tested
// against a live database, not this code.
//
// Banning never deletes anything -- a banned member's past threads and
// replies stay exactly where they are, visible to everyone. All this stops
// is future posts, replies, and uploads from that account.

export async function banMember(userId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in." };
  }
  if (user.id === userId) {
    return { error: "You can't ban yourself." };
  }

  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) {
    return { error: "Only admins can ban a member." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ banned: true })
    .eq("id", userId);

  if (error) return { error: "Couldn't ban that member. Try again in a moment." };

  revalidatePath("/");
  revalidatePath("/downloads");
  return { error: null };
}

export async function unbanMember(userId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in." };
  }

  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) {
    return { error: "Only admins can unban a member." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ banned: false })
    .eq("id", userId);

  if (error) return { error: "Couldn't unban that member. Try again in a moment." };

  revalidatePath("/");
  revalidatePath("/downloads");
  return { error: null };
}
