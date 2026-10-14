import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { errorStatus, requireUser } from "@/lib/session";
import { getStore } from "@/lib/store";
import { logError } from "@/lib/log";

export async function GET() {
  try {
    const user = await requireUser();
    const store = getStore();
    const claims = await store.listClaims();
    if (user.role === "staff") return NextResponse.json({ claims });
    return NextResponse.json({
      claims: claims.filter((claim) => claim.claimantId === user.id),
    });
  } catch (error) {
    await logError("claims", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load claims" },
      { status: errorStatus(error) },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as {
      itemId?: string;
      proof?: string;
      identifyingDetails?: string;
      pickupPreference?: string;
    };
    if (!body.itemId || !body.proof?.trim() || !body.identifyingDetails?.trim()) {
      return NextResponse.json(
        { error: "Item, proof of ownership, and identifying details are required" },
        { status: 400 },
      );
    }
    const store = getStore();
    const item = await store.getItem(body.itemId);
    if (!item || item.status !== "published") {
      return NextResponse.json({ error: "Item is not available to claim" }, { status: 400 });
    }
    const claim = await store.createClaim({
      itemId: item.id,
      claimantId: user.id,
      proof: body.proof.trim(),
      identifyingDetails: body.identifyingDetails.trim(),
      pickupPreference: body.pickupPreference?.trim() || "Ackerman Lost and Found desk",
    });
    for (const email of config.staffEmails) {
      const staff = await store.getProfileByEmail(email);
      if (!staff) continue;
      await store.createAlert({
        userId: staff.id,
        itemId: item.id,
        title: "New claim submitted",
        body: `${user.email} claimed “${item.title}”. Review it in Admin.`,
      });
    }
    await store.createAlert({
      userId: user.id,
      itemId: item.id,
      title: "Claim submitted",
      body: `Your claim for “${item.title}” is pending staff review.`,
    });
    return NextResponse.json({ claim });
  } catch (error) {
    await logError("claims", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Claim failed" },
      { status: errorStatus(error) },
    );
  }
}
