"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ItemAttributes, ItemKind, VisionResult } from "@/lib/types";

const emptyAttributes: ItemAttributes = {
  category: "",
  color: "",
  brand: "",
  material: "",
  distinctiveMarks: "",
};

export function UploadForm({ defaultKind }: { defaultKind: ItemKind }) {
  const router = useRouter();
  const [kind, setKind] = useState<ItemKind>(defaultKind);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [vision, setVision] = useState<VisionResult | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [attributes, setAttributes] = useState<ItemAttributes>(emptyAttributes);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"analyze" | "publish" | "">("");

  async function analyze() {
    if (!photo) {
      setError("Choose a photo first");
      return;
    }
    setPending("analyze");
    setError("");
    const form = new FormData();
    form.set("photo", photo);
    const response = await fetch("/api/analyze", { method: "POST", body: form });
    const body = (await response.json()) as VisionResult & { error?: string };
    setPending("");
    if (!response.ok) {
      setError(body.error || "Analyze failed");
      return;
    }
    setVision(body);
    setTitle(body.title);
    setDescription(body.description);
    setAttributes(body.attributes);
  }

  async function publish() {
    if (!photo) {
      setError("Photo required");
      return;
    }
    setPending("publish");
    setError("");
    const form = new FormData();
    form.set("photo", photo);
    form.set("kind", kind);
    form.set("title", title);
    form.set("description", description);
    form.set("location", location);
    form.set("attributes", JSON.stringify(attributes));
    const response = await fetch("/api/items", { method: "POST", body: form });
    const body = await response.json();
    setPending("");
    if (!response.ok) {
      setError(body.error || "Publish failed");
      return;
    }
    router.push(`/items/${body.item.id}`);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="card p-6 space-y-4">
        <h1 className="text-3xl font-semibold text-ucla-dark">Upload an item</h1>
        <label className="block text-sm font-medium">
          Report type
          <select
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            value={kind}
            onChange={(event) => setKind(event.target.value as ItemKind)}
          >
            <option value="found">I found something</option>
            <option value="lost">I lost something</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Photo
          <input
            className="mt-1 block w-full text-sm"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setPhoto(file);
              setPreview(file ? URL.createObjectURL(file) : "");
              setVision(null);
            }}
          />
        </label>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Upload preview" className="rounded-2xl max-h-72 object-cover" />
        ) : null}
        <button
          className="rounded-full bg-ucla-blue px-5 py-2 font-semibold text-white disabled:opacity-60"
          onClick={() => void analyze()}
          disabled={pending !== ""}
        >
          {pending === "analyze" ? "Analyzing…" : "Generate description"}
        </button>
      </section>
      <section className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold text-ucla-dark">Review before publishing</h2>
        {vision ? (
          <p className={`rounded-xl px-3 py-2 text-sm ${vision.source === "mock" ? "bg-amber-100 text-amber-950" : "bg-emerald-100 text-emerald-950"}`}>
            {vision.note}
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            Run analysis, then edit every field. Mock output is never shown as live inference.
          </p>
        )}
        <label className="block text-sm font-medium">
          Title
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Description
          <textarea className="mt-1 w-full rounded-xl border px-3 py-2" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Last seen / found location
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Powell Library" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(attributes).map(([key, value]) => (
            <label key={key} className="block text-sm font-medium capitalize">
              {key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={value}
                onChange={(event) =>
                  setAttributes((current) => ({ ...current, [key]: event.target.value }))
                }
              />
            </label>
          ))}
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          className="rounded-full bg-ucla-gold px-5 py-2 font-semibold text-ucla-dark disabled:opacity-60"
          onClick={() => void publish()}
          disabled={pending !== ""}
        >
          {pending === "publish" ? "Publishing…" : "Publish listing"}
        </button>
      </section>
    </div>
  );
}
