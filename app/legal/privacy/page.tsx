import LegalPage, { LegalSection } from "@/components/LegalPage";

export const metadata = {
  title: "Privacy Policy — The Contact Sheet",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Your Information"
      title="Privacy Policy"
      intro="A description of exactly what The Contact Sheet stores and why — grounded in what the app actually does, not a generic template."
      version="privacy-2026-08-28-v2"
      published="August 28, 2026"
      reviewNote="This draft is grounded in the implemented application, not guessed at. Final retention timelines and any jurisdiction-specific rights (like GDPR or CCPA requests) still need legal review before this is treated as a complete policy."
    >
      <LegalSection title="1. Information The Contact Sheet collects">
        <p>
          Signing up asks for a username, an email address, and a password. The password itself
          is handled entirely by Supabase Auth (the site&rsquo;s authentication provider) — the
          app never sees or stores it in plain text.
        </p>
        <p>
          Signup also asks your age, as a plain number, solely to confirm you&rsquo;re 18 or
          older. That number is used once, for that check, and is never saved — not to your
          profile, not anywhere. The one thing that IS kept: if you enter an age under 18, the
          email address you typed is stored in a blocklist so the same email can&rsquo;t be
          resubmitted. See{" "}
          <a href="/legal/terms" className="text-sage-400 underline hover:text-sage-300">
            Terms of Service
          </a>{" "}
          section 4 for the full picture, including this check&rsquo;s real limits.
        </p>
        <p>
          Beyond that, The Contact Sheet stores whatever you actually post: thread titles and
          bodies, replies, an optional photo attached to a thread, and anything you submit on the
          Downloads page (a file plus its title, description, and category). It also keeps a
          record of your account&rsquo;s role (member or admin) and whether it&rsquo;s currently
          banned.
        </p>
        <p>
          It does not ask for your real name, location, phone number, or date of birth at any
          point in normal use.
        </p>
      </LegalSection>

      <LegalSection title="2. Why it's used">
        <p>
          This information exists to run the site: signing you in, showing your username next to
          what you post, letting you create threads/replies/downloads, and giving an admin what
          they need to moderate (approve a download, pin or remove a post, ban an account that
          breaks the rules).
        </p>
      </LegalSection>

      <LegalSection title="3. What's public vs. what isn't">
        <p>
          The Contact Sheet is a public forum, not a private members-only space. Every thread,
          every reply, your username, and any approved Downloads-page upload are visible to
          anyone who visits the site — signed in or not. If you post it, assume it&rsquo;s public.
        </p>
        <p>
          Your email address is never shown publicly. It&rsquo;s used only for sign-in, email
          confirmation, and password-reset — it&rsquo;s visible to Supabase Auth (which manages
          it) and to the site owner through the Supabase dashboard, not to other members.
        </p>
      </LegalSection>

      <LegalSection title="4. Who else sees it">
        <p>
          The Contact Sheet runs on a small set of infrastructure providers acting on its
          behalf: Supabase (database, authentication, and file storage) and Vercel (hosting the
          site itself). If you submit something on the Downloads page and the site owner has
          turned on automatic virus scanning, that file is also sent to VirusTotal to be checked
          before it&rsquo;s approved.
        </p>
        <p>
          The Contact Sheet does not sell member information, and doesn&rsquo;t use advertising
          trackers.
        </p>
      </LegalSection>

      <LegalSection title="5. Security">
        <p>
          See the{" "}
          <a href="/legal/security" className="text-sage-400 underline hover:text-sage-300">
            Security &amp; Privacy
          </a>{" "}
          page for the full plain-language breakdown of how this data is protected.
        </p>
      </LegalSection>

      <LegalSection title="6. Correction and deletion">
        <p>
          There isn&rsquo;t a self-service &ldquo;delete my account&rdquo; button yet. To request
          that your account and posts be removed, email the contact on this page. It&rsquo;s a
          manual process today, not instant erasure — some records may be kept where there&rsquo;s
          a legitimate reason (for example, moderation history connected to a ban, or backups),
          and the final retention timeline for that hasn&rsquo;t had legal review yet.
        </p>
      </LegalSection>

      <LegalSection title="7. Changes">
        <p>
          If this policy changes in a way that matters, the version and published date at the top
          of this page will be updated.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
