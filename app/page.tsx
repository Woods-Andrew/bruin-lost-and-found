import Link from "next/link";

const actions = [
  {
    href: "/upload?kind=lost",
    title: "Lost something",
    body: "Tell us what went missing. We’ll match your description against found photos.",
  },
  {
    href: "/upload?kind=found",
    title: "Found something",
    body: "Upload a photo. Review the AI description, then publish it for other Bruins.",
  },
  {
    href: "/browse",
    title: "Browse items",
    body: "See published lost and found listings across campus.",
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="card overflow-hidden">
        <div className="grid gap-8 p-8 md:grid-cols-[1.3fr_1fr] md:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ucla-blue">
              Bruins helping Bruins
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ucla-dark md:text-5xl">
              Find it before the quarter finds you.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Bruin Lost and Found uses a vision-language model to describe photos, then
              Qwen3-VL-Embedding (and optional reranking) to match plain-language searches.
            </p>
          </div>
          <div className="rounded-3xl bg-ucla-dark p-6 text-white">
            <p className="text-ucla-gold">Campus demo flow</p>
            <ol className="mt-3 space-y-2 text-sm leading-6">
              <li>1. Sign in with a university email</li>
              <li>2. Upload a found item and edit the AI description</li>
              <li>3. Search in plain language</li>
              <li>4. Submit a claim with identifying details</li>
              <li>5. Staff approves pickup</li>
            </ol>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="card p-6 hover:-translate-y-0.5 transition">
            <h2 className="text-2xl font-semibold text-ucla-dark">{action.title}</h2>
            <p className="mt-2 text-slate-600">{action.body}</p>
            <p className="mt-4 text-sm font-semibold text-ucla-blue">Continue →</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
