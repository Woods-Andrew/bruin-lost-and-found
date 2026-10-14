import type { ReactNode } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { modeLabels, supabaseConfigured } from "@/lib/config";
import { getStore } from "@/lib/store";
import { SignOutButton } from "@/components/sign-out";

export async function Shell({ children }: { children: ReactNode }) {
  const user = await getSession();
  const mode = modeLabels();
  const unread = user ? (await getStore().listAlerts(user.id)).filter((a) => !a.read).length : 0;

  return (
    <div className="min-h-full flex flex-col">
      <div className="gold-rule" />
      <header className="bg-ucla-dark text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ucla-gold font-black text-ucla-dark">
              B
            </span>
            <span>
              <span className="block text-sm uppercase tracking-[0.2em] text-ucla-gold">
                UCLA
              </span>
              <span className="block text-lg font-semibold">Bruin Lost and Found</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link className="hover:text-ucla-gold" href="/browse">
              Browse
            </Link>
            <Link className="hover:text-ucla-gold" href="/search">
              Search
            </Link>
            <Link className="hover:text-ucla-gold" href="/upload">
              Upload
            </Link>
            {user ? (
              <>
                <Link className="hover:text-ucla-gold" href="/alerts">
                  Alerts{unread ? ` (${unread})` : ""}
                </Link>
                {user.role === "staff" ? (
                  <Link className="hover:text-ucla-gold" href="/admin">
                    Admin
                  </Link>
                ) : null}
                <span className="rounded-full bg-white/10 px-3 py-1">{user.email}</span>
                <SignOutButton />
              </>
            ) : (
              <Link
                className="rounded-full bg-ucla-gold px-4 py-2 font-semibold text-ucla-dark"
                href="/login"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>
      {!supabaseConfigured() || mode.vision === "mock" || mode.matching === "mock" ? (
        <div className="bg-ucla-gold/90 text-ucla-dark">
          <p className="mx-auto max-w-6xl px-4 py-2 text-sm">
            <strong>Demo mode labels:</strong> database is {mode.database}. Vision is{" "}
            {mode.vision === "mock" ? "mock — not real Qwen inference" : "live Qwen"}. Matching is{" "}
            {mode.matching === "mock" ? "mock embeddings — not Qwen3-VL-Embedding" : "live Qwen3-VL-Embedding"}.
            Rerank is {mode.rerank}.
          </p>
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-ucla-dark/10 py-6 text-center text-sm text-ucla-dark/70">
        Matching approach: Qwen3-VL-Embedding + optional Qwen3-VL-Reranker. Pickup at campus Lost and Found.
      </footer>
    </div>
  );
}
