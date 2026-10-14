import { NextResponse } from "next/server";
import { analyzePhoto } from "@/lib/ai/vision";
import { requireUser, errorStatus } from "@/lib/session";
import { logError } from "@/lib/log";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    await requireUser();
    const form = await request.formData();
    const file = form.get("photo");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Photo required" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await analyzePhoto(
      buffer.toString("base64"),
      file.type || "image/jpeg",
    );
    return NextResponse.json(result);
  } catch (error) {
    await logError("analyze", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analyze failed" },
      { status: errorStatus(error) },
    );
  }
}
