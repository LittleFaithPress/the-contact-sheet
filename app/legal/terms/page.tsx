import LegalPage, { LegalSection } from "@/components/LegalPage";

export const metadata = {
  title: "Terms of Service — The Contact Sheet",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="The Agreement"
      title="Terms of Service"
      intro="These terms cover how The Contact Sheet actually works today: what reading and posting require, who owns your work, and what happens when the rules aren't followed."
      version="terms-2026-08-28-v1"
      published="August 28, 2026"
      reviewNote="This is a working draft written to match how the site is actually built, not final legal advice. Minimum age, governing law, disputes, and liability language still need a lawyer's review before this is treated as a binding contract."
    >
      <LegalSection title="1. Reading vs. posting">
        <p>
          Every thread and reply on The Contact Sheet is public — you don&rsquo;t need an account
          to read anything here. Creating an account is only required to post a thread, reply, or
          share something on the Downloads page.
        </p>
        <p>
          Signing up asks for a username, an email, and a password — nothing else. There&rsquo;s
          no separate approval step: your account can post as soon as it&rsquo;s created (and
          your email is confirmed, if that&rsquo;s turned on). You&rsquo;re responsible for
          keeping your login to yourself and for anything posted through your account.
        </p>
      </LegalSection>

      <LegalSection title="2. Community participation">
        <p>
          Using The Contact Sheet means following the{" "}
          <a href="/legal/rules" className="text-sage-400 underline hover:text-sage-300">
            Community Rules
          </a>
          : give real feedback instead of empty engagement, don&rsquo;t harass or deceive other
          members, and don&rsquo;t try to abuse the site&rsquo;s systems (spam, scraping,
          automated accounts, and the like).
        </p>
      </LegalSection>

      <LegalSection title="3. Your photos and your work">
        <p>
          You keep ownership of everything you post — threads, replies, thread photos, and
          anything shared on the Downloads page. You&rsquo;re responsible for what you post, and
          you should only share work you actually have the right to share.
        </p>
        <p>
          By posting, you&rsquo;re giving The Contact Sheet the permission it needs to store,
          display, and deliver that content as part of running the site (for example, showing
          your thread photo to other visitors, or letting someone download a resource
          you&rsquo;ve shared). The exact scope of that permission hasn&rsquo;t had a formal legal
          review yet.
        </p>
      </LegalSection>

      <LegalSection title="4. Moderation, bans, and account states">
        <p>
          An admin can pin a thread, remove any thread or reply, or ban a member. A ban is
          deliberately narrow: it stops that account from posting new threads, replies, or
          Downloads uploads going forward. It does not delete the account, and it does not hide
          or remove anything that account already posted — those stay visible, same as before.
        </p>
        <p>
          Moderation exists to keep the site usable and to enforce the Community Rules, not to
          create any promise of permanent access. Content can also be removed on request from its
          owner, or by an admin where it violates the rules.
        </p>
      </LegalSection>

      <LegalSection title="5. This is a small, evolving project">
        <p>
          The Contact Sheet is a community project, not a company, and it&rsquo;s run by one
          person. Features may change, move, or be removed as it&rsquo;s refined, and
          there&rsquo;s no promise of uninterrupted availability — it runs on free-tier hosting
          (Vercel and Supabase), which has its own limits.
        </p>
      </LegalSection>

      <LegalSection title="6. What still needs legal review">
        <p>
          This draft intentionally doesn&rsquo;t invent policy on things that genuinely need a
          lawyer: minimum age, governing law, dispute handling, liability limits, formal legal
          notices, and the final account-deletion and data-retention timeline. Until that review
          happens, treat this page as an accurate description of how the site behaves today, not
          a finished legal contract.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
