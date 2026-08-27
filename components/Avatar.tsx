// Deterministic initials avatar -- same username always lands on the same
// tone, no image upload/storage to worry about. Tones stay inside the
// existing sage/navy palette so a page full of them still reads as one
// brand rather than a rainbow of random colors.
const TONES = [
  "bg-sage-600 text-navy-950",
  "bg-navy-600 text-cream",
  "bg-sage-700 text-cream",
  "bg-navy-500 text-cream",
];

function toneFor(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) >>> 0;
  }
  return TONES[hash % TONES.length];
}

export default function Avatar({
  username,
  size = "sm",
}: {
  username: string;
  size?: "sm" | "md";
}) {
  const initial = username.trim().charAt(0).toUpperCase() || "?";
  const dims = size === "md" ? "h-9 w-9 text-sm" : "h-6 w-6 text-[10px]";

  return (
    <span
      aria-hidden
      className={`flex ${dims} shrink-0 items-center justify-center rounded-full font-mono font-medium ${toneFor(
        username
      )}`}
    >
      {initial}
    </span>
  );
}
