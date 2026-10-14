"use client";

import { useRouter } from "next/navigation";

export function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      className="text-ucla-dark font-medium"
      onClick={async () => {
        await fetch("/api/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        router.refresh();
      }}
    >
      Mark read
    </button>
  );
}
