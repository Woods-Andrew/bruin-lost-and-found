import { runWithRetry } from "@/lib/jobs/queue";
import { config, rerankConfigured } from "@/lib/config";
import { logError } from "@/lib/log";
import type { AiSource, Item } from "@/lib/types";
import { itemText } from "@/lib/ai/matching";

export type RerankResult = {
  scores: number[];
  source: AiSource | "skipped";
  note: string;
};

async function callRerank(query: string, documents: string[]) {
  const url = `${config.rerankUrl.replace(/\/$/, "")}/v1/rerank`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.qwenApiKey}`,
    },
    body: JSON.stringify({
      model: config.rerankModel,
      query: `Given a lost-item description, retrieve matching lost-and-found listings.\nQuery: ${query}`,
      documents,
    }),
  });
  if (!response.ok) {
    throw new Error(`Rerank endpoint ${response.status}: ${await response.text()}`);
  }
  const body = (await response.json()) as {
    results?: { index: number; relevance_score: number }[];
  };
  const scores = documents.map((_, index) => {
    const hit = body.results?.find((result) => result.index === index);
    return hit?.relevance_score ?? 0;
  });
  return scores;
}

export async function rerankItems(query: string, items: Item[]): Promise<RerankResult> {
  if (!items.length || !rerankConfigured()) {
    return {
      scores: items.map(() => 0),
      source: "skipped",
      note: "Qwen3-VL-Reranker is not configured. Showing embedding similarity only.",
    };
  }
  try {
    const documents = items.map((item) => itemText(item));
    const scores = await runWithRetry("rerank", () => callRerank(query, documents));
    return {
      scores,
      source: "qwen",
      note: "Refined with the configured Qwen3-VL-Reranker endpoint.",
    };
  } catch (error) {
    await logError("rerank", error);
    return {
      scores: items.map(() => 0),
      source: "skipped",
      note: "Reranker failed after retries. Falling back to embedding similarity. This is not a simulated rerank.",
    };
  }
}
