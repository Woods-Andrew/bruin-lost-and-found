import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { localPhotoPath } from "@/lib/photos";

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  try {
    const bytes = await readFile(localPhotoPath(filename));
    const type = filename.endsWith(".png")
      ? "image/png"
      : filename.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";
    return new NextResponse(Uint8Array.from(bytes), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
