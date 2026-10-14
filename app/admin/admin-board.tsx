"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Claim, Item } from "@/lib/types";

export function AdminBoard({
  items,
  claims,
  emails,
}: {
  items: Item[];
  claims: Claim[];
  emails: Record<string, string>;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function updateClaim(id: string, status: Claim["status"]) {
    await fetch(`/api/claims/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, staffNote: notes[id] || "Bring campus ID." }),
    });
    router.refresh();
  }

  async function updateItem(id: string, status: Item["status"]) {
    await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-ucla-dark">Staff desk</h1>
        <p className="text-slate-600">Manage listings and approve pickup. Staff checks run on the server.</p>
      </div>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Claims</h2>
        {claims.map((claim) => {
          const item = items.find((row) => row.id === claim.itemId);
          return (
            <article key={claim.id} className="card p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-ucla-dark">
                  {item?.title || claim.itemId} · {claim.status}
                </p>
                <p className="text-sm text-slate-500">{emails[claim.claimantId] || claim.claimantId}</p>
              </div>
              <p className="text-sm"><strong>Proof:</strong> {claim.proof}</p>
              <p className="text-sm"><strong>Details:</strong> {claim.identifyingDetails}</p>
              <p className="text-sm"><strong>Pickup:</strong> {claim.pickupPreference}</p>
              <textarea
                className="w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="Staff note for the claimant"
                value={notes[claim.id] || claim.staffNote}
                onChange={(event) =>
                  setNotes((current) => ({ ...current, [claim.id]: event.target.value }))
                }
              />
              <div className="flex flex-wrap gap-2">
                <button className="rounded-full bg-ucla-blue px-4 py-1.5 text-sm text-white" onClick={() => void updateClaim(claim.id, "approved")}>
                  Approve pickup
                </button>
                <button className="rounded-full bg-emerald-700 px-4 py-1.5 text-sm text-white" onClick={() => void updateClaim(claim.id, "picked_up")}>
                  Mark picked up
                </button>
                <button className="rounded-full border px-4 py-1.5 text-sm" onClick={() => void updateClaim(claim.id, "rejected")}>
                  Reject
                </button>
              </div>
            </article>
          );
        })}
        {claims.length === 0 ? <p className="card p-5">No claims yet.</p> : null}
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Items</h2>
        {items.map((item) => (
          <article key={item.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-slate-500">
                {item.kind} · {item.status} · {item.location}
              </p>
            </div>
            <button
              className="rounded-full border px-3 py-1 text-sm"
              onClick={() => void updateItem(item.id, item.status === "removed" ? "published" : "removed")}
            >
              {item.status === "removed" ? "Restore" : "Remove"}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
