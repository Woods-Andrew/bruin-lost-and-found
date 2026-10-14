"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { demoKit, type DemoKitItem } from "@/lib/demo/kit";
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
  const [kitItem, setKitItem] = useState<DemoKitItem | null>(null);
  const [vision, setVision] = useState<VisionResult | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [attributes, setAttributes] = useState<ItemAttributes>(emptyAttributes);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"analyze" | "publish" | "">("");

  function applyKitCopy(item: DemoKitItem) {
    setTitle(item.title);
    setDescription(item.description);
    setLocation(item.location);
    setAttributes(item.attributes);
  }

  async function chooseKit(item: DemoKitItem) {
    const response = await fetch(item.photoUrl);
    const blob = await response.blob();
    const file = new File([blob], item.filename, { type: blob.type || "image/jpeg" });
    setKitItem(item);
    setPhoto(file);
    setPreview(item.photoUrl);
    setVision(null);
    setTitle("");
    setDescription("");
    setLocation("");
    setAttributes(emptyAttributes);
    setError("");
  }

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
    if (kitItem) {
      router.push(`/search?q=${encodeURIComponent(kitItem.searchQuery)}`);
    } else {
      router.push(`/items/${body.item.id}`);
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="card p-6 space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ucla-blue">
            Live demo kit
          </p>
          <h2 className="mt-1 text-xl font-semibold text-ucla-dark">Pick a photo, then search for it</h2>
          <p className="mt-1 text-sm text-slate-600">
            Click a photo to load it. Generate the labeled mock description, apply the demo copy,
            publish, then search with the matching query.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {demoKit.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void chooseKit(item)}
              className={`overflow-hidden rounded-2xl border text-left ${
                kitItem?.id === item.id ? "border-ucla-gold ring-2 ring-ucla-gold" : "border-slate-200"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.photoUrl} alt={item.title} className="h-36 w-full object-cover" />
              <span className="block p-3 text-sm font-medium text-ucla-dark">{item.title}</span>
            </button>
          ))}
        </div>
      </section>
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
                setKitItem(null);
                setVision(null);
              }}
            />
          </label>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Upload preview" className="rounded-2xl max-h-72 w-full object-cover" />
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
          {kitItem && vision ? (
            <button
              type="button"
              className="rounded-full border border-ucla-blue px-4 py-2 text-sm font-semibold text-ucla-blue"
              onClick={() => applyKitCopy(kitItem)}
            >
              Replace mock text with demo listing copy
            </button>
          ) : null}
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
    </div>
  );
}
