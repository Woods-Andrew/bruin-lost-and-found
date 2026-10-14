import { NextResponse } from "next/server";
import { errorStatus, requireStaff } from "@/lib/session";
import { getStore } from "@/lib/store";
import { logError } from "@/lib/log";
import type { ClaimStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireStaff();
    const { id } = await context.params;
    const body = (await request.json()) as {
      status?: ClaimStatus;
      staffNote?: string;
    };
    const store = getStore();
    const claim = await store.updateClaim(id, body);
    const item = await store.getItem(claim.itemId);
    if (claim.status === "approved" && item) {
      await store.updateItem(item.id, { status: "claimed" });
      await store.createAlert({
        userId: claim.claimantId,
        itemId: item.id,
        title: "Pickup approved",
        body: `Bring campus ID to ${claim.pickupPreference || "the Ackerman Lost and Found desk"} for “${item.title}”. ${claim.staffNote}`.trim(),
      });
    }
    if (claim.status === "picked_up" && item) {
      await store.updateItem(item.id, { status: "resolved" });
    }
    if (claim.status === "rejected" && item) {
      await store.updateItem(item.id, { status: "published" });
      await store.createAlert({
        userId: claim.claimantId,
        itemId: item.id,
        title: "Claim not approved",
        body: claim.staffNote || `Staff could not verify ownership of “${item.title}”.`,
      });
    }
    return NextResponse.json({ claim });
  } catch (error) {
    await logError("claims", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: errorStatus(error) },
    );
  }
}
