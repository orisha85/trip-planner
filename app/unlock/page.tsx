"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function UnlockPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/itinerary";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Wrong password");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="mx-auto mt-24 max-w-sm px-6">
      <h1 className="mb-1 text-2xl font-semibold">
        {process.env.NEXT_PUBLIC_TRIP_TITLE ?? "Trip Organizer"}
      </h1>
      <p className="mb-6 text-sm text-[color:var(--color-muted)]">
        Enter the trip password to continue.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] px-3 py-2 outline-none focus:border-[color:var(--color-accent)]"
        />
        {error && (
          <div className="text-sm text-[color:var(--color-danger)]">{error}</div>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-md bg-[color:var(--color-accent)] px-3 py-2 font-medium text-[color:var(--color-accent-fg)] transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
