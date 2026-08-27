// Keep this list in sync with the `check` constraint on threads.category in
// supabase/003_categories_and_pinning.sql -- it's the single source of truth
// for what a thread can be tagged as, both in the UI and in the database.
export const CATEGORIES = [
  "General",
  "Critique",
  "Gear Talk",
  "Technique",
  "Off Topic",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

// Short, plain-language explanation of what belongs in each category --
// shown under the filter pills so people don't have to guess before they
// pick one.
export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  General:
    "Anything that doesn't need its own category — introductions, community news, and general photography chat.",
  Critique:
    "Share a photo and get real feedback on composition, light, and editing choices.",
  "Gear Talk":
    "Cameras, lenses, and other equipment — questions, reviews, and buying advice.",
  Technique:
    "How-to discussion — exposure, lighting setups, editing workflow, and skill-building.",
  "Off Topic":
    "Anything non-photography the community still wants to talk about.",
};
