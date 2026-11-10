import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { UPLOADS_DIR, CONTENT_TYPE_BY_EXTENSION } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Resolve against UPLOADS_DIR and verify the result is still inside it —
  // rejects "../../etc/passwd"-style traversal via the URL segments.
  const requestedPath = path.join(UPLOADS_DIR, ...segments);
  if (!requestedPath.startsWith(UPLOADS_DIR + path.sep) && requestedPath !== UPLOADS_DIR) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  let fileStat;
  try {
    fileStat = await stat(requestedPath);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!fileStat.isFile()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const extension = path.extname(requestedPath).toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXTENSION[extension] || "application/octet-stream";
  // Filenames are `${timestamp}-${uuid}-${originalName}`, so a given URL's
  // content never changes — safe to cache aggressively and indefinitely.
  const baseHeaders = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
  };

  const range = request.headers.get("range");
  if (range) {
    // Video playback/seeking depends on partial content support.
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match) {
      const start = match[1] ? parseInt(match[1], 10) : 0;
      const end = match[2] ? parseInt(match[2], 10) : fileStat.size - 1;

      if (start >= fileStat.size || end >= fileStat.size || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileStat.size}` },
        });
      }

      const nodeStream = createReadStream(requestedPath, { start, end });
      return new NextResponse(Readable.toWeb(nodeStream) as ReadableStream, {
        status: 206,
        headers: {
          ...baseHeaders,
          "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
          "Content-Length": String(end - start + 1),
        },
      });
    }
  }

  const nodeStream = createReadStream(requestedPath);
  return new NextResponse(Readable.toWeb(nodeStream) as ReadableStream, {
    status: 200,
    headers: {
      ...baseHeaders,
      "Content-Length": String(fileStat.size),
    },
  });
}
