"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function UnlockPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/itinerary";

  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setError(false);
    setLoading(true);
    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) { setError(true); return; }
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="unlock-wrap">
      <div className="unlock-card">
        <div className="unlock-mark">ƒ</div>
        <h2>France + Spain &apos;26</h2>
        <p>Enter passphrase</p>
        <form onSubmit={submit}>
          <input
            type="password"
            autoFocus
            className="field-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ textAlign: "center", fontFamily: "var(--type-mono)", letterSpacing: ".4em", padding: 14, fontSize: 14 }}
          />
          {error && (
            <div style={{ color: "var(--danger)", fontSize: 11, fontFamily: "var(--type-mono)", marginTop: 10, letterSpacing: ".1em" }}>
              INCORRECT PASSPHRASE
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || !password}
            style={{ width: "100%", justifyContent: "center", marginTop: 20 }}
          >
            {loading ? "Checking…" : "Unlock"}
          </button>
        </form>
        <div style={{ marginTop: 24, fontFamily: "var(--type-mono)", fontSize: 9, color: "var(--muted-2)", letterSpacing: ".2em" }}>
          PRIVATE · BCRYPT · 30-DAY SESSION
        </div>
      </div>
    </div>
  );
}
