const { readFile, stat } = require("fs/promises");
const path = require("path");
const { NextResponse } = require("next/server");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPES = {
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

function getUploadPath(file) {
  const safeFile = path.basename(file || "");
  if (!safeFile || safeFile !== file) return null;

  const extension = path.extname(safeFile).toLowerCase();
  if (!CONTENT_TYPES[extension]) return null;

  return {
    contentType: CONTENT_TYPES[extension],
    filePath: path.join(process.cwd(), "public", "uploads", safeFile)
  };
}

export async function GET(_request, { params }) {
  const upload = getUploadPath(params.file);
  if (!upload) return new NextResponse("Not found", { status: 404 });

  try {
    const bytes = await readFile(upload.filePath);
    return new NextResponse(bytes, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": upload.contentType
      }
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

export async function HEAD(_request, { params }) {
  const upload = getUploadPath(params.file);
  if (!upload) return new NextResponse(null, { status: 404 });

  try {
    const fileStat = await stat(upload.filePath);
    return new NextResponse(null, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(fileStat.size),
        "Content-Type": upload.contentType
      }
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
