import LegalPage, { LegalSection } from "@/components/LegalPage";

export const metadata = {
  title: "Community Rules — The Contact Sheet",
};

export default function RulesPage() {
  return (
    <LegalPage
      eyebrow="Real Feedback, No Like-and-Run"
      title="Community Rules"
      intro="The Contact Sheet only works if the feedback here is actually useful. These are the standards that keep it that way."
      version="rules-2026-08-28-v1"
      published="August 28, 2026"
      reviewNote="These are the current enforceable standards for the site. Formal appeals process and any jurisdiction-specific safety requirements haven't had legal review yet."
    >
      <LegalSection title="1. Give real feedback">
        <p>
          The whole point of this site is critique that actually helps — say what worked, what
          didn&rsquo;t, and why. A like or a one-word comment isn&rsquo;t what the Critique
          category is for. If you don&rsquo;t have something specific to say, that&rsquo;s fine —
          just don&rsquo;t pass empty engagement off as feedback.
        </p>
      </LegalSection>

      <LegalSection title="2. Treat people like people">
        <p>
          No harassment, threats, hate, or targeting someone across multiple threads. Disagreeing
          with an edit or a technique is fine — disagreeing with a person&rsquo;s right to be here
          isn&rsquo;t.
        </p>
      </LegalSection>

      <LegalSection title="3. Only share work you have the right to share">
        <p>
          Post your own photos, or work you have clear permission to post. That applies to thread
          photos and to anything submitted on the Downloads page (guides, LUTs, preset packs) —
          don&rsquo;t upload someone else&rsquo;s paid product or unlicensed work as your own.
        </p>
      </LegalSection>

      <LegalSection title="4. Use categories the way they're meant to be used">
        <p>
          Threads are organized into General, Critique, Gear Talk, Technique, and Off Topic.
          Post in the category that actually fits — Critique in particular is there so people
          looking to give real feedback can find work that&rsquo;s asking for it.
        </p>
      </LegalSection>

      <LegalSection title="5. Don't weaponize the site">
        <p>
          No spam, scraping, fake accounts, or attempts to get around a ban or a removed post.
          Every download submitted goes through admin review before it&rsquo;s visible to anyone
          else — trying to route around that isn&rsquo;t allowed.
        </p>
      </LegalSection>

      <LegalSection title="6. Enforcement">
        <p>
          Depending on severity, an admin can remove a specific thread or reply, or ban an
          account. A ban stops that account from posting anything new — it doesn&rsquo;t delete
          the account or hide what it already posted. See the{" "}
          <a href="/legal/terms" className="text-sage-400 underline hover:text-sage-300">
            Terms of Service
          </a>{" "}
          for the full picture of how moderation works.
        </p>
        <p>Report a concern using the contact email at the top of this page.</p>
      </LegalSection>
    </LegalPage>
  );
}
