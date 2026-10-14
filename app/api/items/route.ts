import { NextResponse } from "next/server";
import { embedText } from "@/lib/ai/embed";
import { itemText } from "@/lib/ai/matching";
import { maybeAlertWatchers } from "@/lib/ai/search";
import { logError } from "@/lib/log";
import { savePhoto } from "@/lib/photos";
import { errorStatus, requireUser } from "@/lib/session";
import { getStore } from "@/lib/store";
import type { ItemAttributes, ItemKind } from "@/lib/types";

export const maxDuration = 60;

export async function GET() {
  const items = await getStore().listItems();
  return NextResponse.json({
    items: items.filter((item) => item.status !== "draft" && item.status !== "removed"),
  });
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const form = await request.formData();
    const photo = form.get("photo");
    if (!(photo instanceof File)) {
      return NextResponse.json({ error: "Photo required" }, { status: 400 });
    }
    const kind = String(form.get("kind") || "found") as ItemKind;
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim();
    const location = String(form.get("location") || "").trim();
    const attributes = JSON.parse(String(form.get("attributes") || "{}")) as ItemAttributes;
    if (!title || !description || !location) {
      return NextResponse.json({ error: "Title, description, and location are required" }, { status: 400 });
    }
    const photoUrl = await savePhoto(
      Buffer.from(await photo.arrayBuffer()),
      photo.type || "image/jpeg",
    );
    const embedding = await embedText(itemText({ title, description, attributes, location }));
    const item = await getStore().createItem({
      kind,
      status: "published",
      title,
      description,
      attributes,
      location,
      photoUrl,
      reporterId: user.id,
      embedding: embedding.vector,
      aiSource: embedding.source,
    });
    await maybeAlertWatchers(item.id);
    return NextResponse.json({ item, embeddingNote: embedding.note });
  } catch (error) {
    await logError("items", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not publish item" },
      { status: errorStatus(error) },
    );
  }
}
