import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mx-auto max-w-3xl px-4 pb-10 pt-4">
      <div className="border-t border-navy-700 pt-6 text-center">
        <p className="font-serif italic text-cream/80">
          Real feedback. Real critique. No like-and-run.
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/55">
          New &amp; experienced photographers welcome
        </p>
        <nav className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1.5 font-mono text-[11px] text-cream/50">
          <Link href="/legal/terms" className="transition hover:text-sage-400">
            Terms
          </Link>
          <Link href="/legal/privacy" className="transition hover:text-sage-400">
            Privacy
          </Link>
          <Link href="/legal/rules" className="transition hover:text-sage-400">
            Community Rules
          </Link>
          <Link href="/legal/security" className="transition hover:text-sage-400">
            Security &amp; Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
