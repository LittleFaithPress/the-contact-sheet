import Link from "next/link";
import Pill from "@/components/Pill";

const CONTACT_EMAIL = "fieldnframes.theloupe@gmail.com";

// Shared shell for the four /legal pages (Terms, Privacy, Community Rules,
// Security & Privacy). Keeping the header/status-block/review-callout markup
// in one place means all four stay visually and structurally identical, and
// a wording tweak to the review-status pattern only has to happen once.
export default function LegalPage({
  eyebrow,
  title,
  intro,
  version,
  published,
  reviewNote,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  version: string;
  published: string;
  reviewNote: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-10">
      <div className="space-y-5 border-b border-navy-700 pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-cream/50 transition hover:text-sage-400"
        >
          &larr; Back to The Contact Sheet
        </Link>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[11px] text-cream/60 sm:grid-cols-4">
          <div>
            <dt className="text-cream/35">Status</dt>
            <dd className="mt-0.5">Draft, not lawyer-reviewed</dd>
          </div>
          <div>
            <dt className="text-cream/35">Version</dt>
            <dd className="mt-0.5">{version}</dd>
          </div>
          <div>
            <dt className="text-cream/35">Published</dt>
            <dd className="mt-0.5">{published}</dd>
          </div>
          <div>
            <dt className="text-cream/35">Contact</dt>
            <dd className="mt-0.5">
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-sage-400 underline hover:text-sage-300">
                {CONTACT_EMAIL}
              </a>
            </dd>
          </div>
        </dl>

        <div className="space-y-2.5">
          <Pill tone="sage">{eyebrow}</Pill>
          <h1 className="font-serif text-3xl font-semibold text-cream">{title}</h1>
          <p className="max-w-xl text-sm text-cream/70">{intro}</p>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-sage-500/30 bg-navy-900 p-4">
          <span className="mt-0.5 font-mono text-xs text-sage-400" aria-hidden="true">
            ⚠
          </span>
          <div className="text-sm text-cream/70">
            <p className="font-mono text-[10px] uppercase tracking-wide text-sage-400">
              Review status
            </p>
            <p className="mt-1">{reviewNote}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h2 className="font-serif text-lg text-cream">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-cream/75">{children}</div>
    </section>
  );
}

export { CONTACT_EMAIL };
