import { NextResponse } from "next/server";
import { errorStatus, requireUser } from "@/lib/session";
import { getStore } from "@/lib/store";
import { logError } from "@/lib/log";

export async function GET() {
  try {
    const user = await requireUser();
    const alerts = await getStore().listAlerts(user.id);
    return NextResponse.json({ alerts });
  } catch (error) {
    await logError("alerts", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load alerts" },
      { status: errorStatus(error) },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { id } = (await request.json()) as { id?: string };
    if (!id) return NextResponse.json({ error: "Alert id required" }, { status: 400 });
    await getStore().markAlertRead(id, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("alerts", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update alert" },
      { status: errorStatus(error) },
    );
  }
}
