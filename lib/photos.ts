import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { config, supabaseConfigured } from "@/lib/config";

const photoDir = path.join(process.cwd(), ".data", "photos");

export async function savePhoto(bytes: Buffer, mimeType: string) {
  const extension = mimeType.includes("png")
    ? "png"
    : mimeType.includes("webp")
      ? "webp"
      : mimeType.includes("svg")
        ? "svg"
        : "jpg";
  const filename = `${randomUUID()}.${extension}`;

  if (supabaseConfigured()) {
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
    const { error } = await supabase.storage
      .from("item-photos")
      .upload(filename, bytes, { contentType: mimeType, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("item-photos").getPublicUrl(filename);
    return data.publicUrl;
  }

  await mkdir(photoDir, { recursive: true });
  await writeFile(path.join(photoDir, filename), bytes);
  return `/api/media/${filename}`;
}

export function localPhotoPath(filename: string) {
  const safe = path.basename(filename);
  return path.join(photoDir, safe);
}
