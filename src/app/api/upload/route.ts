import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { UPLOADS_DIR } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;  // 10 MB
const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
]);

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
]);

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
  "video/x-msvideo": ".avi",
};

function sanitizeBaseName(fileName: string) {
  const baseName = path.parse(fileName).name;

  return (
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image"
  );
}

export async function POST(request: Request) {
  // /api/* is not covered by middleware.ts's matcher, so this route must
  // check the admin session itself — without this, anyone on the internet
  // could upload arbitrary files (disk exhaustion, hosting abuse) with no
  // authentication at all.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "No files were uploaded." }, { status: 400 });
    }

    await mkdir(UPLOADS_DIR, { recursive: true });

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        if (!ALLOWED_MIME_TYPES.has(file.type)) {
          throw new Error(`Unsupported file type for ${file.name}.`);
        }

        const maxSize = VIDEO_MIME_TYPES.has(file.type)
          ? MAX_VIDEO_SIZE_BYTES
          : MAX_IMAGE_SIZE_BYTES;

        if (file.size > maxSize) {
          const limitLabel = VIDEO_MIME_TYPES.has(file.type) ? "200MB" : "10MB";
          throw new Error(`${file.name} exceeds the ${limitLabel} upload limit.`);
        }

        const extension = path.extname(file.name).toLowerCase() || MIME_EXTENSION_MAP[file.type];
        const safeBaseName = sanitizeBaseName(file.name);
        const fileName = `${Date.now()}-${randomUUID()}-${safeBaseName}${extension}`;
        const absoluteFilePath = path.join(UPLOADS_DIR, fileName);
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        await writeFile(absoluteFilePath, fileBuffer);

        return {
          name: file.name,
          path: `/uploads/${fileName}`,
          size: file.size,
          type: file.type,
        };
      })
    );

    return NextResponse.json({ files: uploadedFiles }, { status: 201 });
  } catch (error) {
    console.error("Upload failed:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload files.",
      },
      { status: 500 }
    );
  }
}
