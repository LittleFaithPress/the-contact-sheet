// Keep this list in sync with the `check` constraint on resources.category in
// supabase/007_resources_and_downloads.sql -- same pattern as
// lib/categories.ts for thread categories.
export const RESOURCE_CATEGORIES = ["Guide", "LUT", "Preset Pack"] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export function isResourceCategory(value: string): value is ResourceCategory {
  return (RESOURCE_CATEGORIES as readonly string[]).includes(value);
}

export const RESOURCE_CATEGORY_DESCRIPTIONS: Record<ResourceCategory, string> = {
  Guide: "Written how-tos and reference PDFs.",
  LUT: "Color-grading LUT files, zipped up.",
  "Preset Pack": "Lightroom/Photoshop preset bundles, zipped up.",
};

// Mirrors the bucket's own allowed_mime_types in the migration -- kept here
// too so the upload form can reject an obviously-wrong file client-side
// before it's even sent. The real enforcement is server-side (the bucket
// config), this is just a faster, friendlier error for an honest mistake.
export const ALLOWED_RESOURCE_MIME_TYPES = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "image/jpeg",
  "image/png",
] as const;

export const MAX_RESOURCE_FILE_BYTES = 50 * 1024 * 1024; // 50 MB, Supabase's free-tier per-file cap
