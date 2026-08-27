import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResetPasswordForm from "@/components/ResetPasswordForm";

// Reached from the reset-link email via /auth/callback, which exchanges the
// link's code for a session before sending the user here. No session means
// the link was already used, expired, or someone navigated here directly --
// send them back to request a fresh one instead of showing a broken form.
export default async function ResetPasswordPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/forgot-password");

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="font-serif text-2xl italic text-cream">Set a new password</h1>
      <ResetPasswordForm />
    </div>
  );
}
