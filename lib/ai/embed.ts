import { cacheKey, readCache, writeCache } from "@/lib/ai/cache";
import { mockEmbed, padEmbedding } from "@/lib/ai/matching";
import { runWithRetry } from "@/lib/jobs/queue";
import { config, embeddingConfigured } from "@/lib/config";
import { logError } from "@/lib/log";
import type { AiSource } from "@/lib/types";

export type EmbeddingResult = {
  vector: number[];
  source: AiSource;
  note: string;
};

async function callEmbedding(text: string): Promise<number[]> {
  const url = `${config.embeddingUrl.replace(/\/$/, "")}/v1/embeddings`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.qwenApiKey}`,
    },
    body: JSON.stringify({
      model: config.embeddingModel,
      input: [`Instruct: Retrieve lost-and-found items that match this description\nQuery: ${text}`],
    }),
  });
  if (!response.ok) {
    throw new Error(`Embedding endpoint ${response.status}: ${await response.text()}`);
  }
  const body = (await response.json()) as { data?: { embedding: number[] }[] };
  const vector = body.data?.[0]?.embedding;
  if (!vector) throw new Error("Embedding endpoint returned no vector");
  return padEmbedding(vector);
}

export async function embedText(text: string): Promise<EmbeddingResult> {
  const key = cacheKey("embedding", text);
  const cached = await readCache<EmbeddingResult>(key);
  if (cached) return cached;

  if (!embeddingConfigured()) {
    const result: EmbeddingResult = {
      vector: mockEmbed(text),
      source: "mock",
      note: "Mock lexical embedding (no Qwen3-VL-Embedding endpoint). Not real model inference.",
    };
    await writeCache(key, "embedding", result);
    return result;
  }

  try {
    const vector = await runWithRetry("embedding", () => callEmbedding(text));
    const result: EmbeddingResult = {
      vector,
      source: "qwen",
      note: "Embedded with the configured Qwen3-VL-Embedding endpoint.",
    };
    await writeCache(key, "embedding", result);
    return result;
  } catch (error) {
    await logError("embedding", error);
    return {
      vector: mockEmbed(text),
      source: "mock",
      note: "Embedding endpoint failed after retries. Using labeled mock embeddings, not Qwen inference.",
    };
  }
}
