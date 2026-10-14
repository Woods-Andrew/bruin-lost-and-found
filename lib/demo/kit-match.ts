import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { demoKit, type DemoKitItem } from "@/lib/demo/kit";

let photoHashes: Map<string, DemoKitItem> | null = null;

async function loadPhotoHashes() {
  if (photoHashes) return photoHashes;
  photoHashes = new Map();
  for (const item of demoKit) {
    const filePath = path.join(process.cwd(), "public", item.photoUrl.replace(/^\//, ""));
    const bytes = await readFile(filePath);
    photoHashes.set(createHash("sha256").update(bytes).digest("hex"), item);
  }
  return photoHashes;
}

export async function matchDemoPhoto(bytes: Buffer, filename?: string) {
  const digest = createHash("sha256").update(bytes).digest("hex");
  const byHash = (await loadPhotoHashes()).get(digest);
  if (byHash) return byHash;
  const name = (filename || "").toLowerCase();
  return demoKit.find((item) => name.includes(item.id) || name.includes(item.filename)) || null;
}
