export default function Pill({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "sage" | "danger";
}) {
  const toneClasses =
    tone === "sage"
      ? "border-sage-500/40 text-sage-400"
      : tone === "danger"
      ? "border-red-500/40 text-red-400"
      : "border-navy-600 text-cream/55";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${toneClasses}`}
    >
      {children}
    </span>
  );
}
