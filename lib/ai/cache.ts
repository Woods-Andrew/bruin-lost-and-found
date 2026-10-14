import { createHash } from "node:crypto";
import { getStore } from "@/lib/store";

export function cacheKey(kind: string, payload: string) {
  return createHash("sha256").update(`${kind}:${payload}`).digest("hex");
}

export async function readCache<T>(key: string) {
  const entry = await getStore().getAiCache(key);
  return (entry?.payload as T | undefined) ?? null;
}

export async function writeCache(key: string, kind: string, payload: unknown) {
  await getStore().setAiCache({
    key,
    kind,
    payload,
    createdAt: new Date().toISOString(),
  });
}
