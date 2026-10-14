import { NextResponse } from "next/server";
import { searchItems } from "@/lib/ai/search";
import { embedText } from "@/lib/ai/embed";
import { errorStatus, requireUser } from "@/lib/session";
import { getStore } from "@/lib/store";
import { logError } from "@/lib/log";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { query, watch } = (await request.json()) as {
      query?: string;
      watch?: boolean;
    };
    if (!query?.trim()) {
      return NextResponse.json({ error: "Describe the item" }, { status: 400 });
    }
    const result = await searchItems(query.trim());
    if (watch) {
      const embedding = await embedText(query.trim());
      await getStore().saveQuery({
        userId: user.id,
        query: query.trim(),
        embedding: embedding.vector,
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    await logError("search", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: errorStatus(error) },
    );
  }
}
