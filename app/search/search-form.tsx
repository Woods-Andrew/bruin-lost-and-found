"use client";

import { useEffect, useState } from "react";
import { ItemCard } from "@/components/item-card";
import { demoKit } from "@/lib/demo/kit";
import type { SearchResponse } from "@/lib/types";

const sampleQueries = [
  "navy north face backpack with a UCLA keychain",
  ...demoKit.map((item) => item.searchQuery),
];

export function SearchForm({ defaultQuery }: { defaultQuery?: string }) {
  const [query, setQuery] = useState(
    defaultQuery || "navy north face backpack with a UCLA keychain",
  );
  const [watch, setWatch] = useState(true);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (defaultQuery) void search();
    // Prefill from a demo-kit publish.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function search() {
    setPending(true);
    setError("");
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, watch }),
    });
    const body = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(body.error || "Search failed");
      return;
    }
    setResult(body as SearchResponse);
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 space-y-4">
        <h1 className="text-3xl font-semibold text-ucla-dark">Describe your item</h1>
        <p className="text-slate-600">
          Semantic search compares your words to stored photos and descriptions. Results say
          whether Qwen3-VL-Embedding ran or a labeled mock embedding was used.
        </p>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((sample) => (
            <button
              key={sample}
              type="button"
              className="rounded-full border border-ucla-blue/30 px-3 py-1 text-left text-xs text-ucla-blue hover:bg-ucla-blue/10"
              onClick={() => setQuery(sample)}
            >
              {sample}
            </button>
          ))}
        </div>
        <textarea
          className="w-full rounded-2xl border px-4 py-3"
          rows={4}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={watch} onChange={(event) => setWatch(event.target.checked)} />
          Alert me in-app if a new listing looks similar
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          className="rounded-full bg-ucla-blue px-5 py-2 font-semibold text-white disabled:opacity-60"
          onClick={() => void search()}
          disabled={pending}
        >
          {pending ? "Searching…" : "Find matches"}
        </button>
      </div>
      {result ? (
        <div className="space-y-4">
          <p
            className={`rounded-2xl px-4 py-3 text-sm ${
              result.embeddingSource === "mock" ? "bg-amber-100 text-amber-950" : "bg-emerald-100 text-emerald-950"
            }`}
          >
            {result.note}
          </p>
          {result.hits.length === 0 ? (
            <p className="card p-6">No close matches yet. Save the search to get an in-app alert.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.hits.map((hit) => (
                <ItemCard key={hit.item.id} item={hit.item} score={hit.score} stage={hit.stage} />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
