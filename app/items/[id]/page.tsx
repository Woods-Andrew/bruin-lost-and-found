import Link from "next/link";
import { notFound } from "next/navigation";
import { AiBadge } from "@/components/item-card";
import { getStore } from "@/lib/store";
import { getSession } from "@/lib/session";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getStore().getItem(id);
  if (!item) notFound();
  const user = await getSession();

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="card overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.photoUrl} alt={item.title} className="w-full object-cover max-h-[28rem]" />
      </div>
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-ucla-blue">
            {item.kind} · {item.status}
          </p>
          <AiBadge source={item.aiSource} />
        </div>
        <h1 className="text-3xl font-semibold text-ucla-dark">{item.title}</h1>
        <p className="text-slate-700 leading-7">{item.description}</p>
        <p className="font-medium text-ucla-blue">{item.location}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {Object.entries(item.attributes).map(([key, value]) => (
            <div key={key}>
              <dt className="uppercase tracking-wide text-slate-500">{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {user && item.status === "published" ? (
          <Link
            className="inline-flex rounded-full bg-ucla-gold px-5 py-2 font-semibold text-ucla-dark"
            href={`/items/${item.id}/claim`}
          >
            Claim this item
          </Link>
        ) : null}
        {!user ? (
          <Link className="text-ucla-blue font-semibold" href="/login">
            Sign in to submit a claim
          </Link>
        ) : null}
      </div>
    </div>
  );
}
