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
      version="terms-2026-08-28-v3"
      published="August 28, 2026"
      reviewNote="This is a working draft written to match how the site is actually built, not final legal advice — none of it has had an actual lawyer's review yet."
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

      <LegalSection title="4. You must be 18 or older">
        <p>
          Creating an account requires confirming you&rsquo;re 18 or older. Signup asks for your
          age directly as a plain number, not a birthdate — it&rsquo;s used once to make that
          check and then discarded, never saved to your profile or anywhere else. If you say
          you&rsquo;re under 18, the email address you used gets blocked from signing up again.
        </p>
        <p>
          This is a self-reported check, not an identity or age verification service — The
          Contact Sheet has no way to independently confirm anyone&rsquo;s real age, which is true
          of nearly every site that isn&rsquo;t requiring a government ID. If you&rsquo;re a parent
          or guardian and believe a minor is using the site, contact us at the email above and the
          account will be removed.
        </p>
      </LegalSection>

      <LegalSection title="5. Moderation, bans, and account states">
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

      <LegalSection title="6. Limitation of liability">
        <p>
          The Contact Sheet is provided &ldquo;as is,&rdquo; without warranties of any kind,
          express or implied — including that it will be uninterrupted, error-free, or free of
          harmful content posted by other members. To the fullest extent the law allows, the
          site&rsquo;s operator is not liable for indirect, incidental, or consequential damages
          arising from your use of the site or from content posted by anyone else, including
          thread photos, replies, or anything shared on the Downloads page.
        </p>
        <p>
          If you download a file from the Downloads page, you do so at your own risk. Files are
          reviewed by an admin and, when a scanning key is configured, automatically checked with
          VirusTotal before approval (see{" "}
          <a href="/legal/security" className="text-sage-400 underline hover:text-sage-300">
            Security &amp; Privacy
          </a>
          ) — but that review is a precaution, not a guarantee that any file is safe.
        </p>
      </LegalSection>

      <LegalSection title="7. Copyright — notice and takedown">
        <p>
          If you believe something posted on The Contact Sheet infringes your copyright, send a
          notice to the contact email at the top of this page including: a description of the
          copyrighted work; the URL or thread where the material appears; your contact
          information; a statement that you have a good-faith belief the use isn&rsquo;t
          authorized; and a statement, made under penalty of perjury, that the notice is accurate
          and that you&rsquo;re authorized to act on the copyright owner&rsquo;s behalf. On a valid
          notice, the material will be removed or disabled. An account posting repeat infringing
          material is subject to removal.
        </p>
      </LegalSection>

      <LegalSection title="8. Indemnification">
        <p>
          You agree to indemnify and hold The Contact Sheet&rsquo;s operator harmless from any
          claim, damage, or expense — including reasonable legal fees — arising from content you
          post, your violation of these Terms or the{" "}
          <a href="/legal/rules" className="text-sage-400 underline hover:text-sage-300">
            Community Rules
          </a>
          , or your violation of any law or another person&rsquo;s rights.
        </p>
      </LegalSection>

      <LegalSection title="9. Governing law and disputes">
        <p>
          These Terms are governed by the laws of the State of Illinois, without regard to its
          conflict-of-laws rules. Any dispute arising from these Terms or
          your use of the site is handled in the state or federal courts located there, and by
          creating an account you consent to that jurisdiction — rather than mandatory
          arbitration, which is more suited to larger commercial platforms than a site run by one
          person.
        </p>
      </LegalSection>

      <LegalSection title="10. This is a small, evolving project">
        <p>
          The Contact Sheet is a community project, not a company, and it&rsquo;s run by one
          person. Features may change, move, or be removed as it&rsquo;s refined, and
          there&rsquo;s no promise of uninterrupted availability — it runs on free-tier hosting
          (Vercel and Supabase), which has its own limits.
        </p>
      </LegalSection>

      <LegalSection title="11. What still needs legal review">
        <p>
          This draft covers the ground a lawyer would normally flag as missing entirely, but
          it&rsquo;s still not a substitute for one reviewing it. Specifically still open: the
          exact scope of the content license in Section 3 hasn&rsquo;t had formal review; and the
          final account-deletion and data-retention timeline referenced in the{" "}
          <a href="/legal/privacy" className="text-sage-400 underline hover:text-sage-300">
            Privacy Policy
          </a>{" "}
          isn&rsquo;t locked down. Treat this page as an accurate, good-faith description of how
          the site behaves today, not a finished, attorney-reviewed contract.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
