// Keep this list in sync with the `allowed_mime_types` set on the
// thread-images bucket in supabase/010_thread_images.sql -- same pattern as
// lib/resourceCategories.ts for the Downloads page's uploads.
export const ALLOWED_THREAD_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

// This is a hard ceiling, not the size most photos actually hit -- see
// components/NewThreadForm.tsx, which resizes/re-compresses a photo in the
// browser before it's ever uploaded, so even a 60+ MB straight-off-the-camera
// JPEG lands well under this. It's set below Supabase Storage's own 50 MB
// per-file cap on the free plan (a platform ceiling that can't be configured
// around on that plan -- see https://supabase.com/docs/guides/storage/uploads/file-limits),
// leaving headroom for the rare case a resize doesn't fully succeed.
export const MAX_THREAD_IMAGE_BYTES = 30 * 1024 * 1024; // 30 MB, matches the bucket's file_size_limit

// The resize target applied client-side before upload: long edge capped at
// this many pixels, re-encoded as JPEG at this quality. This is deliberately
// generous for on-screen critique (bigger than a 4K display's long edge)
// while still typically shrinking even a 60 MB camera JPEG down to a
// handful of MB, since resolution -- not the original file's size -- is
// what actually drives file size down.
export const THREAD_IMAGE_RESIZE_MAX_DIMENSION = 2560;
export const THREAD_IMAGE_RESIZE_JPEG_QUALITY = 0.85;
