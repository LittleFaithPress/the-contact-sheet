"use client";

import { useState } from "react";
import { createThread } from "@/app/actions";
import { CATEGORIES } from "@/lib/categories";
import {
  MAX_THREAD_IMAGE_BYTES,
  THREAD_IMAGE_RESIZE_MAX_DIMENSION,
  THREAD_IMAGE_RESIZE_JPEG_QUALITY,
} from "@/lib/threadImage";

// Shrinks a photo in the BROWSER, before it's ever uploaded -- this is what
// lets someone attach a 60+ MB straight-off-the-camera JPEG without it
// getting rejected. Resolution, not the original file's size, is what
// actually drives file size down: capping the long edge at a still-generous
// 2560px and re-encoding as JPEG typically brings even a huge original down
// to a handful of MB, with no visible quality loss for on-screen viewing.
//
// GIFs are left alone -- running one through a canvas would flatten an
// animated GIF to a single still frame, which is worse than just leaving a
// slightly larger file as-is.
//
// Falls back to returning the original file untouched if anything about
// this fails (an older browser, a corrupt image, etc.) -- the upload then
// simply goes through the normal size/type checks like before, so a resize
// failure never blocks posting outright.
async function resizeImageForUpload(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const longestSide = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, THREAD_IMAGE_RESIZE_MAX_DIMENSION / longestSide);

    // Already small enough on both dimensions and file size -- don't
    // re-encode (and re-compress) an image that doesn't need it.
    if (scale === 1 && file.size <= MAX_THREAD_IMAGE_BYTES) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", THREAD_IMAGE_RESIZE_JPEG_QUALITY)
    );
    if (!blob) return file;

    const resizedName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], resizedName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export default function NewThreadForm() {
  const [error, setError] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const [hasImage, setHasImage] = useState(false);

  async function handleSubmit(formData: FormData) {
    const image = formData.get("image") as File | null;
    if (image && image.size > 0) {
      setResizing(true);
      const resized = await resizeImageForUpload(image);
      setResizing(false);
      formData.set("image", resized);
    }

    const result = await createThread(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-cream/60">
          Category
        </label>
        <select
          name="category"
          defaultValue="General"
          className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream focus:border-sage-500 focus:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-cream/60">
          Title
        </label>
        <input
          name="title"
          required
          minLength={3}
          maxLength={200}
          className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream placeholder-cream/30 focus:border-sage-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-cream/60">
          Content
        </label>
        <textarea
          name="body"
          required
          rows={8}
          className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-cream placeholder-cream/30 focus:border-sage-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-cream/60">
          Photo (optional)
        </label>
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setHasImage(!!e.target.files?.[0] && e.target.files[0].size > 0)}
          className="w-full rounded-md border border-navy-600 bg-navy-900 p-2 text-sm text-cream/80 file:mr-3 file:rounded-full file:border-0 file:bg-sage-500 file:px-3 file:py-1 file:text-xs file:font-medium file:text-navy-950"
        />
        <p className="mt-1 text-xs text-cream/40">
          JPG, PNG, WebP, or GIF, any size straight off your camera &mdash; large photos are
          automatically resized in your browser before uploading.
        </p>
      </div>
      {hasImage && (
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            name="imageRightsAttested"
            id="imageRightsAttested"
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy-600 bg-navy-900 text-sage-500 focus:ring-sage-500"
          />
          <label htmlFor="imageRightsAttested" className="text-xs leading-relaxed text-cream/70">
            I created this photo myself (including with AI tools) or otherwise have the right to
            share it here.
          </label>
        </div>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={resizing}
        className="rounded-full bg-sage-500 px-5 py-2 text-sm font-medium text-navy-950 transition hover:bg-sage-400 disabled:opacity-50"
      >
        {resizing ? "Preparing photo..." : "Post thread"}
      </button>
    </form>
  );
}
