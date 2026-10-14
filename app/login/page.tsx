"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("bruin@ucla.edu");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function signIn(nextEmail: string) {
    setPending(true);
    setError("");
    const response = await fetch("/api/auth/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: nextEmail }),
    });
    const body = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(body.error || "Could not sign in");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg card p-8">
      <h1 className="text-3xl font-semibold text-ucla-dark">University sign-in</h1>
      <p className="mt-2 text-slate-600">
        Email verification is required. Demo mode accepts a university address immediately
        and marks it verified. Configure Supabase Auth in production for magic-link verification.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void signIn(email);
        }}
      >
        <label className="block text-sm font-medium">
          University email
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          className="w-full rounded-full bg-ucla-blue py-3 font-semibold text-white disabled:opacity-60"
          disabled={pending}
        >
          {pending ? "Signing in…" : "Continue"}
        </button>
      </form>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          className="rounded-full border border-ucla-blue px-4 py-2 text-ucla-blue"
          onClick={() => void signIn("bruin@ucla.edu")}
        >
          Demo student
        </button>
        <button
          className="rounded-full border border-ucla-dark px-4 py-2 text-ucla-dark"
          onClick={() => void signIn("staff@ucla.edu")}
        >
          Demo staff
        </button>
      </div>
    </div>
  );
}
