import { NextResponse } from "next/server";
import { errorStatus, requireStaff, requireUser } from "@/lib/session";
import { getStore } from "@/lib/store";
import { logError } from "@/lib/log";
import type { ItemStatus } from "@/lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const item = await getStore().getItem(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const item = await getStore().getItem(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = (await request.json()) as { status?: ItemStatus };
    if (user.role !== "staff") {
      if (item.reporterId !== user.id || body.status !== "removed") {
        await requireStaff();
      }
    }
    const updated = await getStore().updateItem(id, { status: body.status });
    return NextResponse.json({ item: updated });
  } catch (error) {
    await logError("items", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: errorStatus(error) },
    );
  }
}
