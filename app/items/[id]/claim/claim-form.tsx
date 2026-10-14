"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClaimForm({ itemId, title }: { itemId: string; title: string }) {
  const router = useRouter();
  const [proof, setProof] = useState("");
  const [identifyingDetails, setIdentifyingDetails] = useState("");
  const [pickupPreference, setPickupPreference] = useState(
    "Ackerman Lost and Found desk",
  );
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    setError("");
    const response = await fetch("/api/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, proof, identifyingDetails, pickupPreference }),
    });
    const body = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(body.error || "Claim failed");
      return;
    }
    router.push("/alerts");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl card p-6 space-y-4">
      <h1 className="text-3xl font-semibold text-ucla-dark">Verify ownership</h1>
      <p className="text-slate-600">
        Claim “{title}” with details only the owner would know. Staff will arrange pickup
        after review.
      </p>
      <label className="block text-sm font-medium">
        Proof of ownership
        <textarea className="mt-1 w-full rounded-xl border px-3 py-2" rows={4} value={proof} onChange={(e) => setProof(e.target.value)} placeholder="Receipt, serial number, photos on the device, contents of the bag…" />
      </label>
      <label className="block text-sm font-medium">
        Identifying details not obvious from the listing
        <textarea className="mt-1 w-full rounded-xl border px-3 py-2" rows={4} value={identifyingDetails} onChange={(e) => setIdentifyingDetails(e.target.value)} />
      </label>
      <label className="block text-sm font-medium">
        Pickup preference
        <input className="mt-1 w-full rounded-xl border px-3 py-2" value={pickupPreference} onChange={(e) => setPickupPreference(e.target.value)} />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        className="rounded-full bg-ucla-blue px-5 py-2 font-semibold text-white disabled:opacity-60"
        onClick={() => void submit()}
        disabled={pending}
      >
        {pending ? "Submitting…" : "Submit claim"}
      </button>
    </div>
  );
}
