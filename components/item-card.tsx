import Link from "next/link";
import type { Item, SearchHit } from "@/lib/types";

export function AiBadge({ source }: { source: string }) {
  const mock = source === "mock" || source === "skipped";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
        mock ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
      }`}
    >
      {mock ? "Mock AI" : "Qwen AI"}
    </span>
  );
}

export function ItemCard({
  item,
  score,
  stage,
}: {
  item: Item;
  score?: number;
  stage?: SearchHit["stage"];
}) {
  return (
    <Link href={`/items/${item.id}`} className="card overflow-hidden block hover:-translate-y-0.5 transition">
      <div className="aspect-[4/3] bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.photoUrl} alt={item.title} className="h-full w-full object-cover" />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-widest text-ucla-blue">{item.kind}</p>
          <AiBadge source={item.aiSource} />
        </div>
        <h3 className="text-lg font-semibold text-ucla-dark">{item.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-600">{item.description}</p>
        <p className="text-sm font-medium text-ucla-blue">{item.location}</p>
        {score !== undefined ? (
          <p className="text-xs text-slate-500">
            {stage === "rerank" ? "Rerank" : "Embedding"} score {score.toFixed(3)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
