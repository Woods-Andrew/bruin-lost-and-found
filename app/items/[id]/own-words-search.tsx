"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OwnWordsSearch({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      className="space-y-3 rounded-2xl bg-paper p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!query.trim()) return;
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }}
    >
      <p className="font-semibold text-ucla-dark">Find this item in your own words</p>
      <p className="text-sm text-slate-600">
        Type a lost-item description, not the listing title. Matching uses the published photo
        description.
      </p>
      <textarea
        className="w-full rounded-xl border px-3 py-2"
        rows={3}
        value={query}
        placeholder={placeholder}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button className="rounded-full bg-ucla-blue px-4 py-2 text-sm font-semibold text-white">
        Search
      </button>
    </form>
  );
}
