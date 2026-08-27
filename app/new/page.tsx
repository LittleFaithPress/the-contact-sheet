import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewThreadForm from "@/components/NewThreadForm";

// Gated at the page level too (not just the server action) so a
// not-signed-in visitor never even sees the form -- belt and suspenders
// on top of the database-level Row Level Security.
export default async function NewThreadPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("banned")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl italic text-cream">Start a new thread</h1>
      {profile?.banned ? (
        <p className="rounded-xl border border-red-500/30 bg-navy-900 p-4 text-sm text-cream/70">
          Your account has been banned from posting.
        </p>
      ) : (
        <NewThreadForm />
      )}
    </div>
  );
}
