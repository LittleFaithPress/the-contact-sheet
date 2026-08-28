import LegalPage, { LegalSection } from "@/components/LegalPage";
import { SECURITY_VERSION } from "@/lib/legalVersions";

export const metadata = {
  title: "Security & Privacy — The Contact Sheet",
};

export default function SecurityPage() {
  return (
    <LegalPage
      eyebrow="How It's Actually Protected"
      title="Security & Privacy"
      intro="A plain-language walkthrough of the protections already built into The Contact Sheet, and what's still a known gap."
      version={SECURITY_VERSION}
      published="August 28, 2026"
      reviewNote="Everything below describes measures that are actually implemented, not planned. It's reviewed and strengthened as the site grows, not a one-time checklist."
    >
      <LegalSection title="Account protection">
        <p>
          Sign-in is handled entirely by Supabase Auth. The app itself never stores or sees your
          password — it only ever asks Supabase to verify it.
        </p>
      </LegalSection>

      <LegalSection title="Three layers, not one">
        <p>
          Every write action (posting a thread, replying, banning a member, approving a download)
          is checked in three separate places: the page itself, the server action handling the
          request, and — the layer that actually matters — the database, using Row Level
          Security. Even if the first two were somehow bypassed, the database still refuses a
          write it shouldn&rsquo;t allow. This is checked against a real test database before
          each change ships, not just reasoned about.
        </p>
      </LegalSection>

      <LegalSection title="Uploads and media">
        <p>
          Thread photos and Downloads-page files are restricted by type and size at the storage
          layer itself, not just in the upload form — a direct request that skips the form still
          gets rejected. Each upload lands in a folder tied to the uploader&rsquo;s own account,
          so one member&rsquo;s upload can&rsquo;t collide with or overwrite another&rsquo;s.
        </p>
        <p>
          When a virus-scanning key is configured, every Downloads-page submission is
          automatically checked against VirusTotal before an admin reviews it. That scan is
          advisory — approving or rejecting a file is always the admin&rsquo;s own decision, not
          an automated one.
        </p>
      </LegalSection>

      <LegalSection title="Browser-side defenses">
        <p>
          The site sends a set of security headers on every page: a Content-Security-Policy that
          limits what scripts and resources are allowed to load at all, protection against
          clickjacking, a strict referrer policy, and a header that blocks camera/microphone/
          location access outright (this site has never asked for any of those).
        </p>
      </LegalSection>

      <LegalSection title="Moderation and bans">
        <p>
          A ban is enforced the same way everything else is — at the database level, not just in
          the app&rsquo;s UI — and it&rsquo;s deliberately one-directional: it blocks new posts
          from that account without touching anything already posted. Only an admin can ban or
          unban a member, and an admin cannot change their own banned status.
        </p>
      </LegalSection>

      <LegalSection title="A known gap: the age gate is self-reported">
        <p>
          Signup requires answering that you&rsquo;re 18 or older. Like almost every site that
          isn&rsquo;t requiring a government ID, that answer is self-reported and can&rsquo;t be
          independently verified — what it actually stops is the same email retrying immediately
          after answering honestly, not a determined person lying the first time or using a
          different email. A more complete fix (a Supabase &ldquo;Before User Created&rdquo; hook
          that enforces this inside Supabase&rsquo;s own signup flow, closing the gap where
          someone could bypass this site entirely and call Supabase directly) is a known follow-up,
          not yet set up.
        </p>
      </LegalSection>

      <LegalSection title="A known gap: backups">
        <p>
          The Contact Sheet currently runs on Supabase&rsquo;s and Vercel&rsquo;s free tiers,
          which don&rsquo;t include automatic backups. If something ever corrupted or deleted
          data unexpectedly, there&rsquo;s no built-in one-click restore today. This is a known,
          disclosed limitation of running on a free tier — not something being hidden.
        </p>
      </LegalSection>

      <LegalSection title="Report a concern">
        <p>
          Use the contact email at the top of this page for a suspected security issue, a privacy
          request, or a safety concern. Please don&rsquo;t include your password or any account
          credentials in the report itself.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
