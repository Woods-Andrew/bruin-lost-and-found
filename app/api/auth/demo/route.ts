import { NextResponse } from "next/server";
import { createDemoSession, errorStatus } from "@/lib/session";
import { logError } from "@/lib/log";

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    const profile = await createDemoSession(email);
    return NextResponse.json({ profile });
  } catch (error) {
    await logError("auth", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sign-in failed" },
      { status: errorStatus(error) },
    );
  }
}
