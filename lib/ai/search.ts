import { cosine, itemText } from "@/lib/ai/matching";
import { embedText } from "@/lib/ai/embed";
import { rerankItems } from "@/lib/ai/rerank";
import { getStore } from "@/lib/store";
import type { SearchResponse } from "@/lib/types";

export async function searchItems(query: string): Promise<SearchResponse> {
  const store = getStore();
  const embedding = await embedText(query);
  const items = (await store.listItems()).filter(
    (item) => item.status === "published" && item.embedding,
  );
  const ranked = items
    .map((item) => ({
      item,
      score: cosine(embedding.vector, item.embedding),
      stage: "embedding" as const,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  const rerank = await rerankItems(
    query,
    ranked.map((hit) => hit.item),
  );

  const hits =
    rerank.source === "qwen"
      ? ranked
          .map((hit, index) => ({
            item: hit.item,
            score: rerank.scores[index] ?? hit.score,
            stage: "rerank" as const,
          }))
          .sort((a, b) => b.score - a.score)
      : ranked;

  return {
    hits: hits.slice(0, 8),
    embeddingSource: embedding.source,
    rerankSource: rerank.source,
    note: `${embedding.note} ${rerank.note}`,
  };
}

export async function maybeAlertWatchers(itemId: string) {
  const store = getStore();
  const item = await store.getItem(itemId);
  if (!item?.embedding || item.status !== "published") return;
  const queries = await store.listSavedQueries();
  for (const saved of queries) {
    const score = cosine(saved.embedding, item.embedding);
    if (score < 0.35) continue;
    await store.createAlert({
      userId: saved.userId,
      itemId: item.id,
      title: `Possible match for “${saved.query}”`,
      body: `${item.title} at ${item.location} looks similar to a search you saved.`,
    });
  }
}

export { itemText };
