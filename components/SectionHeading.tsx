import Pill from "@/components/Pill";

export default function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Pill>{eyebrow}</Pill>
      <h2 className="font-serif text-lg text-cream">{title}</h2>
    </div>
  );
}
