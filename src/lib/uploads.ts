import path from "node:path";

// User-uploaded media lives outside `public/` on purpose: files written to
// `public/` after `next build` are not reliably served by `next start` in
// this Next.js version (requests for them can hit a stale cached not-found
// response instead of the file). Storing uploads here and serving them via
// src/app/uploads/[...path]/route.ts (a real, dynamic route) sidesteps that
// entirely — every request does a live filesystem read.
export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".avi": "video/x-msvideo",
};
