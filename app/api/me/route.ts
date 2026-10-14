import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { modeLabels } from "@/lib/config";

export async function GET() {
  const profile = await getSession();
  return NextResponse.json({ profile, mode: modeLabels() });
}
