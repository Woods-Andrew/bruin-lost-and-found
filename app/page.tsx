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
              <li>2. Upload a photo and generate an AI description</li>
              <li>3. Search by typing your own description</li>
              <li>4. Submit a claim with identifying details</li>
              <li>5. Staff approves pickup</li>
            </ol>
          </div>
        </div>
      </section>
      <section className="card p-6 space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ucla-blue">
            Photos for the live demo
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-ucla-dark">Upload one of these, then search in your own words</h2>
          <p className="mt-1 text-slate-600">
            Sign in, open Upload, click a photo, generate the description, publish, then type something
            like “green backpack with a rubber duck.” Files also live in <code>public/demo/</code>.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["/demo/lime-jansport.jpg", "Lime Jansport mini backpack"],
            ["/demo/switch-case.jpg", "Red Switch case"],
            ["/demo/cs31-pencils.jpg", "CS 31 pencil case"],
          ].map(([src, label]) => (
            <Link key={src} href="/upload?kind=found" className="overflow-hidden rounded-2xl border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={label} className="h-40 w-full object-cover" />
              <span className="block p-3 text-sm font-medium text-ucla-dark">{label}</span>
            </Link>
          ))}
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
