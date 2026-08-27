import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UploadResourceForm from "@/components/UploadResourceForm";

// Gated at the page level too, same reasoning as app/new/page.tsx -- a
// not-signed-in visitor never even sees the form. The real gate is still
// Row Level Security (supabase/007_resources_and_downloads.sql).
export default async function UploadResourcePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl italic text-cream">
        Share a guide, LUT, or preset pack
      </h1>
      <UploadResourceForm />
    </div>
  );
}
